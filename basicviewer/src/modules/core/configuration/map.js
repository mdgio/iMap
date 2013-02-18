/* The class runs at startup to handle configuring the web map and creating the map object.
    1. Checks the app config passed in for an AGO web map id.  If not found, checks for a URL to a web map JSON object defined outside AGO.
    2. In either case, it then checks the app config for the presence of a shared web map override URL to customize the web map. If not present,
        it checks Local Storage for a saved web map customization.
    3. If a web map is not found in step 1, then an ESRI map is programmatically created.  This is the place where a map can be defined if not
        using a web map.  Note: Users' ability to save and/or share their map customizations will not be possible with this option.
*/
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/on", "dojo/Evented", "../utilities/environment", "../utilities/maphandler"],
    function(declare, lang, on, Evented, environment, mapHandler){
        return declare([Evented],
            {
                _AppConfig: null
                , _WebMapId: null
                , _WebMap: null
                , _WebMapOverrides: null
                , _Map: null
                , _clickListener: null
                , _clickHandler: null

                //Pass in the application configuration, which can contain a web map id

                , configure: function (appConfig) {
                    this._AppConfig = appConfig;
                    this._setDefaults();

                    if (this._AppConfig.webmap) { //*** Obtain webmap from AGO
                        //http://www.arcgis.com/sharing/content/items/407170546ac14125911c5cee18e8ffb4/data?f=json
                        var agoDeferred = esri.arcgis.utils.getItem(this._AppConfig.webmap);
                        agoDeferred.then(
                            lang.hitch(this, function(response) { //The response object is the Web Map
                                //response.item is the metadata about the webmap, response.itemData is the webmap
                                this._WebMapId = this._AppConfig.webmap;
                                this._WebMap = response;
                                this._CheckForWebMapOverrides();
                            }), lang.hitch(this, function(error) {
                                alert("Unable to load web map" + " : " + error.message);
                            })
                        );
                    } else if (this._AppConfig.webmapurl) { //*** Obtain webmap from another source
                        var webMapRequest = esri.request({
                            url: this._AppConfig.webmapurl,
                            content: { f: "json" },
                            handleAs: "json",
                            callbackParamName: "callback"
                        });
                        // Use lang.hitch to have the callbacks run in the scope of this module
                        webMapRequest.then(
                            lang.hitch(this, function(webMap) { //The response object is the Web Map
                                this._WebMapId = webMap.item.id;
                                this._WebMap = webMap;
                                this._CheckForWebMapOverrides();
                            }), lang.hitch(this, function(error) {
                                alert("Unable to load web map" + " : " + error.message);
                            })
                        );
                    } else { // Create a map, load layers, etc. using the standard API calls in CreateMap fxn below
                        this._CheckForWebMapOverrides();
                    }
                }
                
                // Setup up default parameters for the map using the app config settings
                , _setDefaults: function () {
                    if (this._AppConfig.geometryserviceurl && location.protocol === "https:")
                        this._AppConfig.geometryserviceurl = this._AppConfig.geometryserviceurl.replace('http:', 'https:');
                    esri.config.defaults.geometryService = new esri.tasks.GeometryService(this._AppConfig.geometryserviceurl);

                    if (!this._AppConfig.sharingurl)
                        this._AppConfig.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
                    esri.arcgis.utils.arcgisUrl = this._AppConfig.sharingurl;
                    
                    if(!this._AppConfig.proxyurl){
                        this._AppConfig.proxyurl = location.protocol + '//' + location.host + "/sharing/proxy";
                    }
                    esri.config.defaults.io.proxyUrl = this._AppConfig.proxyurl;
                    esri.config.defaults.io.alwaysUseProxy = false;
                }

                // Take the Web Map for the application and check for customizations based on the override inputs
                , _CheckForWebMapOverrides: function () {
                    //Check for user or shared overrides to the defined webmap
                    if (this._WebMap && this._AppConfig.webmapoverride) {
                        var wmOverrideRequest = esri.request({
                            url: this._AppConfig.webmapoverride,
                            content: { f: "json" },
                            handleAs: "json",
                            callbackParamName: "callback"
                        });
                        wmOverrideRequest.then(
                            lang.hitch(this, function(webMapov) { //The response object is the Web Map
                                this._WebMapOverrides = webMapov;
                                this._ReconcileWebMapOverrides();
                            }), lang.hitch(this, function(error) {
                                alert("Unable to load web map overrides" + " : " + error.message);
                            })
                        );
                    } else if (environment.LocalStorage) { //If not a shared map then check local storage for saved customizations
                        var localCustomizations = localStorage.getItem(this._WebMapId);
                        if (localCustomizations) {
                            //Convert string to JSON object (might want to convert to singleton dojo store for later mods)

                            this._WebMapOverrides = webMapov;
                            this._ReconcileWebMapOverrides();
                        } else
                            this._RaiseConfiguredEvent();
                    } else { //No customizations, just load default web map
                        this._RaiseConfiguredEvent();
                    }
                }

                , _ReconcileWebMapOverrides: function () { // Apply the customizations to the webmap object


                    this._RaiseConfiguredEvent();
                }

                , _RaiseConfiguredEvent: function() { // Let the calling module know the map configuration has finished
                    this.emit('mapconfigured', this._WebMap);
                }

                //The function which finally creates the map object using the webmap object
                , CreateMap: function () {
                    //create the map and enable/disable map options like slider, wraparound, esri logo etc
                    if (this._AppConfig.displayslider === 'true' || this._AppConfig.displayslider === true) {
                        this._AppConfig.displaySlider = true;
                    } else {
                        this._AppConfig.displaySlider;
                    }
                    if (this._AppConfig.constrainmapextent === 'true' || this._AppConfig.constrainmapextent === true) {
                        this._AppConfig.constrainmapextent = true;
                    } else {
                        this._AppConfig.constrainmapextent = false;
                    }

                    if (!this._WebMap) { //*** Create a map, add layers, etc. using the standard API methods here:
                        this._Map = new esri.Map('map', {
                            slider: this._AppConfig.displaySlider,
                            sliderStyle:'small',
                            nav: false,
                            wrapAround180: !this._AppConfig.constrainmapextent, //set wraparound to false if the extent is limited.
                            showAttribution:true,
                            logo: !this._AppConfig.customlogo.image //hide esri logo if custom logo is provided
                        });

                        if (this._Map.loaded)
                            this._FinishMapElements();
                        else
                            dojo.connect(this._Map, "onLoad", this._FinishMapElements);
                    } else { //Map will be created using the webmap defined earlier
                        var mapDeferred = esri.arcgis.utils.createMap(this._WebMap, "map", {
                            mapOptions: {
                                slider: this._AppConfig.displaySlider,
                                sliderStyle:'small',
                                nav: false,
                                wrapAround180: !this._AppConfig.constrainmapextent,
                                showAttribution:true,
                                //set wraparound to false if the extent is limited.
                                logo: !this._AppConfig.customlogo.image //hide esri logo if custom logo is provided
                            },
                            ignorePopups: false,
                            bingMapsKey: this._AppConfig.bingmapskey
                        });

                        mapDeferred.addCallback(lang.hitch(this, function (response) {
                            //get the popup click handler so we can disable it when a module needs to disable map popups (e.g. measure, draw tools)
                            mapHandler._clickHandler = response.clickEventHandle;
                            mapHandler._clickListener = response.clickEventListener;
                            this._Map = response.map;

                            //if an extent was specified using url params go to that extent now
                            if (this._AppConfig.extent) {
                                this._Map.setExtent(new esri.geometry.Extent(dojo.fromJson(this._AppConfig.extent)));
                            }

                            if (this._Map.loaded)
                                this._FinishMapElements();
                            else
                                dojo.connect(this._Map, "onLoad", this._FinishMapElements);
                        }));

                        mapDeferred.addErrback(function (error) {
                            alert("Error creating map : " + dojo.toJson(error.message));
                        });
                    }
                }

                , _FinishMapElements: function () {
                    // Set the singleton instance of the map handler, so other modules can require maphandler and have direct access to the map
                    mapHandler.map = this._Map;

                    //constrain the extent
                    if (this._AppConfig.constrainmapextent === 'true' || this._AppConfig.constrainmapextent === true) {
                        var webmapExtent = this._Map.extent.expand(1.5);
                        var basemapExtent = this._Map.getLayer(this._Map.layerIds[0]).fullExtent.expand(1.5);
                        //create a graphic with a hole over the web map's extent. This hole will allow
                        //the web map to appear and hides the rest of the map to limit the visible extent to the webmap.
                        var clipPoly = new esri.geometry.Polygon(this._Map.spatialReference);
                        clipPoly.addRing([
                            [basemapExtent.xmin, basemapExtent.ymin],
                            [basemapExtent.xmin, basemapExtent.ymax],
                            [basemapExtent.xmax, basemapExtent.ymax],
                            [basemapExtent.xmax, basemapExtent.ymin],
                            [basemapExtent.xmin, basemapExtent.ymin]
                        ]);
                        //counter-clockwise to add a hole
                        clipPoly.addRing([
                            [webmapExtent.xmin, webmapExtent.ymin],
                            [webmapExtent.xmax, webmapExtent.ymin],
                            [webmapExtent.xmax, webmapExtent.ymax],
                            [webmapExtent.xmin, webmapExtent.ymax],
                            [webmapExtent.xmin, webmapExtent.ymin]
                        ]);

                        var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(), new dojo.Color("white"));
                        var maxExtentGraphic = new esri.Graphic(clipPoly, symbol);
                        this._Map.graphics.add(maxExtentGraphic);
                    }

                    if (this._AppConfig.displayscalebar === "true" || this._AppConfig.displayscalebar === true) {
                        //add scalebar
                        require(["esri/dijit/Scalebar"],
                            lang.hitch(this, function(Scalebar) {
                                var scalebar = new Scalebar({
                                    map: this._Map,
                                    scalebarUnit: "metric"//i18n.viewer.main.scaleBarUnits //metric or english
                                });
                            })
                        );
                    }
                    this._RaiseMapLoaded();
                }

                , _RaiseMapLoaded: function () { //Let main module know map is loaded
                    this.emit('maploaded', this._Map);
                }
            }
        )
    }
);