
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


def get_relevant_knowledge(user_message):

    knowledge = load_knowledge()

    sections = {}
    current_section = None

    for line in knowledge.splitlines():

        if line.startswith("## "):
            current_section = line.strip()
            sections[current_section] = []

        elif current_section:
            sections[current_section].append(line)

    message = user_message.lower()

    selected_sections = []

    # Personal information
    if any(word in message for word in [
        "who", "name", "jundy", "age", "birthday",
        "height", "handsome", "single", "relationship",
        "location", "education", "degree", "course"
    ]):
        selected_sections += ["## 1. PERSONAL PROFILE"]

    # Work experience and career
    if any(word in message for word in [
        "work", "experience", "career", "job",
        "employer", "working scholar", "cad operator",
        "resume", "responsibilities"
    ]):
        selected_sections += ["## 2. WORK EXPERIENCE"]

    # Skills and technical knowledge
    if any(word in message for word in [
        "skill", "skills", "hardware", "software",
        "troubleshoot", "troubleshooting", "programming",
        "python", "html", "css", "javascript",
        "windows", "network", "printer", "cctv",
        "autocad", "technical"
    ]):
        selected_sections += [
            "## 3. TECHNICAL SKILLS",
            "## 4. TECHNICAL SPECIALTIES"
        ]

    # Projects
    if any(word in message for word in [
        "project", "projects", "capstone", "thesis"
    ]):
        selected_sections += ["## 5. PROJECTS"]

    # Business information
    if any(word in message for word in [
        "business", "shop", "service", "services",
        "jundytech", "price", "hours", "open",
        "closed", "sunday", "repair", "pc build"
    ]):
        selected_sections += ["## 6. JUNDYTECH SOLUTIONS"]

    # Contact information
    if any(word in message for word in [
        "contact", "email", "phone", "address"
    ]):
        selected_sections += ["## 7. CONTACT"]

    # Assistant identity
    if any(word in message for word in [
        "assistant", "created", "creator", "ai",
        "who made you"
    ]):
        selected_sections += ["## 8. JUNDY AI IDENTITY"]

    # Remove duplicate section names
    selected_sections = list(dict.fromkeys(selected_sections))

    # If no category matches, provide the complete knowledge base
    if not selected_sections:
        return knowledge

    relevant_knowledge = []

    for section in selected_sections:
        if section in sections:
            content = "\n".join(sections[section])
            relevant_knowledge.append(section + "\n" + content)

    return "\n\n".join(relevant_knowledge)


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

        # LOAD ONLY RELEVANT PORTFOLIO KNOWLEDGE
        knowledge = get_relevant_knowledge(user_message)

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

        
        normalized_message = user_message.lower().strip()

        # Check whether the question needs live time or business information
        time_keywords = [
            "what time", "current time", "what date",
            "current date", "what day", "today",
            "tomorrow", "yesterday", "right now",
            "open", "closed", "business hours",
            "shop hours", "operating hours",
            "are you available", "are you open",
            "is the shop", "is jundytech open",
            "sunday", "monday", "tuesday",
            "wednesday", "thursday", "friday", "saturday",
            "unsa oras", "unsay oras", "unsa petsa",
            "anong oras", "anong petsa", "bukas ba",
            "open ba", "sarado ba"
        ]

        needs_time_info = any(
            keyword in normalized_message
            for keyword in time_keywords
        )

        # Only send live time information when needed
        if needs_time_info:
            time_information = f"""
        Current Philippine time: {current_time_context}
        Timezone: Asia/Manila (UTC+8).
        Jundytech Solutions hours: Monday-Saturday, 9 AM-8 PM.
        Sunday: Normally closed.
        Current business status: {business_status}.

        Use the current business status for opening-hour questions.
        Do not confuse shop hours with Jundy's personal availability.
        Never invent availability.
        """
        else:
            time_information = ""


                
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
        You are JUNDY AI, the friendly portfolio assistant of Rodolfo G. Conejos III (Jundy).

        PERSONALITY AND STYLE:
        - Friendly, natural, respectful, and conversational.
        - Use simple English by default; support Cebuano/Bisaya and Tagalog.
        - Follow the visitor's preferred language.
        - Answer directly and concisely.
        - Simple questions: 1–3 sentences. Use bullets when helpful.

        KNOWLEDGE:
        {knowledge}

        LIVE INFORMATION:
        {time_information}
        - Use live information only when provided.
        - Never guess the current time or business status.

        ACCURACY:
        - Use documented knowledge for Jundy's personal and business information.
        - Jundy manages Jundytech Solutions. Do not claim he personally performs every business service.
        - His Asian College of Technology role was Working Scholar, not regular staff.
        - Calculate age using birthday: March 21, 2002.
        - If asked if handsome: "Of course! Jundy is a handsome guy!"
        - If asked about relationship status: "He's single and ready to mingle!"
        - Never invent personal details, qualifications, experience, certifications, projects, or achievements.
        - Distinguish Jundy's actual experience from general technical knowledge.
        - Answer general computer and IT questions accurately.
        - Give step-by-step tutorials only when requested.
        - If information is unavailable, say so honestly.

        Your goal is to welcome visitors and provide accurate information about Jundy.
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
