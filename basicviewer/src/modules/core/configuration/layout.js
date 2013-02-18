/**
 This class is run at startup and handles the layout and creation of non-map elements in the page.
 */
define(["dojo/_base/declare", "../utilities/environment", "dojo/_base/lang", "dojo/Evented", "dijit/registry", "require", "dojo/dom", "dijit/layout/ContentPane"
    , "dojox/widget/Standby", "dijit/layout/BorderContainer"],
    function(declare, environment, lang, Evented, registry, require, dom, contentPane, Standby){
        return declare([Evented],
            {
                _AppConfig: null
                , _WebMap: null
                , _Map: null
                , _MainBordCont: null

                //Layout the regions of the Dojo container based on app configs.
                //This way the map can be sized properly when first created.
                , InitialLayout: function (appConfig) {
                    this._AppConfig = appConfig;
                    this._MainBordCont = registry.byId('bc');
                    //load the specified theme
                    var ss = document.createElement("link");
                    ss.type = "text/css";
                    ss.rel = "stylesheet";
                    ss.href = "src/css/" + this._AppConfig.theme + ".css";
                    document.getElementsByTagName("head")[0].appendChild(ss);

                    var changesMade = false;
                    this._AppConfig.title = this._AppConfig.title || this._WebMap.item.title;
                    //If app is embedded, do not show the header, footer, title, title logo, and hyperlinks
                    if (!this._AppConfig.embed) {
                        //add a title and logo, if applicable; automatically sets the height of the header depending on content and padding/margins
                        if (this._AppConfig.displaytitle === "true" || this._AppConfig.displaytitle === true) {
                            //Add a logo to the header if set
                            dojo.style(dom.byId("header"), "height", this._AppConfig.headerHeight + "px");
                            var logoImgHtml = '<img id="titleLogo" src="' +  this._AppConfig.titleLogoUrl + '" alt="MD Logo" />';
                            dojo.create("div", {
                                id: 'webmapTitle',
                                innerHTML: logoImgHtml + "<div class='titleDiv'>" + this._AppConfig.title + "</div>"
                            }, "header");
                        }
                        esri.show(dom.byId('header'));
                        esri.show(dom.byId('bottomPane'));
                        changesMade = true;
                    }

                    // Determine if a left panel widget is set to show on startup, if so lay out the panel, but do not create widget yet
                    if (this._AppConfig.startupwidget && this._AppConfig.startupwidget !== 'none') {
                        // true means the panel will be shown on startup
                        this._LayoutLeftPanel(true);
                        changesMade = true;
                    } else // false means the panel will be hidden, but available on startup
                        this._LayoutLeftPanel(false);
                    if (changesMade)
                        this._MainBordCont.resize();
                }

                , FinalizeLayout: function(webMap, map) {
                    this._WebMap = webMap;
                    this._Map = map;
                    document.title = this._AppConfig.title || this._WebMap.item.title;
                    this._AppConfig.owner = this._WebMap.item.owner;

                    //Overlay toolbar on map
                    var placeholder = dom.byId('toolbarContainer');
                    dom.byId('map_root').appendChild(placeholder);

                    if (!this._AppConfig.embed) {
                        //create the links for the top of the application, if provided
                        if (this._AppConfig.link1.url && this._AppConfig.link2.url) {
                            esri.show(dom.byId('nav'));
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
                        esri.show(dom.byId('logo'));
                        //if a link isn't provided don't make the logo clickable
                        if (this._AppConfig.customlogo.link) {
                            var link = dojo.create('a', {
                                href: this._AppConfig.customlogo.link,
                                target: '_blank'
                            }, dom.byId('logo'));
                            dojo.create('img', {
                                src: this._AppConfig.customlogo.image
                            }, link);
                        } else {
                            dojo.create('img', {
                                id: 'logoImage',
                                src: this._AppConfig.customlogo.image
                            }, dom.byId('logo'));
                            //set the cursor to the default instead of the pointer since the logo is not clickable
                            dojo.style(dom.byId('logo'), 'cursor', 'default');
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
                            })
                        );
                    }

                    //Set the left pane tabs
                    this._CreateLeftPaneTabs();
                    //Set the toolbar

                }

                , _LayoutLeftPanel: function (show) {
                    var leftBC = registry.byId('leftPane');
                    if (this._AppConfig.leftpanewidth && this._AppConfig.leftpanewidth !== "")
                        dojo.style(dom.byId('leftPane'), "width", this._AppConfig.leftpanewidth + "px");
                    if (show)
                        esri.show(dom.byId('leftPane'));
                }

                , _ShowLeftOrRightPanel: function (direction) {
                    var targetDivId = direction.toLowerCase() + "Pane";
                    var targetDiv = dom.byId(targetDivId);
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
                    var targetDiv = dom.byId(targetDivId);
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

                /*** Function to handle loading the tab container.  The widget contents of a tab are lazy-loaded on click, except for the startup widget.
                    This is the place to create new tabs for new widgets. See existing widgets for how-to.*/
                , _CreateLeftPaneTabs: function () {
                    var leftTabCont = registry.byId('leftPane');
                    // Details panel
                    if ((this._AppConfig.displaydetails === 'true' || this._AppConfig.displaydetails === true) && this._AppConfig.description !== "") {
                        var selectedPane = (this._AppConfig.startupwidget === 'displaydetails') ? true : false;
                        var detailCp = new contentPane({
                            title: 'Details', //i18n.tools.details.title,
                            selected: selectedPane,
                            id: "detailPanel"
                        });
                        var detailsContent = '';
                        if (this._AppConfig.embed && (this._AppConfig.displaytitle === "true" || this._AppConfig.displaytitle === true))
                            detailsContent = detailsContent.concat('<h1>', this._AppConfig.title, '</h1>', this._AppConfig.description);
                        else
                            detailsContent = this._AppConfig.description;
                        //set the detail info
                        detailCp.set('content', detailsContent);

                        leftTabCont.addChild(detailCp);
                        dojo.addClass(dom.byId('detailPanel'), 'panel_content');
                    }

                    // Table of Contents
                    if ((this._AppConfig.tablecontents === 'true' || this._AppConfig.tablecontents === true)) {
                        var selectedPane = (this._AppConfig.startupwidget === 'tablecontents') ? true : false;
                        var tocCp = new contentPane({
                            title: 'Contents', //i18n.tools.details.title,
                            selected: selectedPane,
                            id: "tocPanel",
                            style: "padding: 0px"/*,
                            content: '<div id="accRoot"></div>'*/
                        });
                        leftTabCont.addChild(tocCp);
                        dojo.addClass(dom.byId('tocPanel'), 'panel_content');

                        if (selectedPane) { // Get the toc widget and load immediately
                            /*require(["../toc/toc"],
                                lang.hitch(this, function(tocWidg) {
                                    var contentsTab = dom.byId("tocPanel");
                                    // Create our widget and place it
                                    var widget = new tocWidg();
                                    widget.placeAt(contentsTab);
                                    widget.initializeDijitToc(this._Map);
                                })
                            );*/
                                require(["../toc/toc"],
                                    lang.hitch(this, function(tocWidg) {
                                        // Create our widget and place it
                                        var widget = new tocWidg({ esriMap: this._Map });
                                        tocCp.addChild(widget);
                                        widget.startup();
                                        tocCp.resize();
                                    })
                                );
                        } else { // Don't load the widget, unless needed- i.e. when a user clicks on the tab button (lazy loading)
                            leftTabCont.watch("selectedChildWidget", lang.hitch(this, function(name, oval, nval){
                                if (nval.id === 'tocPanel') {
                                    var contentsTab = dom.byId("tocPanel");
                                    if (!contentsTab.hasLoaded) { //Widget has not been activated yet. Run-time load it now.
                                        var standby = new Standby({target: "tocPanel"});
                                        document.body.appendChild(standby.domNode);
                                        standby.show();
                                        require(["../toc/toc"],
                                            lang.hitch(this, function(tocWidg) {
                                                    // Create our widget and place it
                                                    var widget = new tocWidg({ esriMap: this._Map });
                                                    var tocPane = registry.byId('tocPanel');
                                                    tocPane.addChild(widget);
                                                    widget.startup();
                                                    tocPane.resize();
                                                    contentsTab.hasLoaded = true;
                                                    standby.hide();
                                            })
                                        );
                                    }
                                }
                            }));
                        }

                        //leftTabCont.addChild(tocCp);
                        //dojo.addClass(dom.byId('tocPanel'), 'panel_content');
                        if (selectedPane)
                            leftTabCont.selectChild(tocCp);
                    }

                    // Editor Panel

                }
            }
        )
    }
);