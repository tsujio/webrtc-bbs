(function() {
  importScripts("../../lib/webrtc-chord/dist/webrtc-net.js");

  var chord = null;

  self.addEventListener('message', function(e) {
    var data = e.data;
    switch (data.cmd) {
    case 'initialize':
      chord = new Chord(data.params.config, function(fromPeerId, message) {
        self.postMessage({
          cmd: 'message',
          params: {
            fromPeerId: fromPeerId,
            massage: message
          }
        });
      });

      self.postMessage({
        cmd: 'initialized',
        id: data.id
      });
      break;

    case 'create':
      chord.create(function(peerId, error) {
        self.postMessage({
          cmd: 'created',
          id: data.id,
          params: {
            peerId: peerId,
            error: error.message
          }
        });
      });
      break;

    case 'join':
      chord.join(data.bootstrapId, function(peerId, error) {
        self.postMessage({
          cmd: 'joined',
          id: data.id,
          params: {
            peerId: peerId,
            error: error.message
          }
        });
      });
      break;

    case 'leave':
      chord.leave();
      self.postMessage({cmd: 'left'});
      break;

    case 'insert':
      chord.insert(data.key, data.value, function(error) {
        self.postMessage({
          cmd: 'inserted',
          id: data.id,
          params: {
            error: error.message
          }
        });
      });
      break;

    case 'retrieve':
      chord.retrieve(data.key, function(entries, error) {
        self.postMessage({
          cmd: 'retrieved',
          id: data.id,
          params: {
            entries: entries,
            error: error.message
          }
        });
      });
      break;

    case 'remove':
      chord.remove(data.key, data.value, function(error) {
        self.postMessage({
          cmd: 'removed',
          id: data.id,
          params: {
            error: error.message
          }
        });
      });
      break;

    case 'getPeerId':
      var peerId, error;
      try {
        peerId = chord.getPeerId();
      } catch (e) {
        error = e;
      }
      self.postMessage({
        cmd: 'gotPeerId',
        id: data.id,
        params: {
          peerId: peerId,
          error: error.message
        }
      });
      break;

    case 'getStatuses':
      var statuses, error;
      try {
        statuses = chord.getStatuses();
      } catch (e) {
        error = e;
      }
      self.postMessage({
        cmd: 'gotStatuses',
        id: data.id,
        params: {
          statuses: statuses,
          error: error.message
        }
      });
      break;

    default:
    }
  });
})();
