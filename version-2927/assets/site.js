(() => {
  const header = document.querySelector('[data-header]');

  if (header) {
    const setHeaderShadow = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 16);
    };

    setHeaderShadow();
    window.addEventListener('scroll', setHeaderShadow, { passive: true });
  }

  const menuButton = document.querySelector('[data-mobile-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const showSlide = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        showSlide(Number(dot.dataset.heroDot || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(() => {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const searchInput = document.querySelector('[data-search-input]');
  const yearFilter = document.querySelector('[data-year-filter]');
  const genreFilter = document.querySelector('[data-genre-filter]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const emptyState = document.querySelector('[data-empty-state]');

  const applyFilters = () => {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const year = yearFilter ? yearFilter.value : '';
    const genre = genreFilter ? genreFilter.value.toLowerCase() : '';
    let visibleCount = 0;

    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const cardYear = card.dataset.year || '';
      const cardGenre = (card.dataset.genre || '').toLowerCase();
      const matchesKeyword = !keyword || text.includes(keyword);
      const matchesYear = !year || cardYear === year;
      const matchesGenre = !genre || cardGenre.includes(genre);
      const visible = matchesKeyword && matchesYear && matchesGenre;

      card.style.display = visible ? '' : 'none';
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visibleCount === 0 && cards.length > 0);
    }
  };

  [searchInput, yearFilter, genreFilter].forEach((control) => {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-player-start]');
    const status = player.querySelector('[data-player-status]');
    const src = player.dataset.videoSrc;
    let initialized = false;
    let hlsInstance = null;

    const setStatus = (message) => {
      if (status) {
        status.textContent = message;
      }
    };

    const initializePlayer = () => {
      if (initialized || !video || !src) {
        return;
      }

      initialized = true;
      video.controls = true;
      setStatus('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
          setStatus('播放源加载完成');
          video.play().catch(() => {
            setStatus('点击视频继续播放');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络加载异常，正在重试');
            hlsInstance.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('媒体解析异常，正在恢复');
            hlsInstance.recoverMediaError();
            return;
          }

          setStatus('当前浏览器无法播放该视频源');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', () => {
          setStatus('播放源加载完成');
          video.play().catch(() => {
            setStatus('点击视频继续播放');
          });
        });
      } else {
        setStatus('当前浏览器不支持 HLS 播放');
      }
    };

    if (button) {
      button.addEventListener('click', () => {
        initializePlayer();
      });
    }

    if (video) {
      video.addEventListener('click', () => {
        initializePlayer();
      });
      video.addEventListener('play', () => {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', () => {
        if (video.currentTime === 0) {
          player.classList.remove('is-playing');
        }
      });
    }

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
