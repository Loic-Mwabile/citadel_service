let slideIndex = 0;
const slides = document.getElementsByClassName('slide');

// Initialize slides with background images using absolute paths from root
slides[0].style.backgroundImage = 'url("src/assets/slide1.png")';
slides[1].style.backgroundImage = 'url("src/assets/slide2.png")';
slides[2].style.backgroundImage = 'url("src/assets/slide3.png")';

// Set common styles for all slides
for (let i = 0; i < slides.length; i++) {
    slides[i].style.backgroundSize = 'contain';
    slides[i].style.backgroundPosition = 'center';
    slides[i].style.backgroundRepeat = 'no-repeat';
    slides[i].style.backgroundColor = 'var(--dark-bg)';
}

function showSlide(n) {
    // Hide current active slide
    const currentSlide = document.querySelector('.slide.active');
    if (currentSlide) {
        currentSlide.classList.remove('active');
    }

    // Update slide index with wrap-around
    slideIndex = (n + slides.length) % slides.length;
    
    // Show new slide
    slides[slideIndex].classList.add('active');
}

function changeSlide(n) {
    showSlide(slideIndex + n);
}

// Auto-advance slides every 5 seconds
let slideInterval = setInterval(autoAdvanceSlides, 5000);

function autoAdvanceSlides() {
    changeSlide(1);
}

// Pause auto-advance when hovering over slideshow
const slideshowContainer = document.querySelector('.slideshow-container');
if (slideshowContainer) {
    slideshowContainer.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    slideshowContainer.addEventListener('mouseleave', () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(autoAdvanceSlides, 5000);
    });
}

// Initial slide
showSlide(0);

// Make functions available globally
window.changeSlide = changeSlide;
