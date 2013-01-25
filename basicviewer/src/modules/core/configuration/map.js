/* The class to handle configuring the web map.
    1. Checks the app config passed in for an AGO web map id.  If not found, checks for a URL to a web map JSON object defined outside AGO.
    2. In either case, it then checks the app config for the presence of a shared web map override URL to customize the web map. If not present,
        it checks Local Storage for a saved web map customization.
    3. If a web map is not found in step 1, then an ESRI map is programmatically created.  This is the place where a map can be defined if not
        using a web map.  Note: Users' ability to save and/or share their map customizations will not be possible with this option.
*/
define(["dojo/_base/declare"],
    function(declare){
        return declare([],
            {
                _AppConfig: null

                //Pass in the application configuration, which can contain a webmap id
                , configure: function (appConfig) {
                    this._AppConfig = appConfig;
                    this._setDefaults();



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
            }
        )
    }
);