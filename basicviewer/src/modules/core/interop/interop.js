// widgets.core.toc
define(["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dijit/registry", "dojo/ready", "dojo/parser",
	"dojo/text!./templates/interop.html", "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang"
    , "dojo/dom", "dojox/layout/FloatingPane", "dojo/query", "../utilities/maphandler", "dojo/has"],
    function(declare, domConstruct, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, on, dojoRegistry, ready, parser, template, domsty, fxer, lang
                , dom, floatingPane, query, mapHandler, has){
        return declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin],{
            // The template HTML fragment (as a string, created in dojo/text definition above)
			templateString: template,
			// The CSS class to be applied to the root node in our template
			/*baseClass: "interop",*/
			//Floater
			floaterDiv: null,
			//Floater child
			innerDiv: null,
            //URL for portal 
            portalUrl: 'http://www.arcgis.com',
            // The ESRI map object to bind to the TOC
            map: null,
            // The table of contents dijit
            _floatingPane: null,

            constructor: function(args) {
                // This automatically sets the properties above that are passed in from the
                declare.safeMixin(this,args);
                this.map = mapHandler.map;
                //create Floating Pane to house the layout UI of the widget.
  				var fpI = new floatingPane({
	 				title: 'Data Interoperability',
	 				resizable: false,
	 				dockable: false,
	 				closable: false,
	 				style: "position:absolute;top:0;left:50px;width:245px;height:265px;z-index:100;visibility:hidden;",
	 				id: 'floaterIO'
			    }, dom.byId(this.floaterDiv));
  				fpI.startup();
  				//Create a title bar for Floating Pane
  				var titlePane = query('#floaterIO .dojoxFloatingPaneTitle')[0];
  				//Add close button to title pane
  				var closeDiv = domConstruct.create('div', {
    				id: "closeBtn",
    				innerHTML: esri.substitute({
      				close_title: 'Close Data', //i18n.panel.close.title,
      				close_alt: 'Close Data'//i18n.panel.close.label
    				}, '<a alt=${close_alt} title=${close_title} href="JavaScript:dijit.registery.byId(\'dataDijit\').toggleInterop();"><img  src="assets/close.png"/></a>')
  				}, titlePane);
  				//Set the content of the Floating Pane to the template HTML.
 				dom.byId(this.innerDiv).innerHTML = template;
            }

            , startup: function () {
                //esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";
                //var uploadForm = dom.byId("uploadForm");
                var uploadForm = dom.byId('inFile');
                //on(uploadForm.data, "onchange", lang.hitch(this, function(evt){
                on(uploadForm, "onsubmit", lang.hitch(this, function(evt){
                    this._listening(evt);
                }));
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
                    'publishParameters': dojo.toJson(params),
                    'f': 'json',
                    'callback.html': 'textarea'
                };

                //use the rest generate operation to generate a feature collection from the zipped shapefile
                esri.request({
                    url: 'http://www.arcgis.com' + '/sharing/rest/content/features/generate',
                    content: myContent,
                    form: dojo.byId('uploadForm'),
                    handleAs: 'json',
                    load: dojo.hitch(this, function (response) {
                        if (response.error) {
                            this._errorHandler(response.error);
                            return;
                        }
                        dojo.byId('upload-status').innerHTML = '<b>Loaded: </b>' + response.featureCollection.layers[0].layerDefinition.name;
                        this._addShapefileToMap(response.featureCollection);
                    }),
                    error: dojo.hitch(this, this._errorHandler)
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

                dojo.forEach(featureCollection.layers, lang.hitch(this, function (layer) {
                    var infoTemplate = new esri.InfoTemplate("Details", "${*}");
                    var layer = new esri.layers.FeatureLayer(layer, {
                        infoTemplate: infoTemplate
                    });
                    //associate the feature with the popup on click to enable highlight and zoomto
                    on(layer,'onClick', lang.hitch(this, function(evt){
                        this.map.infoWindow.setFeatures([evt.graphic]);
                    }));
                    //change default symbol if desired. Comment this out and the layer will draw with the default symbology
                    this._changeRenderer(layer);
                    fullExtent = fullExtent ? fullExtent.union(layer.fullExtent) : layer.fullExtent;
                    layers.push(layer);
                }));
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
                        symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([112, 112, 112]), 1), new dojo.Color([136, 136, 136, 0.25]));
                        break;
                }
                if (symbol) {
                    layer.setRenderer(new esri.renderer.SimpleRenderer(symbol));
                }
            }
        });
    });