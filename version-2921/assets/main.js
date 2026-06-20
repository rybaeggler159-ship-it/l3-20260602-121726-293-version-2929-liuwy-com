(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var clearSearch = document.querySelector('[data-clear-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function filterCards() {
    if (!searchInput) {
      return;
    }

    var keyword = searchInput.value.trim().toLowerCase();

    cards.forEach(function (card) {
      var content = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();

      card.classList.toggle('is-hidden', keyword !== '' && content.indexOf(keyword) === -1);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (clearSearch && searchInput) {
    clearSearch.addEventListener('click', function () {
      searchInput.value = '';
      filterCards();
      searchInput.focus();
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var source = player.getAttribute('data-source');

    function playVideo() {
      if (!video || !source) {
        return;
      }

      if (button) {
        button.classList.add('hidden');
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (video.hlsInstance) {
          video.hlsInstance.destroy();
        }

        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        video.hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  });
}());
