import { useEffect, useMemo, useState } from "react";
import {
  Swords,
  Search,
  RefreshCw,
  MapPin,
  Trophy,
  Clock,
  CalendarDays,
  Gamepad2,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Target,
} from "lucide-react";

const API = "http://127.0.0.1:5000/api";

function getTeams(match) {
  const teams =
    match.teams ??
    match.match_teams ??
    match.Match_Teams ??
    match.scores ??
    [];

  return Array.isArray(teams) ? teams : [];
}

function getTeamName(team) {
  return (
    team.squad_name ??
    team.clan_name ??
    team.team_name ??
    team.name ??
    `Squad ${team.squad_id ?? ""}`
  );
}

function getTeamScore(team) {
  const score = team.score ?? team.total_score ?? team.points;
  return score == null ? null : Number(score);
}

function getMatchId(match) {
  return match.match_id ?? match.id ?? "—";
}

function getMapName(match) {
  return (
    match.map_name ??
    match.map ??
    match.Map?.map_name ??
    match.Map?.name ??
    "Map not specified"
  );
}

function getGameMode(match) {
  return (
    match.mode_name ??
    match.game_mode ??
    match.mode ??
    match.Game_Mode?.mode_name ??
    "Game mode not specified"
  );
}

function getMatchDate(match) {
  return (
    match.match_date ??
    match.scheduled_at ??
    match.date ??
    match.created_at ??
    null
  );
}

function formatDate(value) {
  if (!value) return "Date not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).replace("T", " ").slice(0, 16);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getWinner(match, teams) {
  const explicitWinner =
    match.winner_name ??
    match.winner ??
    match.winning_squad ??
    match.winning_team ??
    null;

  if (explicitWinner) {
    if (typeof explicitWinner === "object") {
      return (
        explicitWinner.squad_name ??
        explicitWinner.clan_name ??
        explicitWinner.name ??
        null
      );
    }

    return String(explicitWinner);
  }

  const winningTeam = teams.find((team) => {
    const result = String(team.result ?? "").toLowerCase();
    return ["win", "winner", "won"].includes(result);
  });

  if (winningTeam) return getTeamName(winningTeam);

  if (teams.length >= 2) {
    const scoredTeams = teams
      .map((team) => ({ team, score: getTeamScore(team) }))
      .filter((item) => item.score !== null && Number.isFinite(item.score));

    if (scoredTeams.length >= 2) {
      const highest = Math.max(...scoredTeams.map((item) => item.score));
      const leaders = scoredTeams.filter((item) => item.score === highest);

      if (leaders.length === 1) {
        return getTeamName(leaders[0].team);
      }
    }
  }

  return null;
}

function getResultStyle(result) {
  const value = String(result ?? "").toLowerCase();

  if (["win", "winner", "won"].includes(value)) {
    return "border-[#e9c36c]/25 bg-[#e9c36c]/[0.08] text-[#e9c36c]";
  }

  if (["loss", "lost", "defeat"].includes(value)) {
    return "border-white/10 bg-white/[0.03] text-zinc-500";
  }

  return "border-white/10 bg-white/[0.03] text-zinc-400";
}

