document.addEventListener('DOMContentLoaded', function () {

  // ---- Mobile nav toggle ----
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('mobile-nav');
      nav.classList.toggle('open');
    });
  }

  // ---- Sticky header: just a class toggle, CSS only touches box-shadow/opacity (cheap) ----
  var header = document.querySelector('.site-header');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          header.classList.toggle('scrolled', window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Scroll-reveal for elements with class "reveal" ----
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  // ---- Featured editorial carousel ----
  var featuredCarousel = document.getElementById('featuredCarousel');

  if (featuredCarousel) {
    var featuredImages = featuredCarousel.querySelectorAll('.featured-slide-image');
    var featuredInfo = featuredCarousel.querySelectorAll('.featured-slide-info');
    var featuredCurrent = document.getElementById('featuredCurrent');
    var featuredProgress = document.getElementById('featuredProgress');
    var featuredPrev = document.getElementById('featuredPrev');
    var featuredNext = document.getElementById('featuredNext');
    var featuredIndex = 0;
    var featuredTotal = featuredImages.length;

    var showFeatured = function (index) {
      if (featuredTotal === 0) return;

      featuredIndex = (index + featuredTotal) % featuredTotal;

      featuredImages.forEach(function (image, i) {
        image.classList.toggle('is-active', i === featuredIndex);
      });

      featuredInfo.forEach(function (info, i) {
        info.classList.toggle('is-active', i === featuredIndex);
      });

      if (featuredCurrent) {
        featuredCurrent.textContent = String(featuredIndex + 1).padStart(2, '0');
      }

      if (featuredProgress) {
        featuredProgress.style.width = ((featuredIndex + 1) / featuredTotal * 100) + '%';
      }
    };

    if (featuredPrev) {
      featuredPrev.addEventListener('click', function () {
        showFeatured(featuredIndex - 1);
      });
    }

    if (featuredNext) {
      featuredNext.addEventListener('click', function () {
        showFeatured(featuredIndex + 1);
      });
    }

    showFeatured(0);
  }

  // --- new arrival

    // ---- New arrivals gallery carousel ----
  var arrivalsCarousel = document.getElementById('arrivalsCarousel');

  if (arrivalsCarousel) {
    var arrivalItems = arrivalsCarousel.querySelectorAll('.new-arrival-item');
    var arrivalsCurrent = document.getElementById('arrivalsCurrent');
    var arrivalsProgress = document.getElementById('arrivalsProgress');
    var arrivalsPrev = document.getElementById('arrivalsPrev');
    var arrivalsNext = document.getElementById('arrivalsNext');
    var arrivalsIndex = 0;
    var arrivalsTotal = arrivalItems.length;

    var showArrival = function (index) {
      if (arrivalsTotal === 0) return;

      arrivalsIndex = (index + arrivalsTotal) % arrivalsTotal;

      var item = arrivalItems[arrivalsIndex];

      if (item) {
        arrivalsCarousel.scrollTo({
          left: item.offsetLeft - arrivalsCarousel.offsetLeft,
          behavior: 'smooth'
        });
      }

      if (arrivalsCurrent) {
        arrivalsCurrent.textContent = String(arrivalsIndex + 1).padStart(2, '0');
      }

      if (arrivalsProgress) {
        arrivalsProgress.style.width = ((arrivalsIndex + 1) / arrivalsTotal * 100) + '%';
      }
    };

    if (arrivalsPrev) {
      arrivalsPrev.addEventListener('click', function () {
        showArrival(arrivalsIndex - 1);
      });
    }

    if (arrivalsNext) {
      arrivalsNext.addEventListener('click', function () {
        showArrival(arrivalsIndex + 1);
      });
    }

    showArrival(0);
  }
  
  // ---- Add to Cart / Quick Add: submit via fetch, no page reload, no scroll jump ----
  // (Buy Now is excluded on purpose — that button should still navigate to checkout.)
  document.querySelectorAll('form').forEach(function (form) {
    var actionField = form.querySelector('input[name="action"]');
    if (!actionField || actionField.value !== 'add') return;
    if (!/cart-action\.php$/.test(form.getAttribute('action') || '')) return;

    form.addEventListener('submit', function (e) {
      if (e.submitter && e.submitter.classList.contains('buy-now-btn')) {
        return; // let this one navigate normally to checkout
      }
      e.preventDefault();

      var submitBtn = e.submitter || form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : null;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Adding...'; }

      var formData = new FormData(form);
      formData.set('ajax', '1');

      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.success) {
            updateCartBadge(data.cart_count);
            showToast('Added to cart');
          } else {
            showToast('Sorry, that item is out of stock');
          }
        })
        .catch(function () {
          showToast('Something went wrong — please try again');
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        });
    });
  });

});

// ---- Update the header cart badge without reloading the page ----
function updateCartBadge(count) {
  var badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? '' : 'none';
}

// ---- Toast helper ----
function showToast(message) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 2200);
}