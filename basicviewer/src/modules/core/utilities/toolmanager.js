/**
 Contains the handler for creating toolbar buttons and loading their widgets.
 */
define(["dojo/_base/declare", "../utilities/environment", "dojo/_base/lang", "dojo/Evented", "dijit/registry", "require", "dojo/dom", "dijit/layout/ContentPane"
    , "dojox/widget/Standby", "../utilities/maphandler", "dojo/_base/array", "dojo/query"
    , "dojox/layout/FloatingPane", "dojo/dom-construct", "dojo/on", "dijit/form/ToggleButton"],
    function(declare, environment, lang, Evented, registry, require, dom, contentPane, Standby, mapHandler, dojoArray, query
        , floatingPane, domConstruct, on, ToggleButton){
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
                this._CenterToolDiv = dom.byId("webmap-toolbar-center");
                this._RightToolDiv = dom.byId("webmap-toolbar-right");
            }

            /*** Function to handle loading the tab container.  The widget contents of a tab are lazy-loaded on click, except for the startup widget.
             This is the place to create new tabs for new widgets. See existing widgets for how-to.*/
            , CreateTools: function () {
                if (this._AppConfig.displayprint === "true" || this._AppConfig.displayprint === true) {
                    require(["esri/dijit/Print"],
                        lang.hitch(this, function(PrintDijit) {
                            this._addPrint(PrintDijit);
                        })
                    );
                }

                if (this._AppConfig.displaymeasure === 'true' || this._AppConfig.displaymeasure === true) {
                    require(["esri/dijit/Measurement"],
                        lang.hitch(this, function(MeasurementDijit) {
                            this._addMeasurementWidget(MeasurementDijit);
                        })
                    );
                } else
                    esri.hide(dom.byId('floater'));

                //*** This is the add shapefile tool, created as a module. Use this as a pattern for new tools.
                // The _AppConfig parameter originates in app.js, and can be overridden by AGO if parameter is made configurable in config.js.
                if (this._AppConfig.displayinterop === "true" || this._AppConfig.displayinterop === true) {
                    //*** Give button a unique btnId, set title, iconClass as appropriate
                    var btnId = 'tglbtnInterop';
                    var btnTitle = 'Data';
                    var btnIconClass = 'esriDataIcon';
                    //*** Provide a unique ID for the parent div of the floating panel
                    var parentDivId = 'floaterIO';
                    //*** The relative path to your module
                    var modulePath = "../interop/interop";

                    this._CreateToolButton(btnId, btnTitle, btnIconClass, parentDivId, modulePath);
                }
            }

            // Creates a toolbar button, and wires up a click handler to request your module and load it on first click only.
            , _CreateToolButton: function (btnId, btnTitle, btnIconClass, parentDivId, modulePath) {
                //Create the button for the toolbar
                var tglbtn = new ToggleButton({
                    title: btnTitle,
                    iconClass: btnIconClass,
                    id: btnId
                }); //Button gets added to toolbar
                this._CenterToolDiv.appendChild(tglbtn.domNode);
                //On the first click, dynamically load the module from the server. Then remove the click handler. lang.hitch keeps the scope in this module
                var toolClick = on(tglbtn, "click", lang.hitch(this, function () {
                    toolClick.remove();
                    try {
                        document.body.style.cursor = "wait";
                    } catch (e) {}
                    //*** Set the relative location to your module
                    require([modulePath], lang.hitch(this, function(customDijit) {
                        var theDijit = new customDijit({
                            floaterDivId: parentDivId,
                            buttonDivId: btnId
                        });
                        theDijit.startup();
                        try {
                            document.body.style.cursor = "auto";
                        } catch (e) {}
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
                this._CenterToolDiv.appendChild(printer.printDomNode);
                printer.startup();
            }

            , _addMeasurementWidget: function (MeasurementDijit) {
                var fp = new floatingPane({
                    title: 'Measure', //i18n.tools.measure.title,
                    resizable: false,
                    dockable: false,
                    closable: false,
                    style: "position:absolute;top:0;left:50px;width:245px;height:175px;z-index:100;visibility:hidden;",
                    id: 'measurePane'
                }, dom.byId('floater'));
                fp.startup();

                var titlePane = query('.dojoxFloatingPaneTitle')[0];
                //add close button to title pane
                /*var closeDiv = domConstruct.create('div', {
                    id: "closeBtn",
                    innerHTML: esri.substitute({
                        close_title: 'Close Panel', //i18n.panel.close.title,
                        close_alt: 'Close' //i18n.panel.close.label
                    }, '<a alt=${close_alt} title=${close_title} href="JavaScript:toggleMeasure();"><img  src="images/close.png"/></a>')
                }, titlePane);*/
                var closeDiv = domConstruct.create('div', {
                    id: "measureCloseBtn",
                    innerHTML: esri.substitute({
                        close_title: 'Close Panel', //i18n.panel.close.title,
                        close_alt: 'Close' //i18n.panel.close.label
                    }, '<a alt=${close_alt} title=${close_title} href="http://www.google.com"><img  src="assets/close.png"/></a>')
                }, titlePane);

                measure = new MeasurementDijit({
                    map: mapHandler.map,
                    id: 'measureTool'
                }, 'measureDiv');

                measure.startup();

                var toggleButton = new ToggleButton({
                    //label: i18n.tools.measure.label,
                    title: 'Measure', //i18n.tools.measure.title,
                    id: "measureToggleButton",
                    iconClass: "esriMeasureIcon"
                });
                on(toggleButton, "onClick", lang.hitch(this, function () {
                    this._toggleMeasure();
                }));
                this._CenterToolDiv.appendChild(toggleButton.domNode);
            }

            //Show/hide the measure widget when the measure button is clicked.
            , _toggleMeasure: function () {
                if (dom.byId('floater').style.visibility === 'hidden') {
                    registry.byId('floater').show();
                    mapHandler.DisableMapPopups(); //disable map popups otherwise they interfere with measure clicks
                } else {
                    registry.byId('floater').hide();
                    mapHandler.EnableMapPopups(); //enable map popup windows
                    registry.byId('measureToggleButton').set('checked', false); //uncheck the measure toggle button
                    //deactivate the tool and clear the results
                    var measure = registry.byId('measureTool');
                    measure.clearResult();
                    if (measure.activeTool) {
                        measure.setTool(measure.activeTool, false);
                    }
                }

            }
        });
    }
);