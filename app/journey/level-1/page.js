import Link from "next/link";
import { createClient, supabaseReady } from "@/lib/supabase/server";
import { challenges, getChallenge, level1 } from "@/content/level-1";
import ChallengePicker from "@/components/ChallengePicker";

export default async function Level1PickerPage() {
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

  const [{ data: build }, { data: progressRows }] = await Promise.all([
    supabase
      .from("builds")
      .select("challenge_id, locked_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("mission_progress")
      .select("mission_id, status")
      .eq("user_id", user.id)
      .eq("level_id", "level-1"),
  ]);

  const progress = progressRows ?? [];
  const nextMission =
    level1.missions.find(
      (m) => !progress.some((r) => r.mission_id === m.id && r.status === "done")
    ) ?? level1.missions[level1.missions.length - 1];

  const locked = Boolean(build?.locked_at);
  const chosen = build ? getChallenge(build.challenge_id) : null;

  if (locked) {
    return (
      <main className="notebook min-h-screen">
        <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            href="/journey"
            className="font-body text-[13px] font-semibold text-inkSoft hover:text-ink"
          >
            &larr; Journey
          </Link>
          <p className="mt-6 font-display text-sm font-bold tracking-tight text-volt">
            Level 1 &middot; Build Your Own
          </p>
          <div className="mt-3 rounded-3xl border-2 border-ink bg-white p-8 shadow-card">
            <p className="text-4xl">{chosen?.icon}</p>
            <h1 className="mt-3 font-display text-2xl font-extrabold text-ink">
              {chosen?.name}
            </h1>
            <p className="mt-2 font-body text-[15px] text-inkSoft">
              {chosen?.tagline}
            </p>
            <p className="mt-4 font-body text-[13px] text-inkSoft">
              Your challenge is locked in for this level.
            </p>
            <Link
              href={`/journey/level-1/${nextMission.id}`}
              className="mt-6 inline-block rounded-xl border-2 border-ink bg-volt px-5 py-3 font-display text-base font-bold text-white shadow-lift transition hover:bg-voltDeep active:translate-y-0.5 active:shadow-none"
            >
              Continue building
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="notebook min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/journey"
          className="font-body text-[13px] font-semibold text-inkSoft hover:text-ink"
        >
          &larr; Journey
        </Link>
        <p className="mt-6 font-display text-sm font-bold tracking-tight text-volt">
          Level 1
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
          Build Your Own
        </h1>
        <p className="mt-4 max-w-xl font-body text-[16px] leading-relaxed text-inkSoft">
          Pick one product to build over nine missions
          {level1.estMinutes ? ` (about ${Math.round(level1.estMinutes / 60)} hours)` : ""}.
          You can change your pick until you finish mission 2 — after that, it&rsquo;s
          locked in for the level.
        </p>

        <ChallengePicker
          challenges={challenges}
          existingChallengeId={build?.challenge_id ?? null}
          nextMissionId={nextMission.id}
        />
      </div>
    </main>
  );
}
