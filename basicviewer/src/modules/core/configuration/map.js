/* The class to handle configuring the web map.
    1. Checks the app config passed in for an AGO web map id.  If not found, checks for a URL to a web map JSON object defined outside AGO.
    2. In either case, it then checks the app config for the presence of a shared web map override URL to customize the web map. If not present,
        it checks Local Storage for a saved web map customization.
    3. If a web map is not found in step 1, then an ESRI map is programmatically created.  This is the place where a map can be defined if not
        using a web map.  Note: Users' ability to save and/or share their map customizations will not be possible with this option.
*/
define(["dojo/_base/declare", "../utilities/environment", "dojo/_base/lang", "dojo/Evented"],
    function(declare, environment, lang, Evented){
        return declare([Evented],
            {
                _AppConfig: null
                , _WebMapId: null
                , _WebMap: null
                , _WebMapOverrides: null

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
                                this._WebMapId = webMap.id;
                                this._WebMap = webMap;
                                this._CheckForWebMapOverrides();
                            }), lang.hitch(this, function(error) {
                                alert("Unable to load web map" + " : " + error.message);
                            })
                        );
                    } else { //*** Create a map using the standard API methods

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
                        }
                    } else { //No customizations, just load default web map
                        this._RaiseFinishEvent();
                    }
                }

                , _ReconcileWebMapOverrides: function () { // Apply the customizations to the webmap object


                    this._RaiseFinishEvent();
                }

                , _RaiseFinishEvent: function() { // Let the calling module know the map configuration has finished
                    this.emit('configured', this._WebMap);
                }

                , CreateMap: function () {
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

                    mapDeferred.addCallback(function (response) {
                        //add webmap's description to details panel
                        if (this._AppConfig.description === "") {
                            if (response.itemInfo.item.description !== null) {
                                this._AppConfig.description = response.itemInfo.item.description;
                            }
                        }

                        this._AppConfig.owner = response.itemInfo.item.owner;
                        document.title = this._AppConfig.title || response.itemInfo.item.title;
                        //add a title
                        if (this._AppConfig.displaytitle === "true" || this._AppConfig.displaytitle === true) {
                            this._AppConfig.title = this._AppConfig.title || response.itemInfo.item.title;

                            //add small image and application title to the toolbar SJS
                            //createToolbarTitle();

                            //Add a logo to the header if set SJS
                            var logoImgHtml = '<img id="titleLogo" src="' +  this._AppConfig.titleLogoUrl + '" alt="MD Logo" />';
                            dojo.create("div", {
                                id: 'webmapTitle',
                                innerHTML: logoImgHtml
                            }, "header");
                            dojo.style(dojo.byId("header"), "height", "80px");
                            var logoImgHtml = '<img id="tbLogoImage" src="' +  this._AppConfig.titleLogoUrl + '" alt="MD Logo" style="height:100%" />';
                            // dojo.byId('ToolbarLogo').innerHTML = logoImgHtml
                            //dojo.style(dojo.byId("header"), "height", "70px");
                        } else if (!this._AppConfig.link1.url && !this._AppConfig.link2.url) {
                            //no title or links - hide header
                            esri.hide(dojo.byId('header'));
                            esri.show(dojo.byId('ToolbarLogo'));
                            dojo.addClass(dojo.body(), 'embed');
                            dojo.query("html").addClass("embed");
                        }
                        //add banner image to header SJS
                        if (this._AppConfig.headerbanner) {
                            var hdImgHTML = "url(" + this._AppConfig.headerbanner + ")";
                            dojo.style(dojo.byId("header"), "background-image", hdImgHTML)
                        }

                        //get the popup click handler so we can disable it when measure tool is active
                        clickHandler = response.clickEventHandle;
                        clickListener = response.clickEventListener;
                        var map = response.map;
                        //Constrain the extent of the map to the webmap's initial extent
                        if (this._AppConfig.constrainmapextent === 'true' || this._AppConfig.constrainmapextent === true) {
                            webmapExtent = response.map.extent.expand(1.5);
                        }

                        //if an extent was specified using url params go to that extent now
                        if (this._AppConfig.extent) {
                            map.setExtent(new esri.geometry.Extent(dojo.fromJson(this._AppConfig.extent)));
                        }

                        if (map.loaded) {
                            addToolbarToMap();
                            initUI(response);
                        } else {
                            dojo.connect(map, "onLoad", function () {
                                addToolbarToMap();
                                initUI(response);
                            });
                        }
                        dojo.connect(dijit.byId('map'), 'resize', map, resizeMap);
                    });

                    mapDeferred.addErrback(function (error) {
                        alert("Error creating map : " + dojo.toJson(error.message));
                    });

                    //if embed set to true, change the map size.
                    if (this._AppConfig.embed === "true" || this._AppConfig.embed === true) {
                        changeMapSize()
                    }
                }
            }
        )
    }
);