import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  RefreshCw,
  Shield,
  Crosshair,
  UserRound,
} from "lucide-react";

const API = "http://127.0.0.1:5000/api";

function Players() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPlayers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/players`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      setPlayers(Array.isArray(data) ? data : data.players || []);
    } catch (err) {
      console.error("Players loading error:", err);
      setError("Unable to load players. Check that your Flask backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return players;

    return players.filter((player) =>
      [
        player.ign,
        player.codm_uid,
        player.mp_rank,
        player.preferred_role,
        player.role,
        player.clan_name,
        player.squad_name,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [players, search]);

  const uniqueRanks = new Set(
    players
      .map((player) => player.mp_rank)
      .filter(Boolean)
  ).size;

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#d9b66e]">
            CODM ARENA / DATABASE
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight">
            Player <span className="text-[#e9c36c]">Management</span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and search registered Call of Duty Mobile players.
          </p>
        </div>

        <button
          onClick={loadPlayers}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#11161e] px-4 py-3 text-sm font-semibold text-slate-300 hover:border-[#d9b66e]/40 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </section>

      {/* STATISTICS */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">

        <StatCard
          icon={Users}
          label="Registered Players"
          value={loading ? "..." : players.length}
        />

        <StatCard
          icon={Shield}
          label="Ranks Represented"
          value={loading ? "..." : uniqueRanks}
        />

        <StatCard
          icon={Crosshair}
          label="Search Results"
          value={loading ? "..." : filteredPlayers.length}
        />
      </div>

      {/* PLAYER TABLE */}

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1219]">

        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center">

          <div>
            <h2 className="font-bold">Registered Competitors</h2>

            <p className="mt-1 text-xs text-slate-500">
              Player identities and available game information
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search IGN, UID or rank..."
              className="w-full rounded-xl border border-white/10 bg-[#080b10] py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-600 focus:border-[#d9b66e]/50"
            />
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            {error}

            <button
              onClick={loadPlayers}
              className="ml-2 underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[760px] text-left">

            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02] text-[10px] uppercase tracking-[1.5px] text-slate-500">
                <th className="px-5 py-4 font-semibold">#</th>
                <th className="px-5 py-4 font-semibold">Player</th>
                <th className="px-5 py-4 font-semibold">CODM UID</th>
                <th className="px-5 py-4 font-semibold">MP Rank</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Clan / Squad</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.05]">

              {!loading &&
                !error &&
                filteredPlayers.map((player, index) => (
                  <tr
                    key={player.player_id ?? player.user_id ?? player.codm_uid ?? index}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4 text-xs font-semibold text-slate-600">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d9b66e]/20 bg-[#d9b66e]/[0.08] text-[#e9c36c]">
                          <UserRound size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            {player.ign || "Unknown Player"}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-500">
                            Player ID: {player.player_id ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      {player.codm_uid || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md border border-[#d9b66e]/20 bg-[#d9b66e]/[0.07] px-2.5 py-1.5 text-xs font-semibold text-[#e9c36c]">
                        {player.mp_rank || "Unranked"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {player.preferred_role || player.role || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-300">
                        {player.clan_name || player.squad_name || "—"}
                      </div>

                      {player.clan_name && player.squad_name && (
                        <div className="mt-1 text-[10px] text-slate-500">
                          {player.squad_name}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

              {!loading && !error && filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Users
                      size={30}
                      className="mx-auto text-slate-600"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-300">
                      No players found
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Try a different search term.
                    </p>
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <RefreshCw
                      size={22}
                      className="mx-auto animate-spin text-[#e9c36c]"
                    />

                    <p className="mt-3 text-sm text-slate-400">
                      Loading player database...
                    </p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-white/[0.07] px-5 py-4 text-xs text-slate-500 sm:flex-row">
          <span>
            Showing {filteredPlayers.length} of {players.length} players
          </span>

          <span>CODM ARENA · PLAYER DATABASE</span>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d1219] p-5 transition hover:border-[#d9b66e]/25">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400">{label}</p>

        <Icon size={19} className="text-[#d9b66e]" strokeWidth={1.7} />
      </div>

      <p className="mt-4 text-3xl font-black tracking-tight">
        {value}
      </p>

      <div className="mt-4 h-px bg-gradient-to-r from-[#d9b66e]/40 to-transparent" />
    </div>
  );
}

export default Players;