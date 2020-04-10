import { AppInsights } from 'applicationinsights-js';

function isPrivateMode() {
  return new Promise((resolve) => {
    const privateMode = function privateMode() {
      resolve(true);
    }; // is in private mode
    const regularMode = function regularMode() {
      resolve(false);
    }; // regularMode in private mode

    function detectChromeOpera() {
      // https://developers.google.com/web/updates/2017/08/estimating-available-storage-space
      const isChromeOpera =
        /(?=.*(opera|chrome)).*/i.test(navigator.userAgent) &&
        navigator.storage &&
        navigator.storage.estimate;
      if (isChromeOpera) {
        navigator.storage
          .estimate()
          .then((data) =>
            data.quota < 120000000 ? privateMode() : regularMode()
          );
      }
      return !!isChromeOpera;
    }

    function detectFirefox() {
      const isMozillaFirefox =
        'MozAppearance' in document.documentElement.style;
      if (isMozillaFirefox) {
        if (indexedDB == null) privateMode();
        else {
          const db = indexedDB.open('inPrivate');
          db.onsuccess = regularMode;
          db.onerror = privateMode;
        }
      }
      return isMozillaFirefox;
    }

    function detectSafari() {
      const isSafari = navigator.userAgent.match(
        /Version\/([0-9\._]+).*Safari/
      );

      if (isSafari) {
        const testLocalStorage = function testLocalStorage() {
          try {
            if (localStorage.length) regularMode();
            else {
              localStorage.setItem('inPrivate', '0');
              localStorage.removeItem('inPrivate');
              regularMode();
            }
          } catch (_) {
            // Safari only enables cookie in private mode
            // if cookie is disabled, then all client side storage is disabled
            // if all client side storage is disabled, then there is no point
            // in using private mode
            if (navigator.cookieEnabled) {
              privateMode();
            } else {
              regularMode();
            }
          }
          return true;
        };
        const version = parseInt(isSafari[1], 10);
        if (version < 11) return testLocalStorage();

        try {
          window.openDatabase(null, null, null, null);
          regularMode();
        } catch (_) {
          privateMode();
        }
      }
      return !!isSafari;
    }
    function detectEdgeIE10() {
      const isEdgeIE10 =
        !window.indexedDB && (window.PointerEvent || window.MSPointerEvent);
      if (isEdgeIE10) privateMode();
      return !!isEdgeIE10;
    } // when a browser is detected, it runs tests for that browser
    // and skips pointless testing for other browsers.

    if (detectChromeOpera()) return;
    if (detectFirefox()) return;
    if (detectSafari()) return;
    if (detectEdgeIE10()) return; // default navigation mode

    regularMode();
  });
}

async function setupPageTracking(applicationName, router) {
  let isPrivate;
  try {
    isPrivate = await isPrivateMode();
  } catch (e) {
    isPrivate = false;
  }
  const baseName = isPrivate
    ? `(Private) ${applicationName || '(Vue App)'}`
    : `${applicationName || '(Vue App)'}`;

  router.beforeEach((route, from, next) => {
    const name = `${baseName} / ${route.name}`;
    AppInsights.startTrackPage(name);
    next();
  });

  router.afterEach((route) => {
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
    attrs.forEach((element) => {
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

function setUserContextMethod(payload) {
  const { accountId = 0, storeInCookie = false } = payload;
  let { authenticatedUserId } = payload;
  authenticatedUserId = authenticatedUserId.replace(/[,;=| ]+/g, '_');
  AppInsights.setAuthenticatedUserContext(
    authenticatedUserId,
    accountId,
    storeInCookie
  );
}

function clearUserContextMethod() {
  AppInsights.clearAuthenticatedUserContext();
}

function dependencyMethod(payload) {
  const { status: resStatus } = payload.request;
  let { response: resBody = '' } = payload.request;
  const { url: reqUrl, method: reqMethod, data: reqBody = '' } = payload.config;
  const { CKey: cKey } = payload.config.headers;
  const webResBodyString = 'doctype html';
  if (resBody && resBody?.toLowerCase()?.includes(webResBodyString)) {
    resBody = null;
  } else {
    resBody = JSON.stringify(resBody);
  }
  const id = `M-${Math.random().toString(36).slice(-6)}`;
  const data = JSON.stringify({ reqBody, resBody, cKey });

  AppInsights.trackDependencyData({
    id,
    responseCode: resStatus,
    absoluteUrl: `${reqMethod.toUpperCase()} ${reqUrl}`,
    name: `${reqMethod.toUpperCase()} ${reqUrl}`,
    success: false,
    method: reqMethod,
    data,
  });
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
  stopTrackEvent,
  setUserContextMethod,
  clearUserContextMethod,
  dependencyMethod,
};
