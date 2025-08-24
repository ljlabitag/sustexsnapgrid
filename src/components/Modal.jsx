/* eslint-disable react/prop-types */
import React, { useEffect } from "react";

export default function Modal({ open, children, onClose }) {
  // prevent body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <button
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close modal"
      />
      {/* dialog */}
      <div className="relative w-11/12 max-w-sm bg-white rounded-xl shadow-lg p-5">
        {children}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
