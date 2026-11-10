
// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");
const logo = document.getElementById("portfoliologo_clickable");


// ==========================================
// 2. MOBILE NAVIGATION
// ==========================================

menuToggle.addEventListener("click", function(event) {

    event.stopPropagation();

    navbar.classList.toggle("active");

    const isOpen = navbar.classList.contains("active");

    menuToggle.setAttribute("aria-expanded", isOpen);

    menuToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';

});


// ==========================================
// 3. NAVIGATION BUTTONS
// ==========================================

const navigationButtons = navbar.querySelectorAll("button");

navigationButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const targetId = this.getAttribute("data-target");
        const targetSection = document.getElementById(targetId);

        if (targetSection) {

            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

        navbar.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';

    });

});


// ==========================================
// 4. LOGO - GO BACK TO HOME
// ==========================================

logo.addEventListener("click", function() {

    document.getElementById("home").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    navbar.classList.remove("active");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';

});


// ==========================================
// 5. EXPANDABLE SKILLS GALLERY
// ==========================================

const skillCards = document.querySelectorAll(".skill-card");
const skillDetails = document.getElementById("skillDetails");
const skillContents = document.querySelectorAll(".skill-content");

skillCards.forEach(function(card) {

    card.addEventListener("click", function() {

        const selectedSkill = this.dataset.skill;
        const isAlreadyActive = this.classList.contains("active");

        // Remove active state from all cards
        skillCards.forEach(function(item) {
            item.classList.remove("active");
        });

        // Hide all skill contents
        skillContents.forEach(function(content) {
            content.classList.remove("active");
        });

        // Close gallery if same card is clicked
        if (isAlreadyActive) {

            skillDetails.classList.remove("show");

            return;

        }

        // Activate selected card
        this.classList.add("active");

        // Show selected content
        const selectedContent = document.getElementById(selectedSkill);

        if (selectedContent) {

            selectedContent.classList.add("active");
            skillDetails.classList.add("show");

            skillDetails.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


// ==========================================
// 6. SELECT SERVICE CATEGORY
// ==========================================

const categoryButtons = document.querySelectorAll(".category-btn");
const categoryDetails = document.querySelector(".category-details");
const categoryContents = document.querySelectorAll(".category-content");

categoryButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const categoryId = this.dataset.category;
        const isActive = this.classList.contains("active");

        // Remove active state from all categories
        categoryButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        // Hide all category contents
        categoryContents.forEach(function(content) {
            content.classList.remove("active");
        });

        // Close expanded service details
        document.querySelectorAll(".service-description").forEach(function(detail) {
            detail.classList.remove("show");
        });

        // Reset all See More buttons
        document.querySelectorAll(".service-more-btn").forEach(function(btn) {
            btn.textContent = "See More +";
        });

        // Close category if same button is clicked
        if (isActive) {

            categoryDetails.classList.remove("show");

            return;

        }

        // Activate selected category
        this.classList.add("active");

        const selectedCategory = document.getElementById(categoryId);

        if (selectedCategory) {

            selectedCategory.classList.add("active");
            categoryDetails.classList.add("show");

        }

    });

});


// ==========================================
// 7. EXPAND INDIVIDUAL SERVICE DETAILS
// ==========================================

const serviceMoreButtons = document.querySelectorAll(".service-more-btn");

serviceMoreButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const detailId = this.dataset.detail;
        const detail = document.getElementById(detailId);

        if (!detail) return;

        detail.classList.toggle("show");

        this.textContent = detail.classList.contains("show")
            ? "See Less −"
            : "See More +";

    });

});


// ==========================================
// 8. IMAGE ZOOM / LIGHTBOX
// ==========================================

const zoomImages = document.querySelectorAll(".zoomable-image");

const lightbox = document.getElementById("imageLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");
const zoomMenu = document.getElementById("zoomMenu");
const imageContainer = document.getElementById("imageContainer");
const magnifierLens = document.getElementById("magnifierLens");

