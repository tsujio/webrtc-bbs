define(['jquery', 'underscore'], function($, _) {
  var ApplicationView = function() {
    if (!ApplicationView._isInitialized) {
      ApplicationView._initialize();
      ApplicationView._isInitialized = true;
    }
  };

  ApplicationView._isInitialized = false;

  ApplicationView._initialize = function() {
    $("#btn-reload").click(function() {
      WebRtcBbs.context.routing.reload();
    });

    $("#nav-top").click(function() {
      WebRtcBbs.context.routing.to('/');
      return false;
    });

    $("#nav-about").click(function() {
      WebRtcBbs.context.routing.to('/about');
      return false;
    });

    $("#nav-contact").click(function() {
      WebRtcBbs.context.routing.to('/contact');
      return false;
    });

    $("#nav-settings").click(function() {
      WebRtcBbs.context.routing.to('/settings');
      return false;
    });
  };

  ApplicationView.prototype = {
    render: function(view) {
      $("#contents").html(view.html.apply(view, _.rest(arguments)));
      view.onrendered.apply(view, _.rest(arguments));
    }
  };

  return ApplicationView;
});
