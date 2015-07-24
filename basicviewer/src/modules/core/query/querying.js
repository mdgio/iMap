/**
* The Add Data dijit. Loads a JSON object of services and their URLs into a dijit tree. User can then add them to the map. It is setup to allow
* the use of multiple trees of services to be swapped in/out.
* Using dojo/_base/connect to connect to map event fxns. This is deprecated along with dojo.connect, but the seemingly appropriate
* connector (dojo/aspect) does not obtain the proper callback parameters.
*/
define(["dojo/_base/declare", "dijit/_WidgetBase", "dojo/dom", "dojo/json", "dijit/layout/ContentPane", "dojo/data/ItemFileWriteStore", "dojox/grid/DataGrid"
    , "dgrid/OnDemandGrid", "dgrid/Selection", "dojo/store/Memory", "dojo/query", "dojo/dom-class", "dojo/_base/array"
    , "dojox/grid/EnhancedGrid", "dojo/data/ItemFileWriteStore", "dojox/grid/enhanced/plugins/exporter/CSVWriter", "dojox/grid/enhanced/plugins/NestedSorting"
    , "dojox/grid/enhanced/plugins/Selector", "../utilities/maphandler", "dojo/_base/lang", "dijit/registry", "dojo/html", "dojo/dom", "dojo/on", "dijit/form/Button", "esri/request", "dojo/dnd/move"
    , "esri/toolbars/draw", "esri/graphic", "esri/geometry/Multipoint", "esri/geometry/Polygon", "esri/geometry/Polyline", "esri/SpatialReference", "dojox/widget/Standby"
    , "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "dojox/layout/FloatingPane", "dijit/layout/TabContainer"
    , "jquery", "dojo/dom-construct", "dojo/dom-style", "esri/tasks/query", "dojo/_base/connect", "dojo/query", "dojo/_base/array", "dojo/aspect", "../utilities/environment", "dojo/text!./templates/querying.html"],
    function (declare, WidgetBase, dom, json, ContentPane, ItemFileWriteStore, DataGrid
        , Grid, Selection, Memory, djquery, domClass, array
        , EnhancedGrid, ItemFileWriteStore, CSVWriter, NestedSorting
        , Selector, mapHandler, lang, registry, html, dom, on, Button, esriRequest, move
        , Draw, Graphic, Multipoint, Polygon, Polyline, SpatialReference, Standby
        , SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, FloatingPane, TabContainer
        , $, domConstruct, domStyle, Query, connect, dojoquery, arrayUtil, aspect, environment, template) {
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

                //on attribute window maximize, set to full height and hide button and show minimize
                on(dom.byId("attributeMaximize"), "click", lang.hitch(this, function (evt) {
                    this._resizeFooter('max');
                }));
                //on attribute window minimize, set to 25% and hide button and show maximize
                on(dom.byId("attributeMinimize"), "click", lang.hitch(this, function (evt) {
                    this._resizeFooter('min');
                }));
                //hide the attribute window on close
                on(dom.byId("attributeClose"), "click", lang.hitch(this, function (evt) {
                    this._resizeFooter('close');
                }));

                on(this.map, "layer-add", lang.hitch(this, function () {
                    this._resetLayerOptions();
                }));
                on(this.map, "layer-remove", lang.hitch(this, function () {
                    this._resetLayerOptions();
                }));
            }
            //The dojo accordion, which this module inherits from, has been created and is accessible (though not actually shown yet)
            , startup: function () {
                this.inherited(arguments);
                this._paneStandby = new Standby({ target: "queryingPane" });
                document.body.appendChild(this._paneStandby.domNode);

                //create a results graphics layer and add to the map
                var resultsLayer = new esri.layers.GraphicsLayer({
                    id: "resultsLayer",
                    opacity: 0.60  // also adjustable in _resultsHandler
                });
                this.map.addLayer(resultsLayer);

                this._paneStandby.show();

                //set the global variable to this combo box for later use
                this._layerCbo = dojo.byId('serviceCbo');
                //set the global variable to this combo box for later use
                this._subCbo = dojo.byId('layerCbo');
                //set the global variable to this combo box for later use
                this._fieldCbo = dojo.byId('fieldCbo');

                this._resetLayerOptions();

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

                this._paneStandby.hide();

            }

            , _resetLayerOptions: function () {
                //get the layers from the map
                var layers = [];
                var mapServices = [];

                domConstruct.empty("serviceCbo");
                //get the map layers from the map; put into the layers array
                for (var i = 0; i < this.map.layerIds.length; i++) {
                    var mapvariable = this.map.getLayer(this.map.layerIds[i]);
                    if (mapvariable.tileInfo == undefined) {
                        //if from a webmap, should have this title property
                        var layerName = undefined;
                        if (mapvariable.arcgisProps) {
                            layerName = mapvariable.arcgisProps.title;

                        } else if (mapvariable.title) {
                            layerName = mapvariable.title;
                        }

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
                    };
                }
                //get the graphics layers, first compare with mapservices already processed (to weed out popup feature layers)
                for (var j = 0; j < this.map.graphicsLayerIds.length; j++) {
                    var mapvariable = this.map.getLayer(this.map.graphicsLayerIds[j]);
                    var checkStr = mapvariable.id;
                    if (checkStr.indexOf('_') && this.map.layerIds.indexOf(checkStr.substring(0, checkStr.lastIndexOf('_'))) == -1) {
                        // if it's a feature layer and not another graphics layer, and it doesn't match a current layer
                        if (mapvariable.type == "Feature Layer" && mapServices.indexOf(mapvariable.url.replace("/" + mapvariable.layerId, "")) == -1) {
                            //add the layer id, name, url, and type to the array
                            layers.push({
                                id: mapvariable.id,
                                name: mapvariable.name,
                                url: mapvariable.url,
                                type: mapvariable.type
                            });
                        };
                    };
                }

                if (layers.length != 0) {
                    //sets up the services in the map that the user can query off of
                    $('<option />', {
                        text: "Select a service",
                        selected: true,
                        style: "display:none"
                    }).appendTo(this._layerCbo);
                    this._createCobos(this._layerCbo, layers, "name", "url");
                    this._clearQuery();
                    $('#serviceCbo').prop('disabled', false);
                } else {
                    //if no available services to query on, show this to user
                    this._createCobos(this._layerCbo, [{
                        name: "You are unable to query this maps layers",
                        url: "none"
                    }], "name", "url");
                    $('#serviceCbo').prop('disabled', 'disabled');
                }
            }

            , _switchQType: function () {
                //deactivate the draw tool incase someone selected a type and switched over
                this.toolbar.deactivate();
                //shows or hides spatial vs attribute querying
                var qType = document.getElementsByName("queryType");
                if (qType[0].checked == true) {
                    dojo.style("spatialQueryDiv", "display", "none");
                    dojo.style("stringQueryDiv", "display", "block");
                    dojo.style("queryBtn", "display", "inline");
                } else if (qType[1].checked == true) {
                    dojo.style("spatialQueryDiv", "display", "block");
                    dojo.style("stringQueryDiv", "display", "none");
                    dojo.style("queryBtn", "display", "none");
                }
            }

            , _spatialQuerying: function (type) {

                //if (!domClass.contains("spatialQueryDiv", "disabled")) {
                var tool = type;
                //setup the type based on the button selected
                this.toolbar.activate(Draw[tool]);
                this.map.hideZoomSlider();
                mapHandler.DisableMapPopups();
                //}
            }

            , _queryMap: function (evt) {
                this._paneStandby.show();
                //domClass.add("spatialQueryDiv", "disabled");
                //clear out the results layer
                var resultsLayer = this.map.getLayer('resultsLayer');
                resultsLayer.clear();
                //get the dgrid container and empty it, and recreate the grid container for use
                //also get rid of floatingPane 

                //resets the grid
                if (dijit.byId("attributeGrid")) {
                    dijit.byId("attributeGrid").destroyRecursive();
                    //dojo.destroy('attributeGridDiv');
                    dojo.place("<div id='attributeGrid'></div>", "attributeGridContainer", "first");
                    domStyle.set("attributeFooter", "display", "none");
                }

                var symbol;
                this.toolbar.deactivate();
                mapHandler.EnableMapPopups();
                this.map.showZoomSlider();
                var qTaskURL = this._layerCbo.value;
                if (dojo.getStyle('layerDiv', "display") != "none") {
                    qTaskURL += "/" + this._subCbo.value;
                };
                var queryTask = new esri.tasks.QueryTask(qTaskURL);
                var query = new esri.tasks.Query();
                query.geometry = evt.geometry;
                query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
                query.outFields = ["*"];
                query.returnGeometry = true;
                query.outSpatialReference = this.map.spatialReference;
                queryTask.execute(query, lang.hitch(this, function (results) {
                    this._resultsHandler(results);
                }), lang.hitch(this, function (error) {
                    this._paneStandby.hide();
                    alert('Error Querying Features');
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
                                    if (lyrResp.type != "Raster Layer") {
                                        $('<option />', {
                                            text: lyrResp.name,
                                            value: lyrResp.id
                                        }).appendTo(this._subCbo);
                                    }
                                }));
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
                        };
                    };
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
                var eqlabel = dojo.create('p', { innerHTML: "Type in a value to match possible values in the field that you selected above.  For example, if the field is &quot;City&quot;, you might type in &quot;Annapolis&quot; or even &quot;anna&quot;." });  //innerHTML: "="
                dojo.place(eqlabel, "fieldMath", "last");
                var intText = dojo.create('input', { id: "fieldValue" });
                dojo.place(intText, "fieldMath", "last");
                dojo.removeClass("queryBtn", "btnSelected");
            }

            , _runQuery: function () {
                if (dojo.getStyle('fieldDiv', "display") == "none") {
                    this._paneStandby.hide();
                    alert('Must select valid layer and field to continue');
                } else if (this._fieldCbo.value == "null") {
                    this._paneStandby.hide();
                    alert('Must select valid field to continue');
                } else {


                    var qTaskURL = this._layerCbo.value;
                    if (dojo.getStyle('layerDiv', "display") != "none") {
                        qTaskURL += "/" + this._subCbo.value;
                    };
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
                    }), lang.hitch(this, function (error) {
                        this._paneStandby.hide();
                        alert('Error Performing Query');
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

                    //clear out the results layer
                    var resultsLayer = this.map.getLayer('resultsLayer');
                    resultsLayer.clear();

                    //resets the grid
                    if (dojo.hasClass("attributeGrid", "dgrid")) {
                        dojo.destroy('attributeGrid');
                        dojo.place("<div id='attributeGrid'></div>", "attributeGridContainer", "first");
                        domStyle.set("attributeFooter", "display", "none");
                    }
                    if ((symbol != null) && (!dijit.byId('grid'))) {
                        for (var i = 0; i < results.features.length; i++) {
                            var graphic = new Graphic(results.features[i].geometry, symbol, results.features[i].attributes);
                            resultsLayer.add(graphic);
                        }
                        var layout = [];
                        this._identifierVar = results.objectIdFieldName;

                        if (this._identifierVar == undefined) {
                            for (var m = 0; m < results.fields.length; m++) {
                                if (results.fields[m].type == "esriFieldTypeOID") {
                                    this._identifierVar = results.fields[m].name;
                                }
                            }
                        }

                        var columns = [{
                            label: "",  //wasn't able to inject an HTML <div> with image here
                            field: this._identifierVar,
                            formatter: this._renderCell
                        }];

                        /*set up layout*/
                        //set first column to magnifying glass icon
                        //columns.push({ label: "", field: "", formatter: lang.hitch(this, "_renderCell"), 'width': '22px' });


                        for (var j = 0; j < results.fields.length; j++) {
                            if (results.fields[j].type == "esriFieldTypeOID") {
                                this._identifierVar = results.fields[j].name;
                            } else if (results.fields[j].name.indexOf("shape") == -1) {
                                columns.push({ label: results.fields[j].alias, field: results.fields[j].name, 'width': results.fields[j].alias.length * 8 + "px" });
                            }
                        }

                        var items = dojo.map(results.features, function (feature) {
                            return feature.attributes;
                        });

                        var data = {
                            identifier: this._identifierVar,
                            items: items
                        };
                        //var store = new ItemFileWriteStore({ data: data });

                        //idProperty must be set manually if value is something other than 'id'
                        var store = new Memory({
                            data: items,
                            idProperty: this._identifierVar
                        });

                        /*Start creating the grid*/
                        var ResultsGrid = declare([Grid, Selection]);


                        /*create a new grid*/
                        this._resultsGrid = new ResultsGrid({
                            id: 'attributeGrid',
                            bufferRows: Infinity,
                            columns: columns,
                            autoHeight: true,
                            autoWidth: true,
                            selectionMode: 'single',
                            rowSelector: '1px',  //width of the row selector at the beginning of a row
                            canSort: function (colIndex) {
                                return colIndex != 0; //don't allow the first column (zoom to) to be sortable
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
                        }, "attributeGrid");
                        this._resultsGrid.set("store", store);
                        this._resultsGrid.refresh();

                        //set a click event listener on the grid to catch elements within it with the css class "zoomImg"
                        //the magnifying glass images added to the cell during row formatting are given the class "zoomImg"
                        //setting this on the grid, and not individual image nodes prevents resizing the grid from removing
                        //the click event.
                        on(this._resultsGrid, on.selector(".zoomImg", "click"), lang.hitch(this, function (e) {
                            this._zoomToFeature(e);
                        }));

                        var exportItems = array.map(results.features, function (feature) {
                            var arrayObj = new Object;
                            for (var prop in feature.attributes) {
                                //arrayObj[key] = key;
                                if (prop != "videoEmbed") {
                                    arrayObj[prop] = feature.attributes[prop];
                                }
                            }
                            return arrayObj;
                        });

                        function getHeaderArray(featureObj) {
                            var arrayObj = new Object;
                            for (var prop in featureObj) {
                                if (prop != "videoEmbed") {
                                    arrayObj[prop] = prop;
                                }
                            }
                            return arrayObj;
                        }

                        var exportHeader = getHeaderArray(results.features[0].attributes);

                        exportItems.unshift(exportHeader);

                        //for exporting all rows of query results
                        on(dom.byId("exportResults"), "click", lang.hitch(this, function () {
                            var f = dojo.doc.createElement("form");
                            dojo.style(f, {
                                position: "absolute",
                                width: "5em",
                                height: "10em",
                                display: "none",
                                zIndex: "-10000"
                            });

                            var input1 = dojo.doc.createElement("input");
                            dojo.style(input1, {
                                position: "absolute",
                                width: "5em",
                                height: "10em",
                                display: "none",
                                zIndex: "-10000"
                            });
                            var input2 = dojo.doc.createElement("input");
                            dojo.style(input2, {
                                position: "absolute",
                                width: "5em",
                                height: "10em",
                                display: "none",
                                zIndex: "-10000"
                            });
                            var input3 = dojo.doc.createElement("input");
                            dojo.style(input2, {
                                position: "absolute",
                                width: "5em",
                                height: "10em",
                                display: "none",
                                zIndex: "-10000"
                            });

                            input1.name = "fileContent";
                            input1.value = JSON.stringify(exportItems);
                            input2.name = "exportFormat";
                            input2.value = "csv";
                            input3.name = "fileName";
                            input3.value = dojo.byId('serviceCbo').options[dojo.byId('serviceCbo').selectedIndex].innerHTML;

                            f.appendChild(input1);
                            f.appendChild(input2);
                            f.appendChild(input3);

                            //Set the url to trigger the download. 
                            dojo.attr(f, {
                                action: "src/libs/scripts/ExportToExcel.ashx",
                                method: "post"
                            });
                            dojo.body().appendChild(f);
                            f.submit();

                            f.removeChild(input1);
                            f.removeChild(input2);
                            f.removeChild(input3);
                            dojo.body().removeChild(f);
                        }));


                        //this._resultsGrid.update();
                        this._resultsGrid.startup();

                        var t = setTimeout(lang.hitch(this, function () {
                            dojo.byId('attributeTitle').innerHTML = "Search Results - " + results.features.length + " found";
                        }, 500));

                        domStyle.set(dijit.byId('btnBpaneToggle').domNode, "display", "block");

                        this._resizeFooter('min');

                        if (dojo.query("#attributeGrid-header").length > 0) {
                            var headHeight = domStyle.getComputedStyle(dojo.query("#attributeGrid-header")[0]).height;
                            var headerNode = dojo.query("#attributeGrid .dgrid-scroller");
                            if (headerNode.length == 1 && headHeight != "100%")
                                domStyle.set(headerNode[0], "margin-top", headHeight);
                        }

                        this._paneStandby.hide();


                    } // end if (symbol != null)
                    this._paneStandby.hide();

                } else {
                    alert('No values found');
                    this._paneStandby.hide();
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
                dojo.byId('fieldValue').value = "";
                dojo.style("stringQueryDiv", "display", "none");
                //reset the spatial query stuff
                dojo.style("spatialQueryDiv", "display", "none");
                //domClass.remove("spatialQueryDiv", "disabled");

                //reset the service list to select
                $('#serviceCbo').val('0');
                $('#serviceCbo').prop('selectedIndex', 0);
                $('#layerCbo option').remove();
                $('#fieldCbo option').remove();
                //clear out the results layer
                var resultsLayer = this.map.getLayer('resultsLayer');
                resultsLayer.clear();
                //get the dgrid container and empty it, and recreate the grid container for use
                //also get rid of floatingPane 

                //resets the grid
                if (dojo.hasClass("attributeGrid", "dgrid")) {
                    dojo.destroy('attributeGrid');
                    dojo.place("<div id='attributeGrid'></div>", "attributeGridContainer", "first");
                    domStyle.set("attributeFooter", "display", "none");
                }

                dojo.style("queryBtn", "display", "none");
                //hide the toggle button for the bottom if no data in grid
                domStyle.set(dijit.byId('btnBpaneToggle').domNode, "display", "none");
            }

            //utilities
            , _jsonGet: function (theUrl, callback) {
                //using esri request for more consistent results
                //calls the url passed in and then passes back results to callback function
                return layersRequest = esriRequest({
                    url: theUrl,
                    content: { f: "json" },
                    handleAs: "json",
                    load: callback,
                    callbackParamName: "callback"
                });
            }

            , _resizeFooter: function (size) {
                var mapOffsetHeight = parseFloat(dojo.byId("map").offsetHeight);
                if (size == "min") {
                    //set the footer to 25%
                    var attrbFootHeight = mapOffsetHeight * .25;
                    domStyle.set("attributeFooter", "display", "block");
                    domStyle.set("attributeFooter", "height", attrbFootHeight + "px");
                    //reset the grid size
                    domStyle.set("attributeGridContainer", "height", (attrbFootHeight - 22) + "px");
                    domStyle.set("attributeMinimize", "display", "none");
                    domStyle.set("attributeMaximize", "display", "block");
                } else if (size == "max") {
                    //set the footer to 25%
                    var attrbFootHeight = mapOffsetHeight;
                    domStyle.set("attributeFooter", "display", "block");
                    domStyle.set("attributeFooter", "height", attrbFootHeight + "px");
                    //reset the grid size
                    domStyle.set("attributeGridContainer", "height", (attrbFootHeight - 22) + "px");
                    domStyle.set("attributeMinimize", "display", "block");
                    domStyle.set("attributeMaximize", "display", "none");
                } else if (size == "close") {
                    domStyle.set("attributeFooter", "display", "none");
                }
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
            , _renderCell: function (id) {
                var img = "<img id='" + id + "' src = 'assets/zoom.png' class='zoomImg' style='cursor: pointer'/>";
                return img;
            }

            , _zoomToFeature: function (item) {
                //get graphic results layer
                var graphicsLayer = this.map.getLayer("resultsLayer");
                //query layer for OID
                var graphics = [];
                for (i = 0; i < graphicsLayer.graphics.length; i++) {
                    var graphicOID = graphicsLayer.graphics[i].attributes[this._identifierVar];
                    if (graphicOID == item.target.id) {
                        graphics.push(graphicsLayer.graphics[i]);
                    }
                }

                var compressedGraphics = this._compressGraphics(graphics);

                //flash Graphic

                //zoom to graphic
                if (compressedGraphics.length > 0) {
                    var graphic = compressedGraphics[0];
                    if (graphic) {
                        //get extent of graphic
                        var extent = graphic.getExtent();
                        //get y axis range of extent
                        var  yRange = extent.ymax - extent.ymin;
                        // expand y range by 1.25
                        yRange *= 1.25;
                        // change the ymin value to move the graphic north in the extent window
                        extent.ymin = extent.ymax - yRange;
                        this.map.centerAt(extent.getCenter());
                        this.map.setExtent(extent, true);
                        //change extent by factor of queryResultsGrid height divided by map container height.

                        //this._getTopSectionCenter(graphic);
                    }
                }
            }

            , _getTopSectionCenter: function (graphic) {
                //zoom to and center in full map
                if (graphic.type == "point" || graphic.type == "multipoint") {
                    this.map.centerAt(graphic.getExtent().getCenter());
                    this.map.setLevel(16);
                    //center in top part
                    moveToTop(this.map);
                } else {
                    this.map.centerAt(graphic.getExtent().getCenter());
                    this.map.setExtent(graphic.getExtent().expand(2));
                    //center in top part
                    moveToTop(this.map);
                }
                function moveToTop(map) {
                    //get the upper map's center
                    var orgCenterPt = map.extent.getCenter();
                    var startExtent = map.extent;
                    var ycenter = orgCenterPt.y - ((startExtent.ymax - startExtent.ymin) / 8);
                    var centerPt = new esri.geometry.Point(orgCenterPt.x, ycenter, map.spatialReference);
                    map.centerAt(centerPt);
                }
            }

            , _compressGraphics: function (graphics) {
                var result = [];
                var pMultipoint = new Multipoint(new SpatialReference({ wkid: 102100 }));
                var pPolyline = new Polyline(new SpatialReference({ wkid: 102100 }));
                var pPolygon = new Polygon(new SpatialReference({ wkid: 102100 }));
                arrayUtil.forEach(graphics, function (graphic) {
                    switch (graphic.geometry.type) {
                        case "point":
                            pMultipoint.addPoint(graphic.geometry);
                            break;
                        case "polyline":
                            //loop through paths, add paths
                            for (i = 0; i < graphic.geometry.paths.length; i++) {
                                pPolyline.addPath(graphic.geometry.paths[i]);
                            }
                            break;
                        case "polygon":
                            //loop through rings, add rings
                            for (i = 0; i < graphic.geometry.rings.length; i++) {
                                pPolygon.addRing(graphic.geometry.rings[i]);
                            }
                            break;
                    }
                });
                if (pMultipoint.points.length != 0) {
                    result.push(pMultipoint);
                }
                if (pPolyline.paths.length != 0) {
                    result.push(pPolyline);
                }
                if (pPolygon.rings.length != 0) {
                    result.push(pPolygon);
                }

                return result;
            }
        });
    });
