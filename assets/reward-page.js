(function () {
  var MODAL_ID = 'bz-refer-copy-modal';

  function getModal() {
    var modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'bz-refer-copy-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'bz-refer-copy-modal-title');
    modal.innerHTML =
      '<div class="bz-refer-copy-modal__panel">' +
      '<p id="bz-refer-copy-modal-title" class="bz-refer-copy-modal__message">Referral link copied to clipboard !</p>' +
      '<button type="button" class="bz-refer-copy-modal__ok">OK</button>' +
      '</div>';
    document.body.appendChild(modal);

    modal.querySelector('.bz-refer-copy-modal__ok').addEventListener('click', function () {
      hideModal(modal);
    });

    modal.addEventListener('click', function (event) {
      if (event.target === modal) hideModal(modal);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.classList.contains('is-visible')) {
        hideModal(modal);
      }
    });

    return modal;
  }

  function showModal(modal) {
    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.bz-refer-copy-modal__ok').focus();
  }

  function hideModal(modal) {
    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
  }

  function copyText(text) {
    if (!text) return Promise.reject();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy') ? resolve() : reject();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function getReferralLink(widget) {
    if (!widget) return '';

    var copyTextEl = widget.querySelector('.yotpo-copy-text');
    if (copyTextEl && copyTextEl.textContent.trim()) {
      return copyTextEl.textContent.replace(/\s+/g, ' ').trim();
    }

    var textarea = widget.querySelector('.yotpo-main-share-body-textarea, .yotpo-referral-widget-form textarea');
    if (textarea && textarea.value) {
      var urlMatch = textarea.value.match(/https?:\/\/[^\s"'<>]+/);
      if (urlMatch) return urlMatch[0].trim();
    }

    var smsButton = widget.querySelector('.yotpo-sms-share-button');
    if (smsButton) {
      var smsHref = smsButton.getAttribute('href') || smsButton.dataset.referralLink;
      if (smsHref && /https?:\/\//.test(smsHref)) return smsHref.trim();
    }

    var match = widget.textContent.match(/https:\/\/[^\s"'<>]+/);
    return match ? match[0].trim() : '';
  }

  var TRIGGER_SELECTOR = [
    '.yotpo-widget-referral-share .yotpo-main-copy-link',
    '.yotpo-widget-referral-share .yotpo-referral-widget-form button.yotpo-submit-form',
    '.yotpo-widget-referral-share .yotpo-referral-widget-form .yotpo-submit-form .yotpo-button-style',
    '.yotpo-widget-referral-share .yotpo-referral-widget-form .yotpo-sms-share-button',
    '.yotpo-widget-referral-share .yotpo-referral-widget-form .yotpo-sms-share-button button',
  ].join(',');

  function findTrigger(target) {
    if (!target || !target.closest) return null;
    return target.closest(TRIGGER_SELECTOR);
  }

  /*
   * 事件委托：无论 "Refer your friends" 按钮何时被 Yotpo 渲染或重渲染，
   * 都能在捕获阶段拦截点击，复制推荐链接并弹出提示（保留原复制功能）。
   */
  document.addEventListener(
    'click',
    function (event) {
      var trigger = findTrigger(event.target);
      if (!trigger) return;

      var widget = trigger.closest('.yotpo-widget-referral-share');

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      copyText(getReferralLink(widget))
        .catch(function () {})
        .finally(function () {
          showModal(getModal());
        });
    },
    true
  );
})();

(function () {
  var TARGETS = [
    { text: 'Redeeming your points is easy! Just click Redeem, and select an eligible reward.', html: '<strong>Product Redemption Terms:</strong><br><br>• Product redemptions are subject to inventory availability and may be substituted.<br>• No additional promo codes can be applied on product redemption orders.<br>• No purchase points will be earned on fully point-redemption orders.<br>• If you return a point-redeemed product, points will not be credited back to your account, and customer is responsible for return shipping fees.<br><br>• Points cannot be used for gift card purchases.<br>• If you return or cancel an order, points earned from that purchase will be deducted proportionally. Points used on redeemed orders will not be refunded upon return.<br>• Minimum 250 points required to redeem. Points expire 90 days after issuance.<br>• Points may be redeemed for discount or select Breescape products<br><br>*Breescape reserves the right to modify, suspend or terminate this rewards program, adjust point values or revoke points without prior notice. Rewards are subject to verification.' },
    { text: 'Give your friends 200 points, and get 500 points for each successful referral.', html: 'Referred new customer must place a qualifying first order of $100+. Referrer earns 500 points. Referred friend earns 100 points, which CANNOT be redeemed on their first order and only valid for future purchases. Max 2 successful referrals per month, 10 total per customer.' }
  ];
  function addTips() {
    var nodes = document.querySelectorAll('.yotpo-widget-loyalty-page p, .yotpo-widget-loyalty-page span, .yotpo-widget-loyalty-page div, body p, body span, body div');
    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i]; if (node.dataset.bzInfoTip === 'true') continue;
      var match = TARGETS.find(function (t) { return node.textContent.trim() === t.text; }); if (!match) continue;
      node.dataset.bzInfoTip = 'true'; var wrap = document.createElement('span'); wrap.className = 'bz-reward-info-tip'; wrap.innerHTML = '<button type="button" class="bz-reward-info-tip__button" aria-label="More info" aria-expanded="false"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="7"/><line x1="8" y1="7" x2="8" y2="11.5"/><circle cx="8" cy="4.8" r="0.55" fill="currentColor" stroke="none"/></svg></button><span class="bz-reward-info-tip__bubble" role="tooltip" hidden><button type="button" class="bz-reward-info-tip__close" aria-label="Close">×</button><span class="bz-reward-info-tip__text">' + match.html + '</span></span></span>'; node.appendChild(document.createTextNode(' ')); node.appendChild(wrap);
    }
  }
  function position(button, bubble) {
    if (!button || !bubble || bubble.hasAttribute('hidden')) return;
    var vw = document.documentElement.clientWidth, vh = window.innerHeight, gap = 12, offset = 14;
    var width = Math.min(vw - gap * 2, vw * (vw < 768 ? 0.6 : 0.5));
    var r = button.getBoundingClientRect(), cx = r.left + r.width / 2;
    var left = Math.max(gap, Math.min(vw - gap - width, cx - width / 2));
    var spaceBelow = vh - r.bottom - offset - gap, spaceAbove = r.top - offset - gap;
    var above = spaceBelow < 200 && spaceAbove > spaceBelow;
    var body = document.body, base = getComputedStyle(body).position === 'static' ? { left: -window.scrollX, top: -window.scrollY } : body.getBoundingClientRect();
    var s = bubble.style;
    s.setProperty('position', 'absolute', 'important');
    s.setProperty('left', (left - base.left) + 'px', 'important');
    s.setProperty('right', 'auto', 'important');
    s.setProperty('bottom', 'auto', 'important');
    s.setProperty('transform', 'none', 'important');
    s.setProperty('width', width + 'px', 'important');
    s.setProperty('max-width', width + 'px', 'important');
    s.setProperty('max-height', Math.max(120, Math.min(above ? spaceAbove : spaceBelow, vw < 768 ? Math.min(320, vh * 0.45) : Math.min(420, vh * 0.6))) + 'px', 'important');
    bubble.classList.toggle('is-above', above);
    s.setProperty('top', ((above ? r.top - offset - bubble.offsetHeight : r.bottom + offset) - base.top) + 'px', 'important');
    s.setProperty('--xy-tip-arrow-left', Math.max(14, Math.min(width - 14, cx - left)) + 'px');
  }
  var openTip = null;
  function closeTip() {
    if (!openTip) return;
    var t = openTip; openTip = null;
    t.bubble.setAttribute('hidden', '');
    t.button.setAttribute('aria-expanded', 'false');
    if (t.wrap.isConnected) t.wrap.appendChild(t.bubble); else t.bubble.remove();
  }
  function openTipFor(btn) {
    var wrap = btn.closest('.bz-reward-info-tip'), bubble = wrap.querySelector('.bz-reward-info-tip__bubble');
    if (!bubble) return;
    // Yotpo ancestors use transform/overflow, which offset or clip the bubble; render it from <body>.
    document.body.appendChild(bubble);
    bubble.removeAttribute('hidden');
    btn.setAttribute('aria-expanded', 'true');
    openTip = { wrap: wrap, button: btn, bubble: bubble };
    position(btn, bubble);
  }
  function repositionOpen() { if (!openTip) return; if (!openTip.button.isConnected) { closeTip(); return; } position(openTip.button, openTip.bubble); }
  var rafId = 0;
  function scheduleReposition() { if (!openTip || rafId) return; rafId = requestAnimationFrame(function () { rafId = 0; repositionOpen(); }); }
  window.addEventListener('resize', scheduleReposition);
  window.addEventListener('scroll', function (e) {
    var t = e.target;
    if (!openTip || !t || !t.closest || t === document.documentElement || t === document.body) return;
    if (t.closest('.bz-reward-info-tip__bubble')) return;
    scheduleReposition();
  }, { capture: true, passive: true });
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null; if (!t) return;
    var btn = t.closest('.bz-reward-info-tip__button');
    if (btn) { var same = openTip && openTip.button === btn; closeTip(); if (!same) openTipFor(btn); return; }
    if (t.closest('.bz-reward-info-tip__close')) { closeTip(); return; }
    if (!t.closest('.bz-reward-info-tip__bubble')) closeTip();
  });
  addTips(); new MutationObserver(addTips).observe(document.body,{childList:true,subtree:true});
})();

