/* eslint-disable react/prop-types */

import React, { useEffect } from "react";

export default function Modal({ open, children, onClose }) {
  // Prevent body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="modal-overlay"
        role="presentation"
        onClick={(e) => {
          // click-outside to close
          if (e.target === e.currentTarget) onClose?.();
        }}
      />
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
      >
        {children}
        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-ghost">
            Close
          </button>
        </div>
      </div>
    </>
  );
}
