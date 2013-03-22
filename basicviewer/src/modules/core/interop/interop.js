/** A pattern to use for custom tools. Implements a floating pane with custom content (or an esri dijit) inside.
 *  dojo/text! and xstyle/css! are used to dynamically load an HTML fragment and CSS sheet for this module. Update to your file names.
 *  utilities/maphandler is a singleton object containing a reference to the map object and other properties/fxns- such as enabling/disabling popups.
 *  A good help sample: http://dojotoolkit.org/documentation/tutorials/1.8/recipes/custom_widget/
 *  If using an esri dijit, they should all be AMD-compatible. Help: http://help.arcgis.com/en/webapi/javascript/arcgis/jshelp/#inside_dojo_amd
 *
 *  Note: It seems when working with map layer events (e.g. "onClick"),
 *  in order to work with modules, dojo/aspect after() or before() functions should be used.
 */
define(["dojo/_base/declare", "dojo/aspect", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dijit/registry", "dojo/ready", "dojo/parser"
    , "dojo/text!./templates/interop.html", "dojo/_base/fx", "dojo/_base/lang"
    , "dojo/dom", "dojox/layout/FloatingPane", "dojo/query", "../utilities/maphandler", "dojo/has", "dojo/json", "dojo/_base/Color", "dojo/dnd/move", "dojo/dom-style"
    , "xstyle/css!./css/interop.css"],
    function(declare, aspect, domConstruct, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, on, registry, ready, parser, template, fxer, lang
                , dom, floatingPane, query, mapHandler, has, JSON, Color, move, domstyle){
        return declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin],{
            //*** Properties needed for this style of module
            // The template HTML fragment (as a string, created in dojo/text definition above)
			templateString: template,
			// The CSS class to be applied to the root node in our template
			/*baseClass: "interop",*/
			//Give a unique ID for the floating panel. Populated from constructor in toolmanager.js
			floaterDivId: null,
            //Give a unique ID for the button associated with this module. Populated from constructor in toolmanager.js
            buttonDivId: null,
			//Floater child
			innerDivId: null,
            // The ESRI map object to bind to the TOC. Set in constructor
            map: null,
            // The title for your panel
            panelTitle: 'Data Interoperability'

            //Custom property for this module, don't necessarily need in yours
            //URL for portal
            , portalUrl: 'http://www.arcgis.com'
            //The user-entered name for the layer in the legend
            , _lyrName: null

            //*** Creates the floating pane. Should be included in your module and be re-usable without modification (if using floating pane)
            , constructor: function(args) {
                // safeMixin automatically sets the properties above that are passed in from the toolmanager.js
                declare.safeMixin(this,args);
                this.innerDivId = this.floaterDivId + 'inner';
                // mapHandler is a singleton object that you can require above and use to get a reference to the map.
                this.map = mapHandler.map;
                //Create the div containers for the floating pane as a child of the map's div
                domConstruct.create('div', { id: this.floaterDivId }, 'map');
                domConstruct.create('div', { id: this.innerDivId }, this.floaterDivId);

                var ConstrainedFloatingPane = dojo.declare(dojox.layout.FloatingPane, {

                    postCreate: function() {
                        this.inherited(arguments);
                        this.moveable = new dojo.dnd.move.constrainedMoveable(
                            this.domNode, {
                                handle: this.focusNode,
                                constraints: function() {
                                    var coordsBody = dojo.coords(dojo.body());
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
	 				title: 'Data Interoperability',
                    parentModule: this,
	 				resizable: false,
	 				dockable: false,
	 				closable: false,
	 				style: "position:absolute;top:20px;left:20px;width:245px;height:265px;z-index:100;visibility:hidden;",
	 				id: this.floaterDivId

			    }, dom.byId(this.floaterDivId));
  				fpI.startup();
  				//Create a title bar for Floating Pane
  				var titlePane = query('#floaterIO .dojoxFloatingPaneTitle')[0];
  				//Add close button to title pane. dijit.registry is used to obtain a reference to this floating pane's parentModule
  				var closeDiv = domConstruct.create('div', {
    				id: "closeBtn",
    				innerHTML: esri.substitute({
      				close_title: 'Close Data', //i18n.panel.close.title,
      				close_alt: 'Close Data'//i18n.panel.close.label
    				}, '<a alt=${close_alt} title=${close_title} href="JavaScript:dijit.registry.byId(\'' + this.floaterDivId + '\').parentModule.ToggleTool();"><img  src="assets/close.png"/></a>')
  				}, titlePane);
  				//Set the content of the Floating Pane to the template HTML.
 				dom.byId(this.innerDivId).innerHTML = template;
                // On tool button click- toggle the floating pane
                on(registry.byId(this.buttonDivId), "click", lang.hitch(this, function () {
                    this.ToggleTool();
                }));
                //Open it
                this.ToggleTool();
            }

            //*** This gets called by the Close (x) button in the floating pane created above. Re-use in your widget.
            , ToggleTool: function () {
                if (dojo.byId(this.floaterDivId).style.visibility === 'hidden') {
                    //TODO: find better fix for dancing floating pane
                    //must reset top and left style properties to keep floating pane from dancing across page on multiple re-open.
                    domstyle.set(this.floaterDivId, "top", "0px");
                    domstyle.set(this.floaterDivId, "left", "0px");
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
                this.inherited(arguments);
                var uploadForm = dom.byId('inFile');
                // Add an event handler for when the upload shapefile form is submitted.
                uploadForm.onchange = lang.hitch(this, this._listening);
            }

            , _listening: function (evt) {
                var fileName;
                if (evt && evt.target)
                    fileName = evt.target.value.toLowerCase();
                else
                    fileName = dom.byId('inFile').value;
                this._lyrName = dom.byId('txtInterop').value;
                if (has('ie')) { //filename is full path in IE so extract the file name
                    var arr = fileName.split("\\");
                    fileName = arr[arr.length - 1];
                }
                if (fileName.indexOf(".zip") !== -1) //is file a zip - if not notify user
                    this._generateFeatureCollection(fileName);
                else
                    dom.byId('upload-status').innerHTML = '<p style="color:red">Add shapefile as .zip file</p>';
            }

            , _generateFeatureCollection: function (fileName) {
                var name = fileName.split(".");
                //Chrome and IE add c:\fakepath to the value - we need to remove it
                //See this link for more info: http://davidwalsh.name/fakepath
                name = name[0].replace("c:\\fakepath\\","");

                dom.byId('upload-status').innerHTML = '<b>Loading… </b>' + name;

                //Define the input params for generate see the rest doc for details
                //http://www.arcgis.com/apidocs/rest/index.html?generate.html
                var params = {
                    'name': name,
                    'targetSR': this.map.spatialReference,
                    'maxRecordCount': 1000,
                    'enforceInputFileSizeLimit': true,
                    'enforceOutputJsonSizeLimit': true
                };

                //generalize features for display Here we generalize at 1:40,000 which is approx 10 meters
                //This should work well when using web mercator.
                var extent = esri.geometry.getExtentForScale(this.map,40000);
                var resolution = extent.getWidth() / this.map.width;
                params.generalize = true;
                params.maxAllowableOffset = resolution;
                params.reducePrecision = true;
                params.numberOfDigitsAfterDecimal = 0;

                var myContent = {
                    'filetype': 'shapefile',
                    'publishParameters': JSON.stringify(params),
                    'f': 'json',
                    'callback.html': 'textarea'
                };

                //use the rest generate operation to generate a feature collection from the zipped shapefile
                esri.request({
                    url: 'http://www.arcgis.com' + '/sharing/rest/content/features/generate',
                    content: myContent,
                    form: dom.byId('uploadForm'),
                    handleAs: 'json',
                    timeout: 120000,
                    load: lang.hitch(this, function (response) {
                        if (response.error) {
                            this._errorHandler(response.error);
                            return;
                        }
                        dom.byId('upload-status').innerHTML = '<b>Loaded: </b>' + response.featureCollection.layers[0].layerDefinition.name;
                        this._addShapefileToMap(response.featureCollection);
                    }),
                    error: lang.hitch(this, this._errorHandler)
                });
            }

            , _errorHandler: function (error) {
                dom.byId('upload-status').innerHTML = "<p style='color:red'>" + error.message + "</p>";
            }

            , _addShapefileToMap: function (featureCollection) {
                //add the shapefile to the map and zoom to the feature collection extent
                //If you want to persist the feature collection when you reload browser you could store the collection in
                //local storage by serializing the layer using featureLayer.toJson()  see the 'Feature Collection in Local Storage' sample
                //for an example of how to work with local storage.
                var fullExtent;
                var layers = [];
                //dojo.forEach(featureCollection.layers, lang.hitch(this, function (layer) {
                for (var i = 0; i < featureCollection.layers.length; i++) {
                    layer = featureCollection.layers[i];
                    var infoTemplate = new esri.InfoTemplate("Details", "${*}");
                    var layer = new esri.layers.FeatureLayer(layer, {
                        infoTemplate: infoTemplate
                    });
                    //Give the layer a title that the user supplied for the Legend
                    layer.title = this._lyrName || layer.name;
                    //change default symbol if desired. Comment this out and the layer will draw with the default symbology
                    this._changeRenderer(layer);
                    fullExtent = fullExtent ? fullExtent.union(layer.fullExtent) : layer.fullExtent;
                    layers.push(layer);
                //}));
                }
                this.map.addLayers(layers);
                this.map.setExtent(fullExtent.expand(1.25), true);

                dom.byId('upload-status').innerHTML = "";
            }

            , _changeRenderer: function (layer) {
                //change the default symbol for the feature collection for polygons and points
                var symbol = null;
                switch (layer.geometryType) {
                    case 'esriGeometryPoint':
                        symbol = new esri.symbol.PictureMarkerSymbol({"angle":0,"xoffset":0,"yoffset":10,"type":"esriPMS","url":"http://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png","imageData":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAADImlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCREZCRkY1M0QzMkMxMUUwQUU5NUVFMEYwMTY0NzUwNSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCREZCRkY1NEQzMkMxMUUwQUU5NUVFMEYwMTY0NzUwNSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkJERkJGRjUxRDMyQzExRTBBRTk1RUUwRjAxNjQ3NTA1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkJERkJGRjUyRDMyQzExRTBBRTk1RUUwRjAxNjQ3NTA1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQg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","contentType":"image/png","width":24,"height":24});
                        break;
                    case 'esriGeometryPolygon':
                        symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new Color([112, 112, 112]), 1), new Color([136, 136, 136, 0.25]));
                        break;
                }
                if (symbol) {
                    layer.setRenderer(new esri.renderer.SimpleRenderer(symbol));
                }
            }
        });
    });