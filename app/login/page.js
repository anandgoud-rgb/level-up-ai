import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="notebook min-h-screen">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-10 sm:mb-14">
          <p className="font-display text-sm font-bold tracking-tight text-volt">
            LevelUp AI
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl">
            Welcome back.
          </h1>
          <p className="mt-4 max-w-md font-body text-[17px] leading-relaxed text-inkSoft">
            Log in to pick up where you left off.
          </p>
        </header>

        <LoginForm />
      </div>
    </main>
  );
}
