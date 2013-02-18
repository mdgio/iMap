// The parent container for the Table of Contents and Add Data accordion
define(["dojo/_base/declare", /*"jquery",*/ "dojo/dom-construct", "dijit/_WidgetBase", /*"dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",*/ "dojo/on", "dijit/registry", "dojo/ready", "dojo/parser"
	/*"dojo/text!./templates/toc.html"*/, "dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang", "./legend/TOC" /*,"xstyle/css!./css/toc.css", "jqueryui"*/],
    function(declare, /*$,*/ domConstruct, WidgetBase, /*TemplatedMixin, WidgetsInTemplateMixin,*/ dojoOn, dojoRegistry, ready, parser /*template,*/
             , AccordionContainer, ContentPane, domsty, fxer, language, legendToc){
        //The module needs to be explicitly declared when it will be declared in markup.  Otherwise, do not put one in.
        return declare(/*"modules/core/toc/toc",*/ [WidgetBase, AccordionContainer /*, TemplatedMixin, WidgetsInTemplateMixin*/], {
            // The template HTML fragment (as a string, created in dojo/text definition above)
			//templateString: template,
			// The CSS class to be applied to the root node in our template
			//baseClass: "tocdivParent",
            // During the resize event, check if the jquery accordion has been created yet
            //tocHasBeenAccordioned: false,
            // The ESRI map object to bind to the TOC
            esriMap: null,
            // The table of contents dijit
            _dijitToc: null,
            _accordion: null,

            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            constructor: function(args) {
                declare.safeMixin(this,args);
                this.esriMap = args.esriMap;
                //this._accordion = new AccordionContainer(null, 'accRoot');
                //this._accordion = new AccordionContainer(null);
                /*var legendPane = new ContentPane({
                    title: "Legend",
                    content: '<div id="tocDiv">Stuff here</div>'
                });

                var addDataPane = new ContentPane({
                    title:"Add Data",
                    content:'<div id="tocAddDiv">Stuff here</div>'
                });

                this.addChild(legendPane);
                this.addChild(addDataPane);

                this.initializeDijitToc(this.esriMap);
                legendPane.addChild(this._dijitToc);*/

                //this._accordion.startup();
            },

            postCreate: function () {
                this.inherited(arguments);
                var legendPane = new ContentPane({
                    title: "Legend"
                });

                var addDataPane = new ContentPane({
                    title:"Add Data",
                    content:'<div id="tocAddDiv">Stuff here</div>'
                });

                this.addChild(legendPane);
                this.addChild(addDataPane);

                this.initializeDijitToc(this.esriMap);
                legendPane.addChild(this._dijitToc);

            },

            //Resize event was found to be the place where jQuery accordion can be created and sized properly.
            //Once created, it is "refreshed" (resized) when the widget is resized.
            /*resize: function () {
                this.inherited(arguments);
                if (this.tocHasBeenAccordioned) {
                    $(this.domNode.children[0]).accordion("refresh");
                } else {
                    //The jquery heightstyle: "fill" - will fill out the enclosing div to the full height
                    $(this.domNode.children[0]).accordion({ heightStyle: "fill",
                        create: function(e) {
                            //Get a reference to the toc widget, as the scope in here is tied to the accordion, then set property
                            dojoRegistry.getEnclosingWidget(e.target).tocHasBeenAccordioned = true;
                        }
                    });
                }
            },*/

            // Create the toc dijit, if needed, otherwise do nothing.  If esriMap has already been set, do not need to pass in again.
            initializeDijitToc: function(esriMap) {
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
                theTocLayerInfos = [];
                for(var j = this.esriMap.layerIds.length - 1; j >= 0; j--) {
                    var agsLayer = this.esriMap.getLayer(this.esriMap.layerIds[j]);
                    theTocLayerInfos.push({ layer: agsLayer, slider: true })
                }

                this._dijitToc = new legendToc({
                        map: this.esriMap,
                        layerInfos: theTocLayerInfos
                    }/*, 'tocDiv'*/);
                //this._dijitToc.startup();
            }
        });
});