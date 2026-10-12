from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="system",
        database="codm_arena"
    )


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():
    return jsonify({
        "message": "CODM Arena API is running",
        "status": "success"
    })


# ==========================================
# ALL PLAYERS
# ==========================================

@app.route("/api/players", methods=["GET"])
def get_players():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT *
            FROM Players
            ORDER BY player_id
        """)

        players = cursor.fetchall()
        return jsonify(players)

    except Exception as e:
        print("Players API error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


# ==========================================
# LEADERBOARD - ALL PLAYERS
# ==========================================

@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Check the exact database and number of players.
        cursor.execute("SELECT DATABASE() AS database_name")
        database_info = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) AS total FROM Players")
        database_count = cursor.fetchone()["total"]

        # LEFT JOIN ensures players without match statistics
        # are not excluded from the leaderboard.
        cursor.execute("""
            SELECT
                p.player_id,
                p.ign,
                COALESCE(p.mp_rank, 'Unranked') AS mp_rank,

                COALESCE(stats.matches_played, 0)
                    AS matches_played,

                COALESCE(stats.total_kills, 0)
                    AS total_kills,

                COALESCE(stats.total_deaths, 0)
                    AS total_deaths,

                COALESCE(stats.total_assists, 0)
                    AS total_assists,

                COALESCE(
                    ROUND(
                        stats.total_kills /
                        NULLIF(stats.total_deaths, 0),
                        2
                    ),
                    0
                ) AS kd_ratio

            FROM Players p

            LEFT JOIN (
                SELECT
                    player_id,
                    COUNT(DISTINCT match_id) AS matches_played,
                    SUM(kills) AS total_kills,
                    SUM(deaths) AS total_deaths,
                    SUM(assists) AS total_assists
                FROM Player_Match_Stats
                GROUP BY player_id
            ) stats
                ON p.player_id = stats.player_id

            ORDER BY
                COALESCE(stats.total_kills, 0) DESC,
                p.player_id ASC
        """)

        players = cursor.fetchall()

        print("------------------------------------")
        print("LEADERBOARD DEBUG")
        print("Database:", database_info["database_name"])
        print("Players in database:", database_count)
        print("Players returned:", len(players))
        print("------------------------------------")

        # Return diagnostic information along with all player records.
        return jsonify({
            "database": database_info["database_name"],
            "database_count": database_count,
            "returned_count": len(players),
            "players": players
        })

    except Exception as e:
        print("Leaderboard API error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


# ==========================================
# DEBUG DATABASE
# ==========================================

@app.route("/api/debug-players", methods=["GET"])
def debug_players():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT DATABASE() AS database_name")
        database = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) AS total FROM Players")
        count = cursor.fetchone()

        cursor.execute("""
            SELECT player_id, ign
            FROM Players
            ORDER BY player_id
        """)

        players = cursor.fetchall()

        return jsonify({
            "database": database["database_name"],
            "database_count": count["total"],
            "returned_count": len(players),
            "players": players
        })

    except Exception as e:
        print("Debug API error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


# ==========================================
# SQUADS
# ==========================================

@app.route("/api/squads", methods=["GET"])
def get_squads():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                s.squad_id,
                s.squad_name,
                c.clan_name,
                p.player_id,
                p.ign,
                sm.squad_role
            FROM Squads s
            LEFT JOIN Clans c
                ON s.clan_id = c.clan_id
            LEFT JOIN Squad_Members sm
                ON s.squad_id = sm.squad_id
            LEFT JOIN Players p
                ON sm.player_id = p.player_id
            ORDER BY s.squad_id, p.player_id
        """)

        rows = cursor.fetchall()
        squads = {}

        for row in rows:
            squad_id = row["squad_id"]

            if squad_id not in squads:
                squads[squad_id] = {
                    "squad_id": squad_id,
                    "squad_name": row["squad_name"],
                    "clan_name": row["clan_name"],
                    "players": []
                }

            if row["player_id"] is not None:
                squads[squad_id]["players"].append({
                    "player_id": row["player_id"],
                    "ign": row["ign"],
                    "squad_role": row["squad_role"]
                })

        return jsonify(list(squads.values()))

    except Exception as e:
        print("Squads API error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


# ==========================================
# TOURNAMENTS
# ==========================================

@app.route("/api/tournaments", methods=["GET"])
def get_tournaments():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT *
            FROM Tournaments
            ORDER BY tournament_id DESC
        """)

        return jsonify(cursor.fetchall())

    except Exception as e:
        print("Tournaments API error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


# ==========================================
# TOURNAMENT DETAILS
# ==========================================

@app.route("/api/tournaments/<int:tournament_id>", methods=["GET"])
def get_tournament_details(tournament_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT *
            FROM Tournaments
            WHERE tournament_id = %s
        """, (tournament_id,))

        tournament = cursor.fetchone()

        if not tournament:
            return jsonify({"error": "Tournament not found"}), 404

        cursor.execute("""
            SELECT *
            FROM Registrations
            WHERE tournament_id = %s
        """, (tournament_id,))

        tournament["registrations"] = cursor.fetchall()

        return jsonify(tournament)

    except Exception as e:
        print("Tournament details error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


# ==========================================
# MATCHES
# ==========================================

@app.route("/api/matches", methods=["GET"])
def get_matches():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                m.*,
                t.tournament_name,
                mp.map_name,
                gm.mode_name
            FROM Matches m
            LEFT JOIN Tournaments t
                ON m.tournament_id = t.tournament_id
            LEFT JOIN Maps mp
                ON m.map_id = mp.map_id
            LEFT JOIN Game_Modes gm
                ON m.mode_id = gm.mode_id
            ORDER BY m.match_id DESC
        """)

        matches = cursor.fetchall()

        return jsonify(matches)

    except Exception as e:
        print("Matches API error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


# ==========================================
# ANALYTICS
# ==========================================

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        queries = {
            "total_players": "SELECT COUNT(*) AS total FROM Players",
            "total_clans": "SELECT COUNT(*) AS total FROM Clans",
            "total_squads": "SELECT COUNT(*) AS total FROM Squads",
            "total_tournaments": "SELECT COUNT(*) AS total FROM Tournaments",
            "total_matches": "SELECT COUNT(*) AS total FROM Matches"
        }

        result = {}

        for key, query in queries.items():
            cursor.execute(query)
            result[key] = cursor.fetchone()["total"]

        return jsonify(result)

    except Exception as e:
        print("Analytics API error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


# ==========================================
# SMART ANALYZER
# ==========================================

@app.route("/api/smart-analyzer", methods=["GET"])
def smart_analyzer():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT
                p.player_id,
                p.ign,
                p.mp_rank,
                COALESCE(stats.total_kills, 0) AS total_kills,
                COALESCE(stats.total_deaths, 0) AS total_deaths,
                COALESCE(stats.total_assists, 0) AS total_assists
            FROM Players p
            LEFT JOIN (
                SELECT
                    player_id,
                    SUM(kills) AS total_kills,
                    SUM(deaths) AS total_deaths,
                    SUM(assists) AS total_assists
                FROM Player_Match_Stats
                GROUP BY player_id
            ) stats
                ON p.player_id = stats.player_id
            ORDER BY total_kills DESC
            LIMIT 5
        """)

        return jsonify(cursor.fetchall())

    except Exception as e:
        print("Smart Analyzer API error:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        connection.close()


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )