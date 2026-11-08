
import os

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
PORTFOLIO_INFO = """
You are JUNDY ASSISTANT, the AI virtual assistant of Rodolfo Conejos.

About:
- Computer Engineering graduate.
- IT Support Specialist and Computer Technician.

Experience:
1. Jundick's Gaming Hub:
   Computer Technician / IT Support.
   Handles computer shop management, PC troubleshooting,
   computer assembly, Windows installation, software installation,
   maintenance, printer repair and CCTV installation.

2. Asian College of Technology:
   Working Scholar / Technical Support.
   Assisted with computer laboratory and office technical support,
   hardware and software troubleshooting, and preventive maintenance.

3. Verdida Surveying and Construction Services:
   OJT CAD Operator.
   Worked with AutoCAD land-lot plotting and technical support.

Contact:
Email: jundyconejos@gmail.com

Location:
Jundytech Solutions, Cebu City, Philippines.

Instructions:
- Answer naturally and professionally.
- Use simple, understandable English.
- Be friendly and helpful.
- Answer based on the portfolio information.
- Never invent qualifications, work experience, or contact details.
- If information is unavailable, say so honestly.
- Keep answers concise.
"""


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

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": PORTFOLIO_INFO
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            temperature=0.7,
            max_completion_tokens=500
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
    app.run(host="127.0.0.1", port=5000, debug=True)
