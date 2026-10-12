import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Shield,
  Trophy,
  Swords,
  Search,
  Bell,
  ChevronRight,
  Activity,
  Radio,
  ArrowUpRight,
  Crosshair,
  Menu,
  X,
  Database,
  Crown,
  CalendarDays,
} from "lucide-react";

import Players from "./Players";
import Squads from "./Squads";
import Tournaments from "./Tournaments";
import Matches from "./Matches";

const API = "http://127.0.0.1:5000/api";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "players", label: "Players", icon: Users },
  { id: "squads", label: "Squads", icon: Shield },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "matches", label: "Matches", icon: Swords },
];

const pageTitles = {
  dashboard: "Command Center",
  players: "Player Management",
  squads: "Squad Management",
  tournaments: "Tournament Management",
  matches: "Match Center",
};

function App() {
  const [page, setPage] = useState("dashboard");
  const [analytics, setAnalytics] = useState({});
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const requests = await Promise.allSettled([
        fetch(`${API}/analytics`).then((response) => {
          if (!response.ok) throw new Error("Analytics request failed");
          return response.json();
        }),
        fetch(`${API}/matches`).then((response) => {
          if (!response.ok) throw new Error("Matches request failed");
          return response.json();
        }),
        fetch(`${API}/players`).then((response) => {
          if (!response.ok) throw new Error("Players request failed");
          return response.json();
        }),
      ]);

      if (!active) return;

      if (requests[0].status === "fulfilled") {
        setAnalytics(requests[0].value || {});
      } else {
        console.error("Analytics error:", requests[0].reason);
      }

      if (requests[1].status === "fulfilled") {
        const data = requests[1].value;
        setMatches(Array.isArray(data) ? data : data.matches || []);
      } else {
        console.error("Matches error:", requests[1].reason);
      }

      if (requests[2].status === "fulfilled") {
        const data = requests[2].value;
        setPlayers(Array.isArray(data) ? data : data.players || []);
      } else {
        console.error("Players error:", requests[2].reason);
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  function openPage(nextPage) {
    setPage(nextPage);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-white">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col border-r border-white/[0.07] bg-[#0b0f15] lg:flex">
        <button
          onClick={() => openPage("dashboard")}
          className="flex h-[90px] items-center gap-3 border-b border-white/[0.07] px-5 text-left"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e8bd63]/30 bg-[#e8bd63]/10">
            <Crosshair size={29} className="text-[#f2cb79]" />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight">
              CODM <span className="text-[#edc36c]">ARENA</span>
            </h1>
            <p className="mt-1 text-[9px] uppercase tracking-[1.5px] text-slate-500">
              Tournament Management
            </p>
          </div>
        </button>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-600">
            Main Menu
          </p>

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => openPage(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                    active
                      ? "border-[#d6b46c]/30 bg-gradient-to-r from-[#c59c48]/20 to-transparent text-[#f2cc79] shadow-[inset_3px_0_0_#e9c36c]"
                      : "border-transparent text-slate-400 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.8} />
                  <span className="font-medium">{item.label}</span>

                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#f0ca79]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#171c24] to-[#0b0e13] p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">
                System Status
              </span>
            </div>

            <p className="text-lg font-bold">Arena Online</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Manage your competitive CODM ecosystem from one place.
            </p>

            <div className="my-4 h-px bg-white/[0.08]" />

            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <Database size={13} />
              CODM ARENA · 2026
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="min-h-screen lg:ml-[250px]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-white/[0.07] bg-[#080b10]/95 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-lg border border-white/10 p-2 text-slate-300 lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="relative w-full max-w-[490px]">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search players, squads, tournaments..."
                className="w-full rounded-xl border border-white/[0.09] bg-[#11161e] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-[#c6a55f]/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button
              className="relative hidden rounded-xl border border-white/[0.08] bg-[#11161e] p-3 text-slate-400 transition hover:text-white sm:block"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e9c36c]" />
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Administrator</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Tournament Organizer
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d8b565]/40 bg-[#c49a48]/10">
              <Crown size={19} className="text-[#edc875]" />
            </div>
          </div>
        </header>

        {/* MOBILE SIDEBAR */}
        {mobileMenu && (
          <div
            className="fixed inset-0 z-50 bg-black/70 lg:hidden"
            onClick={() => setMobileMenu(false)}
          >
            <div
              className="h-full w-[280px] border-r border-white/10 bg-[#0b0f15] p-5"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="text-lg font-black">
                  CODM <span className="text-[#e9c36c]">ARENA</span>
                </div>

                <button
                  onClick={() => setMobileMenu(false)}
                  aria-label="Close navigation"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => openPage(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${
                        page === item.id
                          ? "bg-[#d8b565]/10 text-[#e9c36c]"
                          : "text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      <Icon size={19} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PAGE CONTENT */}
        <main className="mx-auto max-w-[1700px] p-4 pb-10 sm:p-6 lg:p-8">
          {page === "dashboard" ? (
            <Dashboard
              analytics={analytics}
              matches={matches}
              players={players}
              loading={loading}
              search={search}
              openPage={openPage}
            />
          ) : (
            <div>
              <div className="mb-7">
                <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#d9b66a]">
                  CODM ARENA / MANAGEMENT
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  {pageTitles[page]}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Manage your competitive CODM ecosystem.
                </p>
              </div>

              {page === "players" && <Players />}
              {page === "squads" && <Squads />}
              {page === "tournaments" && <Tournaments />}
              {page === "matches" && <Matches />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ==================================================
   DASHBOARD
================================================== */

function Dashboard({
  analytics,
  matches,
  players,
  loading,
  search,
  openPage,
}) {
  const totalPlayers = analytics.total_players ?? players.length;
  const totalClans = analytics.total_clans ?? 0;
  const totalSquads = analytics.total_squads ?? 0;
  const totalTournaments = analytics.total_tournaments ?? 0;
  const totalMatches = analytics.total_matches ?? matches.length;

  const stats = [
    {
      title: "Registered Players",
      value: totalPlayers,
      icon: Users,
      note: "Player database",
    },
    {
      title: "Active Clans",
      value: totalClans,
      icon: Shield,
      note: "Competitive clans",
    },
    {
      title: "Competitive Squads",
      value: totalSquads,
      icon: Users,
      note: "Registered squads",
    },
    {
      title: "Tournaments",
      value: totalTournaments,
      icon: Trophy,
      note: "Tournament records",
    },
    {
      title: "Matches Recorded",
      value: totalMatches,
      icon: Swords,
      note: "Match database",
    },
  ];

  const term = search.trim().toLowerCase();

  const filteredPlayers = players
    .filter(
      (player) =>
        String(player.ign || "").toLowerCase().includes(term) ||
        String(player.mp_rank || "").toLowerCase().includes(term)
    )
    .slice(0, 5);

  const filteredMatches = matches
    .filter(
      (match) =>
        String(match.map_name || match.map || "")
          .toLowerCase()
          .includes(term) ||
        String(match.game_mode || match.mode || "")
          .toLowerCase()
          .includes(term)
    )
    .slice(0, 3);

  const topPlayer = analytics.top_player;

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* WELCOME */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#e9c36c]" />
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#d7b66e]">
              Competitive Operations Center
            </p>
          </div>

          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Command <span className="text-[#e9c36c]">Center.</span>
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Monitor players, squads, tournaments and match performance.
          </p>
        </div>

        <button
          onClick={() => openPage("tournaments")}
          className="flex items-center justify-center gap-3 rounded-xl bg-[#e6c16e] px-5 py-3 text-sm font-bold text-[#17130b] transition hover:bg-[#f3d48c]"
        >
          <Trophy size={17} />
          Manage Tournaments
          <ChevronRight size={17} />
        </button>
      </div>

      {/* CHAMPIONSHIP BANNER */}
      <section className="relative isolate min-h-[310px] overflow-hidden rounded-2xl border border-white/10 bg-[#111820] sm:min-h-[330px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1800&q=85')",
          }}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#070a0e] via-[#070a0e]/90 to-[#070a0e]/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#080b10] via-transparent to-black/10" />

        <div className="grid min-h-[310px] items-center gap-6 p-6 sm:min-h-[330px] sm:p-9 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                <Radio size={12} />
                Arena Spotlight
              </span>

              <span className="text-xs text-slate-400">SEASON 2026</span>
            </div>

            <p className="text-xs font-bold uppercase tracking-[4px] text-slate-300">
              Welcome to
            </p>

            <h1 className="mt-2 text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
              CODM <span className="text-[#efca79]">ARENA</span>
            </h1>

            <h3 className="mt-4 text-lg font-bold uppercase tracking-wide sm:text-2xl">
              Championship 2026
            </h3>

            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
              Build competitive squads, organize tournaments, manage match
              results and track player performance.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => openPage("tournaments")}
                className="rounded-lg bg-[#e6c16e] px-5 py-3 text-sm font-bold text-[#17130b] transition hover:bg-[#f3d48c]"
              >
                Explore Tournaments →
              </button>

              <button
                onClick={() => openPage("players")}
                className="rounded-lg border border-white/20 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Manage Players
              </button>
            </div>
          </div>

          {/* MATCH INSIGHTS */}
          <div className="hidden w-[215px] rounded-2xl border border-white/10 bg-black/50 p-5 backdrop-blur-md lg:block">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
                Match Insights
              </p>
              <Activity size={15} className="text-emerald-400" />
            </div>

            <div className="my-5 flex items-center justify-between">
              <div className="text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#e5bd66]/30 bg-[#d4aa50]/10">
                  <Shield size={27} className="text-[#efca79]" />
                </div>
                <p className="mt-2 text-xs font-bold">GODL</p>
                <p className="text-[10px] text-slate-500">Esports</p>
              </div>

              <span className="text-xs font-black text-[#e9c36c]">VS</span>

              <div className="text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <Shield size={27} className="text-slate-300" />
                </div>
                <p className="mt-2 text-xs font-bold">WOLVES</p>
                <p className="text-[10px] text-slate-500">Esports</p>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">API Status</span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Arena Statistics</h3>
            <p className="mt-1 text-xs text-slate-500">
              Overview of your registered records
            </p>
          </div>

          <span className="text-[10px] uppercase tracking-widest text-slate-600">
            Live Database
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e131b] p-4 transition hover:border-[#d7b66e]/30 sm:p-5"
              >
                <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#d8b565]/[0.04] blur-2xl" />

                <div className="relative flex items-start justify-between gap-2">
                  <p className="text-xs leading-5 text-slate-400">
                    {stat.title}
                  </p>
                  <Icon
                    size={19}
                    strokeWidth={1.7}
                    className="text-[#d9b66e]"
                  />
                </div>

                <p className="relative mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  {loading ? (
                    <span className="text-xl text-slate-600">...</span>
                  ) : (
                    stat.value
                  )}
                </p>

                <p className="relative mt-2 text-[10px] text-slate-600">
                  {stat.note}
                </p>

                <div className="mt-4 h-[2px] w-full bg-white/[0.05]">
                  <div className="h-full w-2/3 bg-[#d8b565]/70" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MATCHES AND PLAYER OVERVIEW */}
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* RECENT MATCHES */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1219]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <h3 className="font-bold">Recent Matches</h3>
              <p className="mt-1 text-xs text-slate-500">
                Recorded competitive match data
              </p>
            </div>

            <button
              onClick={() => openPage("matches")}
              className="flex items-center gap-1 text-xs font-semibold text-[#e9c36c] transition hover:text-white"
            >
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          {filteredMatches.length > 0 ? (
            <div className="divide-y divide-white/[0.06]">
              {filteredMatches.map((match, index) => (
                <MatchRow
                  key={match.match_id ?? match.id ?? index}
                  match={match}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Swords size={28} className="mx-auto text-slate-600" />

              <p className="mt-3 text-sm font-semibold text-slate-300">
                {loading ? "Loading matches..." : "No match records found"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {loading
                  ? "Fetching data from your backend."
                  : "Your recorded matches will appear here."}
              </p>

              {!loading && (
                <button
                  onClick={() => openPage("matches")}
                  className="mt-4 text-xs font-semibold text-[#e9c36c]"
                >
                  Open Match Center →
                </button>
              )}
            </div>
          )}
        </section>

        {/* PLAYER OVERVIEW — NO LEADERBOARD */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1219]">
          <div className="border-b border-white/[0.07] px-5 py-4">
            <h3 className="font-bold">Player Overview</h3>
            <p className="mt-1 text-xs text-slate-500">
              Registered competitors
            </p>
          </div>

          {topPlayer && (
            <div className="m-4 rounded-xl border border-[#d8b565]/20 bg-gradient-to-r from-[#d8b565]/10 to-transparent p-4">
              <p className="text-[10px] font-bold uppercase tracking-[2px] text-[#e9c36c]">
                Top Performer
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{topPlayer.ign || "Top Player"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Leading competitor
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-[#e9c36c]">
                    {topPlayer.kd_ratio ?? "—"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    K/D Ratio
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 pb-4">
            <div className="mb-2 grid grid-cols-[1fr_auto] gap-3 px-2 text-[10px] uppercase tracking-wider text-slate-600">
              <span>Player Identity</span>
              <span>MP Rank</span>
            </div>

            {filteredPlayers.length > 0 ? (
              <div className="space-y-1">
                {filteredPlayers.map((player, index) => (
                  <div
                    key={player.player_id ?? player.user_id ?? index}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition hover:bg-white/[0.035]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-5 text-xs font-bold text-slate-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#171d27] text-sm font-bold text-[#e9c36c]">
                        {String(player.ign || "P").charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {player.ign || "Unknown Player"}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {player.preferred_role ||
                            player.role ||
                            "Competitor"}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10px] text-slate-400">
                      {player.mp_rank || "Unranked"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                {loading ? "Loading players..." : "No player records found."}
              </div>
            )}

            <button
              onClick={() => openPage("players")}
              className="mt-3 w-full rounded-lg border border-white/[0.08] py-3 text-xs font-semibold text-slate-400 transition hover:border-[#d8b565]/30 hover:text-[#e9c36c]"
            >
              Open Player Management →
            </button>
          </div>
        </section>
      </div>

      {/* QUICK MANAGEMENT CARDS */}
      <div className="grid gap-5 md:grid-cols-2">
        <ManagementCard
          icon={Shield}
          title="Squad Operations"
          description="Manage competitive squads, review team membership and organize your clan structure."
          button="Manage Squads"
          onClick={() => openPage("squads")}
        />

        <ManagementCard
          icon={CalendarDays}
          title="Tournament Operations"
          description="Review tournament records and manage competitive events stored in your database."
          button="Manage Tournaments"
          onClick={() => openPage("tournaments")}
        />
      </div>

      <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-5 text-[10px] text-slate-600 sm:flex-row">
        <p>CODM ARENA · TOURNAMENT & PLAYER MANAGEMENT SYSTEM</p>
        <p>COMPETE · CONNECT · CLIMB</p>
      </footer>
    </div>
  );
}

/* ==================================================
   MATCH ROW
================================================== */

function MatchRow({ match }) {
  const map =
    match.map_name || match.map || match.map_title || "CODM Map";

  const mode =
    match.game_mode || match.mode || match.mode_name || "Match";

  const status = match.status || "Recorded";

  const teams = Array.isArray(match.teams)
    ? match.teams
    : Array.isArray(match.match_teams)
      ? match.match_teams
      : [];

  const firstTeam = teams[0] || {};
  const secondTeam = teams[1] || {};

  const firstName =
    firstTeam.clan_name ||
    firstTeam.squad_name ||
    firstTeam.name ||
    "Team A";

  const secondName =
    secondTeam.clan_name ||
    secondTeam.squad_name ||
    secondTeam.name ||
    "Team B";

  const firstScore = firstTeam.score ?? "—";
  const secondScore = secondTeam.score ?? "—";

  return (
    <div className="flex flex-col gap-3 px-5 py-4 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#171d27] text-[#e9c36c]">
          <Swords size={20} />
        </div>

        <div>
          <p className="text-sm font-semibold">{map}</p>
          <p className="mt-1 text-xs text-slate-500">{mode}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        {teams.length >= 2 ? (
          <div className="text-right">
            <p className="text-xs font-semibold">
              {firstName}
              <span className="mx-1 text-slate-600">vs</span>
              {secondName}
            </p>

            <p className="mt-1 text-sm font-black">
              <span className="text-emerald-400">{firstScore}</span>
              <span className="mx-2 text-slate-600">—</span>
              <span className="text-red-400">{secondScore}</span>
            </p>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-xs text-slate-500">
              Match ID: {match.match_id ?? match.id ?? "—"}
            </p>
          </div>
        )}

        <span className="rounded-md border border-emerald-400/15 bg-emerald-400/[0.07] px-2 py-1 text-[10px] text-emerald-400">
          {status}
        </span>
      </div>
    </div>
  );
}

/* ==================================================
   MANAGEMENT CARD
================================================== */

function ManagementCard({
  icon: Icon,
  title,
  description,
  button,
  onClick,
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0d1219] p-5 transition hover:border-[#d8b565]/25 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#d8b565]/20 bg-[#d8b565]/10 text-[#e9c36c]">
          <Icon size={22} strokeWidth={1.7} />
        </div>

        <div>
          <h3 className="font-bold">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>

          <button
            onClick={onClick}
            className="mt-4 flex items-center gap-2 text-xs font-bold text-[#e9c36c] transition hover:text-white"
          >
            {button}
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default App;