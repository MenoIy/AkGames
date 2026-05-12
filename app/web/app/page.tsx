async function getServerStatus() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  try {
    const res = await fetch(`${apiUrl}/api`, { cache: 'no-store' });
    const text = await res.text();
    return { ok: true, status: res.status, message: text };
  } catch {
    return { ok: false, status: 0, message: 'Could not reach server' };
  }
}

export default async function Home() {
  const server = await getServerStatus();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Server connection
        </h1>
        <div className="flex items-center gap-3">
          <span
            className={`h-3 w-3 rounded-full ${server.ok ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {server.ok ? `HTTP ${server.status} —` : 'Error —'} {server.message}
          </span>
        </div>
      </div>
    </main>
  );
}
