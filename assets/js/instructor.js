/*=============================================
=        Instructor Page - Lightbox JS         =
=============================================*/
(function () {
  "use strict";

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");

  if (!lightbox || !lightboxImg || !closeBtn) {
    return;
  }

  function openLightbox(src, alt) {
    lightboxImg.setAttribute("src", src);
    lightboxImg.setAttribute("alt", alt || "");
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightboxImg.setAttribute("src", "");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gallery__item").forEach(function (item) {
    item.addEventListener("click", function () {
      const img = item.querySelector("img");
      if (img) {
        openLightbox(img.getAttribute("src"), img.getAttribute("alt"));
      }
    });
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });
})();
