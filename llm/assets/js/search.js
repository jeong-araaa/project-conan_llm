/** 
  Jeong A Ra JS
  http://jeongara.com/
**/
/*

        검색 JS

*/
/* ======================================================
 * 1) 검색어 입력 시 삭제버튼 노출 및 적용
 * ====================================================== */
function initSearchDeleteButton() {
  document.querySelectorAll('.search__group').forEach((group) => {
    const field = group.querySelector('.search__input'); // textarea 또는 input
    const btnDel = group.querySelector('.search__btn--delete'); // 삭제 버튼
    if (!field || !btnDel) return;

    // 상태 갱신 함수
    const updateState = () => {
      const hasValue = (field.value || '').trim().length > 0;
      group.classList.toggle('is-has-value', hasValue);
    };

    // 입력 시 감지
    ['input', 'change', 'cut', 'paste'].forEach(ev => {
      field.addEventListener(ev, updateState, { passive: true });
    });

    // 삭제 버튼 클릭 시
    btnDel.addEventListener('click', (e) => {
      e.preventDefault();
      field.value = '';
      updateState();
      field.focus();

      // 높이값 되돌리기
      if (field.matches('textarea.search__input')) {
        autosizeTextarea(field);
      }
    });

    // 초기 상태 반영 (자동완성/복원 대응)
    updateState();
    setTimeout(updateState, 100);
  });
}

/* ======================================================
 * 2) textarea 자동 높이 (data-autosize가 붙은 것만)
 *    - input에는 영향 없음
 * ====================================================== */
function getNumberFromUnit(val, ta) {
  if (!val) return null;
  const str = String(val).trim();
  if (str.endsWith('rem')) {
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return parseFloat(str) * root;
  }
  if (str.endsWith('px')) return parseFloat(str);
  // 단위 없으면 px로 간주
  return parseFloat(str);
}

function getBaseHeight(ta) {
  const scope = ta.closest('[data-autosize-scope]');
  const w = window.innerWidth;

  // 우선순위: textarea 자체 data- > scope data- > 기본값
  const selfPc  = ta.getAttribute('data-base-pc');
  const selfTb  = ta.getAttribute('data-base-tab');
  const selfMo  = ta.getAttribute('data-base-mo');
  const selfSm  = ta.getAttribute('data-base-sm');

  const scPc = scope?.getAttribute('data-base-pc');
  const scTb = scope?.getAttribute('data-base-tab');
  const scMo = scope?.getAttribute('data-base-mo');
  const scSm = scope?.getAttribute('data-base-sm');

  // 기본값 (컨테이너/자체에 없을 때)
  const defPc = 70;
  const defTb = 54;
  const defMo = '4.8rem';
  const defSm = '7.3rem';

  let baseStr;
  if (w <= 479) {
    baseStr = selfSm ?? scSm ?? defSm;
  } else if (w <= 767) {
    baseStr = selfMo ?? scMo ?? defMo + 'px';
  }  else if (w <= 1023) {
    baseStr = selfTb ?? scTb ?? defTb + 'px';
  } else {
    baseStr = selfPc ?? scPc ?? defPc + 'px';
  }

  return getNumberFromUnit(baseStr, ta) || 70; // 최후 안전값
}

function autosizeTextarea(ta) {
  const cs = getComputedStyle(ta);
  const box = cs.boxSizing;
  const padY =
    (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
  const borderY =
    (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
  const lineH = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.5) || 24;

  // 1) 기본 높이 (페이지/컨테이너/자체 설정 반영)
  const baseH = getBaseHeight(ta);

  // 2) 최대 높이 (3줄)
  const maxH = Math.round(lineH * 3 + padY + borderY);

  // 3) 계산
  ta.style.height = baseH + 'px';

  // 내용 없으면 기본값 유지
  if (!ta.value || ta.value.trim() === '') return;

  const scrollH = ta.scrollHeight;
  let target;
  if (box === 'border-box') {
    target = scrollH + borderY;
  } else {
    target = scrollH - padY;
  }

  ta.style.height = Math.min(Math.max(target, baseH), maxH) + 'px';
}

function initAutosizeTextareas() {
  const targets = document.querySelectorAll('textarea.search__input[data-autosize], textarea.search__input'); // autosize 안 달아도 동작하게 하려면 두 선택자 병행
  if (!targets.length) return;

  targets.forEach((ta) => {
    const resize = () => autosizeTextarea(ta);
    ['input', 'change', 'cut', 'paste', 'drop'].forEach((ev) =>
      ta.addEventListener(ev, resize, { passive: true })
    );
    window.addEventListener('resize', resize, { passive: true });
    requestAnimationFrame(resize);
  });
}


/* ======================================================
 * 부팅
 * ====================================================== */
document.addEventListener('DOMContentLoaded', ()=>{
  initSearchDeleteButton();
  initAutosizeTextareas();
});