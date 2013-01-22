// widgets.core.toc
define(["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dijit/registry", "dojo/ready", "dojo/parser",
	"dojo/text!./templates/interop.html", "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang"],
    function(declare, domConstruct, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, dojoOn, dojoRegistry, ready, parser, template, domsty, fxer, language){
        //return declare([WidgetBase, TemplatedMixin], {
        return declare("widgets/core/interop/interop", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin],{
        //declare([WidgetBase, TemplatedMixin], {

            // The template HTML fragment (as a string, created in dojo/text definition above)
			templateString: template,
			// The CSS class to be applied to the root node in our template
			/*baseClass: "interop",*/
			//Floater
			floaterDiv: null,
			//Floater child
			innerDiv: null,
            // During the resize event, tell if the jquery accordion has been created yet
            //tocHasBeenAccordioned: false,
            //id: null,
            //URL for portal 
            portalUrl: 'http://www.arcgis.com',
            // The ESRI map object to bind to the TOC
            map: null,
            // The table of contents dijit
            _floatingPane: null,
            //_dijitToc: null,

            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            constructor: function(args) {
                //this.inherited(arguments);
                declare.safeMixin(this,args);
                //create Floating Pane to house the layout UI of the widget.
  				var fpI = new dojox.layout.FloatingPane({
	 				title: 'Data Interoperability',
	 				resizable: false,
	 				dockable: false,
	 				closable: false,
	 				style: "position:absolute;top:0;left:50px;width:245px;height:265px;z-index:100;visibility:hidden;",
	 				id: 'floaterIO'
			    }, dojo.byId(this.floaterDiv));
  				fpI.startup();
  				//Create a title bar for Floating Pane
  				var titlePane = dojo.query('#floaterIO .dojoxFloatingPaneTitle')[0];
  				//Add close button to title pane
  				var closeDiv = dojo.create('div', {
    				id: "closeBtn",
    				innerHTML: esri.substitute({
      				close_title: i18n.panel.close.title,
      				close_alt: i18n.panel.close.label
    				}, '<a alt=${close_alt} title=${close_title} href="JavaScript:toggleInterop();"><img  src="../toc/images/close.png"/></a>')
  				}, titlePane);
  				//Set the content of the Floating Pane to the template HTML.
 				 dojo.byId(this.innerDiv).innerHTML = template;
 				
            },

            postMixInProperties: function() {
                this.inherited(arguments);
            },

            buildRendering: function () {
                this.inherited(arguments);
            },

            postCreate: function () {
                //this.inherited(arguments);


            },

            startup: function () {
                //this.inherited(arguments);
                        esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";
        				dojo.connect(dojo.byId("uploadForm").data, "onchange", function(evt){
        					listening(evt);
        				});

            },

            /*resize: function () {
                this.inherited(arguments);
            },*/
           

        });
			function listening(evt){
				        var fileName = evt.target.value.toLowerCase();
          				if (dojo.isIE) { //filename is full path in IE so extract the file name
            			var arr = fileName.split("\\");
            			fileName = arr[arr.length - 1];
          				}
          				if (fileName.indexOf(".zip") !== -1) {//is file a zip - if not notify user 
            				generateFeatureCollection(fileName);
          				}else{
            				dojo.byId('upload-status').innerHTML = '<p style="color:red">Add shapefile as .zip file</p>';
         				}
			}
			
			 function generateFeatureCollection(fileName) {
       
        var name = fileName.split(".");
        //Chrome and IE add c:\fakepath to the value - we need to remove it
        //See this link for more info: http://davidwalsh.name/fakepath
        name = name[0].replace("c:\\fakepath\\","");
        
        dojo.byId('upload-status').innerHTML = '<b>Loading… </b>' + name; 
        
        //Define the input params for generate see the rest doc for details
        //http://www.arcgis.com/apidocs/rest/index.html?generate.html
        var params = {
          'name': name,
          'targetSR': map.spatialReference,
          'maxRecordCount': 1000,
          'enforceInputFileSizeLimit': true,
          'enforceOutputJsonSizeLimit': true
        };

        //generalize features for display Here we generalize at 1:40,000 which is approx 10 meters 
        //This should work well when using web mercator.  
        var extent = esri.geometry.getExtentForScale(map,40000); 
        var resolution = extent.getWidth() / map.width;
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
              errorHandler(response.error);
              return;
            }
            dojo.byId('upload-status').innerHTML = '<b>Loaded: </b>' + response.featureCollection.layers[0].layerDefinition.name;
            addShapefileToMap(response.featureCollection);
          }),
          error: dojo.hitch(this, errorHandler)
        });

      }

      function errorHandler(error) {
        dojo.byId('upload-status').innerHTML = "<p style='color:red'>" + error.message + "</p>";
      }

      function addShapefileToMap(featureCollection) {
        //add the shapefile to the map and zoom to the feature collection extent
        //If you want to persist the feature collection when you reload browser you could store the collection in 
        //local storage by serializing the layer using featureLayer.toJson()  see the 'Feature Collection in Local Storage' sample
        //for an example of how to work with local storage. 
        var fullExtent;
        var layers = [];

        dojo.forEach(featureCollection.layers, function (layer) {
          var infoTemplate = new esri.InfoTemplate("Details", "${*}");
          var layer = new esri.layers.FeatureLayer(layer, {
            infoTemplate: infoTemplate
          });
          //associate the feature with the popup on click to enable highlight and zoomto
          dojo.connect(layer,'onClick',function(evt){
            map.infoWindow.setFeatures([evt.graphic]);
          });
          //change default symbol if desired. Comment this out and the layer will draw with the default symbology
          changeRenderer(layer);
          fullExtent = fullExtent ? fullExtent.union(layer.fullExtent) : layer.fullExtent;
          layers.push(layer);
        });
        map.addLayers(layers);
        map.setExtent(fullExtent.expand(1.25), true);
        
        dojo.byId('upload-status').innerHTML = "";


      }

      function changeRenderer(layer) {
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

	  /*function() {
        esri.config.defaults.io.proxyUrl = "/arcgisserver/apis/javascript/proxy/proxy.ashx";
        dojo.connect(dojo.byId("uploadForm").data, "onchange", function (evt) {
          var fileName = evt.target.value.toLowerCase();
          if (dojo.isIE) { //filename is full path in IE so extract the file name
            var arr = fileName.split("\\");
            fileName = arr[arr.length - 1];
          }
          if (fileName.indexOf(".zip") !== -1) {//is file a zip - if not notify user 
            generateFeatureCollection(fileName);
          }else{
            dojo.byId('upload-status').innerHTML = '<p style="color:red">Add shapefile as .zip file</p>';
         }
        };

      function generateFeatureCollection(fileName) {
       
        var name = fileName.split(".");
        //Chrome and IE add c:\fakepath to the value - we need to remove it
        //See this link for more info: http://davidwalsh.name/fakepath
        name = name[0].replace("c:\\fakepath\\","");
        
        dojo.byId('upload-status').innerHTML = '<b>Loading… </b>' + name; 
        
        //Define the input params for generate see the rest doc for details
        //http://www.arcgis.com/apidocs/rest/index.html?generate.html
        var params = {
          'name': name,
          'targetSR': map.spatialReference,
          'maxRecordCount': 1000,
          'enforceInputFileSizeLimit': true,
          'enforceOutputJsonSizeLimit': true
        };

        //generalize features for display Here we generalize at 1:40,000 which is approx 10 meters 
        //This should work well when using web mercator.  
        var extent = esri.geometry.getExtentForScale(map,40000); 
        var resolution = extent.getWidth() / map.width;
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
          url: portalUrl + '/sharing/rest/content/features/generate',
          content: myContent,
          form: dojo.byId('uploadForm'),
          handleAs: 'json',
          load: dojo.hitch(this, function (response) {
            if (response.error) {
              errorHandler(response.error);
              return;
            }
            dojo.byId('upload-status').innerHTML = '<b>Loaded: </b>' + response.featureCollection.layers[0].layerDefinition.name;
            addShapefileToMap(response.featureCollection);
          }),
          error: dojo.hitch(this, errorHandler)
        });

      }

      function errorHandler(error) {
        dojo.byId('upload-status').innerHTML = "<p style='color:red'>" + error.message + "</p>";
      }

      function addShapefileToMap(featureCollection) {
        //add the shapefile to the map and zoom to the feature collection extent
        //If you want to persist the feature collection when you reload browser you could store the collection in 
        //local storage by serializing the layer using featureLayer.toJson()  see the 'Feature Collection in Local Storage' sample
        //for an example of how to work with local storage. 
        var fullExtent;
        var layers = [];

        dojo.forEach(featureCollection.layers, function (layer) {
          var infoTemplate = new esri.InfoTemplate("Details", "${*}");
          var layer = new esri.layers.FeatureLayer(layer, {
            infoTemplate: infoTemplate
          });
          //associate the feature with the popup on click to enable highlight and zoomto
          dojo.connect(layer,'onClick',function(evt){
            map.infoWindow.setFeatures([evt.graphic]);
          });
          //change default symbol if desired. Comment this out and the layer will draw with the default symbology
          changeRenderer(layer);
          fullExtent = fullExtent ? fullExtent.union(layer.fullExtent) : layer.fullExtent;
          layers.push(layer);
        });
        map.addLayers(layers);
        map.setExtent(fullExtent.expand(1.25), true);
        
        dojo.byId('upload-status').innerHTML = "";


      }

      function changeRenderer(layer) {
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
        });*/