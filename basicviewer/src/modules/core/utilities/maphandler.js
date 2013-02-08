/**
 * Created with JetBrains WebStorm.
 * User: James.Somerville
 * Date: 2/1/13
 * Time: 10:02 AM
 * To change this template use File | Settings | File Templates.
 */
// A singleton utility to handle map interaction. Can require in a module and get direct reference to the "map" instance.
define(["dojo/_base/declare", "dojo/on"],
    function(declare, on){
        //Specify an empty array, even if not inheriting anything, otherwise operates differently.
        var MapHandler = declare("MapHandler", [], {
            map: null
            , _clickHandler: null
            , _clickListener: null

            , EnableMapPopups: function () {
                if (this._clickListener)
                    this._clickHandler = on(this.map, "onClick", this._clickListener);
            }
            , DisableMapPopups: function () {
                if (this._clickHandler)
                    this._clickHandler.remove();
            }
        });
        if (!_instance) {
            var _instance = new MapHandler();
        }
        return _instance;
    }
);