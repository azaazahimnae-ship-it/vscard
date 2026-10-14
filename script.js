"use strict";

function initializeBusinessCard() {
  const $ = id => document.getElementById(id);
  const card = document.querySelector(".card");

  if (!card || card.dataset.businessCardReady === "true") {
    return;
  }

  card.dataset.businessCardReady = "true";

  // 이전 코드가 HTML에 남긴 스타일 제거
  // 모든 디자인과 hover 효과는 style.css에서 관리
  for (const id of [
    "cardInteractionStyles",
    "contactButtonStyles",
    "businessCardInteractionStyles"
  ]) {
    $(id)?.remove();
  }

  let status = $("status");

  if (!status) {
    status = document.createElement("div");
    status.id = "status";
    status.className = "status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");

    card.insertAdjacentElement("afterend", status);
  }

  function announce(message) {
    status.textContent = message;
  }

  // 클립보드 복사
  async function copyText(text) {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // 복사 API 실패 시 대체 방법 사용
      }
    }

    const textarea = document.createElement("textarea");
    const previousFocus = document.activeElement;

    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.cssText =
      "position:fixed;left:-9999px;top:0;opacity:0;font-size:16px;";

    document.body.append(textarea);

    try {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      if (
        typeof document.execCommand !== "function" ||
        !document.execCommand("copy")
      ) {
        throw new Error("Clipboard copy failed");
      }
    } finally {
      textarea.remove();

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    }
  }

  // 이메일 주소 또는 이메일 복사 버튼 클릭
  async function copyEmail(event) {
    event.preventDefault();

    const email = $("cardEmail")?.textContent.trim();

    if (!email) {
      announce("복사할 이메일 주소가 없습니다.");
      return;
    }

    try {
      await copyText(email);
      announce("이메일 주소를 복사했습니다: " + email);
    } catch {
      announce(
        "복사하지 못했습니다. 이메일 주소를 직접 복사해 주세요: " +
        email
      );
    }
  }

  const emailLink = $("emailLink");
  const emailCopyButton = $("emailCopyButton");
  const phoneLink = $("phoneLink");
  const callButton = $("callButton");
  const githubLink = $("githubLink");

  if (emailLink) {
    emailLink.title = "클릭하여 이메일 주소 복사";
    emailLink.addEventListener("click", copyEmail);
  }

  if (emailCopyButton) {
    emailCopyButton.addEventListener("click", copyEmail);
  }

  // HTML에 표시된 연락처로 링크 설정
  function updateContactLinks() {
    const email = $("cardEmail")?.textContent.trim() || "";

    const phone = ($("cardPhone")?.textContent || "")
      .replace(/[^+0-9]/g, "");

    if (emailLink) {
      if (email) {
        emailLink.href = "mailto:" + encodeURIComponent(email);
      } else {
        emailLink.removeAttribute("href");
      }
    }

    if (emailCopyButton) {
      emailCopyButton.disabled = !email;
    }

    for (const link of [phoneLink, callButton]) {
      if (!link) continue;

      if (phone) {
        link.href = "tel:" + phone;
        link.removeAttribute("aria-disabled");
      } else {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
      }
    }
  }

  updateContactLinks();

  for (const link of [phoneLink, callButton]) {
    if (!link) continue;

    link.addEventListener("click", event => {
      updateContactLinks();

      if (link.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        announce("전화번호가 없습니다.");
      }
    });
  }

  // GitHub 프로필을 새 탭으로 열기
  // 링크의 기본 동작을 사용하므로 복사 기능과 충돌하지 않음
  if (githubLink) {
    githubLink.href =
      "https://github.com/azaazahimnae-ship-it";
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";
  }

  // 사진을 찾지 못하면 기본 프로필 그림 표시
  const portrait = $("portrait");
  const photo = portrait?.querySelector("img");

  if (photo) {
    const handlePhotoError = () => {
      if (!photo.isConnected) return;

      portrait.innerHTML = `
        <svg aria-hidden="true" viewBox="0 0 48 48"
          fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="24" cy="17" r="8"></circle>
          <path d="M8 41c0-10 7-16 16-16s16 6 16 16"></path>
        </svg>
      `;

      announce(
        "프로필 사진을 찾지 못했습니다. dog1.jpg를 같은 폴더에 두세요."
      );
    };

    photo.addEventListener("error", handlePhotoError, {
      once: true
    });

    if (photo.complete && !photo.naturalWidth) {
      handlePhotoError();
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeBusinessCard,
    { once: true }
  );
} else {
  initializeBusinessCard();
}