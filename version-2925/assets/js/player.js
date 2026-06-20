function setupMoviePlayer(options) {
  const video = document.getElementById(options.videoId);
  const button = document.getElementById(options.buttonId);
  const cover = document.getElementById(options.coverId);
  let hls = null;
  let loaded = false;

  if (!video || !button || !cover) {
    return;
  }

  function attach() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(options.url);
      hls.attachMedia(video);
    } else {
      video.src = options.url;
    }
  }

  function start() {
    attach();
    cover.classList.add('is-hidden');
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener('click', function (event) {
    event.stopPropagation();
    start();
  });

  cover.addEventListener('click', function () {
    start();
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    cover.classList.add('is-hidden');
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
