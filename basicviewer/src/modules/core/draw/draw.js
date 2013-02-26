/**
 * Created with JetBrains WebStorm.
 * User: SSporik
 * Date: 2/16/13
 * Time: 2:47 PM
 * To change this template use File | Settings | File Templates.
 */
define(["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dijit/registry", "dojo/ready", "dojo/parser",
    "dojo/text!./templates/draw.html", "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang", "dojo/dom", "dojox/layout/FloatingPane", "dojo/query", "../utilities/maphandler", "dojo/has", "dojo/json"
    , "xstyle/css!./css/draw.css"],
    function(declare, domConstruct, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, on, registry, ready, parser, template, domsty, fxer, language, dom, floatingPane, query, mapHandler, has, JSON){
        return declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin],{
            //declare([WidgetBase, TemplatedMixin], {

            // The template HTML fragment (as a string, created in dojo/text definition above)
            templateString: template,
            // The CSS class to be applied to the root node in our template
            /*baseClass: "draw",*/
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

            geomTask: null,

            editToolbar: null,

            globalGraphic: null,

            _floatingPane: null,
            //_dijitToc: null,
            panelTitle: 'Drawing & Markup',

        //*** Creates the floating pane. Should be included in your module and be re-usable without modification (if using floating pane)
        constructor: function(args){
            // safeMixin automatically sets the properties above that are passed in from the toolmanager.js
            declare.safeMixin(this,args);
            this.innerDivID = this.floaterDivID + 'inner';
            // mapHandler is a singleton object that you can require above and use to get a reference to the map.
            this.map = mapHandler.map;
            //Create the div containers for the floating pane as a child of the map's div
            domConstruct.create('div', { id: this.floaterDivId }, 'map');
            domConstruct.create('div', { id: this.innerDivId }, this.floaterDivId);

            //create Floating Pane to house the Drawing Tools

           var fpI = new dojo.layout.FloatingPane({
               title: 'Drawing & Markup',
               resizable: false,
               dockable: false,
               closable: false,
               style: "position:absolute;top:0;left:50px;width:245px;height:265px;z-index:100;visibility:hidden;",
               id: this.floaterDivId
           }, dom.byId(this.floaterDivId));
            fpI.startup();

            //Create a title bar for Floating Pane
            var titlePane = query('#floaterDraw .dojoxFloatingPaneTitle')[0];
            //Add close button to title pane
            var closeDiv = domConstruct.create('div', {
                id: "closeBtn",
                innerHTML: esri.substitute({
                    close_title: "Close Draw", //i18n.panel.close.title,
                    close_alt: "Close Draw" // i18n.panel.close.label
                }, '<a alt=${close_alt} title=${close_title} href="JavaScript:dijit.registry.byId(\'' + this.floaterDivId + '\').parentModule.ToggleTool();"><img  src="../toc/images/close.png"/></a>')
            }, titlePane);
            //Set the content of the Floating Pane to the template HTML.
            dom.byId(this.innerDivId).innerHTML = template;
            // On tool button click = toggle the floating pane
            on(registry.byId(this.buttonDivId), "click", lang.hitch(this, function (){
                this.ToggleTool();
            }));
            //Open it
            this.ToggleTool();
        }
           //*** This gets called by the Close (x) button in the floating pane created above. Re-use in your widget.
           , ToggleTool: function () {
                if (dojo.byId(this.floaterDivId).style.visibility === 'hidden') {
                    dijit.byId(this.floaterDivId).show();
                } else {
                    dijit.byId(this.floaterDivId).hide();
                    dijit.byId(this.buttonDivId).set('checked', false); //uncheck the toggle button
                }
            }

            /* A standard module event handler. In the postcreate and startup handlers,
             * you can assume the module has been created.  You don't need to add a handler function if you are not writing code in it.
             */
           , startup: function () {
               var Form = dom.byId('DrawingTools');

           }

           , _createDrawingTooblbar: function(){
                    // get pointer to the esri drawing toolbar widget
                    this.drawingToolbar = new esri.toolbars.Draw(this.map);
                    // add the event for finishing a graphic
                    dojoOn(this.toolbar, "onDrawEnd", lang.hitch(this, function (){
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

                }

           , _addToMap: function() {
                    this.drawingToolbar.deactivate();
                    this.map.showZoomSlider();
                    switch (geometry.type) {
                        case "point":
                            var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 1), new dojo.Color([0,255,0,0.25]));
                            break;
                        case "polyline":
                            var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255,0,0]), 1);
                            break;
                        case "polygon":
                            var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]));
                            break;
                        case "extent":
                            var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]));
                            break;
                        case "multipoint":
                            var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1), new dojo.Color([255,255,0,0.5]));
                            break;
                    }
                    var graphic = new esri.Graphic(geometry, symbol);
                    map.graphics.add(graphic);
                }

           , _activateToolbar: function(graphic) {
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
                }

           ,  _setColor:  function(selectedColor) {
                //if the color picker floating pane is visible, change the rgba value of the graphic
                if (dojo.byId('colorForm').style.visibility != 'hidden'){
                    //get the hex value from the form and convert to rgba
                    var newColor = dojo.colorFromHex(selectedColor);
                    //create variable for transparency
                    var a;
                    //create an esri fill symbol
                    var newFill;
                    //use geometry type of graphic to set the symbol fill type and transparency
                    var geom = globalGraphic.geometry;
                    switch(geom.type){
                        case 'polygon':
                            newFill = new esri.symbol.SimpleFillSymbol();
                            a = 0.25;
                            break;
                        case 'point':
                            if (globalGraphic.symbol.type == "textsymbol"){
                                newFill = globalGraphic.symbol;
                                a = 1;
                            }else{
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
                    var fillColor = "rgba(" + [match[1],match[2],match[3],a].join(',') +")";
                    newFill.setColor(fillColor)
                    globalGraphic.setSymbol(newFill);
                }
            }

           ,  _openTextForm: function() {
                    var fp = floatingPane({
                        title: "Add Text to Map",
                        resizable: false,
                        dockable: false,
                        closable: false,
                        style: "position:absolute;top:0;left:50px;width:350px;height:150px;z-index:100;visibility:hidden;",
                        id: 'textForm'
                    }, dom.byId('textForm'));
                    fp.startup();

                    registry.byId('textForm').show();

                    on(map.graphics, "onGraphicAdd", function(graphic) {
                        //dojo.stopEvent(graphic);
                        globalGraphic = graphic;
                    });
                }

        });

    });