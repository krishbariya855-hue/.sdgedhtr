// ===============================
// Mahiverse Globle
// Premium Website Script
// ===============================

// Welcome Message
console.log("Welcome to Mahiverse Globle");

// Smooth Fade Animation for Product Cards
const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0px)";
        }
    });
}, {
    threshold: 0.1 // Triggers animation when 10% of the card is visible
});

cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(40px)";
    card.style.transition = "all 0.8s ease-out";
    observer.observe(card);
});

// Sticky Header Shadow Dynamic Effect
window.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if(header) {
        if(window.scrollY > 20){
            header.style.boxShadow = "0 10px 30px rgba(0,0,0,.15)";
        } else {
            header.style.boxShadow = "0 5px 20px rgba(0,0,0,.08)";
        }
    }
});
