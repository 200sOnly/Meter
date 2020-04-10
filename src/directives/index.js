import Vue from "vue";
import { trackEvent } from "../utils";

export default Vue.directive("m-track-event", (el, binding) => {
  // Below code formats data in consumable format for ms-appInsights
  const data = { ...binding.value };
  if ("value" in data) {
    data.value =
      (typeof data.value !== "object"
        ? data.value
        : JSON.stringify(data.value)) || "";
  }
  delete data.name;
  switch (data.trigger) {
    case "click":
      el.onclick = () => {
        trackEvent(binding.value.name, data, Vue.trackingConfiguration);
      };
      break;
    case "hover":
      el.onmouseleave = () => {
        trackEvent(binding.value.name, data, Vue.trackingConfiguration);
      };
      break;
    case "scroll":
      el.onscroll = () => {
        // horizontal scrolling. When user scrolls more than 50%
        if (el.scrollLeft / el.clientWidth > 0.5) {
          trackEvent(binding.value.name, data, Vue.trackingConfiguration);
        }
      };
      break;
    case "change":
      el.onchange = () => {
        trackEvent(binding.value.name, data, Vue.trackingConfiguration);
      };
      break;
    default:
  }
});
