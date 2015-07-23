/**
 Contains the ESRI Geocoder dijit (which includes the textbox).
 Also adds a graphics layer to the map and a results handler to show pins on the map.
 To do: implement a popup for the pins to show address info- http://help.arcgis.com/en/webapi/javascript/arcgis/jssamples/#sample/locator_poi
 */
define(["dojo/_base/declare", "dojo/on", "dojo/_base/lang", "esri/dijit/Search", "dojo/i18n!esri/nls/jsapi", "../utilities/maphandler", "esri/dijit/Popup"],
    function (declare, on, lang, Search, esriBundle, mapHandler, Popup) {
        return declare([], {
            // The ESRI map object to bind to the TOC. Set in constructor
            map: null,
            //The application configuration properties (originated as configOptions from app.js then overridden by AGO if applicable)
            AppConfig: null,

            //*** creates zoom combobox and sets store
            constructor: function (args) {
                esriBundle.widgets.Search.main.placeholder = "Search Features"

                this.map = mapHandler.map;
                var s = new esri.dijit.Search({
                    map: this.map,
                    addLayersFromMap: true
                }, "layerSearch");
                s.startup();
            }

            , postCreate: function () {
                this.inherited(arguments);
            }
        });
    });