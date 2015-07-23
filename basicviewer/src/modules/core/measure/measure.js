/** A pattern to use for custom tools. Implements a floating pane with custom content (or an esri dijit) inside.
 *  utilities/maphandler is a singleton object containing a reference to the map object and other properties/fxns- such as enabling/disabling popups.
 *
 *  Note: It seems when working with map layer events (e.g. "onClick"),
 *  in order to work with modules, dojo/aspect after() or before() functions should be used.
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/aspect", "dojo/dom-construct", "dojo/on", "dijit/registry", "dojo/ready", "dojo/parser"
    , "dojo/_base/fx", "dojo/_base/lang", "dojo/dom", "dojox/layout/FloatingPane", "dojo/query", "../utilities/maphandler", "dojo/has", "dojo/json", "dojo/_base/Color", "dojo/dnd/move", "dojo/dom-style"
    , "esri/dijit/Measurement", "xstyle/css!./css/measure.css"],
    function (declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, aspect, domConstruct, on, registry, ready, parser, fxer, lang
            , dom, floatingPane, query, mapHandler, has, JSON, Color, move, domstyle, MeasurementDijit) {
        return declare([WidgetBase], {
            //*** Properties needed for this style of module
            //Give a unique ID for the floating panel. Populated from constructor in toolmanager.js
            floaterDivId: null,
            //Give a unique ID for the button associated with this module. Populated from constructor in toolmanager.js
            buttonDivId: null,
            //Floater child
            innerDivId: null,
            // The title for your panel
            panelTitle: 'Measure'

            , _measureDij: null
            , infoHolder: null

            //*** Creates the floating pane. Should be included in your module and be re-usable without modification (if using floating pane)
            , constructor: function (args) {
                // safeMixin automatically sets the properties above that are passed in from the toolmanager.js
                declare.safeMixin(this, args);
                this.innerDivId = this.floaterDivId + 'inner';
                // mapHandler is a singleton object that you can require above and use to get a reference to the map.
                this.map = mapHandler.map;
                //Create the div containers for the floating pane as a child of the map's div
                domConstruct.create('div', { id: this.floaterDivId, style: { padding: "0px"} }, 'map');
                domConstruct.create('div', { id: this.innerDivId }, this.floaterDivId);

                var ConstrainedFloatingPane = declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, floatingPane], {

                    postCreate: function () {
                        this.inherited(arguments);
                        this.moveable = new move.constrainedMoveable(
                            this.domNode, {
                                handle: this.focusNode,
                                constraints: function () {
                                    //var coordsBody = dojo.coords(dojo.body());
                                    // or
                                    var coordsWindow = {
                                        l: 0,
                                        t: 0,
                                        w: window.innerWidth,
                                        h: window.innerHeight
                                    };

                                    return coordsWindow;
                                },
                                within: true
                            }
                        );
                    }

                });

                //Create Floating Pane to house the layout UI of the widget. The parentModule property is created to obtain a reference to this module in close button click.
                var fpI = new ConstrainedFloatingPane({
                    title: 'Measurement',
                    parentModule: this,
                    resizable: false,
                    dockable: false,
                    closable: false,
                    style: "position:absolute;top:20px;left:20px;width:295px;height:265px;z-index:100;visibility:hidden;overflow:hidden;",
                    id: this.floaterDivId
                    , parseOnLoad: false
                }, dom.byId(this.floaterDivId));
                //fpI.startup();
                //Create a title bar for Floating Pane
                var titlePane = query('#floaterMeas .dojoxFloatingPaneTitle')[0];
                //Add close button to title pane. dijit.registry is used to obtain a reference to this floating pane's parentModule
                var closeDiv = domConstruct.create('div', {
                    id: "closeBtn",
                    innerHTML: esri.substitute({
                        close_title: 'Close', //i18n.panel.close.title,
                        close_alt: 'Close'//i18n.panel.close.label
                    }, '<a alt=${close_alt} title=${close_title} href="JavaScript:dijit.registry.byId(\'' + this.floaterDivId + '\').parentModule.ToggleTool();"><img  src="assets/close.png"/></a>')
                }, titlePane);
                //Set the content of the Floating Pane to the Measurement Dijit.
                //dom.byId(this.innerDivId).innerHTML = template;
                measure = new esri.dijit.Measurement({
                    map: mapHandler.map /*,
                    id: 'measureToolDij'*/
                }/*, dom.byId(this.innerDivId)*/);
                fpI.addChild(measure);
                //measure.startup();
				fpI.startup();
                this._measureDij = measure;
                // On tool button click- toggle the floating pane
                on(registry.byId(this.buttonDivId), "click", lang.hitch(this, function () {
                    this.ToggleTool();
                }));
                //Open it
                this.ToggleTool();
            }

            //*** This gets called by the Close (x) button in the floating pane created above. Re-use in your widget.
            , ToggleTool: function () {
                if (dom.byId(this.floaterDivId).style.visibility === 'hidden') {

                    //TODO: find better fix for dancing floating pane
                    //must reset top and left style properties to keep floating pane from dancing across page on multiple re-open.
                    domstyle.set(this.floaterDivId, "top", "0px");
                    domstyle.set(this.floaterDivId, "left", "0px");
                    registry.byId(this.floaterDivId).show();
                    this._measureDij.setTool("location", true);

                    mapHandler.DisableMapPopups();
                } else {

                    registry.byId(this.floaterDivId).hide();
                    registry.byId(this.buttonDivId).set('checked', false); //uncheck the toggle button
                    this._measureDij.clearResult();
                    this._measureDij.setTool("location", false);
//                    mapHandler._clickHandler = mapHandler.map.on("click", mapHandler._clickListener);
//                    console.log("Popups should be enabled");
                    //enable map popup windows
                    mapHandler.EnableMapPopups();
                    //deactivate the tool and clear the results
                    /*var measure = registry.byId('measureToolDij');
                    measure.clearResult();
                    if (measure.activeTool) {
                    measure.setTool(measure.activeTool, false);
                    }*/
                }
            }

            /* A standard module event handler. In the postcreate and startup handlers,
            * you can assume the module has been created.  You don't need to add a handler function if you are not writing code in it.
            */
            /*, startup: function () {
            this.inherited(arguments);

            }*/
        });
    });