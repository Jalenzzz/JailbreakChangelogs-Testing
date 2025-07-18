"use client";
import React, { useEffect, useRef } from "react";

interface DisplayAdProps {
  adSlot: string;
  style?: React.CSSProperties;
  className?: string;
  adFormat?: string; // e.g., "auto" or "fluid"
  layoutKey?: string; // for in-feed ads
}

const DisplayAd: React.FC<DisplayAdProps> = ({
  adSlot,
  style = { display: "block" },
  className = "",
  adFormat = "auto",
  layoutKey,
}) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Ensure the container has proper dimensions for responsive ads
    if (adRef.current && adFormat === "auto") {
      const container = adRef.current.parentElement;
      if (container) {
        // Set minimum dimensions for responsive ads
        container.style.minHeight = "250px";
        container.style.minWidth = "300px";
      }
    }

    // Initialize the ad
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore if AdSense is blocked
    }
  }, [adFormat]);

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        minHeight: adFormat === "auto" ? "250px" : undefined,
        ...style
      }}
      data-ad-client="ca-pub-8152532464536367"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      data-full-width-responsive={adFormat === "auto" ? "true" : undefined}
    />
  );
};

export default DisplayAd; 