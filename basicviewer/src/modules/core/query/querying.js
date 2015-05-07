/**
* The Add Data dijit. Loads a JSON object of services and their URLs into a dijit tree. User can then add them to the map. It is setup to allow
* the use of multiple trees of services to be swapped in/out.
* Using dojo/_base/connect to connect to map event fxns. This is deprecated along with dojo.connect, but the seemingly appropriate
* connector (dojo/aspect) does not obtain the proper callback parameters.
*/
define(["dojo/_base/declare", "dijit/_WidgetBase", "dojo/dom", "dojo/json", "dijit/layout/ContentPane", "dojo/data/ItemFileWriteStore", "dojox/grid/DataGrid"
    , "dojox/grid/EnhancedGrid", "dojo/data/ItemFileWriteStore", "dojox/grid/enhanced/plugins/exporter/CSVWriter", "dojox/grid/enhanced/plugins/NestedSorting", "dojox/grid/enhanced/plugins/Selector", "../utilities/maphandler", "dojo/_base/lang", "dijit/registry", "dojo/html", "dojo/dom", "dojo/on", "dijit/form/Button", "esri/request", "dojo/dnd/move"
    , "esri/toolbars/draw", "esri/graphic", "esri/geometry/Multipoint", "esri/geometry/Polygon", "esri/geometry/Polyline", "esri/SpatialReference"
    , "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "dojox/layout/FloatingPane"
    , "jquery", "dojox/widget/Standby", "dojo/dom-construct", "esri/tasks/query", "dojo/_base/connect", "dojo/query", "dojo/_base/array", "dojo/aspect", "../utilities/environment", "dojo/text!./templates/querying.html"],
    function (declare, WidgetBase, dom, json, ContentPane, ItemFileWriteStore, DataGrid, EnhancedGrid, ItemFileWriteStore, CSVWriter, NestedSorting, Selector, mapHandler, lang, registry, html, dom, on, Button, esriRequest, move
        , Draw, Graphic,  Multipoint, Polygon, Polyline, SpatialReference
        , SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, FloatingPane
        , $, Standby, domConstruct, Query, connect, dojoquery, arrayUtil, aspect, environment, template) {
        return declare([WidgetBase, ContentPane], {
            // The template HTML fragment (as a string, created in dojo/text definition above)
            templateString: template
            //*** The ESRI map object
            , map: null
            , toolbar: null
            // Once a tree has been created and before switching to another, store it here to use again later if needed (_switchTree)
            /* an item in the list looks like
             {index: <corresponding to _layersJsonLoc index>, store: <MemoryStore>, model: <ObjectStoreModel>, tree: <dijit/tree>}
             */
            //Available for parent to know if add data contents have been created
            , ContentsCreated: false
            , _paneStandby: null
            //These track the comboboxes on the query tab
            , _layerCbo: null
            , _subCbo: null
            , _fieldsCbo: null
            , _fieldArray: null
            , _resultsGrid: null
            , _identifierVar: null


            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            , constructor: function (args) {
                this.inherited(arguments);
                this.map = mapHandler.map;
                this.toolbar = new Draw(this.map);

                //on end of draw, run the query
                this.toolbar.on("draw-end", lang.hitch(this, this._queryMap));
            }
            //The dojo accordion, which this module inherits from, has been created and is accessible (though not actually shown yet)
            , postCreate: function () {
                //set the template html to the div
                this.containerNode.innerHTML = template;
            }
            //The dojo accordion, which this module inherits from, has been created and is accessible (though not actually shown yet)
            , startup: function () {
                this.inherited(arguments);
                this._paneStandby = new Standby({target: this.id});
                document.body.appendChild(this._paneStandby.domNode);

                //create a results graphics layer and add to the map
                var resultsLayer = new esri.layers.GraphicsLayer({
                    id: "resultsLayer",
                    opacity: 0.60  // also adjustable in _resultsHandler
                });
                this.map.addLayer(resultsLayer);

                //get the layers from the map
                var layers = [];
                var mapServices = [];
                //get the map layers from the map; put into the layers array
                for (var i = 0; i < this.map.layerIds.length; i++) {
                    var mapvariable = this.map.getLayer(this.map.layerIds[i]);
                    if (mapvariable.tileInfo == undefined) {
                        //if from a webmap, should have this title property
                        var layerName = mapvariable.arcgisProps.title;
                        if (layerName == undefined) {
                            layerName = mapvariable.id;
                        }
                        //if not, create a title out of the ID
                        layerName = layerName.replace(/_/g, " ");
                        //push layer id, url, name and type
                        layers.push({
                            id: mapvariable.id,
                            name: layerName,
                            url: mapvariable.url,
                            type: mapvariable.type
                        });
                        mapServices.push(mapvariable.url);
                    }
                    ;
                }
                //get the graphics layers, first compare with mapservices already processed (to weed out popup feature layers)
                for (var j = 0; j < this.map.graphicsLayerIds.length; j++) {
                    var mapvariable = this.map.getLayer(this.map.graphicsLayerIds[j]);
                    // if it's a feature layer and not another graphics layer, and it doesn't match a current layer
                    if (mapvariable.type == "Feature Layer" && mapServices.indexOf(mapvariable.url.replace("/" + mapvariable.layerId, "")) == -1) {
                        //add the layer id, name, url, and type to the array
                        layers.push({
                            id: mapvariable.id,
                            name: mapvariable.name,
                            url: mapvariable.url,
                            type: mapvariable.type
                        });
                    }
                    ;
                }

                //set the global variable to this combo box for later use
                this._layerCbo = dojo.byId('serviceCbo');

                //set the global variable to this combo box for later use
                this._subCbo = dojo.byId('layerCbo');
                //set the global variable to this combo box for later use
                this._fieldCbo = dojo.byId('fieldCbo');

                if (layers.length != 0) {
                    //sets up the services in the map that the user can query off of
                    $('<option />', {
                        text: "Select a service",
                        selected: true,
                        style: "display:none"
                    }).appendTo(this._layerCbo);
                    this._createCobos(this._layerCbo, layers, "name", "url");
                } else {
                    //if no available services to query on, show this to user
                    this._createCobos(this._layerCbo, [{
                        name: "You are unable to query this maps layers",
                        url: "none"
                    }], "name", "url");
                    $('#serviceCbo').prop('disabled', 'disabled');
                }
                //on change of the service, get the layers for that service
                $(this._layerCbo).change(lang.hitch(this, function () {
                    if (this._layerCbo.value) {
                        var layerURL = this._layerCbo.value;
                        var layerEnding = layerURL.substr(layerURL.lastIndexOf("/") + 1);
                        if (layerEnding == "MapServer") {
                            //gets sublayers if mapservice
                            this._getServiceLayers(layerURL);
                        } else if (!isNaN(layerEnding)) {
                            dojo.style("queryChoice", "display", "block");
                            //gets fields if a feature service
                            this._getFields(layerURL);
                        }
                    }
                }));
                //on click of the query button, go to the run query function, standby while running query)
                on(dojo.byId('queryBtn'), "click", lang.hitch(this, function () {
                    this._paneStandby.show();
                    try {
                        this._runQuery();
                        this._paneStandby.hide();
                    } catch (ex) {
                        this._paneStandby.hide();
                        console.log('_queryBtn error: ' + ex.message);
                    }
                }));
                //on change of radio select, show or hide query function types
                on(dojo.byId('stringQ'), "change", lang.hitch(this, function () {
                    this._switchQType();
                }));
                on(dojo.byId('spatialQ'), "change", lang.hitch(this, function () {
                    this._switchQType();
                }));
                //reset the query dropdowns
                on(dojo.byId('clearBtn'), "click", lang.hitch(this, function () {
                    this._clearQuery();
                }));
                //reset the spatial query
                on(dojo.byId('spatialReset'), "click", lang.hitch(this, function () {
                    this._clearQuery();
                }));
                //run the spatial queries by type depending on button clicked
                on(dojo.byId('Circle'), "click", lang.hitch(this, function () {
                    this._spatialQuerying('CIRCLE');
                }));
                on(dojo.byId('Extent'), "click", lang.hitch(this, function () {
                    this._spatialQuerying('EXTENT');
                }));
                on(dojo.byId('Polygon'), "click", lang.hitch(this, function () {
                    this._spatialQuerying('POLYGON');
                }));
                on(dojo.byId('FreehandPolygon'), "click", lang.hitch(this, function () {
                    this._spatialQuerying('FREEHAND_POLYGON');
                }));

            }

            , _switchQType: function () {
                //deactivate the draw tool incase someone selected a type and switched over
                this.toolbar.deactivate();
                //shows or hides spatial vs attribute querying
                var qType = document.getElementsByName("queryType");
                if (qType[0].checked == true) {
                    dojo.style("spatialQueryDiv", "display", "none");
                    dojo.style("stringQueryDiv", "display", "block");
                } else if (qType[1].checked == true) {
                    dojo.style("spatialQueryDiv", "display", "block");
                    dojo.style("stringQueryDiv", "display", "none");
                }

                /* 	This code does not work in IE... 
                 for (var elem in qType) {
                 //if an element is checked:
                 if (qType[elem].checked) {
                 //if string query, then display that div and hide the spatial and vice versa
                 if (qType[elem].value == "stringQuery") {
                 dojo.style("spatialQueryDiv", "display", "none");
                 dojo.style("stringQueryDiv", "display", "block");
                 } else if (qType[elem].value == "spatialQuery") {
                 dojo.style("spatialQueryDiv", "display", "block");
                 dojo.style("stringQueryDiv", "display", "none");
                 }
                 };
                 } */
            }

            , _spatialQuerying: function (type) {
                //setup the type based on the button selected
                var tool = type;
                this.toolbar.activate(Draw[tool]);
                this.map.hideZoomSlider();

            }

            , _queryMap: function (evt) {

                var symbol;
                this.toolbar.deactivate();
                this.map.showZoomSlider();
                var qTaskURL = this._layerCbo.value;
                if (dojo.getStyle('layerDiv', "display") != "none") {
                    qTaskURL += "/" + this._subCbo.value;
                }
                ;
                var queryTask = new esri.tasks.QueryTask(qTaskURL);
                var query = new esri.tasks.Query();
                query.geometry = evt.geometry;
                query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
                query.outFields = ["*"];
                query.returnGeometry = true;
                query.outSpatialReference = this.map.spatialReference;
                queryTask.execute(query, lang.hitch(this, function (results) {
                    this._resultsHandler(results);
                }));
            }
            , _getServiceLayers: function (layerURL) {
                //Show the layer section and disable the change of service
                dojo.style("layerDiv", "display", "block");
                $('#serviceCbo').prop('disabled', 'disabled');
                //empty the comboBox to start
                $('#layerCbo').empty();
                this._jsonGet(layerURL, lang.hitch(this, function (serviceJSON) {

                    var subLayers = [];
                    if (serviceJSON.layers) {
                        $('<option />', {
                            text: "Select a layer",
                            selected: true,
                            style: "display:none"
                        }).appendTo(this._subCbo);
                        for (var j = 0; j < serviceJSON.layers.length; j++) {
                            if (serviceJSON.layers[j].subLayerIds == null) {
                                this._jsonGet(layerURL + "/" + serviceJSON.layers[j].id, lang.hitch(this, function (lyrResp) {
                                    if (lyrResp.type == "Raster Layer") {
                                        $('<option disabled />', {
                                            text: lyrResp.name,
                                            value: lyrResp.id
                                        }).appendTo(this._subCbo);
                                    } else {
                                        $('<option />', {text: lyrResp.name, value: lyrResp.id}).appendTo(this._subCbo);
                                    }
                                }));
                            } else {
                                $('<optgroup />', {label: serviceJSON.layers[j].name}).appendTo(this._subCbo);
                            }

                        }
                        //unbind layer combobox and set change event trigger to get the fields
                        $('#layerCbo').unbind('change');
                        $('#layerCbo').change(lang.hitch(this, function () {
                            dojo.style("queryChoice", "display", "block");
                            this._getFields(layerURL + "/" + this._subCbo.value);
                        }));
                    }
                }));

            }

            , _getFields: function (layerURL) {
                this._switchQType();
                //get the fields for this layer
                this._jsonGet(layerURL, lang.hitch(this, function (layerJSON) {
                    dojo.style("fieldDiv", "display", "block");
                    var fields = [];
                    for (var j = 0; j < layerJSON.fields.length; j++) {
                        if (layerJSON.fields[j].type == "esriFieldTypeString") {
                            fields.push(layerJSON.fields[j]);
                        }
                        ;
                    }
                    ;
                    $('#serviceCbo').prop('disabled', 'disabled');
                    $('#layerCbo').prop('disabled', 'disabled');
                    $('#fieldCbo').empty();
                    $('<option />', {
                        text: "Select a field",
                        selected: true,
                        style: "display:none"
                    }).appendTo(this._fieldCbo);
                    this._createCobos(this._fieldCbo, fields, "name", "name");
                    this._fieldArray = fields;
                    $('#fieldCbo').unbind('change');
                    $('#fieldCbo').change(lang.hitch(this, function () {
                        for (var i = 0; i < this._fieldArray.length; i++) {
                            if (this._fieldArray[i].name == this._fieldCbo.value) {
                                this._addInFieldMath(this._fieldArray[i]);
                            }
                        }
                    }));

                }));
            }

            , _addInFieldMath: function (field) {
                dojo.empty('fieldMath');
                var eqlabel = dojo.create('p', {innerHTML: "Type in a value to match possible values in the field that you selected above.  For example, if the field is &quot;City&quot;, you might type in &quot;Annapolis&quot; or even &quot;anna&quot;."});  //innerHTML: "="
                dojo.place(eqlabel, "fieldMath", "last");
                var intText = dojo.create('input', {id: "fieldValue"});
                dojo.place(intText, "fieldMath", "last");
                dojo.removeClass("queryBtn", "btnSelected");
                //                if (field.type == "esriFieldTypeInteger") {
                //                    alert('integer');
                //                } else if (field.type == "esriFieldTypeString") {
                //                    alert('string');
                //                }
            }

            , _runQuery: function () {
                if (dojo.getStyle('fieldDiv', "display") == "none") {
                    alert('Must select valid layer and field to continue');
                } else if (this._fieldCbo.value == "null") {
                    alert('Must select valid field to continue');
                } else {
                    var qTaskURL = this._layerCbo.value;
                    if (dojo.getStyle('layerDiv', "display") != "none") {
                        qTaskURL += "/" + this._subCbo.value;
                    }
                    ;
                    var queryTask = new esri.tasks.QueryTask(qTaskURL);
                    var query = new esri.tasks.Query();
                    //use this query for the user to find values based on exact input
                    //query.where = this._fieldCbo.value + " = '" + dojo.byId('fieldValue').value + "'";
                    //uset this query for the user to find values based on exact or similar input --very useful
                    //query.where = this._fieldCbo.value.toUpperCase() + " like '%" + dojo.byId('fieldValue').value.toUpperCase() + "%'";
                    query.where = "UPPER(\"" + this._fieldCbo.value + "\")" + " like \'%" + dojo.byId('fieldValue').value.toUpperCase() + "%\'";
                    //query.where = this._fieldCbo.value + " like '%" + dojo.byId('fieldValue').value + "%'";
                    query.outFields = ["*"];
                    query.returnGeometry = true;
                    query.outSpatialReference = this.map.spatialReference;
                    queryTask.execute(query, lang.hitch(this, function (results) {
                        this._resultsHandler(results);
                    }));
                }
            }

            , _resultsHandler: function (results) {
                // color, opacity and size of symbols for selected results
                var resultsLayer = this.map.getLayer('resultsLayer');
                resultsLayer.clear();
                if (results.features.length > 0) {
                    var symbol = null;
                    switch (results.geometryType) {
                        case "esriGeometryPoint":
                            symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 30, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([255, 0, 128, 0.50])); //original 0,255,0,0.25
                            break;
                        case "esriGeometryPolyline":
                            symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 2);
                            break;
                        case "esriGeometryPolygon":
                            symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 3), new dojo.Color([255, 255, 0, 0.50]));
                            break;
                    }


                    if ((symbol != null) && (!dijit.byId('grid'))) {
                        for (var i = 0; i < results.features.length; i++) {
                            var graphic = new Graphic(results.features[i].geometry, symbol, results.features[i].attributes);
                            resultsLayer.add(graphic);
                        }
                        var layout = [];
                        this._identifierVar = results.objectIdFieldName;
                        /*set up layout*/
                        //set first column to magnifying glass icon
                        layout.push({'name': "Zoom To", 'field': "", 'formatter': lang.hitch(this, "_renderCell"), 'sort': false});


                        for (var j = 0; j < results.fields.length; j++) {
                            if (results.fields[j].type == "esriFieldTypeOID") {
                                this._identifierVar = results.fields[j].name;
                            } else if (results.fields[j].name.indexOf("shape") == -1) {
                                layout.push({'name': results.fields[j].alias, 'field': results.fields[j].name, 'width': results.fields[j].alias.length*8 + "px"});
                            }

                        }
                        var items = dojo.map(results.features, function (feature) {
                            return feature.attributes;
                        });
                        var data = {
                            identifier: this._identifierVar,
                            items: items
                        };
                        var store = new ItemFileWriteStore({data: data});

                        /*create a new grid*/

                        //var grid = new DataGrid({
                        this._resultsGrid = new EnhancedGrid({
                            id: 'grid',
                            store: store,
                            structure: layout,
                            autoHeight: true,
                            autoWidth: true,
                            rowSelector: '20px',  //width of the row selector at the beginning of a row
                            canSort: function(colIndex){
                                return colIndex != 0;
                            },
                            plugins: {
                                exporter: true,
                                nestedSorting: true,
                                selector: {
                                    row: true,
                                    cell: false,
                                    col: false
                                }
                            }
                        });

                        //for exporting all rows of query results
                        function exportAll() {
                            dijit.byId("grid").exportGrid("csv", function (str) {
                                /* dojo.xhrPost({
                                 url: 'csv.ashx',
                                 load: function(tempUrl) {
                                 window.open(tempUrl, "_new");
                                 }
                                 });
                                 });
                                 };	 */
                                dojo.byId("output").value = str;
                            });
                        };

                        //for exporting user selected rows of query results
                        function exportSelected() {
                            var str = dijit.byId("grid").exportSelected("csv");
                            dojo.byId("output").value = str;
                        };

                        var t = setTimeout(lang.hitch(this, function () {
                            dojoquery('.displayRowCount')[0].innerHTML = this._resultsGrid.rowCount;
                        }, 500));


                        domConstruct.create('div', {id: "floatingPane"}, 'map');
                        domConstruct.create('div', {id: "subContainer"}, "floatingPane");
                        domConstruct.create('div', {
                            id: "rowCountContainer",
                            innerHTML: "Number of Features: <span class='displayRowCount'></span><br />"
                        }, "subContainer");
                        // This hidden area is needed for "output" before the CSV file could be downloaded
                        var exContainer = domConstruct.create('div', {
                            id: "exportInfoContainer",
                            innerHTML: "<textarea type='hidden' id='output' style='display:none;'>stuff</textarea>"
                        }, "subContainer");


                        var exBtnAll = domConstruct.create('button', {
                            id: 'exportButton',
                            innerHTML: "Export All Rows to CSV"
                        });
                        domConstruct.place(exBtnAll, exContainer, "first");

                        on(exBtnAll, "click", function () {
                            dijit.byId("grid").exportGrid("csv", function (str) {
                                dojo.byId("output").value = str;

                                /*  The "url variable gets the full path within the exact website.
                                 For instance, if the website is "MyWebsite" and the csv.ashx file is in "source" and then "modules"
                                 the url would be "source/modules/csv.ashx

                                 Also note "web.config" file would be under "MyWebsite"
                                 */
                                var url = "src/modules/core/query/csv.ashx";

                                var HiddenForm = domConstruct.create('form', {
                                    id: "downloadform", innerHTML: "<method='post' action='' " +
                                    "style='height: 0px; width: 0px; display: none;' " +
                                    "class='dlform' target='_blank'> " +
                                    "<input type='hidden' name='report' class='ri' id='reportinput' value='' /> " +
                                    "<input type='hidden' name='filename' class='fn' id='filename' value='' />"
                                });		// +

                                domConstruct.place(HiddenForm, subContainer, "last");
                                var f = dojo.byId("downloadform");
                                f.action = url;
                                dojo.byId("reportinput").value = str;
                                f.submit();

                                // This code works with HTML5 and only in Chrome for downloading file
                                //console.log(str);
                                //var encodedUri = encodeURI(str);
                                //alert(str); // for testing
                                //var download = document.createElement('a');
                                //download.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(str));
                                //download.setAttribute('download', 'iMap_Results.csv');

                                //download.click();  // This will download the data file named "iMap_Results.csv".
                            });
                        });


                        var ConstrainedFloatingPane = dojo.declare(dojox.layout.FloatingPane, {
                            postCreate: function () {
                                this.inherited(arguments);
                                this.moveable = new dojo.dnd.move.constrainedMoveable(
                                    this.domNode, {
                                        handle: this.focusNode,
                                        constraints: function () {
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
                            title: 'Results',  //'Data Interoperability',
                            parentModule: this,
                            resizable: true,
                            dockable: false,
                            closable: true,
                            style: "position:absolute;top:25%;left:-25%;width:600px;height:300px;visibility:hidden;z-index:100",
                            id: "floatingPane"
                        }, dom.byId("floatingPane"));

                        this._resultsGrid.placeAt("subContainer");
                        this._resultsGrid.resize();
                        this._resultsGrid.update();
                        this._resultsGrid.startup();

                        fpI.startup();
                        fpI.show();

                        //Grid does not draw correctly on first show of floating pane, call resize after pane is open to make sure grid fits its container correctly.
                        //Must add click event to icon AFTER the resize event, or the handle to the click event is lost.
                        var ti = setTimeout(lang.hitch(this, function(){
                            this._resultsGrid.resize();
                            //Use dojo/query to set a click event for all elements in the class "zoomImg",  this enables using dojo/on for all elements at once.
                            //this must be done AFTER the grid is rendered with results and the zoom icons exist in the DOM.
                            dojoquery(".zoomImg").on("click", lang.hitch(this, function(e) {
                                this._zoomToFeature(e);
                            }));
                        }), 100);

                    }	// end if (symbol != null)

                } else {
                    alert('No values found');
                }

            }  // end _resultsHandler:

            , _clearQuery: function () {
                //enable the comboboxes again
                $('#serviceCbo').prop('disabled', false);
                $('#layerCbo').prop('disabled', false);
                //hide the sublayer and field divs if visible
                dojo.style("layerDiv", "display", "none");
                dojo.style("queryChoice", "display", "none");
                dojo.style("fieldDiv", "display", "none");
                dojo.style("stringQueryDiv", "display", "none");
                dojo.style("spatialQueryDiv", "display", "none");
                dojo.byId('fieldValue').value = "";
                //reset the service list to select
                $('#serviceCbo').val('0');
                $('#serviceCbo').prop('selectedIndex', 0);
                //clear out the results layer
                var resultsLayer = this.map.getLayer('resultsLayer');
                resultsLayer.clear();
                //get the dgrid container and empty it, and recreate the grid container for use
                //also get rid of floatingPane
                if (dijit.byId('grid')) {
                    dijit.byId('grid').destroyRecursive();
                    dijit.byId('floatingPane').destroy();
                }
                ;
            }

            //utilities
            , _jsonGet: function (theUrl, callback) {
                //using esri request for more consistent results
                //calls the url passed in and then passes back results to callback function
                return layersRequest = esriRequest({
                    url: theUrl,
                    content: {f: "json"},
                    handleAs: "json",
                    load: callback,
                    callbackParamName: "callback"
                });
            }

            , _createCobos: function (cboBox, cboArray, attTxt, attVal) {
                for (var i = 0; i < cboArray.length; i++) {
                    var cboObj = cboArray[i];
                    $('<option />', {
                        text: cboObj[attTxt],
                        value: cboObj[attVal]
                    }).appendTo(cboBox);
                }
            }

            , _renderCell: function () {
                var img = "<img src = 'assets/zoom.png' class='zoomImg' style='cursor: pointer'/>";
                return img;
            }

            , _zoomToFeature: function (item) {
                //get graphic results layer
                var graphicsLayer = this.map.getLayer("resultsLayer");
                //get selected row
                var rows = this._resultsGrid.selection.getSelected("row");
                //query layer for OID
                var graphics = [];
                for (i = 0; i < graphicsLayer.graphics.length; i++) {
                    var graphicAttr = graphicsLayer.graphics[i].attributes;
                    if (graphicAttr) {
                        var fieldname = this._identifierVar
                        if (graphicAttr[fieldname][0] == rows[0][fieldname][0]) {
                            graphics.push(graphicsLayer.graphics[i]);
                        }
                    }
                }

                var compressedGraphics = this._compressGraphics(graphics);

                //flash Graphic

                //zoom to graphic
                if (compressedGraphics.length > 0) {
                    var graphic = compressedGraphics[0];
                    if (graphic) {
                        this.map.centerAt(graphic.getExtent().getCenter());
                        this.map.setExtent(graphic.getExtent());
                    }
                }
            }

            , _compressGraphics: function(graphics){
                var result = [];
                var pMultipoint = new Multipoint(new SpatialReference({wkid: 102100}));
                var pPolyline = new Polyline(new SpatialReference({wkid: 102100}));
                var pPolygon = new Polygon(new SpatialReference({wkid: 102100}));
                arrayUtil.forEach(graphics, function(graphic){
                    switch (graphic.geometry.type){
                        case "point":
                            pMultipoint.addPoint(graphic.geometry);
                            break;
                        case "polyline":
                            //loop through paths, add paths
                            for (i = 0; i < graphic.geometry.paths.length; i++){
                                pPolyline.addPath(graphic.geometry.paths[i]);
                            }
                            break;
                        case "polygon":
                            //loop through rings, add rings
                            for (i = 0; i < graphic.geometry.rings.length; i++){
                                pPolygon.addRing(graphic.geometry.rings[i]);
                            }
                            break;
                    }
                });
                if (pMultipoint.points.length != 0){
                    result.push(pMultipoint);
                }
                if (pPolyline.paths.length != 0){
                    result.push(pPolyline);
                }
                if (pPolygon.rings.length != 0){
                    result.push(pPolygon);
                }

                return result;
            }
        })
    });