let magnifierEnabled = false;

const magnification = 2.5;


// OPEN IMAGE USING LEFT CLICK

function openImage(image) {

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;

    disableMagnifier();

    zoomMenu.classList.remove("show");

    lightbox.classList.add("active");

}


// IMAGE CLICK AND THUMBNAIL RIGHT-CLICK

zoomImages.forEach(function(image) {

    image.addEventListener("click", function() {

        openImage(this);

    });

    // Prevent original thumbnail right-click menu
    image.addEventListener("contextmenu", function(event) {

        event.preventDefault();

    });

});


// SHOW CUSTOM MENU BESIDE CURSOR

function showZoomMenu(event) {

    event.preventDefault();

    if (!lightbox.classList.contains("active")) return;

    zoomMenu.classList.add("show");

    const menuWidth = zoomMenu.offsetWidth;
    const menuHeight = zoomMenu.offsetHeight;

    let x = event.clientX;
    let y = event.clientY;

    // Keep menu inside screen
    if (x + menuWidth > window.innerWidth) {

        x = window.innerWidth - menuWidth - 10;

    }

    if (y + menuHeight > window.innerHeight) {

        y = window.innerHeight - menuHeight - 10;

    }

    zoomMenu.style.left = x + "px";
    zoomMenu.style.top = y + "px";
    zoomMenu.style.right = "auto";

}


// RIGHT-CLICK ONLY ON ENLARGED IMAGE

imageContainer.addEventListener("contextmenu", function(event) {

    if (event.target !== lightboxImage) return;

    showZoomMenu(event);

});


// ENABLE MAGNIFIER

function enableMagnifier() {

    magnifierEnabled = true;

    lightboxImage.style.cursor = "crosshair";

}


// DISABLE MAGNIFIER

function disableMagnifier() {

    magnifierEnabled = false;

    magnifierLens.classList.remove("active");

    lightboxImage.style.cursor = "default";

}


// ZOOM IN

document.getElementById("zoomIn").addEventListener("click", function() {

    enableMagnifier();

    zoomMenu.classList.remove("show");

});


// ZOOM OUT

document.getElementById("zoomOut").addEventListener("click", function() {

    disableMagnifier();

    zoomMenu.classList.remove("show");

});


// RESET ZOOM

document.getElementById("resetZoom").addEventListener("click", function() {

    disableMagnifier();

    zoomMenu.classList.remove("show");

});


// CLOSE MENU WHEN CLICKING OUTSIDE

document.addEventListener("click", function(event) {

    if (!zoomMenu.contains(event.target)) {

        zoomMenu.classList.remove("show");

    }

});


// HOVER MAGNIFIER

imageContainer.addEventListener("mousemove", function(event) {

    if (!magnifierEnabled) return;

    const rect = lightboxImage.getBoundingClientRect();

    const containerRect = imageContainer.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if cursor is over actual image
    if (
        mouseX < 0 ||
        mouseY < 0 ||
        mouseX > rect.width ||
        mouseY > rect.height
    ) {

        magnifierLens.classList.remove("active");

        return;

    }

    const lensWidth = magnifierLens.offsetWidth;
    const lensHeight = magnifierLens.offsetHeight;

    // Position magnifier lens
    const lensX = event.clientX - containerRect.left - lensWidth / 2;
    const lensY = event.clientY - containerRect.top - lensHeight / 2;

    magnifierLens.style.left = lensX + "px";
    magnifierLens.style.top = lensY + "px";

    // Magnify image under cursor
    magnifierLens.style.backgroundImage = `url("${lightboxImage.src}")`;

    magnifierLens.style.backgroundSize =
        `${rect.width * magnification}px ${rect.height * magnification}px`;

    magnifierLens.style.backgroundPosition =
        `${-(mouseX * magnification - lensWidth / 2)}px ${-(mouseY * magnification - lensHeight / 2)}px`;

    magnifierLens.classList.add("active");

});


