import api from "./api.js";
import { startSessionWatcher, wireAccountMenu } from "./session.js";

startSessionWatcher();

document.addEventListener("DOMContentLoaded", () => {
  wireAccountMenu();
});

const DEFAULT_AVATAR = "../sources/images/default-user.png";

const userInput = document.querySelector("#txt-user");
const photoUrlInput = document.querySelector("#photoUrl");
const preview = document.querySelector("#profilePreview");
const saveBtn = document.querySelector("#btn-sigin");

let imageRemoved = false;

async function loadProfile() {
  try {
    const me = await api.user.getMe();

    userInput.value = me.username || "";

    const emailInput = document.querySelector("#email");
    if (emailInput) emailInput.value = me.email || "";

    if (preview) {
      preview.src = me.img || DEFAULT_AVATAR;
      preview.onerror = () => {
        preview.src = DEFAULT_AVATAR;
      };
    }

    if (photoUrlInput) photoUrlInput.value = me.img || "";
  } catch (error) {
    console.error("Não foi possível carregar o perfil:", error);
  }
}

loadProfile();

if (photoUrlInput) {
  photoUrlInput.addEventListener("input", () => {
    const url = photoUrlInput.value.trim();

    if (url && preview) {
      preview.src = url;
      preview.onerror = () => {
        preview.src = DEFAULT_AVATAR;
      };
    }
  });
}

function getFilledFields() {
  const updates = {};

  const username = userInput.value.trim();
  if (username) updates.username = username;

  const photoUrl = photoUrlInput.value.trim();
  if (photoUrl) {
    updates.img = photoUrl;
  } else if (imageRemoved) {
    updates.img = "";
  }

  return updates;
}

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const updates = getFilledFields();

    if (Object.keys(updates).length === 0) return;

    saveBtn.disabled = true;

    try {
      await api.user.updateMe(updates);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      saveBtn.disabled = false;
    }
  });
}

const overlay = document.querySelector("#pp-overlay");
if (overlay) {
  overlay.addEventListener("click", () => {
    if (preview) preview.src = DEFAULT_AVATAR;
    if (photoUrlInput) photoUrlInput.value = "";
    imageRemoved = true;
  });
}

const backArrow = document.querySelector("#arrow");
if (backArrow) {
  backArrow.addEventListener("click", () => history.back());
}
