/**
 Contains the ESRI Geocoder dijit (which includes the textbox).
 Also adds a graphics layer to the map and a results handler to show pins on the map.
 To do: implement a popup for the pins to show address info- http://help.arcgis.com/en/webapi/javascript/arcgis/jssamples/#sample/locator_poi
 */
define(["dojo/_base/declare", "dojo/on", "dojo/_base/lang", "esri/dijit/Geocoder", "esri/dijit/Popup"],
    function(declare, on, lang, Geocoder, Popup){
        return declare([], {
            geocoderUrl: null
            , map: null
            , sourceCountry: null
            //, _popup: null
            , _symbol: null
            //, _InfoTemplate: null

            , constructor: function(args) {
                //The geocoderUrl, map, sourceCountry get set by passing in when the module is instantiated (layout.js)
                this.geocoderUrl = args.geocoderUrl;
                this.map = args.map;
                this.sourceCountry = args.sourceCountry;

                // Create a popup to show results
                //this._popup = new Popup(null, dojo.create("div"));
                // Add a graphics layer for geocoding results
                this.map.addLayer(new esri.layers.GraphicsLayer({
                    id: "lyrGeoCodeResults"
                }));
                //set general extent for state of Maryland in Web Mercator
                //TODO: change to webMap extent, or make extent configurable through JSON
                var extent = new esri.geometry.Extent(-8905000,4553000,-8321000,4837000, new esri.SpatialReference({ wkid:3857 }))
                // create the geocoder
                var geocoder = new esri.dijit.Geocoder({
                    autoNavigate: true, // do not zoom to best result
                    maxLocations: 20, // increase number of results returned
                    map: this.map,
                    arcgisGeocoder: {
                        url: this.geocoderUrl || "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
                        name: "World Geocoder",
                        placeholder: "Find a place",
                        searchExtent: extent, //general extent of state of Maryland"
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
                    if (response.results && response.results.length > 0) {
                        dojo.forEach(response.results, lang.hitch(this, function(r) {
                            r.feature.attributes.name = r.name;
                            r.feature.setSymbol(this._symbol);
                            //r.feature.setInfoTemplate(this._InfoTemplate);
                            l.add(r.feature);
                            }));
                    } else {
                        alert("Search failed to return Results.");
                    }
                }));

                dojo.connect(geocoder, "onClear", lang.hitch(this, function(response){
                    var map = this.map;
                    var lr = map.getLayer("lyrGeoCodeResults");
                    lr.clear();
                    dojo.disconnect();
                }));
            }
        });
    });