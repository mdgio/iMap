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

            //A Dojo Memory Store object that keeps track of the layers in the map, and some of their properties
            //Used as the source for the TOC tree.
            //Also used by save map capability to determine what customizations from the original web map, the user performed.
            , _MapLayerStore: null

            //Some tools, such as measurement and draw need to toggle on/off popups, so a popup doesn't appear when drawing on the map.
            , EnableMapPopups: function () {
                if (this._clickListener)
                    this._clickHandler = on(this.map, "onClick", this._clickListener);
            }

            , DisableMapPopups: function () {
                if (this._clickHandler)
                    this._clickHandler.remove();
            }

            // Takes the Web Map configuration object (including any overrides) from map.js and creates the MapLayerStore object.
            , CreateMapStore: function (webMap) {

            }

            , CreateWebMapOverrideObject: function () {

            }

            //onBasemapChange() - not sure this works, requires specific basemap ids
            //  or listen dojo/top basemapchange and get id

            //onLoad(map) - Fires when the first or base layer has been successfully added to the map.
            //  Check this first

            //onLayerAddResult(layer, error) - use to track during initialization, which layers failed, and during interaction,
            //  when a layer gets added to the map - update store

            //onLayersAddResult(results) - Fires after all layers are added to the map using the map.addLayers method.

            //onLayerRemove() - track when a layer is removed from map - update store

            //onLayerReorder(layer, index) - track when a layer re-order was initiated by the map - update store
            //  Have to make sure it wasn't initiated by TOC itself, in which case store should be updated already



        });
        if (!_instance) {
            var _instance = new MapHandler();
        }
        return _instance;
    }
);