import { AppInsights } from 'applicationinsights-js';
import {
  setupPageTracking,
  trackEventMethod,
  trackException,
  setUserContextMethod,
  clearUserContextMethod,
  dependencyMethod,
} from './utils';
import trackEventDirective from './directives';

function install(Vue, options) {
  // --------------------------------------------------- installation
  const { id, trackingConfiguration, applicationName } = options;
  Vue.trackingConfiguration = trackingConfiguration;
  // #todo: try not to pollute global vue object
  if (options.appInsights) {
    Vue.appInsights = options.appInsights;
  } else {
    Vue.appInsights = AppInsights;
    Vue.appInsights.downloadAndSetup({ instrumentationKey: id });
  }

  // ---------------------------------------------------- router watch
  const { router, axios } = options;

  if (axios) {
    axios.interceptors.response.use(
      (config) => config,
      (error) => {
        dependencyMethod(error?.response);
      }
    );
  }

  // Watch route event if router option is defined.
  if (router) {
    if (options.trackInitialPageView !== false) {
      setupPageTracking(applicationName, router);
    } else {
      router.onReady(() => setupPageTracking(applicationName, router));
    }
  }

  // -------------------------------------------------- track exceptions
  Vue.config.errorHandler = (error) => {
    trackException(error);
  };

  Vue.directive(trackEventDirective.name, trackEventDirective);
  Vue.prototype.$meter = {
    trackEvent: (payload) => trackEventMethod(payload, trackingConfiguration),
    setUserContext: (payload) => setUserContextMethod(payload),
    clearUserContext: () => clearUserContextMethod(),
  };

  // Enable only if we ever wanted to expose all app insight methods

  // Object.defineProperty(Vue.prototype, '$meter', {
  //   get: () => Vue.appInsights
  // });
}
/**
 * Track route changes as page views with AppInsights
 * @param options
 */

// auto install for navigator
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(install);
}
export default install;
