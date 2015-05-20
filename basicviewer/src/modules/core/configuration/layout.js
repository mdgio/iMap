/**
 This class is run at startup and handles the layout and creation of non-map elements in the page.
 */
define(["dojo/_base/declare", "../utilities/environment", "dojo/_base/lang", "dojo/Evented", "dijit/registry", "require", "dojo/dom", "dijit/layout/ContentPane"
    , "dojox/widget/Standby", "../utilities/tabmanager", "../utilities/toolmanager", "dijit/form/Button", "dojo/dom-style", "dijit/layout/BorderContainer"],
    function(declare, environment, lang, Evented, registry, require, dom, contentPane, Standby, TabManager, ToolManager, Button, domStyle){
        return declare([Evented],
            {
                _AppConfig: null
                , _WebMap: null
                , _Map: null
                , _MainBordCont: null
                , _leftPaneToggler: null
			

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
                    //If app is embedded, do not show the header, footer, title, title logo, and hyperlinks
                    if (!this._AppConfig.embed) {
                        //add a title and logo, if applicable; automatically sets the height of the header depending on content and padding/margins
                        if (this._AppConfig.displaytitle === "true" || this._AppConfig.displaytitle === true) {
                            //Set the height of the header region
                            dojo.style(dom.byId("header"), "height", this._AppConfig.headerHeight + "px");
                        }
                        esri.show(dom.byId('header'));
                        esri.show(dom.byId('bottomPane'));
                        changesMade = true;
                    }

                    // Determine if a left panel widget is set to show on startup, if so lay out the panel, but do not create widget yet
                    if (!this._AppConfig.disableLeftPane) {
                        if (this._AppConfig.startupwidget && this._AppConfig.startupwidget !== 'none') {
                            // true means the panel will be shown on startup
                            this._LayoutLeftPanel(true);
                            changesMade = true;
                        } else { // false means the panel will be hidden, but available on startup
                            this._LayoutLeftPanel(false);
                        }
                    }   else {
                        //must remove entire left pane widget from parent border container to omit the splitter.
                        this._removeSplitter('leftPane');
                    }

                    if (changesMade) {
                        this._MainBordCont.resize();
                    }
                }

                , FinalizeLayout: function(webMap, map) {
                    this._WebMap = webMap;
                    this._Map = map;
                    this._AppConfig.title = this._AppConfig.title || this._WebMap.item.title;
                    document.title = this._AppConfig.title;
                    this._AppConfig.owner = this._WebMap.item.owner;

                    //Overlay toolbar on map
                    var placeholder = dom.byId('toolbarDij');
                    dom.byId('map_root').appendChild(placeholder, { style: {height: '48px'}});

                    if (!this._AppConfig.embed) {
                        //add a title and logo, if applicable
                        if (this._AppConfig.displaytitle === "true" || this._AppConfig.displaytitle === true) {
                            var titleHtml = "";
                            if (this._AppConfig.titleLogoUrl) {
                                if (this._AppConfig.titleLogoLink) {
                                    titleHtml = '<a target="_blank" href="' + this._AppConfig.titleLogoLink + '">'
                                        + '<img border="0" alt="MD Logo" src="' +  this._AppConfig.titleLogoUrl + '"></a>';
                                } else
                                    titleHtml = '<img border="0" alt="MD Logo" src="' +  this._AppConfig.titleLogoUrl + '">';
                            }
                            titleHtml += "<div class='titleDiv'>" + this._AppConfig.title + "</div>";
                            dojo.create("div", {
                                id: 'webmapTitle',
                                innerHTML: titleHtml
                            }, "header");
                        }

                        //create the links for the top of the application, if provided
                        if (this._AppConfig.link1.url) {
                            esri.show(dom.byId('nav'));
                            dojo.create("a", {
                                href: this._AppConfig.link1.url,
                                target: '_blank',
                                innerHTML: this._AppConfig.link1.text
                            }, 'link1List');
                            if (this._AppConfig.link2.url) {
                                dojo.create("a", {
                                    href: this._AppConfig.link2.url,
                                    target: '_blank',
                                    innerHTML: this._AppConfig.link2.text
                                }, 'link2List');
                            }
                        }
                    }

                    if (!this._AppConfig.disableLeftPane) {

                        //set left pane toggle button
                        var lPaneToggleBtn = new Button({
                            label: "Show/Hide",
                            class: "PaneToggle",
                            iconClass: "PaneToggleImage",
                            showLabel: false
                            , onClick: lang.hitch(this, function () {
                                this._ShowHidePane('l');
                            })
                        }, 'btnLpaneToggle');

                        //Set the left pane tabs
                        var tabManager = new TabManager({AppConfig: this._AppConfig, WebMap: this._WebMap});
                        tabManager.CreateLeftPaneTabs();
                    }

                    //add webmap's description to details panel
                    if (this._WebMap.item.description) {
                        this._AppConfig.description = this._WebMap.item.description;
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
                            lang.hitch(this, function (geolocator) {
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
                            lang.hitch(this, function (overviewmap) {
                                var ovmap = new overviewmap({
                                    map: this._Map
                                });
                            })
                        );
                    }

                    //Set the toolbar
                    var toolManager = new ToolManager({ AppConfig: this._AppConfig, WebMap: this._WebMap });
                    toolManager.CreateTools();
                }

                , _LayoutLeftPanel: function (show) {
                    var leftBC = registry.byId('leftPane');
                    if (this._AppConfig.leftpanewidth && this._AppConfig.leftpanewidth !== ""){
                        dojo.style(dom.byId('leftPane'), "width", this._AppConfig.leftpanewidth + "px");
                    }
                    if (show){
                        esri.show(dom.byId('leftPane'));
                    }
                }

                , _removeSplitter: function(paneID){
                    var pane = registry.byId(paneID);
                    this._MainBordCont.removeChild(pane);


                }

                , _ShowHidePane: function (side) {
                    var thePane;
                    var dijitPane;
                    if (side.toLowerCase() === "l")
                        thePane = dom.byId('leftPane');
                    else
                        thePane = dom.byId('rightPane');
                    if (domStyle.get(thePane, 'display') === 'none')
                        esri.show(thePane);
                     else
                        esri.hide(thePane);
                    this._MainBordCont.resize();
                }
            }
        );
    }
);