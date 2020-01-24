import { AppInsights } from 'applicationinsights-js';

function setupPageTracking(applicationName, router) {
  const baseName = applicationName || '(Vue App)';

  router.beforeEach((route, from, next) => {
    const name = `${baseName} / ${route.name}`;
    AppInsights.startTrackPage(name);
    next();
  });

  router.afterEach(route => {
    const name = `${baseName} / ${route.name}`;
    const url = `${window.location.protocol}//${window.location.host}${route.fullPath}`;
    AppInsights.stopTrackPage(name, url);
  });
}
// https://github.com/microsoft/ApplicationInsights-JS#sending-telemetry-to-the-azure-portal
// Use this place to customize name and logic if required.

function trackPageView(pageName, pageUrl) {
  try {
    AppInsights.trackPageView(pageName, pageUrl);
  } catch (err) {
    /* eslint-disable no-console  */
    console.error(err);
    /* eslint-enable no-console */
  }
}
function trackEvent(eventName, eventProps, Tracking) {
  if (Tracking[eventName].isEnabled) {
    try {
      AppInsights.trackEvent(Tracking[eventName].name, eventProps);
    } catch (err) {
      /* eslint-disable no-console  */
      console.error(err);
      /* eslint-enable no-console */
    }
  }
}
function trackEventMethod(payload, Tracking) {
  const data = { ...payload };
  if ('value' in data) {
    data.value =
      (typeof data.value !== 'object'
        ? data.value
        : JSON.stringify(data.value)) || '';
  }
  delete data.name;
  if (Tracking[payload?.name].isEnabled) {
    try {
      AppInsights.trackEvent(Tracking[payload?.name].name, data);
    } catch (err) {
      /* eslint-disable no-console  */
      console.error(err);
      /* eslint-enable no-console */
    }
  }
}

function trackException(error) {
  try {
    AppInsights.trackException(error);
  } catch (err) {
    // left blank intentionally. This will cause an infinite loop and cause browser to crash if we throw exception here
  }
}
function startTrackPage(pageName) {
  try {
    AppInsights.startTrackPage(pageName);
  } catch (err) {
    /* eslint-disable no-console  */
    console.error(err);
    /* eslint-enable no-console */
  }
}
function stopTrackPage(pageName) {
  try {
    AppInsights.stopTrackPage(pageName);
  } catch (err) {
    /* eslint-disable no-console  */
    console.error(err);
    /* eslint-enable no-console */
  }
}
function startTrackEvent(eventName) {
  try {
    AppInsights.startTrackEvent(eventName);
  } catch (err) {
    /* eslint-disable no-console  */
    console.error(err);
    /* eslint-enable no-console */
  }
}
function stopTrackEvent(event) {
  try {
    const data = { ...event };
    const attrs = ['req', 'res', 'config'];
    attrs.forEach(element => {
      if (element in data) {
        data[element] =
          (typeof data[element] !== 'object'
            ? data.request
            : JSON.stringify(data[element])) || '';
      }
    });
    delete data.name;
    AppInsights.stopTrackEvent(event.name, data);
  } catch (err) {
    /* eslint-disable no-console  */
    console.error(err);
    /* eslint-enable no-console */
  }
}

export {
  setupPageTracking,
  trackPageView,
  trackEvent,
  trackEventMethod,
  trackException,
  startTrackPage,
  stopTrackPage,
  startTrackEvent,
  stopTrackEvent
};
