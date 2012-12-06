/**
 * @name Glowing Ripple for ArcGIS Server JavaScript API
 * @fileoverview
 * <p>A widget built off the code from Esri's Park Finder template</p>
 * @version 1.06
 */
dojo.provide('agsjs.dijit.GlowingRipple');

/*
 * This class is based on code from Esri's Park finder template:
 * http://www.arcgis.com/home/item.html?id=734512384d3b4b849aba2db0e33a80f2
 */
dojo.declare("agsjs.dijit.GlowingRipple", null, {
  _graphic: null,
  _intervalId: null,
  map: null,
  maxSize: 48,
  minSize: 16,
  color: [0, 100, 0, 0.25],
  interval: 100,
  outlineWidth: 4,
  stepSize: 4,
  constructor: function(params) {
    params = params || {};
    if (!params.map) {
      throw new Error('no map defined in params');
    }
    dojo.mixin(this, params);
    this.alphaStep = this.maxSize == this.minSize ? 0 : (1 - this.color[3]) / ((this.maxSize - this.minSize) / this.stepSize);
  },
  show: function(glowPoint) {
    if (!glowPoint) {
      this.hide();
    }
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
    var size = this.minSize;
    var sign = 1;
    this._intervalId = setInterval(dojo.hitch(this, function() {
      if (size >= this.maxSize) {
        sign = -1;
      } else if (size <= this.minSize) {
        sign = 1;
      }
      size = size + sign * this.stepSize;
      this.color[3] = this.color[3] + sign * this.alphaStep;
      if (!this._graphic) {
        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, size, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color(this.color), this.outlineWidth), new dojo.Color([0, 0, 0, 0]));
        this._graphic = new esri.Graphic(glowPoint, symbol, null, null);
        this.map.graphics.add(this._graphic);
      } else {
        this._graphic.symbol.size = size;
        this._graphic.symbol.outline.color.setColor(this.color);
        this._graphic.setGeometry(glowPoint);
        if (this._graphic.getLayer() == null) {
          this.map.graphics.add(this._graphic);
        }
      }
      
    }), this.interval);
  },
  hide: function() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    if (this._graphic && this._graphic.getLayer()) {
      this.map.graphics.remove(this._graphic);
    }
  },
  destroy: function() {
    this.hide();
    this._graphic = null;
  }
  
});
