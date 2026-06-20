(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var input = panel.querySelector('[data-filter-input]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var reset = panel.querySelector('[data-filter-reset]');
      var grids = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-grid]'));
      if (!grids.length) {
        scope = document;
        grids = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-grid]'));
      }
      var empty = scope.querySelector('[data-filter-empty]');

      function apply() {
        var query = normalize(input && input.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var visible = 0;
        grids.forEach(function (grid) {
          var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
          cards.forEach(function (card) {
            var haystack = normalize([
              card.dataset.title,
              card.dataset.region,
              card.dataset.type,
              card.dataset.year,
              card.dataset.genre,
              card.dataset.tags
            ].join(' '));
            var matchQuery = !query || haystack.indexOf(query) !== -1;
            var matchYear = !year || normalize(card.dataset.year).indexOf(year) !== -1;
            var matchType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
            var shouldShow = matchQuery && matchYear && matchType;
            card.hidden = !shouldShow;
            if (shouldShow) {
              visible += 1;
            }
          });
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', apply);
      }
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          apply();
        });
      }
      apply();
    });
  }

  function initPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video[data-src]');
    var button = player.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute('data-src');
    var hls = null;
    var loaded = false;
    var pendingPlay = false;

    function markReady() {
      player.classList.remove('is-loading');
      if (pendingPlay) {
        pendingPlay = false;
        video.play().catch(function () {});
      }
    }

    function recoverHls(event, data) {
      if (!hls || !data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        player.classList.remove('is-loading');
      }
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      player.classList.add('is-loading');
      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, markReady);
        hls.on(Hls.Events.ERROR, recoverHls);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', markReady, { once: true });
      } else {
        video.src = source;
        video.addEventListener('loadeddata', markReady, { once: true });
        window.setTimeout(markReady, 1200);
      }
    }

    function startPlayback() {
      button.classList.add('is-hidden');
      player.classList.add('is-playing');
      pendingPlay = true;
      loadSource();
      if (video.readyState > 0) {
        pendingPlay = false;
        video.play().catch(function () {});
      }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });
    video.addEventListener('click', function () {
      if (!loaded) {
        startPlayback();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
  });
})();
