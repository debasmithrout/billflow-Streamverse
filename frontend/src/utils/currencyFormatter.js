// src/utils/currencyFormatter.js

export const formatCurrency = (amount, currencyCode) => {
  const currency = currencyCode || "INR";
  let locale = "en-IN";
  
  if (currency === "USD") locale = "en-US";
  else if (currency === "GBP") locale = "en-GB";
  else if (currency === "EUR") locale = "de-DE";
  else if (currency === "CAD") locale = "en-CA";
  else if (currency === "AUD") locale = "en-AU";
  else if (currency === "JPY") locale = "ja-JP";
  else if (currency === "SGD") locale = "en-SG";
  else if (currency === "AED") locale = "ar-AE";

  if (amount === undefined || amount === null || isNaN(amount)) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency
    }).format(0);
  }
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const getCurrencySymbol = (currencyCode) => {
  const mapping = {
    INR: "₹",
    USD: "$",
    GBP: "£",
    EUR: "€",
    JPY: "¥",
    CAD: "$",
    AUD: "$",
    SGD: "$",
    AED: "د.إ"
  };
  return mapping[currencyCode] || "₹";
};
