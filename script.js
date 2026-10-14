"use strict";

function initializeBusinessCard() {
  const $ = id => document.getElementById(id);
  const card = document.querySelector(".card");

  if (!card) return;

  // 같은 페이지에서 중복 실행 방지
  if (card.dataset.businessCardReady === "true") return;
  card.dataset.businessCardReady = "true";

  function announce(message) {
    const status = $("status");
    if (status) status.textContent = message;
  }

  const placeholder = `
    <svg aria-hidden="true" viewBox="0 0 48 48"
      fill="none" stroke="currentColor" stroke-width="1.6">
      <circle cx="24" cy="17" r="8"></circle>
      <path d="M8 41c0-10 7-16 16-16s16 6 16 16"></path>
    </svg>
  `;

  // 이전 JS에서 생성한 효과 스타일 제거
  for (const id of [
    "cardInteractionStyles",
    "contactButtonStyles",
    "businessCardInteractionStyles"
  ]) {
    $(id)?.remove();
  }

  // 다른 CSS보다 우선 적용되는 카드·버튼 효과
  const style = document.createElement("style");
  style.id = "businessCardInteractionStyles";

  style.textContent = `
    .card {
      transition:
        transform 220ms ease,
        box-shadow 220ms ease;
    }

    .card:hover {
      transform: translateY(-8px);
      box-shadow:
        0 28px 70px #00000099,
        0 0 24px #4c764b33;
    }

    #contactActionButtons {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 26px;
      overflow: visible;
    }

    #contactActionButtons > .contact-action {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      margin: 0;
      padding: 12px 10px;
      border: 1px solid #4c764b;
      border-radius: 12px;
      background: #365b35;
      color: #ffffff;
      font: inherit;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
      text-align: center;
      text-decoration: none;
      cursor: pointer;

      transform: translateY(0) !important;
      transition:
        transform 180ms ease,
        box-shadow 180ms ease,
        background-color 180ms ease,
        border-color 180ms ease !important;
    }

    #contactActionButtons > .contact-action--phone {
      background: #182019;
      color: #edf2ed;
    }

    #contactActionButtons > .contact-action:not(:disabled):hover {
      transform: translateY(-6px) !important;
      background: #466f44;
      border-color: #9bc498;
      box-shadow: 0 10px 22px #00000080 !important;
    }

    #contactActionButtons > .contact-action--phone:hover {
      background: #28392a;
    }

    #contactActionButtons > .contact-action:not(:disabled):active {
      transform: translateY(-2px) !important;
    }

    #contactActionButtons > .contact-action:focus-visible {
      outline: 3px solid #9bc498;
      outline-offset: 4px;
    }

    #contactActionButtons > .contact-action:disabled,
    #contactActionButtons > .contact-action[aria-disabled="true"] {
      opacity: 0.5;
      cursor: default;
      transform: none !important;
      box-shadow: none !important;
    }

    @media (prefers-reduced-motion: reduce) {
      .card {
        transition: none;
      }

      .card:hover {
        transform: none;
      }

      #contactActionButtons > .contact-action {
        transition: none !important;
      }

      #contactActionButtons > .contact-action:hover,
      #contactActionButtons > .contact-action:active {
        transform: none !important;
      }
    }

    @media print {
      .card,
      .card:hover {
        transform: none;
        box-shadow: none;
      }

      #contactActionButtons > .contact-action,
      #contactActionButtons > .contact-action:hover,
      #contactActionButtons > .contact-action:active {
        transform: none !important;
        box-shadow: none !important;
      }
    }
  `;

  document.head.append(style);

  // 이메일 복사
  async function copyText(text) {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // 대체 복사 방법 시도
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
        throw new Error("Copy failed");
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
  const phoneLink = $("phoneLink");

  if (emailLink) {
    emailLink.title = "클릭하여 이메일 주소 복사";
    emailLink.addEventListener("click", copyEmail);
  }

  // 연락처 버튼을 확실하게 새로 생성
  const contactArea =
    emailLink?.closest(".contact") ||
    phoneLink?.closest(".contact") ||
    card.querySelector(".contact");

  let emailButton = null;
  let phoneButton = null;

  if (contactArea) {
    let buttonArea = $("contactActionButtons");

    if (!buttonArea) {
      buttonArea = document.createElement("div");
      buttonArea.id = "contactActionButtons";
    }

    buttonArea.className = "contact-action-buttons";

    // 연락처 바로 아래로 배치
    contactArea.insertAdjacentElement("afterend", buttonArea);

    emailButton = document.createElement("button");
    emailButton.type = "button";
    emailButton.className = "contact-action";
    emailButton.textContent = "이메일 복사";
    emailButton.addEventListener("click", copyEmail);

    phoneButton = document.createElement("a");
    phoneButton.className =
      "contact-action contact-action--phone";
    phoneButton.textContent = "전화하기";

    buttonArea.replaceChildren(emailButton, phoneButton);
  }

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

    if (emailButton) emailButton.disabled = !email;

    for (const link of [phoneLink, phoneButton]) {
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

  for (const link of [phoneLink, phoneButton]) {
    if (!link) continue;

    link.addEventListener("click", event => {
      updateContactLinks();

      if (link.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        announce("전화번호를 입력해 주세요.");
      }
    });
  }

  updateContactLinks();

  // 프로필 사진을 찾지 못하면 기본 아이콘 표시
  const portrait = $("portrait");
  const initialPhoto = portrait?.querySelector("img");

  if (initialPhoto) {
    const handleFailure = () => {
      if (!initialPhoto.isConnected) return;
      portrait.innerHTML = placeholder;
    };
    initialPhoto.addEventListener("error", handleFailure, { once: true });
    if (initialPhoto.complete && !initialPhoto.naturalWidth) handleFailure();
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