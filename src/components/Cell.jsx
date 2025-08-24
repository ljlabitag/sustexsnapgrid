/* eslint-disable react/prop-types */
import React from "react";

export default function Cell({ label, index, photo, onClick }) {
  const isCenterCell = index === 4;
  const hasPhoto = !!photo;

  return (
    <button
      type="button"
      disabled={isCenterCell}
      onClick={() => onClick?.(index)}
      className={[
        "w-full h-full flex items-center justify-center text-center",
        isCenterCell
          ? ""
          : hasPhoto
          ? ""
          : "border-2 border-dashed border-gray-400 bg-gray-100 p-2 hover:bg-gray-200 active:scale-[0.99]",
      ].join(" ")}
    >
      {!isCenterCell &&
        (photo ? (
          <img
            src={photo}
            alt="Uploaded"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs text-gray-700">
            {label}
          </div>
        ))}
    </button>
  );
}
