define([
  'underscore', 'controllers/ApplicationController', 'models/Thread', 'models/Message', 'utils/Utils'
], function(_, ApplicationController, Thread, Message, Utils) {
  var MessageController = Utils.inherit(ApplicationController, function(networkAgent) {
    ApplicationController.call(this, networkAgent);
  });

  MessageController.prototype.create = function(args, format) {
    var self = this;

    Message.new(args).exists(function(exists) {
      Message.create(args, function(message, error) {
        if (error) {
          throw new Error("Failed to create message:", error);
        }

        Utils.debug("Created or updated message:", message.id);

        if (!exists) {
          Utils.debug("Spreading message:", message.id);
          self._networkAgent.spreadMessage(message.toJson());
        }

        self._response(format, {
          html: function() {
            WebRtcBbs.context.routing.to('/thread/show', {threadId: args.threadId}, true);
          }
        });
      });
    });
  };

  return MessageController;
});
