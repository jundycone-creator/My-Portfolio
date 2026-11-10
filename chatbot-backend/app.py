
import os
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import insert
from functools import wraps
from werkzeug.security import check_password_hash
import secrets


# Load API key from .env
load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = os.getenv(
    "SESSION_COOKIE_SAMESITE", "Lax"
)
app.config["SESSION_COOKIE_SECURE"] = (
    os.getenv("SESSION_COOKIE_SECURE", "False").lower() == "true"
)

if not app.config["SECRET_KEY"]:
    raise RuntimeError("SECRET_KEY is not configured.")

# Database configuration
database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL is not configured.")

if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

if database_url.startswith("postgresql://"):
    database_url = database_url.replace(
        "postgresql://",
        "postgresql+psycopg2://",
        1
    )

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_timeout": 30,
    "connect_args": {
        "sslmode": "require"
    }
}

db = SQLAlchemy(app)
DAILY_QUESTION_LIMIT = 2
PHILIPPINE_TIMEZONE = ZoneInfo("Asia/Manila")

class VisitorUsage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    visitor_id = db.Column(db.String(64), nullable=False)
    usage_date = db.Column(db.Date, nullable=False)
    question_count = db.Column(db.Integer, default=0, nullable=False)

    __table_args__ = (
        db.UniqueConstraint(
            "visitor_id",
            "usage_date",
            name="uq_visitor_usage_date"
        ),
    )

class ResumeDownloadRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    purpose = db.Column(db.Text, nullable=False)

    status = db.Column(
        db.String(20),
        default="pending",
        nullable=False
    )

    request_date = db.Column(
        db.DateTime,
        default=lambda: datetime.now(PHILIPPINE_TIMEZONE)
    )

    approval_date = db.Column(db.DateTime, nullable=True)

    download_token = db.Column(db.String(128), nullable=True)
    token_expiration = db.Column(db.DateTime, nullable=True)

class VisitorAccess(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    visitor_id = db.Column(db.String(64), unique=True, nullable=False)
    device_name = db.Column(db.String(100), nullable=True)
    device_label = db.Column(db.String(100), nullable=True)
    browser_name = db.Column(db.String(100), nullable=True)
    access_type = db.Column(
        db.String(20),
        default="limited",
        nullable=False
    )
    is_blocked = db.Column(db.Boolean, default=False, nullable=False)
    first_seen = db.Column(
        db.DateTime,
        default=lambda: datetime.now(PHILIPPINE_TIMEZONE)
    )
    last_seen = db.Column(
        db.DateTime,
        default=lambda: datetime.now(PHILIPPINE_TIMEZONE),
        onupdate=lambda: datetime.now(PHILIPPINE_TIMEZONE)
    )


def record_visitor_question(visitor_id, device_name=None, browser_name=None):
    today = datetime.now(PHILIPPINE_TIMEZONE).date()
    now = datetime.now(PHILIPPINE_TIMEZONE)
    device_name = (device_name or "Unknown Device")[:100]
    browser_name = (browser_name or "Unknown Browser")[:100]

    try:
        # Register the visitor if they do not exist yet.
        statement = insert(VisitorAccess).values(
            visitor_id=visitor_id,
            device_name=device_name,
            device_label="Unnamed Device",
            browser_name=browser_name,
            access_type="limited",
            is_blocked=False
        )

        statement = statement.on_conflict_do_nothing(
            index_elements=["visitor_id"]
        )

        db.session.execute(statement)

        # Retrieve and lock the visitor's access record.
        visitor = VisitorAccess.query.filter_by(
            visitor_id=visitor_id
        ).with_for_update().first()

        visitor.last_seen = now

        if device_name:
            visitor.device_name = device_name

        if browser_name:
            visitor.browser_name = browser_name

        # Check whether the visitor is blocked.
        if visitor.is_blocked:
            db.session.commit()

            return {
                "blocked": True,
                "access_type": visitor.access_type,
                "used": 0
            }

        # Count questions for both limited and unlimited visitors.
        usage_statement = insert(VisitorUsage).values(
            visitor_id=visitor_id,
            usage_date=today,
            question_count=1
        )

        usage_statement = usage_statement.on_conflict_do_update(
            index_elements=["visitor_id", "usage_date"],
            set_={
                "question_count": VisitorUsage.question_count + 1
            },
            where=(
                VisitorUsage.question_count < DAILY_QUESTION_LIMIT
                if visitor.access_type == "limited"
                else True
            )
        ).returning(VisitorUsage.question_count)

        used_questions = db.session.execute(
            usage_statement
        ).scalar_one_or_none()

        db.session.commit()

        return {
            "blocked": False,
            "access_type": visitor.access_type,
            "used": used_questions
        }

    except Exception:
        db.session.rollback()
        raise

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://127.0.0.1:5500",
                "https://jundycone-creator.github.io"
            ]
        }
    },
    supports_credentials=True
)

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

