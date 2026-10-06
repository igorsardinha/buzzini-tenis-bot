"use client";

// Helper tipado para disparar eventos customizados para o dataLayer do GTM
export const sendGTMEvent = (eventData: Record<string, any>) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);
  }
};
