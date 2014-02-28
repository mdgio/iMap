/**
* The Add Data dijit. Loads a JSON object of services and their URLs into a dijit tree. User can then add them to the map. It is setup to allow
* the use of multiple trees of services to be swapped in/out.
* Using dojo/_base/connect to connect to map event fxns. This is deprecated along with dojo.connect, but the seemingly appropriate
* connector (dojo/aspect) does not obtain the proper callback parameters.
*/
define(["dojo/_base/declare", "dijit/_WidgetBase", "dojo/dom", "dojo/json", "dojo/store/Memory", "dijit/tree/ObjectStoreModel", "dijit/Tree", "dijit/layout/ContentPane"
    , "../utilities/maphandler", "dojo/_base/lang", "dijit/TooltipDialog", "dijit/registry", "dijit/popup", "dojo/on", "dijit/form/Button", "dojox/widget/Standby"
    , "dojo/dom-construct", "dojo/_base/connect", "../utilities/environment"],
    function (declare, WidgetBase, dom, json, Memory, ObjectStoreModel, Tree, ContentPane, mapHandler, lang, TooltipDialog, registry, popup, on, Button
        , Standby, domConstruct, connect, environment) {
        return declare([WidgetBase, ContentPane], {
            //*** The ESRI map object
            map: null
            // Once a tree has been created and before switching to another, store it here to use again later if needed (_switchTree)
            /* an item in the list looks like
            {index: <corresponding to _layersJsonLoc index>, store: <MemoryStore>, model: <ObjectStoreModel>, tree: <dijit/tree>}
            */
            , _createdTrees: []
            // The current tree showing in pane. Same object as added to list above
            , _currentTree: null
            //Available for parent to know if add data contents have been created
            , ContentsCreated: false
            , _toolTipDialog: null
            , _paneStandby: null
            //These two items just track the currently selected node for adding to the map
            , _selectedItem: null
            , _selectedNode: null

            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            , constructor: function (args) {
                this.inherited(arguments);
                this.map = mapHandler.map;
            }

            //The dojo accordion, which this module inherits from, has been created and is accessible (though not actually shown yet)
            , startup: function () {
                this.inherited(arguments);
                var dgridDiv = dojo.create("div", { id: "dgridDiv" });
                var dgridContainer = dojo.create("div", { id: "dgridContainer", style: "height:500px"});
                dgridDiv.appendChild(dgridContainer);
                dojo.place(dgridDiv, this.containerNode, "first");
            }
            //The ContentPane has been created, but the actual contents are not created until the tab pane is clicked on, which calls this function
            , CreateContents: function () {
                this.ContentsCreated = true;
                //Show the first tree in the list on initial viewing
                this._switchTree(0);
            }

        });
    });
