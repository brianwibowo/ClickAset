/**
 * Global Loader Utilities
 * Pemicu event loading global untuk efek glassmorphism overlay.
 */

export const showLoading = (message = "Memproses data...") => {
  window.dispatchEvent(
    new CustomEvent("show-global-loading", {
      detail: { message }
    })
  );
};

export const hideLoading = () => {
  window.dispatchEvent(new CustomEvent("hide-global-loading"));
};
