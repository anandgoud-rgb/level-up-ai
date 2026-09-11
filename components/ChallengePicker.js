"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { selectChallenge } from "@/app/actions/builds";

function pageList(challenge) {
  return ["Home", challenge.discoveryName, challenge.detailName, ...challenge.extraPages].join(
    " · "
  );
}

export default function ChallengePicker({ challenges, existingChallengeId, nextMissionId }) {
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handlePick(challenge) {
    if (challenge.id === existingChallengeId) return;
    if (!existingChallengeId) {
      startTransition(() => {
        selectChallenge(challenge.id);
      });
      return;
    }
    setPendingChallenge(challenge);
  }

  function confirmSwitch() {
    const challenge = pendingChallenge;
    setPendingChallenge(null);
    startTransition(() => {
      selectChallenge(challenge.id);
    });
  }

  return (
    <div className="mt-10">
      {pendingChallenge ? (
        <div className="mb-6 rounded-2xl border-2 border-marigold bg-marigold/10 p-5">
          <p className="font-body text-[15px] text-ink">
            Switch to <strong>{pendingChallenge.name}</strong>? This clears your
            current answers so you start clean.
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={confirmSwitch}
              disabled={isPending}
              className="rounded-xl border-2 border-ink bg-volt px-4 py-2 font-display text-sm font-bold text-white shadow-lift transition hover:bg-voltDeep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Switching…" : "Confirm switch"}
            </button>
            <button
              type="button"
              onClick={() => setPendingChallenge(null)}
              className="rounded-xl border-2 border-ink bg-white px-4 py-2 font-display text-sm font-bold text-ink transition hover:bg-paper"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => {
          const isMine = challenge.id === existingChallengeId;
          return (
            <div
              key={challenge.id}
              className={`rounded-3xl border-2 p-6 ${
                isMine ? "border-ink bg-white shadow-card" : "border-line bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-3xl">{challenge.icon}</p>
                {isMine ? (
                  <span className="rounded-full border-2 border-ink bg-mint px-3 py-1 font-body text-[12px] font-semibold text-ink">
                    Your pick
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 font-display text-lg font-extrabold text-ink">
                {challenge.name}
              </h3>
              <p className="mt-1.5 font-body text-[14px] leading-relaxed text-inkSoft">
                {challenge.tagline}
              </p>
              <p className="mt-3 font-body text-[12px] leading-relaxed text-inkSoft/70">
                {pageList(challenge)}
              </p>

              {isMine ? (
                <Link
                  href={`/journey/level-1/${nextMissionId}`}
                  className="mt-5 inline-block rounded-xl border-2 border-ink bg-volt px-4 py-2 font-display text-sm font-bold text-white shadow-lift transition hover:bg-voltDeep active:translate-y-0.5 active:shadow-none"
                >
                  Continue
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePick(challenge)}
                  disabled={isPending}
                  className="mt-5 rounded-xl border-2 border-ink bg-white px-4 py-2 font-display text-sm font-bold text-ink shadow-lift transition hover:bg-paper active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {existingChallengeId ? "Switch to this" : "Choose this"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
