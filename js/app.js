/* eslint-env amd */

// Configure loading modules from the js directory
require.config({
  baseUrl: 'js',

  paths: {
    'jquery': 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min',
    'bootstrap': 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min',
    'lodash': 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.2/lodash'
  },

  shim: {
    'bootstrap': {
      deps: ['jquery']
    },
    'detectmobilebrowser': {
      deps: ['jquery']
    }
  }
})

// To start the application, load the main module
require(['main'])
