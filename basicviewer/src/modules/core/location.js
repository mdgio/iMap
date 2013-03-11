
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
            //Only on the first time a location is found we are going to zoom the map.
            , _firstLoc: true

            , constructor: function(args) {
                this.buttonDivId = args.buttonDivId;
                this.map = args.map;
                // On tool button click- turn on/off locator
                on(registry.byId(this.buttonDivId), "click", lang.hitch(this, function () {
                    this.ToggleTool();
                }));

                //create a layer definition for the gps points
                var layerDefinition = {
                    "geometryType" : "esriGeometryPoint",
                    "objectIdField": "ObjectID",
                    "fields" : [{
                        "name": "ObjectID",
                        "alias": "ObjectID",
                        "type": "esriFieldTypeOID"
                    }]
                };

                var featureCollection = {
                    layerDefinition : layerDefinition,
                    featureSet : null
                };
                // feature layer
                this.featureLayer = new esri.layers.FeatureLayer(featureCollection);
                this.map.addLayer(this.featureLayer);

                this.ToggleTool();
            }

            , ToggleTool: function () {
                if (this.enabled) { //turn off
                    this.enabled = false;
                    //Stop getting locations
                    if (navigator.geolocation)
                        navigator.geolocation.clearWatch(this._watchID);
                    this._clearGraphics();
                } else { //turn on
                    if (this._navigate()) {
                        this.enabled = true;
                        this._firstLoc = true;
                    }
                }
            }

            , _clearGraphics: function () {
                //Remove features in the layer
                this.featureLayer.applyEdits(null, null, this.featureLayer.graphics, null, null);
                this._maxObjId = 0;
            }

            , _navigate: function () {
                if (navigator.geolocation) {
                    this._watchID = navigator.geolocation.watchPosition(lang.hitch(this, this._showLocation), lang.hitch(this, this._locationError), {timeout:40000});
                    return true;
                } else {
                    alert("Navigator not available on this device.");
                    return false;
                }
            }

            , _locationError: function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Location not permitted");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Current location not available");
                        break;
                    case error.TIMEOUT:
                        alert("Locate attempt timeout");
                        break;
                    default:
                        alert("unknown location error");
                        break;
                }
            }

            , _showLocation: function (location) {
                var attributes = { ObjectID: ++this._maxObjId };
                var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
                var graphic = new esri.Graphic(new esri.geometry.Point(pt, this.map.spatialReference), null, attributes);
                this._clearGraphics();
                this.featureLayer.applyEdits([graphic], null, null, lang.hitch(this, function(adds) {
                    if (this._firstLoc) //First time, zoom to location
                        this.map.centerAndZoom(pt, 16);
                    else if (this.map.geographicExtent) { //Check if location is still in visible map- so map doesn't jump around
                        if (!this.map.geographicExtent.expand(.7).contains(graphic.geometry))
                            this.map.centerAt(graphic.geometry);
                    } else //geographicExtent not supported in non-Web Mercator, so fall-back to this
                        this.map.centerAt(graphic.geometry);
                    this._firstLoc = false;
                }));
            }
        });
    });