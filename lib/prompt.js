import { missions } from "@/content/level-1/missions";

const TOKEN = /{{\s*(challenge|student|build)\.([a-zA-Z0-9_]+)\s*}}/g;

export class MissingTokenError extends Error {
  constructor(token) {
    super(`Missing value for {{${token}}}`);
    this.name = "MissingTokenError";
    this.token = token;
  }
}

function formatValue(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function isEmpty(value) {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

// Resolves {{challenge.x}} / {{student.x}} / {{build.x}} tokens in a string.
// Throws MissingTokenError rather than rendering a blank — a mission whose
// tokens aren't resolvable yet is not startable. See findMissionForBuildKey.
export function resolvePrompt(template, { challenge, student, build } = {}) {
  const sources = { challenge, student, build };
  return template.replace(TOKEN, (match, namespace, key) => {
    const source = sources[namespace];
    const value = source ? source[key] : undefined;
    if (isEmpty(value)) throw new MissingTokenError(`${namespace}.${key}`);
    return formatValue(value);
  });
}

export function extractTokens(template) {
  const tokens = [];
  const re = new RegExp(TOKEN.source, "g");
  let match;
  while ((match = re.exec(template))) {
    tokens.push(`${match[1]}.${match[2]}`);
  }
  return tokens;
}

// Given a missing "build.<key>" token, finds which mission's inputs/postInputs
// declares that key, so the student can be sent back there with a plain
// explanation instead of a broken prompt.
export function findMissionForBuildKey(key) {
  for (const mission of missions) {
    const fields = [...(mission.inputs ?? []), ...(mission.postInputs ?? [])];
    if (fields.some((f) => f.key === key)) return mission;
  }
  return null;
}
