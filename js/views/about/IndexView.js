define(['jquery', 'underscore'], function($, _) {
  var IndexView = function() {
    this._template = _.template($("#template-about-index").html());
    this._$html = null;
  };

  IndexView.prototype = {
    html: function() {
      this._$html = $(this._template());
      return this._$html;
    }
  };

  return IndexView;
});
