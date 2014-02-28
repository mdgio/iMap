// The parent container for the Table of Contents and Add Data accordion
define(["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dojo/on", "dojo/_base/connect", "dijit/registry", "dojo/ready", "dojo/_base/lang"
	, "dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dojo/dom-class", "dojo/_base/fx", "dojo/_base/lang"
    , "dojo/query", "dojo/dom-style", "../utilities/maphandler", "dojo/topic", "./querying", "./qResults", "xstyle/css!./css/querying.css", ],
    function (declare, domConstruct, WidgetBase, on, connect, registry, ready, lang
             , AccordionContainer, ContentPane, domClass, fxer, language, query, domStyle, mapHandler, topic
             , querying, qResults) {
        //The module needs to be explicitly declared when it will be declared in markup.  Otherwise, do not put one in.
        return declare([WidgetBase, AccordionContainer], {
            //*** The ESRI map object to bind to querying tab
            esriMap: null,
            //*** The ESRI Web Map object to be used by the querying tab, properties such as title, visiblity, etc.
            webMap: null,

            // The querying dijits
            _queryingPane: null,
            _resultsPane: null,
			
            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            constructor: function (args) {
                //Automatically sets the starred properties above.
                declare.safeMixin(this, args);
            },

            //The dojo accordion, which this module inherits from, has been created and is accessible (though not actually shown yet)
            postCreate: function () {
                this.inherited(arguments);

                //Create the accordion's 1st pane for the querying section
                this._queryingPane = new querying({
                    title: "Query Features"
                    , id: 'queryingPane'
                });
                this.addChild(this._queryingPane);

                //Create the accordion's 2nd pane for the querying section
				// removed in favor of the FloatingPane delivery or results
                /* this._resultsPane = new qResults({
                    title: "Results"
                    , id: 'resultsPane'
                }); 
                this.addChild(this._resultsPane); */
								
            }

            //Use the startup handler to create a button bar in the title area of the accordion. The title nodes were not available in postcreate.
            , startup: function () {
                this.inherited(arguments);

            }
        });
    });