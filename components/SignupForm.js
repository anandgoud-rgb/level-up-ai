"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, supabaseReady } from "@/lib/supabaseClient";
import PlayerCard from "./PlayerCard";

const PROGRAMS = ["Science", "Commerce", "Arts"];
const YEARS = Array.from({ length: 11 }, (_, i) => String(2020 + i));

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  college: "",
  program: "",
  passingYear: "",
  password: "",
};

function validate(v) {
  const e = {};
  if (v.fullName.trim().length < 2) e.fullName = "Tell us your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()))
    e.email = "That email doesn't look right.";
  if (!/^\d{10}$/.test(v.phone.replace(/\D/g, "")))
    e.phone = "Enter a 10-digit phone number.";
  if (v.college.trim().length < 2) e.college = "Which college do you go to?";
  if (!PROGRAMS.includes(v.program)) e.program = "Pick your program.";
  if (!YEARS.includes(v.passingYear)) e.passingYear = "Pick your passing year.";
  if (v.password.length < 8) e.password = "Use at least 8 characters.";
  return e;
}

export default function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const errors = useMemo(() => validate(values), [values]);

  const filled = useMemo(
    () =>
      ["fullName", "email", "phone", "college", "program", "passingYear"].filter(
        (k) => !errors[k]
      ).length,
    [errors]
  );

  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
    if (formError) setFormError("");
  }

  function blur(key) {
    setTouched((t) => ({ ...t, [key]: true }));
  }

  function showError(key) {
    return touched[key] && errors[key] ? errors[key] : null;
  }

  async function handleSubmit() {
    setTouched(
      Object.keys(EMPTY).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    if (Object.keys(errors).length > 0) {
      setFormError("A few fields still need fixing.");
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

    // The details ride along with the signup call as user metadata. A Postgres
    // trigger reads them and writes the profiles row. See supabase/schema.sql.
    const { error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        data: {
          full_name: values.fullName.trim(),
          phone: values.phone.replace(/\D/g, ""),
          college: values.college.trim(),
          program: values.program,
          passing_year: Number(values.passingYear),
        },
      },
    });

    if (error) {
      setSubmitting(false);
      setFormError(error.message);
      return;
    }

    router.push(
      `/welcome?name=${encodeURIComponent(values.fullName.trim().split(/\s+/)[0])}`
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
      <div>
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              className={`field ${showError("fullName") ? "field-invalid" : ""}`}
              value={values.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              onBlur={() => blur("fullName")}
              placeholder="Ananya Sharma"
              autoComplete="name"
            />
            <FieldError message={showError("fullName")} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
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
              <label className="label" htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                className={`field ${showError("phone") ? "field-invalid" : ""}`}
                value={values.phone}
                onChange={(e) => set("phone", e.target.value)}
                onBlur={() => blur("phone")}
                placeholder="9876543210"
                autoComplete="tel"
              />
              <FieldError message={showError("phone")} />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="college">
              College
            </label>
            <input
              id="college"
              className={`field ${showError("college") ? "field-invalid" : ""}`}
              value={values.college}
              onChange={(e) => set("college", e.target.value)}
              onBlur={() => blur("college")}
              placeholder="Hansraj College, Delhi University"
            />
            <FieldError message={showError("college")} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="program">
                Program
              </label>
              <select
                id="program"
                className={`field ${showError("program") ? "field-invalid" : ""}`}
                value={values.program}
                onChange={(e) => set("program", e.target.value)}
                onBlur={() => blur("program")}
              >
                <option value="">Choose one</option>
                {PROGRAMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <FieldError message={showError("program")} />
            </div>

            <div>
              <label className="label" htmlFor="passingYear">
                Passing year
              </label>
              <select
                id="passingYear"
                className={`field ${
                  showError("passingYear") ? "field-invalid" : ""
                }`}
                value={values.passingYear}
                onChange={(e) => set("passingYear", e.target.value)}
                onBlur={() => blur("passingYear")}
              >
                <option value="">Choose one</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <FieldError message={showError("passingYear")} />
            </div>
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
              placeholder="At least 8 characters"
              autoComplete="new-password"
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

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-7 w-full rounded-xl border-2 border-ink bg-volt px-6 py-4 font-display text-lg font-bold text-white shadow-lift transition
                     hover:bg-voltDeep focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-volt/40
                     active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? "Creating your card…" : "Create my card"}
        </button>

        <p className="mt-4 font-body text-[13px] text-inkSoft">
          Already signed up? Ask your instructor for the login link.
        </p>
      </div>

      <div className="-order-1 lg:order-none lg:sticky lg:top-10 lg:self-start">
        <PlayerCard values={values} filled={filled} total={6} />
        <p className="mt-4 px-1 font-body text-[13px] leading-relaxed text-inkSoft">
          This is your player card. It updates as you fill the form, and it's
          how the rest of the class will see you.
        </p>
      </div>
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
