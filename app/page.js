import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <main className="notebook min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-10 sm:mb-14">
          <p className="font-display text-sm font-bold tracking-tight text-volt">
            LevelUp AI
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Six questions and you&rsquo;re in.
          </h1>
          <p className="mt-4 max-w-md font-body text-[17px] leading-relaxed text-inkSoft">
            You don&rsquo;t need any coding background. Fill this in, and you
            start at Level 1 with everyone else.
          </p>
        </header>

        <SignupForm />
      </div>
    </main>
  );
}