// HIDE MAGNIFIER WHEN CURSOR LEAVES IMAGE AREA

imageContainer.addEventListener("mouseleave", function() {

    magnifierLens.classList.remove("active");

});


// CLOSE LIGHTBOX

function closeImageLightbox() {

    lightbox.classList.remove("active");

    zoomMenu.classList.remove("show");

    disableMagnifier();

}

closeLightbox.addEventListener("click", closeImageLightbox);


// CLOSE WHEN CLICKING OUTSIDE IMAGE

lightbox.addEventListener("click", function(event) {

    if (event.target === lightbox) {

        closeImageLightbox();

    }

});


// ESCAPE KEY

document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        closeImageLightbox();

    }

});


// ==========================================
// 9. TYPING ANIMATION
// ==========================================

const nameText = "Jundy Gwapo";

const typingElement = document.getElementById("typingName");

let index = 0;

let deleting = false;


function typingAnimation() {

    if (!typingElement) return;

    if (!deleting) {

        typingElement.textContent = nameText.substring(0, index + 1);

        index++;

        if (index === nameText.length) {

            deleting = true;

            setTimeout(typingAnimation, 1500);

            return;

        }

    } else {

        typingElement.textContent = nameText.substring(0, index - 1);

        index--;

        if (index === 0) {

            deleting = false;

        }

    }

    setTimeout(typingAnimation, deleting ? 100 : 180);

}

typingAnimation();


// ==========================================
// 10. CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener("click", function(event) {

    if (
        !navbar.contains(event.target) &&
        !menuToggle.contains(event.target)
    ) {

        navbar.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';

    }

});



// WORK EXPERIENCE EXPAND / COLLAPSE

const experienceButtons = document.querySelectorAll(".experience-click");
const experienceDetails = document.querySelectorAll(".experience-details");

experienceButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const detailId = this.dataset.experience;
        const selectedDetail = document.getElementById(detailId);

        if (!selectedDetail) return;

        const isAlreadyActive = selectedDetail.classList.contains("show");

        // Close all experience details
        experienceDetails.forEach(function(detail) {
            detail.classList.remove("show");
        });

        // Reset all experience buttons
        experienceButtons.forEach(function(item) {
            item.classList.remove("active");

            const arrow = item.querySelector(".experience-arrow");

            if (arrow) {
                arrow.textContent = "VIEW DETAILS ↓";
            }
        });

        // Open selected experience
        if (!isAlreadyActive) {

            selectedDetail.classList.add("show");
            this.classList.add("active");

            const arrow = this.querySelector(".experience-arrow");

            if (arrow) {
                arrow.textContent = "HIDE DETAILS ↑";
            }

            selectedDetail.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });

});



// PORTFOLIO SEARCH FUNCTION

const portfolioSearch = document.getElementById("portfolioSearch");
const searchBtn = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResults");

const searchableSections = [
    {
        name: "Home",
        keywords: ["home", "main page", "introduction"],
        target: "home"
    },
    {
        name: "About Me",
        keywords: ["about", "profile", "background", "education"],
        target: "about"
    },
    {
        name: "Work Experience",
        keywords: [
            "experience",
            "ojt",
            "internship",
            "cad operator",
            "computer technician",
            "it support",
            "technical assistant",
            "working scholar"
        ],
        target: "experience"
    },
    {
        name: "My Skills",
        keywords: [
            "skills",
            "hardware",
            "software",
            "networking",
            "troubleshooting",
            "programming"
        ],
        target: "skills"
    },
    {
        name: "Contact Me",
        keywords: ["contact", "email", "phone", "message"],
        target: "contact"
    }
];

