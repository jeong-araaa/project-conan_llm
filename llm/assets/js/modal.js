/** 
  Jeong A Ra JS
  http://jeongara.com/
**/
/*

        모달창 JS

*/
function getOpenModals() {
  return document.querySelectorAll('.modal.modal--active');
}

function lockScrollIfNeeded() {
  if (getOpenModals().length > 0) {
    document.body.classList.add('hidden');
  } else {
    document.body.classList.remove('hidden');
  }
}

function modalShowPop(id) {
  const layer = document.getElementById(id);
  if (!layer) return;
  layer.classList.add('modal--active');
  layer.setAttribute('aria-hidden', 'false');
  lockScrollIfNeeded();
}

function modalHidePop(id) {
  const layer = document.getElementById(id);
  if (!layer) return;
  layer.classList.remove('modal--active');
  layer.setAttribute('aria-hidden', 'true');
  lockScrollIfNeeded();
}

// ==========================
// Delegated events
// ==========================
// 열기: data-modal-open="modalId"
document.addEventListener('click', function (e) {
  const opener = e.target.closest('[data-modal-open]');
  if (!opener) return;
  e.preventDefault();
  const targetId = opener.getAttribute('data-modal-open');
  modalShowPop(targetId);
});

// 닫기: data-modal-close (딤/닫기/취소 공통)
document.addEventListener('click', function (e) {
  const closer = e.target.closest('[data-modal-close]');
  if (!closer) return;
  e.preventDefault();
  const layer = closer.closest('.modal');
  if (layer && layer.id) modalHidePop(layer.id);
});

// 선택리스트
const items = document.querySelectorAll(".select-list li");
items.forEach(item => {
  item.addEventListener("click", () => {
    // 모든 li에서 is-active 제거
    items.forEach(el => el.classList.remove("is-active"));
    // 클릭한 li에만 추가
    item.classList.add("is-active");

    // 모달 닫기
    const layer = item.closest('.modal');
    if (layer && layer.id) {
      modalHidePop(layer.id);
    }

    // 선택된 텍스트
    const selectedText = item.textContent.trim();

    // 버튼에 표시 업데이트
    const triggerBtn = document.querySelector(`[data-modal-open="${layer.id}"]`);
    if (triggerBtn) {
      // 기존 텍스트 부분만 교체 (아이콘 유지)
      const icon = triggerBtn.querySelector(".icon");
      triggerBtn.textContent = selectedText;
      if (icon) triggerBtn.appendChild(icon);
    }

    // hidden input 값 업데이트
    const row = triggerBtn?.closest('.form-row');
    if (row) {
      const hiddenInput = row.querySelector('input[type="hidden"]');
      if (hiddenInput) {
        hiddenInput.removeAttribute('disabled'); // 제출 가능하도록
        hiddenInput.value = selectedText;
      }
      row.classList.add('has-value');
    }
  });
});