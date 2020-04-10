# METER

Meter is a vuejs based plugin designed to track user activities, collect analytics using Microsoft's application-insights package over Azure dashboard. This wrapper plugin does a lot of underground work to organize and track data related to exceptions, route changes, page views, performance metrics, etc.. The below description will give you a walkthrough to install app-meter on your production-ready app to track any custom data, user activity you can think of and associate it with the logged-in user if required.

## Why you should consider using Meter?

1. Tracks request body of failed requests from client to server.
2. Ability to enable/disable specific feature tracking through a configuration file.
3. Intelligently detects device information like private browsing sessions.
4. Keeps track of all page views using the router and time spent by a user on each page/route.
5. Parses custom track event data in the required format during storage.
6. Correlates all data records with user sessions using user login id if required.

## Installation

```console
$ npm install app-meter --save
```

<a name="getStarted"></a>

## Get started

#### main.js.

```js
import Vue from 'vue';
import router from './router';
import axios from 'axios';
import Meter from 'app-meter';
import trackingConfiguration from 'path-to-your-tracking-configuration-file';

Vue.use(Meter, {
  id: 'XXXXXXXX--XXXX-XXXX-XXXXXXXXXXXX', // app-insights instrumentation key
  applicationName: 'Vue App', // application name
  router, // Required
  axios, // Optional. To track failed request's body.
  trackingConfiguration,
  // pass your tracking configuration file. This will help you to enable/disable tracking activities in an organized way.
  // isEnabled: false will be ignored from tracking activities
});
```

**router:** is required to track all user navigation across the application.

**axios:** is optional. But when supplied can track any failed ajax requests and also captures the request and response body to help in debugging process.

### Sample trackingConfiguration file

#### trackingConfiguration.json

```js
export default {
  'track-a001': {
    name: 'Login User',
    isEnabled: true,
  },
  'track-a002': {
    name: 'Update Cart',
    isEnabled: true,
  },
  'track-a003': {
    name: 'Store Password',
    isEnabled: false,
  },
};
```

Disabled events will not be tracked. This gives flexibility to add/remove custom track events anytime without modifying core code.

##### Tip

If at any point in time, you wish to discontinue tracking a specific event that saves massive amounts of data for cost-cutting you could just disable the event from this config file without having to modify the code.

#### SomeTemplate.vue

##### Example with custom track event directive - to be used in template

```html
<div>
  <h2
    v-m-track-event="{
            name: 'track-a024',
            trigger: 'click',
            action: 'update',
            quoteType: 'mixed',
            component: $options.name
          }"
    class="mb-0"
  >
    Quotes
  </h2>
</div>
```

Example with custom track event method - to be used in script

#### SomeTemplate.vue

```js
this.$meter.trackEvent({
  // decodes the name from your trackingConfiguration file. This name could be used to query your customEvent
  name: 'track-a020',
  // it's nice to have how the event was triggered
  trigger: 'auto',
  // to help filter records based on CRUD operations which occurred in your app
  action: 'read',
  // component from where the event originated
  component: $options.name,
  // custom data you would like to store
  value: {
    key: 'value',
  },
});
```

<a name="setUserContext"></a>

### Set User Context

To tie all requests, events, pageView data to an authenticated user.

Set the authenticated user id and the account id once you have identified a specific signed-in user.

```js
this.$meter.setUserContext({ authenticatedUserId, accountId, storeInCookie });
```

The method will only set the `authenticatedUserId` and `accountId` for all events in the current page view. To set them for all events within the whole session, you should either call this method on every page view or set `storeInCookie = true`.

| Parameter             | Type   | Description                                                                                                                          |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `authenticatedUserId` | string | **Required**<br>An id that uniquely identifies a user of your app. No spaces, comma, semicolon, equals or vertical bar.              |
| `accountId?`          | string | **Optional**<br>An optional account id, if your app groups users into accounts. No spaces, comma, semicolon, equals or vertical bar. |

In the portal, this will add to the count of authenticated users. Authenticated users provide a more reliable count of the number of real users than the count of anonymous users.

The authenticated user id will be available as part of the context of the telemetry sent to the portal, so that you can filter and search on it. It will also be saved as a cookie and sent to the server, where the server SDK (if installed) will attach it to server telemetry.

<a name="clearUserContext"></a>

### Clear User Context

```js
this.$meter.clearUserContext();
```

Clears the authenticated user id and the account id from the user context, and clears the associated cookie.
