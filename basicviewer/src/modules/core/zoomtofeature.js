/**
Creates a combobox of features and zooms to the user selected one
*/
define(["dojo/_base/declare", "dijit/_WidgetBase", "dojo/_base/lang", "dojo/topic", "./utilities/maphandler", "dijit/layout/ContentPane"
    , "dijit/Menu", "esri/dijit/BasemapGallery", "dijit/registry", "dojo/aspect" /*, "./custommenu"*/
    , "dijit/form/ComboBox", "dojo/store/Memory", "dojo/on", "dojo/dom", "dojo/dom-construct"],
    function (declare, WidgetBase, lang, topic, mapHandler, ContentPane, Menu, BasemapGallery, registry, aspect /*, custommenu*/
        , ComboBox, Memory, on, dom, domConstruct) {
        return declare([WidgetBase, ComboBox], {

            // The ESRI map object to bind to the TOC. Set in constructor
            map: null,
            //The application configuration properties (originated as configOptions from app.js then overridden by AGO if applicable)
            AppConfig: null,

            //*** creates zoom combobox and sets store
            constructor: function (args) {

                var map, queryTask, query, dataStore, tempStore;
                map = mapHandler.map;
		
                var searchField = args.field;
                //querytask to get the features and create the data store
                var queryTask = new esri.tasks.QueryTask(args.service + args.layer);
                query = new esri.tasks.Query();
                query.returnGeometry = false;
                query.outFields = [searchField];
                query.where = "1=1";
                queryTask.execute(query, processArray, errorClbk);

                var dataStore = new Memory();
                var tempStore = new Memory();
						
                //on querytask success add the features
                function processArray(featureSet) {

                    dojo.forEach(featureSet.features, function (feature) {
                        var results = tempStore.query({ name: feature.attributes[searchField] });
                        if (results.length < 1) {
                            tempStore.add({ name: feature.attributes[searchField], id: feature.attributes[searchField], zoom: args.zoomFeature });
                        }
                    });
                    //sorts the temporary store
                    dataStore = tempStore.query({ zoom: args.zoomFeature },
                        { sort: [{ attribute: "name"}] });
                    //sets the data store
                    args.store.data = dataStore;
                };
                //error message if querytask errors
                function errorClbk(errorMsg) {
                    alert(errorMsg);
                };
                //sets the data store, nothing if query hasn't completed
                args.store = dataStore;
                declare.safeMixin(this, args);

                this.map = mapHandler.map;

            }

            , postCreate: function () {
                this.inherited(arguments);
            },

            onChange: function (feature) {

                var map, findTask, findParams, featureExtent;
                map = mapHandler.map;
                //create find task with url to map service
                findTask = new esri.tasks.FindTask(this.params.service);
                //create find parameters and define known values
                findParams = new esri.tasks.FindParameters();
                findParams.returnGeometry = true;
                findParams.outSpatialReference = map.spatialReference;
                findParams.layerIds = [this.params.layer];
                findParams.searchFields = [this.params.field];
                findParams.searchText = feature;
				
                findTask.execute(findParams, showResults);

                function showResults(results) {
				    if (results[0].feature.geometry.getExtent() != "") {
                        var symbol = "";
                        var map = mapHandler.map;
                        map.graphics.clear();
                        //sets the symbology depending on the feature type
                        var geoType = results[0].feature.geometry.type;
                        switch (geoType) {
                            case "polyline":
								symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1);
			                    break;
                            case "polygon":
								symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 255, 0.75]), 3), new dojo.Color([125, 125, 125, 0.20]));
                               	break;
                            case "point":
                                symbol = esri.symbol.PictureMarkerSymbol({
                                    "angle": 0,
                                    "xoffset": 0,
                                    "yoffset": 10,
                                    "type": "esriPMS",
                                    "url": "assets/BluePin1LargeB.png",
                                    "contentType": "image/png",
                                    "width": 24,
                                    "height": 24
                                });
                                break;
                            default:
                        }
						
                        //creates the graphic
                        var graphic = results[0].feature;
						graphic.setSymbol(symbol);
						map.graphics.add(graphic);
						
						//clears the graphic after 3 seconds (3000)
						setTimeout(function(){map.graphics.clear(graphic);
							},3000);
														
										
                        //zooms to the extent,  for zooming to counties, the "else" statement primarily gets the work
                       
                        if (results[0].feature.geometry.type == "point") {
                            var pt = results[0].feature.geometry;
                            map.centerAndZoom(pt, 15);//15
                        }   else {
                            featureExtent = results[0].feature.geometry.getExtent();
			                map.setExtent(featureExtent.expand(1.50)); //.75
                        }
						
						
                    }
                }
            }
        });
    });