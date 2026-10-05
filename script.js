(function () {
  'use strict';

  /* ============================================================
   * 일정 설정 — 새 모집 일정으로 바꿀 때 이 블록만 수정하세요.
   * 날짜 형식: YYYY-MM-DD (한국시간 기준)
   * index.html의 일정 문구(① 상단 카드 ② 일정 섹션 ③ 신청 가능한 날 표)도 함께 바꿔야 합니다.
   * ============================================================ */
  var SCHEDULE = {
    apply:   { start: '2026-10-07', end: '2026-10-16' },
    review:  { start: '2026-10-19', end: '2026-11-13' },
    account: { start: '2026-11-16', end: '2026-11-27' }
  };
  // 접수가 있는 날과 대상 (토·일·공휴일 제외)
  var APPLY_DAYS = {
    '2026-10-07': '출생연도 끝자리 홀수',
    '2026-10-08': '출생연도 끝자리 짝수',
    '2026-10-12': '출생연도 관계없이 누구나',
    '2026-10-13': '출생연도 관계없이 누구나',
    '2026-10-14': '출생연도 관계없이 누구나',
    '2026-10-15': '출생연도 관계없이 누구나',
    '2026-10-16': '출생연도 관계없이 누구나'
  };
  var NO_APPLY_REASON = { '2026-10-09': '한글날 공휴일' };

  var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
  var CHECK_KEY = 'jjp-ym2-checklist-v1';

  /* ---------- 날짜 도구 ---------- */
  function parseYmd(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return d;
  }
  function weekdayOf(s) { return parseYmd(s).getUTCDay(); }
  function fmt(s) {
    var d = parseYmd(s);
    return (d.getUTCMonth() + 1) + '.' + d.getUTCDate() + '(' + WEEKDAYS[d.getUTCDay()] + ')';
  }
  function dayDiff(a, b) { return Math.round((parseYmd(b) - parseYmd(a)) / 86400000); }

  // 한국은 서머타임이 없어 UTC+9 고정으로 계산합니다.
  // 날짜 미리보기(?today=YYYY-MM-DD)는 내 컴퓨터(localhost)에서만 동작해요. 공개 주소에서는 무시됩니다.
  function isLocalPreview() {
    var h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  }
  function todayKST() {
    var override = isLocalPreview() ? /[?&]today=(\d{4}-\d{2}-\d{2})(?:&|$)/.exec(window.location.search) : null;
    if (override && parseYmd(override[1])) return override[1];
    return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  }

  /* ---------- 상태 배너 · 타임라인 ---------- */
  function nextApplyDay(today) {
    var keys = Object.keys(APPLY_DAYS).sort();
    for (var i = 0; i < keys.length; i++) if (keys[i] > today) return keys[i];
    return null;
  }

  function renderStatus(today) {
    var el = document.getElementById('status-banner');
    if (!el) return;
    var A = SCHEDULE.apply, R = SCHEDULE.review, C = SCHEDULE.account;
    var state, title, sub;

    if (today < A.start) {
      state = 'before';
      title = '2차 신청 시작 전 · ' + fmt(A.start) + ' 시작 (D-' + dayDiff(today, A.start) + ')';
      sub = fmt('2026-10-07') + '·' + fmt('2026-10-08') + ' 이틀은 출생연도 끝자리 홀짝제예요. 접수 시간은 신청할 취급기관 앱 공지를 확인하세요.';
    } else if (today <= A.end) {
      state = 'apply';
      title = '2차 신청 기간 · ' + fmt(A.start) + ' ~ ' + fmt(A.end);
      if (APPLY_DAYS[today]) {
        sub = '오늘 ' + fmt(today) + ' · 접수일 · 대상: ' + APPLY_DAYS[today] + '. 접수 시간은 신청할 취급기관 앱 공지를 확인하세요.';
      } else {
        var why = NO_APPLY_REASON[today] || '주말';
        var nxt = nextApplyDay(today);
        sub = '오늘 ' + fmt(today) + ' · 접수 없음 (' + why + ').' + (nxt ? ' 다음 접수일: ' + fmt(nxt) + '.' : '');
      }
    } else if (today < C.start) {
      state = 'after-apply';
      title = '2차 신청 접수가 끝났어요';
      if (today < R.start) {
        sub = '심사는 ' + fmt(R.start) + '부터 시작돼요.';
      } else if (today <= R.end) {
        sub = '심사·결과 안내 기간이에요. 결과는 개별 안내돼요. (사전심사 결과 10.30~11.2 잠정, 최종 11.12~11.13)';
      } else {
        sub = '심사 기간이 끝났어요. 계좌개설은 ' + fmt(C.start) + '부터예요.';
      }
    } else if (today <= C.end) {
      state = 'account';
      title = '계좌개설 기간 · ' + fmt(C.start) + ' ~ ' + fmt(C.end);
      var wd = weekdayOf(today);
      sub = (wd === 0 || wd === 6)
        ? '오늘은 주말이라 계좌개설이 없는 날이에요 (토·일 제외). ‘가입 가능’ 안내를 받은 분만 개설할 수 있어요.'
        : '‘가입 가능’ 안내를 받은 분만 취급기관 앱에서 개설할 수 있어요. 이 기간이 지나면 개설이 안 돼요.';
    } else {
      state = 'ended';
      title = '2차 모집 일정이 모두 끝났어요';
      sub = '이 페이지는 2026년 10월 2차 모집 안내 자료예요. 이후 모집 일정은 공식 공지를 확인해 주세요.';
    }

    el.setAttribute('data-state', state);
    el.textContent = '';
    var t = document.createElement('p');
    t.className = 'status-title';
    t.textContent = title;
    var s = document.createElement('p');
    s.className = 'status-sub';
    s.textContent = sub;
    el.appendChild(t);
    el.appendChild(s);
  }

  function renderTimeline(today) {
    var items = document.querySelectorAll('#timeline .tl-item');
    for (var i = 0; i < items.length; i++) {
      var li = items[i];
      var s = li.getAttribute('data-start');
      var e = li.getAttribute('data-end');
      var badge = li.querySelector('.tl-state');
      var cls, label;
      if (today < s) { cls = 'is-upcoming'; label = '진행 전'; }
      else if (today <= e) { cls = 'is-current'; label = '진행 중'; }
      else { cls = 'is-done'; label = '종료'; }
      li.classList.remove('is-upcoming', 'is-current', 'is-done');
      li.classList.add(cls);
      if (badge) badge.textContent = label;
    }
  }

  /* ---------- 상단 메뉴 ---------- */
  function setupNav() {
    var nav = document.getElementById('subnav');
    if (!nav) return;
    var list = nav.querySelector('ul');
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

    function setActive(index) {
      links.forEach(function (a, i) {
        if (i === index) {
          a.setAttribute('aria-current', 'true');
          var left = a.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
          var want = left - (list.clientWidth - a.offsetWidth) / 2;
          if (typeof list.scrollTo === 'function') list.scrollTo({ left: want, behavior: 'auto' });
          else list.scrollLeft = want;
        } else {
          a.removeAttribute('aria-current');
        }
      });
    }

    if ('IntersectionObserver' in window) {
      var visible = {};
      var navH = nav.offsetHeight || 56;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
        for (var i = 0; i < targets.length; i++) {
          if (targets[i] && visible[targets[i].id]) { setActive(i); return; }
        }
      }, { rootMargin: '-' + (navH + 16) + 'px 0px -55% 0px', threshold: 0 });
      targets.forEach(function (t) { if (t) io.observe(t); });
    }
  }

  // 같은 페이지 이동 시 키보드 초점도 함께 옮깁니다.
  function setupAnchorFocus() {
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      window.setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
    });
  }

  /* ---------- 체크리스트 ---------- */
  function setupChecklist() {
    var list = document.getElementById('checklist-list');
    if (!list) return;
    var inputs = Array.prototype.slice.call(list.querySelectorAll('input[type="checkbox"]'));
    var doneEl = document.getElementById('check-done');
    var totalEl = document.getElementById('check-total');
    var bar = document.getElementById('check-bar');
    var note = document.getElementById('storage-note');
    var resetBtn = document.getElementById('btn-reset');
    var resetMsg = document.getElementById('reset-msg');
    var storageOK = true;
    var NOTE_OK = note ? note.textContent : '';
    var NOTE_FAIL = '이 브라우저에서는 저장이 막혀 있어 새로고침하면 체크가 초기화돼요. 체크 기능은 그대로 쓸 수 있어요.';

    function readSaved() {
      try {
        var raw = window.localStorage.getItem(CHECK_KEY);
        if (!raw) return [];
        var arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
      } catch (e) {
        storageOK = false;
        return [];
      }
    }
    function writeSaved() {
      var ids = inputs.filter(function (i) { return i.checked; }).map(function (i) { return i.getAttribute('data-id'); });
      try {
        window.localStorage.setItem(CHECK_KEY, JSON.stringify(ids));
        storageOK = true;
      } catch (e) {
        storageOK = false;
      }
    }
    function render() {
      var n = inputs.filter(function (i) { return i.checked; }).length;
      if (doneEl) doneEl.textContent = String(n);
      if (totalEl) totalEl.textContent = String(inputs.length);
      if (bar) { bar.max = inputs.length; bar.value = n; }
      if (note) note.textContent = storageOK ? NOTE_OK : NOTE_FAIL;
    }

    var saved = readSaved();
    inputs.forEach(function (i) {
      i.checked = saved.indexOf(i.getAttribute('data-id')) !== -1;
      i.addEventListener('change', function () { writeSaved(); render(); });
    });
    render();

    var armed = false, timer = null;
    function disarm() {
      armed = false;
      if (timer) { window.clearTimeout(timer); timer = null; }
      if (resetBtn) resetBtn.textContent = '체크 초기화';
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!armed) {
          armed = true;
          resetBtn.textContent = '한 번 더 누르면 초기화돼요';
          if (resetMsg) resetMsg.textContent = '실수로 지우지 않도록 한 번 더 확인해요.';
          timer = window.setTimeout(function () { disarm(); if (resetMsg) resetMsg.textContent = ''; }, 4000);
          return;
        }
        inputs.forEach(function (i) { i.checked = false; });
        writeSaved();
        render();
        disarm();
        if (resetMsg) resetMsg.textContent = '체크를 모두 초기화했어요.';
        window.setTimeout(function () { if (resetMsg) resetMsg.textContent = ''; }, 4000);
      });
    }
  }

  /* ---------- FAQ ---------- */
  function setupFaq() {
    var buttons = document.querySelectorAll('.faq-btn');
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.hidden = open;
      });
    });
  }

  /* ---------- 링크 복사 · 공유 · 인쇄 ---------- */
  function setupTools() {
    var msgEl = document.getElementById('tool-msg');
    var urlBox = document.getElementById('url-fallback');
    var urlInput = document.getElementById('url-input');
    var msgTimer = null;

    function say(text) {
      if (!msgEl) return;
      msgEl.textContent = text;
      if (msgTimer) window.clearTimeout(msgTimer);
      msgTimer = window.setTimeout(function () { msgEl.textContent = ''; }, 5000);
    }
    function pageUrl() { return window.location.href.split('#')[0].split('?')[0]; }

    function legacyCopy(text) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return !!ok;
      } catch (e) {
        return false;
      }
    }
    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
      }
      return Promise.resolve(legacyCopy(text));
    }
    function doCopy(successMsg) {
      var url = pageUrl();
      copyText(url).then(function (ok) {
        if (ok) {
          if (urlBox) urlBox.hidden = true;
          say(successMsg);
        } else {
          if (urlInput && urlBox) {
            urlInput.value = url;
            urlBox.hidden = false;
            urlInput.focus();
            urlInput.select();
          }
          say('자동 복사가 막혀 있어요. 아래 주소를 직접 복사해 주세요.');
        }
      });
    }

    var btnCopy = document.getElementById('btn-copy');
    var btnShare = document.getElementById('btn-share');
    var btnPrint = document.getElementById('btn-print');
    var btnTop = document.getElementById('btn-top');

    if (btnCopy) btnCopy.addEventListener('click', function () { doCopy('링크를 복사했어요.'); });

    if (btnShare) {
      btnShare.addEventListener('click', function () {
        var data = { title: document.title, text: '청년미래적금 2차 신청 가이드 - 쩐투력', url: pageUrl() };
        if (navigator.share) {
          navigator.share(data).catch(function (err) {
            if (err && err.name === 'AbortError') return;
            doCopy('공유 창을 열 수 없어 링크를 복사했어요.');
          });
        } else {
          doCopy('이 브라우저는 공유하기를 지원하지 않아 링크를 복사했어요.');
        }
      });
    }

    if (btnPrint) {
      btnPrint.addEventListener('click', function () {
        try { window.print(); } catch (e) { say('이 브라우저에서는 인쇄를 열 수 없어요. 외부 브라우저에서 열어 주세요.'); }
      });
    }

    if (btnTop) {
      btnTop.addEventListener('click', function () {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        var top = document.getElementById('top');
        if (top) {
          if (!top.hasAttribute('tabindex')) top.setAttribute('tabindex', '-1');
          top.focus({ preventScroll: true });
        }
      });
    }

    var inapp = document.getElementById('inapp-notice');
    if (inapp && /Instagram/i.test(navigator.userAgent || '')) inapp.hidden = false;

    // 첫 화면(상단 소개)에서는 하단 고정 버튼을 숨겨 내용을 가리지 않게 합니다.
    var bar = document.querySelector('.float-bar');
    var hero = document.getElementById('top');
    if (bar && hero) {
      var updateBar = function () {
        var heroBottom = hero.getBoundingClientRect().bottom;
        bar.classList.toggle('is-hidden', heroBottom > 120);
      };
      updateBar();
      window.addEventListener('scroll', updateBar, { passive: true });
      window.addEventListener('resize', updateBar);
    }
  }

  /* ---------- 인쇄 시 접힌 항목 펼치기 ---------- */
  function setupPrint() {
    var opened = [];
    window.addEventListener('beforeprint', function () {
      var closed = document.querySelectorAll('details:not([open])');
      Array.prototype.forEach.call(closed, function (d) { d.open = true; opened.push(d); });
    });
    window.addEventListener('afterprint', function () {
      opened.forEach(function (d) { d.open = false; });
      opened = [];
    });
  }

  function init() {
    var today = todayKST();
    renderStatus(today);
    renderTimeline(today);
    setupNav();
    setupAnchorFocus();
    setupChecklist();
    setupFaq();
    setupTools();
    setupPrint();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
