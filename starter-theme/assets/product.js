document.addEventListener("DOMContentLoaded", function () {
  /* =========================
     QUANTITY
  ========================= */

  const quantityInput = document.getElementById("Quantity");

  const quantityButtons = document.querySelectorAll("[data-quantity-action]");

  quantityButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (!quantityInput) return;

      let quantity = parseInt(quantityInput.value) || 1;

      const action = button.dataset.quantityAction;

      if (action === "increase") {
        quantity++;
      }

      if (action === "decrease") {
        if (quantity > 1) {
          quantity--;
        }
      }

      quantityInput.value = quantity;
    });
  });

  /* =========================
     PRODUCT FORM
  ========================= */

  const productForm = document.getElementById("product-form");

  if (!productForm) return;

  productForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const button = productForm.querySelector(".product-form__button");

    const variantInput = productForm.querySelector('[name="id"]');

    const quantityInput = productForm.querySelector('[name="quantity"]');

    if (!variantInput) {
      console.error("Variant ID not found.");
      return;
    }

    const variantId = variantInput.value;

    let quantity = 1;

    if (quantityInput) {
      quantity = parseInt(quantityInput.value) || 1;
    }

    const originalText = button.innerText;

    button.disabled = true;
    button.innerText = "Adding...";

    try {
      /* ADD TO CART */

      const response = await fetch("/cart/add.js", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          items: [
            {
              id: Number(variantId),
              quantity: quantity,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.description || data.message || "Unable to add product.",
        );
      }

      /* GET UPDATED CART */

      const cartResponse = await fetch("/cart.js", {
        headers: {
          Accept: "application/json",
        },
      });

      const cart = await cartResponse.json();

      /* UPDATE DRAWER */

      if (typeof window.updateCartDrawer === "function") {
        window.updateCartDrawer(cart);
      }

      /* OPEN DRAWER */

      if (typeof window.openCartDrawer === "function") {
        window.openCartDrawer();
      }
    } catch (error) {
      console.error("Add to cart error:", error);

      alert(error.message || "Something went wrong.");
    } finally {
      button.disabled = false;
      button.innerText = originalText;
    }
  });

  /* =========================
     PRODUCT IMAGE
  ========================= */

  const thumbnails = document.querySelectorAll(".product-gallery__thumbnail");

  const mainImage = document.getElementById("ProductMainImage");

  thumbnails.forEach(function (thumbnail) {
    thumbnail.addEventListener("click", function () {
      if (!mainImage) return;

      const imageUrl = thumbnail.dataset.image;

      if (imageUrl) {
        mainImage.src = imageUrl;
      }
    });
  });
});
