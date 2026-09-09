import Link from "next/link";

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M5 11.5l4 4 8-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect
        x="4"
        y="8"
        width="10"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6 8V5.5a3 3 0 0 1 6 0V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function nodeClasses(stop) {
  if (stop.isComplete) return "border-ink bg-mint text-ink";
  if (stop.locked || stop.placeholder)
    return "border-dashed border-line bg-white text-inkSoft/60";
  return "border-ink bg-volt text-white";
}

// A dashed S-curve connecting this node to the next, bending toward whichever
// side the next node sits on.
function Connector({ toRight }) {
  const d = toRight
    ? "M30,0 C30,35 70,25 70,60"
    : "M70,0 C70,35 30,25 30,60";
  return (
    <div className="h-14 w-full text-line" aria-hidden>
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
      >
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="1 10"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export default function JourneyPath({ stops }) {
  return (
    <ol className="mx-auto max-w-md">
      {stops.map((stop, i) => {
        const muted = stop.locked || stop.placeholder;
        const isLast = i === stops.length - 1;
        const onRight = i % 2 === 1;

        return (
          <li key={stop.id}>
            <div className={`flex ${onRight ? "justify-end" : "justify-start"}`}>
              <div className="flex w-44 flex-col items-center text-center">
                <div
                  className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 font-display text-lg font-extrabold ${nodeClasses(
                    stop
                  )}`}
                >
                  {stop.isComplete ? <CheckIcon /> : muted ? <LockIcon /> : i + 1}
                </div>

                <h3
                  className={`mt-3 font-display text-lg font-extrabold leading-tight ${
                    muted ? "text-inkSoft" : "text-ink"
                  }`}
                >
                  {stop.title}
                </h3>

                {stop.subtitle ? (
                  <p
                    className={`mt-1 font-body text-[13px] leading-relaxed ${
                      muted ? "text-inkSoft/70" : "text-inkSoft"
                    }`}
                  >
                    {stop.subtitle}
                  </p>
                ) : null}

                {stop.placeholder ? (
                  <p className="mt-2 font-body text-[13px] font-medium text-inkSoft/70">
                    Coming soon
                  </p>
                ) : stop.locked ? (
                  <p className="mt-2 font-body text-[13px] font-medium text-inkSoft/70">
                    {stop.lockedReason}
                  </p>
                ) : (
                  <>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-body text-[12px] text-inkSoft">
                      <span>
                        {stop.missionsDone}/{stop.missionsTotal} missions
                      </span>
                      {stop.estMinutes ? <span>~{stop.estMinutes} min</span> : null}
                      <span className="font-semibold text-ink">{stop.xp} XP</span>
                    </div>
                    <Link
                      href={stop.href}
                      className="mt-3 inline-block rounded-xl border-2 border-ink bg-volt px-5 py-2.5 font-display text-sm font-bold text-white shadow-lift transition hover:bg-voltDeep active:translate-y-0.5 active:shadow-none"
                    >
                      {stop.ctaLabel}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {!isLast ? <Connector toRight={!onRight} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
