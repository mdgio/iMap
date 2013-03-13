/**
 * The Add Data dijit. Loads a JSON object of services and their URLs into a dijit tree. User can then add them to the map.
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dojo/dom", "dojo/json", "dojo/store/Memory", "dijit/tree/ObjectStoreModel", "dijit/Tree", "dijit/layout/ContentPane"
    , "../../utilities/maphandler", "dojo/_base/lang", "dijit/TooltipDialog", "dijit/popup", "dojo/on", "dijit/form/Button", "dojox/widget/Standby"
    , "dojo/dom-construct"],
    function (declare, WidgetBase, dom, json, Memory, ObjectStoreModel, Tree, ContentPane, mapHandler, lang, TooltipDialog, popup, on, Button
        , Standby, domConstruct) {
        return declare([WidgetBase, ContentPane], {
            //*** The ESRI map object
            map: null
            // A list of URL locations (relative path, maybe absolute- haven't tested) to JSON layers objects
            , _layersJsonLoc: ["AddLayers.js"]
            // Once a tree has been created and before switching to another, store it here to use again later if needed (_switchTree)
            /* an item in the list looks like
                {index: <corresponding to _layersJsonLoc index>, store: <MemoryStore>, model: <ObjectStoreModel>, tree: <dijit/tree>}
             */
            , _createdTrees: []
            // The current tree showing in pane. Same object as added to list above
            , _currentTree: null
            , _toolTipDialog: null
            , _paneStandby: null

            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            , constructor: function(args) {
                this.inherited(arguments);
                this.map = mapHandler.map;
            }

            //The dojo accordion, which this module inherits from, has been created and is accessible (though not actually shown yet)
            , startup: function () {
                this.inherited(arguments);
                this._paneStandby = new Standby({target: this.domNode});
            }
            //The ContentPane has been created, but the actual contents are not created until the tab pane is clicked on, which calls this function
            , CreateContents: function () {
                //Show the first tree in the list on initial viewing
                this._switchTree(0);
            }

            //Swaps out or creates a tree of layers to show
            , _switchTree: function (indexOfTree) {
                this._paneStandby.show();
                try {
                    if (this._currentTree) { //If there is already a tree present, remove it
                        var presentInList = false;
                        for (var i = 0; i < this._createdTrees.length; i++) {
                            if (this._currentTree.index == this._createdTrees[i].index) { //Tree has already been added to list of created trees, don't add again
                                presentInList = true;
                                break;
                            }
                        }
                        if (!presentInList) //Add this tree to the list, so if selected again later, don't have to re-create
                            this._createdTrees.push(this._currentTree);
                        //Remove the current tree from the ContentPane- once fully implemented, will actually probably need to remove it from a child of the ContentPane
                        this.removeChild(this._currentTree.tree);
                        this._currentTree = null;
                    }
                    //Now show or create the desired tree
                    var presentInList = false;
                    var p;
                    for (p = 0; p < this._createdTrees.length; p++) {
                        if (indexOfTree == this._createdTrees[p].index) {
                            presentInList = true;
                            break;
                        }
                    }
                    if (presentInList) {
                        this.addChild(this._createdTrees[p].tree);
                    } else {
                        this._createTree(p, this._layersJsonLoc[indexOfTree]);
                    }
                } catch (ex) {
                    console.log('_switchTree error: ' + ex.message);
                }
                this._paneStandby.hide();
            }

            // Create new tree of layers, including the model and store. Should only be used by _switchTree fxn.
            , _createTree: function (index, pathToJson) {
                /*if (this._layersTree) {
                    this._layersTree.destroyRecursive();
                    this._layersTree = null;
                }
                if (this._layersModel) {
                    this._layersModel.destroy();
                    this._layersModel = null;
                }
                if (this._layersStore)
                    this._layersStore = null;*/
                //Make a request to get the new JSON object of layers
                var jsonRequest = esri.request({
                    url: pathToJson,
                    content: { f: "json" },
                    handleAs: "json",
                    callbackParamName: "callback"
                });
                // Use lang.hitch to have the callbacks run in the scope of this module
                jsonRequest.then(
                    lang.hitch(this, function(jsonResponse) { //The response should be a JSON object in the dijit/tree format required
                        var newTree = { index: index };
                        // set up the store to get the tree data
                        newTree.store = new Memory({
                            data: [ jsonResponse ],
                            getChildren: function(object){
                                return object.children || [];
                            }
                        });
                        // set up the model, assigning iMapStore, and assigning method to identify leaf nodes of tree
                        newTree.model = new ObjectStoreModel({
                            store: newTree.store,
                            query: {id: 'root'},
                            mayHaveChildren: function(item){
                                return "children" in item;
                            }
                        });
                        // create the tree
                        newTree.tree = new Tree({
                            model: newTree.model,
                            onOpenClick: true,
                            onClick: lang.hitch(this, function (item, node, evt){ // When a node is clicked, add it to the map
                                if (item.type) //make sure its a service node and not a folder node
                                    this._showServiceTooltip(item, node);
                            })
                        });
                        this.addChild(newTree.tree);
                    }), lang.hitch(this, function(error) {
                        alert("Unable to load list of services" + " : " + error.message);
                    })
                );
            }

            , _showServiceTooltip: function (item, node) {
                if (!this._toolTipDialog) { //Create a single tooltipdialog to be re-used
                    this._toolTipDialog = new TooltipDialog({
                        id: 'addDataTooltipDialog',
                        class: "tipDialog"
                    });
                    var addBtn = new Button({
                        label: "Add",
                        onClick: lang.hitch(this, function(){
                            popup.close(this._toolTipDialog);
                            this._paneStandby.show();
                            this._addServiceToMap(item, node);
                        })
                    });
                    var closeBtn = new Button({
                        label: "Close",
                        onClick: lang.hitch(this, function(){
                            popup.close(this._toolTipDialog);
                        })
                    });
                    var descPane = new ContentPane({
                        class: 'tipDialogCont'
                    });
                    this._toolTipDialog.addChild(addBtn);
                    this._toolTipDialog.addChild(closeBtn);
                    this._toolTipDialog.addChild(descPane);
                    this._toolTipDialog.descriptionPane = descPane;
                }
                if (item.type === "MapServer" || item.type === "ImageServer" || item.type === "Feature Layer") {
                    popup.open({
                        popup: this._toolTipDialog,
                        around: node.domNode
                    });
                    //If service info has not been retrieved for this node, go get it
                    if (!node.serviceInfo) {
                        var jsonRequest = esri.request({
                            url: item.url + "?f=json",
                            content: { f: "json" },
                            handleAs: "json",
                            callbackParamName: "callback"
                        });
                        // Use lang.hitch to have the callbacks run in the scope of this module
                        jsonRequest.then(
                            lang.hitch(this, function(jsonResponse) { //The response should be a JSON object in the dijit/tree format required
                                //Append service information to node, so it will have it
                                node.serviceInfo = jsonResponse;
                                this._toolTipDialog.descriptionPane.set('content', '<p>' + jsonResponse.serviceDescription + '</p>');
                            }), lang.hitch(this, function(error) {
                                alert("Could not load info for service" + " : " + error.message);
                            })
                        );
                    } else {
                        this._toolTipDialog.descriptionPane.set('content', '<p>' + node.serviceInfo.serviceDescription + '</p>');
                    }
                } else if (item.type === "KML" || item.type === "WMS") { //Don't try and get descriptions. Just set to type
                    if (!node.serviceInfo)
                        node.serviceInfo = { serviceDescription: item.type }
                    this._toolTipDialog.descriptionPane.set('content', '<p>' + node.serviceInfo.serviceDescription + '</p>');
                    popup.open({
                        popup: this._toolTipDialog,
                        around: node.domNode
                    });
                } else
                    alert("This layer type is not supported.");
            }

            , _addServiceToMap: function (item, node) {
                try {
                    if (item.type === "MapServer") {
                        var layer;
                        //Check if map service is cached, if so, check if wkid matches map's wkid. If so, add as tiled layer.
                        if (node.serviceInfo && node.serviceInfo.singleFusedMapCache == true && node.serviceInfo.spatialReference.wkid == this.map.spatialReference.wkid) {
                            layer = esri.layers.ArcGISTiledMapServiceLayer(item.url);
                        } else { //Otherwise add as dynamic layer
                            layer = esri.layers.ArcGISDynamicMapServiceLayer(item.url);
                        }
                        layer.title = item.name;
                        layer.serviceInfo = node.serviceInfo;
                        this.map.addLayer(layer);
                    } else if (item.type === "ImageServer") {
                        var layer = esri.layers.ArcGISImageServiceLayer(item.url);
                        layer.title = item.name;
                        layer.serviceInfo = node.serviceInfo;
                        this.map.addLayer(layer);
                    } else if (item.type === "Feature Layer") {
                        var layer = esri.layers.FeatureLayer(item.url);
                        layer.title = item.name;
                        layer.serviceInfo = node.serviceInfo;
                        layer.serviceInfo = node.serviceInfo;
                        this.map.addLayer(layer);
                    } else if (item.type === "KML") {
                        var layer = esri.layers.KMLLayer(item.url);
                        layer.title = item.name;
                        layer.serviceInfo = node.serviceInfo;
                        this.map.addLayer(layer);
                    } else if (item.type === "WMS") {
                        var layer = esri.layers.WMSLayer(item.url);
                        layer.title = item.name;
                        layer.serviceInfo = node.serviceInfo;
                        this.map.addLayer(layer);
                    } else {
                        alert("This layer type is not supported.");
                    }
                } catch (ex) {
                    alert("Service could not be loaded in map : " + ex.message);
                }
                this._paneStandby.hide();
            }
        });
});