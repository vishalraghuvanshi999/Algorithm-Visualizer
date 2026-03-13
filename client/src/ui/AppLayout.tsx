import { NavLink, Outlet } from "react-router-dom";

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }: { isActive: boolean }) =>
        [
          "rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-white/10 text-white"
            : "text-white/80 hover:bg-white/10 hover:text-white",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-sm font-semibold shadow-lg shadow-fuchsia-500/20">
              AV
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Algorithm Visualizer</div>
              <div className="text-xs text-white/60">
                Sorting + Pathfinding (MERN)
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/" label="Home" />
            <NavItem to="/sorting" label="Sorting" />
            <NavItem to="/pathfinding" label="Pathfinding" />
            <NavItem to="/presets" label="Presets" />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-white/50">
          <div>Built for learning, tuned for visuals.</div>
          <div className="font-mono">
            {new Date().getFullYear()} • local dev
          </div>
        </div>
      </footer>
    </div>
  );
}

