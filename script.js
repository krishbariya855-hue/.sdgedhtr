// ===============================
// Mahiverse Globle
// Premium Website Script
// ===============================

// Welcome Message
console.log("Welcome to Mahiverse Globle");

// Buy Now Buttons
const buttons = document.querySelectorAll("button");

buttons.forEach(button => {

    button.addEventListener("click", () => {

        window.open(
            "https://wa.me/916354179230?text=Hello%20Mahiverse%20Globle,%20I%20want%20to%20buy%20your%20product.",
            "_blank"
        );

    });

});

// Smooth Fade Animation
const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.style.opacity="1";
            entry.target.style.transform="translateY(0px)";

        }

    });

});

cards.forEach(card=>{

    card.style.opacity="0";
    card.style.transform="translateY(40px)";
    card.style.transition="0.8s";

    observer.observe(card);

});

// Sticky Header Shadow
window.addEventListener("scroll",()=>{

    const header=document.querySelector("header");

    if(window.scrollY>20){

        header.style.boxShadow="0 10px 30px rgba(0,0,0,.15)";

    }else{

        header.style.boxShadow="0 5px 20px rgba(0,0,0,.08)";

    }

});
