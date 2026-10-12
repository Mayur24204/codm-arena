import { useEffect, useState } from "react";

function TournamentDetails({ tournamentId, onBack }) {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/tournaments/${tournamentId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setTournament(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-center text-white">
        Loading tournament...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-center text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-8">

          <button
            onClick={onBack}
            className="mb-6 rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
          >
            ← Back to Tournaments
          </button>

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            CODM Arena
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            🏆 {tournament.tournament_name}
          </h1>

          <p className="mt-2 text-slate-400">
            Tournament #{tournament.tournament_id}
          </p>

        </div>
      </div>


      {/* Tournament information */}
      <main className="mx-auto max-w-7xl px-6 py-8">

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Start Date
            </p>

            <p className="mt-2 text-2xl font-bold">
              {new Date(tournament.start_date).toLocaleDateString("en-IN")}
            </p>
          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              End Date
            </p>

            <p className="mt-2 text-2xl font-bold">
              {new Date(tournament.end_date).toLocaleDateString("en-IN")}
            </p>
          </div>


          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-500">
              Maximum Squads
            </p>

            <p className="mt-2 text-2xl font-bold">
              {tournament.max_squads}
            </p>
          </div>

        </div>


        {/* Status */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Tournament Status
            </h2>

            <span className="rounded-full bg-blue-500/10 px-4 py-2 font-semibold uppercase text-blue-400">
              {tournament.status}
            </span>

          </div>

        </div>


        {/* Registered squads */}
        <div className="mt-8">

          <h2 className="text-3xl font-bold">
            Registered Squads
          </h2>

          <p className="mt-2 text-slate-400">
            Squads currently registered for this tournament.
          </p>


          {tournament.registered_squads.length === 0 ? (

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
              No squads registered yet.
            </div>

          ) : (

            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {tournament.registered_squads.map((squad) => (

                <div
                  key={squad.squad_id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-slate-500">
                        Squad #{squad.squad_id}
                      </p>

                      <h3 className="mt-1 text-2xl font-bold">
                        🎮 {squad.squad_name}
                      </h3>

                      <p className="mt-2 text-slate-400">
                        Clan: {squad.clan_name}
                      </p>

                    </div>


                    <span className="rounded-full bg-green-500/10 px-3 py-2 text-sm font-semibold uppercase text-green-400">
                      {squad.registration_status}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default TournamentDetails;