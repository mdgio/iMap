/**
 * @name Table of Contents (TOC) widget for ArcGIS Server JavaScript API
 * @author: Stephen Sporik
 * @fileoverview
 * <p>A Data Interoperability widget for ESRI ArcGIS Server JavaScript API. The namespace is <code>interop</code></p>
 * @version 1.06
 */
// change log: 
//2012-12-28  Create widget for Add Shapefile sample.

/*global dojo esri*/
// reference: http://dojotoolkit.org/reference-guide/quickstart/writingWidgets.html
/*esri JSAPI Add Shapefile Sample*/
// reference: http://help.arcgis.com/en/webapi/javascript/arcgis/samples/portal_addshapefile/index.html

dojo.provide("widgets.core.interop.interop");
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require("esri.map");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.dijit.Popup");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");

(function() {
    var link = dojo.create("link", {
        type: "text/css",
        rel: "stylesheet",
        href: dojo.moduleUrl("widgets/core/interop", "css/fileupload.css")
    });
    dojo.doc.getElementsByTagName("AddFile")[0].appendChild(link);
}());



      dojo.addOnLoad(pageReady);
      var map;
      var portalUrl = 'http://www.arcgis.com';

      function pageReady() {
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
        });

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
        }
      }