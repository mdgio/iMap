/**
 * Created with JetBrains WebStorm.
 * User: James.Somerville
 * Date: 2/8/13
 * Time: 11:12 AM
 * To change this template use File | Settings | File Templates.
 */
define(["dojo/_base/declare", "dojo/topic", "esri/dijit/OverviewMap"],
    function(declare, topic, overviewmap){
        return declare([], {
            //The map gets set by passing in when the module is instantiated (layout.js)
            map: null
            , _overviewMapDijit: null

            , constructor: function() {
                declare.safeMixin(this,args);
                _createOvMap();
                //Listen for when the basemap changes, as the overview map needs to be recreated with the new basemap
                topic.subscribe('basemapchanged', lang.hitch(this, this._recreateOverview));
            }

            , _recreateOverview: function () {
                if (this._overviewMapDijit) {
                    var vis = this._overviewMapDijit.visible;
                    this._overviewMapDijit.destroy();
                    this._createOvMap();
                }
            }

            , _createOvMap: function () {
                //attachTo:bottom-right,bottom-left,top-right,top-left
                //opacity: opacity of the extent rectangle - values between 0 and 1.
                //color: fill color of the extnet rectangle
                //maximizeButton: When true the maximize button is displayed
                //expand factor: The ratio between the size of the ov map and the extent rectangle.
                //visible: specify the initial visibility of the ovmap.
                this._overviewMapDijit = new overviewmap({
                    map: this.map,
                    attachTo: "top-right",
                    opacity: 0.5,
                    color: "#000000",
                    expandfactor: 2,
                    maximizeButton: false,
                    visible: false,
                    id: 'overviewMap'
                });
                this._overviewMapDijit.startup();
            }
        });
    });