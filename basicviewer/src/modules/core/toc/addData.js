// The parent container for the Table of Contents and Add Data accordion
define(["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dojo/on", "dojo/_base/connect", "dijit/registry", "dojo/ready", "dojo/_base/lang"
	, "dijit/layout/AccordionContainer", "dijit/layout/ContentPane", "dojo/dom-class", "dojo/_base/fx", "dojo/_base/lang", "./legend/TOC"
    , "dojo/query", "dojo/dom-style", "../utilities/maphandler", "dojo/topic", "./add", "xstyle/css!./css/toc.css"],
    function (declare, domConstruct, WidgetBase, on, connect, registry, ready, lang
             , AccordionContainer, ContentPane, domClass, fxer, language, legendToc, query, domStyle, mapHandler, topic
             , addData) {
        //The module needs to be explicitly declared when it will be declared in markup.  Otherwise, do not put one in.
        return declare([WidgetBase, AccordionContainer], {
            //*** The ESRI map object to bind to the TOC
            esriMap: null,
            //*** The ESRI Web Map object to be used by the TOC to set properties such as title, visiblity, etc.
            webMap: null,

            // The table of contents dijit
            _dijitToc: null,
            _addDataPane: null,

            //The button bar for manipulating layers
            _searchBar: null,
            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            constructor: function (args) {
                //Automatically sets the starred properties above.
                declare.safeMixin(this, args);
            },

            //The dojo accordion, which this module inherits from, has been created and is accessible (though not actually shown yet)
            postCreate: function () {
                this.inherited(arguments);

                //Create the accordion's 2nd pane for the add data section
                this._addDataPane = new addData({
                    title: "Add Data"
                    , id: 'addDataContPane'
                });
                this.addChild(this._addDataPane);
            }

            //Use the startup handler to create a button bar in the title area of the accordion. The title nodes were not available in postcreate.
            , startup: function () {
                this.inherited(arguments);
                //selectTopic.remove();
                if (!this._addDataPane.ContentsCreated)
                    this._addDataPane.CreateContents();
            }
        });
    });