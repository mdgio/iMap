/**
 * @name Table of Contents (TOC) widget for ArcGIS Server JavaScript API
 * @author: Nianwei Liu
 * @fileoverview
 * <p>A TOC (Table of Contents) widget for ESRI ArcGIS Server JavaScript API. The namespace is <code>agsjs</code></p>
 * @version 1.06
 */
// change log: 
// 2012-08-21: fix dojo.fx load that caused IE has to refresh to see TOC.
// 2012-07-26: add ready so it works with compact built (missing dijit._Widget, dijit._Templated).
// 2012-07-23: sync and honor setVisibleLayers.
// 2012-07-19: xdomain build
// 2012-07-18: upgrade to JSAPI v3.0
// 2012-02-02: fix IE7&8 problem when there is "all other value"(default symbol) 
// 2011-12-20: refresh method
// 2011-11-04: v1.06: uniquevalue renderer check on/off using definitions. group layer on/off. change css class name. inline style as default. deprecate standard style
// 2011-08-11: support for not showing legend or layer list; slider at service level config; removed style background.

/*global dojo esri*/
// reference: http://dojotoolkit.org/reference-guide/quickstart/writingWidgets.html

dojo.provide('agsjs.dijit.TOC');
dojo.require("dojo.fx.Toggler");
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.form.Slider');

(function() {
    var link = dojo.create("link", {
        type: "text/css",
        rel: "stylesheet",
        href: dojo.moduleUrl("agsjs.dijit", "css/TOC.css")
    });
    dojo.doc.getElementsByTagName("head")[0].appendChild(link);
}());

/**
 * _TOCNode is a node, with 3 possible types: layer(service)|layer|legend
 * @private
 */
