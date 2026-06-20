(function() {
    var navButton = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (navButton && nav) {
        navButton.addEventListener("click", function() {
            nav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1 && dots.length) {
        var current = 0;
        var show = function(index) {
            current = index;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        };
        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                show(i);
            });
        });
        setInterval(function() {
            show((current + 1) % slides.length);
        }, 5200);
    }

    var input = document.querySelector("[data-filter-input]");
    var year = document.querySelector("[data-year-filter]");
    var type = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var applyFilter = function() {
        if (!cards.length) {
            return;
        }
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        var shown = 0;
        cards.forEach(function(card) {
            var text = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();
            var okText = !q || text.indexOf(q) !== -1;
            var okYear = !y || card.getAttribute("data-year") === y;
            var okType = !t || card.getAttribute("data-type") === t;
            var visible = okText && okYear && okType;
            card.style.display = visible ? "" : "none";
            if (visible) {
                shown += 1;
            }
        });
        document.body.classList.toggle("has-empty", shown === 0);
    };
    [input, year, type].forEach(function(el) {
        if (el) {
            el.addEventListener("input", applyFilter);
            el.addEventListener("change", applyFilter);
        }
    });

    var loadLibrary = function(done) {
        if (window.Hls) {
            done();
            return;
        }
        var existing = document.querySelector("script[data-hls-loader]");
        if (existing) {
            existing.addEventListener("load", done);
            return;
        }
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.async = true;
        script.setAttribute("data-hls-loader", "true");
        script.addEventListener("load", done);
        document.head.appendChild(script);
    };

    var setupPlayer = function(shell) {
        var video = shell.querySelector("[data-video]");
        var button = shell.querySelector("[data-play-button]");
        if (!video || !button) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var started = false;
        var begin = function() {
            if (!stream) {
                return;
            }
            var playVideo = function() {
                video.play().then(function() {
                    shell.classList.add("is-playing");
                }).catch(function() {
                    shell.classList.add("is-playing");
                });
            };
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                return;
            }
            loadLibrary(function() {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                } else {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    video.load();
                }
            });
        };
        button.addEventListener("click", begin);
        video.addEventListener("click", begin);
        video.addEventListener("play", function() {
            shell.classList.add("is-playing");
        });
    };

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
})();
