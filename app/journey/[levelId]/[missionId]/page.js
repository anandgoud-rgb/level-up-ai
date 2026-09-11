import { notFound } from "next/navigation";
import { createClient, supabaseReady } from "@/lib/supabase/server";
import { journey } from "@/content";
import MissionRunner from "@/components/MissionRunner";

export default async function MissionPage({ params }) {
  const { levelId, missionId } = params;

  const level = journey.find((l) => l.id === levelId);
  const missionIndex = level ? level.missions.findIndex((m) => m.id === missionId) : -1;
  if (!level || missionIndex === -1) notFound();

  const mission = level.missions[missionIndex];

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

  const [{ data: profile }, { data: progressRow }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, college, program")
      .eq("id", user.id)
      .single(),
    supabase
      .from("mission_progress")
      .select("status, artifact, xp_awarded")
      .eq("user_id", user.id)
      .eq("mission_id", mission.id)
      .maybeSingle(),
  ]);

  const nextMission = level.missions[missionIndex + 1] ?? null;

  return (
    <MissionRunner
      userId={user.id}
      levelId={level.id}
      levelTitle={level.title}
      mission={mission}
      missionIndex={missionIndex}
      missionsTotal={level.missions.length}
      profile={profile ?? {}}
      savedArtifact={progressRow?.artifact ?? {}}
      savedStatus={progressRow?.status ?? "in_progress"}
      nextMissionId={nextMission?.id ?? null}
      levelXp={level.xp}
      levelBadge={level.badge}
      completionMessage={level.completionMessage}
    />
  );
}
