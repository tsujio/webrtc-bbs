require.config({
  baseUrl: 'js',

  paths: {
    jquery: 'http://code.jquery.com/jquery-2.0.3.min',
    underscore: 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
    peerjs: 'http://cdnjs.cloudflare.com/ajax/libs/peerjs/0.3.7/peer.min',
    cryptojs: 'http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/sha256',
    bootstrap: 'http://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min',
    webrtcnet: '../lib/webrtc-chord/dist/webrtc-net'
  },

  shim: {
    peerjs: {
      exports: 'Peer'
    },

    cryptojs: {
      exports: 'CryptoJS'
    },

    bootstrap: {
      deps: ['jquery']
    },

    webrtcnet: {
      deps: ['underscore', 'cryptojs', 'peerjs'],
      exports: 'Chord'
    },
  }
});

require(['main', 'bootstrap'], function(main) {
  main({
    peer: {
      options: {
        host: 'YOUR PEERSERVER HOST',
        port: 9000,
        key: 'YOUR KEY',
      }
    },
  });
});
