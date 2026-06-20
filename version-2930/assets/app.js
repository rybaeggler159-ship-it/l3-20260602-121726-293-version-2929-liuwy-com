(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var show = function (next) {
        current = (next + slides.length) % slides.length;
        slides.forEach(function (slide, index) {
          slide.classList.toggle("active", index === current);
        });
        dots.forEach(function (dot, index) {
          dot.classList.toggle("active", index === current);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    }

    var input = document.querySelector("[data-search-input]");
    var count = document.querySelector("[data-search-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (input && cards.length) {
      var update = function () {
        var value = input.value.trim().toLowerCase();
        var shown = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || card.textContent.toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          card.hidden = !matched;
          if (matched) {
            shown += 1;
          }
        });
        if (count) {
          count.textContent = shown + " 部";
        }
      };
      input.addEventListener("input", update);
      update();
    }

    var player = document.querySelector("[data-player]");
    if (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-play]");
      var source = player.getAttribute("data-src");
      var bound = false;
      var bind = function () {
        if (!video || !source || bound) {
          return;
        }
        bound = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      };
      var play = function () {
        bind();
        if (cover) {
          cover.style.display = "none";
        }
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {});
        }
      };
      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("play", function () {
        if (cover) {
          cover.style.display = "none";
        }
      });
      video.addEventListener("click", function () {
        bind();
      });
    }
  });
})();
