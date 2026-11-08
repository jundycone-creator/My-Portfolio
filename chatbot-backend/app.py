
import os
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

# Load API key from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing from .env")

client = Groq(api_key=api_key)


# PORTFOLIO INFORMATION
# KNOWLEDGE BASE
KNOWLEDGE_FILE = Path(__file__).parent / "knowledge" / "portfolio_knowledge.md"


def load_knowledge():

    try:
        with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as file:
            return file.read()

    except FileNotFoundError:
        print("Knowledge base file not found!")
        return "No portfolio knowledge is currently available."


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Jundy Assistant Groq backend is running!"
    })



@app.route("/chat", methods=["POST"])
def chat():

    try:
        data = request.get_json() or {}

        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"error": "Message is empty"}), 400

        # LOAD PORTFOLIO KNOWLEDGE
        knowledge = load_knowledge()

        print("\n========== KNOWLEDGE BASE CHECK ==========")
        print("FILE PATH:", KNOWLEDGE_FILE)
        print("FILE EXISTS:", KNOWLEDGE_FILE.exists())
        print("CONTENT LENGTH:", len(knowledge))
        print("CONTENT PREVIEW:")
        print(knowledge[:1000])
        print("==========================================\n")

        system_prompt = f"""
You are JUNDY ASSISTANT, the personal portfolio assistant
of Rodolfo G. Conejos III.

YOUR MAIN PURPOSE:
Present Rodolfo's professional background, technical
specialties, work experience, skills, and services.

PORTFOLIO KNOWLEDGE:
{knowledge}

IMPORTANT RESPONSE RULES:

1. ALWAYS prioritize the information in the portfolio
   knowledge base when answering questions about Rodolfo.

2. When someone asks about Rodolfo's specialty,
   explain his computer-related specialties, including:
   - Computer hardware troubleshooting and repair.
   - Windows 10 and Windows 11 installation.
   - Custom PC building and upgrades.
   - Computer maintenance.
   - Printer troubleshooting and repair.
   - Basic networking.
   - CCTV installation and maintenance.
   - Basic web development and programming.

3. When someone mentions a technical skill using
   only a short phrase, interpret it as a question
   about Rodolfo's experience with that skill.

4. When asked about a specialty, explain what Rodolfo
   actually does and where he gained that experience.

5. Do not say that Rodolfo has no portfolio information
   if the relevant information exists in the knowledge base.

6. Do not invent certifications, qualifications,
   projects, achievements, or technical experience.

7. Distinguish Rodolfo's personal experience from
   general technical explanations.

8. Only provide tutorials or step-by-step instructions
   when the visitor specifically asks how to perform
   a technical task.

9. If information is not available, acknowledge it
   honestly instead of making up an answer.

10. Use simple, professional, friendly English.

Keep answers concise and relevant to the visitor's question.
"""

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],

            temperature=0.4,
            max_completion_tokens=700
        )

        reply = response.choices[0].message.content

        return jsonify({
            "reply": reply
        })

    except Exception as e:

        print("Groq Chatbot Error:", str(e))

        return jsonify({
            "error": "Sorry, the AI assistant is temporarily unavailable."
        }), 500



if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
