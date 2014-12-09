define(["dojo/_base/declare", "dijit/_WidgetBase", "./_TOCNode"],
    function(declare, WidgetBase, _TOCNode) {
        return declare([WidgetBase], {
        	_currentIndent: 0,
            //The actual layer object in the map
	        rootLayer: null,
            //The TOC tree
	        toc: null,

	        constructor: function(params, srcNodeRef) {
	            this.rootLayer = params.rootLayer;
	            this.toc = params.toc;
	            this.info = params.info || {};
	        },
	        // extension point called by framework
	        postCreate: function() {
	            this._getLayerInfos();
	        },
	        // retrieve sublayer/legend data
	        _getLayerInfos: function() {
	            //Only getting sub-layers for AGS map services
	            if ((this.rootLayer instanceof (esri.layers.ArcGISDynamicMapServiceLayer) ||
	                this.rootLayer instanceof (esri.layers.ArcGISTiledMapServiceLayer))) {
	                if (this.info.title === undefined) {
	                    var start = this.rootLayer.url.toLowerCase().indexOf('/rest/services/');
	                    var end = this.rootLayer.url.toLowerCase().indexOf('/mapserver', start);
	                    this.info.title = this.rootLayer.url.substring(start + 15, end);
	                }
	            } else {
	                this.info.noLayers = true;
	            }
	            if (!this.rootLayer.url || this.info.noLegend || this.info.noLayers) {
	
	                this._createRootLayerTOC();
	            } else {
	                // note: renderer info only has simple symbols. If the map layer has complex symbol,
	                // the image returned from /legend is better than create from renderer.
	                // however, /legend does not have field/value information.
	                if (this.info.mode == 'legend') {
	
	                    this._getLegendInfo();
	                } else if (this.info.mode == 'layers') {
	                    this._getLayersInfo();
	                } else {
	                    this._getLayersInfo();
	                    this._getLegendInfo();
	                }
	
	            }
	        },
	        _getLegendInfo: function() {
	
	            var url = '';
	            if (this.rootLayer.version >= 10.01) {
	                url = this.rootLayer.url + '/legend';
	            } else {
	                url = 'http://www.arcgis.com/sharing/tools/legend';
	                var i = this.rootLayer.url.toLowerCase().indexOf('/rest/');
	                var soap = this.rootLayer.url.substring(0, i) + this.rootLayer.url.substring(i + 5);
	                url = url + '?soapUrl=' + escape(soap);
	            }
	            var handle = esri.request({
	                url: url,
	                content: {
	                    f: "json"
	                },
	                callbackParamName: 'callback',
	                handleAs: 'json',
	                load: dojo.hitch(this, this._processLegendInfo),
	                error: dojo.hitch(this, this._createRootLayerTOC)
	            });
	        },
	        _getLayersInfo: function() {
	            var url = this.rootLayer.url + '/layers';
	            var handle = esri.request({
	                url: url,
	                content: {
	                    f: "json"
	                },
	                callbackParamName: 'callback',
	                handleAs: 'json',
	                load: dojo.hitch(this, this._processLayersInfo),
	                error: dojo.hitch(this, this._createRootLayerTOC)
	            });
	        },
	        _processLegendError: function(err) {
	            //console.log(err);
	            this._createRootLayerTOC();
	        },
	        _processLegendInfo: function(json) {
	
	            this.rootLayer._legendResponse = json;
	            if (this.info.mode == 'legend' || this.rootLayer._layersResponse) {
	                this._createRootLayerTOC();
	            }
	        },
	        _processLayersInfo: function(json) {
	
	            this.rootLayer._layersResponse = json;
	            if (this.info.mode == 'layers' || this.rootLayer._legendResponse) {
	                this._createRootLayerTOC();
	            }
	        },
	        _createRootLayerTOC: function() {
	
	            var layer = this.rootLayer;
	            if (!layer._tocInfos) {
	
	                // create a lookup map, key=layerId, value=LayerInfo
	                // generally id = index, this is to assure we find the right layer by ID
	                // note: not all layers have an entry in legend response.
	                var layerLookup = {};
	                dojo.forEach(layer.layerInfos, function(layerInfo) {
	                    layerLookup['' + layerInfo.id] = layerInfo;
	                    // used for later reference.
	                    layerInfo.visible = layerInfo.defaultVisibility;
	                });
	                // attach renderer info to layerInfo
	                if (layer._layersResponse) {
	
	                    dojo.forEach(layer._layersResponse.layers, function(layInfo) {
	                        var layerInfo = layerLookup['' + layInfo.id];
	                        if (layerInfo) {
	                            dojo.mixin(layerInfo, layInfo);// push fields info
	                            layerInfo.definitionExpression = layInfo.definitionExpression;
	                            if (layInfo.drawingInfo && layInfo.drawingInfo.renderer) {
	                                layerInfo.renderer = esri.renderer.fromJson(layInfo.drawingInfo.renderer);
	                            }
	                        }
	                    });
	                }
	
	                // attached legend Info to layer info
	                if (layer._legendResponse) {
	
	                    dojo.forEach(layer._legendResponse.layers, function(legInfo) {
	                        var layerInfo = layerLookup['' + legInfo.layerId];
	                        if (layerInfo && legInfo.legend) {
	                            layerInfo.legends = legInfo.legend;
	                            // merge legend symbol to renderers. Ideally the REST API already does that, but
	                            if (layerInfo.renderer) {
	                                if (layerInfo.renderer.infos) {
	                                    var legVals = {}; // lookup, key=label, val=legend
	                                    dojo.forEach(legInfo.legend, function(leg) {
	                                        legVals[leg.label] = leg;
	                                    });
	                                    // note, merge with renderer, not overwriting symbol so we have choice of using legend or draw symbol.
	                                    if (layerInfo.renderer.defaultSymbol) {
	                                        dojo.mixin(layerInfo.renderer, legInfo.legend[0]);//.defaultSymbol
	                                    }
	                                    dojo.forEach(layerInfo.renderer.infos, function(info, i) {
	                                        var leg = legVals[info.label];
	                                        if (leg) {
	                                            dojo.mixin(info, leg);
	                                        }
	                                    });
	                                } else {
	                                    // simple, merge url, imageData, contentType. note merged to renderer, not renderer symbol, avoid loss data.
	                                    dojo.mixin(layerInfo.renderer, legInfo.legend[0]);//.symbol
	                                }
	                            }
	                        }
	                    });
	                }
	                // nest layer Infos
	                dojo.forEach(layer.layerInfos, function(layerInfo) {
	                    if (layerInfo.subLayerIds) {
	                        var subLayerInfos = [];
	                        dojo.forEach(layerInfo.subLayerIds, function(id, i) {
	                            subLayerInfos[i] = layerLookup[id];
	                            subLayerInfos[i]._parentLayerInfo = layerInfo;
	                        });
	                        layerInfo._subLayerInfos = subLayerInfos;
	                    }
	                });
	                //finalize the tree structure in _tocInfos, skipping all sublayers because they were nested already.
	                var tocInfos = [];
	                dojo.forEach(layer.layerInfos, function(layerInfo) {
	                    if (layerInfo.parentLayerId == -1) {
	                        tocInfos.push(layerInfo);
	                    }
	                });
	                layer._tocInfos = tocInfos;
	
	
	            }
	            // sometimes IE may fail next step
	            this._rootLayerNode = new _TOCNode({
	                rootLayerTOC: this,
	                rootLayer: layer,
                    isRootLayer: true
	            });
	
	
	            this._rootLayerNode.placeAt(this.domNode);
	            this._visHandler = dojo.connect(layer, "onVisibilityChange", this, "_adjustToState");
	            // this will make sure all TOC linked to a Map synchronized.
	            this._visLayerHandler = dojo.connect(layer, "setVisibleLayers", this, "_onSetVisibleLayers");
	            this._adjustToState();
	        },
	        _refreshLayer: function() {
	            var rootLayer = this.rootLayer;
	            var timeout = this.toc.refreshDelay;
	            if (this._refreshTimer) {
	                window.clearTimeout(this._refreshTimer);
	                this._refreshTimer = null;
	            }
	            this._refreshTimer = window.setTimeout(function() {
	                rootLayer.setVisibleLayers(rootLayer.visibleLayers);
	            }, 500);
	        },
	        _onSetVisibleLayers: function(visLayers, doNotRefresh){
	            // 2012-07-23:
	            // set the actual individual layerInfo's visibility after service's setVisibility call.
	            if (!doNotRefresh) {
	                dojo.forEach(this.rootLayer.layerInfos, function(layerInfo) {
	                    if (dojo.indexOf(visLayers, layerInfo.id) != -1) {
	                        layerInfo.visible = true;
	                    } else if (!layerInfo._subLayerInfos){
	                        layerInfo.visible = false;
	                    }
	                });
	                this._adjustToState();
	            }
	        },
	        _adjustToState: function() {
	            this._rootLayerNode._adjustToState();
	        },
	        destroy: function() {
	            dojo.disconnect(this._visHandler);
	            dojo.disconnect(this._visLayerHandler);
	            dojo.disconnect(this._maptypeIdHandler);
	        }
    });
});