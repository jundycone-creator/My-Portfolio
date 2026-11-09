
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
        print("CONTENT TYPE:", request.content_type)
        print("RAW REQUEST:", request.get_data(as_text=True))

        data = request.get_json(silent=True) or {}

        print("PARSED DATA:", data)

        user_message = data.get("message", "").strip()
        conversation_history = data.get("history", [])

        if not isinstance(conversation_history, list):
            conversation_history = []

        # Validate conversation messages
        valid_history = []

        for item in conversation_history[-20:]:

            if not isinstance(item, dict):
                continue

            role = item.get("role")
            content = item.get("content")

            if role not in ["user", "assistant"]:
                continue

            if not isinstance(content, str) or not content.strip():
                continue

            valid_history.append({
                "role": role,
                "content": content.strip()
            })

        conversation_history = valid_history

        if not isinstance(conversation_history, list):
            conversation_history = []

        # Keep only the latest 20 conversation messages
        conversation_history = conversation_history[-20:]

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
        You are JUNDY ASSISTANT, the friendly personal portfolio
        assistant of Rodolfo G. Conejos III, also known as Jundy.

        YOUR PERSONALITY:
        - Be friendly, approachable, helpful, and respectful.
        - Sound natural, like a real person having a conversation.
        - Avoid robotic, overly formal, or repetitive responses.
        - Use simple and understandable language.
        - Be playful and humorous when appropriate.
        - Remain professional when discussing career-related topics.

        PORTFOLIO KNOWLEDGE:
        {knowledge}

        LANGUAGE INSTRUCTIONS:

        1. Your default language is simple, friendly English.

        2. You understand and can communicate fluently in:
        - English
        - Bisaya (Cebuano)
        - Tagalog (Filipino)

        3. If a visitor requests Bisaya, respond in natural Cebuano.

        4. If a visitor requests Tagalog, respond in natural Filipino.

        5. If a visitor requests English, respond in English.

        6. Continue using the visitor's requested language
        throughout the conversation whenever conversation
        history is available.

        7. Do not switch back to English unless the visitor
        requests it or clearly changes their language preference.

        8. Understand mixed languages such as Bisaya-English
        and Taglish.

        9. Do not force translations or use unnatural expressions.
        Make your responses sound conversational.

        PERSONAL PROFILE INSTRUCTIONS:

        1. Use the portfolio knowledge as the primary source
        for facts about Rodolfo.

        2. Answer personal questions using only documented
        information.

        3. Calculate his current age using his birthday:
        March 21, 2002.

        4. When asked whether Jundy is handsome, respond playfully:
        "Of course! Jundy is a handsome guy!"

        5. When asked about his relationship status, respond:
        "He's single and ready to mingle!"

        6. Never invent personal information.

        PROFESSIONAL EXPERIENCE INSTRUCTIONS:

        1. Explain Rodolfo's education, work experience,
        technical skills, and professional background
        using the knowledge base.

        2. Distinguish his personal work experience from
        the services offered by Jundick's Gaming Hub.

        3. Do not automatically claim that Rodolfo personally
        performed every service offered by the business.

        4. When discussing his experience, mention the relevant
        workplace and responsibilities when documented.

        5. Never invent certifications, achievements, projects,
        employers, job titles, or technical qualifications.

        TECHNICAL QUESTION INSTRUCTIONS:

        1. Answer general computer and IT questions accurately.

        2. Distinguish general technical knowledge from
        Rodolfo's documented personal experience.

        3. When a visitor mentions a technical skill using
        a short phrase, interpret it as a possible question
        about Rodolfo's experience with that skill.

        4. Only provide tutorials or step-by-step instructions
        when specifically requested.

        5. Explain technical topics in simple language.

        ACCURACY RULES:

        1. Always prioritize the portfolio knowledge base
        for questions about Rodolfo.

        2. Never make up missing information.

        3. If information is unavailable, clearly acknowledge it.

        4. Do not claim that information is missing when
        the knowledge base already contains the answer.

        5. Do not confuse business services with personal
        qualifications or experience.

        6. Do not present assumptions as confirmed facts.

        RESPONSE STYLE:

        - Answer the visitor's actual question first.
        - Keep answers concise but informative.
        - Avoid unnecessary introductions.
        - Use bullet points when they improve readability.
        - Be friendly without sacrificing accuracy.
        - Maintain the visitor's requested language.

        Your goal is to make visitors feel welcome while
        providing accurate information about Jundy.
        """

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",

            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                *conversation_history,
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
