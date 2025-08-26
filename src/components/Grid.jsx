import React, { useEffect, useRef, useState } from "react";
import Cell from "./Cell";
import Modal from "./Modal";
import ExportButton from "./ExportButton";
import { prompts } from "../data/prompts";
import logo from "../assets/logo.png";
import { getAllPhotos, setPhoto, deletePhoto, clearAllPhotos } from "../lib/idb";
import { fileToSquareDataURL } from "../lib/encode";

export default function Grid() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [tempPreview, setTempPreview] = useState(null);   // dataURL for preview
  const [photos, setPhotos] = useState({});               // { [index]: dataURL }
  const [loading, setLoading] = useState(true);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const filledCount = Object.keys(photos).length;
  const isComplete = filledCount === 8;

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await getAllPhotos();
      if (mounted) setPhotos(data || {});
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const handleCellClick = (i) => setActiveIndex(i);

  const handleFileChosen = async (file) => {
    if (!file || activeIndex == null) return;
    const dataUrl = await fileToSquareDataURL(file, 1080);
    setTempPreview(dataUrl);
  };

  const handleSave = async () => {
    if (activeIndex == null || !tempPreview) return;
    await setPhoto(activeIndex, tempPreview);
    setPhotos((prev) => ({ ...prev, [activeIndex]: tempPreview }));
    setTempPreview(null);
    setActiveIndex(null);
  };

  const handleRemove = async (i) => {
    await deletePhoto(i);
    setPhotos((prev) => {
      const copy = { ...prev };
      delete copy[i];
      return copy;
    });
  };

  const handleClearAll = async () => {
    await clearAllPhotos();
    setPhotos({});
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-brand-ink/70">Loading…</div>
    );
  }

  return (
    <>
      {/* Top actions (separate from the grid) */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-brand-ink/70">Done {filledCount}/8</div>
        <button
          type="button"
          onClick={handleClearAll}
          className="btn-ghost"
        >
          Clear all
        </button>
      </div>

      {/* Square grid wrapper — maximizes width and keeps a perfect square */}
      <div className="w-full aspect-square relative">
        {/* Absolutely fill the square box with the 3x3 grid */}
        <div className="absolute inset-0 grid grid-cols-3 gap-2 sm:gap-3">
          {prompts.map((label, i) => {
            if (i === 4) {
              // Center static logo cell — must fill entire cell all the time
              return (
                <div
                  key={i}
                  className="relative aspect-square rounded-none overflow-hidden"
                >
                  <img
                    src={logo}
                    alt="Event logo"
                    className="absolute inset-0 w-full h-full object-cover" /* fill completely */
                    draggable="false"
                  />
                </div>
              );
            }
            const src = photos[i];
            return (
              <Cell
                key={i}
                index={i}
                label={label}
                photo={src}
                onClick={handleCellClick}
                onRemove={handleRemove}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom actions (also separate from the grid) */}
      <div className="mt-6 flex gap-2">
        <ExportButton
          variant="download"
          disabled={!isComplete}
          remaining={8 - filledCount}
          photos={photos}
          logoSrc={logo}
          prompts={prompts}
        />
        <ExportButton
          variant="share"
          disabled={!isComplete}
          remaining={8 - filledCount}
          photos={photos}
          logoSrc={logo}
          prompts={prompts}
        />
      </div>

      {/* Capture / Upload modal */}
      <Modal open={activeIndex != null} onClose={() => { setActiveIndex(null); setTempPreview(null); }}>
        <div className="space-y-3">
          <div className="text-sm text-brand-ink">
            <span className="font-semibold">Task:</span>{" "}
            <span className="text-brand-ink/80">{activeIndex != null ? prompts[activeIndex] : ""}</span>
          </div>

          {/* Preview box (if we have a temp image) */}
          {tempPreview ? (
            <div className="card p-2">
              <img
                src={tempPreview}
                alt="Preview"
                className="w-full aspect-square object-cover rounded-none"
              />
            </div>
          ) : (
            <p className="muted text-sm">Choose a source to add your photo.</p>
          )}

          {/* Source buttons */}
          {!tempPreview && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="btn-primary"
              >
                Take photo
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="btn-outline"
              >
                Upload
              </button>

              {/* Hidden inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; handleFileChosen(f); e.target.value = ""; }}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; handleFileChosen(f); e.target.value = ""; }}
              />
            </div>
          )}

          {/* Save / Replace actions when preview is present */}
          {tempPreview && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setTempPreview(null)}
              >
                Choose another
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
