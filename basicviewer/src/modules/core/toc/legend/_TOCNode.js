// _TOCNode is a node, with 3 possible types: layer(service)|layer|legend
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin"
    , "dojo/fx/Toggler", "dijit/form/HorizontalSlider", "dojo/dom", "dijit/registry", "dojo/query", "dojo/dom-class"
    , "dojo/topic"],
    function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Toggler, Slider, dom, registry, query, domClass
        , topic){
    	//Had to create a variable name for the class here, so an internal function could reference it to create new _TOCNodes
        var _TOCNode = declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
        	templateString: '<div class="agsjsTOCNode">' +
	            '<div data-dojo-attach-point="rowNode" data-dojo-attach-event="onclick:_onClick">' +
	            '<span data-dojo-attach-point="contentNode" class="agsjsTOCContent">' +
	            '<span data-dojo-attach-point="checkContainerNode"></span>' +//<input type="checkbox" data-dojo-attach-point="checkNode"/>' +
	            '<img src="${_blankGif}" alt="" data-dojo-attach-point="iconNode" />' +
	            '<span data-dojo-attach-point="labelNode" data-dojo-attach-event="onclick:_labelClick" style="cursor:pointer">' +
	            '</span></span></div>' +
	            '<div data-dojo-attach-point="containerNode" style="display: none;"> </div></div>',
	        rootLayer: null,
	        layer: null,
	        legend: null,
	        rootLayerTOC: null,
            isRootLayer: false,
	        data: null,
            //*** The event name for a root layer being clicked on
            rootLayerClick: 'rootlyrclick'
	        , _childTOCNodes: [],
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
	
	            if (this.containerNode && Toggler) {
	                this.toggler = new Toggler({
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
	                this.slider = new Slider({
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
	                var node = new _TOCNode(params);
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

            //Click event for the labels. Used by the top buttons to reorder/remove a parent level layer
            _labelClick: function(evt) {
                //Check to make sure that the label clicked on is for a parent level node (e.g. a service)
                if (this.isRootLayer) {
                    var t = evt.target;
                    if (t) {
                        //De-select any selected layer nodes by querying inside the TOC to find any node with the selected CSS class
                        var nl = query(".dijitTreeRowHover", this.rootLayerTOC.domNode.parentNode);
                        if (nl.length > 0)
                            domClass.remove(nl[0], "claro dijitTreeRowHover");
                        //Select the new node
                        domClass.add(t.parentNode.parentNode, "claro dijitTreeRowHover");
                        //Fire an event for toc.js to listen to, so it knows which layer is now selected
                        topic.publish(this.rootLayerClick, { tocNode: this.rootLayerTOC.domNode, mapLayer: this.rootLayer });
                    }
                }
            },
            //end test

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
    //Return the variable that defines the class
    return _TOCNode;
});