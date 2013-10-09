// A singleton utility to handle map interaction. Can require in a module and get direct reference to the "map" instance.
define(["dojo/_base/declare", "dojo/on"],
    function(declare, on){
        //Specify an empty array, even if not inheriting anything, otherwise operates differently.
        var MapHandler = declare("MapHandler", [], {
            //The map object created in map.js
            map: null
            //The default clickhandler of the map (for popups)
            , _clickHandler: null
            //The default _clickListener of the map (for popups)
            , _clickListener: null
            //The original web map object before any customizations have been applied. Needed after startup if user saves customizations.
            , OriginalWebMap: null
            //The web map object after local or shared customizations have been applied. This is the startup configuration in map.js.
            , CustomizedWebMap: null
            //Get the "final" web map. If customizations had been applied, then return that web map. Otherwise return the original.
            , getWebMap: function () {
                return this.CustomizedWebMap || this.OriginalWebMap;
            }

            //Some tools, such as measurement and draw need to toggle on/off popups, so a popup doesn't appear when drawing on the map.
            , EnableMapPopups: function () {
                //                if (this._clickListener)
                //                    this._clickHandler = on(this.map, "onClick", this._clickListener);
                if (this._clickListener) {
                    this._clickHandler = this.map.on("click", this._clickListener);
                    console.log("Popups should be enabled");
                };

            }

            , DisableMapPopups: function () {
                if (this._clickHandler) {
                    dojo.disconnect(this._clickHandler);
                }
            }

            // Takes the Web Map configuration object (including any overrides) from map.js and creates the MapLayerStore object.
            , CreateMapStore: function (webMap) {
                //not implemented
            }

            , CreateWebMapOverrideObject: function () {
                //not implemented
            }
        });
        if (!_instance) {
            var _instance = new MapHandler();
        }
        return _instance;
    }
);