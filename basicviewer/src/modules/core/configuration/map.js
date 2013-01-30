/* The class to handle configuring the web map.
    1. Checks the app config passed in for an AGO web map id.  If not found, checks for a URL to a web map JSON object defined outside AGO.
    2. In either case, it then checks the app config for the presence of a shared web map override URL to customize the web map. If not present,
        it checks Local Storage for a saved web map customization.
    3. If a web map is not found in step 1, then an ESRI map is programmatically created.  This is the place where a map can be defined if not
        using a web map.  Note: Users' ability to save and/or share their map customizations will not be possible with this option.
*/
define(["dojo/_base/declare", "../utilities/environment", "dojo/_base/lang", "dojo/Evented"],
    function(declare, environment, lang){
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

                , _RaiseFinishEvent: function() {
                    this.emit('configured', this._WebMap);
                }
            }
        )
    }
);