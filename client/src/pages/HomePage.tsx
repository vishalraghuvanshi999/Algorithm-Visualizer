import { Link } from "react-router-dom";

function Card({
  title,
  desc,
  to,
}: {
  title: string;
  desc: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 transition hover:bg-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="mt-1 text-sm text-white/70">{desc}</div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-white/80 transition group-hover:from-fuchsia-500/30 group-hover:to-indigo-500/30 group-hover:text-white">
          →
        </div>
      </div>
    </Link>
  );
}

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-indigo-500/10 to-transparent p-6 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Visualize algorithms in real-time
            </h1>
            <p className="max-w-2xl text-sm text-white/75">
              Smooth animations, step-by-step states, and saved presets (MongoDB)
              so you can replay scenarios.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/sorting"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-white/90"
            >
              Open Sorting
            </Link>
            <Link
              to="/pathfinding"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open Pathfinding
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card
          title="Sorting Visualizer"
          desc="Generate arrays, pick algorithm, animate swaps & comparisons."
          to="/sorting"
        />
        <Card
          title="Pathfinding Visualizer"
          desc="Draw walls, pick Dijkstra / A*, watch shortest path unfold."
          to="/pathfinding"
        />
        <Card
          title="Presets"
          desc="Save and load scenarios from the API (MongoDB)."
          to="/presets"
        />
      </section>
    </div>
  );
}

