/* The "tree" legend.
 * Using dojo/_base/connect to connect to map event fxns. This is deprecated along with dojo.connect, but the seemingly appropriate
 * connector (dojo/aspect) does not obtain the proper callback parameters.
 */

define(["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dojo/_base/lang", "./_RootLayerTOC"
    , "dojo/on", "dojo/_base/connect", "dojo/Evented", "xstyle/css!./css/TOC.css" ],
    function(declare, domConstruct, WidgetBase, lang, _RootLayerTOC, on, connect) {
        return declare([WidgetBase], {
        	indentSize: 18,
	        swatchSize: [30, 30],
	        refreshDelay: 500,
	        style: 'inline',
            /*This is the master list of layers in the map to show in the tree
                {   layer: <the actual layer object>,
                    title: <the label in the tree>,
                    toc: <this TOC.js>  }
                */
            _rootLayerTOCs: null,
            //All layers and sub-layers in the tree have a layerinfo
	        layerInfos: null,
	        slider: false,
            //The map object
            map: null,
            //The map configuration JSON object. Used to determine how to display layers in the TOC.
            webMap: null,

	        /**
	         * @name TOCLayerInfo
	         * @class This is an object literal that specify the options for each map rootLayer layer.
	         * @property {esri.layers.ArcGISTiledMapServiceLayer | esri.layers.ArcGISDynamicMapServiceLayer} rootLayer: ArcGIS Server layer.
	         * @property {string} [title] title. optional. If not specified, rootLayer name is used.
	         * @property {Boolean} [slider] whether to show slider for each rootLayer to adjust transparency. default is false.
	         * @property {Boolean} [noLegend] whether to skip the legend, and only display layers. default is false.
	         * @property {Boolean} [collapsed] whether to collapsed the rootLayer layer at beginning. default is false, which means expand if visible, collapse if not.
	         *
	         */
	        /**
	         * @name TOCOptions
	         * @class This is an object literal that specify the option to construct a {@link TOC}.
	         * @property {esri.Map} [map] the map instance. required.
	         * @property {Object[]} [layerInfos] a subset of layers in the map to show in TOC. each object is a {@link TOCLayerInfo}
	         * @property {Number} [indentSize] indent size of tree nodes. default to 18.
	         */
	        /**
	         * Create a Table Of Contents (TOC)
	         * @name TOC
	         * @constructor
	         * @class This class is a Table Of Content widget.
	         * @param {ags.TOCOptions} opts
	         * @param {DOMNode|id} srcNodeRef
	         */
	        constructor: function(params, srcNodeRef) {
	            params = params || {};
	            if (!params.map) {
	                throw new Error('no map defined in params for TOC');
	            }
	            dojo.mixin(this, params);


	        },
	        // extension point
	        postCreate: function() {
                this._rootLayerTOCs = [];
                /*The TOC could be instantiated during different stages in the app
                 1. During startup: in which case some layers might have been added to map, but maybe not all
                 2. After startup: prompted by user to display, in which case probably all layers have been added.
                 In either case, need to handle the later addition, removal, and reorder of layers that occur outside of the toc dijit
                 */
                //Hook up the map's layer added and removed events right away to capture any changes to the map
                connect.connect(this.map, "onLayerAddResult", lang.hitch(this, function (layer, error) {
                    /* If the layer has a title property, which would be set by another module, or if id corresponds to an operationalLayer in web map, then add to TOC.
                     Otherwise, disregard, as layers get added/removed more often than might think (e.g. KML's layers, featurelayers for popups on map services, basemaps).
                     When popups are configured on a map service's layer(s) it also adds a feature layer(s) to use for the popup, don't show these.*/
                    if (error)
                        return;
                    this._handleLayerForToc(layer);
                }));

                connect.connect(this.map, "onLayerRemove", lang.hitch(this, function (layer) {
                    /* Check list of toc nodes for a layer id matching the removed layer. Remove from TOC and list, if found */
                    for (var i = 0; i < this._rootLayerTOCs.length; i++) {
                        var rootLayerToc = this._rootLayerTOCs[i];
                        if (layer.id === rootLayerToc.rootLayer.id) {
                            domConstruct.destroy(rootLayerToc.domNode.id);
                            this._rootLayerTOCs.splice(i,1);
                            break;
                        }
                    }
                }));

                /*connect.connect(this.map, "onLayerReorder", lang.hitch(this, function (layer, index) {
                    //Change the position of the layer if present in the TOC
                    var indexInToc = null;
                    for (var i = 0; i < this._rootLayerTOCs.length; i++) {
                        var rootLayerToc = this._rootLayerTOCs[i];
                        if (layer.id === rootLayerToc.rootLayer.id) {

                            break;
                        }
                    }
                }));*/

                /*connect.connect(this.map, "onBasemapChange", lang.hitch(this, function () {

                }));

                connect.connect(this.map, "onBasemapChange", lang.hitch(this, function () {

                }));*/

                /*dojo.connect(this.map, 'onLayerAdd', this, function(layer) {
                 this.layerInfos.push({
                 layer: layer
                 });
                 this.refresh();
                 });*/
                /*dojo.connect(this.map, 'onLayerRemove', this, function(layer) {
                 for (var i = 0; i < this.layerInfos.length; i++) {
                 if (this.layerInfos[i] == layer) {
                 this.layerInfos.splice(i, 1);
                 break;
                 }
                 }
                 this.refresh();
                 });*/

                //Inspect the currently loaded layers to see how to handle in the TOC
                if (!this.layerInfos) {
                    this.layerInfos = [];
                    /* Loop through the graphics layers of the map (feature layers, graphics, kml).
                     Note: When a popup is configured on a map service's layer(s) it also creates a FeatureLayer for each applicable layer.
                     The id of the featurelayer is: <service layer id>_<feature layer id (order in map)>
                     Do not show these featurelayer's in legend.
                     Note 2: Graphics layers are always on top of the service layers, regardless of web map configuration
                     */
                    for (var r = this.map.graphicsLayerIds.length - 1; r >= 0; r--) {
                        var rootGraphicLayer = this.map.getLayer(this.map.graphicsLayerIds[r]);
                        this._handleLayerForToc(rootGraphicLayer);

                        /*if (this._doesGrLyrHaveSvcLyr(rootGraphicLayer.id)) // don't add to TOC, since just for popups
                            continue;
                        if (!this.webMap) {
                            // these properties defined in BasemapControl widget.
                            // since the basemap control add/remove them frequently, it's better not to show.
                            if (!rootGraphicLayer._isBaseMap && !rootGraphicLayer._isReference) {
                                this.layerInfos.push({
                                    layer: rootGraphicLayer
                                });
                            }
                        } else { //Add the graphics layer to the TOC
                            var layerTitle = this._getRootLayerTitle(rootGraphicLayer);
                            this.layerInfos.push({
                                layer: rootGraphicLayer
                                , title: layerTitle
                            });
                        }*/
                    }

                    // Loop through the service layers of the map (map, image, wms). Create entry in list.
                    for (var i = this.map.layerIds.length - 1; i >= 0; i--) {
                        var rootLayer = this.map.getLayer(this.map.layerIds[i]);
                        this._handleLayerForToc(rootLayer);
                        /*if (!this.webMap) {
                            this.layerInfos.push({
                                layer: rootLayer
                            });
                        } else { //Only create root entries for the operational layers, not the basemap layer(s)
                            for (var p = this.webMap.itemData.operationalLayers.length - 1; p >= 0; p--) {
                                var opLayer = this.webMap.itemData.operationalLayers[p];
                                if (rootLayer.id === opLayer.id) {
                                    //Don't show a legend for the root layer, if Hide in Legend was set in web map
                                    var noLegend = false;
                                    if (!opLayer.showLegend)
                                        noLegend = true;
                                    this.layerInfos.push({
                                        layer: rootLayer,
                                        title: opLayer.title,
                                        noLegend: noLegend
                                    });
                                    break;
                                }
                            }
                        }*/
                    }

                }

	            // do we have any layerInfos without rootLayer created?
	            /*var createdLayers = [];
	            dojo.forEach(this.layerInfos, function(layerInfo) {
	                if (!layerInfo.layer) {
                    layerInfo.layer = this._createRootLayer(layerInfo);
                    createdLayers.push(layerInfo.layer);
                }
	            }, this);
	            if (createdLayers.length == 0) {
	                this._createTOC();
	            } else {
	                var c = dojo.connect(this.map, 'onLayersAddResult', this, function(results) {
	                    dojo.disconnect(c);
	                    this._createTOC();
	                });
	                this.map.addLayers(createdLayers);
	            }*/

                if (!this._zoomHandler) {
                    this._zoomHandler = dojo.connect(this.map, "onZoomEnd", this, "_adjustToState");
                }
                //this._createTOC();
	        }

            // The handler that checks if a map layer should be included in TOC. If so, handles inserting and updating _rootLayerTOCs list
            , _handleLayerForToc: function (layer) {
                /* If the layer has a title property, which would be set by another module, or if id corresponds to an operationalLayer in web map, then add to TOC.
                 Otherwise, disregard, as layers get added/removed more often than might think (e.g. KML's layers, featurelayers for popups on map services, basemaps).
                 When popups are configured on a map service's layer(s) it also adds a feature layer(s) to use for the popup, don't show these.*/
                var createTocNode = false;
                var nodeTitle = null;
                if (layer.title) {
                    createTocNode = true;
                    nodeTitle = layer.title;
                } else {
                    var layerIdToTest = layer.id;
                    //Weird- CSV featurelayers seem to get an extra underscore and dijit appended to their layerid from the web map id
                    if (layer.id.indexOf('csv') == 0 && (layer instanceof (esri.layers.FeatureLayer)))
                        layerIdToTest = layer.id.substring(0, layer.id.lastIndexOf('_'));
                    for (var t = 0; t < this.webMap.itemData.operationalLayers.length; t++) {
                        var opLayer = this.webMap.itemData.operationalLayers[t];
                        if (layerIdToTest === opLayer.id) {
                            createTocNode = true;
                            nodeTitle = opLayer.title;
                            break;
                        }
                    }
                }
                if (createTocNode) {
                    this._insertRootLayer({
                        layer: layer,
                        title: nodeTitle,
                        noLegend: !this._shouldShowLegend(layer),
                        slider: true
                    });
                }
            }


            /*When popups are configured on a map service's layer(s) it also adds a feature layer(s) to use for the popup. Check if this is the case.
                Although, KMLLayers seem to add a layer to both the layerIds and the graphicsLayerIds, and the graphics one seems to be the one to keep.
            */
            /*, _doesGrLyrHaveSvcLyr: function (grLyrId) {
                //The feat. lyr. id seems to be "<service layers's id>_<layer id>"
                var svcLyrIdToCheck = grLyrId.substring(0, grLyrId.lastIndexOf('_'));
                *//*If the TOC is created on startup could have case where service layer has not been added yet, so check the webmap
                    Also, can more easily check if the layer is KML, in which case you want to keep it *//*
                for (var j = 0; j < this.webMap.itemData.operationalLayers.length; j++) {
                    var opLayer = this.webMap.itemData.operationalLayers[j];
                    if (grLyrId === opLayer.id) //It's probably an independent feature layer
                        return false;
                    else if (svcLyrIdToCheck === opLayer.id) { //There is an operational service layer, so the graphics layer is tied to a popup on a map service's layer
                        if (opLayer.type && opLayer.type.toLowerCase() !== 'kml')
                            return true;
                        else  //Unless its KML- then the graphics layer for KML is the one to keep
                            return false;
                    }
                }
                for (var i = 0; i < this.map.layerIds.length; i++) { //Now check the map's layerids (important if added after creating web map
                    if (svcLyrIdToCheck === this.map.layerIds[i] && grLyrId.toLowerCase().indexOf('kml_') != 0)
                        return true;
                }
                return false;
            }*/

            /*, _getRootLayerTitle: function (rootLayer) {
                //Other modules, such as add.js and interop.js append a title to the layer object, so check this first
                if (rootLayer.title && rootLayer.title.length > 0)
                    return rootLayer.title;
                //Check web map for title
                for (var s = this.webMap.itemData.operationalLayers.length - 1; s >= 0; s--) {
                    var opLayer = this.webMap.itemData.operationalLayers[s];
                    if (rootLayer.id === opLayer.id)
                        return opLayer.title;
                }
                if (rootLayer.name) // a property seems to be set on some layers
                 return rootLayer.name;
                return rootLayer.id;
            }*/

	        /*onLoad: function(){

	        },*/
	        /*, _createRootLayer: function(lay) {
	            var rootLayer = null;
	            var type = lay.type || 'ArcGISDynamic';
	            switch (type) {
	                case 'ArcGISDynamic':
	                    rootLayer = new esri.layers.ArcGISDynamicMapServiceLayer(lay.url, lay);
	                    break;
	            }
	            return rootLayer;
	        },*/
	        /*, _createTOC: function() {
	            dojo.empty(this.domNode);
	            for (var i = 0, c = this.layerInfos.length; i < c; i++) {*/
	                /*// attach a title to rootLayer layer itself
	                var rootLayer = this.layerInfos[i].layer;
	                var svcTOC = new _RootLayerTOC({
	                    rootLayer: rootLayer,
	                    info: this.layerInfos[i],
	                    toc: this
	                });

	                this._rootLayerTOCs.push(svcTOC);
                    //Insert the actual dom node into window, might have to track order better
                    svcTOC.placeAt(this.domNode);*/

            /*        this._insertRootLayer(this.layerInfos[i]);
	            }
	            if (!this._zoomHandler) {
	                this._zoomHandler = dojo.connect(this.map, "onZoomEnd", this, "_adjustToState");
	            }
	
	        }*/

            , _insertRootLayer: function (layerInfo) {
                    //create the TOC item for a main layer
                    var rootLayer = layerInfo.layer;
                    var svcTOC = new _RootLayerTOC({
                        rootLayer: rootLayer,
                        info: layerInfo,
                        toc: this
                    });

                    //Now find the corresponding next node in the TOC
                    var nextLayer = this.FindNextTocNode(rootLayer, false);
                    //Add to the list of TOC nodes
                    if (nextLayer.nextIndexInToc != null && nextLayer.nextIndexInToc >= 0) {
                        this._rootLayerTOCs.splice(nextLayer.nextIndexInToc, 0, svcTOC);
                    } else
                        this._rootLayerTOCs.push(svcTOC);
                    //this._rootLayerTOCs.push(svcTOC);
                    //Insert the actual dom node into window
                    if (nextLayer.nextTocNode)
                        domConstruct.place(svcTOC.domNode, nextLayer.nextTocNode.domNode, 'before');
                    else
                        domConstruct.place(svcTOC.domNode, this.domNode);
                    //svcTOC.placeAt(this.domNode);
            }

            /*Find the next (lower in the overlay order) layer in the map that is present in the TOC
                Return object has form: { nextTocNode: <TOC Node>, nextIndexInMap: <index in map layer list>, nextIndexInToc: <index in toc list>
                                            , mapOrGraphics: <whether next layer found in graphics or layers list> }*/
            , FindNextTocNode: function (rootLayer, restrictToGraphicsLyrs) {
                //Loop through the map's graphics layers, then the service layers to determine the appropriate location to insert this TOCNode
                var nextTocNode = null;
                var nextIndexInMap = null;
                var nextIndexInToc = null;
                var mapOrGraphics = null;
                var lyrFoundInMap = false;
                for (var i = this.map.graphicsLayerIds.length - 1; i >= 0; i--) {
                    var graphicLayerId = this.map.graphicsLayerIds[i];
                    if (!lyrFoundInMap) {
                        if (rootLayer.id === graphicLayerId) //Found this layer in map's list
                            lyrFoundInMap = true;
                    } else { //Now find the next layer in the map which is present in the list of TOC nodes
                        for (var p = 0; p < this._rootLayerTOCs.length; p++) {
                            if (this._rootLayerTOCs[p].rootLayer.id === graphicLayerId) {
                                nextTocNode = this._rootLayerTOCs[p];
                                nextIndexInMap = i;
                                nextIndexInToc = p;
                                mapOrGraphics = 'g';
                                break;
                            }
                        }
                        if (nextTocNode)
                            break;
                    }
                }
                if (nextTocNode == null && !restrictToGraphicsLyrs) {
                    //lyrFoundInMap = false;
                    for (var j = this.map.layerIds.length - 1; j >= 0; j--) {
                        var mapLayerId = this.map.layerIds[j];
                        if (!lyrFoundInMap) {
                            if (rootLayer.id === mapLayerId)  //Found this layer in map's list
                                lyrFoundInMap = true;
                        } else { //Now find the next layer in the map, by id, which is present in the list of TOC nodes
                            for (var r = 0; r < this._rootLayerTOCs.length; r++) {
                                if (this._rootLayerTOCs[r].rootLayer.id === mapLayerId) {
                                    nextTocNode = this._rootLayerTOCs[r];
                                    nextIndexInMap = j;
                                    nextIndexInToc = r;
                                    mapOrGraphics = 'm';
                                    break;
                                }
                            }
                            if (nextTocNode)
                                break;
                        }
                    }
                }
                return { nextTocNode: nextTocNode, nextIndexInMap: nextIndexInMap, nextIndexInToc: nextIndexInToc, mapOrGraphics: mapOrGraphics };
            }
            //Find the previous (higher in the overlay order) layer in the map that is present in the TOC
            , FindPrevTocNode: function (rootLayer, restrictToServiceLyrs) {
                //Loop through the map's graphics layers, then the service layers to determine the appropriate location to insert this TOCNode
                var prevTocNode = null;
                var prevIndexInMap = null;
                var prevIndexInToc = null;
                var mapOrGraphics = null;
                var lyrFoundInMap = false;
                if (!restrictToServiceLyrs) {
                    for (var i = 0; i < this.map.graphicsLayerIds.length; i++) {
                        var graphicLayerId = this.map.graphicsLayerIds[i];
                        if (!lyrFoundInMap) {
                            if (rootLayer.id === graphicLayerId) //Found this layer in map's list
                                lyrFoundInMap = true;
                        } else { //Now find the prev layer in the map which is present in the list of TOC nodes
                            for (var p = this._rootLayerTOCs.length - 1; p >= 0; p--) {
                                if (this._rootLayerTOCs[p].rootLayer.id === graphicLayerId) {
                                    prevTocNode = this._rootLayerTOCs[p];
                                    prevIndexInMap = i;
                                    prevIndexInToc = p;
                                    mapOrGraphics = 'g';
                                    break;
                                }
                            }
                            if (prevTocNode)
                                break;
                        }
                    }
                }
                if (prevTocNode == null) {
                    lyrFoundInMap = false;
                    for (var j = 0; j < this.map.layerIds.length; j++) {
                        var mapLayerId = this.map.layerIds[j];
                        if (!lyrFoundInMap) {
                            if (rootLayer.id === mapLayerId)  //Found this layer in map's list
                                lyrFoundInMap = true;
                        } else { //Now find the prev layer in the map, by id, which is present in the list of TOC nodes
                            for (var r = this._rootLayerTOCs.length - 1; r >= 0; r--) {
                                if (this._rootLayerTOCs[r].rootLayer.id === mapLayerId) {
                                    prevTocNode = this._rootLayerTOCs[r];
                                    prevIndexInMap = j;
                                    prevIndexInToc = r;
                                    mapOrGraphics = 'm';
                                    break;
                                }
                            }
                            if (prevTocNode)
                                break;
                        }
                    }
                }
                return { prevTocNode: prevTocNode, prevIndexInMap: prevIndexInMap, prevIndexInToc: prevIndexInToc, mapOrGraphics: mapOrGraphics };
            }
            //Moves the node in the TOC down one position. Does not reorder actual map layers.
            , MoveRootNodeDown: function (refNode, newIndex) {
                var nodeToMove = this._rootLayerTOCs[newIndex - 1];
                domConstruct.place(nodeToMove.domNode, refNode.domNode, 'after');
                this._rootLayerTOCs.splice(newIndex-1,1);
                this._rootLayerTOCs.splice(newIndex,0,nodeToMove);
            }
            //Moves the node in the TOC up one position. Does not reorder actual map layers.
            , MoveRootNodeUp: function (refNode, newIndex) {
                var nodeToMove = this._rootLayerTOCs[newIndex + 1];
                domConstruct.place(nodeToMove.domNode, refNode.domNode, 'before');
                this._rootLayerTOCs.splice(newIndex+1,1);
                this._rootLayerTOCs.splice(newIndex,0,nodeToMove);
            }

            /* Determine if the layer type is appropriate for showing sub-layers with legend entries.
                Basically just AGS map services at this point. Also, honor web map settings for Hide in Legend */
            , _shouldShowLegend: function(layer) {
                if (!(layer instanceof (esri.layers.ArcGISDynamicMapServiceLayer) || layer instanceof (esri.layers.ArcGISTiledMapServiceLayer)))
                    return false;
                for (var p = this.webMap.itemData.operationalLayers.length - 1; p >= 0; p--) {
                    var opLayer = this.webMap.itemData.operationalLayers[p];
                    if (layer.id === opLayer.id) {
                        //Don't show a legend for the root layer, if Hide in Legend was set in web map
                        var showLegend = true;
                        if (opLayer.showLegend != null)
                            showLegend = opLayer.showLegend;
                        return showLegend;
                    }
                }
                return true;
            }

            //This appears to mainly function for scale-dependent rendering of the toc items
	        , _adjustToState: function() {
	            dojo.forEach(this._rootLayerTOCs, function(widget) {
	                widget._adjustToState();
	            });
	        }
	        /**
	         * Refresh the TOC to reflect
	         */
	        /*, refresh: function() {
	            this._createTOC();
	        }*/
	        , destroy: function() {
	            dojo.disconnect(this._zoomHandler);
	            this._zoomHandler = null;
	        }
    });
});