function performSearch() {

    const query = portfolioSearch.value.trim().toLowerCase();

    searchResults.innerHTML = "";

    if (!query) {
        searchResults.classList.remove("active");
        return;
    }

    const matches = searchableSections.filter(section => {

        return section.name.toLowerCase().includes(query) ||
            section.keywords.some(keyword => keyword.includes(query));

    });

    if (matches.length === 0) {
        searchResults.innerHTML =
            '<div class="search-empty">No results found.</div>';
    } else {

        matches.forEach(section => {

            const result = document.createElement("button");

            result.className = "search-result-item";
            result.textContent = section.name;

            result.addEventListener("click", () => {

                const target = document.getElementById(section.target);

                if (target) {
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }

                portfolioSearch.value = "";
                searchResults.classList.remove("active");

            });

            searchResults.appendChild(result);

        });

    }

    searchResults.classList.add("active");
}

portfolioSearch.addEventListener("input", performSearch);

searchBtn.addEventListener("click", performSearch);

portfolioSearch.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        event.preventDefault();

        const firstResult = searchResults.querySelector(
            ".search-result-item"
        );

        if (firstResult) {
            firstResult.click();
        } else {
            performSearch();
        }
    }

    if (event.key === "Escape") {
        searchResults.classList.remove("active");
    }

});

document.addEventListener("click", function(event) {

    if (!event.target.closest(".search-container")) {
        searchResults.classList.remove("active");
    }

});


/* ===================================== */
/* JUNDY PORTFOLIO CHATBOT */
/* ===================================== */

// ===============================
// CHATBOT
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const toggle = document.getElementById("chatbotToggle");
    const chatWindow = document.getElementById("chatbotWindow");
    const closeButton = document.getElementById("closeChatbot");
    const messages = document.getElementById("chatbotMessages");
    const input = document.getElementById("chatbotInput");
    const sendButton = document.getElementById("chatbotSend");
    const quickQuestions = document.querySelector(".chatbot-quick-questions");

            // ===============================
        // RANDOM CHATBOT GREETINGS
        // ===============================

        const greeting = document.getElementById("chatbotGreeting");

        const greetingMessages = [
            "Hi! Need help exploring my portfolio? 👋",
            "Hello there! Have questions about Jundy?",
            "Want to know more about my technical skills?",
            "Looking for my work experience? Ask me!",
            "Feel free to chat with my virtual assistant!",
            "Need help? I'm just one click away! 😊"
        ];

        let greetingTimeout;
        let greetingInterval;

        function showRandomGreeting() {

            if (!greeting || chatWindow.classList.contains("active")) {
                return;
            }

            const randomMessage =
                greetingMessages[Math.floor(Math.random() * greetingMessages.length)];

            greeting.textContent = randomMessage;
            greeting.classList.add("show");

            clearTimeout(greetingTimeout);

            greetingTimeout = setTimeout(function () {
                greeting.classList.remove("show");
            }, 4000);
        }

        // FIRST GREETING AFTER 2 SECONDS
        setTimeout(showRandomGreeting, 2000);

        // REPEAT GREETINGS
        greetingInterval = setInterval(function () {

            if (!chatWindow.classList.contains("active")) {
                showRandomGreeting();
            }

        }, 12000);

    // CHECK REQUIRED HTML ELEMENTS
    if (!toggle || !chatWindow || !messages || !input || !sendButton) {
        console.error("Chatbot error: One or more HTML elements are missing.");
        return;
    }

    // OPEN CHATBOT
    toggle.addEventListener("click", function () {
        chatWindow.classList.toggle("active");
    });

    // CLOSE CHATBOT
    if (closeButton) {
        closeButton.addEventListener("click", function () {
            chatWindow.classList.remove("active");
        });
    }

    // DISPLAY MESSAGE
    // ===============================
