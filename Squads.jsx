import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  Search,
  RefreshCw,
  Users,
  Crown,
  Crosshair,
  ChevronRight,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

const API = "http://127.0.0.1:5000/api";

const GOLD = "#e9c36c";

function getPlayers(squad) {
  const possible =
    squad.players ??
    squad.members ??
    squad.squad_members ??
    squad.Squad_Members ??
    [];

  if (Array.isArray(possible)) {
    return possible.map((item) => item.player ?? item);
  }

  return [];
}

function getSquadName(squad) {
  return (
    squad.squad_name ??
    squad.name ??
    squad.clan_name ??
    squad.team_name ??
    `Squad ${squad.squad_id ?? ""}`
  );
}

function getClanName(squad) {
  return (
    squad.clan_name ??
    squad.clan?.clan_name ??
    squad.clan?.name ??
    "Independent Squad"
  );
}

function getPlayerName(player) {
  return player.ign ?? player.username ?? player.player_name ?? "Unknown Player";
}

function getPlayerRole(player) {
  return player.preferred_role ?? player.role ?? player.player_role ?? "Player";
}

function SquadCard({ squad }) {
  const players = getPlayers(squad);
  const squadName = getSquadName(squad);
  const clanName = getClanName(squad);

  return (
    <article className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1219] transition duration-200 hover:border-[#e9c36c]/40 hover:bg-[#101720]">
      <div className="h-[3px] bg-gradient-to-r from-[#8d7137] via-[#e9c36c] to-transparent" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#e9c36c]/20 bg-[#e9c36c]/[0.08]">
              <Shield size={23} color={GOLD} strokeWidth={1.7} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-base font-bold tracking-wide text-zinc-100">
                {squadName}
              </h3>
              <p className="mt-1 truncate text-xs text-zinc-500">{clanName}</p>
            </div>
          </div>

          <span className="shrink-0 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {players.length}/5 Players
          </span>
        </div>

        <div className="my-5 flex items-center justify-between border-y border-white/[0.06] py-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Users size={14} />
            Team Roster
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              players.length === 5 ? "text-[#e9c36c]" : "text-zinc-500"
            }`}
          >
            {players.length === 5
              ? "Full Squad"
              : players.length > 5
                ? "Check Roster"
                : "Roster Incomplete"}
          </span>
        </div>

        <div className="space-y-2">
          {players.length > 0 ? (
            players.slice(0, 5).map((player, index) => (
              <div
                key={
                  player.player_id ??
                  player.user_id ??
                  player.codm_uid ??
                  `${squadName}-${index}`
                }
                className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-[#080b10]/60 px-3 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-xs font-bold text-zinc-500">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {getPlayerName(player)}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-600">
                    {getPlayerRole(player)}
                  </p>
                </div>

                <Crosshair size={14} className="shrink-0 text-zinc-600" />
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center">
              <Users size={23} className="mx-auto mb-2 text-zinc-600" />
              <p className="text-sm text-zinc-500">No player roster returned</p>
              <p className="mt-1 text-xs text-zinc-600">
                Check the squad API response
              </p>
            </div>
          )}

          {players.length > 5 && (
            <p className="pt-1 text-xs text-zinc-500">
              +{players.length - 5} additional players
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Crown size={14} className="text-[#b99a58]" />
            <span>
              {squad.captain_name ??
                squad.leader_name ??
                "Team Management"}
            </span>
          </div>

          <ChevronRight
            size={17}
            className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-[#e9c36c]"
          />
        </div>
      </div>
    </article>
  );
}

export default function Squads() {
  const [squads, setSquads] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchSquads() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/squads`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const squadList = Array.isArray(data)
        ? data
        : data.squads ?? data.data ?? [];

      if (!Array.isArray(squadList)) {
        throw new Error("Unexpected squad data format");
      }

      setSquads(squadList);
    } catch (err) {
      setError(
        "Unable to load squads. Make sure the Flask backend and MySQL database are running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSquads();
  }, []);

  const filteredSquads = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return squads;

    return squads.filter((squad) => {
      const players = getPlayers(squad);

      const searchable = [
        getSquadName(squad),
        getClanName(squad),
        ...players.map(getPlayerName),
        ...players.map(getPlayerRole),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [squads, search]);

  const totalPlayers = squads.reduce(
    (total, squad) => total + getPlayers(squad).length,
    0,
  );

  const fullSquads = squads.filter(
    (squad) => getPlayers(squad).length === 5,
  ).length;

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
              Squad Management
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Manage teams, review rosters and track squad readiness.
            </p>
          </div>

          <button
            onClick={fetchSquads}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/10 bg-[#0d1219] px-4 py-2.5 text-sm font-medium text-zinc-300 hover:border-[#e9c36c]/40 hover:text-[#e9c36c] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh Squads
          </button>
        </div>

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.08] bg-[#0d1219] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">
                Registered Squads
              </span>
              <Shield size={18} className="text-[#e9c36c]" />
            </div>
            <p className="mt-3 text-3xl font-bold">{squads.length}</p>
            <p className="mt-2 text-xs text-zinc-600">
              Teams in the database
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0d1219] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">
                Total Roster Entries
              </span>
              <Users size={18} className="text-[#e9c36c]" />
            </div>
            <p className="mt-3 text-3xl font-bold">{totalPlayers}</p>
            <p className="mt-2 text-xs text-zinc-600">
              Players assigned to squads
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#0d1219] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">
                Full Squads
              </span>
              <Crown size={18} className="text-[#e9c36c]" />
            </div>
            <p className="mt-3 text-3xl font-bold">{fullSquads}</p>
            <p className="mt-2 text-xs text-zinc-600">
              Teams with exactly five players
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Registered Teams</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {filteredSquads.length} squad
              {filteredSquads.length === 1 ? "" : "s"} displayed
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search squads, clans or players..."
              className="w-full rounded-lg border border-white/10 bg-[#0d1219] py-3 pl-10 pr-4 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-[#e9c36c]/50"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/[0.05] p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-300">
                Could not load squads
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{error}</p>
              <button
                onClick={fetchSquads}
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
                Loading squad database...
              </p>
            </div>
          </div>
        ) : !error && filteredSquads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0d1219] px-5 py-16 text-center">
            <Shield size={32} className="mx-auto text-zinc-600" />
            <h3 className="mt-4 font-semibold text-zinc-300">
              No squads found
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              {search
                ? "Try another search term."
                : "Your database has not returned any squads yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {filteredSquads.map((squad, index) => (
              <SquadCard
                key={
                  squad.squad_id ??
                  squad.id ??
                  `${getSquadName(squad)}-${index}`
                }
                squad={squad}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 border-t border-white/[0.06] pt-5 text-xs text-zinc-600">
          <Shield size={14} />
          CODM Arena <span className="text-zinc-800">/</span> Squad Operations
        </div>
      </div>
    </div>
  );
}