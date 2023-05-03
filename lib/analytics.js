// lib/analytics.js

export const handleButtonLabelClickGTagEvent = (eventName, eventCategory, eventLabel) => {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventName, {
            event_category: eventCategory,
            event_label: eventLabel,
        });
    }
};
  