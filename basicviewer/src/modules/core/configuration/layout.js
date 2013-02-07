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

                , FinalizeLayout: function(webMap) {
                    this._WebMap = webMap;
                    document.title = this._AppConfig.title || this._WebMap.item.title;
                    this._AppConfig.owner = this._WebMap.item.owner;

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
                }

                , LayoutAfterWebMap: function (webMap) {
                    this._WebMap = webMap;

                    //add a custom logo to the map if provided
                    if (configOptions.customlogo.image) {
                        esri.show(dojo.byId('logo'));
                        //if a link isn't provided don't make the logo clickable
                        if (configOptions.customlogo.link) {
                            var link = dojo.create('a', {
                                href: configOptions.customlogo.link,
                                target: '_blank'
                            }, dojo.byId('logo'));

                            dojo.create('img', {
                                src: configOptions.customlogo.image
                            }, link);
                        } else {
                            dojo.create('img', {
                                id: 'logoImage',
                                src: configOptions.customlogo.image
                            }, dojo.byId('logo'));
                            //set the cursor to the default instead of the pointer since the logo is not clickable
                            dojo.style(dojo.byId('logo'), 'cursor', 'default');
                        }

                    }

                    //initialize the geocoder
                    if (configOptions.placefinder.url && location.protocol === "https:") {
                        configOptions.placefinder.url = configOptions.placefinder.url.replace('http:', 'https:');
                    }
                    locator = new esri.tasks.Locator(configOptions.placefinder.url);
                    locator.outSpatialReference = map.spatialReference;
                    dojo.connect(locator, "onAddressToLocationsComplete", showResults);

                    if (configOptions.displayscalebar === "true" || configOptions.displayscalebar === true) {
                        //add scalebar
                        var scalebar = new esri.dijit.Scalebar({
                            map: map,
                            scalebarUnit: i18n.viewer.main.scaleBarUnits //metric or english
                        });
                    }

                    //Add/Remove tools depending on the config settings or url parameters
                    if (configOptions.displayprint === "true" || configOptions.displayprint === true) {
                        addPrint();
                    }
                    if (configOptions.displaylayerlist === 'true' || configOptions.displaylayerlist === true) {
                        addLayerList(layers);
                    }
                    if (configOptions.displaybasemaps === 'true' || configOptions.displaybasemaps === true) {
                        //add menu driven basemap gallery if embed = true
                        if (configOptions.embed) {
                            addBasemapGalleryMenu();
                        } else {
                            addBasemapGallery();
                        }
                    }

                    if (configOptions.displaymeasure === 'true' || configOptions.displaymeasure === true) {
                        addMeasurementWidget();
                    } else {
                        esri.hide(dojo.byId('floater'));
                    }
                    if (configOptions.displayelevation && configOptions.displaymeasure) {

                        esri.show(dojo.byId('bottomPane'));
                        createElevationProfileTools();
                    }
                    if (configOptions.displaybookmarks === 'true' || configOptions.displaybookmarks === true) {
                        addBookmarks(response);
                    }
                    if (configOptions.displayoverviewmap === 'true' || configOptions.displayoverviewmap === true) {
                        //add the overview map - with initial visibility set to false.
                        addOverview(false);
                    }

                    //do we have any editable layers - if not then set editable to false
                    editLayers = hasEditableLayers(layers);
                    if (editLayers.length === 0) {
                        configOptions.displayeditor = false;
                    }

                    //do we have any operational layers - if not then set legend to false
                    var layerInfo = buildLayersList(layers);
                    if (layerInfo.length === 0) {
                        configOptions.displaylegend = false;
                    }

                    //hide the left pane if editor, details and legend are all false
                    if (configOptions.displayeditor === 'true' || configOptions.displayeditor === true) {
                        configOptions.displayeditor = true;
                    }

                    if (configOptions.displaydetails === 'true' || configOptions.displaydetails === true) {
                        configOptions.displaydetails = true;
                    }
                    if (configOptions.displaylegend === 'true' || configOptions.displaylegend === true) {
                        configOptions.displaylegend = true;
                    }
                    addInterop();

                    if (displayLeftPanel()) {

                        //create left panel
                        var bc = dijit.byId('leftPane');
                        esri.show(dojo.byId('leftPane'));
                        var cp = new dijit.layout.ContentPane({
                            id: 'leftPaneHeader',
                            region: 'top',
                            style: 'height:10px;',
                            content: esri.substitute({
                                close_title: i18n.panel.close.title,
                                close_alt: i18n.panel.close.label
                            }, '<div style="float:right;clear:both;" id="paneCloseBtn"><a title=${close_title} alt=${close_alt} href="JavaScript:hideLeftOrRightPanel(\'left\');"><img src=images/closepanel.png border="0"/></a></div>')
                        });
                        bc.addChild(cp);
                        var cp2 = new dijit.layout.StackContainer({
                            id: 'stackContainer',
                            region:'center',
                            style:'height:98%;'
                        });
                        bc.addChild(cp2);

                        dojo.style(dojo.byId("leftPane"), "width", configOptions.leftpanewidth + "px");

                        //Add the Editor Button and Panel
                        if (configOptions.displayeditor == 'true' || configOptions.displayeditor === true) {
                            addEditor(editLayers); //only enabled if map contains editable layers
                        }

                        //Add the Detail button and panel
                        if ((configOptions.displaydetails === 'true' || configOptions.displaydetails === true) && configOptions.description !== "") {

                            var detailTb = new dijit.form.ToggleButton({
                                showLabel: true,
                                label: i18n.tools.details.label,
                                title: i18n.tools.details.title,
                                checked: true,
                                iconClass: 'esriDetailsIcon',
                                id: 'detailButton'
                            }, dojo.create('div'));
                            dojo.byId('webmap-toolbar-left').appendChild(detailTb.domNode);

                            dojo.connect(detailTb, 'onClick', function () {
                                navigateStack('detailPanel');
                            });

                            var detailCp = new dijit.layout.ContentPane({
                                title: i18n.tools.details.title,
                                selected: true,
                                region:'center',
                                id: "detailPanel"
                            });


                            //set the detail info
                            detailCp.set('content', configOptions.description);


                            dijit.byId('stackContainer').addChild(detailCp);
                            dojo.addClass(dojo.byId('detailPanel'), 'panel_content');
                            navigateStack('detailPanel');
                        }
                        if (configOptions.displaylegend == 'true' || configOptions.displaylegend === true) {
                            addLegend(layerInfo);
                        }

                        if (configOptions.leftPanelVisibility == 'false' || configOptions.leftPanelVisibility === false) {
                            hideLeftOrRightPanel('left');
                        }
                        //***edit
                        //dijit.byId('mainWindow').resize();
                        //resizeMap();
                    }

                    //Instantiate the right panel
                    var rightPaneDiv = dojo.byId('rightPane')
                    esri.show(rightPaneDiv);
                    dojo.style(rightPaneDiv, "width", configOptions.rightpanewidth + "px");
                    hideLeftOrRightPanel('right');

                    dijit.byId('mainWindow').resize();
                    resizeMap();


                    //Create the search location tool
                    if (configOptions.displaysearch === 'true' || configOptions.displaysearch === true) {
                        createSearchTool();
                    } else {
                        esri.hide(dojo.byId('webmap-toolbar-right'));
                    }

                    //add the time slider if the layers are time-aware
                    if (configOptions.displaytimeslider === 'true' || configOptions.displaytimeslider === true) {
                        if (this._WebMap.itemData.widgets && this._WebMap.itemData.widgets.timeSlider) {
                            addTimeSlider(this._WebMap.itemData.widgets.timeSlider.properties);
                        } else {
                            //check to see if we have time aware layers
                            var timeLayers = hasTemporalLayer(layers);
                            if (timeLayers.length > 0) {
                                //do we have time aware layers? If so create time properties
                                var fullExtent = getFullTimeExtent(timeLayers);
                                var timeProperties = {
                                    'startTime': fullExtent.startTime,
                                    'endTime': fullExtent.endTime,
                                    'thumbCount': 2,
                                    'thumbMovingRate': 2000,
                                    'timeStopInterval': findDefaultTimeInterval(fullExtent)
                                }
                                addTimeSlider(timeProperties);
                            } else {
                                configOptions.displaytimeslider = false;
                                esri.hide(dojo.byId('timeFloater'));
                            }

                        }
                    }

                    //Display the share dialog if enabled
                    if (configOptions.displayshare === 'true' || configOptions.displayshare === true) {
                        createSocialLinks();
                    }

                    //resize the border container
                    dijit.byId('bc').resize();
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

               /* , _ToggleEmbed: function (isEmbedded) {
                    var visible = dojo.byId('header').getAttribute('display');
                    var btn = document.getElementsByName('btnShowHide');
                    if (visible != 'none') {
                        esri.hide(dojo.byId('header'));
                        esri.hide(dojo.byId('bottomPane'));
        //        esri.show(dojo.byId('ToolbarLogo'));
                        dojo.style(dojo.byId('ToolbarLogo'), 'display', 'inline-block')
        //        dojo.style('header', 'display', 'none');
        //        dojo.style('bottomPane', 'display', 'none');
        //        dojo.style(dojo.byId("header"), "height", "0px");
        //        dojo.style(dojo.byId("bottomPane"), "height", "0px");
                        dijit.byId('bc').resize();
                        resizeMap();
                        dojo.byId('header').setAttribute('display', 'none');
                        //       btn.src = 'images/reset.png;';
                    } else {
                        esri.show(dojo.byId('header'));
                        esri.show(dojo.byId('bottomPane'));
                        esri.hide(dojo.byId('ToolbarLogo'));
        //        dojo.style('header', 'display', 'block');
        //        dojo.style('bottomPane', 'display', 'block');
        //        dojo.style(dojo.byId("header"), "height", "80px");
        //        dojo.style(dojo.byId("bottomPane"), "height", "80px");
                        dijit.byId('bc').resize();
                        resizeMap();
                        //       btn.src = 'images/expand.png';
                        dojo.byId('header').setAttribute('display', 'block');
                        resizeMap();
                    }
                }*/
            }
        )
    }
);