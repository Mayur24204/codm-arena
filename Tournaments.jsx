import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  Search,
  RefreshCw,
  CalendarDays,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Swords,
  ChevronRight,
} from "lucide-react";

const API = "http://127.0.0.1:5000/api";

function getTournamentName(tournament) {
  return (
    tournament.tournament_name ??
    tournament.name ??
    tournament.title ??
    "Unnamed Tournament"
  );
}

function getTournamentStatus(tournament) {
  return String(tournament.status ?? "upcoming").toLowerCase();
}

function getTournamentDate(tournament) {
  return (
    tournament.start_date ??
    tournament.tournament_date ??
    tournament.date ??
    null
  );
}

function formatDate(value) {
  if (!value) return "Date not announced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).split("T")[0];
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status) {
  if (["completed", "finished"].includes(status)) {
    return "border-zinc-700 bg-zinc-800/60 text-zinc-300";
  }

  if (["ongoing", "live", "in progress"].includes(status)) {
    return "border-red-500/25 bg-red-500/[0.08] text-red-300";
  }

  if (["cancelled", "canceled"].includes(status)) {
    return "border-red-900/50 bg-red-950/30 text-red-400";
  }

  return "border-[#e9c36c]/25 bg-[#e9c36c]/[0.08] text-[#e9c36c]";
}

