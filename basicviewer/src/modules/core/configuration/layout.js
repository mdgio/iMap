/**
 * Created with JetBrains WebStorm.
 * User: James.Somerville
 * Date: 2/1/13
 * Time: 2:49 PM
 * To change this template use File | Settings | File Templates.
 */
define(["dojo/_base/declare", "../utilities/environment", "dojo/_base/lang", "dojo/Evented"],
    function(declare, environment, lang, Evented){
        return declare([Evented],
            {
                _AppConfig: null
                , _WebMap: null
                , _Map: null

                //Layout the regions of the Dojo container based on app configs.
                //This way the map can be sized properly when first created.
                , InitialLayout: function (appConfig) {
                    //load the specified theme
                    var ss = document.createElement("link");
                    ss.type = "text/css";
                    ss.rel = "stylesheet";
                    ss.href = "css/" + this._AppConfig.theme + ".css";
                    document.getElementsByTagName("head")[0].appendChild(ss);

                    this._AppConfig = appConfig;
                    //If app is embedded, do not show the header, footer, title, title logo, and hyperlinks
                    if (!this._AppConfig.embed) {
                        dojo.addClass(dojo.body(),'notembed');
                        dojo.query("html").addClass("notembed");
                        esri.show(dojo.byId('header'));
                        esri.show(dojo.byId('bottomPane'));
                    }
                    if (this._AppConfig.leftPanelVisibility) // Show the left pane on startup
                        ShowLeftOrRightPanel('left');
                }

                , FinalizeLayout: function(webMap, map) {
                    this._WebMap = webMap;
                    this._Map = map;
                    document.title = this._AppConfig.title || this._WebMap.item.title;
                    this._AppConfig.owner = this._WebMap.item.owner;

                    //Overlay toolbar on map
                    var placeholder = dojo.byId('toolbarContainer');
                    dojo.byId('map_root').appendChild(placeholder);

                    if (!this._AppConfig.embed) {
                        dojo.style(dojo.byId("header"), "height", this._AppConfig.headerHeight + "px");
                        //add a title
                        if (this._AppConfig.displaytitle === "true" || this._AppConfig.displaytitle === true) {
                            this._AppConfig.title = this._AppConfig.title || this._WebMap.item.title;
                            //Add a logo to the header if set
                            var logoImgHtml = '<img id="titleLogo" src="' +  this._AppConfig.titleLogoUrl + '" alt="MD Logo" />';
                            dojo.create("div", {
                                id: 'webmapTitle',
                                innerHTML: logoImgHtml + "<span>" + this._AppConfig.title + "</span>"
                            }, "header");
                        }
                        //create the links for the top of the application if provided
                        if (this._AppConfig.link1.url && this._AppConfig.link2.url) {
                            esri.show(dojo.byId('nav'));
                            dojo.create("a", {
                                href: this._AppConfig.link1.url,
                                target: '_blank',
                                innerHTML: this._AppConfig.link1.text
                            }, 'link1List');
                            dojo.create("a", {
                                href: this._AppConfig.link2.url,
                                target: '_blank',
                                innerHTML: this._AppConfig.link2.text
                            }, 'link2List');
                        }
                    }

                    //add webmap's description to details panel
                    if (this._AppConfig.description === "") {
                        if (this._WebMap.item.description !== null) {
                            this._AppConfig.description = this._WebMap.item.description;
                        }
                    }

                    //add a custom logo to the map if provided
                    if (this._AppConfig.customlogo.image) {
                        esri.show(dojo.byId('logo'));
                        //if a link isn't provided don't make the logo clickable
                        if (this._AppConfig.customlogo.link) {
                            var link = dojo.create('a', {
                                href: this._AppConfig.customlogo.link,
                                target: '_blank'
                            }, dojo.byId('logo'));
                            dojo.create('img', {
                                src: this._AppConfig.customlogo.image
                            }, link);
                        } else {
                            dojo.create('img', {
                                id: 'logoImage',
                                src: this._AppConfig.customlogo.image
                            }, dojo.byId('logo'));
                            //set the cursor to the default instead of the pointer since the logo is not clickable
                            dojo.style(dojo.byId('logo'), 'cursor', 'default');
                        }
                    }

                    if (this._AppConfig.displaysearch === 'true' || this._AppConfig.displaysearch === true) {
                        //Create the search location tool
                        require(["../geolocator"],
                            lang.hitch(this, function(geolocator) {
                                var geoloc = new geolocator({ //Set the required properties of the module
                                    geocoderUrl: this._AppConfig.placefinder.url
                                    , map: this._Map
                                    , sourceCountry: this._AppConfig.placefinder.countryCode
                                });
                                geoloc.startup();
                            })
                        );
                    }

                    if (this._AppConfig.displayoverviewmap === 'true' || this._AppConfig.displayoverviewmap === true) {
                        //Create the overview map
                        require(["../ovmap"],
                            lang.hitch(this, function(overviewmap) {
                                var ovmap = new overviewmap({
                                    map: this._Map
                                });
                                ovmap.startup();
                            })
                        );
                    }


                }

                , _DisplayLeftPanel: function () {
                    //display the left panel if any of these options are enabled.
                    var display = false;
                    if (this._AppConfig.displaydetails && this._AppConfig.description !== '') {
                        display = true;
                    }
                    if (this._AppConfig.displaylegend) {
                        display = true;
                    }
                    if (this._AppConfig.displayeditor) {
                        display = true;
                    }
                    return display;
                }

                , ShowLeftOrRightPanel: function (direction) {
                    var targetDivId = direction.toLowerCase() + "Pane";
                    var targetDiv = dojo.byId(targetDivId);
                    var targetPaneWidth = dojo.style(targetDiv, "width");
                    if (targetPaneWidth === 0) {
                        dojo.style(targetDiv, "width", configOptions[targetDivId.toLowerCase() + "width"] + "px");
                        dijit.byId("mainWindow").resize();
                    }
                }

                , HideLeftOrRightPanel: function (direction) {
                    //close the left panel when x button is clicked
                    direction = direction.toLowerCase();
                    var targetDivId = direction + "Pane";
                    var targetDiv = dojo.byId(targetDivId);
                    var targetPaneWidth = dojo.style(targetDiv, "width");
                    if (targetPaneWidth === 0) {
                        targetPaneWidth = configOptions[targetDivId.toLowerCase() + "width"];
                    }
                    dojo.style(targetDiv, "width", "0px");
                    dijit.byId('mainWindow').resize();
                    resizeMap();
                    //uncheck the edit, detail and legend buttons
                    if (direction === 'left') {
                        setTimeout(function () {
                            toggleToolbarButtons('');
                        }, 100);
                    }
                }
            }
        )
    }
);