(function () {
  var TILES = [
    { desc: 'Follow us on Instagram', title: '20 points ($2 value)' },
    { desc: 'Like page on Facebook', title: '20 points ($2 value)' },
    { desc: 'Leave a review', title: '50 points ($5 value)', hover: ['Earn 10 points when you leave a review', 'Earn 50 points when you leave a review'] }
  ];
  function replaceInTree(root, from, to) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.nodeValue && node.nodeValue.indexOf(from) !== -1) node.nodeValue = node.nodeValue.replace(from, to);
      } else {
        ['aria-label', 'title'].forEach(function (attr) {
          var value = node.getAttribute && node.getAttribute(attr);
          if (value && value.indexOf(from) !== -1) node.setAttribute(attr, value.replace(from, to));
        });
      }
    }
  }
  function syncEarnTiles() {
    var titles = document.querySelectorAll('.yotpo-widget-campaign-widget .yotpo-title-text');
    for (var i = 0; i < titles.length; i += 1) {
      var title = titles[i];
      var tile = title.closest('.yotpo-outer-tile') || title.closest('.yotpo-tile');
      if (!tile) continue;
      var desc = tile.querySelector('.yotpo-description-text');
      if (!desc) continue;
      var match = TILES.find(function (item) { return item.desc === desc.textContent.trim(); });
      if (!match) continue;
      if (title.textContent.trim() !== match.title) title.textContent = match.title;
      if (match.hover) replaceInTree(tile, match.hover[0], match.hover[1]);
    }
    replaceInTree(document.body, 'Earn 10 points when you leave a review', 'Earn 50 points when you leave a review');
  }
  syncEarnTiles();
  new MutationObserver(syncEarnTiles).observe(document.body, { childList: true, subtree: true, characterData: true });
  document.addEventListener('mouseover', function (event) {
    var tile = event.target.closest && event.target.closest('.yotpo-widget-campaign-widget');
    if (tile) syncEarnTiles();
  });
})();
