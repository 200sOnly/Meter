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

## Options

Coming Soon
