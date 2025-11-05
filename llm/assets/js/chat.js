/** 
  Jeong A Ra JS
  http://jeongara.com/
**/
/*

        채팅 JS

*/
const _evtEl = (e) => (e.composedPath?.()[0]) || e.target;
const _toEl  = (n) => (n instanceof Element ? n : null);
const _closestFromEvent = (e, sel) => {
  const el = _toEl(_evtEl(e));
  return el ? el.closest(sel) : null;
};
const _containsEvent = (root, e) => {
  const el = _toEl(_evtEl(e));
  return el ? root.contains(el) : false;
};
/* ======================================================
 * 1) 모달창 (불만작성) 드롭다운 관련
 * ====================================================== */
function initDropdowns() {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // textarea/input 변경 시 전송 버튼 상태 갱신
  function bindTextareaWatch(scope, dropdown) {
    const textarea = $('textarea.int, textarea.search__input, .modal textarea.int', scope);
    const submit   = $('.btn-submit', scope);
    if (!textarea || !submit) return;

    // 중복 바인딩 방지
    if (textarea.dataset.boundSubmit === '1') return;
    textarea.dataset.boundSubmit = '1';

    const updateSubmit = () => {
      const selected = dropdown.classList.contains('is-selected');
      const hasVal   = !!textarea.value.trim();
      submit.disabled = !(selected && hasVal);
    };

    textarea.addEventListener('input', updateSubmit, { passive: true });
    // 초기 상태
    submit.disabled = true;
    updateSubmit();
  }

  $$('.dropdown__group').forEach((dropdown) => {
    const btn  = $('.dropdown__btn', dropdown);
    const list = $('.dropdown__list', dropdown);
    if (!btn || !list) return;

    // 이 드롭다운이 속한 폼(또는 컨테이너) 범위
    const scope = dropdown.closest('form') || dropdown.closest('.modal') || document;

    // 버튼 클릭 → 열기/닫기
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdown.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
    });

    // 리스트 항목 선택
    list.querySelectorAll('li > button').forEach((itemBtn) => {
      itemBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        // li 상태 갱신
        list.querySelectorAll('li').forEach(li => li.classList.remove('is-active'));
        const li = itemBtn.closest('li');
        li.classList.add('is-active');

        // 버튼 텍스트 변경 (아이콘 유지)
        const icon = btn.querySelector('.icon');
        btn.textContent = itemBtn.textContent + ' ';
        if (icon) btn.appendChild(icon);

        // 선택 상태 표시
        dropdown.classList.add('is-selected');
        btn.classList.add('is-selected');

        // 드롭다운 닫기
        dropdown.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');

        // textarea 활성화 + 포커스
        const textarea = $('textarea.int, textarea.search__input, .modal textarea.int', scope);
        if (textarea) {
          textarea.disabled = false;
          // placeholder 유지/변경이 필요하면 여기서 처리 가능
          textarea.focus();
        }

        // submit 활성화 로직 바인딩/갱신
        bindTextareaWatch(scope, dropdown);
        // 선택 직후에도 한 번 체크
        const submit = $('.btn-submit', scope);
        if (submit && textarea) {
          submit.disabled = !(dropdown.classList.contains('is-selected') && !!textarea.value.trim());
        }
      });
    });
  });

  // 바깥 클릭 시 닫기
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.dropdown__group.is-open').forEach((openDD) => {
      if (!_containsEvent(openDD, e)) {
        openDD.classList.remove('is-open');
        const b = openDD.querySelector('.dropdown__btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  });
}


/* ======================================================
 * 2) 채팅 액션 버튼 (좋아요 / 싫어요 / 복사)
 * ====================================================== */
function initChatActions(){
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 클릭 공통
  document.addEventListener('click', (e)=>{
    const btn = _closestFromEvent(e, '.btn-action');
    if (!btn) return;

    // 복사 버튼 (개발자 복사 로직은 별도)
    if (btn.classList.contains('btn-action--copy')){
      if (btn.getAttribute('aria-busy') === 'true') return;
      btn.classList.add('is-active');
      btn.setAttribute('aria-busy', 'true');

      const ms = parseInt(btn.dataset.resetMs || '1000', 10);
      setTimeout(()=>{
        btn.classList.remove('is-active');
        btn.setAttribute('aria-busy', 'false');
      }, ms);
      return;
    }

    // 좋아요 / 싫어요
    if (btn.classList.contains('btn-action--like') || btn.classList.contains('btn-action--dislike')){
      const nowOn = btn.classList.toggle('is-active');
      btn.setAttribute('aria-pressed', nowOn ? 'true' : 'false');
    }
  });

  // === PC 환경: 마우스 hover 유지 ===
  if (!isTouch) {
    document.addEventListener('mouseenter', (e)=>{
      const btn = _closestFromEvent(e, '.btn-action');
      if (btn) btn.classList.add('is-hover');
    }, true);

    document.addEventListener('mouseleave', (e)=>{
      const btn = _closestFromEvent(e, '.btn-action');
      if (btn) btn.classList.remove('is-hover');
    }, true);
  }

  // === 모바일 환경: 터치 시 잠깐만 is-hover 보여주기 ===
  if (isTouch) {
    document.addEventListener('touchstart', (e)=>{
      const btn = _closestFromEvent(e, '.btn-action');
      if (!btn) return;

      // 기존 타임아웃 있으면 초기화
      if (btn._hoverTimeout) clearTimeout(btn._hoverTimeout);

      btn.classList.add('is-hover');
      // 0.5초~1초 후 자동 제거
      const delay = parseInt(btn.dataset.hoverMs || '600', 10);
      btn._hoverTimeout = setTimeout(()=>{
        btn.classList.remove('is-hover');
        btn._hoverTimeout = null;
      }, delay);
    }, {passive:true});
  }
}



/* ======================================================
 * 3) 모바일 플로팅버튼
 * ====================================================== */
function initFloatingGuide() {
  const group = document.querySelector('.floating__group');
  if (!group) return;

  const btnOpen = group.querySelector('.btn-mobile__guide');
  const btnClose = group.querySelector('.btn-mobile__close');
  const guideGroup = group.querySelector('.btn-guide__group');
  if (!btnOpen || !guideGroup) return;

  // 열기 버튼 클릭
  btnOpen.addEventListener('click', (e) => {
    e.preventDefault();
    group.classList.add('is-active');
  });

  // 닫기 버튼 클릭
  btnClose?.addEventListener('click', (e) => {
    e.preventDefault();
    group.classList.remove('is-active');
  });

  // 영역 밖 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!group.contains(e.target)) {
      group.classList.remove('is-active');
    }
  });
}


/* ======================================================
 * 부팅
 * ====================================================== */
document.addEventListener('DOMContentLoaded', ()=>{
  initDropdowns();
  initChatActions();
  initFloatingGuide();
});