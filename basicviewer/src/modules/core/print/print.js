/** A map drawing toolbar - not integrated yet */
define(["dojo/_base/declare", "dojo/_base/Color", "dojo/_base/lang", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin", "dojo/on", "dijit/registry", "dojo/aspect", "dojo/ready", "dojo/parser",
    "dojo/text!./templates/printDij.html", "dojo/dnd/move", "dojo/dom-style", "dojo/_base/fx", "dojo/dom",
    "dojox/layout/FloatingPane", "dojo/query", "./js/printTool", "../utilities/maphandler", "dojo/has", "dojo/json", "dijit/form/DropDownButton"],
    function (declare, Color, lang, domConstruct, WidgetBase, TemplatedMixin,
    WidgetsInTemplateMixin, on, registry, aspect, ready, parser,
    template, move, domstyle, fxer, dom,
    floatingPane, query, Print, mapHandler, has, JSON, DropDownButton) {
        return declare([WidgetBase], {
            // The template HTML fragment (as a string, created in dojo/text definition above)
            templateString: template,
            //Give a unique ID for the floating panel. Populated from constructor in toolmanager.js
            floaterDivId: null,
            //Give a unique ID for the toolbar button associated with this module. Populated from constructor in toolmanager.js
            buttonDivId: null,
            //Floater child
            innerDivId: null,
            //app config file
            config:null,
            // The ESRI map object to bind to the TOC
            map: null,

            //*** Creates the floating pane. Should be included in your module and be re-usable without modification (if using floating pane)
            constructor: function (args) {
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

                //Create Floating Pane to house the Drawing Tools.  The parentModule property is created to obtain a reference to this module in close button click.
                var fpI = new ConstrainedFloatingPane({
                    title: 'Print Tool',
                    parentModule: this,
                    resizable: false,
                    dockable: false,
                    closable: false,
                    style: "position:absolute;top:20px;left:20px;width:300px;height:300px;z-index:100;visibility:hidden;overflow:hidden;",
                    id: this.floaterDivId,
                    parseOnLoad: false
                }, dom.byId(this.floaterDivId));

                //Create a title bar for Floating Pane
                var titlePane = query('#floaterPrint .dojoxFloatingPaneTitle')[0];

                //Add close button to title pane
                var closeDiv = domConstruct.create('div', {
                    id: "closeBtn",
                    innerHTML: esri.substitute({
                        close_title: "Close Print", //i18n.panel.close.title,
                        close_alt: "Close Print" // i18n.panel.close.label
                    }, '<a alt=${close_alt} title=${close_title} href="JavaScript:dijit.registry.byId(\'' + this.floaterDivId + '\').parentModule.ToggleTool();"><img src="assets/close.png"/></a>')
                }, titlePane);
                //Set the content of the Floating Pane to the template HTML.
                dom.byId(this.innerDivId).innerHTML = template;

                // On tool button click = toggle the floating pane
                fpI.startup();

                //David Sprigg's print widget
                var printWidget = new Print({
                    map: this.map,
                    printTaskURL: this.config.printtask,
                    authorText: "MD iMAP",
                    copyrightText: "2014",
                    defaultTitle: "My Map",
                    defaultFormat: "PDF",
                    defaultLayout: null
                }, 'printDijit');
                printWidget.startup();

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
                   //this._drawDij.setTool("location", true);
                   mapHandler.DisableMapPopups();
               } else {
                   registry.byId(this.floaterDivId).hide();
                   registry.byId(this.buttonDivId).set('checked', false); //uncheck the toggle button
                   //enable map popup windows
                   //this._drawDij.setTool("location", false);
                   //                    mapHandler._clickHandler = mapHandler.map.on("click", mapHandler._clickListener);
                   //                    console.log("Popups should be enabled");
                   //enable map popup windows
                   //  this.drawingToolbar.deactivate();
                   mapHandler.EnableMapPopups();

               }
           }

            /* A standard module event handler. In the postcreate and startup handlers,
            * you can assume the module has been created.  You don't need to add a handler function if you are not writing code in it.
            */
           , startup: function () {


           }
        });
    });