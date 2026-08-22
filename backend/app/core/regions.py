from typing import TypedDict, Dict

class RegionInfo(TypedDict):
    """
    Typed dictionary schema defining configuration details for a region.
    """
    country_name: str
    currency_code: str
    locale: str
    timezone: str
    tax_region: str

# Centralized single source of truth for all regional metadata (ISO-3166-1 alpha-2 based)
REGIONS: Dict[str, RegionInfo] = {
    "IN": {
        "country_name": "India",
        "currency_code": "INR",
        "locale": "en-IN",
        "timezone": "Asia/Kolkata",
        "tax_region": "GST"
    },
    "US": {
        "country_name": "United States",
        "currency_code": "USD",
        "locale": "en-US",
        "timezone": "America/New_York",
        "tax_region": "US_SALES_TAX"
    },
    "GB": {
        "country_name": "United Kingdom",
        "currency_code": "GBP",
        "locale": "en-GB",
        "timezone": "Europe/London",
        "tax_region": "VAT"
    },
    "CA": {
        "country_name": "Canada",
        "currency_code": "CAD",
        "locale": "en-CA",
        "timezone": "America/Toronto",
        "tax_region": "HST"
    },
    "AU": {
        "country_name": "Australia",
        "currency_code": "AUD",
        "locale": "en-AU",
        "timezone": "Australia/Sydney",
        "tax_region": "GST"
    },
    "DE": {
        "country_name": "Germany",
        "currency_code": "EUR",
        "locale": "de-DE",
        "timezone": "Europe/Berlin",
        "tax_region": "VAT"
    },
    "FR": {
        "country_name": "France",
        "currency_code": "EUR",
        "locale": "fr-FR",
        "timezone": "Europe/Paris",
        "tax_region": "VAT"
    },
    "JP": {
        "country_name": "Japan",
        "currency_code": "JPY",
        "locale": "ja-JP",
        "timezone": "Asia/Tokyo",
        "tax_region": "CONSUMPTION_TAX"
    },
    "SG": {
        "country_name": "Singapore",
        "currency_code": "SGD",
        "locale": "en-SG",
        "timezone": "Asia/Singapore",
        "tax_region": "GST"
    },
    "AE": {
        "country_name": "United Arab Emirates",
        "currency_code": "AED",
        "locale": "ar-AE",
        "timezone": "Asia/Dubai",
        "tax_region": "VAT"
    }
}

# Centralized constants derived from the single source of truth
SUPPORTED_COUNTRY_CODES = tuple(REGIONS.keys())
SUPPORTED_CURRENCIES = tuple(sorted(list(set(metadata["currency_code"] for metadata in REGIONS.values()))))
SUPPORTED_TAX_REGIONS = tuple(sorted(list(set(metadata["tax_region"] for metadata in REGIONS.values()))))

# Mapping of country names to ISO-3166 alpha-2 country codes
COUNTRY_NAME_TO_CODE: Dict[str, str] = {
    metadata["country_name"].lower(): code 
    for code, metadata in REGIONS.items()
}

DEFAULT_REGION_CODE = "IN"
