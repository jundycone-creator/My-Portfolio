
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