def admin_required(view_function):
    @wraps(view_function)
    def decorated_function(*args, **kwargs):

        if not session.get("is_admin"):
            return jsonify({
                "error": "Unauthorized",
                "message": "Admin login required."
            }), 401

        return view_function(*args, **kwargs)

    return decorated_function

def admin_origin_required(view_function):
    @wraps(view_function)
    def decorated_function(*args, **kwargs):
        allowed_origins = {
            "http://127.0.0.1:5500",
            "https://jundycone-creator.github.io"
        }

        origin = request.headers.get("Origin")

        if origin not in allowed_origins:
            return jsonify({
                "error": "Forbidden",
                "message": "Invalid request origin."
            }), 403

        return view_function(*args, **kwargs)

    return decorated_function

@app.route("/admin/login", methods=["POST"])
@admin_origin_required
def admin_login():
    data = request.get_json(silent=True) or {}

    username = data.get("username", "")
    password = data.get("password", "")

    admin_username = os.getenv("ADMIN_USERNAME", "")
    admin_password_hash = os.getenv("ADMIN_PASSWORD_HASH", "")

    if not isinstance(username, str) or not isinstance(password, str):
        return jsonify({"error": "Invalid credentials"}), 401

    if not admin_username or not admin_password_hash:
        return jsonify({"error": "Admin credentials are not configured"}), 500

    if (
        username != admin_username
        or not check_password_hash(admin_password_hash, password)
    ):
        return jsonify({"error": "Incorrect username or password"}), 401

    session.clear()
    session["is_admin"] = True

    return jsonify({
        "success": True,
        "message": "Admin login successful."
    })


@app.route("/admin/logout", methods=["POST"])
@admin_required
def admin_logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Admin logged out successfully."
    })


@app.route("/admin/visitors", methods=["GET"])
@admin_required
def admin_visitors():

    today = datetime.now(PHILIPPINE_TIMEZONE).date()

    visitors = VisitorAccess.query.order_by(
        VisitorAccess.last_seen.desc()
    ).all()

    visitor_list = []

    for visitor in visitors:

        usage = VisitorUsage.query.filter_by(
            visitor_id=visitor.visitor_id,
            usage_date=today
        ).first()

        visitor_list.append({
            "visitor_id": visitor.visitor_id,
            "device_label": visitor.device_label,
            "device_name": visitor.device_name,
            "browser_name": visitor.browser_name,
            "access_type": visitor.access_type,
            "is_blocked": visitor.is_blocked,
            "questions_today": usage.question_count if usage else 0,
            "first_seen": visitor.first_seen.isoformat() if visitor.first_seen else None,
            "last_seen": visitor.last_seen.isoformat() if visitor.last_seen else None
        })

    return jsonify({
        "success": True,
        "total_visitors": len(visitor_list),
        "visitors": visitor_list
    })


@app.route("/admin/visitors/rename", methods=["POST"])
@admin_required
def rename_visitor():

    data = request.get_json(silent=True) or {}

    visitor_id = data.get("visitor_id")
    device_label = data.get("device_label")

    if not isinstance(visitor_id, str) or not isinstance(device_label, str):
        return jsonify({"error": "Invalid input"}), 400

    device_label = device_label.strip()

    if not device_label or len(device_label) > 100:
        return jsonify({
            "error": "Device name must contain 1 to 100 characters."
        }), 400

    visitor = VisitorAccess.query.filter_by(
        visitor_id=visitor_id
    ).first()

    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404

    visitor.device_label = device_label

    try:
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Device name updated successfully.",
            "device_label": visitor.device_label
        })

    except Exception:
        db.session.rollback()
        raise


@app.route("/admin/visitors/access", methods=["POST"])
@admin_required
def update_visitor_access():

    data = request.get_json(silent=True) or {}

    visitor_id = data.get("visitor_id")
    access_type = data.get("access_type")
    is_blocked = data.get("is_blocked")

    if not isinstance(visitor_id, str):
        return jsonify({"error": "Invalid visitor ID"}), 400

    if access_type not in ["limited", "unlimited"]:
        return jsonify({"error": "Invalid access type"}), 400

    if type(is_blocked) is not bool:
        return jsonify({"error": "Invalid blocked status"}), 400

    visitor = VisitorAccess.query.filter_by(
        visitor_id=visitor_id
    ).first()

    if not visitor:
        return jsonify({"error": "Visitor not found"}), 404

    visitor.access_type = access_type
    visitor.is_blocked = is_blocked

    try:
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Visitor access updated successfully.",
            "visitor_id": visitor.visitor_id,
            "access_type": visitor.access_type,
            "is_blocked": visitor.is_blocked
        })

    except Exception:
        db.session.rollback()
        raise

@app.route("/resume/request", methods=["POST"])
def request_resume_download():

    data = request.get_json()

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip()
    purpose = data.get("purpose", "").strip()

    if not full_name or not email or not purpose:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    new_request = ResumeDownloadRequest(
        full_name=full_name,
        email=email,
        purpose=purpose,
        status="pending"
    )

    db.session.add(new_request)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Resume request submitted successfully."
    }), 201

