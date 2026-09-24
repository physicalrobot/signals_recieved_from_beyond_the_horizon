(function () {
  'use strict';

  if (window.__ionCommonLoaded) { initPage(); return; }
  window.__ionCommonLoaded = true;

  function menuOpen() {
    var menuList = document.querySelector(".menu-overlay");
    if (menuList) menuList.classList.add("is-open");
  }

  function menuClose() {
    var menuList = document.querySelector(".menu-overlay");
    if (menuList) menuList.classList.remove("is-open");
  }

  function searchOpen() {
    var search = document.querySelector(".search");
    if (!search) return;
    search.classList.add("is-visible");
    setTimeout(function () {
      var searchInput = document.querySelector(".search__text");
      if (searchInput) searchInput.focus();
    }, 300);
  }

  function searchClose() {
    var search = document.querySelector(".search");
    if (search) search.classList.remove("is-visible");
  }

  /* =======================
  // Menu, Search and Scroll-top: bound once via delegation,
  // since these buttons get replaced by Turbo on every page visit.
  ======================= */
  function bindDelegatedEvents() {
    document.addEventListener("click", function (e) {
      if (e.target.closest(".nav__icon-menu")) menuOpen();
      else if (e.target.closest(".nav__icon-close")) menuClose();
      else if (e.target.closest(".search-button")) searchOpen();
      else if (e.target.closest(".search__close")) searchClose();
      else if (e.target.closest(".top")) {
        if (window.scrollY !== 0) {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") searchClose();
    });

    window.addEventListener("scroll", function () {
      var btnScrollToTop = document.querySelector(".top");
      if (!btnScrollToTop) return;
      window.scrollY > window.innerHeight ? btnScrollToTop.classList.add("is-active") : btnScrollToTop.classList.remove("is-active");
    });
  }

  /* =======================
  // Everything that depends on the current page's content:
  // re-run on every page visit (idempotent / self-guarded).
  ======================= */
  function initPage() {
    var body = document.querySelector("body");

    /* Animation Load Page */
    setTimeout(function () {
      body.classList.add("is-in");
    }, 150);

    /* LazyLoad Images */
    new LazyLoad({
      elements_selector: '.lazy'
    });

    /* Zoom Image */
    var lightense = document.querySelector(".page img, .post img"),
      imageLink = document.querySelectorAll(".page a img, .post a img");

    if (imageLink) {
      for (let i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
      for (let i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
    };

    if (lightense) {
      Lightense(".page img:not(.no-lightense), .post img:not(.no-lightense)", {
        padding: 60,
        offset: 30
      });
    };

    /* Responsive Videos */
    reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off)");

    /* Load More Posts */
    var load_posts_button = document.querySelector('.load-more-posts');
    if (load_posts_button && !load_posts_button.dataset.bound) {
      load_posts_button.dataset.bound = 'true';
      load_posts_button.addEventListener("click", function (e) {
        e.preventDefault();
        var o = document.querySelector(".load-more-section"),
          url = pagination_next_url.split("/page")[0] + "/page/" + pagination_next_page_number + "/";
        fetch(url).then(function (r) { if (r.ok) return r.text(); }).then(function (html) {
          var n = document.createElement("div");
          n.innerHTML = html;
          var t = document.querySelector(".grid"),
            a = n.querySelectorAll(".grid__post");
          for (var i = 0; i < a.length; i++) t.appendChild(a.item(i));
          new LazyLoad({ elements_selector: ".lazy" });
          pagination_next_page_number++;
          if (pagination_next_page_number > pagination_available_pages_number) o.style.display = "none";
        });
      });
    }
  }

  bindDelegatedEvents();
  document.addEventListener("DOMContentLoaded", initPage);
  document.addEventListener("turbo:load", initPage);
})();
