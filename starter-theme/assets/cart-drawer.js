const cartDrawer = document.getElementById("cartDrawer");

const cartOverlay = document.getElementById("cartOverlay");

const cartDrawerClose = document.getElementById("cartDrawerClose");

const cartDrawerContent = document.getElementById("cartDrawerContent");

/* =========================
   OPEN DRAWER
========================= */

window.openCartDrawer = function () {
  if (!cartDrawer) return;

  cartDrawer.classList.add("active");

  if (cartOverlay) {
    cartOverlay.classList.add("active");
  }

  cartDrawer.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
};

/* =========================
   CLOSE DRAWER
========================= */

window.closeCartDrawer = function () {
  if (!cartDrawer) return;

  cartDrawer.classList.remove("active");

  if (cartOverlay) {
    cartOverlay.classList.remove("active");
  }

  cartDrawer.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";
};

/* CLOSE BUTTON */

if (cartDrawerClose) {
  cartDrawerClose.addEventListener("click", function () {
    window.closeCartDrawer();
  });
}

/* OVERLAY */

if (cartOverlay) {
  cartOverlay.addEventListener("click", function () {
    window.closeCartDrawer();
  });
}

/* ESC */

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    window.closeCartDrawer();
  }
});

/* =========================
   UPDATE DRAWER
========================= */

window.updateCartDrawer = function (cart) {
  if (!cartDrawerContent) return;

  renderCartDrawer(cart);
};

/* =========================
   RENDER CART
========================= */

function renderCartDrawer(cart) {
  if (!cartDrawerContent) return;

  if (!cart.items || cart.items.length === 0) {
    cartDrawerContent.innerHTML = `

      <div class="cart-empty">

        <div class="cart-empty__icon">
          🛒
        </div>

        <h3>
          Your cart is empty
        </h3>

        <p>
          Add some products to your cart.
        </p>

        <a
          href="/collections/all"
          class="cart-empty__button"
        >
          Continue Shopping
        </a>

      </div>

    `;

    return;
  }

  let itemsHTML = "";

  cart.items.forEach(function (item, index) {
    const line = index + 1;

    const image = item.image
      ? `
        <img
          src="${escapeHTML(item.image)}"
          alt="${escapeHTML(item.product_title)}"
          width="90"
          height="90"
          loading="lazy"
        >
      `
      : "";

    const variant =
      item.variant_title && item.variant_title !== "Default Title"
        ? `
        <p class="cart-item__variant">
          ${escapeHTML(item.variant_title)}
        </p>
      `
        : "";

    itemsHTML += `

      <div
        class="cart-item"
        data-line="${line}"
      >

        <a
          href="${escapeHTML(item.url)}"
          class="cart-item__image"
        >

          ${image}

        </a>


        <div class="cart-item__details">

          <a
            href="${escapeHTML(item.url)}"
            class="cart-item__title"
          >
            ${escapeHTML(item.product_title)}
          </a>


          ${variant}


          <div class="cart-item__price">

            ${formatMoney(item.final_line_price)}

          </div>


          <div class="cart-item__bottom">

            <div class="cart-quantity">

              <button
                type="button"
                class="cart-quantity__button"
                onclick="updateCartQuantity(
                  ${line},
                  ${item.quantity - 1}
                )"
              >
                −
              </button>


              <span class="cart-quantity__value">
                ${item.quantity}
              </span>


              <button
                type="button"
                class="cart-quantity__button"
                onclick="updateCartQuantity(
                  ${line},
                  ${item.quantity + 1}
                )"
              >
                +
              </button>

            </div>


            <button
              type="button"
              class="cart-item__remove"
              onclick="removeCartItem(${line})"
            >
              Remove
            </button>

          </div>

        </div>

      </div>

    `;
  });

  cartDrawerContent.innerHTML = `

    <div class="cart-items">

      ${itemsHTML}

    </div>


    <div class="cart-drawer__footer">

      <div class="cart-subtotal">

        <span>
          Subtotal
        </span>

        <strong>
          ${formatMoney(cart.total_price)}
        </strong>

      </div>


      <a
        href="/cart"
        class="cart-view-button"
      >
        View Cart
      </a>


      <a
        href="/checkout"
        class="cart-checkout-button"
      >
        Checkout
      </a>

    </div>

  `;
}

/* =========================
   CHANGE QUANTITY
========================= */

window.updateCartQuantity = async function (line, quantity) {
  try {
    if (quantity < 0) {
      quantity = 0;
    }

    const response = await fetch("/cart/change.js", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Accept: "application/json",
      },

      body: JSON.stringify({
        line: line,

        quantity: quantity,
      }),
    });

    const cart = await response.json();

    if (!response.ok) {
      throw new Error(cart.description || "Unable to update cart.");
    }

    window.updateCartDrawer(cart);
  } catch (error) {
    console.error("Cart update error:", error);

    alert(error.message || "Unable to update cart.");
  }
};

/* =========================
   REMOVE
========================= */

window.removeCartItem = async function (line) {
  await window.updateCartQuantity(line, 0);
};

/* =========================
   MONEY
========================= */

function formatMoney(cents) {
  const currency = cartDrawer?.dataset.currency || "USD";

  try {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: currency,
    }).format(cents / 100);
  } catch (error) {
    return (cents / 100).toFixed(2);
  }
}

/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}
