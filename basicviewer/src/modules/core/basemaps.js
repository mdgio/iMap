/**
 Creates an ESRI basemaps dijit.
 Also contains a function to recreate an overview map (apparently needed when basemap is switched).
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dojo/_base/lang", "dojo/topic", "./utilities/maphandler", "dijit/layout/ContentPane"
    , "dijit/Menu", "esri/dijit/BasemapGallery", "dijit/registry", "dojo/aspect", "dojo/on" /*, "./custommenu"*/
    , "dijit/form/DropDownButton", "dojo/dom", "dojo/dom-construct", "dojo/dom-style", "dojo/dom-class"],
    function (declare, WidgetBase, lang, topic, mapHandler, ContentPane, Menu, BasemapGallery, registry, aspect, on /*, custommenu*/
        , DropDownButton, dom, domConstruct, domStyle, domClass) {
        return declare([WidgetBase], {
            // The ESRI map object to bind to the TOC. Set in constructor
            map: null,
            //The application configuration properties (originated as configOptions from app.js then overridden by AGO if applicable)
            AppConfig: null,
            buttonDivId: "tglbtnBasemaps",

            //*** Create the basemap gallery
            constructor: function (args) {
                // safeMixin automatically sets the properties above that are passed in from the toolmanager.js
                declare.safeMixin(this, args);
                // mapHandler is a singleton object that you can require above and use to get a reference to the map.
                this.map = mapHandler.map;

                this._addBasemapGallery();

                // On tool button click- toggle the floating pane
                on(registry.byId(this.buttonDivId), "click", lang.hitch(this, function () {
                    this.ToggleTool();
                }));
                //Open it
                this.ToggleTool();
            }

            , postCreate: function () {
                this.inherited(arguments);

            }

            //Add the basemap gallery widget to the application.
            , _addBasemapGallery: function () {
                //if a basemap group was specified listen for the callback and modify the query
                var basemapGroup = null;
                if (this.AppConfig.basemapgroup.title && this.AppConfig.basemapgroup.owner) {
                    basemapGroup = {
                        "owner": this.AppConfig.basemapgroup.owner,
                        "title": this.AppConfig.basemapgroup.title
                    }
                }

                dojo.place("<div id='basemapGallery'></div>", "map");

                //                var cp = new ContentPane({
                //                    id: 'basemapGallery',
                //                    style: "max-height:448px;width:380px;"
                //                });

                //if a bing maps key is provided - display bing maps too.
                var basemapGallery = new BasemapGallery({
                    showArcGISBasemaps: true,
                    basemapsGroup: basemapGroup,
                    bingMapsKey: this.AppConfig.bingmapskey,
                    map: this.map
                }, "basemapGallery");
                basemapGallery.startup();

                basemapGallery.on("load", function () {
                    document.getElementById("basemapGallery").children[0].style.width = (120 * basemapGallery.basemaps.length) + "px";
                });

                aspect.after(basemapGallery, "onSelectionChange", lang.hitch(this, function () {
                    //close the basemap window when an item is selected
                    //destroy and recreate the overview map  - so the basemap layer is modified.
                    topic.publish('basemapchanged');
                    //registry.byId('basemapBtn').closeDropDown();
                }));
                //this.ToggleTool();
            }
            //*** This gets called by the Close (x) button in the floating pane created above. Re-use in your widget.
            , ToggleTool: function () {
                if (domClass.contains(dijit.byId(this.buttonDivId).domNode, "dijitToggleButtonChecked")) {
                    domStyle.set("basemapGallery", "display", "block");
                } else {
                    domStyle.set("basemapGallery", "display", "none");
                }
            }
        });
    });