function TournamentCard({ tournament }) {
  const name = getTournamentName(tournament);
  const status = getTournamentStatus(tournament);

  const startDate = getTournamentDate(tournament);
  const endDate = tournament.end_date ?? null;

  const maxSquads =
    tournament.max_squads ??
    tournament.max_teams ??
    tournament.squad_limit ??
    null;

  const registeredSquads =
    tournament.registered_squads ??
    tournament.registered_teams ??
    tournament.squad_count ??
    tournament.team_count ??
    null;

  const location =
    tournament.location ??
    tournament.venue ??
    tournament.map_name ??
    "Online Tournament";

  return (
    <article className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1219] transition duration-200 hover:border-[#e9c36c]/40 hover:bg-[#101720]">
      <div className="h-[3px] bg-gradient-to-r from-[#8d7137] via-[#e9c36c] to-transparent" />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#e9c36c]/20 bg-[#e9c36c]/[0.08]">
              <Trophy size={23} className="text-[#e9c36c]" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Tournament
                {tournament.tournament_id
                  ? ` #${tournament.tournament_id}`
                  : ""}
              </p>

              <h3 className="mt-1 break-words text-base font-bold text-zinc-100">
                {name}
              </h3>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(status)}`}
          >
            {status}
          </span>
        </div>

        <div className="my-5 space-y-3 border-y border-white/[0.06] py-4">
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays size={16} className="shrink-0 text-[#b99a58]" />

            <div>
              <p className="text-xs text-zinc-600">Start Date</p>
              <p className="mt-1 text-zinc-300">{formatDate(startDate)}</p>
            </div>
          </div>

          {endDate && (
            <div className="flex items-center gap-3 text-sm">
              <Clock size={16} className="shrink-0 text-[#b99a58]" />

              <div>
                <p className="text-xs text-zinc-600">End Date</p>
                <p className="mt-1 text-zinc-300">{formatDate(endDate)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="shrink-0 text-[#b99a58]" />

            <div>
              <p className="text-xs text-zinc-600">Location</p>
              <p className="mt-1 text-zinc-300">{location}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/[0.06] bg-[#080b10]/70 p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Users size={14} />
              Squad Limit
            </div>

            <p className="mt-2 text-xl font-bold text-zinc-100">
              {maxSquads ?? "—"}
            </p>

            <p className="mt-1 text-[10px] text-zinc-600">
              Maximum squads
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#080b10]/70 p-3">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Swords size={14} />
              Registered
            </div>

            <p className="mt-2 text-xl font-bold text-zinc-100">
              {registeredSquads ?? "—"}
            </p>

            <p className="mt-1 text-[10px] text-zinc-600">
              Participating squads
            </p>
          </div>
        </div>

        {maxSquads != null && registeredSquads != null && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-[10px] text-zinc-500">
              <span>Registration progress</span>
              <span>
                {maxSquads > 0
                  ? `${Math.min(
                      100,
                      Math.round((registeredSquads / maxSquads) * 100),
                    )}%`
                  : "—"}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-[#e9c36c] transition-all"
                style={{
                  width: `${
                    maxSquads > 0
                      ? Math.min(100, (registeredSquads / maxSquads) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <span className="text-xs text-zinc-600">
            CODM Arena Competition
          </span>

          {status === "completed" || status === "finished" ? (
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <CheckCircle2 size={14} />
              Finished
            </span>
          ) : (
            <ChevronRight
              size={17}
              className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-[#e9c36c]"
            />
          )}
        </div>
      </div>
    </article>
  );
}

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchTournaments() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/tournaments`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.tournaments ?? data.data ?? [];

      if (!Array.isArray(list)) {
        throw new Error("Unexpected tournament data format");
      }

      setTournaments(list);
    } catch {
      setError(
        "Unable to load tournaments. Check that your Flask backend and MySQL database are running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTournaments();
  }, []);

  const upcomingCount = tournaments.filter((tournament) =>
    ["upcoming", "scheduled", "registration open"].includes(
      getTournamentStatus(tournament),
    ),
  ).length;

  const ongoingCount = tournaments.filter((tournament) =>
    ["ongoing", "live", "in progress"].includes(
      getTournamentStatus(tournament),
    ),
  ).length;

  const completedCount = tournaments.filter((tournament) =>
    ["completed", "finished"].includes(getTournamentStatus(tournament)),
  ).length;

  const filteredTournaments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tournaments.filter((tournament) => {
      const name = getTournamentName(tournament).toLowerCase();
      const status = getTournamentStatus(tournament);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        status.includes(query) ||
        String(tournament.tournament_id ?? "").includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "upcoming" &&
          ["upcoming", "scheduled", "registration open"].includes(status)) ||
        (statusFilter === "ongoing" &&
          ["ongoing", "live", "in progress"].includes(status)) ||
        (statusFilter === "completed" &&
          ["completed", "finished"].includes(status));

      return matchesSearch && matchesStatus;
    });
  }, [tournaments, search, statusFilter]);

  return (
    <div className="min-h-full bg-[#080b10] p-4 text-zinc-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#e9c36c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e9c36c]" />
              Competitive Operations
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Tournament Management
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Track competitions, tournament schedules and squad registrations.
            </p>
          </div>

          <button
            onClick={fetchTournaments}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/10 bg-[#0d1219] px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-[#e9c36c]/40 hover:text-[#e9c36c] disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Tournaments
          </button>
        </div>

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Tournaments"
            value={tournaments.length}
            icon={Trophy}
            detail="Registered competitions"
          />

          <StatCard
            label="Upcoming"
            value={upcomingCount}
            icon={CalendarDays}
            detail="Scheduled competitions"
          />

          <StatCard
            label="Live / Ongoing"
            value={ongoingCount}
            icon={Swords}
            detail="Currently in progress"
          />

          <StatCard
            label="Completed"
            value={completedCount}
            icon={CheckCircle2}
            detail="Finished competitions"
          />
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold">All Tournaments</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Showing {filteredTournaments.length} of {tournaments.length} tournaments
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tournaments..."
                className="w-full rounded-lg border border-white/10 bg-[#0d1219] py-3 pl-10 pr-4 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-[#e9c36c]/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d1219] px-4 py-3 text-sm text-zinc-300 outline-none focus:border-[#e9c36c]/50"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Live / Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.05] p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />

            <div>
              <p className="text-sm font-medium text-red-300">
                Could not load tournaments
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">{error}</p>

              <button
                onClick={fetchTournaments}
                className="mt-3 text-xs font-semibold text-[#e9c36c] hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0d1219]">
            <div className="text-center">
              <LoaderCircle
                size={28}
                className="mx-auto animate-spin text-[#e9c36c]"
              />
              <p className="mt-3 text-sm text-zinc-500">
                Loading tournament database...
              </p>
            </div>
          </div>
        ) : !error && filteredTournaments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0d1219] px-5 py-16 text-center">
            <Trophy size={32} className="mx-auto text-zinc-600" />

            <h3 className="mt-4 font-semibold text-zinc-300">
              No tournaments found
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {filteredTournaments.map((tournament, index) => (
              <TournamentCard
                key={
                  tournament.tournament_id ??
                  tournament.id ??
                  `${getTournamentName(tournament)}-${index}`
                }
                tournament={tournament}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 border-t border-white/[0.06] pt-5 text-xs text-zinc-600">
          <Trophy size={14} />
          CODM Arena <span className="text-zinc-800">/</span> Tournament Operations
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, detail }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d1219] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <Icon size={18} className="text-[#e9c36c]" />
      </div>

      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-zinc-600">{detail}</p>
    </div>
  );
}