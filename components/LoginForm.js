"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, supabaseReady } from "@/lib/supabase/client";

function validate(v) {
  const e = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "That email doesn't look right.";
  if (v.password.length < 1) e.password = "Enter your password.";
  return e;
}

export default function LoginForm() {
  const router = useRouter();
  const supabase = useMemo(
    () => (supabaseReady ? createClient() : null),
    []
  );
  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [resendState, setResendState] = useState("idle");

  const errors = useMemo(() => validate(values), [values]);

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
    if (formError) setFormError("");
    if (showResend) setShowResend(false);
    setResendState("idle");
  }

  function blur(key) {
    setTouched((t) => ({ ...t, [key]: true }));
  }

  function showError(key) {
    return touched[key] && errors[key] ? errors[key] : null;
  }

  async function handleSubmit() {
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) {
      setFormError("Enter your email and password.");
      return;
    }
    if (!supabaseReady) {
      setFormError(
        "Supabase isn't configured yet. Add your keys to .env.local and restart the dev server."
      );
      return;
    }

    setSubmitting(true);
    setFormError("");
    setShowResend(false);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      setSubmitting(false);
      const message = error.message.toLowerCase();
      if (message.includes("email not confirmed")) {
        setFormError(
          "This account hasn't confirmed its email yet. Check your inbox, or resend the confirmation link below."
        );
        setShowResend(true);
      } else if (message.includes("invalid login credentials")) {
        setFormError("Wrong email or password. Check both and try again.");
      } else {
        setFormError(error.message);
      }
      return;
    }

    router.push("/journey");
    router.refresh();
  }

  async function handleResend() {
    if (!supabaseReady || !values.email.trim()) return;
    setResendState("sending");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: values.email.trim(),
    });
    setResendState(error ? "error" : "sent");
  }

  return (
    <div className="max-w-sm">
      <div className="space-y-5">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`field ${showError("email") ? "field-invalid" : ""}`}
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => blur("email")}
            placeholder="ananya@college.edu"
            autoComplete="email"
          />
          <FieldError message={showError("email")} />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`field ${showError("password") ? "field-invalid" : ""}`}
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
            onBlur={() => blur("password")}
            placeholder="Your password"
            autoComplete="current-password"
          />
          <FieldError message={showError("password")} />
        </div>
      </div>

      {formError ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border-2 border-[#E2445C] bg-[#E2445C]/8 px-4 py-3 text-sm font-medium text-[#B32A3E]"
        >
          {formError}
        </p>
      ) : null}

      {showResend ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendState === "sending"}
            className="font-body text-[13px] font-semibold text-volt underline underline-offset-2 hover:text-voltDeep disabled:opacity-60"
          >
            {resendState === "sending"
              ? "Sending…"
              : "Resend confirmation email"}
          </button>
          {resendState === "sent" ? (
            <p className="mt-1.5 font-body text-[13px] text-mint">
              Sent. Check your inbox.
            </p>
          ) : null}
          {resendState === "error" ? (
            <p className="mt-1.5 font-body text-[13px] text-[#B32A3E]">
              Couldn&rsquo;t resend. Try again in a moment.
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-7 w-full rounded-xl border-2 border-ink bg-volt px-6 py-4 font-display text-lg font-bold text-white shadow-lift transition
                   hover:bg-voltDeep focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-volt/40
                   active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Logging in…" : "Log in"}
      </button>

      <p className="mt-4 font-body text-[13px] text-inkSoft">
        New here?{" "}
        <Link
          href="/"
          className="font-semibold text-volt underline underline-offset-2 hover:text-voltDeep"
        >
          Create your player card
        </Link>
      </p>
    </div>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 font-body text-[13px] font-medium text-[#B32A3E]">
      {message}
    </p>
  );
}
