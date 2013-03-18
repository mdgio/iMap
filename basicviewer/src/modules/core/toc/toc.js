// The parent container for the Table of Contents and Add Data accordion
define(["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dojo/on", "dijit/registry", "dojo/ready", "dojo/_base/lang"
	, "dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dojo/dom-class", "dojo/_base/fx", "dojo/_base/lang", "./legend/TOC"
    , "./btnbar", "dojo/query", "dojo/dom-style", "../utilities/maphandler", "dojo/topic", "./add", "xstyle/css!./css/toc.css"],
    function(declare, domConstruct, WidgetBase, dojoOn, registry, ready, lang
             , AccordionContainer, ContentPane, domClass, fxer, language, legendToc, btnBar, query, domStyle, mapHandler, topic
             , addData){
        //The module needs to be explicitly declared when it will be declared in markup.  Otherwise, do not put one in.
        return declare(/*"modules/core/toc/toc",*/ [WidgetBase, AccordionContainer /*, TemplatedMixin, WidgetsInTemplateMixin*/], {
            //*** The ESRI map object to bind to the TOC
            esriMap: null,
            //*** The ESRI Web Map object to be used by the TOC to set properties such as title, visiblity, etc.
            webMap: null,

            // The table of contents dijit
            _dijitToc: null,
            _addDataPane: null,
            //The current user-selected layer- properties: tocNode, mapLayer
            _SelectedLayer: null,
            //The button bar for manipulating layers
            _btnBar: null,

            //onExtentChange() - use when map extent changes to change not scale dependency in toc items
            //isVisibleAtScale(scale)

            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            constructor: function(args) {
                //Automatically sets the starred properties above.
                declare.safeMixin(this, args);
            },

            //The dojo accordion, which this module inherits from, has been created and is accessible (though not actually shown yet)
            postCreate: function () {
                this.inherited(arguments);
                //Create the content pane for the legend

                var legendPane = new ContentPane({
                    title: "Legend",
                    style: "padding: 0px"
                });
                domClass.add(legendPane.domNode, 'tocLegendPane');

                //Create the accordion's 2nd pane for the add data section
                this._addDataPane = new addData({
                    title:"Add Data"
                    , id: 'addDataContPane'
                });
                //Add the panes to the accordion
                this.addChild(legendPane);
                this.addChild(this._addDataPane);
                //Create the actual legend "tree" and add to the first pane
                this.initializeDijitToc(this.esriMap);
                legendPane.addChild(this._dijitToc);
                //When a parent layer TOC node is clicked, record it as selected here, so buttons act on it.
                topic.subscribe('rootlyrclick', lang.hitch(this, this.selectedLayerChanged));
            }

            //Use the startup handler to create a button bar in the title area of the accordion. The title nodes were not available in postcreate.
            , startup: function () {
                this.inherited(arguments);
                //Subscribe to this accordion's selected pane change to populate add data tree the first time
                var selectTopic = topic.subscribe(this.id + "-selectChild", lang.hitch(this, function (selectedPane, old) {


                    if (selectedPane.title.indexOf("Add") >= 0) {
                        //selectTopic.remove();
                        if (!selectedPane.ContentsCreated)
                            selectedPane.CreateContents();
                        this.clearSelectedLayer();
                    } else //If switching off the Add Data, then make sure the tooltip is closed
                        this._addDataPane.ClosePopup();
                }));

                this._btnBar = new btnBar();
                //Find the title pane dom nodes within the table of contents module by querying on the specific styles using dojo/query
                var titlePanes = query('#tocPanel .dijitAccordionTitle');
                if (titlePanes.length > 0) {
                    //Set the height of the first title pane (Legend) and insert the buttons there
                    var firstPane = titlePanes[0];
                    domStyle.set(firstPane, "height", "30px");
                    var closeDiv = domConstruct.place(this._btnBar.domNode, firstPane);
                }
                this._btnBar.startup();
                //Click events for button bar
                this._btnBar.on('lyrbtnclick', lang.hitch(this, function (e) {
                    if (e.btn === 'u') { //Move the selected map layer up
                        this.moveSelectedUp();
                    } else if (e.btn === 'd') { //Move the selected map layer down
                        this.moveSelectedDown();
                    } else { //Remove the map layer
                        this.removeSelected();
                    }
                }));
            }

            /*** Use these fxns to re-order a layer in the map. Need to do here, instead of directly on the map because it is too difficult and inefficient
             *      for TOC to track all layer re-orders using the map's onLayerReorder event. Pass in layer to re-order and new index. */
            , MoveMapLayerDown: function (layer) {
                //If the layer to move down is a graphics layer then it can't go below service layers, as the graphics layers always seem to sit on top
                var isGraphicsLyr = false;
                for (var i = 0; i < this.esriMap.graphicsLayerIds.length; i++) {
                    var layerId = this.esriMap.graphicsLayerIds[i];
                    if (layerId === layer.id) {
                        isGraphicsLyr = true;
                        break;
                    }
                }
                var nextNodeInfo = this._dijitToc.FindNextTocNode(layer, isGraphicsLyr);
                if (nextNodeInfo.nextIndexInToc != null && nextNodeInfo.nextIndexInToc >= 0) {
                    this.esriMap.reorderLayer(layer, nextNodeInfo.nextIndexInMap);
                    this._dijitToc.MoveRootNodeDown(nextNodeInfo.nextTocNode, nextNodeInfo.nextIndexInToc);
                }
            }
            , MoveMapLayerUp: function (layer) {
                //If the layer to move up is a service layer then it can't go above graphics layers
                var isServiceLyr = false;
                for (var i = 0; i < this.esriMap.layerIds.length; i++) {
                    var layerId = this.esriMap.layerIds[i];
                    if (layerId === layer.id) {
                        isServiceLyr = true;
                        break;
                    }
                }
                var prevNodeInfo = this._dijitToc.FindPrevTocNode(layer, isServiceLyr);
                if (prevNodeInfo.prevIndexInToc != null && prevNodeInfo.prevIndexInToc >= 0) {
                    this.esriMap.reorderLayer(layer, prevNodeInfo.prevIndexInMap);
                    this._dijitToc.MoveRootNodeUp(prevNodeInfo.prevTocNode, prevNodeInfo.prevIndexInToc);
                }
            }

            //data package contains the newly selected map layer and toc dom node
            , selectedLayerChanged: function (data) {
                this._SelectedLayer = null;
                this._SelectedLayer = data;
                this._btnBar.EnableButtons();
            }

            //Move a layer up in the map
            , moveSelectedUp: function () {
                this.MoveMapLayerUp(this._SelectedLayer.mapLayer);
                /*var selected = this._SelectedLayer.tocNode;
                var previousOne;
                var parent;
                if (selected) {
                    parent = selected.parentNode;
                    previousOne = selected.previousElementSibling;
                    if (previousOne) { //Move the dom node up one place
                        parent.insertBefore(selected, previousOne);
                        //Find the index of the layer in the map and increment by one (if not topmost already)
                        for (var i = 0; i < this.esriMap.layerIds.length - 1; i++) {
                            var layerId = this.esriMap.layerIds[i];
                            if (layerId === this._SelectedLayer.mapLayer.id) {
                                this.esriMap.reorderLayer(this._SelectedLayer.mapLayer, ++i);
                                break;
                            }
                        }
                    }
                }*/
                this._btnBar.EnableButtons();
            }
            //Move a layer down in the map
            , moveSelectedDown: function () {
                this.MoveMapLayerDown(this._SelectedLayer.mapLayer);
                /*var selected = this._SelectedLayer.tocNode;
                if (selected) {
                    var parent = selected.parentNode;
                    var nextOne = selected.nextElementSibling;
                    if (nextOne) {
                        var twoDown = nextOne.nextElementSibling;
                        if (twoDown) {
                            parent.insertBefore(selected, twoDown);
                        *//* This was for moving to the bottom, but don't use as don't want below basemap
                        else
                            parent.appendChild(selected);*//*
                            //Find the index of the layer in the map and decrement by one
                            for (var i = 0; i < this.esriMap.layerIds.length - 1; i++) {
                                var layerId = this.esriMap.layerIds[i];
                                if (layerId === this._SelectedLayer.mapLayer.id) {
                                    this.esriMap.reorderLayer(this._SelectedLayer.mapLayer, --i);
                                    break;
                                }
                            }
                        }
                    }
                }*/
                this._btnBar.EnableButtons();
            },
            //Remove the selected map layer
            removeSelected: function () {
                var selected = this._SelectedLayer.tocNode;
                if (selected) {
                    //selected.parentNode.removeChild(selected);
                    //TOC.js listens for map layers being removed and handles the TOC removal
                    this.esriMap.removeLayer(this._SelectedLayer.mapLayer);
                    this._SelectedLayer = null;
                }
            },
            //De-select any selected layer. Useful for when switching off Legend pane.
            clearSelectedLayer: function () {
                this._SelectedLayer = null;
                this._btnBar.DisableButtons();
                //De-select any selected layer nodes by querying inside the TOC to find any node with the selected CSS class
                var nl = query(".dijitTreeRowHover", this._dijitToc.domNode);
                if (nl.length > 0)
                    domClass.remove(nl[0], "claro dijitTreeRowHover");
            }

            // Create the toc dijit, if needed, otherwise do nothing.  If esriMap has already been set, do not need to pass in again.
            , initializeDijitToc: function(esriMap) {
                var tocIsCreated = false;
                if (esriMap != null && (this.esriMap == null || this.esriMap != esriMap)) {
                    this.esriMap = esriMap;
                    this._createDijitToc();
                    tocIsCreated = true;
                } else if (this.esriMap != null && this._dijitToc == null) {
                    this._createDijitToc();
                    tocIsCreated = true;
                }
                return tocIsCreated;
            },

            //Create the Table of Contents/Legend Dijit. Destroy an existing one if present.
            _createDijitToc: function() {
                if (this._dijitToc != null)
                    this._dijitToc.destroyRecursive();
                //Override the default of the TOC to show a visibility slider for the service layers
                /*theTocLayerInfos = [];
                 for(var j = this.esriMap.layerIds.length - 1; j >= 0; j--) {
                 var agsLayer = this.esriMap.getLayer(this.esriMap.layerIds[j]);
                 theTocLayerInfos.push({ layer: agsLayer, slider: true })
                 }*/

                this._dijitToc = new legendToc({
                        map: this.esriMap
                        , webMap: this.webMap /*,
                        layerInfos: theTocLayerInfos*/
                });
                //this._dijitToc.startup();
            }
        });
});