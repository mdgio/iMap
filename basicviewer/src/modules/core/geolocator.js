/**
 * Created with JetBrains WebStorm.
 * User: James.Somerville
 * Date: 2/8/13
 * Time: 11:12 AM
 * To change this template use File | Settings | File Templates.
 */
define(["dojo/_base/declare", "dojo/on", "dojo/_base/lang", "esri/dijit/Geocoder", "esri/dijit/Popup"],
    function(declare, on, lang, Geocoder, Popup){
        return declare([], {
            //The geocoderUrl, map, sourceCountry get set by passing in when the module is instantiated (layout.js)
            geocoderUrl: null
            , map: null
            , sourceCountry: null
            //, _popup: null
            , _symbol: null
            //, _InfoTemplate: null

            , constructor: function(args) {
                //declare.safeMixin(this,args);
                this.geocoderUrl = args.geocoderUrl;
                this.map = args.map;
                this.sourceCountry = args.sourceCountry;

                // Create a popup to show results
                //this._popup = new Popup(null, dojo.create("div"));
                // Add a graphics layer for geocoding results
                this.map.addLayer(new esri.layers.GraphicsLayer({
                    id: "lyrGeoCodeResults"
                }));

                // create the geocoder
                var geocoder = new esri.dijit.Geocoder({
                    autoNavigate: true, // do not zoom to best result
                    maxLocations: 20, // increase number of results returned
                    map: this.map,
                    arcgisGeocoder: {
                        url: this.geocoderUrl || "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
                        name: "World Geocoder",
                        placeholder: "Find a place",
                        sourceCountry: this.sourceCountry || "USA" // limit search to the United States
                    }
                }, "search");
                geocoder.startup();

                this._symbol = new esri.symbol.PictureMarkerSymbol({
                    "angle":0,
                    "xoffset":0,
                    "yoffset":10,
                    "type":"esriPMS",
                    "url":"assets/BluePin1LargeB.png",
                    "contentType":"image/png",
                    "width":24,
                    "height":24
                });
                //this._InfoTemplate = new esri.InfoTemplate("${name}", "${*}");

                //Connect the event handler to the onfindresults event of the geocoder. Scoping to this module (lang.hitch), since it is a callback.
                dojo.connect(geocoder, "onFindResults", lang.hitch(this, function(response) {
                    var map = this.map;
                    var l = map.getLayer("lyrGeoCodeResults");
                    l.clear();
                    //if (map.infoWindow != null)
                    //    map.infoWindow.hide();
                    //map.infoWindow = this._popup;
                    dojo.forEach(response.results, lang.hitch(this, function(r) {
                        r.feature.attributes.name = r.name;
                        r.feature.setSymbol(this._symbol);
                        //r.feature.setInfoTemplate(this._InfoTemplate);
                        l.add(r.feature);
                    }));
                }));
            }
        });
    });