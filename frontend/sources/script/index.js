import { startSessionWatcher, loadUserHeader, wireAccountMenu } from "./session.js";

// ---------- SESSÃO E USUÁRIO ----------
// Antes: lia direto do localStorage e confiava nele. Agora o backend é quem
// valida o cookie de sessão a cada checagem.
startSessionWatcher();
loadUserHeader();

document.addEventListener("DOMContentLoaded", () => {
  wireAccountMenu();
});

// ---------- NAVBAR ----------
// SCROLL NAVBAR
let ignoreScroll = false;

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;

  const offset = 180; // pixels acima da section (header estava cobrindo ~50px a mais)

  const top = section.getBoundingClientRect().top + window.pageYOffset - offset;

  window.scrollTo({ top, behavior: "smooth" });
}

const links = document.querySelectorAll(".navbar-text");

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const targetId = link.dataset.target;
    const currentPage = window.location.pathname.split("/").pop();

    // HOME e ABOUT -> index.html
    if ((targetId === "home" || targetId === "about") && currentPage !== "index.html") {
      window.location.href = `index.html#${targetId}`;
      return;
    }

    // STORE -> store.html
    if (targetId === "store" && currentPage !== "store.html") {
      window.location.href = "store.html";
      return;
    }

    links.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");

    ignoreScroll = true;
    scrollToSection(targetId);

    setTimeout(() => {
      ignoreScroll = false;
    }, 800); // acompanha a duração do scroll suave
  });
});

window.addEventListener("load", () => {
  const hash = window.location.hash.replace("#", "");
  if (hash) scrollToSection(hash);
});

// CHANGES NAVBAR BY SCROLLPAGE
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  if (ignoreScroll) return;

  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    const offset = 70;

    if (pageYOffset >= sectionTop - sectionHeight / 3 - offset) {
      current = section.getAttribute("id");
    }
  });

  links.forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.target === current) link.classList.add("active");
  });
});

// ---------- CARROSSEL HERO ----------
document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".galery-carousel-track");
  const slides = document.querySelectorAll(".galery-carousel-slide");

  if (!track || slides.length === 0) return;

  const prevBtn = document.querySelector(".galery-carousel-btn.prev");
  const nextBtn = document.querySelector(".galery-carousel-btn.next");

  const currentSlide = document.getElementById("galery-current-slide");
  const totalSlides = document.getElementById("galery-total-slides");

  let index = 0;
  let autoPlay;

  totalSlides.textContent = slides.length;

  function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;
    currentSlide.textContent = index + 1;
  }

  function startAutoPlay() {
    autoPlay = setInterval(() => {
      index = (index + 1) % slides.length;
      updateCarousel();
    }, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlay);
    startAutoPlay();
  }

  nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    updateCarousel();
    resetAutoPlay();
  });

  prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
    resetAutoPlay();
  });

  // Swipe para celular
  let startX = 0;

  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
  });

  track.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const distance = startX - endX;

    if (distance > 50) {
      index = (index + 1) % slides.length;
    } else if (distance < -50) {
      index = (index - 1 + slides.length) % slides.length;
    }

    updateCarousel();
    resetAutoPlay();
  });

  updateCarousel();
  startAutoPlay();
});

// ---------- CARROSSEL MOSTRUÁRIO ----------
const showcaseTrack = document.querySelector(".templates-grid");
const showcaseCards = document.querySelectorAll(".template-card");

if (showcaseTrack && showcaseCards.length > 0) {
  const prevBtn2 = document.querySelector(".prev2");
  const nextBtn2 = document.querySelector(".next2");

  let currentIndex = 0;
  const visibleCards = 3;
  const gap = 25;
  const cardWidth = showcaseCards[0].offsetWidth + gap;
  const maxIndex = (showcaseCards.length - visibleCards) / 5;

  function updateShowcase() {
    showcaseTrack.style.transform = `translateX(-${currentIndex * cardWidth * 4}px)`;
  }

  nextBtn2.addEventListener("click", () => {
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateShowcase();
    }
  });

  prevBtn2.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateShowcase();
    }
  });
}

// ---------- CONTACT US SCROLL ----------
const contato = document.querySelector("#contact");

if (contato) {
  window.addEventListener("scroll", () => {
    const rect = contato.getBoundingClientRect();
    const alturaTela = window.innerHeight;

    const inicio = alturaTela * 0.9;
    const fim = alturaTela * 0.2;

    let progresso = (inicio - rect.top) / (inicio - fim);
    progresso = Math.max(0, Math.min(1, progresso));

    const deslocamento = 150 * (1 - progresso);
    contato.style.transform = `translateY(${deslocamento}px)`;
  });
}

// ---------- SCROLL INDICATOR ----------
const indicator = document.querySelector(".scroll-indicator");

if (indicator) {
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const nearBottom = scrollTop + windowHeight >= documentHeight - 700;

    indicator.classList.toggle("hidden", nearBottom);
  });
}