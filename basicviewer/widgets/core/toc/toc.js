// widgets.core.toc
define(["jquery", "dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dijit/registry", "dojo/ready", "dojo/parser",
	"dojo/text!./templates/toc.html", "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang" /*, "../dijit/TOC"*/, "jqueryui"],
    function($, declare, domConstruct, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, dojoOn, dojoRegistry, ready, parser, template, domsty, fxer, language /*, tocDijit*/){
        //return declare([WidgetBase, TemplatedMixin], {
        declare("widgets/core/toc/toc", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
        //declare([WidgetBase, TemplatedMixin], {

            // The template HTML fragment (as a string, created in dojo/text definition above)
			templateString: template,
			// The CSS class to be applied to the root node in our template
			baseClass: "tocdivBig",
            // During the resize event, tell if the jquery accordion has been created yet
            tocHasBeenAccordioned: false,
            // The ESRI map object to bind to the TOC
            _esriMap: null,
            // The table of contents dijit
            _dijitToc: null,

            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            constructor: function() {
                this.inherited(arguments);
            },

            postMixInProperties: function() {
                this.inherited(arguments);
            },

            buildRendering: function () {
                this.inherited(arguments);
            },

            postCreate: function () {
                this.inherited(arguments);
            },

            startup: function () {
                this.inherited(arguments);
            },

            //Resize event was found to be the place where jQuery accordion can be created and sized properly.
            //Once created, it is "refreshed" (resized) when the widget is resized.
            resize: function () {
                this.inherited(arguments);
                //console.log('widget resized');
                if (this.tocHasBeenAccordioned) {
                    $(this.domNode.children[0]).accordion("refresh");
                    //console.log('acc refreshed');
                } else {
                    //The jquery heightstyle: "fill" - will fill out the enclosing div to the full height
                    $(this.domNode.children[0]).accordion({ heightStyle: "fill",
                        create: function(e) {
                            //Get a reference to the toc widget, as the scope in here is tied to the accordion, then set property
                            dojoRegistry.getEnclosingWidget(e.target).tocHasBeenAccordioned = true;
                            //console.log('accordion created');
                        }
                    });
                }
                //console.log('widget resize end');
            },

            // Create the toc dijit, if needed, otherwise do nothing.  If _esriMap has already been set, do not need to pass in again.
            initializeDijitToc: function(esriMap) {
                var tocIsCreated = false;
                if (esriMap != null && (this._esriMap == null || this._esriMap != esriMap)) {
                    this._esriMap = esriMap;
                    this._createDijitToc();
                    tocIsCreated = true;
                }
                if (this._esriMap != null && this._dijitToc == null) {
                    this._createDijitToc();
                    tocIsCreated = true;
                }
                return tocIsCreated;
            },

            //Create the Table of Contents/Legend Dijit. Destroy an existing one if present.
            _createDijitToc: function() {
                if (this._dijitToc != null)
                    this._dijitToc.destroyRecursive();
                //dojo.require('widgets.core.dijit.TOC');
                //dojo.addOnLoad(function() {
                    //this._dijitToc = new tocDijit({
                    //this._dijitToc = new widgets.core.dijit.TOC({
                //Override the default of the TOC to show a visibility slider for the service layers
                theTocLayerInfos = [];
                for(var j = this._esriMap.layerIds.length - 1; j >= 0; j--) {
                    var agsLayer = this._esriMap.getLayer(this._esriMap.layerIds[j]);
                    //alert(agsLayer.id + ' ' + agsLayer.opacity + ' ' + agsLayer.visible);
                    theTocLayerInfos.push({ layer: agsLayer, slider: true })
                }

                this._dijitToc = new agsjs.dijit.TOC({
                    map: this._esriMap,
                    layerInfos: theTocLayerInfos
                }, 'tocDiv');
                this._dijitToc.startup();
            }
        });
});