// ADD CHAT MESSAGE
// ===============================

  
function addChatMessage(message, sender) {

    const messageElement = document.createElement("div");

    messageElement.classList.add(
        sender === "user" ? "user-message" : "bot-message"
    );

    if (sender === "bot") {

        // GOOGLE MAPS LINK
        if (message.includes("https://www.google.com/maps/")) {

            const mapURL = "https://www.google.com/maps/search/?api=1&query=Jundytech+Solutions";

            const parts = message.split("https://www.google.com/maps/");

            messageElement.textContent = parts[0];

            const mapLink = document.createElement("a");
            mapLink.href = mapURL;
            mapLink.textContent = "📍 Open Location in Google Maps";
            mapLink.target = "_blank";
            mapLink.rel = "noopener noreferrer";

            messageElement.appendChild(mapLink);

        }

        // GMAIL LINK
        else if (message.includes("jundyconejos@gmail.com")) {

            const parts = message.split("jundyconejos@gmail.com");

            messageElement.appendChild(
                document.createTextNode(parts[0])
            );

            const emailLink = document.createElement("a");

            emailLink.href = "https://mail.google.com/mail/?view=cm&fs=1&to=jundyconejos@gmail.com";
            emailLink.textContent = "jundyconejos@gmail.com";
            emailLink.target = "_blank";
            emailLink.rel = "noopener noreferrer";

            messageElement.appendChild(emailLink);

            if (parts[1]) {
                messageElement.appendChild(
                    document.createTextNode(parts[1])
                );
            }

        }

        else {
            messageElement.textContent = message;
        }

    } else {
        messageElement.textContent = message;
    }

    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}


    
    // ==========================================
    // GEMINI AI CHATBOT RESPONSE
    // ==========================================

    
    async function getChatbotResponse(message) {

        const text = message.toLowerCase();

        // KEEP GOOGLE MAPS FUNCTIONALITY
        if (
            text.includes("location") ||
            text.includes("where") ||
            text.includes("address") ||
            text.includes("map")
        ) {
            return "You can find Jundytech Solutions here: https://www.google.com/maps/search/?api=1&query=Jundytech+Solutions";
        }

        // GET OR CREATE A UNIQUE VISITOR ID
        function getVisitorId() {
            let visitorId = localStorage.getItem("jundy_ai_visitor_id");

            if (!visitorId) {
                visitorId = crypto.randomUUID();
                localStorage.setItem("jundy_ai_visitor_id", visitorId);
            }

            return visitorId;
        }

        try {
            // CONNECT TO JUNDY ASSISTANT BACKEND
            const response = await fetch(
                //"https://jundy-assistant-api.onrender.com/chat",
                "http://127.0.0.1:5000/chat",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                    message: message,
                    history: conversationHistory,
                    visitor_id: getVisitorId(),
                    device_name: navigator.userAgentData?.platform || navigator.platform || "Unknown Device",
                    browser_name: navigator.userAgent
                })
                }
            );

            console.log("HTTP STATUS:", response.status);

            const responseText = await response.text();

            console.log("RAW BACKEND RESPONSE:", responseText);

            let data;

            try {
                data = JSON.parse(responseText);
            } catch (error) {
                throw new Error("Backend returned an invalid response.");
            }

            console.log("BACKEND DATA:", data);

            if (response.status === 429 && data.error === "daily_limit_reached") {
            const error = new Error(data.message);
            error.code = "DAILY_LIMIT_REACHED";
            error.limitData = data;
            throw error;
            }

            if (!response.ok) {
                throw new Error(data.error || "Backend request failed.");
            }

            if (!data.reply) {
                throw new Error("Backend returned an empty AI reply.");
            }

            return data.reply;

        } catch (error) {
            console.error("JUNDY ASSISTANT ERROR:", error);
            throw error;
        }
    }



    
    // STORE CHAT CONVERSATION
    let conversationHistory = [];

    // ==========================================
    // SEND MESSAGE TO AI CHATBOT
    // ==========================================
    async function sendChatMessage(messageText) {

        const message = (
            messageText !== undefined ? messageText : input.value
        ).trim();

        if (message === "") return;

        // DISPLAY VISITOR MESSAGE
        addChatMessage(message, "user");

        input.value = "";

        try {

            // GET AI RESPONSE
            const response = await getChatbotResponse(message);

            // SAVE CONVERSATION
            conversationHistory.push({
                role: "user",
                content: message
            });

            conversationHistory.push({
                role: "assistant",
                content: response
            });

            // DISPLAY AI RESPONSE
            addChatMessage(response, "bot");

        } catch (error) {

            console.error("AI Chatbot Error:", error);

            if (error.code === "DAILY_LIMIT_REACHED") {

                showDailyLimitPopup();

            } else {

                addChatMessage(
                    "CHATBOT ERROR: " + error.message,
                    "bot"
                );

            }

        }
    }


    // SEND BUTTON
    sendButton.addEventListener("click", function () {
        sendChatMessage();
    });

    // ENTER KEY
    input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendChatMessage();
    }
    });

    // QUICK QUESTION BUTTONS
    if (quickQuestions) {
        quickQuestions.addEventListener("click", function (event) {

            const button = event.target.closest("button[data-question]");

            if (!button) return;

            event.preventDefault();

            const question = button.getAttribute("data-question");

            if (question) {
                sendChatMessage(question);
            }
        });
    }

    console.log("Chatbot successfully initialized!");

});

