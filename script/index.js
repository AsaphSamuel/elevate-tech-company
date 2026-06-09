function verifySession() {
  const session = JSON.parse(localStorage.getItem("session"));

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const agora = Date.now();

  if (agora > session.expiresAt) {
    localStorage.removeItem("session");
    window.location.href = "login.html";
  }
}

async function loopVerify() {
  await verifySession();
  setTimeout(loopVerify, 10000);
}

loopVerify();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  set,
  query,
  orderByChild,
  equalTo,
  get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBknhPHD2jXaMMVH4Nq3uJnc8uuiKs37H4",
  authDomain: "elevate-tech-company.firebaseapp.com",
  databaseURL: "https://elevate-tech-company-default-rtdb.firebaseio.com",
  projectId: "elevate-tech-company",
  storageBucket: "elevate-tech-company.firebasestorage.app",
  messagingSenderId: "5988059403",
  appId: "1:5988059403:web:09e916e312b9c47939fa0e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function getInDatabase(parametro, userId) {
  const userRef = ref(db, `user/${userId}`);

  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    return data[parametro];
  }

  return null;
}

async function showUserName() {
  const session = JSON.parse(localStorage.getItem("session"));

  const nome = await getInDatabase("user", session.userId);

  document.querySelector("#username").textContent = nome;
}

showUserName();

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#user-container");

  if (container) {
    container.addEventListener("click", () => {
      const session = JSON.parse(localStorage.getItem("session"));

      localStorage.setItem("session", JSON.stringify(session));

      window.location.href = "user.html";
    });
  }
});

const session = JSON.parse(localStorage.getItem("session"));

async function loadUserIcon() {
  const imgUrl = await getInDatabase("img", session.userId);

  const userIcon = document.querySelector("#userIcon");

  if (!userIcon) return;

  const finalImg = imgUrl || "../images/default-user.png";

  userIcon.src = finalImg;

  userIcon.onerror = () => {
    userIcon.src = "../images/default-user.png";
  };
}

loadUserIcon();

//NAVBAR
//SCROLL NAVBAR
function scrollToSection(id) {

    const section = document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

}
const links = document.querySelectorAll('.navbar-text');

links.forEach(link => {
  link.addEventListener('click', (event) => {

    event.preventDefault();

    // REMOVE .active DE TODOS
    links.forEach(item => item.classList.remove('active'));

    // ADICIONA .active PARA O CLICADO
    link.classList.add('active');

    console.log('Clicked:', link.textContent);

    //scroll aplied
    const targetId = link.dataset.target;
      const currentPage = window.location.pathname;

      // If NOT on index.html, redirect first
      if (!currentPage.endsWith('index.html') && currentPage !== '/' && currentPage !== '') {

        window.location.href = `index.html#${targetId}`;
        return;
      }

      scrollToSection(targetId);
  });
});

window.addEventListener('load', () => {

    const hash = window.location.hash.replace('#', '');

    if (hash) {
        scrollToSection(hash);
    }

});

//CARROSSEL HERO
document.addEventListener('DOMContentLoaded', () => {

  const track = document.querySelector('.galery-carousel-track');
  const slides = document.querySelectorAll('.galery-carousel-slide');

  const prevBtn = document.querySelector('.galery-carousel-btn.prev');
  const nextBtn = document.querySelector('.galery-carousel-btn.next');

  const currentSlide = document.getElementById('galery-current-slide');
  const totalSlides = document.getElementById('galery-total-slides');

  let index = 0;
  let autoPlay;

  totalSlides.textContent = slides.length;

  function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;
    currentSlide.textContent = index + 1;
  }

  function startAutoPlay() {

    autoPlay = setInterval(() => {

      index++;

      if (index >= slides.length) {
        index = 0;
      }

      updateCarousel();

    }, 5000);

  }

  function resetAutoPlay() {

    clearInterval(autoPlay);
    startAutoPlay();

  }

  nextBtn.addEventListener('click', () => {

    index++;

    if (index >= slides.length) {
      index = 0;
    }

    updateCarousel();
    resetAutoPlay();

  });

  prevBtn.addEventListener('click', () => {

    index--;

    if (index < 0) {
      index = slides.length - 1;
    }

    updateCarousel();
    resetAutoPlay();

  });

  // Swipe para celular
  let startX = 0;
  let endX = 0;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  track.addEventListener('touchend', (e) => {

    endX = e.changedTouches[0].clientX;

    const distance = startX - endX;

    if (distance > 50) {

      index++;

      if (index >= slides.length) {
        index = 0;
      }

    } else if (distance < -50) {

      index--;

      if (index < 0) {
        index = slides.length - 1;
      }
    }

    updateCarousel();
    resetAutoPlay();

  });

  updateCarousel();
  startAutoPlay();
});

//CARROSSEL MOSTRUARIO
const track = document.querySelector('.templates-grid');
const cards = document.querySelectorAll('.template-card');

const prevBtn = document.querySelector('.prev2');
const nextBtn = document.querySelector('.next2');

let currentIndex = 0;

const visibleCards = 3;

const gap = 25;

const cardWidth = cards[0].offsetWidth + gap;

const maxIndex = cards.length - visibleCards;

nextBtn.addEventListener('click', () => {

  if(currentIndex < maxIndex){

    currentIndex++;

    updateCarousel();

  }

});

prevBtn.addEventListener('click', () => {

  if(currentIndex > 0){

    currentIndex--;

    updateCarousel();

  }

});

function updateCarousel(){

  track.style.transform =
    `translateX(-${currentIndex * cardWidth}px)`;

}

//SCROLL INDICATOR
const indicator = document.querySelector('.scroll-indicator');

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  const nearBottom = scrollTop + windowHeight >= documentHeight - 700;

  if (nearBottom) {
    indicator.classList.add('hidden');
  } else {
    indicator.classList.remove('hidden');
  }
});