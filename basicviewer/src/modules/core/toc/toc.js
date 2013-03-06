// The parent container for the Table of Contents and Add Data accordion
define(["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dojo/on", "dijit/registry", "dojo/ready", "dojo/parser"
	, "dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dojo/dom-class", "dojo/_base/fx", "dojo/_base/lang", "./legend/TOC"
    , "./btnbar", "dojo/query", "dojo/dom-style", "../utilities/maphandler", "xstyle/css!./css/toc.css"],
    function(declare, domConstruct, WidgetBase, dojoOn, registry, ready, parser
             , AccordionContainer, ContentPane, domClass, fxer, language, legendToc, btnBar, query, domStyle, mapHandler){
        //The module needs to be explicitly declared when it will be declared in markup.  Otherwise, do not put one in.
        return declare(/*"modules/core/toc/toc",*/ [WidgetBase, AccordionContainer /*, TemplatedMixin, WidgetsInTemplateMixin*/], {
            //*** The ESRI map object to bind to the TOC
            esriMap: null,
            //*** The ESRI Web Map object to be used by the TOC to set properties such as title, visiblity, etc.
            webMap: null,

            // The table of contents dijit
            _dijitToc: null,
            _accordion: null,
            selectedElement: null,
            tocParent: null,


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
                    style: "padding: 0px"/*,
                    content: '<button onclick="dijit.registry.byId(\'dijit_layout_AccordionContainer_0\').moveSelectedUp()">Move Up</button><button onclick="dijit.registry.byId(\'dijit_layout_AccordionContainer_0\').moveSelectedDown()">Move Down</button><button onclick="dijit.registry.byId(\'dijit_layout_AccordionContainer_0\').removeSelected()">Remove</button>'
                    *///<button onclick="dijit.registry.byId(\'dijit_layout_AccordionContainer_0\').AddNew()">Add</button>
                });
                domClass.add(legendPane.domNode, 'tocLegendPane');

                //Create the accordion's 2nd pane for the add data section
                var addDataPane = new ContentPane({
                    title:"Add Data",
                    content:'<div id="tocAddDiv">Stuff here</div>'
                });
                //Add the panes to the accordion
                this.addChild(legendPane);
                this.addChild(addDataPane);
                //Create the actual legend "tree" and add to the first pane
                this.initializeDijitToc(this.esriMap);
                legendPane.addChild(this._dijitToc);

                //This is just for testing
                this.tocParent = registry.byId('dijit__WidgetBase_0');
            },

            //Use the startup handler to create a button bar in the title area of the accordion. The title nodes were not available in postcreate.
            startup: function () {
                this.inherited(arguments);

                var buttons = new btnBar();
                //Find the title pane dom nodes within the table of contents module by querying on the specific styles using dojo/query
                var titlePanes = query('#tocPanel .dijitAccordionTitle');
                if (titlePanes.length > 0) {
                    //Set the height of the first title pane (Legend) and insert the buttons there
                    var firstPane = titlePanes[0];
                    domStyle.set(firstPane, "height", "30px");
                    var closeDiv = domConstruct.place(buttons.domNode, firstPane);
                }
                buttons.startup();
                //Click events for button bar
                buttons.on('lyrbtnclick', function (e) {
                    if (e.btn === 'u') { //Move the selected map layer up
                        this.moveSelectedUp();
                    } else if (e.btn === 'd') { //Move the selected map layer down
                        this.moveSelectedDown();
                    } else { //Remove the map layer
                        this.removeSelected();
                    }
                });
            },

            //Test
            moveSelectedUp: function () {
                var previousOne;
                var parent = this.tocParent.domNode;
                if (this.selectedElement) {
                    //parent = this.selectedElement.parentNode;
                    previousOne = this.selectedElement.previousElementSibling;
                }
                if (previousOne)
                    parent.insertBefore(this.selectedElement, previousOne);
            },
            moveSelectedDown: function () {
                var nextOne;
                var twoDown;
                var parent = this.tocParent.domNode;
                if (this.selectedElement) {
                    //parent = this.selectedElement.parentNode;
                    nextOne = this.selectedElement.nextElementSibling;
                    if (nextOne) {
                        twoDown = nextOne.nextElementSibling;
                        if (twoDown)
                            parent.insertBefore(twoDown, this.selectedElement);
                        else if (this.selectedElement)
                            parent.appendChild(this.selectedElement);
                    }
                }
            },
            removeSelected: function () {
                if (this.selectedElement) {
                    this.selectedElement.parentNode.removeChild(this.selectedElement);
                    this.selectedElement = null;
                }
            },
            AddNew: function () {
                var parent = this.tocParent;
                //var parent = document.getElementById("topdog");
                var max = -1;
                var current;
                if (parent) {
                    for (var i = 0; i < parent.children.length; i++) {
                        current = parseInt(parent.children[i].id, 10);
                        max = (current > max) ? current : max;
                    }
                    max++;
                    var div = document.createElement("div");
                    div.id = max;
                    div.className = 'unselected';
                    div.innerHTML = max;
                    div.onclick = mFunc;

                    parent.appendChild(div);
                }
            },
            /*mFunc: function (e) {
                var curId = (e.currentTarget) ? e.currentTarget.id : e.id;
                var f = document.getElementById(curId);
                if (selectedElement)
                    selectedElement.className = 'unselected';
                selectedElement= f;
                f.className = 'selected';
            },*/
            //end test

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
                /*theTocLayerInfos = [];
                 for(var j = this.esriMap.layerIds.length - 1; j >= 0; j--) {
                 var agsLayer = this.esriMap.getLayer(this.esriMap.layerIds[j]);
                 theTocLayerInfos.push({ layer: agsLayer, slider: true })
                 }*/

                this._dijitToc = new legendToc({
                        map: this.esriMap
                        , webMap: mapHandler.CustomizedWebMap || mapHandler.OriginalWebMap /*,
                        layerInfos: theTocLayerInfos*/
                });
                //this._dijitToc.startup();
            }
        });
});