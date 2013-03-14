//  The starting point for the application to load
(function() {
    //Needed to make jQuery compatible with Dojo AMD loader
    define.amd.jQuery = true;
    require({
        async: true, //The async loader does not accomodate the old-style Dojo modules
        /* parseOnLoad- True to automatically parse the HTML for Dojo components after loaded.
            Ran into issues with accessing dijits programmatically, so changed it to false and called parser.parse() later.
            http://dojotoolkit.org/documentation/tutorials/1.8/declarative/
        */
        parseOnLoad: false,
        packages: [  //The "namespaces" for modules in the application
            {
                name: 'jquery',
                location: location.pathname.replace(/\/[^/]+$/, '') + '/src/libs/jquery/js',
                main: 'jquery-1.8.3'
            }, {
                name: 'jqueryui',
                location: location.pathname.replace(/\/[^/]+$/, '') + '/src/libs/jquery/js',
                main: 'jquery-ui-1.9.2.custom'
            }, {
                name: 'xstyle',
                location: location.pathname.replace(/\/[^/]+$/, '') + '/src/libs/xstyle',
                main: 'xstyle'
            }, {
                name: "esriTemplate",
                location: location.pathname.replace(/\/[^/]+$/, '')
            }, {
                name: "localize",
                location: location.pathname.replace(/\/[^/]+$/, '') + '/nls'
            },{
                name: "myModules",
                location: location.pathname.replace(/\/[^/]+$/, '') + '/javascript'
            }, {
                name: "apl",
                location: location.pathname.replace(/\/[^/]+$/, '') + '/apl'
            }, {
                name: "modules",
                location: location.pathname.replace(/\/[^/]+$/, '') + '/src/modules'
            }
        ]
    }
    // The modules which need to be loaded immediately during app load - most of the widgets are lazy-loaded (e.g. on button click)
    , ["dojo/parser", /*"jquery",*/ "dojo/dom", "dojo/ready", "dojo/_base/lang", "require"
        , "modules/core/utilities/environment", "modules/core/configuration/app", "modules/core/configuration/map", "modules/core/configuration/layout"
        , "dijit/layout/BorderContainer", "dijit/layout/TabContainer", "dijit/Toolbar", "dojo/parser", "dojox/layout/FloatingPane", "dijit/MenuItem"
        , "esri/arcgis/utils"
        /*, "dijit/layout/StackContainer", "modules/core/toc/toc",*/
        /*"dojo/i18n!localize/template"*/ /* , "esri/dijit/Scalebar", "esri/tasks/locator", "esri/tasks/geometry", "esri/dijit/BasemapGallery", "esri/dijit/OverviewMap"
        , "esri/dijit/Measurement", "esri/dijit/TimeSlider", "esri/dijit/editing/Editor-all", "esri/IdentityManager", "dojox/layout/FloatingPane"
        , "esri/dijit/Bookmarks", "esri/dijit/Attribution"*//*, "myModules/custommenu"*//*, "esri/dijit/Print"*//*, "apl/ElevationsChart/Pane"*//*, "dijit/MenuItem"*/]
    //The callback to run once Dojo and the required modules are ready.  References to the instantiated objects in the array can be exposed
    // as parameters in the callback function, but a parameter does not have to be inserted for each array item
    , function(parser, /*$,*/ dom, ready, lang, require, environment, app, mapConfig, layout) {
       ready(function() {
            parser.parse();
            var appConfigurator = new app();
            var mapConfigurator = new mapConfig();
            var layoutHandler = new layout();
            //$(document).ready(
                //function(){ //jQuery is now loaded and ready
                    //The application configuration has been loaded
                    appConfigurator.on('appconfigured', function (appConfig) {
                        //Configure the web map
                        mapConfigurator.on('mapconfigured', function (webmap) {
                            // Perform initial layout of the page
                            layoutHandler.InitialLayout(appConfig);
                            // Map has been created and loaded
                            mapConfigurator.on('maploaded', function (map) {
                                // Finish creating application elements, including the tab manager and tool manager
                                layoutHandler.FinalizeLayout(webmap, map);
                            });
                            mapConfigurator.CreateMap();
                        });
                        mapConfigurator.configure(appConfig);
                    });
                    appConfigurator.configure();
                //}
            //);
       });
    });
})();