const TOKEN = /{{\s*(\w+)\s*}}/g;

// Leaves the placeholder visible instead of blanking it out, so a missing
// profile field never silently produces a broken-looking prompt.
export function resolveTemplate(template, profile = {}) {
  return template.replace(TOKEN, (match, key) => {
    const value = profile[key];
    return value === undefined || value === null || value === "" ? match : String(value);
  });
}
