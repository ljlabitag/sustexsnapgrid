import React from "react";
import smLogo from "../assets/sm-logo.png";
import ariseLogo from "../assets/arise-logo.png";
import dostLogo from "../assets/dost-logo.png";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 inset-x-0 bg-brand-surface/90 border-t border-brand-ink/10 backdrop-blur z-40">
      <div className="mx-auto max-w-xl px-4 py-2 flex items-center justify-center gap-8 sm:gap-12">
        <img
          src={smLogo}
          alt="SM Prime"
          className="h-7 sm:h-8 object-contain"
        />
        <img
          src={dostLogo}
          alt="DOST"
          className="h-7 sm:h-8"
        />
        <img
          src={ariseLogo}
          alt="Arise Philippines"
          className="h-7 sm:h-8 object-contain"
        />
      </div>
    </footer>
  );
}
