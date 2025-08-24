import React from "react";
import Grid from "./components/Grid";

export default function App() {

  return (
    <div className="min-w-screen min-h-screen mx-auto px-4 py-6 bg-[#E1F1EC]">
        {/* header */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">SustEx Snap Grid</h1>
        <p className="text-xs text-gray-500 mb-3">Complete all 8 prompts</p>

        {/* grid */}
        <div className="rounded-xl"><Grid /></div>
    </div>
  )
}