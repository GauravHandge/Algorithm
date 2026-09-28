/* Toast Notification Helper */
export function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  const bg = type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#6366f1";
  toast.style.cssText = `background:${bg}; color:#fff; padding:10px 18px; border-radius:8px; font-weight:600; font-size:0.9rem; box-shadow:0 4px 14px rgba(0,0,0,0.4); opacity:0; transform:translateY(10px); transition:all 0.25s ease;`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 10);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}
