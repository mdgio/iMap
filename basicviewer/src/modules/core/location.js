
/**
 Geolocation using the geolocation API (i.e. GPS). Creates a feature layer to show location. Toggling of button turns on/off
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dijit/registry", "dojo/on"],
    function(declare, lang, registry, on){
        return declare([], {
            //Give a unique ID for the button associated with this module. Populated from constructor in toolmanager.js
            buttonDivId: null
            // The ESRI map object to bind to the TOC. Set in constructor
            , map: null
            // Used by the toggle button to determine if location is enabled or not
            , enabled: null
            //Feature layer to show location points
            , featureLayer: null
            //A reference to the navigator watcher- so it can be stopped
            , _watchID: null
            //Max object id currently in layer
            , _maxObjId: 0

            , constructor: function(args) {
                this.buttonDivId = args.buttonDivId;
                this.map = args.map;
                // On tool button click- toggle the floating pane
                on(registry.byId(this.buttonDivId), "click", lang.hitch(this, function () {
                    this.ToggleTool();
                }));

                //create a layer definition for the gps points
                var layerDefinition = {
                    "geometryType" : "esriGeometryPoint",
                    "objectIdField": "ObjectID",
                    "timeInfo" : {
                        "startTimeField" : "DATETIME",
                        "endTimeField" : null,
                        "timeExtent" : [1277412330365],
                        "timeInterval" : 1,
                        "timeIntervalUnits" : "esriTimeUnitsMinutes"
                    },
                    "fields" : [{
                        "name": "ObjectID",
                        "alias": "ObjectID",
                        "type": "esriFieldTypeOID"
                    },{
                        "name" : "DATETIME",
                        "type" : "esriFieldTypeDate",
                        "alias" : "DATETIME"
                    }]
                };

                var featureCollection = {
                    layerDefinition : layerDefinition,
                    featureSet : null
                };
                // feature layer
                this.featureLayer = new esri.layers.FeatureLayer(featureCollection);

                //setup a temporal renderer
                var sms = new esri.symbol.SimpleMarkerSymbol().setColor(new dojo.Color([255, 0, 0])).setSize(8);
                var observationRenderer = new esri.renderer.SimpleRenderer(sms);
                var latestObservationRenderer = new esri.renderer.SimpleRenderer(new esri.symbol.SimpleMarkerSymbol());
                var infos = [{
                    minAge : 0,
                    maxAge : 1,
                    color : new dojo.Color([255, 0, 0])
                }, {
                    minAge : 1,
                    maxAge : 5,
                    color : new dojo.Color([255, 153, 0])
                }, {
                    minAge : 5,
                    maxAge : 10,
                    color : new dojo.Color([255, 204, 0])
                }, {
                    minAge : 10,
                    maxAge : Infinity,
                    color : new dojo.Color([0, 0, 0, 0])
                }];
                var ager = new esri.renderer.TimeClassBreaksAger(infos, esri.renderer.TimeClassBreaksAger.UNIT_MINUTES);
                var sls = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 3);
                var trackRenderer = new esri.renderer.SimpleRenderer(sls);
                var renderer = new esri.renderer.TemporalRenderer(observationRenderer, latestObservationRenderer, trackRenderer, ager);
                this.featureLayer.setRenderer(renderer);
                this.map.addLayer(this.featureLayer);

                if (this._navigate())
                    this.enabled = true;
            }

            , ToggleTool: function () {
                if (this.enabled) {
                    this.enabled = false;
                    //Stop getting locations
                    navigator.geolocation.clearWatch(this._watchID);
                    //Remove features in the layer
                    this.featureLayer.applyEdits(null, null, this.featureLayer.graphics, null, null);
                    this._maxObjId = 0;
                } else {
                    if (this._navigate())
                        this.enabled = true;
                }
            }

            , _navigate: function () {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(lang.hitch(this, this._zoomToLocation), lang.hitch(this, this._locationError));
                    this._watchID = navigator.geolocation.watchPosition(lang.hitch(this, this._showLocation), lang.hitch(this, this._locationError));
                    return true;
                } else {
                    alert("Navigator not available on this device.");
                    return false;
                }
            }

            , _locationError: function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Location not provided");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Current location not available");
                        break;
                    case error.TIMEOUT:
                        alert("Timeout");
                        break;
                    default:
                        alert("unknown error");
                        break;
                }
            }

            , _zoomToLocation: function (location) {
                var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
                this.map.centerAndZoom(pt, 16);
            }

            , _showLocation: function (location) {
                var now = new Date();
                var attributes = { ObjectID: ++this._maxObjId };

                attributes.DATETIME = now.getTime();

                var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
                var graphic = new esri.Graphic(new esri.geometry.Point(pt, this.map.spatialReference), null, attributes);

                this.featureLayer.applyEdits([graphic], null, null, lang.hitch(this, function(adds) {
                    this.map.setTimeExtent(new esri.TimeExtent(null, new Date()));
                    this.map.centerAt(graphic.geometry);
                }));
            }
        });
    });