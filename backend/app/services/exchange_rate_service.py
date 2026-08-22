import logging
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.exchange_rate import ExchangeRate
from app.models.system_setting import SystemSetting
from app.services.exchange_rate_provider import FrankfurterProvider, ExchangeRateProvider
from app.core import exceptions

logger = logging.getLogger("billflow.exchange_rate_service")

# Supported currencies for StreamVerse Billing Core
SUPPORTED_CURRENCIES = ["INR", "USD", "GBP", "EUR", "JPY", "CAD", "AUD", "SGD"]

# Fallback matrix bridging through INR if provider/database is unavailable
DEFAULT_RATES_TO_INR = {
    "INR": 1.0,
    "USD": 83.50,
    "GBP": 106.00,
    "EUR": 90.00,
    "JPY": 0.55,
    "CAD": 61.00,
    "AUD": 55.00,
    "SGD": 62.00,
}

class ExchangeRateService:
    # In-memory cache for today's exchange rates
    _rates_cache: Dict[str, Dict[str, float]] = {}
    _reporting_currency_cache: Optional[str] = None
    _provider: ExchangeRateProvider = FrankfurterProvider()

    @classmethod
    def set_provider(cls, provider: ExchangeRateProvider):
        """
        Sets a custom provider for the exchange rates.
        """
        cls._provider = provider
        cls.clear_cache()

    @classmethod
    def clear_cache(cls):
        """
        Clears the in-memory cache.
        """
        cls._rates_cache.clear()
        cls._reporting_currency_cache = None

    @classmethod
    def get_reporting_currency(cls, db: Session) -> str:
        """
        Retrieves the system reporting base currency setting (default: INR).
        """
        if cls._reporting_currency_cache:
            return cls._reporting_currency_cache

        setting = db.query(SystemSetting).filter(SystemSetting.key == "reporting_base_currency").first()
        if setting:
            cls._reporting_currency_cache = setting.value.upper()
        else:
            cls._reporting_currency_cache = "INR"
        return cls._reporting_currency_cache

    @classmethod
    def update_reporting_currency(cls, db: Session, currency_code: str) -> str:
        """
        Updates the system reporting base currency setting.
        """
        code_upper = currency_code.strip().upper()
        if code_upper not in SUPPORTED_CURRENCIES:
            raise exceptions.ValidationFailed(f"Currency code {currency_code} is not supported.")

        setting = db.query(SystemSetting).filter(SystemSetting.key == "reporting_base_currency").first()
        if not setting:
            setting = SystemSetting(key="reporting_base_currency", value=code_upper)
            db.add(setting)
        else:
            setting.value = code_upper
            setting.updated_at = datetime.utcnow()
            
        db.commit()
        cls._reporting_currency_cache = code_upper
        cls.clear_cache()
        logger.info(f"System reporting base currency updated to: {code_upper}")
        return code_upper

    @classmethod
    def get_rate(cls, db: Session, from_currency: str, to_currency: str) -> float:
        """
        Resolves the exchange rate from one currency to another.
        Returns 1.0 if currencies are identical.
        Uses in-memory cache, database records, and safe fallback values.
        """
        from_cur = from_currency.strip().upper()
        to_cur = to_currency.strip().upper()

        if from_cur == to_cur:
            return 1.0

        # Check Cache
        if from_cur in cls._rates_cache and to_cur in cls._rates_cache[from_cur]:
            return cls._rates_cache[from_cur][to_cur]

        # Check Database
        rate_record = (
            db.query(ExchangeRate)
            .filter(ExchangeRate.from_currency == from_cur, ExchangeRate.to_currency == to_cur)
            .first()
        )
        if rate_record:
            # Cache it
            if from_cur not in cls._rates_cache:
                cls._rates_cache[from_cur] = {}
            cls._rates_cache[from_cur][to_cur] = rate_record.rate
            return rate_record.rate

        # Fallback to defaults
        rate = cls._get_default_rate(from_cur, to_cur)
        logger.warning(f"No database rate found for {from_cur} -> {to_cur}. Fallback rate used: {rate}")
        return rate

    @classmethod
    def _get_default_rate(cls, from_cur: str, to_cur: str) -> float:
        """
        Resolves a default exchange rate from the default INR matrix.
        """
        # Convert through INR bridge if currencies are not INR
        rate_to_inr_from = DEFAULT_RATES_TO_INR.get(from_cur, 83.50 if from_cur != "INR" else 1.0)
        rate_to_inr_to = DEFAULT_RATES_TO_INR.get(to_cur, 83.50 if to_cur != "INR" else 1.0)

        # rate(from_cur -> to_cur) = rate(from_cur -> INR) * rate(INR -> to_cur)
        # rate(from_cur -> INR) = rate_to_inr_from
        # rate(INR -> to_cur) = 1.0 / rate_to_inr_to
        rate = rate_to_inr_from / rate_to_inr_to
        return round(rate, 6)

    @classmethod
    def convert(cls, db: Session, amount: float, from_currency: str, to_currency: str) -> float:
        """
        Converts an amount from one currency to another using the resolved rate.
        """
        rate = cls.get_rate(db, from_currency, to_currency)
        return round(amount * rate, 2)

    @classmethod
    def sync_latest_rates(cls, db: Session) -> Dict[str, float]:
        """
        Fetches the latest rates from the provider and updates the exchange_rates database.
        Calculates cross rates across all supported currencies and caches the output.
        """
        provider_name = cls._provider.get_name()
        logger.info(f"Starting exchange rate sync using provider: {provider_name}")
        
        try:
            # Fetch base rates relative to EUR (usually)
            base_rates = cls._provider.fetch_rates()
        except Exception as e:
            logger.error(f"Provider sync failed. Relying on existing database rates. Error: {e}")
            return {}

        # Update cache and database with cross-currency pairs
        updated_count = 0
        sync_time = datetime.utcnow()

        for from_cur in SUPPORTED_CURRENCIES:
            if from_cur not in cls._rates_cache:
                cls._rates_cache[from_cur] = {}

            for to_cur in SUPPORTED_CURRENCIES:
                if from_cur == to_cur:
                    cls._rates_cache[from_cur][to_cur] = 1.0
                    continue

                # Calculate cross rate from EUR values:
                # rate(from -> to) = EUR_to_to / EUR_to_from
                eur_to_from = base_rates.get(from_cur)
                eur_to_to = base_rates.get(to_cur)

                # Fallback to default ratios if provider was missing a specific currency code
                if not eur_to_from or not eur_to_to:
                    rate = cls._get_default_rate(from_cur, to_cur)
                else:
                    rate = round(eur_to_to / eur_to_from, 6)

                # Update database
                rate_record = (
                    db.query(ExchangeRate)
                    .filter(ExchangeRate.from_currency == from_cur, ExchangeRate.to_currency == to_cur)
                    .first()
                )
                if rate_record:
                    rate_record.rate = rate
                    rate_record.provider = provider_name
                    rate_record.fetched_at = sync_time
                else:
                    rate_record = ExchangeRate(
                        from_currency=from_cur,
                        to_currency=to_cur,
                        rate=rate,
                        provider=provider_name,
                        fetched_at=sync_time
                    )
                    db.add(rate_record)

                cls._rates_cache[from_cur][to_cur] = rate

            db.commit()
            updated_count += len(SUPPORTED_CURRENCIES)

        logger.info(f"Successfully synchronized {updated_count} exchange rate mappings.")
        return base_rates