// UNBLUR PROFILE WHEN GET IN TOUCH IS CLICKED

document.addEventListener("DOMContentLoaded", function () {

    const getInTouchButton = document.getElementById("getInTouchButton");
    const profilePicture = document.querySelector(".profile-picture");

    if (getInTouchButton && profilePicture) {

        getInTouchButton.addEventListener("click", function () {

            profilePicture.classList.remove("profile-blurred");
            profilePicture.classList.add("profile-revealed");

        });

    }

});

// GET IN TOUCH - REVEAL PROFILE AND RESUME BUTTON

document.addEventListener("DOMContentLoaded", function () {

    const getInTouchButton = document.getElementById("getInTouchButton");
    const viewResumeButton = document.getElementById("viewResumeButton");
    const profilePicture = document.querySelector(".profile-picture");

    if (getInTouchButton && viewResumeButton && profilePicture) {

        getInTouchButton.addEventListener("click", function () {

            // UNBLUR PROFILE PICTURE
            profilePicture.classList.add("profile-revealed");

            // HIDE GET IN TOUCH BUTTON
            getInTouchButton.style.display = "none";

            // SHOW VIEW RESUME BUTTON
            viewResumeButton.classList.add("show");

        });

    }

});

// ==========================================
// DAILY QUESTION LIMIT POPUP
// ==========================================
function showDailyLimitPopup() {

    // Prevent duplicate popups
    if (document.getElementById("dailyLimitPopup")) return;

    const overlay = document.createElement("div");
    overlay.id = "dailyLimitPopup";

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        padding: 20px;
    `;

    overlay.innerHTML = `
        <div style="
            background: #151515;
            border: 1px solid #ff3333;
            border-radius: 15px;
            padding: 30px;
            max-width: 380px;
            width: 100%;
            text-align: center;
            color: white;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 25px rgba(255, 0, 0, 0.25);
        ">

            <h2 style="color: #ff3333;">
                Daily Limit Reached!
            </h2>

            <p>
                You've used all 20 questions available for today.
            </p>

            <p style="color: #bbb;">
                You can chat with JUNDY AI again tomorrow.
            </p>

            <hr style="border-color: #444; margin: 20px 0;">

            <h3 style="color: #ff3333;">
                Support Jundytech Solutions
            </h3>

            <p style="color: #ccc; font-size: 14px;">
                If you enjoy using JUNDY AI, you can support
                this project through GCash.
            </p>

            <p style="color: #888; font-size: 13px;">
                GCash sponsorship details coming soon.
            </p>

            <button id="closeDailyLimitPopup" style="
                margin-top: 15px;
                padding: 12px 25px;
                background: #ff3333;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            ">
                Close
            </button>

        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("closeDailyLimitPopup")
        .addEventListener("click", () => {
            overlay.remove();
        });
}