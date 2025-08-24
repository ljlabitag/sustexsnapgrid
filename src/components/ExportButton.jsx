/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Modal from "./Modal";
import { renderBingoCollage, downloadBlob } from "../lib/collage";

export default function ExportCollageButtons({
  photos,
  logoSrc,
  prompts = [],
  options = {},
  disabled = false,
  remaining = 0,
  shareScript = "I completed the SustEx SnapGrid challenge at SustEx 2025! #SUSTEX2025 @DOST @TheSMStore"
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

  async function handleDownload() {
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

  function handleShareClick() {
    if (busy || disabled) return;
    setCopied(false);
    setShareOpen(true);
  }

  async function handleCopyScript() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareScript);
      } else {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = shareScript;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
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

  async function handleShareNow() {
    if (!copied || busy) return;
    setBusy(true);
    try {
      const blob = await renderCollage();
      const file = new File([blob], "bingo-collage.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Photo Challenge Bingo",
          text: shareScript,
        });
        setShareOpen(false);
      } else {
        alert("Sharing is not supported on this device/browser. You can download the image and post it manually.");
      }
    } catch (e) {
      console.error("Share failed", e);
    } finally {
      setBusy(false);
    }
  }

  const isDisabled = busy || disabled;
  const labelHint = disabled ? `Complete ${remaining} more to export` : undefined;

  return (
    <div className="flex items-center space-x-2">
      {/* Download */}
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDisabled}
        title={labelHint || "Download collage"}
        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "Working..." : "Download"}
      </button>

      {/* Share (opens modal) */}
      <button
        type="button"
        onClick={handleShareClick}
        disabled={isDisabled}
        title={labelHint || "Share collage"}
        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Share
      </button>

      {disabled && (
        <span className="text-xs text-gray-500">{labelHint}</span>
      )}

      {/* Share caption modal */}
      <Modal open={shareOpen} onClose={() => (!busy && setShareOpen(false))}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 text-center">Recommended caption</h2>
          <p className="text-xs text-gray-600 text-center">
            Copy the caption first, then tap Share.
          </p>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <textarea
              readOnly
              value={shareScript}
              className="w-full h-28 p-3 text-sm outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCopyScript}
              disabled={busy}
              className="px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50"
            >
              {copied ? "Copied ✓" : "Copy caption"}
            </button>
            <button
              type="button"
              onClick={handleShareNow}
              disabled={!copied || busy}
              className={`px-3 py-2 rounded-lg text-white ${(!copied || busy) ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
              title={!copied ? "Copy the caption first" : "Share now"}
            >
              Share now
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShareOpen(false)}
            disabled={busy}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
