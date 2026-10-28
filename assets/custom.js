const redirects = {
  "/products/cooling-comforter-blanket": "/products/cooling-comforter",
  "/products/cooling-comforter-bundle": "/products/cooling-comforter",
  "/collections": "/",
  "/products/": "/",
  "/pages/size-guide": "/"
};

const currentPath = window.location.pathname;
const isThemeEditor = (typeof Shopify !== 'undefined' && Shopify.designMode) ||
                      window.location.search.indexOf('preview_theme_id=') !== -1;
if (!isThemeEditor && redirects[currentPath]) {
  window.location.replace(redirects[currentPath]);
}

//Size Guide
function soToggleUnit() {
  const isCm = document.getElementById("so__Size-Switch__input").checked;
  const cells = document.querySelectorAll(".so__value__xy");

  cells.forEach((cell) => {
    cell.textContent = isCm
      ? cell.getAttribute("data-cm")
      : cell.getAttribute("data-inch");
  });
}


//Product Reviews
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.s--button--product--reviews').addEventListener('click', function () {
    const reviewsWidget = document.getElementById('yotpo-reviews-main-widget');
    if (!reviewsWidget) {
      console.error('Element with ID "yotpo-reviews-main-widget" not found.');
      return;
    }
    reviewsWidget.scrollIntoView({ behavior: 'smooth' });
  });
});



//Size
function renderBlock(block, isCM) {
  const btn = block.querySelector(".so__Size-Switch__toggle");
  const cells = block.querySelectorAll(".so__value__xy");
  if (!btn || !cells.length) return;

  btn.setAttribute("aria-checked", String(isCM));
  cells.forEach((cell) => {
    const v = isCM ? cell.getAttribute("data-cm") : cell.getAttribute("data-inch");
    if (v) cell.textContent = v;
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".so__unit-switch .so__Size-Switch__toggle");
  if (!btn) return;

  const block = btn.closest(".so__unit-switch");
  const current = btn.getAttribute("aria-checked") === "true";
  renderBlock(block, !current);
});

document.addEventListener("keydown", (e) => {
  const btn = e.target.closest(".so__unit-switch .so__Size-Switch__toggle");
  if (!btn) return;

  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    btn.click();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".so__unit-switch").forEach((block) => {
    const btn = block.querySelector(".so__Size-Switch__toggle");
    const initIsCM = btn?.getAttribute("aria-checked") === "true";
    renderBlock(block, initIsCM);
  });
});



//product bundle
(function () {
  if (window.__bundlePriceUpdaterInitialized) return;
  window.__bundlePriceUpdaterInitialized = true;

  document.addEventListener('change', function (event) {
    var select = event.target.closest('.bundle-variant-select');
    if (!select) return;

    var option = select.options[select.selectedIndex];
    if (!option) return;

    var label = select.closest('label.product-bundle__info');
    if (!label) return;

    var checkbox = label.querySelector('input[name="bundles"]');
    var finalPriceEl = label.querySelector('.bundle-final-price');
    var basePriceEl = label.querySelector('.bundle-base-price');
    var basePriceStrike = basePriceEl ? basePriceEl.querySelector('s') : null;
    var image = label.querySelector('.bundle-variant-image');

    var finalPrice = option.dataset.finalPrice || option.dataset.price || '';
    var basePrice = option.dataset.basePrice || '';
    var finalPriceFormatted = option.dataset.finalPriceFormatted || '';
    var basePriceFormatted = option.dataset.basePriceFormatted || '';
    var discountPercent = parseInt(option.dataset.discountPercent || '0', 10);
    var hasDiscount = (parseInt(finalPrice, 10) || 0) < (parseInt(basePrice, 10) || 0);

    if (checkbox) {
      checkbox.value = option.value;
      checkbox.setAttribute('data-price', finalPrice);

      var newId = 'Recommendations-{{ section.id }}-' + option.value;
      checkbox.id = newId;
      label.setAttribute('for', newId);
    }

    if (finalPriceEl) {
      finalPriceEl.textContent = finalPriceFormatted;
    }

    if (basePriceEl && basePriceStrike) {
      if (discountPercent > 0 || hasDiscount) {
        basePriceStrike.textContent = basePriceFormatted;
        basePriceEl.classList.remove('hidden');
      } else {
        basePriceStrike.textContent = '';
        basePriceEl.classList.add('hidden');
      }
    }

    if (image && option.dataset.imgSrc) {
      image.src = option.dataset.imgSrc;
    }

    if (image && option.dataset.imgSrcset) {
      image.srcset = option.dataset.imgSrcset;
    }
  });
})();