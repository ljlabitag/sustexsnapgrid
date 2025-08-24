/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { renderBingoCollage, downloadBlob } from "../lib/collage";

export default function ExportCollageButtons({ photos, logoSrc, prompts = [], options = {}, disabled = false, remaining = 0 }) {
  const [busy, setBusy] = useState(false);

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
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (busy || disabled) return;
    setBusy(true);
    try {
      const blob = await renderCollage();
      // instead of falling back to download, only share if supported
      if (navigator.canShare) {
        await navigator.share({
          files: [new File([blob], "bingo-collage.png", { type: "image/png" })],
          title: "Photo Challenge Bingo",
          text: "My finished bingo card",
        });
      } else {
        alert("Sharing is not supported on this device/browser.");
      }
    } finally {
      setBusy(false);
    }
  }
  const isDisabled = busy || disabled;
  const labelHint = disabled ? `Complete ${remaining} more to export` : undefined;

  return (
    <div className="flex space-x-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isDisabled}
        title={labelHint || "Download collage"}
        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-sm disabled:opacity-50"
      >
        {busy ? "Rendering..." : "Download"}
      </button>
      <button
        type="button"
        onClick={handleShare}
        disabled={isDisabled}
        title={labelHint || "Share collage"}
        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-sm disabled:opacity-50"
      >
        {busy ? "Rendering..." : "Share"}
      </button>
    </div>
  );
}
