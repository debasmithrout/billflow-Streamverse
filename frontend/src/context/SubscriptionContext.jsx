// src/context/SubscriptionContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubscription as fetchSubFromApi } from '../services/customerService';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    try {
      const sub = await fetchSubFromApi();
      setSubscription(sub);
    } catch (err) {
      console.error("Failed to refresh subscription context state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscription, setSubscription, loading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
