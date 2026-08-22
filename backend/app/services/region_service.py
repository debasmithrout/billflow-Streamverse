from typing import Dict, Any
from app.core.regions import REGIONS, COUNTRY_NAME_TO_CODE, DEFAULT_REGION_CODE, RegionInfo

class RegionService:
    """
    Centralized service managing all country, currency, locale, timezone, and tax region lookups.
    Encapsulates all ISO-3166-1 alpha-2 validation and fallback defaults.
    """

    @classmethod
    def get_code_by_name(cls, country_name: str) -> str:
        """
        Converts a readable country name to its ISO-3166-1 alpha-2 country code.
        Defaults to DEFAULT_REGION_CODE (IN) if the country name is invalid or unrecognized.
        """
        if not country_name:
            return DEFAULT_REGION_CODE
        return COUNTRY_NAME_TO_CODE.get(country_name.strip().lower(), DEFAULT_REGION_CODE)

    @classmethod
    def get_region(cls, country_code: str) -> RegionInfo:
        """
        Returns the typed RegionInfo configuration for a given ISO country code.
        Safely falls back to the default region configuration (IN) if the country code is invalid.
        """
        if not country_code:
            country_code = DEFAULT_REGION_CODE
        code_upper = country_code.strip().upper()
        return REGIONS.get(code_upper, REGIONS[DEFAULT_REGION_CODE])

    @classmethod
    def get_currency(cls, country_code: str) -> str:
        """
        Returns the ISO-4217 currency code associated with the given country code.
        """
        return cls.get_region(country_code)["currency_code"]

    @classmethod
    def get_locale(cls, country_code: str) -> str:
        """
        Returns the standard locale string associated with the given country code.
        """
        return cls.get_region(country_code)["locale"]

    @classmethod
    def get_timezone(cls, country_code: str) -> str:
        """
        Returns the IANA timezone string associated with the given country code.
        """
        return cls.get_region(country_code)["timezone"]

    @classmethod
    def get_tax_region(cls, country_code: str) -> str:
        """
        Returns the tax classification key (e.g. GST, VAT) for the given country code.
        """
        return cls.get_region(country_code)["tax_region"]

    @classmethod
    def get_defaults(cls, country_name: str) -> Dict[str, Any]:
        """
        Backward compatibility helper that returns defaults dictionary based on readable country name.
        Integrates with user registration schemes.
        """
        code = cls.get_code_by_name(country_name)
        defaults = dict(cls.get_region(code))
        # Add country_code key to populate database inserts
        defaults["country_code"] = code
        return defaults
