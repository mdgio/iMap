(function() {

  require({
    async: true,
    parseOnLoad: true,
    aliases: [["text", "dojo/text"]],
    packages: [
      {
        name: "jquery",
        location: location.pathname.replace(/\/[^/]+$/, "") + "/src/libs/jquery",
        main: "jquery-1.7.2.min"
      }, {
        name: "jqueryui",
        location: location.pathname.replace(/\/[^/]+$/, "") + "/src/libs/jqueryui",
        main: "jquery-ui-1.8.20.custom.min"
      }, {
        name: "templates",
        location: location.pathname.replace(/\/[^/]+$/, "") + "/templates"
      }, {
        name: "views",
        location: location.pathname.replace(/\/[^/]+$/, "") + "/src/views"
      }, {
        name: "models",
        location: location.pathname.replace(/\/[^/]+$/, "") + "/src/models"
      }, {
        name: "helpers",
        location: location.pathname.replace(/\/[^/]+$/, "") + "/src/helpers"
      }
    ]
  });

  define.amd.jQuery = true;

  require(['jquery', 'app'], function($, App) {
    return $(document).ready(function() {
      return App.initialize();
    });
  });

}).call(this);
