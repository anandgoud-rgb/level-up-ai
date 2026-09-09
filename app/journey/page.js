import { createClient, supabaseReady } from "@/lib/supabase/server";
import { journey } from "@/content";
import { signOut } from "@/app/actions/auth";
import JourneyPath from "@/components/JourneyPath";

// Challenges 1-5 aren't written yet. Placeholders keep the shape of the three
// days visible from day one — see content/index.js.
const CHALLENGE_PLACEHOLDERS = [1, 2, 3, 4, 5].map((n) => ({
  id: `challenge-${n}`,
  title: `Challenge ${n}`,
}));

export default async function JourneyPage() {
  if (!supabaseReady) {
    return (
      <main className="notebook grid min-h-screen place-items-center px-5 py-16">
        <p className="font-body text-[15px] text-ink">
          Supabase isn&rsquo;t configured yet.
        </p>
      </main>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: progressRows }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("mission_progress")
      .select("level_id, mission_id, status, xp_awarded")
      .eq("user_id", user.id),
  ]);

  const progress = progressRows ?? [];

  const levels = journey.map((level, index) => {
    const levelProgress = progress.filter((r) => r.level_id === level.id);
    const missionsDone = levelProgress.filter((r) => r.status === "done").length;
    const isComplete = missionsDone === level.missions.length;

    const previousLevel = journey[index - 1];
    let locked = false;
    let lockedReason = null;
    if (previousLevel) {
      const prevDone = progress.filter(
        (r) => r.level_id === previousLevel.id && r.status === "done"
      ).length;
      if (prevDone < previousLevel.missions.length) {
        locked = true;
        lockedReason = `Finish ${previousLevel.title} first.`;
      }
    }

    const nextMission =
      level.missions.find(
        (m) =>
          !levelProgress.some((r) => r.mission_id === m.id && r.status === "done")
      ) ?? level.missions[0];

    return {
      ...level,
      isComplete,
      locked,
      lockedReason,
      missionsDone,
      href: `/journey/${level.id}/${nextMission.id}`,
      ctaLabel: missionsDone === 0 ? "Start" : isComplete ? "Review" : "Continue",
    };
  });

  const totalXp = progress.reduce((sum, r) => sum + (r.xp_awarded || 0), 0);
  const earnedBadges = levels.filter((l) => l.isComplete).map((l) => l.badge);

  const stops = [
    ...levels.map((level) => ({
      id: level.id,
      title: level.title,
      subtitle: level.subtitle,
      xp: level.xp,
      estMinutes: level.estMinutes,
      isComplete: level.isComplete,
      locked: level.locked,
      lockedReason: level.lockedReason,
      missionsDone: level.missionsDone,
      missionsTotal: level.missions.length,
      href: level.href,
      ctaLabel: level.ctaLabel,
      placeholder: false,
    })),
    ...CHALLENGE_PLACEHOLDERS.map((c) => ({
      id: c.id,
      title: c.title,
      placeholder: true,
    })),
  ];

  return (
    <main className="notebook min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 sm:mb-14">
          <div>
            <p className="font-display text-sm font-bold tracking-tight text-volt">
              LevelUp AI
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-4xl">
              {profile?.full_name
                ? `Welcome back, ${profile.full_name.trim().split(/\s+/)[0]}.`
                : "Welcome back."}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border-2 border-ink bg-marigold px-4 py-2 font-display text-sm font-bold text-ink">
              {totalXp} XP
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-xl border-2 border-ink bg-white px-4 py-2 font-display text-sm font-bold text-ink shadow-lift transition hover:bg-paper active:translate-y-0.5 active:shadow-none"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {earnedBadges.length > 0 ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <span
                key={badge.slug}
                className="rounded-full border-2 border-ink bg-mint px-3 py-1.5 font-body text-[13px] font-semibold text-ink"
              >
                {badge.name}
              </span>
            ))}
          </div>
        ) : null}

        <JourneyPath stops={stops} />
      </div>
    </main>
  );
}
