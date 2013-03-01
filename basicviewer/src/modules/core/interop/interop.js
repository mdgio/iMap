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
    , "dojo/dom", "dojox/layout/FloatingPane", "dojo/query", "../utilities/maphandler", "dojo/has", "dojo/json", "dojo/_base/Color"
    , "xstyle/css!./css/interop.css"],
    function(declare, aspect, domConstruct, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, on, registry, ready, parser, template, fxer, lang
                , dom, floatingPane, query, mapHandler, has, JSON, Color){
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
            panelTitle: 'Data Interoperability',

            //Custom property for this module, don't necessarily need in yours
            //URL for portal
            portalUrl: 'http://www.arcgis.com',

            //*** Creates the floating pane. Should be included in your module and be re-usable without modification (if using floating pane)
            constructor: function(args) {
                // safeMixin automatically sets the properties above that are passed in from the toolmanager.js
                declare.safeMixin(this,args);
                this.innerDivId = this.floaterDivId + 'inner';
                // mapHandler is a singleton object that you can require above and use to get a reference to the map.
                this.map = mapHandler.map;
                //Create the div containers for the floating pane as a child of the map's div
                domConstruct.create('div', { id: this.floaterDivId }, 'map');
                domConstruct.create('div', { id: this.innerDivId }, this.floaterDivId);

                //Create Floating Pane to house the layout UI of the widget. The parentModule property is created to obtain a reference to this module in close button click.
  				var fpI = new floatingPane({
	 				title: 'Data Interoperability',
                    parentModule: this,
	 				resizable: false,
	 				dockable: false,
	 				closable: false,
	 				style: "position:absolute;top:0;left:50px;width:245px;height:265px;z-index:100;visibility:hidden;",
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
                var fileName = evt.target.value.toLowerCase();
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
                    //associate the feature with the popup on click to enable highlight and zoomto
                    //connect.connect(layer, 'onClick', lang.hitch(this, function(evt){
                    /*aspect.after(layer, 'onClick', lang.hitch(this, function(evt){
                        if (evt)
                            this.map.infoWindow.setFeatures([evt.graphic]);
                    }));*/
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
                        symbol = new esri.symbol.PictureMarkerSymbol({
                            'angle':0,
                            'xoffset':0,
                            'yoffset':0,
                            'type':'esriPMS',
                            'url':'http://static.arcgis.com/images/Symbols/Shapes/BluePin1LargeB.png',
                            'contentType':'image/png',
                            'width':20,
                            'height':20
                        });
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