# ADMIN: LOAD RESUME DOWNLOAD REQUESTS
@app.route("/admin/resume-requests", methods=["GET"])
@admin_required
def get_resume_requests():

    requests_list = ResumeDownloadRequest.query.order_by(
        ResumeDownloadRequest.request_date.desc()
    ).all()

    return jsonify({
        "success": True,
        "requests": [
            {
                "id": item.id,
                "full_name": item.full_name,
                "email": item.email,
                "purpose": item.purpose,
                "status": item.status,
                "request_date": (
                    item.request_date.isoformat()
                    if item.request_date else None
                )
            }
            for item in requests_list
        ]
    }), 200

@app.route("/resume/preview/<int:page_number>", methods=["GET"])
def preview_resume_page(page_number):

    if page_number not in [1, 2]:
        return jsonify({
            "error": "Resume page not found."
        }), 404

    image_folder = (
        Path(__file__).resolve().parent
        / "resume_preview"
    )

    return send_from_directory(
        image_folder,
        f"resume_page_{page_number}.jpg",
        mimetype="image/jpeg",
        as_attachment=False
    )

def submit_resume_request():

    data = request.get_json(silent=True) or {}

    full_name = data.get("full_name", "")
    email = data.get("email", "")
    purpose = data.get("purpose", "")

    if not all(isinstance(value, str) for value in [
        full_name, email, purpose
    ]):
        return jsonify({"error": "Invalid input."}), 400

    full_name = full_name.strip()
    email = email.strip()
    purpose = purpose.strip()

    if not full_name or not email or not purpose:
        return jsonify({
            "error": "Please complete all required fields."
        }), 400

    if len(full_name) > 150 or len(email) > 150 or len(purpose) > 2000:
        return jsonify({
            "error": "One or more fields exceed the allowed length."
        }), 400

    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"error": "Invalid email address."}), 400

    new_request = ResumeDownloadRequest(
        full_name=full_name,
        email=email,
        purpose=purpose
    )

    try:
        db.session.add(new_request)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Your resume access request has been submitted successfully.",
            "request_id": new_request.id
        }), 201

    except Exception:
        db.session.rollback()
        return jsonify({
            "error": "Unable to submit your request. Please try again."
        }), 500

@app.route("/chat", methods=["POST"])
def chat():
    print("========== NEW CHAT FUNCTION RUNNING ==========")

    try:
        print("CONTENT TYPE:", request.content_type)
        print("RAW REQUEST:", request.get_data(as_text=True))

        data = request.get_json(silent=True) or {}

        print("\n========== NEW CHAT MESSAGE ==========")
        print("VISITOR ID:", data.get("visitor_id"))
        print("USER MESSAGE:", data.get("message"))

        print("PARSED DATA:", data)

        visitor_id = data.get("visitor_id", "")

        if not isinstance(visitor_id, str) or not (16 <= len(visitor_id) <= 64):
            return jsonify({"error": "Invalid visitor ID"}), 400

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
        # CHECK DAILY VISITOR QUESTION LIMIT
        # CHECK VISITOR ACCESS
        device_name = data.get("device_name", "Unknown Device")
        browser_name = data.get("browser_name", "Unknown Browser")

        visitor_result = record_visitor_question(
            visitor_id,
            device_name,
            browser_name
        )

        # BLOCKED VISITOR
        if visitor_result["blocked"]:
            return jsonify({
                "error": "visitor_blocked",
                "message": "Access to JUNDY AI has been restricted."
            }), 403

        used_questions = visitor_result["used"]
        access_type = visitor_result["access_type"]

        # UNLIMITED ACCESS
        if access_type == "unlimited":
            remaining_questions = None

        # LIMITED ACCESS
        else:
            if used_questions is None:
                return jsonify({
                    "error": "daily_limit_reached",
                    "limit": DAILY_QUESTION_LIMIT,
                    "used": DAILY_QUESTION_LIMIT,
                    "remaining": 0,
                    "message": "Sorry for the limited access! JUNDY AI currently has limited daily usage because AI services come with a cost. If you would like to support this project, any GCash contribution would be greatly appreciated. Your support will help me afford an AI plan so everyone can enjoy unlimited access. Thank you! ❤️"
                }), 429

        remaining_questions = DAILY_QUESTION_LIMIT - used_questions
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

            return jsonify({
            "reply": reply,
            "limit": DAILY_QUESTION_LIMIT,
            "used": used_questions,
            "remaining": remaining_questions
        })

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
        print("JUNDY AI RESPONSE:", reply)
        return jsonify({
        "reply": reply,
        "limit": DAILY_QUESTION_LIMIT,
        "used": used_questions,
        "remaining": remaining_questions
    })

    

    except Exception as e:

        print("Groq Chatbot Error:", str(e))

        return jsonify({
            "error": "Sorry, the AI assistant is temporarily unavailable."
        }), 500



if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)


with app.app_context():
    db.create_all()
