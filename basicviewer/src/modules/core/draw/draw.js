/** A map drawing toolbar - not integrated yet */
define(["dojo/_base/declare", "dojo/_base/Color", "dojo/_base/lang", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin", "dojo/on", "dijit/registry", "dojo/aspect", "dojo/ready", "dojo/parser",
    "dojo/text!./templates/draw.html", "dojo/dnd/move", "dojo/dom-style", "dojo/_base/fx", "dojo/dom",
    "dojox/layout/FloatingPane", "dojo/query", "../utilities/maphandler", "dojo/has", "dojo/json", "dijit/TooltipDialog", "dijit/form/DropDownButton",
	"esri/toolbars/draw", "esri/graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol", "esri/dijit/ColorPicker", "xstyle/css!./css/draw.css"],
    function (declare, Color, lang, domConstruct, WidgetBase, TemplatedMixin,
    WidgetsInTemplateMixin, on, registry, aspect, ready, parser,
    template, move, domstyle, fxer, dom,
    floatingPane, query, mapHandler, has, JSON, TooltipDialog, DropDownButton,
	Draw, Graphic, SimpleMarkerSymbol,
    SimpleLineSymbol, SimpleFillSymbol, ColorPicker) {
        return declare([WidgetBase], {
            // The template HTML fragment (as a string, created in dojo/text definition above)
            templateString: template,
            //Give a unique ID for the floating panel. Populated from constructor in toolmanager.js
            floaterDivId: null,
            //Give a unique ID for the toolbar button associated with this module. Populated from constructor in toolmanager.js
            buttonDivId: null,
            //Floater child
            innerDivId: null,
            //URL for portal
            portalUrl: 'http://www.arcgis.com',
            // The ESRI map object to bind to the TOC
            map: null,
            // The table of contents dijit
            drawingToolbar: null,

            symbol: null,
            fillColor: new Color([255, 255, 255, 0.25]),
            outlineColor: new Color([0, 0, 0, 1]),

            geomTask: null,

            editToolbar: null,

            globalGraphic: null,

            _floatingPane: null,
            //_dijitToc: null,
            panelTitle: 'Drawing & Markup',

            _drawDij: null,
            infoHolder: null,

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
                    title: 'Drawing & Markup',
                    parentModule: this,
                    resizable: false,
                    dockable: false,
                    closable: false,
                    style: "position:absolute;top:20px;left:20px;width:250px;height:250px;z-index:100;visibility:hidden;overflow:hidden;",
                    id: this.floaterDivId,
                    parseOnLoad: false
                }, dom.byId(this.floaterDivId));

                //Create a title bar for Floating Pane
                var titlePane = query('#floaterDraw .dojoxFloatingPaneTitle')[0];

                //Add close button to title pane
                var closeDiv = domConstruct.create('div', {
                    id: "closeBtn",
                    innerHTML: esri.substitute({
                        close_title: "Close Draw", //i18n.panel.close.title,
                        close_alt: "Close Draw" // i18n.panel.close.label
                    }, '<a alt=${close_alt} title=${close_title} href="JavaScript:dijit.registry.byId(\'' + this.floaterDivId + '\').parentModule.ToggleTool();"><img src="assets/close.png"/></a>')
                }, titlePane);
                //Set the content of the Floating Pane to the template HTML.
                dom.byId(this.innerDivId).innerHTML = template;

                // On tool button click = toggle the floating pane
                fpI.startup();

                this.drawingToolbar = new Draw(mapHandler.map, {});
                this.drawingToolbar.on("draw-end", lang.hitch(this, this.addGraphic));

                //			fpI.addChild(draw);
                //			fpI.startup();
                //	
                var fillDialog = new TooltipDialog({
                    content:
                    '<div id="fillPicker"></div>'
                });
                var outlineDialog = new TooltipDialog({
                    content:
                    '<div id="outlinePicker"></div>'
                });

                var fillPickerDD = new DropDownButton({
                    label: "Fill Color",
                    id: "fillBtn",
                    class: "outlineClass",
                    dropDown: fillDialog
                });
                dom.byId("clrPicker").appendChild(fillPickerDD.domNode);
                fillPickerDD.startup();
                var outlinePickerDD = new DropDownButton({
                    label: "Outline Color",
                    class: "outlineClass",
                    id: "outlineBtn",
                    dropDown: outlineDialog
                });
                dom.byId("clrPicker").appendChild(outlinePickerDD.domNode);
                outlinePickerDD.startup();

                this.fillPicker = new ColorPicker({
                    showRecentColors: false,
                    color: new Color([255, 255, 255, 0.25]) 
                }, "fillPicker");
                this.fillPicker.startup();
                this.outlinePicker = new ColorPicker({ 
                    showRecentColors: false,
                    color: new Color([0, 0, 0, 1])
                }, "outlinePicker");
                this.outlinePicker.startup();

                on(this.fillPicker, "color-change", lang.hitch(this, function () {
                    this.fillColor = this.fillPicker.color;
                    domstyle.set(dijit.byId("fillBtn").domNode, "color", "rgba(" + this.fillPicker.color.r + ", " + this.fillPicker.color.g + ", " + this.fillPicker.color.b + ", " + this.fillPicker.color.a + ")");
                }));

                on(this.outlinePicker, "color-change", lang.hitch(this, function () {
                    this.outlineColor = this.outlinePicker.color;
                    domstyle.set(dijit.byId("outlineBtn").domNode, "color", "rgba(" + this.outlinePicker.color.r + ", " + this.outlinePicker.color.g + ", " + this.outlinePicker.color.b + ", " + this.outlinePicker.color.a + ")");
                }));

                on(dojo.byId("draw_multipoint"), "click", lang.hitch(this, function () {
                    this.drawingToolbar.activate("multipoint");
                }));

                on(dojo.byId("draw_polyline"), "click", lang.hitch(this, function () {
                    this.drawingToolbar.activate("polyline");
                }));
                on(dojo.byId("draw_freehand_polyline"), "click", lang.hitch(this, function () {
                    this.drawingToolbar.activate("freehandpolyline");
                }));
                on(dojo.byId("draw_polygon"), "click", lang.hitch(this, function () {
                    this.drawingToolbar.activate("polygon");
                }));
                on(dojo.byId("draw_freehand_polygon"), "click", lang.hitch(this, function () {
                    this.drawingToolbar.activate("freehandpolygon");
                }));
                on(dojo.byId("draw_arrow"), "click", lang.hitch(this, function () {
                    this.drawingToolbar.activate("arrow");
                }));
                on(dojo.byId("draw_triangle"), "click", lang.hitch(this, function () {
                    this.drawingToolbar.activate("triangle");
                }));
                on(dojo.byId("draw_circle"), "click", lang.hitch(this, function () {
                    this.drawingToolbar.activate("circle");
                }));
                on(dojo.byId("draw_ellipse"), "click", lang.hitch(this, function () {
                    this.drawingToolbar.activate("ellipse");
                }));
                /* on(dojo.byId("edit"), "click", lang.hitch(this, function () {
                this.createEdit(); 
                })); */
                on(dojo.byId("clear_all"), "click", lang.hitch(this, function () {
                    this.map.graphics.clear();

                }));
                /*  on(dojo.byId("add_text"), "click", lang.hitch(this, function () {
                this.openTextForm();
                this.drawingToolbar.activate("point");
                })); */

                on(registry.byId(this.buttonDivId), "click", lang.hitch(this, function () {
                    this.ToggleTool();
                }));
                //Open it
                this.ToggleTool();
            }

        , addGraphic: function (evt) {
            //create a random color for the symbols
            var r = Math.floor(Math.random() * 255);
            var g = Math.floor(Math.random() * 255);
            var b = Math.floor(Math.random() * 255);

            var type = evt.geometry.type;
            var symbol;

            if (type === "point" || type === "multipoint") {
                symbol = new SimpleMarkerSymbol(
                  SimpleMarkerSymbol.STYLE_CIRCLE,
                  20, new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SOLID,
                    this.outlineColor, 10),
                    this.fillColor
					);
            } else
                if (type === "line" || type === "polyline") {
                    symbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_DASH,
					this.outlineColor, 2
				);
                } /* else
			  if (type === "freehand_polyline") {
				symbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_DASH, 
					new Color([255, 255, 0]),
					2
				);
			  }	 */
            if (type === "polygon") {
                symbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
					this.outlineColor, 2),
					this.fillColor
				);
            }

            var graphic = new Graphic(evt.geometry, symbol);
            mapHandler.map.graphics.add(graphic);
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
                   this.drawingToolbar.deactivate();
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
               var Form = dom.byId('DrawingTools');

           }

           , _createDrawingTooblbar: function () {
               // get pointer to the esri drawing toolbar widget
               this.drawingToolbar = new esri.toolbars.Draw(this.map);
               // add the event for finishing a graphic
               dojoOn(this.toolbar, "onDrawEnd", lang.hitch(this, function () {
                   this.addToMap();
               }));

               // create the color picker floating pane
               var fpColor = new floatingPane({
                   title: "Change Graphic Color",
                   resizable: false,
                   dockable: false,
                   closable: false,
                   style: "position:absolute;top:0;left:50px;width:310px;height:200px;z-index:100;visibility:hidden;",
                   id: 'colorForm'
               }, dom.byId('colorForm'));
               fpColor.startup();

           }  // end_createDrawingToolbar

           , _addToMap: function () {
               this.drawingToolbar.deactivate();
               this.map.showZoomSlider();
               switch (geometry.type) {
                   case "point":
                       var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, this.outlineColor, 1), this.fillColor);
                       break;
                   case "polyline":
                       var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
                       break;
                   case "polygon":
                       var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                       break;
                   case "extent":
                       var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                       break;
                   case "multipoint":
                       var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 1), new dojo.Color([255, 255, 0, 0.5]));
                       break;
               }
               var graphic = new esri.Graphic(geometry, symbol);
               map.graphics.add(graphic);
           }

           , _activateToolbar: function (graphic) {
               var tool = 0;

               tool = tool | esri.toolbars.Edit.MOVE;
               tool = tool | esri.toolbars.Edit.EDIT_VERTICES;
               tool = tool | esri.toolbars.Edit.SCALE;
               tool = tool | esri.toolbars.Edit.ROTATE;

               var options = {
                   allowAddVertices: "True",
                   allowDeleteVertices: "True",
                   uniformScaling: "True"
               };
               //save graphic object from this click event to be used by the color picker setColor() function.
               globalGraphic = graphic;
               //activate edit tool to show editable vertices and graphics.
               editToolbar.activate(tool, graphic, options);
           } //end _activateToolbar

           , _setColor: function (selectedColor) {
               //if the color picker floating pane is visible, change the rgba value of the graphic
               if (dojo.byId('colorForm').style.visibility != 'hidden') {
                   //get the hex value from the form and convert to rgba
                   var newColor = dojo.colorFromHex(selectedColor);
                   //create variable for transparency
                   var a;
                   //create an esri fill symbol
                   var newFill;
                   //use geometry type of graphic to set the symbol fill type and transparency
                   var geom = globalGraphic.geometry;
                   switch (geom.type) {
                       case 'polygon':
                           newFill = new esri.symbol.SimpleFillSymbol();
                           a = 0.25;
                           break;
                       case 'point':
                           if (globalGraphic.symbol.type == "textsymbol") {
                               newFill = globalGraphic.symbol;
                               a = 1;
                           } else {
                               newFill = new esri.symbol.SimpleMarkerSymbol();
                               a = 1;
                           }
                           break;
                       case 'polyline':
                           newFill = new esri.symbol.SimpleLineSymbol();
                           newFill.setStyle(esri.symbol.SimpleLineSymbol.STYLE_DASH);
                           a = 1;
                           break;
                   }
                   //parse the rgba value to keep the "r" "g" "b" and change the "a"
                   var match = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*\d+[\.\d+]*)*\)/g.exec(newColor);
                   //reset the dojo.color rgba value with the transparency included
                   var fillColor = "rgba(" + [match[1], match[2], match[3], a].join(',') + ")";
                   newFill.setColor(fillColor)
                   globalGraphic.setSymbol(newFill);
               }
           }  //end setColor


        });
    });