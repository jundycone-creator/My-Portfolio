
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import random
import uuid

app = Flask(__name__)

# Allow your portfolio and local development website
allowed_origins = os.getenv(
    "FRONTEND_ORIGIN",
    "http://127.0.0.1:5500,http://localhost:5500"
).split(",")

CORS(app, origins=allowed_origins)

# Temporary game storage
games = {}

BOARD_SIZE = 20


def generate_food(snake):

    empty_spaces = [
        (x, y)
        for x in range(BOARD_SIZE)
        for y in range(BOARD_SIZE)
        if [x, y] not in snake
    ]

    if not empty_spaces:
        return None

    x, y = random.choice(empty_spaces)
    return [x, y]


def game_state(game):

    return {
        "snake": game["snake"],
        "food": game["food"],
        "score": game["score"],
        "game_over": game["game_over"],
        "board_size": BOARD_SIZE
    }


@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "online",
        "message": "Jundy Snake Game API is running!"
    })


@app.route("/api/start", methods=["POST"])
def start_game():

    game_id = str(uuid.uuid4())

    snake = [
        [10, 10],
        [9, 10],
        [8, 10]
    ]

    games[game_id] = {
        "snake": snake,
        "direction": "RIGHT",
        "food": generate_food(snake),
        "score": 0,
        "game_over": False
    }

    return jsonify({
        "game_id": game_id,
        **game_state(games[game_id])
    })


@app.route("/api/move", methods=["POST"])
def move_snake():

    data = request.get_json(silent=True) or {}

    game_id = data.get("game_id")
    new_direction = data.get("direction")

    if not game_id or game_id not in games:
        return jsonify({"error": "Invalid game ID"}), 404

    game = games[game_id]

    if new_direction not in ["UP", "DOWN", "LEFT", "RIGHT"]:
        return jsonify({"error": "Invalid direction"}), 400

    if game["game_over"]:
        return jsonify(game_state(game))

    opposite = {
        "UP": "DOWN",
        "DOWN": "UP",
        "LEFT": "RIGHT",
        "RIGHT": "LEFT"
    }

    if new_direction != opposite[game["direction"]]:
        game["direction"] = new_direction

    head_x, head_y = game["snake"][0]

    movement = {
        "UP": (0, -1),
        "DOWN": (0, 1),
        "LEFT": (-1, 0),
        "RIGHT": (1, 0)
    }

    dx, dy = movement[game["direction"]]

    new_head = [head_x + dx, head_y + dy]

    eating = new_head == game["food"]

    body = game["snake"] if eating else game["snake"][:-1]

    collision = (
        new_head[0] < 0 or
        new_head[1] < 0 or
        new_head[0] >= BOARD_SIZE or
        new_head[1] >= BOARD_SIZE or
        new_head in body
    )

    if collision:
        game["game_over"] = True
        return jsonify(game_state(game))

    game["snake"].insert(0, new_head)

    if eating:

        game["score"] += 10
        game["food"] = generate_food(game["snake"])

        if game["food"] is None:
            game["game_over"] = True

    else:

        game["snake"].pop()

    return jsonify(game_state(game))


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=True
    )
