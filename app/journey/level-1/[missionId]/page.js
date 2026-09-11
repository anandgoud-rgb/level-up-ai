import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient, supabaseReady } from "@/lib/supabase/server";
import { level1, getChallenge } from "@/content/level-1";
import { resolvePrompt, extractTokens, findMissionForBuildKey } from "@/lib/prompt";
import Level1MissionRunner from "@/components/Level1MissionRunner";

function ownKeys(mission) {
  return new Set([...(mission.inputs ?? []), ...(mission.postInputs ?? [])].map((f) => f.key));
}

// A mission's own template may reference build.* keys it collects itself —
// those start blank and are fine. Anything else must already be resolvable,
// or the student gets sent back to whichever earlier mission sets it.
function findMissingPrerequisite(mission, context) {
  const selfKeys = ownKeys(mission);
  const strings = [
    mission.title,
    mission.prompt?.template,
    ...(mission.checklist ?? []).map((c) => c.label),
  ].filter(Boolean);

  for (const str of strings) {
    for (const token of extractTokens(str)) {
      if (token.startsWith("build.") && selfKeys.has(token.slice("build.".length))) continue;
      try {
        resolvePrompt(`{{${token}}}`, context);
      } catch {
        const key = token.replace(/^build\./, "");
        return findMissionForBuildKey(key);
      }
    }
  }
  return null;
}

export default async function Level1MissionPage({ params }) {
  const { missionId } = params;
  const missionIndex = level1.missions.findIndex((m) => m.id === missionId);
  if (missionIndex === -1) notFound();
  const mission = level1.missions[missionIndex];

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

  const [{ data: profile }, { data: build }, { data: progressRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, college, program")
      .eq("id", user.id)
      .single(),
    supabase
      .from("builds")
      .select("challenge_id, answers, locked_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("mission_progress")
      .select("status, artifact")
      .eq("user_id", user.id)
      .eq("mission_id", mission.id)
      .maybeSingle(),
  ]);

  if (!build) redirect("/journey/level-1");

  const challenge = getChallenge(build.challenge_id);
  const context = { challenge, student: profile ?? {}, build: build.answers ?? {} };

  const missingMission = findMissingPrerequisite(mission, context);
  if (missingMission) {
    return (
      <main className="notebook grid min-h-screen place-items-center px-5 py-16">
        <div className="w-full max-w-md rounded-3xl border-2 border-ink bg-white p-8 shadow-card">
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Not quite yet.
          </h1>
          <p className="mt-3 font-body text-[15px] leading-relaxed text-inkSoft">
            This mission needs something from &ldquo;{missingMission.title}&rdquo;
            first.
          </p>
          <Link
            href={`/journey/level-1/${missingMission.id}`}
            className="mt-6 inline-block rounded-xl border-2 border-ink bg-volt px-5 py-3 font-display text-base font-bold text-white shadow-lift transition hover:bg-voltDeep active:translate-y-0.5 active:shadow-none"
          >
            Go to &ldquo;{missingMission.title}&rdquo;
          </Link>
        </div>
      </main>
    );
  }

  const nextMission = level1.missions[missionIndex + 1] ?? null;

  return (
    <Level1MissionRunner
      userId={user.id}
      challenge={challenge}
      student={profile ?? {}}
      buildAnswers={build.answers ?? {}}
      buildLocked={Boolean(build.locked_at)}
      mission={mission}
      missionIndex={missionIndex}
      missionsTotal={level1.missions.length}
      savedArtifact={progressRow?.artifact ?? {}}
      savedStatus={progressRow?.status ?? "in_progress"}
      nextMissionId={nextMission?.id ?? null}
      levelXp={level1.xp}
      completionMessage={level1.completionMessage}
    />
  );
}
