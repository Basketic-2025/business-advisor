export function bindTabTriggers() {
  document.querySelectorAll("[data-tab-trigger]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab-trigger");
      const tabButton = document.querySelector(`[data-tab="${targetId}"]`);
      if (tabButton) {
        tabButton.click();
        const tabList = document.querySelector(".tab-list");
        if (tabList) {
          tabList.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
}
