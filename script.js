const heroImages = [
  "assets/slider1.jpg",
  "assets/slider2.png",
  "assets/slider3.png"
];

const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateSoftSwap(element, distance = "8px") {
  if (!element || prefersReducedMotion || typeof element.animate !== "function") return;

  element.animate(
    [
      { opacity: 0.35, transform: `translateY(${distance}) scale(0.992)` },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ],
    { duration: 340, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
  );
}

menuToggle?.addEventListener("click", () => {
  nav.classList.toggle("is-open");
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
  }
});

const heroImage = document.querySelector("[data-hero-image]");
const heroDots = document.querySelector("[data-hero-dots]");
let heroIndex = 0;
let heroTimer;

function renderHero() {
  if (!heroImage || !heroDots) return;

  heroImage.src = heroImages[heroIndex];
  animateSoftSwap(heroImage, "0");
  [...heroDots.children].forEach((dot, index) => {
    dot.classList.toggle("is-active", index === heroIndex);
  });
}

heroImages.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Show hero image ${index + 1}`);
  dot.addEventListener("click", () => {
    heroIndex = index;
    renderHero();
    restartHeroAutoplay();
  });
  heroDots?.append(dot);
});

document.querySelector("[data-hero-prev]")?.addEventListener("click", () => {
  heroIndex = (heroIndex - 1 + heroImages.length) % heroImages.length;
  renderHero();
  restartHeroAutoplay();
});

document.querySelector("[data-hero-next]")?.addEventListener("click", () => {
  heroIndex = (heroIndex + 1) % heroImages.length;
  renderHero();
  restartHeroAutoplay();
});

renderHero();

function restartHeroAutoplay() {
  if (!heroImage || !heroDots || heroImages.length < 2) return;

  window.clearInterval(heroTimer);
  heroTimer = window.setInterval(() => {
    heroIndex = (heroIndex + 1) % heroImages.length;
    renderHero();
  }, 15000);
}

restartHeroAutoplay();

const detailMain = document.querySelector("[data-detail-main]");
const detailThumbs = document.querySelector("[data-detail-thumbs]");
const detailImages = detailThumbs
  ? [...detailThumbs.querySelectorAll("[data-detail-thumb]")].map((thumb, index) => {
      const image = thumb.querySelector("img");
      return {
        src: image?.getAttribute("src") || "",
        alt: thumb.dataset.detailAlt || image?.alt || `Project image ${index + 1}`
      };
    })
  : [];
let detailIndex = 0;

function renderDetail() {
  const image = detailImages[detailIndex];
  if (!image || !detailMain || !detailThumbs) return;

  detailMain.src = image.src;
  detailMain.alt = image.alt;
  animateSoftSwap(detailMain, "10px");

  detailThumbs.querySelectorAll("[data-detail-thumb]").forEach((thumb, index) => {
    thumb.classList.toggle("is-active", index === detailIndex);
  });
}

detailThumbs?.querySelectorAll("[data-detail-thumb]").forEach((thumb) => {
  thumb.addEventListener("click", () => {
    detailIndex = Number(thumb.dataset.detailThumb);
    renderDetail();
  });
});

document.querySelectorAll("[data-detail-prev]").forEach((button) => {
  button.addEventListener("click", () => {
    detailIndex = (detailIndex - 1 + detailImages.length) % detailImages.length;
    renderDetail();
  });
});

document.querySelectorAll("[data-detail-next]").forEach((button) => {
  button.addEventListener("click", () => {
    detailIndex = (detailIndex + 1) % detailImages.length;
    renderDetail();
  });
});

renderDetail();

const revealItems = document.querySelectorAll(
  ".section-pad, .service-hero, .pricing-card, .price-calculator, .before-after, .portfolio-grid > *, .project-gallery, .contact-hero, .contact-item, .contact-feedback, .site-footer"
);

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  revealItems.forEach((item, index) => {
    item.classList.add("reveal-on-scroll");
    item.style.transitionDelay = `${Math.min((index % 7) * 55, 330)}ms`;
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        window.setTimeout(() => {
          entry.target.style.transitionDelay = "";
        }, 850);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll("[data-before-after]").forEach((comparison) => {
  const range = comparison.querySelector("[data-compare-range]");

  function updateComparison() {
    comparison.style.setProperty("--compare-position", `${range?.value || 50}%`);
  }

  range?.addEventListener("input", updateComparison);
  updateComparison();
});

const orderDialog = document.querySelector("[data-order-dialog]");
const orderMessage = document.querySelector("[data-order-message]");
const priceCalculator = document.querySelector("[data-price-calculator]");
let calculatorMessage = "";

function setOrderMessage(message) {
  if (orderMessage && message) {
    orderMessage.value = message;
  }
}

if (priceCalculator) {
  const areaInput = priceCalculator.querySelector("[data-calc-area]");
  const packageButtons = priceCalculator.querySelectorAll("[data-calc-package]");
  const totalOutput = priceCalculator.querySelector("[data-calc-total]");
  const rateOutput = priceCalculator.querySelector("[data-calc-rate-output]");
  const summaryOutput = priceCalculator.querySelector("[data-calc-summary]");
  const formatter = new Intl.NumberFormat("en-US");

  function animateTotal() {
    if (!totalOutput || prefersReducedMotion) return;

    totalOutput.classList.remove("is-updating");
    window.requestAnimationFrame(() => {
      totalOutput.classList.add("is-updating");
      window.setTimeout(() => totalOutput.classList.remove("is-updating"), 180);
    });
  }

  function getActivePackage() {
    return priceCalculator.querySelector("[data-calc-package].is-active") || packageButtons[0];
  }

  function renderCalculator() {
    const activePackage = getActivePackage();
    const area = Math.max(0, Number(areaInput?.value) || 0);
    const packageName = activePackage?.dataset.calcPackage || "Basic";
    const rate = Number(activePackage?.dataset.calcRate) || 0;
    const total = area * rate;

    if (rateOutput) {
      rateOutput.textContent = `${formatter.format(rate)} AMD/m²`;
    }

    if (totalOutput) {
      totalOutput.textContent = area > 0 ? `${formatter.format(total)} AMD` : "Enter area";
      animateTotal();
    }

    calculatorMessage = area > 0
      ? `${packageName} package for ${area} m². Estimated total: ${formatter.format(total)} AMD.`
      : `${packageName} package. Area is not specified yet.`;

    if (summaryOutput) {
      summaryOutput.textContent = area > 0 ? `${packageName} package for ${area} m²` : "Enter project area";
    }
  }

  packageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      packageButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderCalculator();
    });
  });

  areaInput?.addEventListener("input", renderCalculator);
  priceCalculator.querySelector("[data-calc-order]")?.addEventListener("click", () => {
    renderCalculator();
    setOrderMessage(calculatorMessage);
  });

  renderCalculator();
}

document.querySelectorAll("[data-open-order]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.orderPackage) {
      setOrderMessage(`${button.dataset.orderPackage} package.`);
    }

    if (orderDialog && typeof orderDialog.showModal === "function") {
      orderDialog.showModal();
    }
  });
});

document.querySelector("[data-close-order]")?.addEventListener("click", () => {
  orderDialog?.close();
});

orderDialog?.addEventListener("click", (event) => {
  if (event.target === orderDialog) {
    orderDialog.close();
  }
});

orderDialog?.querySelector(".order-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  orderDialog.close();
});

document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector("[data-form-status]");
  if (status) {
    status.textContent = "Your message is ready to send.";
  }
  event.currentTarget.reset();
});

document.querySelector("[data-order-page-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = document.querySelector("[data-order-page-status]");
  if (status) {
    status.textContent = "Your request is ready to send.";
  }
  event.currentTarget.reset();
});
