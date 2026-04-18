"use client";

import { useState } from "react";

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#2D4A2D" : "none"}
      stroke={filled ? "#2D4A2D" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function GrantSaveButton({ grantId }: { grantId: string }) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      data-grant-id={grantId}
      onClick={() => setSaved((s) => !s)}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${
        saved
          ? "border-[#2D4A2D] bg-[#2D4A2D]/5 text-[#2D4A2D]"
          : "border-[#C8BCA8] bg-white text-charcoal hover:border-[#2D4A2D] hover:text-[#2D4A2D]"
      }`}
      aria-pressed={saved}
      aria-label={saved ? "Remove grant from saved list" : "Save grant to My Grants"}
    >
      <BookmarkIcon filled={saved} />
      {saved ? "Saved to My Grants" : "Save Grant"}
    </button>
  );
}
