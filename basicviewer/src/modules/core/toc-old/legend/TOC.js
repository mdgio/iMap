define(["dojo/_base/declare", "dijit/_WidgetBase", "./_RootLayerTOC", "xstyle/css!./css/TOC.css" ],
    function(declare, WidgetBase, _RootLayerTOC) {
        return declare([WidgetBase], {
        	indentSize: 18,
	        swatchSize: [30, 30],
	        refreshDelay: 500,
	        style: 'inline',
	        layerInfos: null,
	        slider: false,

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
	            this._rootLayerTOCs = [];
	            if (!this.layerInfos) {
	                this.layerInfos = [];
	
	
	                for (var i = this.map.layerIds.length - 1; i >= 0; i--) {
	                    var rootLayer = this.map.getLayer(this.map.layerIds[i]);
	                    // these properties defined in BasemapControl widget.
	                    // since the basemap control add/remove them requently, it's better not to show.
	                    if (!rootLayer._isBaseMap && !rootLayer._isReference) {
	                        this.layerInfos.push({
	                            layer: rootLayer
	                        });
	                    }
	
	                }
	                dojo.connect(this.map, 'onLayerAdd', this, function(layer) {
	                    this.layerInfos.push({
	                        layer: layer
	                    });
	                    this.refresh();
	                });
	                dojo.connect(this.map, 'onLayerRemove', this, function(layer) {
	                    for (var i = 0; i < this.layerInfos.length; i++) {
	                        if (this.layerInfos[i] == layer) {
	                            this.layerInfos.splice(i, 1);
	                            break;
	                        }
	                    }
	                    this.refresh();
	                });
	            }
	        },
	        // extension point
	        postCreate: function() {
	            // do we have any layerInfos without rootLayer created?
	            var createdLayers = [];
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
	            }
	        },
	        onLoad: function(){
	
	        },
	        _createRootLayer: function(lay) {
	            var rootLayer = null;
	            var type = lay.type || 'ArcGISDynamic';
	            switch (type) {
	                case 'ArcGISDynamic':
	                    rootLayer = new esri.layers.ArcGISDynamicMapServiceLayer(lay.url, lay);
	                    break;
	            }
	            return rootLayer;
	        },
	        _createTOC: function() {
	            dojo.empty(this.domNode);
	            for (var i = 0, c = this.layerInfos.length; i < c; i++) {
	                // attach a title to rootLayer layer itself
	                var rootLayer = this.layerInfos[i].layer;
	                var svcTOC = new _RootLayerTOC({
	                    rootLayer: rootLayer,
	                    info: this.layerInfos[i],
	                    toc: this
	                });
	
	
	                this._rootLayerTOCs.push(svcTOC);
	                svcTOC.placeAt(this.domNode);
	
	
	            }
	            if (!this._zoomHandler) {
	                this._zoomHandler = dojo.connect(this.map, "onZoomEnd", this, "_adjustToState");
	            }
	
	        },
	        _adjustToState: function() {
	            dojo.forEach(this._rootLayerTOCs, function(widget) {
	                widget._adjustToState();
	            });
	        },
	
	        /**
	         * Refresh the TOC to reflect
	         */
	        refresh: function() {
	            this._createTOC();
	        },
	        destroy: function() {
	            dojo.disconnect(this._zoomHandler);
	            this._zoomHandler = null;
	        }
    });
});