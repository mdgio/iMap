/**
 Contains the handler for creating toolbar buttons and loading their widgets. See examples below for how to use.
 */
define(["dojo/_base/declare", "../utilities/environment", "dojo/_base/lang", "dojo/Evented", "dijit/registry", "require", "dojo/dom", "dijit/layout/ContentPane"
    , "dojox/widget/Standby", "../utilities/maphandler", "dojo/_base/array", "dojo/query"
    , "dojox/layout/FloatingPane", "dojo/dom-construct", "dojo/on", "dijit/form/ToggleButton", "dijit/form/DropDownButton"],
    function(declare, environment, lang, Evented, registry, require, dom, contentPane, Standby, mapHandler, dojoArray, query
        , floatingPane, domConstruct, on, ToggleButton, DropDownButton){
        return declare([], {
            //The application configuration properties (originated as configOptions from app.js then overridden by AGO if applicable)
            _AppConfig: null
            //The web map configuration properties (from map.js). If a webmap was not used, some functionality is not available
            , _WebMap: null
            //The sub-toolbar divs to insert buttons into
            , _LeftToolDiv: null
            , _CenterToolDiv: null
            , _RightToolDiv: null
            //mapHandler contains a reference to the actual arcgis map object and helper fxns

            , constructor: function(args) {
                this._AppConfig = args.AppConfig;
                this._WebMap = args.WebMap;

                this._LeftToolDiv = dom.byId("webmap-toolbar-left");
                this._ToolsDiv = dom.byId("tools");
            }

            /*** Function to handle loading the toolbar at the top of the map.  Many of the tools only create a button at startup
             * and defer loading of the actual module until if/when the user actually clicks the button.
             * This is the place to create new buttons for new widgets. See existing displayinterop below for the best sample.*/
            , CreateTools: function () {
                if (this._AppConfig.displayprint === "true" || this._AppConfig.displayprint == true) {
                    require(["esri/dijit/Print"],
                        lang.hitch(this, function(PrintDijit) {
                            this._addPrint(PrintDijit);
                        })
                    );
                }

                //The measure tool with options in a floating pane - there is a bug in measure with the floating pane
                if (this._AppConfig.displaymeasure === 'true' || this._AppConfig.displaymeasure == true) {
                    //*** Give button a unique btnId, set title, iconClass as appropriate
                    var btnId = 'tglbtnMeasure';
                    var btnTitle = 'Measure';
                    var btnIconClass = 'esriMeasureIcon';
                    //*** Constructor parameters object you want passed into your module
                    //*** Provide a unique ID for the parent div of the floating panel (if applicable)
                    var widgetParams = { floaterDivId: 'floaterMeas' };
                    //*** The relative path to your module
                    var modulePath = "../measure";

                    this._CreateToolButton(widgetParams, btnId, btnTitle, btnIconClass, modulePath, true);
                }

                //*** The basemap tool. An example of loading a DropDownButton, which needs it contents loading before startup.
                if (this._AppConfig.displaybasemaps === "true" || this._AppConfig.displaybasemaps == true) {
                    //Get the basemap dijit- a dropdown button with the dropdown content
                    require(["../basemaps"],
                        lang.hitch(this, function(basemapDijit) {
                            var baseMapBtn = new basemapDijit({
                                id: "basemapBtn",
                                iconClass: "esriBasemapIcon",
                                title: "Basemaps",
                                AppConfig: this._AppConfig
                            });
                            //Button gets added to toolbar
                            this._ToolsDiv.appendChild(baseMapBtn.domNode);
                        })
                    );
                }

                //*** This is the add shapefile tool, created as a module. Use this as a pattern for new tools.
                // The _AppConfig parameter originates in app.js, and can be overridden by AGO if parameter is made configurable in config.js.
                if (this._AppConfig.displayinterop === "true" || this._AppConfig.displayinterop == true) {
                    //*** Give button a unique btnId, set title, iconClass as appropriate
                    var btnId = 'tglbtnInterop';
                    var btnTitle = 'Data';
                    var btnIconClass = 'esriDataIcon';
                    //*** Constructor parameters object you want passed into your module
                    //*** Provide a unique ID for the parent div of the floating panel (if applicable)
                    var widgetParams = { floaterDivId: 'floaterIO' };
                    //*** The relative path to your module
                    var modulePath = "../interop/interop";

                    this._CreateToolButton(widgetParams, btnId, btnTitle, btnIconClass, modulePath, true);
                }

                //*** This is the location tool (GPS), created as a module. Use this as a pattern for new tools, if no floating pane needed.
                if (this._AppConfig.displaylocation === "true" || this._AppConfig.displaylocation == true) {
                    //*** Give button a unique btnId, set title, iconClass as appropriate
                    var btnId = 'tglbtnLocation';
                    var btnTitle = 'Location';
                    var btnIconClass = 'esriLocationIcon';
                    //*** Constructor parameters object you want passed into your module
                    //*** Provide a unique ID for the parent div of the floating panel (if applicable)
                    var widgetParams = { map: mapHandler.map };
                    //var parentDivId = 'floaterIO';//floaterDivId
                    //*** The relative path to your module
                    var modulePath = "../location";

                    this._CreateToolButton(widgetParams, btnId, btnTitle, btnIconClass, modulePath, false);
                }
            }

            // Creates a toolbar button, and wires up a click handler to request your module and load it on first click only.
            , _CreateToolButton: function (widgetParams, btnId, btnTitle, btnIconClass, modulePath, startupDijit) {
                //Pass in the id of the button, as most tools need to toggle it.
                widgetParams.buttonDivId = btnId;
                //Create the button for the toolbar
                var theBtn = new ToggleButton({
                    title: btnTitle,
                    iconClass: btnIconClass,
                    id: btnId
                });
                //Button gets added to toolbar
                this._ToolsDiv.appendChild(theBtn.domNode);
                //On the first click, dynamically load the module from the server. Then remove the click handler. lang.hitch keeps the scope in this module
                var toolClick = on(theBtn, "click", lang.hitch(this, function () {
                    toolClick.remove();
                    try { document.body.style.cursor = "wait"; } catch (e) {}
                    //*** Set the relative location to the module
                    require([modulePath], lang.hitch(this, function(customDijit) {
                        var theDijit = new customDijit(widgetParams);
                        if (startupDijit)
                            theDijit.startup();
                        try { document.body.style.cursor = "auto"; } catch (e) {}
                    }));
                }));
            }

            , _addPrint: function (PrintDijit) {
                var layoutOptions ={
                    'authorText':this._AppConfig.owner,
                    'titleText': this._AppConfig.title,
                    'scalebarUnit': 'Miles', //(i18n.viewer.main.scaleBarUnits === 'english') ? 'Miles' : 'Kilometers',
                    'legendLayers':[]
                };

                var templates = dojoArray.map(this._AppConfig.printlayouts,function(layout){
                    layout.layoutOptions = layoutOptions;
                    return layout;
                });
                var printer = new PrintDijit({
                    map: mapHandler.map,
                    templates: templates,
                    url: this._AppConfig.printtask
                }, dojo.create('span'));

                query('.esriPrint').addClass('esriPrint');
                this._ToolsDiv.appendChild(printer.printDomNode);
                printer.startup();
            }
        });
    }
);