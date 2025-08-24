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

  const isComplete = Object.keys(photos).length === 8;

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Load saved photos from IndexedDB on first render
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const saved = await getAllPhotos();
        if (live) setPhotos(saved || {});
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  function openFor(index) {
    setActiveIndex(index);
    setTempPreview(null);
  }

  async function handleFileChosen(file) {
    if (!file) return;
    const dataUrl = await fileToSquareDataURL(file, {
    side: 1024,   // adjust to 1280 if you want higher res
    quality: 0.72
    });

    setTempPreview(dataUrl); // for modal preview
  }

  async function handleUsePhoto() {
    if (!tempPreview || activeIndex == null) return;
    const idx = String(activeIndex);

    // Save to React state immediately for snappy UI
    setPhotos(prev => ({ ...prev, [idx]: tempPreview }));

    // Persist in the background to IndexedDB
    try {
      await setPhoto(idx, tempPreview);
    } catch (e) {
      console.error("Failed to save photo to IndexedDB:", e);
    }

    // reset modal state
    setActiveIndex(null);
    setTempPreview(null);
  }

  function handleRetake() {
    setTempPreview(null);
  }

  async function handleRemovePhoto(index) {
    const idx = String(index);
    setPhotos(prev => {
      const copy = { ...prev };
      delete copy[idx];
      return copy;
    });
    try {
      await deletePhoto(idx);
    } catch (e) {
      console.error("Failed to delete photo:", e);
    }
  }

  async function handleClearAll() {
    setPhotos({});
    try {
      await clearAllPhotos();
    } catch (e) {
      console.error("Failed to clear photos:", e);
    }
  }

  const cells = Array.from({ length: 9 }, (_, index) => {
    if (index === 4) {
      return (
        <div
          key={index}
          className="w-full h-full flex items-center justify-center bg-white"
        >
          <img src={logo} alt="Logo" />
        </div>
      );
    }
    return (
      <div key={index} className="relative">
        <Cell
          index={index}
          label={prompts[index]}
          photo={photos[index]}
          onClick={() => openFor(index)}
        />
        {photos[index] && (
          <button
            type="button"
            className="absolute top-1 right-1 bg-white/90 rounded-md px-2 py-1 text-[10px] border border-gray-300 hover:bg-white"
            onClick={(e) => { e.stopPropagation(); handleRemovePhoto(index); }}
            aria-label="Remove photo"
            title="Remove"
          >
            Remove
          </button>
        )}
      </div>
    );
  });

  return (
    <>
      <div className="mx-auto w-[min(90vw,90svh)]">
        <div className="w-full aspect-square grid grid-cols-3 grid-rows-3">
          {cells}
        </div>

        {/* Simple footer actions */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            {loading ? "Loading..." : `Done ${Object.keys(photos).length}/8`}
          </span>
          <ExportButton 
            photos={photos}
            logoSrc={logo}
            prompts={prompts}
            options={{ drawLabels: false }}
            disabled={!isComplete}      // <— key line
            remaining={8 - Object.keys(photos).length}
          />
          <div className="space-x-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 text-sm"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <Modal open={activeIndex !== null} onClose={() => { setActiveIndex(null); setTempPreview(null); }}>
        {activeIndex !== null && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              {prompts[activeIndex]}
            </h2>

            {tempPreview ? (
              <>
                <div className="w-full h-56 rounded-lg overflow-hidden bg-gray-100">
                  <img src={tempPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={handleUsePhoto}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Use photo
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 text-center">Choose how you want to add a photo.</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400"
                  >
                    📷 Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400"
                  >
                    🖼️ Upload
                  </button>
                </div>
              </>
            )}

            {/* hidden inputs */}
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
      </Modal>
    </>
  );
}
