import { createClient, supabaseReady } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function JourneyPage() {
  if (!supabaseReady) {
    return (
      <main className="notebook grid min-h-screen place-items-center px-5 py-16">
        <p className="font-body text-[15px] text-ink">
          Supabase isn&rsquo;t configured yet.
        </p>
      </main>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="notebook grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-3xl border-2 border-ink bg-white p-8 shadow-card">
        <p className="font-display text-sm font-bold tracking-tight text-volt">
          LevelUp AI
        </p>
        <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink">
          You&rsquo;re signed in{user?.email ? `, ${user.email}` : ""}.
        </h1>
        <p className="mt-4 font-body text-[15px] leading-relaxed text-inkSoft">
          The journey map isn&rsquo;t built yet. This page is a placeholder so
          login has somewhere to land.
        </p>

        <form action={signOut} className="mt-7">
          <button
            type="submit"
            className="rounded-xl border-2 border-ink bg-white px-5 py-3 font-display text-base font-bold text-ink shadow-lift transition hover:bg-paper active:translate-y-0.5 active:shadow-none"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
