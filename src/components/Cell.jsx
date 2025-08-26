/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Modal from "./Modal";

export default function Cell({ label, index, photo, thumbUrl, onClick, onRemove }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isCenter = index === 4;
  const src = photo || thumbUrl;
  const hasPhoto = Boolean(src);

  const handleCellPress = () => { if (!isCenter) onClick?.(index); };
  const handleRemovePress = (e) => { e.stopPropagation(); if (!isCenter && hasPhoto) setConfirmOpen(true); };
  const handleConfirmRemove = () => { onRemove?.(index); setConfirmOpen(false); };

  return (
    <div className="relative aspect-square rounded-none overflow-hidden">
      <button
        type="button"
        disabled={isCenter}
        aria-disabled={isCenter}
        onClick={handleCellPress}
        aria-label={`${isCenter ? "Logo" : label}${hasPhoto ? " – completed" : ""}`}
        className={[
          "relative w-full h-full overflow-hidden border transition",
          "active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#53C1ED]",
          hasPhoto ? "border-transparent shadow-sm"
                   : "border-2 border-dashed border-[#289B9C] bg-[#E1F1EC] text-[#289B9C]"
        ].join(" ")}
      >
        {!isCenter && (
          hasPhoto ? (
            <>
              <img
                src={src}
                alt={label}
                className="w-full h-full object-cover select-none"
                decoding="async"
                loading="lazy"
                draggable={false}
              />
              {/* Check badge (≈24px) */}
              <span
                className="pointer-events-none absolute top-1.5 left-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5CBB64] shadow"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center px-2 text-center text-[11px] leading-tight">
              {label}
            </div>
          )
        )}
      </button>

      {/* Remove control — big tap area, small visible icon (≈24px) */}
      {hasPhoto && !isCenter && (
        <button
          type="button"
          onClick={handleRemovePress}
          title="Remove photo"
          aria-label="Remove photo"
          className={[
            "absolute top-0 right-0",
            // large tap target for mobile
            "h-10 w-10 grid place-items-center rounded-full focus:outline-none focus:ring-2 focus:ring-white/60 active:scale-95 transition-transform",
          ].join(" ")}
        >
          {/* the visible part, sized like the check badge */}
          <span className="pointer-events-none inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/45 backdrop-blur-[2px] text-white shadow">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
            </svg>
          </span>
        </button>
      )}

      {/* Confirm remove modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-brand-ink">Remove photo?</h3>
          <p className="text-sm text-brand-ink/70">
            This will clear the photo for the task: <br/><span className="font-medium">{label}</span>.<br/> You can add a new one after.
          </p>
        </div>
        <div className="modal-actions">
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmRemove}
            className="btn bg-[#E24A4A] text-white enabled:hover:bg-[#d74646]"
          >
            Remove
          </button>
        </div>
      </Modal>
    </div>
  );
}
