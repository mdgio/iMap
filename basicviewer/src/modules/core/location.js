
/**
 Geolocation using the geolocation API (i.e. GPS). Creates a feature layer to show location. Toggling of button turns on/off
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dijit/registry", "dojo/on"],
    function(declare, lang, registry, on){
        return declare([], {
            //Give a unique ID for the button associated with this module. Populated from constructor in toolmanager.js
            buttonDivId: null
            // The ESRI map object to bind to the TOC. Set in constructor
            , map: null
            // Used by the toggle button to determine if location is enabled or not
            , enabled: null
            //Feature layer to show location points
            , featureLayer: null
            //A reference to the navigator watcher- so it can be stopped
            , _watchID: null
            //Max object id currently in layer
            , _maxObjId: 0
            //Only on the first time a location is found we are going to zoom the map.
            , _firstLoc: true

            , constructor: function(args) {
                this.buttonDivId = args.buttonDivId;
                this.map = args.map;
                // On tool button click- turn on/off locator
                on(registry.byId(this.buttonDivId), "click", lang.hitch(this, function () {
                    this.ToggleTool();
                }));

                //create a layer definition for the gps points
                var layerDefinition = {
                    "geometryType" : "esriGeometryPoint",
                    "objectIdField": "ObjectID",
                    "fields" : [{
                        "name": "ObjectID",
                        "alias": "ObjectID",
                        "type": "esriFieldTypeOID"
                    }]
                };

                var featureCollection = {
                    layerDefinition : layerDefinition,
                    featureSet : null
                };
                // feature layer
                this.featureLayer = new esri.layers.FeatureLayer(featureCollection);
                this.map.addLayer(this.featureLayer);

                this.ToggleTool();
            }

            , ToggleTool: function () {
                if (this.enabled) { //turn off
                    this.enabled = false;
                    //Stop getting locations
                    if (navigator.geolocation)
                        navigator.geolocation.clearWatch(this._watchID);
                    this._clearGraphics();
                } else { //turn on
                    if (this._navigate()) {
                        this.enabled = true;
                        this._firstLoc = true;
                    }
                }
            }

            , _clearGraphics: function () {
                //Remove features in the layer
                this.featureLayer.applyEdits(null, null, this.featureLayer.graphics, null, null);
                this._maxObjId = 0;
            }

            , _navigate: function () {
                if (navigator.geolocation) {
                    this._watchID = navigator.geolocation.watchPosition(lang.hitch(this, this._showLocation), lang.hitch(this, this._locationError), {timeout:40000});
                    return true;
                } else {
                    alert("Navigator not available on this device.");
                    return false;
                }
            }

            , _locationError: function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("Location not permitted");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Current location not available");
                        break;
                    case error.TIMEOUT:
                        alert("Locate attempt timeout");
                        break;
                    default:
                        alert("unknown location error");
                        break;
                }
            }

            , _showLocation: function (location) {
                var attributes = { ObjectID: ++this._maxObjId };
                var pt = esri.geometry.geographicToWebMercator(new esri.geometry.Point(location.coords.longitude, location.coords.latitude));
                var ptSymbol = new esri.symbol.PictureMarkerSymbol({"angle":0,"xoffset":0,"yoffset":0,"type":"esriPMS","url":"http://static.arcgis.com/images/Symbols/Basic/BlueBeacon.png","imageData":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAACgtJREFUeF7tWwlUVEcWFVBZQwQVlHYZ97gMRNGJIyGJS1wweuK4yybu4hJQUXFB44pGjRMFZQeRCIIgSBAXNhWFcUEc0dhxTVBRHFBhHAeNd97r9Of8w8Q0YPfvzol1zj31m19V771b7/9f9erRoMHb8pYBbTFgRoIdtCVcF+T2JSVOE/R0QRlt6DCVhL4iWGtDuC7I/IqUAOGvuqCMNnSIURIwShvCdUFmvJKACbqgjDZ02P+WgF/eAWO0wb4uyBQ8YKwuKKNKh8808LZOUz4CzqqE1/H+RGrfuY59VDbnT9VLgj+hocrWtWvAY/Lst6pdc5Wt2lOLTEIRgVeZai9sPD+zxwm6tngZQjo9VOqnsXUFz3yWUshlqtvUkeKOyhlfRXUUgd8BAnbT9QLCYEKzOo7LXsTeyZOzsI5969ycZ/6KUhjXqkhoTW18CGcIz5X9WNHfQindTySMJjRSoSEb/7NyvMA6W1PPDmy0mIS2vzIOE7WJ8C/BWOsWLTDMaTgWLfXFjuAwhMXEITg6Frv3xGLt1h1wm+EJ+74OMDQyEpPzT+rv/ho9xTMfVE9b6t1NTMJNGqWpaKRJdP2TYPiIESMQfyARJY/KIC6v6EcV4RnhKYHv3qwEjhbI4bNuCzr3sBMTcYzG6y6SMVTkRZIbL+jBJHxPCCEYKLFTUGzosGE4nZdXbfNzurpR/gKni/+D1B8qkXC1AvGE/VcqkCKvRObtZzhXUgU5sXHrBfCP+8/htyMSLVq1FYh4TGPzJ45LO8IlQnS9p1BNHd9VjmNMdQobb2pqisDAwGrDy56/Qtbtf2PXuTKsOVGK5VkPsTyTwDVhhRJ+2aXYcOoRdlO7lO8rcOZeFS5VAIcuP8CgUZPE3iC86PhTp68mO954mENsvEwmQ27uaYXx7OKn7lRi08mH8Dl6H0uP3ceKjBL4Zb4efN+X2i07XoKtuaVIKHqMnLsvkV0CeCxZLybB8401VuMA/PZVGF9UVKQw/snzlwg//whe3xXDJ70Yy47erRN8qT3343pX/kOkXKsA8YJpK78WSOBACr8HtF74TQxjY2OcyctXGP+wsgr+OffgmXIbPod/fCMsSvsR3ql3sInG23epHAdvAyOnLxJIKCHZWl2Q8YKFlUDgrl0K48ufvcD6zGLMTLyBBYduwVtNmJd8C+syfkLUhTJEFFag6wf9BRI4qKK1wt95DBw4UGH8i5+BgNx7mBInx/ykG5iXdF2t8Ey8jnXH7yC04ClWxOXB0MRUIIGDq5KXFiTxiYGBAfLPnlcQcFxeBrdvr2JWvByzE9SPmTSuJ427kUjYeb4S/V3mCwTw10fywp8iONHKTnjuvZPkcI+5gumxVzWGKd9egVeiHP7Z97EgJp+8wIxJeEFQ+/ZXFaP5TEBcQqKCgKTCBxgbVgiPvZc1isk8fsxlLE6WY3XmA3T/5HPBC3xVKazO+7zvrmpuZYXi0nJUVL3C0uRrREABXKIKNQ7nyELM3HcZvkfu4bPFOwUCeJcqWRnHsz9kmBNe0uxfLK7AxLALGBd6HhOo1jTGh16Aa2QB5h2QwyUgAw0NjZkE3nRZSMXAGibAy2fpL+5/8T6G78zDmKCzkmFs8FlMib4EdyLCsnUnwQvspSKAgxnYujMI/yUCdmTewKdf5+LzwDzpEJCHiaHn4BpdBBvbDwUCRtaXAHPqyN9SPqvbTODFhThaI1wLoaYEJiAgfC+e0oJ/XepV9N9yAsO/yZUUfws8g/GRRZDZDxIIEA5YvF+jfzj9fSWBV6/dCNXBlo/oRzYbpQIeSoYV4eztwVEopQ39quQiOPpnYci2E5Ji+N9PYVRIIVq+P0DQm+MQXE6osOMx3Y8gWNX0GF5X8yzzWR2zVBNC9FZxpLVlVySKKZqxPPES+q0/joFfZUmKwVuz4RR4HtZ21cti4XyBA6RzCXOU9WSlLcOptiW8U9Pwuv7mACYWr9mMm0/oEUgpQp8vj+LjjRmSov+mLAzYchIWHXsJHsCGS1IWMQGjXaehqPQlAjLk6L0qHf3WHoWDhHDckAmH1WkwsmjJBHBUuKsk1pOQT5mAbu/3Rs4PZYjLvwPHtUfQ2y8NH6w+LBn6bciC3dxg6OkbMAF3CEZSEcAB0PLGhkYI/S4P6UWlGLcjB92WJKPXilRJYL8yFX03nkAbpzmC+/OLWdJykL3A3dsPR649hV9CAbosSoLt0mTY+moedstT0NMvHWZtugsEuEpqPQnjLwVk7Toh8uQNhOVcx8D1h9HBKx7dfRLRTYPg8W1XpqO962bB+Eeki2TLYIFoQ7rgkDjcFvsjKr8EPnvz0fGL/ejotR+dveM1hi4LE9DVNw1mHf8iEMCLN60UFyagSTNrfBl3BtvSr2H0tmOwmRWDdvNi0V4TmL8PnZakocXIxeKzAg7OaKVwfl8Ok2Dr6ERL4mtYHnsOH69OgdX0aLSeHYM2nurFn7wOoNW0YBiYWQoEeGnFcpHQLnRdwSR8NGEulh64ijnhuei7LAnNpkbCevoetJwRTeC6/rChvrI5cZARqYayboLxGSRXJ5IseROiUOpD54WYFVUA98AcOKxIhPW0SFhMDkezKRFoToTUB1ZTI2A9O5a8ag8M2/URjOfvvkzbsy+Wz2f7CuV6DHXH2O3ZGEP4xO8gOszZC0v3MJi7huJdt1A0oWuLWsLSIxxNZ+6HxcRv0MimeuY5+GGnK8YPI0WETRJvQBQkWHXpAwevEAzyz8RHq1JhuyAWrWdEoal7KMxdQvCOczDMCFz/H1yCiawQmE+JhrlHNEz6z4O+qYUw87do/J5K4wdQLXkwVEy84lSIwJ/DJsobvOO6y383aGwMmcNY9Ji1G3a0SuxOC6UOc/dBNj0KzSeTF7iRkc5BMJsUBJOJQTCeFAxjlzCYuEfD2DkMRkN8YdDGXrxFPyIim43ne9cJqpI0NOIs4swMPqI2FUmxoes9gjfoNzaB+XuOsBo8H9YTtqK5ewgsPaJg7r4HJq6RMHKOQKPxQWg0ejsaDV0JA/sJ0LfqLDacc3+8aljBuQJypYzaZKqolQSx8b+VnOBIUjnVheP2CoP0GhrCwKIVDGz+DP3W9tBv1Qt6sp7Qs+qCBqbN0EBPX2z4PerDp0+cZvNrpWamiiSewElMQk5ObTMzOPzEcXv+bPGy9XWRpyq6x894LMGNIM46ed0MiknghIkmap3qGoO1pd/lSgMC6inIkvr1InAAUxxx4mDGewROtKhrYRIuKvU6WNfOtW3PC448pRAOiOha4c3QAaV+HBRVe+HFDrsYB1DVVYTorToTG78g5QoJ6so+rbaV3VNdKbLCoJrKFW5JAhg6X35X2eKaYPMtAcqX1u/i/wU04QGKIzYCnzb/IQuf1TEBvH/4Q5ZVSgJ0Zmsr9Szws8/RpDc+q5NacXXJ46OsCHUNVt9x/gfKBxqkELQR+wAAAABJRU5ErkJggg==","contentType":"image/png","width":24,"height":24});
                var graphic = new esri.Graphic(new esri.geometry.Point(pt, this.map.spatialReference), ptSymbol, attributes);
                this._clearGraphics();
                this.featureLayer.applyEdits([graphic], null, null, lang.hitch(this, function(adds) {
                    if (this._firstLoc) //First time, zoom to location
                        this.map.centerAndZoom(pt, 16);
                    else if (this.map.geographicExtent) { //Check if location is still in visible map- so map doesn't jump around
                        if (!this.map.geographicExtent.expand(.7).contains(graphic.geometry))
                            this.map.centerAt(graphic.geometry);
                    } else //geographicExtent not supported in non-Web Mercator, so fall-back to this
                        this.map.centerAt(graphic.geometry);
                    this._firstLoc = false;
                }));
            }
        });
    });