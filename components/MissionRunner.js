"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, supabaseReady } from "@/lib/supabase/client";
import { resolveTemplate } from "@/content/resolveTemplate";

function TeachBlock({ block }) {
  if (block.type === "text") {
    return (
      <p className="font-body text-[15px] leading-relaxed text-inkSoft">
        {block.text}
      </p>
    );
  }

  if (block.type === "formula") {
    return (
      <div className="rounded-2xl border-2 border-dashed border-line bg-white px-5 py-5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {block.parts.map((part, i) => (
            <span key={part} className="flex items-center gap-2">
              <span className="rounded-lg border-2 border-ink bg-marigold px-3 py-1.5 font-display text-[13px] font-extrabold text-ink sm:text-sm">
                {part}
              </span>
              {i < block.parts.length - 1 ? (
                <span className="font-display text-sm font-bold text-inkSoft">
                  +
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // compare and callout read the same: a quiet note, not an instruction.
  return (
    <div className="rounded-2xl border-2 border-line bg-white px-5 py-4">
      <p className="font-body text-[14px] leading-relaxed text-inkSoft">
        {block.text}
      </p>
    </div>
  );
}

function PromptPanel({ label, text, onCopy, copied }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-ink px-5 py-4">
      {label ? (
        <p className="mb-2 font-display text-xs font-bold uppercase tracking-wide text-marigold">
          {label}
        </p>
      ) : null}
      <p className="font-body text-[15px] leading-relaxed text-paper">{text}</p>
      <button
        type="button"
        onClick={onCopy}
        className="mt-3 rounded-lg border-2 border-paper/30 bg-transparent px-3 py-1.5 font-display text-[13px] font-bold text-paper transition hover:bg-paper/10"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function OpenClaudeLink() {
  return (
    <a
      href="https://claude.ai"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-white px-5 py-2.5 font-display text-sm font-bold text-ink shadow-lift transition hover:bg-paper active:translate-y-0.5 active:shadow-none"
    >
      Open Claude
    </a>
  );
}

function Chips({ intro, chips, onCopy, copiedKey }) {
  return (
    <div>
      {intro ? (
        <p className="mb-2 font-body text-[13px] font-medium text-inkSoft">
          {intro}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onCopy(chip, chip)}
            className="rounded-full border-2 border-ink bg-white px-3 py-1.5 font-body text-[13px] font-semibold text-ink transition hover:bg-paper"
          >
            {copiedKey === chip ? "Copied" : chip}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProofField({ label, value, onChange, onBlur, minLength = 0, kind = "textarea" }) {
  const length = value.trim().length;
  const met = length >= minLength;

  return (
    <div>
      <label className="label">{label}</label>
      {kind === "line" ? (
        <input className="field" value={value} onChange={onChange} onBlur={onBlur} />
      ) : (
        <textarea
          rows={5}
          className="field resize-y"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      )}
      {minLength > 0 ? (
        <p
          className={`mt-1.5 font-body text-[12px] font-medium ${
            met ? "text-mint" : "text-inkSoft"
          }`}
        >
          {Math.min(length, minLength)}/{minLength} characters
          {met ? " — ready" : ""}
        </p>
      ) : null}
    </div>
  );
}

function isProofComplete(proof, values) {
  return proof.fields.every(
    (f) => (values[f.key] || "").trim().length >= (f.minLength || 0)
  );
}

export default function MissionRunner({
  userId,
  levelId,
  levelTitle,
  mission,
  missionIndex,
  missionsTotal,
  profile,
  savedArtifact,
  savedStatus,
  nextMissionId,
}) {
  const router = useRouter();
  const supabase = useMemo(() => (supabaseReady ? createClient() : null), []);

  const initialValues = useMemo(() => {
    const v = {};
    mission.proof.fields.forEach((f) => {
      v[f.key] = savedArtifact?.[f.key] || "";
    });
    return v;
  }, [mission, savedArtifact]);

  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState(savedStatus === "done" ? "done" : "in_progress");
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  async function copyText(key, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      // Clipboard blocked — the student can select and copy manually.
    }
  }

  async function saveProgress(nextStatus, xp, currentValues) {
    if (!supabaseReady || !supabase) return;
    try {
      await supabase.from("mission_progress").upsert(
        {
          user_id: userId,
          level_id: levelId,
          mission_id: mission.id,
          status: nextStatus,
          artifact: currentValues,
          xp_awarded: xp,
          completed_at: nextStatus === "done" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,mission_id" }
      );
    } catch {
      // Save failed silently — the next blur or Continue click retries.
    }
  }

  function setField(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleBlur() {
    saveProgress(status, status === "done" ? mission.xp : 0, values);
  }

  async function handleContinue() {
    setSaving(true);
    setStatus("done");
    await saveProgress("done", mission.xp, values);
    setSaving(false);
    router.push(nextMissionId ? `/journey/${levelId}/${nextMissionId}` : "/journey");
  }

  const canContinue = isProofComplete(mission.proof, values);

  const resolvedPrompt = mission.prompt
    ? resolveTemplate(mission.prompt.template, profile)
    : null;
  const resolvedPrompts = mission.prompts
    ? mission.prompts.map((p) => ({ ...p, text: resolveTemplate(p.template, profile) }))
    : null;

  const fields = mission.proof.fields;
  const interleaved = mission.improvementChips && mission.proof.mode === "compare";

  return (
    <main className="notebook min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/journey"
            className="font-body text-[13px] font-semibold text-inkSoft hover:text-ink"
          >
            &larr; Journey
          </Link>
          <span className="font-body text-[13px] font-medium text-inkSoft">
            Mission {missionIndex + 1} of {missionsTotal}
          </span>
        </div>

        <p className="font-display text-sm font-bold tracking-tight text-volt">
          {levelTitle}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          {mission.title}
        </h1>

        <div className="mt-6 space-y-4">
          {mission.teach.map((block, i) => (
            <TeachBlock key={i} block={block} />
          ))}
        </div>

        {resolvedPrompt ? (
          <div className="mt-6 space-y-3">
            <PromptPanel
              text={resolvedPrompt}
              onCopy={() => copyText("prompt", resolvedPrompt)}
              copied={copiedKey === "prompt"}
            />
            <OpenClaudeLink />
          </div>
        ) : resolvedPrompts ? (
          <div className="mt-6 space-y-3">
            {resolvedPrompts.map((p) => (
              <PromptPanel
                key={p.key}
                label={p.key}
                text={p.text}
                onCopy={() => copyText(p.key, p.text)}
                copied={copiedKey === p.key}
              />
            ))}
            <OpenClaudeLink />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {mission.starterChips ? (
              <Chips
                intro="Need an idea? Tap one to copy it, or write your own."
                chips={mission.starterChips}
                onCopy={copyText}
                copiedKey={copiedKey}
              />
            ) : null}
            <OpenClaudeLink />
          </div>
        )}

        <div className="mt-8 space-y-5">
          {interleaved ? (
            <>
              <ProofField
                label={fields[0].label}
                value={values[fields[0].key]}
                onChange={(e) => setField(fields[0].key, e.target.value)}
                onBlur={handleBlur}
                minLength={fields[0].minLength}
              />
              <Chips
                intro="Now ask Claude to improve it."
                chips={mission.improvementChips}
                onCopy={copyText}
                copiedKey={copiedKey}
              />
              <ProofField
                label={fields[1].label}
                value={values[fields[1].key]}
                onChange={(e) => setField(fields[1].key, e.target.value)}
                onBlur={handleBlur}
                minLength={fields[1].minLength}
              />
            </>
          ) : (
            fields.map((f) => (
              <ProofField
                key={f.key}
                label={f.label}
                value={values[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                onBlur={handleBlur}
                minLength={f.minLength}
                kind={f.kind}
              />
            ))
          )}

          {mission.proof.mode === "compare" &&
          isProofComplete(mission.proof, values) ? (
            <div className="rounded-2xl border-2 border-ink bg-white p-5 sm:p-6">
              {mission.proof.revealHeading ? (
                <h2 className="font-display text-xl font-extrabold text-ink">
                  {mission.proof.revealHeading}
                </h2>
              ) : null}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.key}>
                    <p className="label">{f.label}</p>
                    <p className="whitespace-pre-wrap rounded-xl border-2 border-line bg-paper px-4 py-3 font-body text-[14px] leading-relaxed text-ink">
                      {values[f.key]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || saving}
          className="mt-8 w-full rounded-xl border-2 border-ink bg-volt px-6 py-4 font-display text-lg font-bold text-white shadow-lift transition
                     hover:bg-voltDeep focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-volt/40
                     active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>
    </main>
  );
}
