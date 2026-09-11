"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { missions } from "@/content/level-1/missions";

export async function selectChallenge(challengeId) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Only reachable before the choice locks (mission 02), so at most mission
  // 01's row exists — clear it so the new challenge starts clean.
  await supabase
    .from("mission_progress")
    .delete()
    .eq("user_id", user.id)
    .eq("level_id", "level-1");

  await supabase.from("builds").upsert(
    {
      user_id: user.id,
      challenge_id: challengeId,
      answers: {},
      locked_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  redirect(`/journey/level-1/${missions[0].id}`);
}
