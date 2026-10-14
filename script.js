"use strict";

const $ = id => document.getElementById(id);

const placeholder =
  '<svg aria-hidden="true" viewBox="0 0 48 48" fill="none" ' +
  'stroke="currentColor" stroke-width="1.6">' +
  '<circle cx="24" cy="17" r="8"/>' +
  '<path d="M8 41c0-10 7-16 16-16s16 6 16 16"/></svg>';

const announce = message => {
  $("status").textContent = message;
};

function fillForm() {
  for (const [input, card] of [
    ["nameInput", "cardName"],
    ["roleInput", "cardRole"],
    ["emailInput", "cardEmail"],
    ["phoneInput", "cardPhone"]
  ]) {
    $(input).value = $(card).textContent;
  }
}

let photoVersion = 0;

fillForm();

// 기본 프로필 사진 로딩 실패 처리
const initialPhoto = $("portrait").querySelector("img");

if (initialPhoto) {
  const initialVersion = photoVersion;

  const handleFailure = () => {
    if (
      photoVersion !== initialVersion ||
      !initialPhoto.isConnected
    ) {
      return;
    }

    $("portrait").innerHTML = placeholder;

    announce(
      "dog1.jpg를 찾지 못했습니다. HTML과 같은 폴더에 있는지, " +
      "확장자가 맞는지 확인하거나 명함 수정에서 사진을 선택하세요."
    );
  };

  initialPhoto.addEventListener(
    "error",
    handleFailure,
    { once: true }
  );

  if (initialPhoto.complete && !initialPhoto.naturalWidth) {
    handleFailure();
  }
}

// 편집창 열기 및 닫기
$("editToggle").addEventListener("click", () => {
  const open = $("editor").hidden;

  $("editor").hidden = !open;

  $("editToggle").setAttribute(
    "aria-expanded",
    String(open)
  );

  if (open) {
    fillForm();
    $("nameInput").focus();
  }
});

// 명함 정보 적용
$("editor").addEventListener("submit", event => {
  event.preventDefault();

  const fields = [
    ["nameInput", "cardName"],
    ["roleInput", "cardRole"],
    ["emailInput", "cardEmail"],
    ["phoneInput", "cardPhone"]
  ];

  if (fields.some(([id]) => !$(id).value.trim())) {
    announce("모든 정보를 입력해 주세요.");
    return;
  }

  for (const [input, card] of fields) {
    $(card).textContent = $(input).value.trim();
  }

  $("emailLink").href =
    "mailto:" +
    encodeURIComponent($("cardEmail").textContent);

  $("phoneLink").href =
    "tel:" +
    $("cardPhone").textContent.replace(/[^+0-9]/g, "");

  document.title =
    $("cardName").textContent + " · 웹명함";

  const image = $("portrait").querySelector("img");

  if (image) {
    image.alt =
      $("cardName").textContent + " 프로필 사진";
  }

  announce("적용했습니다. HTML 다운로드를 눌러 저장하세요.");
});

// 사진 선택 및 데이터 변환
$("photoInput").addEventListener("change", async event => {
  const file = event.target.files[0];

  if (!file) return;

  const version = ++photoVersion;

  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  ) {
    announce("10MB 이하의 JPG, PNG, WebP 이미지를 선택해 주세요.");
    event.target.value = "";
    return;
  }

  $("download").disabled = true;

  try {
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });

    const image = new Image();

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = data;
    });

    if (version !== photoVersion) return;

    const canvas = document.createElement("canvas");

    const side = Math.min(
      640,
      image.naturalWidth,
      image.naturalHeight
    );

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
      $("cardName").textContent + " 프로필 사진";

    $("portrait").replaceChildren(portrait);

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
      $("download").disabled = false;
    }

    event.target.value = "";
  }
});

// 사진 제거
$("removePhoto").addEventListener("click", () => {
  photoVersion++;

  $("download").disabled = false;
  $("portrait").innerHTML = placeholder;
  $("photoInput").value = "";

  announce("사진을 제거했습니다.");
});

// 수정된 HTML 다운로드
$("download").addEventListener("click", () => {
  const clone = document.documentElement.cloneNode(true);

  clone.querySelector("#editor").hidden = true;

  clone.querySelector("#editToggle").setAttribute(
    "aria-expanded",
    "false"
  );

  clone.querySelector("#status").textContent = "";

  for (const input of clone.querySelectorAll("input")) {
    input.removeAttribute("value");
  }

  const blob = new Blob(
    ["<!doctype html>\n" + clone.outerHTML],
    { type: "text/html;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "business-card.html";

  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  announce("HTML 파일을 저장했습니다.");
});