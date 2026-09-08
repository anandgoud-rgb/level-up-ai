import { Suspense } from "react";
import Link from "next/link";

function Greeting({ name }) {
  return (
    <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
      {name ? `You're in, ${name}.` : "You're in."}
    </h1>
  );
}

export default function WelcomePage({ searchParams }) {
  const name = typeof searchParams?.name === "string" ? searchParams.name : "";

  return (
    <main className="notebook grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border-2 border-ink bg-white p-8 shadow-card">
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border-2 border-ink bg-marigold font-display text-2xl font-extrabold text-ink">
          1
        </div>

        <Suspense fallback={null}>
          <Greeting name={name} />
        </Suspense>

        <p className="mt-4 font-body text-[17px] leading-relaxed text-inkSoft">
          Your card is made and you&rsquo;re at Level 1. Check your email to
          confirm your address, then come back to start.
        </p>

        <Link
          href="/"
          className="mt-7 inline-block rounded-xl border-2 border-ink bg-white px-5 py-3 font-display text-base font-bold text-ink shadow-lift transition hover:bg-paper active:translate-y-0.5 active:shadow-none"
        >
          Back to signup
        </Link>
      </div>
    </main>
  );
}
