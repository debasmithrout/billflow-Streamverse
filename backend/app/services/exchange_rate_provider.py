import abc
import json
import urllib.request
import logging
from typing import Dict

logger = logging.getLogger("billflow.exchange_rate_provider")

class ExchangeRateProvider(abc.ABC):
    """
    Abstract base class for exchange rate providers.
    """
    @abc.abstractmethod
    def fetch_rates(self) -> Dict[str, float]:
        """
        Fetch exchange rates relative to a common base (e.g. EUR).
        Returns a dictionary mapping currency code to its rate relative to the base.
        The base currency itself should be included in the dictionary with value 1.0.
        """
        pass

    @abc.abstractmethod
    def get_name(self) -> str:
        """
        Returns the provider name.
        """
        pass


class FrankfurterProvider(ExchangeRateProvider):
    """
    Frankfurter API Exchange Rate Provider.
    """
    def fetch_rates(self) -> Dict[str, float]:
        url = "https://api.frankfurter.app/latest"
        logger.info(f"Fetching exchange rates from Frankfurter API: {url}")
        try:
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'Mozilla/5.0 (StreamVerse ExchangeRate Service)'}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
                
            rates = data.get("rates", {})
            base = data.get("base", "EUR")
            
            # Map all rates relative to the base (usually EUR)
            result = {base: 1.0}
            for cur, val in rates.items():
                result[cur] = float(val)
                
            logger.info(f"Successfully fetched {len(result)} rates from Frankfurter API")
            return result
        except Exception as e:
            logger.error(f"Failed to fetch rates from Frankfurter API: {e}", exc_info=True)
            raise e

    def get_name(self) -> str:
        return "Frankfurter"
