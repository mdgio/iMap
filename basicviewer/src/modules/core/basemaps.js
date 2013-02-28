/**
 Creates an ESRI Overview map dijit.
 Also contains a function to recreate an overview map (apparently needed when basemap is switched).
 */
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/topic", "utilities/maphandler", "dijit/layout/ContentPane"
    , "dijit/Menu", "esri/dijit/BasemapGallery", "dijit/registry"],
    function(declare, lang, topic, mapHandler, ContentPane, Menu, BasemapGallery, registry){
        return declare([], {
            //Give a unique ID for the button associated with this module. Populated from constructor in toolmanager.js
            buttonDivId: null,
            // The ESRI map object to bind to the TOC. Set in constructor
            map: null,
            // Whether the application is embedded (or mobile)
            //The application configuration properties (originated as configOptions from app.js then overridden by AGO if applicable)
            AppConfig: null,

            //*** Create the basemap gallery
            constructor: function(args) {
                // safeMixin automatically sets the properties above that are passed in from the toolmanager.js
                declare.safeMixin(this,args);
                // mapHandler is a singleton object that you can require above and use to get a reference to the map.
                this.map = mapHandler.map;


                //Open it
                //this.ToggleTool();
            }

            //*** This gets called by the Close (x) button in the floating pane created above. Re-use in your widget.
            /*, ToggleTool: function () {
                if (dojo.byId(this.floaterDivId).style.visibility === 'hidden') {
                    dijit.byId(this.floaterDivId).show();
                } else {
                    dijit.byId(this.floaterDivId).hide();
                    dijit.byId(this.buttonDivId).set('checked', false); //uncheck the toggle button
                }
            },*/

            //BASEMAP GALLERY
            , _addBasemapGalleryMenu: function () {
                //This option is used for embedded maps so the gallery fits well with apps of smaller sizes.
                var basemapGroup = null;
                if (this.AppConfig.basemapgroup.title && this.AppConfig.basemapgroup.owner) {
                    basemapGroup = {
                        "owner": this.AppConfig.basemapgroup.owner,
                        "title": this.AppConfig.basemapgroup.title
                    }
                }

                var ht = this.map.height / 2;
                var cp = new ContentPane({
                    id: 'basemapGallery',
                    style: "height:" + ht + "px;width:190px;"
                });

                var basemapMenu = new Menu({
                    id: 'basemapMenu'
                });

                //if a bing maps key is provided - display bing maps too.
                var basemapGallery = new BasemapGallery({
                    showArcGISBasemaps: true,
                    basemapsGroup: basemapGroup,
                    bingMapsKey: this.AppConfig.bingmapskey,
                    map: map
                });
                cp.set('content', basemapMenu.domNode);
                dojo.connect(basemapGallery, 'onLoad', function () {
                    dojo.forEach(basemapGallery.basemaps, lang.hitch(this, function (basemap) {
                        //Add a menu item for each basemap, when the menu items are selected
                        registry.byId('basemapMenu').addChild(new myModules.custommenu({
                            label: basemap.title,
                            icon: basemap.thumbnailUrl,
                            onClick: function () {
                                basemapGallery.select(basemap.id);
                            }
                        }));

                    }));
                });

                var button = new dijit.form.DropDownButton({
                    //label: i18n.tools.basemap.label,
                    id: "basemapBtn",
                    iconClass: "esriBasemapIcon",
                    title: i18n.tools.basemap.title,
                    dropDown: cp
                });

                dojo.byId('webmap-toolbar-center').appendChild(button.domNode);

                dojo.connect(basemapGallery, "onSelectionChange", function () {
                    //close the basemap window when an item is selected
                    //destroy and recreate the overview map  - so the basemap layer is modified.
                    destroyOverview();
                    dijit.byId('basemapBtn').closeDropDown();
                });

                basemapGallery.startup();
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
                var cp = new dijit.layout.ContentPane({
                    id: 'basemapGallery',
                    style: "max-height:448px;width:380px;"
                });

                //if a bing maps key is provided - display bing maps too.
                var basemapGallery = new esri.dijit.BasemapGallery({
                    showArcGISBasemaps: true,
                    basemapsGroup: basemapGroup,
                    bingMapsKey: this.AppConfig.bingmapskey,
                    map: map
                }, dojo.create('div'));


                cp.set('content', basemapGallery.domNode);


                var button = new dijit.form.DropDownButton({
                    //label: i18n.tools.basemap.label,
                    id: "basemapBtn",
                    iconClass: "esriBasemapIcon",
                    title: i18n.tools.basemap.title,
                    dropDown: cp
                });

                dojo.byId('webmap-toolbar-center').appendChild(button.domNode);

                dojo.connect(basemapGallery, "onSelectionChange", function () {
                    //close the basemap window when an item is selected
                    //destroy and recreate the overview map  - so the basemap layer is modified.
                    destroyOverview();
                    dijit.byId('basemapBtn').closeDropDown();
                });

                basemapGallery.startup();
            }
        });
    });