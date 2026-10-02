// Public builds are permanently isolated from real services.
export const isPublicDemo = import.meta.env.VITE_PUBLIC_DEMO === "true";
export const isPreview = isPublicDemo || (
  import.meta.env.DEV && new URLSearchParams(location.search).get("preview") === "1"
);
if (isPublicDemo && (!location.hash || location.hash === "#")) {
  history.replaceState(null, "", `${location.pathname}${location.search}#/display?mode=demo`);
}
export const isDisplayLocation = () => /^#\/display(?:[/?]|$)/.test(location.hash);
export const isDemoLocation = () => isPublicDemo || (
  isDisplayLocation() && new URLSearchParams(location.hash.split("?")[1] || "").get("mode") === "demo"
);
