// src/utils/planMapper.js

export const getBadgeForPlan = (name) => {
  if (name.includes("Trial") || name.toLowerCase().includes("free")) return "START HERE";
  if (name.toLowerCase() === "premium") return "MOST POPULAR";
  if (name.toLowerCase() === "family") return "BEST VALUE";
  return null;
};

export const getDescriptionForPlan = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("trial") || normalized.includes("free")) {
    return "Experience our premium tier features free for 7 days. Start streaming in 4K HDR today.";
  }
  if (normalized === "basic") {
    return "Enjoy HD streaming on a single screen. Perfect for individual streaming accounts.";
  }
  if (normalized === "standard") {
    return "Watch in Full HD quality on 2 screens simultaneously. Ideal for couples.";
  }
  if (normalized === "premium") {
    return "Unlock full 4K Ultra HD quality on 4 screens. The most popular choice for family streaming.";
  }
  if (normalized === "family") {
    return "Our ultimate tier. Stream in 4K Ultra HD on up to 6 screens with Dolby Atmos.";
  }
  return "Stream unlimited movies and TV shows in high quality.";
};

const planFeaturesMap = {
  "free premium trial": [
    "4K Ultra HD + HDR Streaming",
    "6 Screens",
    "Unlimited Movies & TV Shows",
    "Downloads",
    "Ad-Free Experience",
    "7-Day Free Trial"
  ],
  "basic": [
    "HD Streaming",
    "1 Screen",
    "Access to All Movies & TV Shows",
    "Mobile & Web Access",
    "Ad-Supported Viewing"
  ],
  "standard": [
    "Full HD Streaming",
    "2 Screens",
    "Ad-Free Viewing",
    "Download on 2 Devices",
    "HD Audio"
  ],
  "premium": [
    "4K Ultra HD + HDR Streaming",
    "4 Screens",
    "Ad-Free Viewing",
    "Download on 4 Devices",
    "Dolby Atmos Audio",
    "Early Access to New Releases"
  ],
  "family": [
    "4K Ultra HD + HDR Streaming",
    "6 Screens",
    "Ad-Free Viewing",
    "Download on 6 Devices",
    "Kids Profile Controls",
    "Family Watchlist",
    "Priority Support"
  ]
};

export const getFeaturesForPlan = (name, fallbackFeatures = []) => {
  const normalized = name.toLowerCase().trim();
  if (normalized.includes("free premium trial") || normalized.includes("free trial") || normalized.includes("trial")) {
    return planFeaturesMap["free premium trial"];
  }
  if (normalized.includes("family")) {
    return planFeaturesMap["family"];
  }
  if (normalized.includes("premium")) {
    return planFeaturesMap["premium"];
  }
  if (normalized.includes("standard")) {
    return planFeaturesMap["standard"];
  }
  if (normalized.includes("basic")) {
    return planFeaturesMap["basic"];
  }
  return fallbackFeatures;
};

export const mapDbPlanToCustomerPlan = (p) => {
  if (!p) return null;
  
  const fallback = p.features 
    ? p.features.split(',').map(f => f.trim()).filter(Boolean) 
    : [];
  const featuresList = getFeaturesForPlan(p.name, fallback);
  
  // Parse screens dynamically from features (e.g., "4 Screens", "1 Screen")
  let screens = 1;
  const screensFeature = featuresList.find(f => f.toLowerCase().includes('screen'));
  if (screensFeature) {
    const matched = screensFeature.match(/\d+/);
    if (matched) {
      screens = parseInt(matched[0], 10);
    }
  } else {
    // Mapped fallback based on name
    if (p.name.includes("Family")) screens = 6;
    else if (p.name.includes("Premium") || p.name.includes("Trial") || p.name.toLowerCase().includes("free")) screens = 4;
    else if (p.name.includes("Standard")) screens = 2;
  }

  // Parse resolution dynamically
  let resolution = "720p (HD)";
  if (p.features) {
    const lowerFeats = p.features.toLowerCase();
    if (lowerFeats.includes('4k')) {
      resolution = "4K (Ultra HD) + HDR";
    } else if (lowerFeats.includes('full hd') || lowerFeats.includes('1080p')) {
      resolution = "1080p (Full HD)";
    } else if (lowerFeats.includes('hd')) {
      resolution = "720p (HD)";
    }
  } else {
    // Mapped fallback based on name
    if (p.name.includes("Premium") || p.name.includes("Family") || p.name.includes("Trial") || p.name.toLowerCase().includes("free")) {
      resolution = "4K (Ultra HD) + HDR";
    } else if (p.name.includes("Standard")) {
      resolution = "1080p (Full HD)";
    }
  }

  return {
    id: p.id,
    name: p.name,
    price: p.price,
    billingCycle: p.billing_interval || "Monthly",
    resolution: resolution,
    screens: screens,
    features: featuresList,
    description: getDescriptionForPlan(p.name),
    badge: getBadgeForPlan(p.name),
    show_trial: p.show_trial
  };
};
