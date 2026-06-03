(function () {
  var config = window.LANDING_CONFIG || {};

  var pixelId = config.PIXEL_ID || '787960040834696';
  var lineUrl = config.LINE_URL || 'https://line.me/R/ti/p/@794qnnum';
  var clickDelay = Number(config.CLICK_DELAY_MS || 3000);
  var loadingSeconds = Number(config.LOADING_SECONDS || 3);

  var loadingScreen = document.querySelector('.loading-screen');
  var landingScreen = document.querySelector('.landing-screen');
  var countdownNumber = document.querySelector('[data-countdown-number]');
  var countdownText = document.querySelector('[data-countdown-text]');
  var trackButtons = document.querySelectorAll('[data-track-button]');

  function makeEventId(eventName, buttonName) {
    return eventName + '_' + buttonName + '_' + Date.now();
  }

  function sendPixelEvents(buttonName) {
    if (typeof window.fbq !== 'function') {
      console.warn('[Pixel] fbq 尚未載入，事件沒有送出');
      return false;
    }

    var leadEventId = makeEventId('Lead', buttonName);
    var contactEventId = makeEventId('Contact', buttonName);

    console.log('[Pixel] 準備送出 Lead:', buttonName, leadEventId);

    window.fbq('track', 'Lead', {
      content_name: buttonName,
      content_category: 'landing_page',
      destination: 'official_line',
      line_url: lineUrl
    }, {
      eventID: leadEventId
    });

    console.log('[Pixel] 準備送出 Contact:', buttonName, contactEventId);

    window.fbq('track', 'Contact', {
      content_name: buttonName,
      content_category: 'landing_page',
      destination: 'official_line',
      line_url: lineUrl
    }, {
      eventID: contactEventId
    });

    console.log('[Pixel] Lead + Contact 已呼叫完成:', buttonName);

    return true;
  }

  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();

    var button = event.currentTarget;

    if (!button) {
      console.warn('[Click] 找不到點擊按鈕');
      return;
    }

    if (button.classList.contains('is-sending')) {
      console.warn('[Click] 已送出中，避免重複點擊');
      return;
    }

    var buttonName = button.getAttribute('data-track-name') || 'landing-click';

    button.classList.add('is-sending');

    sendPixelEvents(buttonName);

    console.log('[Redirect] ' + clickDelay + 'ms 後跳轉:', lineUrl);

    setTimeout(function () {
      window.location.href = lineUrl;
    }, clickDelay);
  }

  if (trackButtons.length > 0) {
    console.log('[Track Button] 已找到可追蹤按鈕數量:', trackButtons.length);

    trackButtons.forEach(function (button) {
      button.addEventListener('click', handleClick, false);
    });
  } else {
    console.warn('[Track Button] 找不到 data-track-button，請檢查 HTML');
  }

  var remain = loadingSeconds;

  function updateCountdown() {
    if (countdownNumber) {
      countdownNumber.textContent = remain;
    }

    if (countdownText) {
      countdownText.textContent = '請稍候，系統將於 ' + remain + ' 秒後進入。';
    }
  }

  updateCountdown();

  var timer = setInterval(function () {
    remain -= 1;

    if (remain <= 0) {
      clearInterval(timer);

      if (loadingScreen) {
        loadingScreen.classList.add('is-hidden');
      }

      if (landingScreen) {
        landingScreen.classList.remove('is-hidden');
        landingScreen.setAttribute('aria-hidden', 'false');
      }

      return;
    }

    updateCountdown();
  }, 1000);
})();