function MatchCard({ match }) {
  const teams = getTeams(match);
  const winner = getWinner(match, teams);
  const status = String(match.status ?? "").toLowerCase();

  const isLive = ["live", "ongoing", "in progress"].includes(status);

  return (
    <article className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1219] transition duration-200 hover:border-[#e9c36c]/35">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e9c36c]/20 bg-[#e9c36c]/[0.07]">
            <Swords size={18} className="text-[#e9c36c]" />
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-200">
              Match #{getMatchId(match)}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">
              {getGameMode(match)}
            </p>
          </div>
        </div>

        <span
          className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            isLive
              ? "border-red-500/30 bg-red-500/[0.08] text-red-300"
              : status === "completed" || status === "finished"
                ? "border-white/10 bg-white/[0.03] text-zinc-400"
                : "border-[#e9c36c]/20 bg-[#e9c36c]/[0.06] text-[#e9c36c]"
          }`}
        >
          {status || "Recorded"}
        </span>
      </div>

      <div className="p-5">
        <div className="mb-5 flex items-center gap-2 text-xs text-zinc-500">
          <MapPin size={14} className="text-[#b99a58]" />
          {getMapName(match)}
        </div>

        {teams.length > 0 ? (
          <div className="space-y-3">
            {teams.map((team, index) => {
              const teamName = getTeamName(team);
              const score = getTeamScore(team);

              const result = String(team.result ?? "").toLowerCase();

              const isWinner =
                ["win", "winner", "won"].includes(result) ||
                (winner !== null &&
                  teamName.toLowerCase() === winner.toLowerCase());

              return (
                <div
                  key={`${getMatchId(match)}-${team.squad_id ?? teamName}-${index}`}
                  className={`flex items-center justify-between gap-3 rounded-lg border p-4 ${
                    isWinner
                      ? "border-[#e9c36c]/25 bg-[#e9c36c]/[0.04]"
                      : "border-white/[0.05] bg-[#080b10]/60"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isWinner
                          ? "bg-[#e9c36c]/10 text-[#e9c36c]"
                          : "bg-white/[0.04] text-zinc-500"
                      }`}
                    >
                      {isWinner ? (
                        <Trophy size={17} />
                      ) : (
                        <Target size={17} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-200">
                        {teamName}
                      </p>

                      {team.result && (
                        <span
                          className={`mt-1 inline-flex rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getResultStyle(result)}`}
                        >
                          {team.result}
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className={`shrink-0 text-2xl font-bold tabular-nums ${
                      isWinner ? "text-[#e9c36c]" : "text-zinc-300"
                    }`}
                  >
                    {score ?? "—"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center">
            <Swords size={23} className="mx-auto text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-500">
              No team scores available
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Check the match API response
            </p>
          </div>
        )}

        {winner && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#e9c36c]/15 bg-[#e9c36c]/[0.04] px-3 py-3">
            <Trophy size={15} className="shrink-0 text-[#e9c36c]" />
            <p className="min-w-0 text-xs text-zinc-400">
              Winner:{" "}
              <span className="font-semibold text-[#e9c36c]">{winner}</span>
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            <span>{formatDate(getMatchDate(match))}</span>
          </div>

          <div className="flex items-center gap-2">
            <Gamepad2 size={14} />
            <span>{teams.length} teams</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchMatches() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/matches`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : data.matches ?? data.data ?? [];

      if (!Array.isArray(list)) {
        throw new Error("Unexpected match data format");
      }

      setMatches(list);
    } catch {
      setError(
        "Unable to load matches. Check that your Flask backend and MySQL database are running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMatches();
  }, []);

  const liveMatches = matches.filter((match) =>
    ["live", "ongoing", "in progress"].includes(
      String(match.status ?? "").toLowerCase(),
    ),
  ).length;

  const completedMatches = matches.filter((match) =>
    ["completed", "finished"].includes(
      String(match.status ?? "").toLowerCase(),
    ),
  ).length;

  const filteredMatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return matches.filter((match) => {
      const teams = getTeams(match);

      const searchable = [
        getMatchId(match),
        getMapName(match),
        getGameMode(match),
        match.status ?? "",
        ...teams.map(getTeamName),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      const status = String(match.status ?? "").toLowerCase();

      const matchesResult =
        resultFilter === "all" ||
        (resultFilter === "live" &&
          ["live", "ongoing", "in progress"].includes(status)) ||
        (resultFilter === "completed" &&
          ["completed", "finished"].includes(status)) ||
        (resultFilter === "scheduled" &&
          ["scheduled", "upcoming", "pending"].includes(status));

      return matchesSearch && matchesResult;
    });
  }, [matches, search, resultFilter]);

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
              Match Center
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Review match results, team scores, maps and game modes.
            </p>
          </div>

          <button
            onClick={fetchMatches}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/10 bg-[#0d1219] px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-[#e9c36c]/40 hover:text-[#e9c36c] disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Matches
          </button>
        </div>

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Matches"
            value={matches.length}
            icon={Swords}
            detail="Matches in the database"
          />

          <StatCard
            label="Live Matches"
            value={liveMatches}
            icon={Clock}
            detail="Currently in progress"
          />

          <StatCard
            label="Completed Matches"
            value={completedMatches}
            icon={CheckCircle2}
            detail="Finished match records"
          />
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold">Match Records</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Showing {filteredMatches.length} of {matches.length} matches
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
                placeholder="Search map, team or mode..."
                className="w-full rounded-lg border border-white/10 bg-[#0d1219] py-3 pl-10 pr-4 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-[#e9c36c]/50"
              />
            </div>

            <select
              value={resultFilter}
              onChange={(event) => setResultFilter(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#0d1219] px-4 py-3 text-sm text-zinc-300 outline-none focus:border-[#e9c36c]/50"
            >
              <option value="all">All Matches</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.05] p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />

            <div>
              <p className="text-sm font-medium text-red-300">
                Could not load matches
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">{error}</p>

              <button
                onClick={fetchMatches}
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
                Loading match database...
              </p>
            </div>
          </div>
        ) : !error && filteredMatches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0d1219] px-5 py-16 text-center">
            <Swords size={32} className="mx-auto text-zinc-600" />

            <h3 className="mt-4 font-semibold text-zinc-300">
              No matches found
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Try another search term or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredMatches.map((match, index) => (
              <MatchCard
                key={match.match_id ?? match.id ?? index}
                match={match}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 border-t border-white/[0.06] pt-5 text-xs text-zinc-600">
          <Swords size={14} />
          CODM Arena <span className="text-zinc-800">/</span> Match Operations
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