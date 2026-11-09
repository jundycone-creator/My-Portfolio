
import os
from datetime import datetime
from zoneinfo import ZoneInfo
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
    print("========== NEW CHAT FUNCTION RUNNING ==========")

    try:
        print("CONTENT TYPE:", request.content_type)
        print("RAW REQUEST:", request.get_data(as_text=True))

        data = request.get_json(silent=True) or {}

        print("PARSED DATA:", data)

        user_message = data.get("message", "").strip()
        
        conversation_history = data.get("history", [])

        if not isinstance(conversation_history, list):
            conversation_history = []

        # Keep only the latest 6 messages
        valid_history = []

        for item in conversation_history[-6:]:

            if not isinstance(item, dict):
                continue

            role = item.get("role")
            content = item.get("content")

            if role not in ["user", "assistant"]:
                continue

            if not isinstance(content, str) or not content.strip():
                continue

            # Limit each historical message to 1,000 characters
            valid_history.append({
                "role": role,
                "content": content.strip()[:1000]
            })

        conversation_history = valid_history

        if not user_message:
            return jsonify({"error": "Message is empty"}), 400


        # LOAD PORTFOLIO KNOWLEDGE
        knowledge = load_knowledge()

        # CURRENT PHILIPPINE DATE AND TIME
        philippine_time = datetime.now(ZoneInfo("Asia/Manila"))

        current_time_context = philippine_time.strftime(
            "%A, %B %d, %Y | %I:%M:%S %p"
        )

        current_hour = philippine_time.hour
        current_day = philippine_time.weekday()

        # JUNDYTECH SOLUTIONS BUSINESS HOURS
        is_business_day = current_day < 6

        is_business_open = (
            is_business_day and
            9 <= current_hour < 20
        )

        business_status = "OPEN" if is_business_open else "CLOSED"

        time_information = f"""
        CURRENT DATE AND TIME:
        {current_time_context}

        Timezone: Asia/Manila (Philippine Time, UTC+8).

        JUNDYTECH SOLUTIONS BUSINESS HOURS:
        Monday to Saturday: 9:00 AM – 8:00 PM.
        Sunday: Closed.

        CURRENT BUSINESS STATUS: {business_status}

        TIME AWARENESS RULES:
        - Always use the current Philippine date and time.
        - Use CURRENT BUSINESS STATUS when asked whether the shop is open.
        - Understand today, tomorrow, yesterday, and other relative dates.
        - Do not confuse shop hours with Rodolfo's personal availability.
        - Never invent the current time or personal availability.
        """

                
        # DIRECT RESPONSE FOR CURRENT DATE AND TIME
        normalized_message = user_message.lower().strip()

        time_question_patterns = [
            "what is the exact current date and time",
            "current time",
            "what time is it",
            "what is the time",
            "what's the time",
            "exact current date and time",
            "current date",
            "what is today's date",
            "what date is it",
            "what day is it",
            "unsa oras karon",
            "unsay oras karon",
            "unsa petsa karon",
            "anong oras na",
            "anong petsa ngayon"
        ]
        print("DEBUG NORMALIZED MESSAGE:", normalized_message)

        if any(pattern in normalized_message for pattern in time_question_patterns):

            reply = (
                f"The current date and time in the Philippines is "
                f"{current_time_context} "
                f"(Asia/Manila, UTC+8)."
            )

            print("JUNDY AI DIRECT TIME RESPONSE:", reply)

            return jsonify({"reply": reply})

        print("JUNDY AI LIVE TIME:", current_time_context)
        print("DEBUG: TIME CHECK REACHED")
        print("DEBUG: USER MESSAGE:", user_message)
        print("JUNDY AI BUSINESS STATUS:", business_status)


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

        RESPONSE RULES:
        - Be concise but informative.
        - Answer the question directly.
        - Use simple, natural English.
        - Keep simple answers to 1–3 sentences.
        - Include necessary details for technical questions.
        - Avoid repeating information.
        - Use bullet points when explaining multiple items.
        - Never sacrifice accuracy for brevity.

        PORTFOLIO KNOWLEDGE:
        {knowledge}

        LIVE TIME AND BUSINESS AVAILABILITY:
        {time_information}

        TIME AWARENESS INSTRUCTIONS:
        - You have access to the live Philippine date and time above.
        - Never claim that you are not connected to a live clock.
        - When asked for the current date or time, use the supplied timestamp.
        - Never guess or invent the current date and time.
        - Use the supplied business status when asked if Jundytech Solutions is open.
        - Do not confuse shop operating hours with Rodolfo's personal availability.

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

        - Give concise but informative answers.
        - Answer the user's actual question first.
        - Avoid unnecessary introductions and repeated explanations.
        - Use simple, natural English.
        - Include important details when necessary.
        - Use bullet points for multiple items.
        - Keep simple answers to 1-3 sentences.
        - For technical questions, provide enough detail to be useful.
        - Never sacrifice accuracy just to make an answer shorter.

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
                *conversation_history[-6:],
                {
                    "role": "user",
                    "content": user_message
                }
            ],

            temperature=0.3,
            max_completion_tokens=400
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