dojo.ready(function(){


    dojo.declare("agsjs.dijit._TOCNode", [dijit._Widget, dijit._Templated], {
        //templateString: dojo.cache('agsjs.dijit', 'templates/tocNode.html'),
        templateString: '<div class="agsjsTOCNode">' +
            '<div data-dojo-attach-point="rowNode" data-dojo-attach-event="onclick:_onClick">' +
            '<span data-dojo-attach-point="contentNode" class="agsjsTOCContent">' +
            '<span data-dojo-attach-point="checkContainerNode"></span>' +//<input type="checkbox" data-dojo-attach-point="checkNode"/>' +
            '<img src="${_blankGif}" alt="" data-dojo-attach-point="iconNode" />' +
            '<span data-dojo-attach-point="labelNode">' +
            '</span></span></div>' +
            '<div data-dojo-attach-point="containerNode" style="display: none;"> </div></div>',
        rootLayer: null,
        layer: null,
        legend: null,
        rootLayerTOC: null,
        data: null,
        _childTOCNodes: [],
        constructor: function(params, srcNodeRef) {
            dojo.mixin(this, params);

        },
        // extension point. called automatically after widget DOM ready.
        postCreate: function() {

            dojo.style(this.rowNode, 'paddingLeft', '' + this.rootLayerTOC.toc.indentSize * this.rootLayerTOC._currentIndent + 'px');
            // using the availability of certain property to decide what kind of node to create
            this.data = this.legend || this.layer || this.rootLayer;
            this.blank = this.iconNode.src;

            if (this.legend) {
                this._createLegendNode(this.legend);
            } else if (this.layer) {
                this._createLayerNode(this.layer);

            } else if (this.rootLayer) {
                this._createRootLayerNode(this.rootLayer);
            }

            if (this.containerNode && dojo.fx.Toggler) {
                this.toggler = new dojo.fx.Toggler({
                    node: this.containerNode,
                    showFunc: dojo.fx.wipeIn,
                    hideFunc: dojo.fx.wipeOut
                })
            }


            if (!this._noCheckNode) {
                var chk;
                if (dijit.form && dijit.form.CheckBox) {
                    chk = new dijit.form.CheckBox({ // looks a bug in dijit. image not renderered until mouse over. bug was closed but still exist.
                        // use attr('checked', true) not working either.
                        checked: this.data.visible
                    });
                    chk.placeAt(this.checkContainerNode);//contentNode, 'first');
                    chk.startup();
                } else {
                    chk = dojo.create('input', {
                        type: 'checkbox',
                        checked: this.data.visible
                    }, this.checkContainerNode);//this.contentNode, 'first');
                }
                this.checkNode = chk;
            }



            var show = this.data.visible;
            // if it is a group layer and no child layer is visible, then collapse

            if (this.data._subLayerInfos) {
                var noneVisible = true;
                dojo.every(this.data._subLayerInfos, function(info) {
                    if (info.visible) {
                        noneVisible = false;
                        return false;
                    }
                    return true;
                });
                if (noneVisible)
                    show = false;
            }

            if (this.data.collapsed)
                show = false;
            if (this.iconNode && this.iconNode.src == this.blank) {
                dojo.addClass(this.iconNode, 'dijitTreeExpando');
                dojo.addClass(this.iconNode, show ? 'dijitTreeExpandoOpened' : 'dijitTreeExpandoClosed');
            }
            if (this.containerNode)
                dojo.style(this.containerNode, 'display', show ? 'block' : 'none');

            if (this.rootLayerTOC.toc.style == 'standard' && this.iconNode && this.checkNode) {
                dojo.place(this.iconNode, this.checkNode.domNode || this.checkNode, 'before');
            }

        },
        // root level node
        _createRootLayerNode: function(rootLayer) {
            dojo.addClass(this.rowNode, 'agsjsTOCRootLayer');
            dojo.addClass(this.labelNode, 'agsjsTOCRootLayerLabel');

            var title = this.rootLayerTOC.info.title;
            if (title === '') {
                esri.hide(this.rowNode);
                rootLayer.show();
                this.rootLayerTOC._currentIndent--;
            }
            rootLayer.collapsed = this.rootLayerTOC.info.collapsed;
            if (this.rootLayerTOC.info.slider) {
                this.sliderNode = dojo.create('div', {
                    'class': 'agsjsTOCSlider'
                }, this.rowNode, 'last');//
                this.slider = new dijit.form.HorizontalSlider({
                    showButtons: false,
                    value: rootLayer.opacity * 100,
                    intermediateChanges: true,
                    //style: "width:100%;padding:0 20px 0 20px",
                    tooltip: 'adjust transparency',
                    onChange: function(value) {
                        rootLayer.setOpacity(value / 100);
                    },
                    layoutAlign: 'right'
                });
                this.slider.placeAt(this.sliderNode);
                dojo.connect(rootLayer, 'onOpacityChange', this, function(op) {
                    var s = this.slider;
                    this.slider.setValue(op * 100);
                });
            }
            if (!this.rootLayerTOC.info.noLegend) {
                this._createChildrenNodes(rootLayer._tocInfos, 'layer');
            } else {
                dojo.style(this.iconNode, 'visibility', 'hidden');
            }
            this.labelNode.innerHTML = title;
            dojo.attr(this.rowNode, 'title', title);
        },
        // a layer inside a map service.
        _createLayerNode: function(layer) {
            // layer: layerInfo with nested subLayerInfos
            this.labelNode.innerHTML = layer.name;
            if (layer._subLayerInfos) {// group layer
                dojo.addClass(this.rowNode, 'agsjsTOCGroupLayer');
                dojo.addClass(this.labelNode, 'agsjsTOCGroupLayerLabel');
                if (this.rootLayerTOC.info.showGroupCount) {
                    this.labelNode.innerHTML = layer.name + ' (' + layer._subLayerInfos.length + ')';
                }
                this._createChildrenNodes(layer._subLayerInfos, 'layer');
            } else {
                dojo.addClass(this.rowNode, 'agsjsTOCLayer');
                dojo.addClass(this.labelNode, 'agsjsTOCLayerLabel');
                //2012-07-21: if setVisibility is called before this widget is built, we want to use the actual visibility instead of the layerInfo.
                if (this.rootLayer.visibleLayers){
                    if (dojo.indexOf(this.rootLayer.visibleLayers, layer.id)==-1){
                        layer.visible = false;
                    } else {
                        layer.visible = true;
                    }
                }
                if (this.rootLayer.tileInfo) {
                    // can not check on/off for tiled
                    // dojo.destroy(this.checkNode);
                    //this.checkNode = null;
                    this._noCheckNode = true;
                }
                if (layer.renderer && !this.rootLayerTOC.info.noLegend && this.rootLayerTOC.info.mode != 'legend') {
                    if (this.rootLayerTOC.toc.style == 'inline' && layer.renderer.symbol) {
                        this._setIconNode(layer.renderer, this.iconNode, this);
                        dojo.destroy(this.containerNode);
                        this.containerNode = null;
                    } else if (layer.renderer instanceof esri.renderer.SimpleRenderer) {
                        this._createChildrenNodes([layer.renderer], 'legend');
                    } else {
                        var rends = layer.renderer.infos;
                        if (layer.renderer.defaultSymbol) {
                            // 2012-02-02: IE7&8 may crash when there is default symbol to be draw with graphics.
                            // in this case, transfer the default symbol from legend to renderer.
                            rends = [{
                                symbol: layer.renderer.defaultSymbol,
                                label: layer.renderer.defaultLabel,
                                isDefault: true,
                                url: layer.renderer.url, // note it is merged from _createRootLayerTOC
                                imageData: layer.renderer.imageData,// note it is merged from _createRootLayerTOC
                                value: "*"
                            }].concat(rends);
                        }
                        this._createChildrenNodes(rends, 'legend');
                    }
                } else if (layer.legends && !this.rootLayerTOC.info.noLegend) {
                    if (this.rootLayerTOC.toc.style == 'inline' && layer.legends.length == 1) {
                        this.iconNode.src = this._getLegendIconUrl(layer.legends[0]);
                        dojo.destroy(this.containerNode);
                        this.containerNode = null;
                    } else {
                        this._createChildrenNodes(layer.legends, 'legend');
                    }
                } else {
                    dojo.destroy(this.iconNode);
                    this.iconNode = null;
                    dojo.destroy(this.containerNode);
                    this.containerNode = null;
                }
            }
            //this.rootLayerTOC._layerWidgets.push(this);
        },
        _createLegendNode: function(rendLeg) {
            //{label:, url: , imageData}
            // here we use a pre-defined rule: if there is a definition expression we will make this layer's unique value on/off
            // note, there is a bug in ArcGIS server (as of 10.01) if the service expession has "OR", the request expression has no effect
            // unless the service expression is enclosed with "()"
            // you can put a bugus "1=1" expression to flag this layer for definition operation.
            rendLeg.visible = false;
            if (this.layer && this.layer.definitionExpression) {
                // for now only support unique
                if (this.layer.renderer && this.layer.renderer instanceof esri.renderer.UniqueValueRenderer && !this.layer.renderer.attributeField2) {
                    if (!rendLeg.isDefault && this.rootLayerTOC.toc.style == 'inline' && this.rootLayerTOC.info.mode != 'legend') {
                        rendLeg.visible = true;
                    }
                }
            }
            if (!rendLeg.visible) {
                //dojo.style(this.checkNode, 'visibility', 'hidden');
                this._noCheckNode = true;
            }
            dojo.destroy(this.containerNode);
            dojo.addClass(this.labelNode, 'agsjsTOCLegendLabel');
            this._setIconNode(rendLeg, this.iconNode, this);
            this.labelNode.appendChild(document.createTextNode(rendLeg.label));

        },
        // set url or replace node
        _setIconNode: function(rendLeg, iconNode, tocNode) {
            var src = this._getLegendIconUrl(rendLeg);
            if (!src || this.rootLayerTOC.info.mode == 'layers') {
                if (rendLeg.symbol) {
                    var sym = this._createSymbol(rendLeg.symbol);
                    dojo.place(sym, iconNode, 'replace');
                    tocNode.iconNode = sym;
                }
            } else {
                iconNode.src = src;
                if (rendLeg.symbol && rendLeg.symbol.width && rendLeg.symbol.height) {
                    // iconNode.width = rendLeg.symbol.width;
                    //  iconNode.height = rendLeg.symbol.height;
                }
            }

        },
        _createSymbol: function(symbol) {
            var w = this.rootLayerTOC.toc.swatchSize[0], h = this.rootLayerTOC.toc.swatchSize[1];
            if (symbol.width && symbol.height) {
                w = symbol.width;
                h = symbol.height;
            }
            var node = dojo.create('span', {
                style: "width:" + w + ";height:" + h
            });
            var mySurface = dojox.gfx.createSurface(node, w, h);
            var descriptors = esri.symbol.getShapeDescriptors(symbol);
            if (descriptors) {
                var shape = mySurface.createShape(descriptors.defaultShape).setFill(descriptors.fill).setStroke(descriptors.stroke);
                shape.applyTransform({
                    dx: w / 2,
                    dy: h / 2
                });
            }

            return node;
        },
        _getLegendIconUrl: function(legend) {
            var src = legend.url;
            // in some cases NULL value may cause #legend != #of renderer entry.
            if (src != null && src.indexOf('data') == -1) {
                if (!dojo.isIE && legend.imageData && legend.imageData.length > 0) {
                    src = "data:image/png;base64," + legend.imageData;
                } else {
                    if (src.indexOf('http') !== 0) {
                        // resolve relative url
                        src = this.rootLayer.url + '/' + this.layer.id + '/images/' + src;
                    }
                }
            }
            return src;
        },
        _createChildrenNodes: function(chdn, type) {
            this.rootLayerTOC._currentIndent++;
            var c = [];


            //dojo.forEach(chdn, function(chd) {
            for (var i = 0, n = chdn.length; i < n; i++) {
                var chd = chdn[i];
                var params = {
                    rootLayerTOC: this.rootLayerTOC,
                    rootLayer: this.rootLayer,
                    layer: this.layer,
                    legend: this.legend
                };
                params[type] = chd;
                params.data = chd;
                var node = new agsjs.dijit._TOCNode(params);
                node.placeAt(this.containerNode);

                c.push(node);

            }//, this);
            this._childTOCNodes = c;
            this.rootLayerTOC._currentIndent--;
        },
        _toggleContainer: function(on) {

            if (dojo.hasClass(this.iconNode, 'dijitTreeExpandoClosed') ||
                dojo.hasClass(this.iconNode, 'dijitTreeExpandoOpened')) {
                // make sure its not clicked on legend swatch
                if (on) {
                    dojo.removeClass(this.iconNode, 'dijitTreeExpandoClosed');
                    dojo.addClass(this.iconNode, 'dijitTreeExpandoOpened');
                } else if (on === false) {
                    dojo.removeClass(this.iconNode, 'dijitTreeExpandoOpened');
                    dojo.addClass(this.iconNode, 'dijitTreeExpandoClosed');
                } else {
                    dojo.toggleClass(this.iconNode, 'dijitTreeExpandoClosed');
                    dojo.toggleClass(this.iconNode, 'dijitTreeExpandoOpened');
                }
                if (this.toggler) {
                    if (dojo.hasClass(this.iconNode, 'dijitTreeExpandoOpened')) {
                        this.toggler.show();
                    } else {
                        this.toggler.hide();
                    }
                } else {
                    esri.toggle(this.containerNode);
                }
            }
        },
        _adjustToState: function() {
            if (this.checkNode) {
                var checked = this.legend ? this.legend.visible : this.layer ? this.layer.visible : this.rootLayer ? this.rootLayer.visible : false;
                if (this.checkNode.set) {
                    this.checkNode.set('checked', checked);
                } else {
                    this.checkNode.checked = checked;
                }

            }
            if (this.layer) {
                var scale = esri.geometry.getScale(this.rootLayerTOC.toc.map);
                var outScale = (this.layer.maxScale != 0 && scale < this.layer.maxScale) || (this.layer.minScale != 0 && scale > this.layer.minScale);
                if (outScale) {
                    dojo.addClass(this.domNode, 'agsjsTOCOutOfScale');
                } else {
                    dojo.removeClass(this.domNode, 'agsjsTOCOutOfScale');
                }
                if (this.checkNode) {
                    if (this.checkNode.set) {
                        this.checkNode.set('disabled', outScale);
                    } else {
                        this.checkNode.disabled = outScale;
                    }
                }
            }
            if (this._childTOCNodes.length > 0) {
                dojo.forEach(this._childTOCNodes, function(child) {
                    child._adjustToState();
                });
            }

        },
        _onClick: function(evt) {

            var t = evt.target;
            if (t == this.checkNode || dijit.getEnclosingWidget(t) == this.checkNode) {
                if (this.legend) {
                    // this is a check legend
                    var renderer = this.layer.renderer;
                    this.legend.visible = this.checkNode.checked;
                    var def = [];
                    if (renderer instanceof esri.renderer.UniqueValueRenderer) {
                        // find type of attribute field and decide if need quote
                        var q = '';
                        if (this.layer.fields) {
                            dojo.forEach(this.layer.fields, function(field) {
                                if (field.name.toLowerCase() == renderer.attributeField.toLowerCase()) {
                                    switch (field.type) {
                                        case 'esriFieldTypeString':
                                            q = '\'';
                                    }
                                }
                            });
                        }
                        dojo.forEach(renderer.infos, function(info) {
                            if (info.visible) {
                                /*var seg = '(' + renderer.attributeField;
                                 if (info.value) {
                                 seg += '=' + q+info.value+q;
                                 }
                                 seg += ')';
                                 def.push(seg)*/
                                def.push(q + info.value + q);
                            }

                        }, this);
                        if (def.length == renderer.infos.length) {
                            this.layer._definitionExpression = '';
                        } else if (def.length == 0) {
                            // nothing is checked, so we set the sub layer off
                            this.layer.visible = false;
                            // even if the layer is checked on, if there is no sub type on, it should not show anything.
                            //this.layer._definitionExpression = '1=2';
                        } else {
                            this.layer.visible = true;
                            this.layer._definitionExpression = renderer.attributeField + ' IN (' + def.join(',') + ')';// def.join(' OR ');
                        }
                    }

                    this.rootLayer.setVisibleLayers(this._getVisibleLayers(), true);
                    this.rootLayer.setLayerDefinitions(this._getLayerDefs(), true);
                    this.rootLayerTOC._refreshLayer();
                } else if (this.layer) {
                    this.layer.visible = this.checkNode && this.checkNode.checked;

                    // if a sublayer is checked on, force it's group layer to be on.
                    if (this.layer._parentLayerInfo && !this.layer._parentLayerInfo.visible) {
                        this.layer._parentLayerInfo.visible = true;
                    }
                    // if a layer is on, it's service must be on.
                    if (this.layer.visible && !this.rootLayer.visible) {
                        this.rootLayer.show();//.visible = true;
                    }
                    if (this.layer._subLayerInfos) {
                        // this is a group layer;
                        dojo.forEach(this.layer._subLayerInfos, function(info) {
                            info.visible = this.layer.visible;
                        }, this);
                    }
                    if (this.layer.renderer) {
                        dojo.forEach(this.layer.renderer.infos, function(info) {

                            info.visible = this.layer.visible;

                        }, this);
                        this.layer._definitionExpression = '';
                    }
                    this.rootLayer.setLayerDefinitions(this._getLayerDefs(), true);
                    this.rootLayer.setVisibleLayers(this._getVisibleLayers(), true);
                    this.rootLayerTOC._refreshLayer();

                } else if (this.rootLayer) {
                    this.rootLayer.setVisibility(this.checkNode && this.checkNode.checked);
                }
                // automatically expand/collapse?
                if (this.rootLayerTOC.toc.style == 'inline') {
                    this._toggleContainer(this.checkNode && this.checkNode.checked);
                }
                this.rootLayerTOC._adjustToState();

            } else if (t == this.iconNode) {
                this._toggleContainer();
            }
        },
        _getVisibleLayers: function() {
            var vis = [];
            dojo.forEach(this.rootLayer.layerInfos, function(layerInfo) {
                if (layerInfo.subLayerIds) {
                    // if a group layer is set to vis, all sub layer will be drawn regardless it's sublayer status
                    return;
                } else if (layerInfo.visible) {
                    //if (!layerInfo._parentLayerInfo || layerInfo._parentLayerInfo.visible) {
                    vis.push(layerInfo.id);
                    // }
                }

            });
            if (vis.length === 0) {
                vis.push(-1);
            } else if (!this.rootLayer.visible) {
                this.rootLayer.show();
            }
            return vis;
        },
        _getLayerDefs: function() {
            var defs = [];
            dojo.forEach(this.rootLayer.layerInfos, function(layerInfo, i) {
                if (layerInfo._definitionExpression) {
                    defs[i] = layerInfo._definitionExpression;
                }
            });
            return defs;
        }

    });

    dojo.declare('agsjs.dijit._RootLayerTOC', [dijit._Widget], {
        _currentIndent: 0,
        rootLayer: null,
        toc: null,
        constructor: function(params, srcNodeRef) {
            this.rootLayer = params.rootLayer;
            this.toc = params.toc;
            this.info = params.info || {};
        },
        // extenstion point called by framework
        postCreate: function() {
            this._getLayerInfos();
        },
        // retrieve sublayer/legend data
        _getLayerInfos: function() {

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
            this._rootLayerNode = new agsjs.dijit._TOCNode({
                rootLayerTOC: this,
                rootLayer: layer
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

    dojo.declare("agsjs.dijit.TOC", [dijit._Widget], {
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
                var svcTOC = new agsjs.dijit._RootLayerTOC({
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