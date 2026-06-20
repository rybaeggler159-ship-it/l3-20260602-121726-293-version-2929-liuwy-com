(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var links = document.querySelector("[data-mobile-menu]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
        links.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                links.classList.remove("is-open");
            });
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var previous = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === active);
                slide.setAttribute("aria-hidden", position === active ? "false" : "true");
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === active);
                dot.setAttribute("aria-current", position === active ? "true" : "false");
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(active - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                play();
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                play();
            });
        });
        slider.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        slider.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function filterScope(input) {
        var scope = input.closest("[data-filter-scope]") || document;
        var query = normalize(input.value);
        var items = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var empty = scope.querySelector("[data-empty-state]");
        var visible = 0;
        items.forEach(function (item) {
            var haystack = normalize(item.getAttribute("data-search"));
            var matched = !query || haystack.indexOf(query) !== -1;
            item.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                filterScope(input);
            });
        });
        if (location.pathname.endsWith("search.html")) {
            var params = new URLSearchParams(location.search);
            var q = params.get("q") || "";
            inputs.forEach(function (input) {
                input.value = q;
                filterScope(input);
            });
        }
    }

    function initPlayer(config) {
        var video = document.getElementById(config.videoId);
        var mask = document.getElementById(config.maskId);
        var streamUrl = config.streamUrl;
        var loaded = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (!loaded) {
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 60
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }
        }

        function startPlayback() {
            attachStream();
            video.controls = true;
            if (mask) {
                mask.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (mask) {
                        mask.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (mask) {
            mask.addEventListener("click", startPlayback);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });
        video.addEventListener("ended", function () {
            if (mask) {
                mask.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
    });

    window.MoviePlayer = {
        init: initPlayer
    };
})();
