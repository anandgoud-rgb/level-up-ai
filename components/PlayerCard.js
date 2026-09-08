"use client";

const PROGRAM_STYLE = {
  Science: { bg: "#17BE8B", label: "Science" },
  Commerce: { bg: "#2C4BFF", label: "Commerce" },
  Arts: { bg: "#FF6B9D", label: "Arts" },
};

function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PlayerCard({ values, filled, total }) {
  const { fullName, college, program, passingYear } = values;
  const badge = PROGRAM_STYLE[program];
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="rounded-3xl border-2 border-ink bg-white p-6 shadow-card">
      <div className="flex items-start gap-4">
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-ink font-display text-2xl font-extrabold text-ink transition-colors"
          style={{ backgroundColor: badge ? badge.bg : "#FFB627" }}
        >
          {initials(fullName)}
        </div>

        <div className="min-w-0 pt-0.5">
          <p className="truncate font-display text-2xl font-extrabold leading-tight text-ink">
            {fullName.trim() || "Your name"}
          </p>
          <p className="truncate font-body text-sm text-inkSoft">
            {college.trim() || "Your college"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {badge ? (
          <span
            className="rounded-full border-2 border-ink px-3 py-1 font-body text-[13px] font-semibold text-ink"
            style={{ backgroundColor: badge.bg }}
          >
            {badge.label}
          </span>
        ) : (
          <span className="rounded-full border-2 border-dashed border-line px-3 py-1 font-body text-[13px] text-inkSoft">
            Program
          </span>
        )}

        {passingYear ? (
          <span className="rounded-full border-2 border-ink bg-white px-3 py-1 font-body text-[13px] font-semibold text-ink">
            Class of {passingYear}
          </span>
        ) : (
          <span className="rounded-full border-2 border-dashed border-line px-3 py-1 font-body text-[13px] text-inkSoft">
            Class of ____
          </span>
        )}
      </div>

      <div className="mt-6 border-t-2 border-dashed border-line pt-4">
        <div className="flex items-baseline justify-between">
          <p className="font-body text-[13px] font-medium text-inkSoft">
            Card {pct}% complete
          </p>
          <p className="font-display text-[13px] font-bold text-ink">
            {filled}/{total}
          </p>
        </div>
        <div className="mt-2 h-5 overflow-hidden rounded-full border-2 border-ink bg-paper p-[3px]">
          <div
            className="h-full rounded-full bg-marigold transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
