from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)


# ==========================================
# DATABASE CONNECTION
# ==========================================

def get_db_connection():
    db_host = os.environ.get("DB_HOST", "localhost")

    config = {
        "host": db_host,
        "port": int(os.environ.get("DB_PORT", 3306 if db_host == "localhost" else 24791)),
        "user": os.environ.get("DB_USER", "root"),
        "password": os.environ.get("DB_PASSWORD", "system"),
        "database": os.environ.get("DB_NAME", "codm_arena"),
        "connection_timeout": 15
    }

    # Aiven requires an SSL connection.
    if db_host != "localhost" and db_host != "127.0.0.1":
        config["ssl_verify_cert"] = True

    return mysql.connector.connect(**config)


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
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT *
            FROM Players
            ORDER BY player_id
        """)

        return jsonify(cursor.fetchall())

    except Exception as e:
        print("Players API error:", e)
        return jsonify({"error": "Unable to load players"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ==========================================
# LEADERBOARD
# ==========================================

@app.route("/api/leaderboard", methods=["GET"])
def get_leaderboard():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT DATABASE() AS database_name")
        database_info = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) AS total FROM Players")
        database_count = cursor.fetchone()["total"]

        cursor.execute("""
            SELECT
                p.player_id,
                p.ign,
                COALESCE(p.mp_rank, 'Unranked') AS mp_rank,
                COALESCE(stats.matches_played, 0) AS matches_played,
                COALESCE(stats.total_kills, 0) AS total_kills,
                COALESCE(stats.total_deaths, 0) AS total_deaths,
                COALESCE(stats.total_assists, 0) AS total_assists,
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
            ) stats ON p.player_id = stats.player_id
            ORDER BY
                COALESCE(stats.total_kills, 0) DESC,
                p.player_id ASC
        """)

        players = cursor.fetchall()

        return jsonify({
            "database": database_info["database_name"],
            "database_count": database_count,
            "returned_count": len(players),
            "players": players
        })

    except Exception as e:
        print("Leaderboard API error:", e)
        return jsonify({"error": "Unable to load leaderboard"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ==========================================
# DEBUG PLAYERS
# ==========================================

@app.route("/api/debug-players", methods=["GET"])
def debug_players():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

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
        return jsonify({"error": "Unable to retrieve player diagnostics"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ==========================================
# SQUADS
# ==========================================

@app.route("/api/squads", methods=["GET"])
def get_squads():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

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
        return jsonify({"error": "Unable to load squads"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ==========================================
# TOURNAMENTS
# ==========================================

@app.route("/api/tournaments", methods=["GET"])
def get_tournaments():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT *
            FROM Tournaments
            ORDER BY tournament_id DESC
        """)

        return jsonify(cursor.fetchall())

    except Exception as e:
        print("Tournaments API error:", e)
        return jsonify({"error": "Unable to load tournaments"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ==========================================
# TOURNAMENT DETAILS
# ==========================================

@app.route("/api/tournaments/<int:tournament_id>", methods=["GET"])
def get_tournament_details(tournament_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

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
        return jsonify({"error": "Unable to load tournament details"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ==========================================
# MATCHES
# ==========================================

@app.route("/api/matches", methods=["GET"])
def get_matches():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

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

        return jsonify(cursor.fetchall())

    except Exception as e:
        print("Matches API error:", e)
        return jsonify({"error": "Unable to load matches"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ==========================================
# ANALYTICS
# ==========================================

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

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
        return jsonify({"error": "Unable to load analytics"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ==========================================
# SMART ANALYZER
# ==========================================

@app.route("/api/smart-analyzer", methods=["GET"])
def smart_analyzer():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

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
            ) stats ON p.player_id = stats.player_id
            ORDER BY total_kills DESC
            LIMIT 5
        """)

        return jsonify(cursor.fetchall())

    except Exception as e:
        print("Smart Analyzer API error:", e)
        return jsonify({"error": "Unable to load Smart Analyzer"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
