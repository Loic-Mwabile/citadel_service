let slideIndex = 0;
const slides = document.getElementsByClassName('slide');

// Initialize slides with background images
slides[0].style.backgroundImage = 'url("assets/slide1.png")';
slides[1].style.backgroundImage = 'url("assets/slide2.png")';
slides[2].style.backgroundImage = 'url("assets/slide3.png")';

function showSlide(n) {
    // Reset all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
    }

    // Wrap around slide index
    slideIndex = (n + slides.length) % slides.length;

    // Show current slide
    slides[slideIndex].style.display = 'block';
}

function changeSlide(n) {
    showSlide(slideIndex + n);
}

// Auto-advance slides every 5 seconds
function autoAdvanceSlides() {
    changeSlide(1);
}

// Initial slide
showSlide(0);

// Start auto-advance
setInterval(autoAdvanceSlides, 5000);
