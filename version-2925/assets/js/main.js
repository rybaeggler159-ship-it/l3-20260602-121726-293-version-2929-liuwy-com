(function () {
  const mobileButton = document.querySelector('.mobile-menu-button');
  const mobileNav = document.querySelector('.mobile-nav');
  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const menuButton = document.querySelector('.nav-menu-button');
  const navMenu = document.querySelector('.nav-menu');
  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const prev = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');
  let current = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  function startTimer() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      startTimer();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      startTimer();
    });
  }

  showSlide(0);
  startTimer();

  const panel = document.querySelector('.search-panel');
  const forms = Array.from(document.querySelectorAll('.site-search'));

  function renderSearch(query) {
    if (!panel) {
      return;
    }
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      panel.classList.remove('open');
      panel.innerHTML = '';
      return;
    }
    const results = (window.SEARCH_INDEX || SEARCH_INDEX || [])
      .filter(function (item) {
        return [item.title, item.year, item.category].concat(item.tags || []).join(' ').toLowerCase().includes(keyword);
      })
      .slice(0, 12);
    if (!results.length) {
      panel.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
      panel.classList.add('open');
      return;
    }
    panel.innerHTML = results.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.category) + '</span></span>' +
        '</a>';
    }).join('');
    panel.classList.add('open');
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  forms.forEach(function (form) {
    const input = form.querySelector('input[type="search"]');
    if (!input) {
      return;
    }
    input.addEventListener('input', function () {
      renderSearch(input.value);
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearch(input.value);
    });
  });

  document.addEventListener('click', function (event) {
    if (!panel) {
      return;
    }
    const clickedSearch = event.target.closest('.site-search') || event.target.closest('.search-panel');
    if (!clickedSearch) {
      panel.classList.remove('open');
    }
  });
})();
