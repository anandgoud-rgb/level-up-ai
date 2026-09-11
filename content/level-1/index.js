import { missions, BUILD_CONSTRAINTS } from "./missions";
import zomato from "./challenges/zomato";
import zepto from "./challenges/zepto";
import amazon from "./challenges/amazon";
import youtube from "./challenges/youtube";
import spotify from "./challenges/spotify";
import netflix from "./challenges/netflix";
import instagram from "./challenges/instagram";
import makemytrip from "./challenges/makemytrip";
import muscleblaze from "./challenges/muscleblaze";

// The nine fixed paths. No "surprise me" option — see CLAUDE.md.
export const challenges = [
  zomato,
  zepto,
  amazon,
  youtube,
  spotify,
  netflix,
  instagram,
  makemytrip,
  muscleblaze,
];

export function getChallenge(challengeId) {
  return challenges.find((c) => c.id === challengeId) ?? null;
}

const totalXp = missions.reduce((sum, m) => sum + m.xp, 0);
const totalMinutes = missions.reduce((sum, m) => sum + m.estMinutes, 0);

// day: 1 is for internal scheduling reference only — never surfaced to students.
export const level1 = {
  id: "level-1",
  day: 1,
  title: "Build Your Own",
  xp: totalXp,
  estMinutes: totalMinutes,
  missions,
};

export { missions, BUILD_CONSTRAINTS };
