// GET HTML ELEMENTS
const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");
const logo = document.getElementById("portfoliologo_clickable");


// OPEN AND CLOSE MOBILE MENU
menuToggle.addEventListener("click", function (event) {
    event.stopPropagation();

    navbar.classList.toggle("active");

    const isOpen = navbar.classList.contains("active");

    menuToggle.setAttribute("aria-expanded", isOpen);

    menuToggle.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
});



// NAVIGATION BUTTONS
const navigationButtons = navbar.querySelectorAll("button");

navigationButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const targetId = button.getAttribute("data-target");
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        // Close mobile menu after clicking
        navbar.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';

    });

});


// LOGO - GO BACK TO HOME
logo.addEventListener("click", function () {

    document.getElementById("home").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    navbar.classList.remove("active");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';

});


// TYPING ANIMATION
const nameText = "Jundy Gagu";
const typingElement = document.getElementById("typingName");

let index = 0;
let deleting = false;

function typingAnimation() {

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


// CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
document.addEventListener("click", function (event) {
    if (!navbar.contains(event.target) && !menuToggle.contains(event.target)) {
        navbar.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
});