(function () {
  var menuButton = document.querySelector('.menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupSearch() {
    var searchInput = document.querySelector('.site-search');
    var filterSelect = document.querySelector('.site-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-area .movie-card'));

    if (!cards.length) {
      return;
    }

    function apply() {
      var query = normalize(searchInput ? searchInput.value : '');
      var type = normalize(filterSelect ? filterSelect.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' '));
        var typeValue = normalize(card.getAttribute('data-type') + ' ' + card.getAttribute('data-genre'));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !type || typeValue.indexOf(type) !== -1;
        card.classList.toggle('is-hidden', !(matchQuery && matchType));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', apply);
    }
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('.hero-arrow.prev');
    var next = root.querySelector('.hero-arrow.next');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function autoplay() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        autoplay();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        autoplay();
      });
    }

    if (slides.length > 1) {
      autoplay();
    }
  }

  function startVideo(button) {
    var videoId = button.getAttribute('data-video');
    var stream = button.getAttribute('data-stream');
    var video = document.getElementById(videoId);

    if (!video || !stream) {
      return;
    }

    button.classList.add('hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = stream;
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
      }
      var hls = new window.Hls({ enableWorker: true });
      video._hlsPlayer = hls;
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    if (!video.src) {
      video.src = stream;
    }
    video.play().catch(function () {});
  }

  function setupPlayers() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.play-button'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        startVideo(button);
      });

      var video = document.getElementById(button.getAttribute('data-video'));
      if (video) {
        video.addEventListener('play', function () {
          if (!video.src) {
            startVideo(button);
          } else {
            button.classList.add('hidden');
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupSearch();
    setupHero();
    setupPlayers();
  });
})();
