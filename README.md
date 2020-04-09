# app-meter

Meter app could be used in your project to track user activities in your app, collect analytics using microsoft's application analytics over azure. This wrapper package does a lot of work underground like tracking exceptions (console errors), routing changes, collecting page views and organizing them, time metrics, router analytics, etc. Below description will help you organize app-meter further in your production ready app to track any custom activities you wish.

## Installation

```console
$ npm install app-meter --save
```

## Get started

```js
import Vue from 'vue';
import router from './router';
import Meter from 'app-meter';
import trackingConfiguration from 'path-to-your-tracking-configuration-file';

Vue.use(Meter, {
  id: 'XXXXXXXX--XXXX-XXXX-XXXXXXXXXXXX', // app-insights instrumentation key
  applicationName: 'Vue App', // application name
  router,
  trackingConfiguration
  // pass your tracking configuration file. This will help you to enable/disable tracking activities in an organized fashion.
  // isEnabled: false will be ignored from tracking activities
});
```

Sample trackingConfiguration file

```js
export default {
  'track-a001': {
    name: 'Login User',
    isEnabled: true
  },
  'track-a002': {
    name: 'Update Cart',
    isEnabled: true
  },
  'track-a003': {
    name: 'Store Password',
    isEnabled: false
  }
};
```

Example with custom track event directive - to be used in template

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
    key: 'value'
  }
});
```


<a name="setAuthenticatedUserContext"></a>
### setUserContext

To tie all requests, events, pageView data to an authenticated user.

Set the authenticated user id and the account id once you have identified a specific signed-in user.

```js
this.$meter.setUserContext({authenticatedUserId, 
                            accountId, 
                            storeInCookie})
```



The method will only set the `authenticatedUserId` and `accountId` for all events in the current page view. To set them for all events within the whole session, you should either call this method on every page view or set `storeInCookie = true`.

 | Parameter             | Type   | Description                                                                                                                          |
 | --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
 | `authenticatedUserId` | string | **Required**<br>An id that uniquely identifies a user of your app. No spaces, comma, semicolon, equals or vertical bar.              |
 | `accountId?`          | string | **Optional**<br>An optional account id, if your app groups users into accounts. No spaces, comma, semicolon, equals or vertical bar. |

In the portal, this will add to the count of authenticated users. Authenticated users provide a more reliable count of the number of real users than the count of anonymous users.

The authenticated user id will be available as part of the context of the telemetry sent to the portal, so that you can filter and search on it. It will also be saved as a cookie and sent to the server, where the server SDK (if installed) will attach it to server telemetry.

### clearUserContext

```js
this.$meter.clearUserContext()
```
Clears the authenticated user id and the account id from the user context, and clears the associated cookie.

