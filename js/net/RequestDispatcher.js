define(['underscore', 'net/Response'], function(_, Response) {
  var RequestDispatcher = function() {
  };

  RequestDispatcher.prototype = {
    dispatch: function(fromPeerId, request, callback) {
      var self = this;

      switch (request.method) {
      case 'RECENT':
        this._routingTo('/thread/index.json', request.params, function(threadsInfo, error) {
          if (error) {
            console.log(error);
            self._sendFailureResponse("Failed to process request.", request, callback);
            return;
          }

          self._sendSuccessResponse({threadsInfo: threadsInfo}, request, callback);
        });
        break;

      case 'NEW':
        this._routingTo('/thread/create.json', request.params.threadInfo);
        break;

      case 'GET':
        this._routingTo('/thread/show.json', request.params, function(threadInfo, messagesInfo, error) {
          if (error) {
            console.log(error);
            self._sendFailureResponse("Failed to process request.", request, callback);
            return;
          }

          self._sendSuccessResponse({messagesInfo: messagesInfo}, request, callback);
        });
        break;

      case 'UPDATE':
        this._routingTo('/message/create.json', request.params.messageInfo);
        break;
      }
    },

    _routingTo: function(path, args, callback) {
      WebRtcBbs.context.routing.to(path, args, true, callback);
    },

    _sendFailureResponse: function(message, request, callback) {
      try {
       var response = Response.create('FAILED', {message: message}, request);
      } catch (e) {
        console.log(e);
        return;
      }
      callback(response);
    },

    _sendSuccessResponse: function(result, request, callback) {
      try {
        var response = Response.create('SUCCESS', result, request);
      } catch (e) {
        console.log(e);
        return;
      }
      callback(response);
    }
  };

  return RequestDispatcher;
});
