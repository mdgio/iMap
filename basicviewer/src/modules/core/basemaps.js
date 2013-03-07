/**
 Creates an ESRI basemaps dijit.
 Also contains a function to recreate an overview map (apparently needed when basemap is switched).
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dojo/_base/lang", "dojo/topic", "./utilities/maphandler", "dijit/layout/ContentPane"
    , "dijit/Menu", "esri/dijit/BasemapGallery", "dijit/registry", "dojo/aspect" /*, "./custommenu"*/
    , "dijit/form/DropDownButton", "dojo/dom", "dojo/dom-construct"],
    function(declare, WidgetBase, lang, topic, mapHandler, ContentPane, Menu, BasemapGallery, registry, aspect /*, custommenu*/
        , DropDownButton, dom, domConstruct){
        return declare([WidgetBase, DropDownButton], {
            // The ESRI map object to bind to the TOC. Set in constructor
            map: null,
            //The application configuration properties (originated as configOptions from app.js then overridden by AGO if applicable)
            AppConfig: null,

            //*** Create the basemap gallery
            constructor: function(args) {
                // safeMixin automatically sets the properties above that are passed in from the toolmanager.js
                declare.safeMixin(this,args);
                // mapHandler is a singleton object that you can require above and use to get a reference to the map.
                this.map = mapHandler.map;
            }

            , postCreate: function () {
                this.inherited(arguments);
                /*if (this.AppConfig.embed)
                    this._addBasemapGalleryMenu();
                else*/
                    this._addBasemapGallery();
            }

/*  Tentatively not implementing the skinny gallery, would have to troubleshoot custommenu
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

                //Use aspect after, instead of dojo/on, since onLoad is a function
                aspect.after(basemapGallery, 'onLoad', lang.hitch(this, function () {
                    for(var i = 0; i < basemapGallery.basemaps.length; i++) {
                        var basemap = basemapGallery.basemaps[i];
                        //Add a menu item for each basemap, when the menu items are selected
                        registry.byId('basemapMenu').addChild(new custommenu({
                            label: basemap.title,
                            icon: basemap.thumbnailUrl,
                            onClick: function () {
                                basemapGallery.select(basemap.id);
                            }
                        }));
                    };
                }));

                cp.set('content', basemapGallery.domNode);
                //Set this dropdownbutton's drop down content
                this.dropDown = cp;

                aspect.after(basemapGallery, "onSelectionChange", lang.hitch(this, function () {
                    //close the basemap window when an item is selected
                    //destroy and recreate the overview map  - so the basemap layer is modified.
                    topic.publish('basemapchanged');
                    registry.byId('basemapBtn').closeDropDown();
                }));

                //basemapGallery.startup();
            }*/

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
                var cp = new ContentPane({
                    id: 'basemapGallery',
                    style: "max-height:448px;width:380px;"
                });

                //if a bing maps key is provided - display bing maps too.
                var basemapGallery = new BasemapGallery({
                    showArcGISBasemaps: true,
                    basemapsGroup: basemapGroup,
                    bingMapsKey: this.AppConfig.bingmapskey,
                    map: this.map
                }, domConstruct.create('div'));

                cp.set('content', basemapGallery.domNode);
                //Set this dropdownbutton's drop down content
                this.dropDown = cp;

                aspect.after(basemapGallery, "onSelectionChange", lang.hitch(this, function () {
                    //close the basemap window when an item is selected
                    //destroy and recreate the overview map  - so the basemap layer is modified.
                    topic.publish('basemapchanged');
                    registry.byId('basemapBtn').closeDropDown();
                }));
            }
        });
    });