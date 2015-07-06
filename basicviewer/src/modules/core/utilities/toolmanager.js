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
				this._RightToolDiv = dom.byId("webmap-toolbar-right");
                this._ToolsDiv = dom.byId("tools");
              }

            /*** Function to handle loading the toolbar at the top of the map.  Many of the tools only create a button at startup
             * and defer loading of the actual module until if/when the user actually clicks the button.
             * This is the place to create new buttons for new widgets. See existing displayinterop below for the best sample.*/
            , CreateTools: function () {

                //This is the draw tool with options in a floating pane - 
                if (this._AppConfig.displaydraw === 'true' || this._AppConfig.displaydraw == true) {
                    //*** Give button a unique btnId, set title, iconClass as appropriate
                    var btnId = 'tglbtnDraw';
                    var btnTitle = 'Draw';
                    var btnIconClass = 'esriDrawIcon toolButton';
                    //*** Constructor parameters object you want passed into your module
                    //*** Provide a unique ID for the parent div of the floating panel (if applicable)
                    var widgetParams = { floaterDivId: 'floaterDraw' };
                    //*** The relative path to your module
                    var modulePath = "../draw/draw";

                    this._CreateToolButton(widgetParams, btnId, btnTitle, btnIconClass, modulePath, true);
                }
				
				 //*** This is the measure tool with options in a floating pane - there is a bug in measure with the floating pane
                if (this._AppConfig.displaymeasure === 'true' || this._AppConfig.displaymeasure == true) {
                    //*** Give button a unique btnId, set title, iconClass as appropriate
                    var btnId = 'tglbtnMeasure';
                    var btnTitle = 'Measure';
                    var btnIconClass = 'esriMeasureIcon toolButton';
                    //*** Constructor parameters object you want passed into your module
                    //*** Provide a unique ID for the parent div of the floating panel (if applicable)
                    var widgetParams = { floaterDivId: 'floaterMeas' };
                    //*** The relative path to your module
                    var modulePath = "../measure/measure";

                    this._CreateToolButton(widgetParams, btnId, btnTitle, btnIconClass, modulePath, true);
                }

                //*** The basemap tool. An example of loading a DropDownButton, which needs it contents loading before startup.
                if (this._AppConfig.displaybasemaps === "true" || this._AppConfig.displaybasemaps == true) {
                    //*** Give button a unique btnId, set title, iconClass as appropriate
                    var btnId = 'tglbtnBasemaps';
                    var btnTitle = 'Basemaps';
                    var btnIconClass = 'esriBasemapIcon toolButton';
                    //*** Constructor parameters object you want passed into your module
                    //*** Provide a unique ID for the parent div of the floating panel (if applicable)
                    var widgetParams = { floaterDivId: 'tglbtnBasemaps', AppConfig: this._AppConfig };
                    //*** The relative path to your module
                    var modulePath = "../basemaps";

                    this._CreateToolButton(widgetParams, btnId, btnTitle, btnIconClass, modulePath, true);

                }
				//*** The display send link tool. An example of loading a DropDownButton, which needs it contents loading before startup.
                if (this._AppConfig.displaySend === "true" || this._AppConfig.displaySend == true) {
                    //Get the basemap dijit- a dropdown button with the dropdown content
                    require(["../generateLink"],
                    lang.hitch(this, function (webmapDijit) {
                        var webMapBtn = new webmapDijit({
                            id: "genLinkBtn",
                            iconClass: "esriLinkIcon",
                            title: "Generate Link",
                            AppConfig: this._AppConfig
                        });
                        //Button gets added to toolbar
                        this._ToolsDiv.appendChild(webMapBtn.domNode);
                    })
					);
                }
					
				if (this._AppConfig.zoomtocounty === "true" || this._AppConfig.zoomtocounty === true) {
					//a dropdown button with the dropdown content
					require(["../zoomtofeature"],
                    lang.hitch(this, function (zoomDijit) {
                        var zoomToBtn = new zoomDijit({
                            id: "selectZoom",
                            title: "County",
                            value: "Zoom to County",
                            service: "http://geodata.md.gov/imap/rest/services/Boundaries/MD_PhysicalBoundaries/MapServer/",  
                            // alternative:  http://www.mdimap.us/ArcGIS/rest/services/Boundaries/MD.State.PoliticalBoundaries/MapServer/  layer: 5,  field: "COUNTY"
							zoomFeature: "county",
                            layer: 1,
                            field: "county",
                            AppConfig: this._AppConfig
                        });
							
						//Button gets added to toolbar
                        this._RightToolDiv.appendChild(zoomToBtn.domNode);
                    })
					);
                };
                if (this._AppConfig.showFeatureSearch === "true" || this._AppConfig.showFeatureSearch === true) {
                    //a dropdown button with the dropdown content
                    require(["../search/search"],
                    lang.hitch(this, function (searchDij) {
                        var searchBtn = new searchDij({
                            id: "searchDD",
                            title: "Search",
                            AppConfig: this._AppConfig
                        });
                    })
					);
                };
					
				

                //*** This is the add shapefile tool, created as a module. Use this as a pattern for new tools.
                // The _AppConfig parameter originates in app.js, and can be overridden by AGO if parameter is made configurable in config.js.
                if (this._AppConfig.displayinterop === "true" || this._AppConfig.displayinterop == true) {
                    //*** Give button a unique btnId, set title, iconClass as appropriate
                    var btnId = 'tglbtnInterop';
                    var btnTitle = 'Data';
                    var btnIconClass = 'esriDataIcon toolButton';
                    //*** Constructor parameters object you want passed into your module
                    //*** Provide a unique ID for the parent div of the floating panel (if applicable)
                    var widgetParams = { floaterDivId: 'floaterIO' };
                    //*** The relative path to your module
                    var modulePath = "../interop/interop";

                    this._CreateToolButton(widgetParams, btnId, btnTitle, btnIconClass, modulePath, true);
                }

                //This is the draw tool with options in a floating pane - 
                if (this._AppConfig.displayprint === 'true' || this._AppConfig.displayprint == true) {
                    //*** Give button a unique btnId, set title, iconClass as appropriate
                    var btnId = 'tglBtnPrint';
                    var btnTitle = 'Print';
                    var btnIconClass = 'esriPrintIcon toolButton';
                    //*** Constructor parameters object you want passed into your module
                    //*** Provide a unique ID for the parent div of the floating panel (if applicable)
                    var widgetParams = { floaterDivId: 'floaterPrint', config: this._AppConfig };
                    //*** The relative path to your module
                    var modulePath = "../print/print";

                    this._CreateToolButton(widgetParams, btnId, btnTitle, btnIconClass, modulePath, true);
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
                
                //var standby = new Standby({target: "webmap_toolbar_right"});
                var standby = new Standby({target: "map"});
                
                this._ToolsDiv.appendChild(printer.printDomNode);
                document.body.appendChild(standby.domNode);
                printer.startup();
				standby.startup();
				
				printer.on("error", function () {
					alert ("There was an error while printing.  Please try again later.");
					standby.hide(); 
					});
					
				
				printer.on('print-start',function(){
  					console.log('The print operation has started');
  					standby.show();
				});
				
				printer.on('print-complete',function(){
  					console.log('The print operation has finished');
  					standby.hide(); 
				});
				
            }
        });
    }
);