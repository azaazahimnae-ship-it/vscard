"use strict";

function initializeBusinessCard() {
  const $ = id => document.getElementById(id);

  const placeholder =
    '<svg aria-hidden="true" viewBox="0 0 48 48" fill="none" ' +
    'stroke="currentColor" stroke-width="1.6">' +
    '<circle cx="24" cy="17" r="8"/>' +
    '<path d="M8 41c0-10 7-16 16-16s16 6 16 16"/></svg>';

  const announce = message => {
    const status = $("status");

    if (status) {
      status.textContent = message;
    }
  };

  const fields = [
    ["nameInput", "cardName"],
    ["roleInput", "cardRole"],
    ["emailInput", "cardEmail"],
    ["phoneInput", "cardPhone"]
  ];

  function fillForm() {
    for (const [inputId, cardId] of fields) {
      const input = $(inputId);
      const card = $(cardId);

      if (input && card) {
        input.value = card.textContent.trim();
      }
    }
  }

  let photoVersion = 0;

  // 카드 hover 효과 및 연락처 버튼 스타일
  // CSS 파일을 따로 수정하지 않아도 적용됩니다.
  const styleId = "businessCardInteractionStyles";

  if (!$(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;

    style.textContent = `
      .card {
        transition:
          transform 220ms ease,
          box-shadow 220ms ease;
      }

      @media (hover: hover) and (pointer: fine) {
        .card:hover {
          transform: translateY(-8px);
          box-shadow:
            0 28px 70px #00000099,
            0 0 24px #4c764b33;
        }
      }

      .contact-action-buttons {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
        margin-top: 26px;
      }

      .contact-action-buttons .contact-action {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 48px;
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
        transition:
          background-color 180ms ease,
          border-color 180ms ease;
      }

      .contact-action-buttons .contact-action--phone {
        background: #182019;
        color: #edf2ed;
      }

      @media (hover: hover) {
        .contact-action-buttons .contact-action:hover {
          background: #466f44;
          border-color: #9bc498;
        }

        .contact-action-buttons .contact-action--phone:hover {
          background: #28392a;
        }
      }

      .contact-action-buttons .contact-action:focus-visible {
        outline: 3px solid #9bc498;
        outline-offset: 4px;
      }

      .contact-action-buttons .contact-action[aria-disabled="true"] {
        opacity: 0.5;
        cursor: default;
      }

      @media (prefers-reduced-motion: reduce) {
        .card,
        .contact-action-buttons .contact-action {
          transition: none;
        }

        .card:hover {
          transform: none;
        }
      }

      @media print {
        .card,
        .card:hover {
          transform: none;
          box-shadow: none;
        }
      }
    `;

    document.head.append(style);
  }

  // 이메일 보내기 / 전화하기 버튼 생성
  const emailLink = $("emailLink");
  const phoneLink = $("phoneLink");

  const contactArea =
    emailLink?.closest(".contact") ||
    phoneLink?.closest(".contact");

  let sendEmailButton = null;
  let callButton = null;

  if (contactArea) {
    let buttonArea = $("contactActionButtons");

    if (!buttonArea) {
      buttonArea = document.createElement("div");
      buttonArea.id = "contactActionButtons";
      buttonArea.className = "contact-action-buttons";

      contactArea.insertAdjacentElement("afterend", buttonArea);
    }

    sendEmailButton = buttonArea.querySelector(
      '[data-contact-action="email"]'
    );

    if (!sendEmailButton) {
      sendEmailButton = document.createElement("a");
      sendEmailButton.dataset.contactAction = "email";
      sendEmailButton.className = "contact-action";
      sendEmailButton.textContent = "이메일 보내기";

      buttonArea.append(sendEmailButton);
    }

    callButton = buttonArea.querySelector(
      '[data-contact-action="phone"]'
    );

    if (!callButton) {
      callButton = document.createElementElement
        ? document.createElementElement("a")
        : document.createElement("a");

      callButton.dataset.contactAction = "phone";
      callButton.className =
        "contact-action contact-action--phone";
      callButton.textContent = "전화하기";

      buttonArea.append(callButton);
    }
  }

  // 버튼에 현재 이메일과 전화번호 반영
  function updateContactButtons() {
    const email = $("cardEmail")?.textContent.trim() || "";

    const phone =
      $("cardPhone")?.textContent
        .trim()
        .replace(/[^+0-9]/g, "") || "";

    if (sendEmailButton) {
      if (email) {
        sendEmailButton.href =
          "mailto:" + encodeURIComponent(email);

        sendEmailButton.removeAttribute("aria-disabled");
      } else {
        sendEmailButton.removeAttribute("href");
        sendEmailButton.setAttribute("aria-disabled", "true");
      }
    }

    if (callButton) {
      if (phone) {
        callButton.href = "tel:" + phone;
        callButton.removeAttribute("aria-disabled");
      } else {
        callButton.removeAttribute("href");
        callButton.setAttribute("aria-disabled", "true");
      }
    }
  }

  for (const button of [sendEmailButton, callButton]) {
    if (!button) continue;

    button.addEventListener("click", event => {
      updateContactButtons();

      if (button.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        announce("명함 수정에서 연락처를 입력해 주세요.");
      }
    });
  }

  updateContactButtons();

  // 클립보드 복사
  async function copyText(text) {
    if (window.isSecureContext && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // API 실패 시 대체 방법 시도
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

  // 이메일 주소 클릭 시 복사
  if (emailLink) {
    emailLink.title = "클릭하여 이메일 주소 복사";

    emailLink.addEventListener("click", async event => {
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
    });
  }

  fillForm();

  // 기본 프로필 사진 로딩 실패 처리
  const portraitContainer = $("portrait");
  const initialPhoto = portraitContainer?.querySelector("img");

  if (initialPhoto) {
    const initialVersion = photoVersion;

    const handleFailure = () => {
      if (
        photoVersion !== initialVersion ||
        !initialPhoto.isConnected
      ) {
        return;
      }

      portraitContainer.innerHTML = placeholder;

      announce(
        "dog1.jpg를 찾지 못했습니다. HTML과 같은 폴더에 있는지, " +
        "확장자가 맞는지 확인하거나 명함 수정에서 사진을 선택하세요."
      );
    };

    initialPhoto.addEventListener("error", handleFailure, {
      once: true
    });

    if (initialPhoto.complete && !initialPhoto.naturalWidth) {
      handleFailure();
    }
  }

  // 편집창 열기 / 닫기
  const editToggle = $("editToggle");
  const editor = $("editor");

  if (editToggle && editor) {
    editToggle.addEventListener("click", () => {
      const open = editor.hidden;

      editor.hidden = !open;
      editToggle.setAttribute("aria-expanded", String(open));

      if (open) {
        fillForm();
        $("nameInput")?.focus();
      }
    });
  }

  // 명함 정보 적용
  if (editor) {
    editor.addEventListener("submit", event => {
      event.preventDefault();

      if (
        fields.some(
          ([inputId, cardId]) => !$(inputId) || !$(cardId)
        )
      ) {
        announce("HTML의 입력창과 명함 요소 ID를 확인해 주세요.");
        return;
      }

      if (fields.some(([id]) => !$(id).value.trim())) {
        announce("모든 정보를 입력해 주세요.");
        return;
      }

      for (const [inputId, cardId] of fields) {
        $(cardId).textContent = $(inputId).value.trim();
      }

      if (emailLink) {
        emailLink.href =
          "mailto:" +
          encodeURIComponent($("cardEmail").textContent);
      }

      if (phoneLink) {
        phoneLink.href =
          "tel:" +
          $("cardPhone").textContent.replace(/[^+0-9]/g, "");
      }

      updateContactButtons();

      document.title =
        $("cardName").textContent + " · 웹명함";

      const image = portraitContainer?.querySelector("img");

      if (image) {
        image.alt =
          $("cardName").textContent + " 프로필 사진";
      }

      announce("적용했습니다. HTML 다운로드를 눌러 저장하세요.");
    });
  }

  // 사진 선택 및 변환
  const photoInput = $("photoInput");
  const downloadButton = $("download");

  if (photoInput && portraitContainer) {
    photoInput.addEventListener("change", async event => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      ) {
        announce("10MB 이하의 JPG, PNG, WebP 이미지를 선택해 주세요.");
        event.target.value = "";
        return;
      }

      const version = ++photoVersion;

      if (downloadButton) {
        downloadButton.disabled = true;
      }

      try {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => resolve(reader.result);

          reader.onerror = () => reject(
            reader.error || new Error("File read failed")
          );

          reader.onabort = () => reject(
            new Error("File read aborted")
          );

          reader.readAsDataURL(file);
        });

        const image = new Image();

        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () => reject(
            new Error("Image load failed")
          );
          image.src = data;
        });

        if (version !== photoVersion) return;

        const canvas = document.createElement("canvas");

        const side = Math.min(
          640,
          image.naturalWidth,
          image.naturalHeight
        );

        if (side <= 0) {
          throw new Error("Invalid image size");
        }

        canvas.width = side;
        canvas.height = side;

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Canvas unavailable");
        }

        const crop = Math.min(
          image.naturalWidth,
          image.naturalHeight
        );

        context.drawImage(
          image,
          (image.naturalWidth - crop) / 2,
          (image.naturalHeight - crop) / 2,
          crop,
          crop,
          0,
          0,
          side,
          side
        );

        const portrait = new Image();

        portrait.src = canvas.toDataURL("image/png");
        portrait.alt =
          ($("cardName")?.textContent.trim() || "사용자") +
          " 프로필 사진";

        portraitContainer.replaceChildren(portrait);

        announce(
          "사진을 적용했습니다. 다운로드하면 사진도 함께 저장됩니다."
        );
      } catch {
        if (version === photoVersion) {
          announce(
            "이미지를 읽지 못했습니다. 다른 사진을 선택해 주세요."
          );
        }
      } finally {
        if (version === photoVersion) {
          if (downloadButton) {
            downloadButton.disabled = false;
          }

          photoInput.value = "";
        }
      }
    });
  }

  // 사진 제거
  const removePhoto = $("removePhoto");

  if (removePhoto && portraitContainer) {
    removePhoto.addEventListener("click", () => {
      photoVersion++;

      if (downloadButton) {
        downloadButton.disabled = false;
      }

      portraitContainer.innerHTML = placeholder;

      if (photoInput) {
        photoInput.value = "";
      }

      announce("사진을 제거했습니다.");
    });
  }

  // 수정된 HTML 다운로드
  if (downloadButton) {
    downloadButton.addEventListener("click", () => {
      let url = null;

      try {
        updateContactButtons();

        const clone = document.documentElement.cloneNode(true);

        const clonedEditor = clone.querySelector("#editor");
        const clonedToggle = clone.querySelector("#editToggle");
        const clonedStatus = clone.querySelector("#status");

        if (clonedEditor) {
          clonedEditor.hidden = true;
        }

        if (clonedToggle) {
          clonedToggle.setAttribute("aria-expanded", "false");
        }

        if (clonedStatus) {
          clonedStatus.textContent = "";
        }

        for (const input of clone.querySelectorAll("input")) {
          input.removeAttribute("value");
        }

        const blob = new Blob(
          ["<!doctype html>\n" + clone.outerHTML],
          { type: "text/html;charset=utf-8" }
        );

        url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "business-card.html";

        document.body.append(link);

        try {
          link.click();
        } finally {
          link.remove();
        }

        announce("HTML 파일 다운로드를 시작했습니다.");
      } catch {
        announce("다운로드하지 못했습니다. 다시 시도해 주세요.");
      } finally {
        if (url) {
          const downloadUrl = url;

          setTimeout(() => {
            URL.revokeObjectURL(downloadUrl);
          }, 1000);
        }
      }
    });
  }
}

// HTML 요소가 준비된 후 실행
if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeBusinessCard,
    { once: true }
  );
} else {
  initializeBusinessCard();
}