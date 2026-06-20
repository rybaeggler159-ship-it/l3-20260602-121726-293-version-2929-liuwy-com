(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });

    all('a', menu).forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
      });
    });
  }

  function initCarousel() {
    all('[data-carousel]').forEach(function (carousel) {
      var slides = all('[data-slide]', carousel);
      var dots = all('[data-dot]', carousel);
      var prev = carousel.querySelector('[data-prev]');
      var next = carousel.querySelector('[data-next]');
      var current = 0;
      var timer = null;

      if (!slides.length) {
        return;
      }

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          restart();
        });
      });

      show(0);
      restart();
    });
  }

  function initFilters() {
    all('[data-filter-panel]').forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var scope = panel.parentElement || document;
      var cards = all('[data-card]', scope);
      var empty = scope.querySelector('[data-no-results]');

      function value(control) {
        return control ? control.value.trim().toLowerCase() : '';
      }

      function apply() {
        var query = value(input);
        var regionValue = value(region);
        var typeValue = value(type);
        var yearValue = value(year);
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre
          ].join(' ').toLowerCase();
          var ok = true;

          if (query && text.indexOf(query) === -1) {
            ok = false;
          }

          if (regionValue && (card.dataset.region || '').toLowerCase() !== regionValue) {
            ok = false;
          }

          if (typeValue && (card.dataset.type || '').toLowerCase() !== typeValue) {
            ok = false;
          }

          if (yearValue && (card.dataset.year || '').toLowerCase() !== yearValue) {
            ok = false;
          }

          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  window.setupMoviePlayer = function (videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var started = false;
    var hls = null;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function setMessage(message) {
      var status = overlay.querySelector('[data-player-status]');
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          overlay.classList.remove('is-hidden');
          setMessage('点击画面继续播放');
        });
      }
    }

    function start() {
      if (started) {
        playVideo();
        return;
      }

      started = true;
      overlay.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          hls.destroy();
          overlay.classList.remove('is-hidden');
          setMessage('暂时无法播放，请稍后重试');
        });
        return;
      }

      video.src = sourceUrl;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
        return;
      }

      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initCarousel();
    initFilters();
  });
})();
