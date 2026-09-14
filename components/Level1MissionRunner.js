"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, supabaseReady } from "@/lib/supabase/client";
import { resolvePrompt } from "@/lib/prompt";
import { BUILD_CONSTRAINTS } from "@/content/level-1/missions";

function TeachBlock({ block }) {
  if (block.type === "text") {
    return (
      <p className="font-body text-[15px] leading-relaxed text-inkSoft">
        {block.text}
      </p>
    );
  }
  // callout and compare read the same: a quiet note, not an instruction.
  return (
    <div className="rounded-2xl border-2 border-ink bg-ink/[0.03] px-5 py-4">
      <p className="font-body text-[14px] leading-relaxed text-ink">{block.text}</p>
    </div>
  );
}

function PromptPanel({ text, onCopy, copied }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-ink px-5 py-4">
      <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-paper">
        {text}
      </p>
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

function TextInput({ label, value, onChange, onBlur, kind = "line" }) {
  return (
    <div>
      <label className="label">{label}</label>
      {kind === "textarea" ? (
        <textarea
          rows={8}
          className="field resize-y"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
        />
      ) : (
        <input className="field" value={value} onChange={onChange} onBlur={onBlur} />
      )}
    </div>
  );
}

function SingleChips({ label, value, options, onPick }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPick(option)}
              className={`rounded-full border-2 px-3 py-1.5 font-body text-[13px] font-semibold transition ${
                selected
                  ? "border-ink bg-volt text-white"
                  : "border-ink bg-white text-ink hover:bg-paper"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChipsOrCustom({ label, value, options, onChange, onBlur }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mb-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border-2 px-3 py-1.5 text-left font-body text-[13px] font-semibold transition ${
              value === option
                ? "border-ink bg-volt text-white"
                : "border-ink bg-white text-ink hover:bg-paper"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <input
        className="field"
        value={value}
        placeholder="Or write your own"
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
}

function isEmpty(v) {
  return !v || !String(v).trim();
}

export default function Level1MissionRunner({
  userId,
  challenge,
  student,
  buildAnswers,
  mission,
  missionIndex,
  missionsTotal,
  savedArtifact,
  savedStatus,
  nextMissionId,
  previousMissionId,
  levelXp,
  completionMessage,
}) {
  const router = useRouter();
  const supabase = useMemo(() => (supabaseReady ? createClient() : null), []);
  const context = { challenge, student, build: buildAnswers };
  const [reveal, setReveal] = useState(false);
  const [revealVisible, setRevealVisible] = useState(false);

  const [answers, setAnswers] = useState(buildAnswers);
  const [proofValues, setProofValues] = useState(() => {
    const v = {};
    mission.proof.fields.forEach((f) => {
      v[f.key] = savedArtifact?.[f.key] || "";
    });
    return v;
  });
  const [status, setStatus] = useState(savedStatus === "done" ? "done" : "in_progress");
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState(false);

  const checklistKey = mission.checklist ? `checklist_${mission.id}` : null;
  const checklistState = checklistKey ? answers[checklistKey] || {} : {};

  function setAnswer(key, value) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  async function copyText(key, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
    } catch {
      // Clipboard blocked — the student can select and copy manually.
    }
  }

  async function persistAnswers(nextAnswers, lock) {
    if (!supabaseReady || !supabase) return;
    try {
      const payload = {
        user_id: userId,
        challenge_id: challenge.id,
        answers: nextAnswers,
        updated_at: new Date().toISOString(),
      };
      if (lock) payload.locked_at = new Date().toISOString();
      await supabase.from("builds").upsert(payload, { onConflict: "user_id" });
    } catch {
      // Save failed silently — the next blur or Continue click retries.
    }
  }

  async function persistProgress(nextStatus, xp, artifact) {
    if (!supabaseReady || !supabase) return;
    try {
      await supabase.from("mission_progress").upsert(
        {
          user_id: userId,
          level_id: "level-1",
          mission_id: mission.id,
          status: nextStatus,
          artifact,
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

  function handleAnswerBlur() {
    persistAnswers(answers, false);
  }

  function handleChecklistToggle(itemKey) {
    const next = { ...checklistState, [itemKey]: !checklistState[itemKey] };
    const nextAnswers = { ...answers, [checklistKey]: next };
    setAnswers(nextAnswers);
    persistAnswers(nextAnswers, false);
  }

  function setProof(key, value) {
    setProofValues((v) => ({ ...v, [key]: value }));
  }

  function handleProofBlur() {
    persistProgress(status, status === "done" ? mission.xp : 0, proofValues);
  }

  const inputsReady = (mission.inputs ?? []).every((f) => !isEmpty(answers[f.key]));
  const postInputsReady = (mission.postInputs ?? []).every((f) => !isEmpty(answers[f.key]));
  const checklistReady = !mission.checklist || mission.checklist.every((c) => checklistState[c.key]);
  const proofReady = mission.proof.fields.every(
    (f) => (proofValues[f.key] || "").trim().length >= (f.minLength || 0)
  );
  const canContinue = inputsReady && postInputsReady && checklistReady && proofReady;

  async function handleContinue() {
    setSaving(true);
    setStatus("done");
    const shouldLock = mission.id === "build-the-foundation";
    await Promise.all([
      persistAnswers(answers, shouldLock),
      persistProgress("done", mission.xp, proofValues),
    ]);
    setSaving(false);

    if (nextMissionId) {
      router.push(`/journey/level-1/${nextMissionId}`);
      return;
    }

    // Last mission in the level — hold on a badge reveal before routing back.
    setReveal(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setRevealVisible(true)));
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => router.push("/journey"), reduceMotion ? 50 : 1800);
  }

  async function handleBack() {
    setSaving(true);
    await Promise.all([
      persistAnswers(answers, false),
      persistProgress(status, status === "done" ? mission.xp : 0, proofValues),
    ]);
    setSaving(false);
    router.push(`/journey/level-1/${previousMissionId}`);
  }

  async function handleResetLevel() {
    if (!supabaseReady || !supabase) return;
    setResetting(true);
    setResetError(false);
    try {
      const [{ error: progressError }, { error: buildError }] = await Promise.all([
        supabase
          .from("mission_progress")
          .delete()
          .eq("user_id", userId)
          .eq("level_id", "level-1"),
        supabase
          .from("builds")
          .update({ answers: {}, locked_at: null, updated_at: new Date().toISOString() })
          .eq("user_id", userId),
      ]);
      if (progressError || buildError) throw progressError || buildError;
      router.push("/journey");
    } catch {
      setResetting(false);
      setResetError(true);
    }
  }

  function livePreview(template) {
    return template.replace(
      /{{\s*(challenge|student|build)\.([a-zA-Z0-9_]+)\s*}}/g,
      (match, ns, key) => {
        const sources = { challenge, student, build: answers };
        const value = sources[ns]?.[key];
        if (value === undefined || value === null || value === "") return "___";
        return Array.isArray(value) ? value.join(", ") : String(value);
      }
    );
  }

  let title = mission.title;
  try {
    title = resolvePrompt(mission.title, context);
  } catch {
    title = livePreview(mission.title);
  }

  const resolvedPrompt = mission.prompt
    ? livePreview(mission.prompt.template) +
      (mission.prompt.appendConstraints ? `\n\n${BUILD_CONSTRAINTS}` : "")
    : null;

  const fields = mission.proof.fields;

  return (
    <main className="notebook min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-6 flex items-start justify-between gap-3">
          <Link
            href="/journey"
            className="font-body text-[13px] font-semibold text-inkSoft hover:text-ink"
          >
            &larr; Journey
          </Link>
          <div className="flex flex-col items-end gap-1">
            <span className="font-body text-[13px] font-medium text-inkSoft">
              Mission {missionIndex + 1} of {missionsTotal}
            </span>
            <button
              type="button"
              onClick={() => setConfirmingReset(true)}
              disabled={saving}
              className="font-body text-[12px] font-medium text-inkSoft underline decoration-line underline-offset-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset level
            </button>
          </div>
        </div>

        <p className="font-display text-sm font-bold tracking-tight text-volt">
          {challenge.icon} {challenge.name}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          {title}
        </h1>

        <div className="mt-6 space-y-4">
          {mission.teach.map((block, i) => (
            <TeachBlock key={i} block={block} />
          ))}
        </div>

        {mission.inputs ? (
          <div className="mt-6 space-y-5 rounded-2xl border-2 border-line bg-white p-5">
            {mission.inputs.map((f) => {
              if (f.kind === "chips-single") {
                return (
                  <SingleChips
                    key={f.key}
                    label={f.label}
                    value={answers[f.key] || ""}
                    options={f.options}
                    onPick={(v) => {
                      setAnswer(f.key, v);
                      persistAnswers({ ...answers, [f.key]: v }, false);
                    }}
                  />
                );
              }
              if (f.kind === "chips-or-custom") {
                const options = f.options ?? (f.optionsFrom ? challenge[f.optionsFrom] : []);
                return (
                  <ChipsOrCustom
                    key={f.key}
                    label={f.label}
                    value={answers[f.key] || ""}
                    options={options}
                    onChange={(v) => setAnswer(f.key, v)}
                    onBlur={handleAnswerBlur}
                  />
                );
              }
              return (
                <TextInput
                  key={f.key}
                  label={f.label}
                  value={answers[f.key] || ""}
                  onChange={(e) => setAnswer(f.key, e.target.value)}
                  onBlur={handleAnswerBlur}
                />
              );
            })}
          </div>
        ) : null}

        {resolvedPrompt ? (
          <div className="mt-6 space-y-3">
            <PromptPanel
              text={resolvedPrompt}
              onCopy={() => copyText("prompt", resolvedPrompt)}
              copied={copiedKey === "prompt"}
            />
            <OpenClaudeLink />
          </div>
        ) : null}

        {mission.postInputs ? (
          <div className="mt-6 space-y-5 rounded-2xl border-2 border-line bg-white p-5">
            {mission.postInputs.map((f) => (
              <TextInput
                key={f.key}
                label={f.label}
                value={answers[f.key] || ""}
                onChange={(e) => setAnswer(f.key, e.target.value)}
                onBlur={handleAnswerBlur}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-8 space-y-5">
          {fields.map((f) => (
            <TextInput
              key={f.key}
              label={f.label}
              value={proofValues[f.key]}
              onChange={(e) => setProof(f.key, e.target.value)}
              onBlur={handleProofBlur}
              kind={f.kind === "line" ? "line" : "textarea"}
            />
          ))}
        </div>

        {mission.checklist ? (
          <div className="mt-6 space-y-3 rounded-2xl border-2 border-line bg-white p-5">
            <p className="label mb-0">Before you continue</p>
            {mission.checklist.map((item) => {
              let label = item.label;
              try {
                label = resolvePrompt(item.label, context);
              } catch {
                // leave unresolved label as-is; shouldn't happen at this mission
              }
              return (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-center gap-3 font-body text-[14px] text-ink"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checklistState[item.key])}
                    onChange={() => handleChecklistToggle(item.key)}
                    className="h-5 w-5 rounded border-2 border-ink accent-volt"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          {previousMissionId ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="w-full rounded-xl border-2 border-line bg-white px-6 py-4 font-display text-lg font-bold text-ink shadow-lift transition
                         hover:bg-paper focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-volt/40
                         active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:mr-auto sm:w-auto"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue || saving}
            className="w-full rounded-xl border-2 border-ink bg-volt px-6 py-4 font-display text-lg font-bold text-white shadow-lift transition
                       hover:bg-voltDeep focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-volt/40
                       active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? "Saving…" : "Continue"}
          </button>
        </div>
      </div>

      {reveal ? (
        <div
          className={`fixed inset-0 z-50 grid place-items-center bg-ink/90 px-5 transition-opacity duration-300 ${
            revealVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`w-full max-w-sm rounded-3xl border-2 border-ink bg-white p-8 text-center shadow-card transition-all duration-300 ${
              revealVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <p className="text-4xl">{challenge.icon}</p>
            {challenge.badge ? (
              <p className="mt-5 inline-block rounded-full border-2 border-ink bg-mint px-4 py-1.5 font-body text-sm font-semibold text-ink">
                {challenge.badge.name}
              </p>
            ) : null}
            {levelXp ? (
              <p className="mt-3 font-display text-2xl font-extrabold text-ink">
                +{levelXp} XP
              </p>
            ) : null}
            {completionMessage ? (
              <p className="mt-4 font-body text-[15px] leading-relaxed text-inkSoft">
                {completionMessage}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {confirmingReset ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/90 px-5">
          <div className="w-full max-w-sm rounded-3xl border-2 border-ink bg-white p-8 shadow-card">
            <h2 className="font-display text-xl font-extrabold text-ink">
              Reset this level?
            </h2>
            <p className="mt-3 font-body text-[14px] leading-relaxed text-inkSoft">
              This clears every mission in Level 1 — your answers, progress, and XP
              from it. You&rsquo;ll keep the same challenge and start it over from
              mission 1. This can&rsquo;t be undone.
            </p>
            {resetError ? (
              <p className="mt-3 font-body text-[13px] font-semibold text-ink">
                Couldn&rsquo;t reset the level. Try again.
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                disabled={resetting}
                className="w-full rounded-xl border-2 border-line bg-white px-5 py-3 font-display text-sm font-bold text-ink shadow-lift transition
                           hover:bg-paper focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-volt/40
                           active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetLevel}
                disabled={resetting}
                className="w-full rounded-xl border-2 border-ink bg-marigold px-5 py-3 font-display text-sm font-bold text-ink shadow-lift transition
                           hover:brightness-95 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-volt/40
                           active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {resetting ? "Resetting…" : "Reset level"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
