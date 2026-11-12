
// BACKEND API CONFIGURATION
const API_URL = window.location.hostname === "127.0.0.1" ||
                window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000"
    : "https://jundy-assistant-api.onrender.com";
console.log("JUNDY API CONFIG LOADED:", API_URL);
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

const nameText = "RODOLFO CONEJOS III";

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


    // OPEN RESUME PREVIEW
    const previewResumeButton = document.getElementById("previewResumeButton");
    const resumePreviewOverlay = document.getElementById("resumePreviewOverlay");
    const closeResumePreview = document.getElementById("closeResumePreview");

    if (previewResumeButton && resumePreviewOverlay) {

        previewResumeButton.addEventListener("click", function () {
            resumePreviewOverlay.classList.add("show");
        });

    }

    if (closeResumePreview && resumePreviewOverlay) {

        closeResumePreview.addEventListener("click", function () {
            resumePreviewOverlay.classList.remove("show");
        });

    }

    // REQUEST RESUME DOWNLOAD
    const requestResumeDownload = document.getElementById("requestResumeDownload");
    const resumeRequestOverlay = document.getElementById("resumeRequestOverlay");
    const resumeRequestForm = document.getElementById("resumeRequestForm");
    const submitResumeRequest = document.getElementById("submitResumeRequest");
    const resumeRequestMessage = document.getElementById("resumeRequestMessage");

    if (requestResumeDownload && resumeRequestOverlay) {

        requestResumeDownload.addEventListener("click", function () {
            resumeRequestOverlay.classList.add("show");
        });

    }

    function closeResumeRequestForm() {
        resumeRequestOverlay.classList.remove("show");
        resumeRequestMessage.textContent = "";
    }

    document.getElementById("closeResumeRequest").addEventListener(
        "click", closeResumeRequestForm
    );

    document.getElementById("cancelResumeRequest").addEventListener(
        "click", closeResumeRequestForm
    );

    if (resumeRequestForm) {

        resumeRequestForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            const fullName = document.getElementById("resumeFullName").value.trim();
            const email = document.getElementById("resumeEmail").value.trim();
            const purpose = document.getElementById("resumePurpose").value.trim();

            if (!fullName || !email || !purpose) {
                resumeRequestMessage.textContent = "Please complete all fields.";
                return;
            }

            submitResumeRequest.disabled = true;
            submitResumeRequest.innerHTML = "Submitting Request...";

            resumeRequestMessage.textContent = "";

            try {

                const response = await fetch(
                    `${window.location.hostname === "127.0.0.1" ||
                    window.location.hostname === "localhost"
                        ? "http://127.0.0.1:5000"
                        : "https://jundy-assistant-api.onrender.com"}/resume/request`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            full_name: fullName,
                            email: email,
                            purpose: purpose
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || data.error || "Request failed.");
                }

                alert("Your resume request has been submitted successfully. Please wait for approval.");

                resumeRequestForm.reset();
                closeResumeRequestForm();

            } catch (error) {

                console.error("Resume request error:", error);

                resumeRequestMessage.textContent =
                    error.message || "Unable to submit your request. Please try again.";

            } finally {

                submitResumeRequest.disabled = false;
                submitResumeRequest.innerHTML =
                    '<i class="fa-solid fa-paper-plane"></i> Submit Request';

            }

        });

    }



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

    // OPEN CHATBOT WITH DAILY USAGE NOTICE
    toggle.addEventListener("click", function () {

        // If chatbot is already open, close it
        if (chatWindow.classList.contains("active")) {
            chatWindow.classList.remove("active");
            return;
        }

        // Check if user already accepted during this session
        if (sessionStorage.getItem("jundyAIUsageAccepted") === "true") {
            chatWindow.classList.add("active");
            return;
        }

        // Show notice before opening chatbot
        showAIUsageNotice(() => {
            chatWindow.classList.add("active");
        });

    });

        // APPEAL REQUEST MODAL
    const appealButton = document.querySelector(".blocked-appeal-button");
    const appealRequestOverlay = document.getElementById("appealRequestOverlay");
    const closeAppealRequest = document.getElementById("closeAppealRequest");
    const cancelAppealRequest = document.getElementById("cancelAppealRequest");
    const appealRequestForm = document.getElementById("appealRequestForm");
    const appealRequestMessage = document.getElementById("appealRequestMessage");
    const submitAppealRequest = document.getElementById("submitAppealRequest");

    if (appealRequestForm) {

        appealRequestForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const fullName = document.getElementById("appealFullName").value.trim();
            const email = document.getElementById("appealEmail").value.trim();
            const reason = document.getElementById("appealReason").value.trim();

            const visitorId = getVisitorId();

            appealRequestMessage.textContent = "Submitting your appeal...";
            submitAppealRequest.disabled = true;

            try {
                const response = await fetch(
                    `${API_URL}/appeal`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            visitor_id: visitorId,
                            full_name: fullName,
                            email: email,
                            reason: reason
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Appeal submission failed.");
                }

                appealRequestMessage.textContent = data.message;

                appealRequestForm.reset();

                setTimeout(function () {
                    appealRequestOverlay.classList.remove("show");
                }, 1500);

                // Automatically close the appeal form after successful submission
                setTimeout(() => {
                    const appealOverlay = document.getElementById("appealRequestOverlay");

                    if (appealOverlay) {
                        appealOverlay.classList.remove("active");
                    }
                }, 1500);

            } catch (error) {
                console.error("APPEAL SUBMISSION ERROR:", error);
                appealRequestMessage.textContent = error.message;

            } finally {
                submitAppealRequest.disabled = false;
            }
        });

    }

    if (appealButton && appealRequestOverlay) {

        appealButton.addEventListener("click", function (event) {
            event.preventDefault();
            appealRequestOverlay.classList.add("show");
        });

    }

    if (closeAppealRequest && appealRequestOverlay) {
        closeAppealRequest.addEventListener("click", function () {
            appealRequestOverlay.classList.remove("show");
        });
    }

    if (cancelAppealRequest && appealRequestOverlay) {
        cancelAppealRequest.addEventListener("click", function () {
            appealRequestOverlay.classList.remove("show");
        });
    }


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



        try {
            // CONNECT TO JUNDY ASSISTANT BACKEND
            const response = await fetch(
                `${API_URL}/chat`,
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

            if (response.status === 403 && data.error === "visitor_blocked") {
                const error = new Error(data.message);
                error.code = "VISITOR_BLOCKED";
                throw error;
            }

            if (!response.ok) {
                throw new Error(data.error || "Backend request failed.");
            }

            if (!data.reply) {
                throw new Error("Backend returned an empty AI reply.");
            }

            return {
                reply: data.reply,
                warning: data.warning
            };

        } catch (error) {
            console.error("JUNDY ASSISTANT ERROR:", error);
            alert(
                "JUNDY AI ERROR:\n" +
                error.name + "\n" +
                error.message
            );
            throw error;
        }
    }

    // GET OR CREATE A UNIQUE VISITOR ID
        function getVisitorId() {
            let visitorId = localStorage.getItem("jundy_ai_visitor_id");

            if (!visitorId) {
                visitorId = crypto.randomUUID();
                localStorage.setItem("jundy_ai_visitor_id", visitorId);
            }

            console.log("Current Visitor ID:", visitorId);
            return visitorId;
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
            const responseData = await getChatbotResponse(message);
            const response = responseData.reply;

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

            // DISPLAY ABUSE WARNING
            if (responseData.warning) {
                addChatMessage(responseData.warning, "bot");
            }

        } catch (error) {

            console.error("AI Chatbot Error:", error);

            if (error.code === "VISITOR_BLOCKED") {

                showBlockedScreen();

            } else if (error.code === "DAILY_LIMIT_REACHED") {

                showDailyLimitPopup();

            } else {

                addChatMessage(
                    "CHATBOT ERROR: " + error.message,
                    "bot"
                );

            }

        }
    }

    function showBlockedScreen() {

        const blockedScreen = document.getElementById("blockedAccessScreen");
        const messages = document.getElementById("chatbotMessages");
        const quickQuestions = document.querySelector(".chatbot-quick-questions");
        const inputArea = document.querySelector(".chatbot-input-area");
        const input = document.getElementById("chatbotInput");
        const sendButton = document.getElementById("chatbotSend");

        if (blockedScreen) blockedScreen.style.display = "flex";
        if (messages) messages.style.display = "none";
        if (quickQuestions) quickQuestions.style.display = "none";
        if (inputArea) inputArea.style.display = "none";

        if (input) input.disabled = true;
        if (sendButton) sendButton.disabled = true;

        const status = document.querySelector(".chatbot-header .chatbot-title span");

        if (status) {
            status.textContent = "● Access Restricted";
            status.style.color = "#ef4444";
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

    const resumePreviewOverlay = document.getElementById("resumePreviewOverlay");
    const closeResumePreview = document.getElementById("closeResumePreview");


    // GET IN TOUCH FUNCTION
    if (getInTouchButton && viewResumeButton && profilePicture) {

        getInTouchButton.addEventListener("click", function () {

            profilePicture.classList.add("profile-revealed");

            getInTouchButton.style.display = "none";

            viewResumeButton.classList.add("show");

        });

    }


    // OPEN RESUME PREVIEW
    if (viewResumeButton && resumePreviewOverlay) {

        viewResumeButton.addEventListener("click", function () {

            resumePreviewOverlay.classList.add("show");
            document.body.style.overflow = "hidden";

        });

    }


    // CLOSE RESUME PREVIEW
    function closePreview() {

        if (!resumePreviewOverlay) return;

        resumePreviewOverlay.classList.remove("show");
        document.body.style.overflow = "";

    }

    if (closeResumePreview) {
        closeResumePreview.addEventListener("click", closePreview);
    }

    // CLOSE WHEN CLICKING OUTSIDE THE PREVIEW
    if (resumePreviewOverlay) {

        resumePreviewOverlay.addEventListener("click", function (event) {

            if (event.target === resumePreviewOverlay) {
                closePreview();
            }

        });

    }

    // CLOSE USING ESCAPE KEY
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closePreview();
        }

    });

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
        background: rgba(0, 0, 0, 0.88);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        padding: 18px;
        overflow-y: auto;
    `;

    overlay.innerHTML = `
        <div style="
            background: linear-gradient(145deg, #1a1a1a, #0c0c0c);
            border: 1px solid rgba(255, 51, 51, 0.5);
            border-radius: 20px;
            padding: 30px 25px;
            max-width: 400px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            text-align: center;
            color: white;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 35px rgba(255, 0, 0, 0.15);
            box-sizing: border-box;
        ">

            <div style="
                width: 65px;
                height: 65px;
                margin: 0 auto 18px;
                border-radius: 50%;
                background: rgba(255, 51, 51, 0.12);
                border: 1px solid rgba(255, 51, 51, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
            ">
                ❤️
            </div>

            <h2 style="
                color: #ff4444;
                font-size: 23px;
                margin: 0 0 12px;
            ">
                Sorry for the Limited Access!
            </h2>

            <p style="
                color: #ccc;
                font-size: 14px;
                line-height: 1.7;
                margin-bottom: 18px;
            ">
                You've reached your daily limit of
                <strong style="color: white;">20 questions</strong>.
                We're sorry for the inconvenience!
            </p>

            <div style="
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid #333;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            ">

                <h3 style="
                    color: white;
                    font-size: 16px;
                    margin: 0 0 10px;
                ">
                    Why is access limited?
                </h3>

                <p style="
                    color: #aaa;
                    font-size: 13px;
                    line-height: 1.7;
                    margin: 0;
                ">
                    Running AI services comes with a cost.
                    As an independent project, I currently have
                    limited resources to keep JUNDY AI running.
                </p>

            </div>

            <h3 style="
                color: #ff4444;
                font-size: 19px;
                margin-bottom: 10px;
            ">
                Support JUNDY AI
            </h3>

            <p style="
                color: #ccc;
                font-size: 13px;
                line-height: 1.7;
                margin-bottom: 18px;
            ">
                If you find JUNDY AI helpful, any contribution
                through GCash would mean a lot.
                Your support will help me afford an AI plan
                and work toward providing unlimited access
                for everyone!
            </p>

            <div style="
                background: rgba(0, 150, 255, 0.08);
                border: 1px solid rgba(0, 150, 255, 0.35);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 20px;
            ">

                <div style="
                    color: #35aaff;
                    font-size: 19px;
                    font-weight: bold;
                    margin-bottom: 8px;
                ">
                    GCash Support
                </div>

                <p style="
                    color: #aaa;
                    font-size: 12px;
                    margin: 0;
                ">
                    <img
                    src="PICS/gcash-qr.png"
                    alt="JUNDY AI GCash QR Code"
                    style="
                        width: 190px;
                        max-width: 100%;
                        height: auto;
                        display: block;
                        margin: 12px auto;
                        border-radius: 10px;
                        background: white;
                        padding: 8px;
                        box-sizing: border-box;
                    "
                >

                <p style="
                    color: #35aaff;
                    font-size: 13px;
                    font-weight: bold;
                    margin: 10px 0 0;
                ">
                    SCAN TO SUPPORT JUNDY AI
                </p>
                </p>

            </div>

            <p style="
                color: #888;
                font-size: 12px;
                line-height: 1.6;
                margin-bottom: 20px;
            ">
                Your support is completely voluntary.
                Thank you for helping this small project grow!
            </p>

            <button id="closeDailyLimitPopup" style="
                width: 100%;
                padding: 13px;
                background: linear-gradient(90deg, #ff3333, #c90000);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                letter-spacing: 0.5px;
            ">
                CLOSE
            </button>

        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("closeDailyLimitPopup")
        .addEventListener("click", () => {
            overlay.remove();
        });
}



function showAIUsageNotice(onAccept) {

    // Prevent duplicate notices
    if (document.getElementById("aiUsageNotice")) return;

    const overlay = document.createElement("div");
    overlay.id = "aiUsageNotice";

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.88);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100000;
        padding: 18px;
    `;

    overlay.innerHTML = `
        <div style="
            background: linear-gradient(145deg, #1a1a1a, #0b0b0b);
            border: 1px solid rgba(255, 51, 51, 0.5);
            border-radius: 20px;
            padding: 28px 23px;
            max-width: 390px;
            width: 100%;
            text-align: center;
            color: white;
            font-family: Arial, sans-serif;
            box-shadow: 0 0 35px rgba(255, 0, 0, 0.2);
        ">

            <div style="font-size: 38px; margin-bottom: 12px;">
                🤖
            </div>

            <h2 style="
                color: #ff4444;
                font-size: 23px;
                margin: 0 0 12px;
            ">
                Before You Start!
            </h2>

            <p style="
                color: #ccc;
                font-size: 14px;
                line-height: 1.7;
            ">
                Welcome to JUNDY AI! Before starting a conversation,
                please take a moment to read our usage notice.
            </p>

            <div style="
                background: rgba(255, 51, 51, 0.07);
                border: 1px solid #492222;
                border-radius: 12px;
                padding: 16px;
                margin: 18px 0;
                text-align: left;
            ">

                <h3 style="
                    color: #ff5555;
                    text-align: center;
                    margin: 0 0 12px;
                    font-size: 17px;
                ">
                    Daily Usage Limit
                </h3>

                <p style="
                    color: white;
                    font-size: 14px;
                    text-align: center;
                    margin-bottom: 15px;
                ">
                    <strong style="font-size: 25px; color: #ff4444;">
                        20 QUESTIONS
                    </strong>
                    <br>
                    <span style="color: #aaa; font-size: 12px;">
                        per day
                    </span>
                </p>

                <p style="color: #ccc; font-size: 13px; line-height: 1.8; margin: 0;">
                    • Access is currently free but limited.<br>
                    • Your daily limit resets tomorrow.<br>
                    • Please use your available questions wisely.<br>
                </p>

            </div>

            <p style="
                color: #999;
                font-size: 12px;
                line-height: 1.6;
                margin-bottom: 20px;
            ">
                By continuing, you acknowledge and agree to
                these usage limitations.
            </p>

            <button id="acceptAIUsage" style="
                width: 100%;
                padding: 14px;
                background: linear-gradient(90deg, #ff3333, #c90000);
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 10px;
            ">
                ACCEPT & CONTINUE
            </button>

            <button id="declineAIUsage" style="
                width: 100%;
                padding: 12px;
                background: transparent;
                color: #aaa;
                border: 1px solid #444;
                border-radius: 10px;
                cursor: pointer;
                font-weight: bold;
                font-size: 13px;
            ">
                DECLINE
            </button>

        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("acceptAIUsage")
        .addEventListener("click", () => {
            sessionStorage.setItem("jundyAIUsageAccepted", "true");
            overlay.remove();
            if (typeof onAccept === "function") {
                onAccept();
            }
        });

    document.getElementById("declineAIUsage")
        .addEventListener("click", () => {
            overlay.remove();
        });
}



// ==========================================
// FIRST-VISIT WELCOME & VISITOR REGISTRATION
// ==========================================

(function () {
    const visitorNameKey = "jundy_ai_visitor_name";

    function getVisitorDevice() {
        return navigator.userAgentData?.platform ||
               navigator.platform ||
               "Unknown Device";
    }

    function getVisitorBrowser() {
        const ua = navigator.userAgent;

        if (ua.includes("Edg/")) return "Microsoft Edge";
        if (ua.includes("Chrome/")) return "Google Chrome";
        if (ua.includes("Firefox/")) return "Mozilla Firefox";
        if (ua.includes("Safari/")) return "Safari";

        return "Unknown Browser";
    }

    function getVisitorId() {
        let visitorId = localStorage.getItem("jundy_ai_visitor_id");

        if (!visitorId) {
            visitorId = crypto.randomUUID();
            localStorage.setItem("jundy_ai_visitor_id", visitorId);
        }

        return visitorId;
    }

    async function registerVisitor(name) {
        const visitorId = getVisitorId();
        console.log("API URL:", API_URL);
        const response = await fetch(`${API_URL}/visitor/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                visitor_id: visitorId,
                visitor_name: name,
                device_name: getVisitorDevice(),
                browser_name: getVisitorBrowser()
            })
        });

        const result = await response.json();
        console.log("VISITOR REGISTRATION RESPONSE:", result);
        console.log("VISITOR ID:", visitorId);

        if (!response.ok || !result.success) {
            throw new Error(result.error || "Registration failed.");
        }

        // Synchronize the latest name from the database
        if (result.visitor_name) {
            localStorage.setItem(visitorNameKey, result.visitor_name);
        }

        return result.visitor_name;
    }

    // SPECIAL VISITOR NAMES
const specialVisitorNames = [
    "krisha",
    "krish",
    "kate"
];

    // SPECIAL GREETING WITH FIREWORKS
    function showSpecialGreeting(visitorName) {
        const overlay = document.getElementById("specialGreetingOverlay");
        const title = document.getElementById("specialGreetingTitle");
        const canvas = document.getElementById("fireworksCanvas");

        if (!overlay || !title || !canvas) return;

        const ctx = canvas.getContext("2d");
        const particles = [];

        title.textContent = `Hey, ${visitorName}!`;
        overlay.style.display = "flex";

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();

        window.addEventListener("resize", resizeCanvas);

        const colors = [
            "#ff3b43",
            "#ffcc33",
            "#ffffff",
            "#ff69b4",
            "#9b5cff",
            "#35dc83"
        ];

        function createFirework() {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height * 0.65;
            const color = colors[Math.floor(Math.random() * colors.length)];

            for (let i = 0; i < 55; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 1;

                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: color,
                    size: Math.random() * 3 + 1
                });
            }
        }

        let lastFirework = 0;
        let animationId;

        function animate(timestamp) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (timestamp - lastFirework > 500) {
                createFirework();
                lastFirework = timestamp;
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.035;
                p.vx *= 0.99;
                p.alpha -= 0.012;

                ctx.globalAlpha = Math.max(p.alpha, 0);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                }
            }

            ctx.globalAlpha = 1;
            animationId = requestAnimationFrame(animate);
        }

        animationId = requestAnimationFrame(animate);

        // Automatically close after 7 seconds
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resizeCanvas);
            overlay.style.display = "none";
        }, 7000);
    }

    function initializeVisitorWelcome() {
        const modal = document.getElementById("visitorWelcomeModal");
        const form = document.getElementById("visitorWelcomeForm");
        const nameInput = document.getElementById("visitorWelcomeName");
        const submitButton = document.getElementById("visitorWelcomeSubmit");
        const errorMessage = document.getElementById("visitorWelcomeError");

        if (!modal || !form || !nameInput || !submitButton) return;

        const savedName = localStorage.getItem(visitorNameKey);

        if (savedName) {
            const title = modal.querySelector("h2");

            form.style.display = "none";

            registerVisitor(savedName)
                .then(updatedName => {
                    const displayName = updatedName || savedName;

                    title.textContent = "WELCOME BACK!";

                    const message = modal.querySelector(".visitor-welcome-box > p");

                    message.replaceChildren(
                        document.createTextNode("You're back, "),
                        Object.assign(document.createElement("strong"), {
                            className: "welcome-back-name",
                            textContent: displayName
                        }),
                        document.createTextNode(". Appreciate your continued visit. Have a great day!")
                    );

                    modal.style.display = "flex";

                    setTimeout(() => {
                        modal.style.display = "none";
                    }, 3000);
                })
                .catch(error => {
                    console.error("Visitor tracking error:", error);

                    title.textContent = "WELCOME BACK!";

                    const message = modal.querySelector(".visitor-welcome-box > p");

                    message.textContent =
                        `You're back, ${savedName}. Appreciate your continued visit. Have a great day!`;

                    modal.style.display = "flex";

                    setTimeout(() => {
                        modal.style.display = "none";
                    }, 3000);
                });

            return;
        }

        // First-time visitor: show welcome popup.
        modal.style.display = "flex";
        nameInput.focus();

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const visitorName = nameInput.value.trim();

            if (!visitorName) {
                errorMessage.textContent = "Please enter your name.";
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = "PLEASE WAIT...";
            errorMessage.textContent = "";

            try {
                await registerVisitor(visitorName);

                localStorage.setItem(visitorNameKey, visitorName);

                modal.style.display = "none";

                // Check if visitor has a special name
                const normalizedName = visitorName.trim().toLowerCase();

                if (specialVisitorNames.includes(normalizedName)) {
                    showSpecialGreeting(visitorName);
                }

            } catch (error) {
                console.error("Visitor registration error:", error);
                errorMessage.textContent =
                    "Unable to register right now. Please try again.";

            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "CONTINUE";
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeVisitorWelcome);
    } else {
        initializeVisitorWelcome();
    }
})();



// FLOATING BACK TO TOP BUTTON
document.addEventListener("DOMContentLoaded", function () {

    const backToTop = document.getElementById("backToTop");

    if (!backToTop) return;

    window.addEventListener("scroll", function () {

        if (window.scrollY > 300) {
            backToTop.classList.add("show");
        } else {
            backToTop.classList.remove("show");
        }

    });

    backToTop.addEventListener("click", function () {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});



// ==========================================
// WEBSITE-WIDE PORTFOLIO SEARCH
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("portfolioSearch");
    const searchButton = document.getElementById("searchBtn");
    const searchResults = document.getElementById("searchResults");

    if (!searchInput || !searchButton || !searchResults) return;

    // Website elements to search
    const searchableElements = [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "li", "a", "button", "summary",
        "label", ".hobby-card"
    ];

    function searchWebsite() {

        const query = searchInput.value.trim().toLowerCase();

        searchResults.innerHTML = "";

        if (!query) {
            searchResults.style.display = "none";
            return;
        }

        const searchWords = query.split(/\s+/).filter(Boolean);

        const elements = document.querySelectorAll(
            searchableElements.join(",")
        );

        let matches = [];

        elements.forEach(element => {

            // Ignore the search bar and its results
            if (
                element.closest(".search-container") ||
                element.closest("#searchResults")
            ) return;

            const text = element.textContent.trim();

            if (!text) return;

            const normalizedText = text.toLowerCase();

            // Require all searched words to match
            const isMatch = searchWords.every(word =>
                normalizedText.includes(word)
            );

            if (isMatch) {

                // Avoid duplicate results from nested elements
                const alreadyAdded = matches.some(
                    item => item.element === element
                );

                if (!alreadyAdded) {
                    matches.push({
                        element: element,
                        text: text
                    });
                }
            }

        });

        if (matches.length === 0) {

            searchResults.innerHTML = `
                <div class="search-no-results">
                    No results found for "${query}"
                </div>
            `;

            searchResults.style.display = "block";
            return;
        }

        matches.forEach(match => {

            const result = document.createElement("div");

            result.className = "search-result-item";
            result.textContent = match.text.length > 100
                ? match.text.substring(0, 100) + "..."
                : match.text;

            result.addEventListener("click", function () {

                match.element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                searchResults.style.display = "none";

            });

            searchResults.appendChild(result);

        });

        searchResults.style.display = "block";

    }

    searchInput.addEventListener("input", searchWebsite);

    searchButton.addEventListener("click", searchWebsite);

    searchInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            searchWebsite();
        }

        if (event.key === "Escape") {
            searchResults.style.display = "none";
        }

    });

    document.addEventListener("click", function (event) {

        if (!event.target.closest(".search-container")) {
            searchResults.style.display = "none";
        }

    });

});

// CREATOR ONLINE STATUS
const creatorPopup = document.getElementById("creatorOnlinePopup");
const closeCreatorPopup = document.getElementById("closeCreatorPopup");

let creatorPopupDismissed = false;

if (creatorPopup && closeCreatorPopup) {

    closeCreatorPopup.addEventListener("click", function() {
        creatorPopup.style.display = "none";
        creatorPopupDismissed = true;
    });

    async function checkCreatorStatus() {
        try {
            const response = await fetch(`${API_URL}/creator/status`, {
                method: "GET",
                cache: "no-store"
            });

            const data = await response.json();

            console.log("CREATOR STATUS:", data);

            if (data.is_online) {
                if (!creatorPopupDismissed) {
                    creatorPopup.style.display = "block";
                }
            } else {
                creatorPopup.style.display = "none";
                creatorPopupDismissed = false;
            }

        } catch (error) {
            console.error("Creator status error:", error);
            creatorPopup.style.display = "none";
        }
    }

    checkCreatorStatus();
    setInterval(checkCreatorStatus, 10000);
}