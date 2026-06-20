(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    show(0);
    start();
  });

  document.querySelectorAll('[data-search-panel]').forEach(function (panel) {
    var target = document.querySelector(panel.getAttribute('data-target'));
    if (!target) {
      return;
    }

    var queryInput = panel.querySelector('.movie-query');
    var regionSelect = panel.querySelector('.movie-region');
    var typeSelect = panel.querySelector('.movie-type');
    var yearSelect = panel.querySelector('.movie-year');
    var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));
    var empty = panel.parentElement ? panel.parentElement.querySelector('[data-empty-state]') : null;

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function update() {
      var query = normalize(queryInput && queryInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener('input', update);
        field.addEventListener('change', update);
      }
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var message = shell.querySelector('.player-message');
    var stream = shell.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function attach() {
      if (!video || !stream || ready) {
        return;
      }

      ready = true;
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        setMessage('播放暂不可用');
        ready = false;
        return;
      }
    }

    function play() {
      attach();
      if (!ready || !video) {
        return;
      }

      shell.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          play();
        }
      });
      video.addEventListener('playing', function () {
        shell.classList.add('is-playing');
        setMessage('');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('is-playing');
        }
      });
      video.addEventListener('error', function () {
        setMessage('播放暂不可用');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
