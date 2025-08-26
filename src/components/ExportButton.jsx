/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Modal from "./Modal";
import { renderBingoCollage, downloadBlob } from "../lib/collage";

/* --- small inline icons (inherit currentColor) --- */
const IconDownload = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

const IconShare = ({ className = "w-4 h-4 shrink-0" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* tray */}
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    {/* arrow head */}
    <path d="M16 6l-4-4-4 4" />
    {/* arrow stem */}
    <path d="M12 2v14" />
  </svg>
);

const IconCopy = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconSpinner = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" />
  </svg>
);

export default function ExportButton({
  variant = "download",
  photos = {},
  logoSrc,
  prompts = [],
  options = {},
  disabled = false,
  remaining = 0,
  captionText = "Captured sustainability in action! Completed the SnapGrid challenge at #SUSTEX2025 🌍 Big thanks to @DOST and @TheSMStore 🙌",
  className = "",
}) {
  const [busy, setBusy] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function renderCollage() {
    const { blob } = await renderBingoCollage({
      photosByIndex: photos,
      logoSrc,
      prompts,
      options: {
        size: 1080,
        gap: 12,
        background: "#ffffff",
        drawLabels: options.drawLabels ?? false,
        labelColor: "#ffffff",
        labelBg: "rgba(0,0,0,0.45)",
        font: "600 20px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      },
    });
    return blob;
  }

  async function onDownload() {
    if (busy || disabled) return;
    setBusy(true);
    try {
      const blob = await renderCollage();
      downloadBlob(blob, "bingo-collage.png");
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setBusy(false);
    }
  }

  function onOpenShare() {
    if (busy || disabled) return;
    setCopied(false);
    setShareOpen(true);
  }

  async function onCopyCaption() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(captionText);
      } else {
        const ta = document.createElement("textarea");
        ta.value = captionText;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
    } catch (e) {
      console.error("Copy failed", e);
      alert("Copy failed. Please select the text and copy manually.");
    }
  }

  async function onShareNow() {
    if (!copied || busy) return;
    setBusy(true);
    try {
      const blob = await renderCollage();
      const file = new File([blob], "bingo-collage.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Photo Challenge Bingo",
          text: captionText,
        });
        setShareOpen(false);
      } else {
        alert("Sharing is not supported on this device/browser. You can download and post manually.");
      }
    } catch (e) {
      console.error("Share failed", e);
    } finally {
      setBusy(false);
    }
  }

  const isDisabled = busy || disabled;
  const hint = disabled ? `Complete ${remaining} more to export` : undefined;

  if (variant === "download") {
    return (
      <button
        type="button"
        onClick={onDownload}
        disabled={isDisabled}
        title={hint || "Download collage"}
        className={`btn-outline ${className}`}
        aria-label="Download collage"
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <IconSpinner />
            Working…
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <IconDownload />
            Download
          </span>
        )}
      </button>
    );
  }

  // variant === 'share'
  return (
    <>
      <button
        type="button"
        onClick={onOpenShare}
        disabled={isDisabled}
        title={hint || "Share collage"}
        className={`btn-primary ${className}`}
        aria-label="Share collage"
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <IconSpinner />
            Working…
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <IconShare />
            Share
          </span>
        )}
      </button>

      <Modal open={shareOpen} onClose={() => (!busy && setShareOpen(false))}>
        <div className="space-y-3">
          <h2 className="modal-header">Recommended caption</h2>
          <p className="muted text-xs text-center">Copy the caption, then tap Share.</p>

          <textarea
            readOnly
            value={captionText}
            className="caption-box h-28 resize-none"
            aria-label="Share caption"
          />

          <div className="space-y-2">
            <button
              type="button"
              onClick={onCopyCaption}
              disabled={busy}
              className="btn-outline w-full"
              aria-label="Copy caption to clipboard"
            >
              <span className="inline-flex items-center gap-2">
                <IconCopy />
                {copied ? "Copied ✓" : "Copy caption"}
              </span>
            </button>

            <button
              type="button"
              onClick={onShareNow}
              disabled={!copied || busy}
              className="btn-primary w-full"
              aria-label={copied ? "Share now" : "Share now (disabled until you copy the caption)"}
              title={!copied ? "Copy the caption first" : undefined}
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <IconSpinner />
                  Working…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <IconShare />
                  Share now
                </span>
              )}
            </button>

            <p className="text-[11px] text-center text-brand-ink/65" aria-live="polite">
              {copied ? "Caption copied. You can share now." : "Share button enables after you copy the caption."}
            </p>

            <button
              type="button"
              onClick={() => setShareOpen(false)}
              disabled={busy}
              className="btn-ghost w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
