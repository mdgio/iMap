/*** Module to handle loading the tab container.  The widget contents of a tab are lazy-loaded on click, except for the startup widget.
 This is the place to create new tabs for new widgets. See existing widgets for how-to.*/
define(["dojo/_base/declare", "../utilities/environment", "dojo/_base/lang", "dojo/Evented", "dijit/registry", "require", "dojo/dom", "dijit/layout/ContentPane"
    , "dojox/widget/Standby", "../utilities/maphandler", "dojo/dom-class", "dijit/layout/BorderContainer"],
    function(declare, environment, lang, Evented, registry, require, dom, contentPane, Standby, mapHandler, domClass){
        return declare([], {
            //The application configuration properties (originated as configOptions from app.js then overridden by AGO if applicable)
            _AppConfig: null
            //The web map configuration properties (from map.js). If a webmap was not used, some functionality is not available
            , _WebMap: null
            //The map object
            , _Map: null

            , constructor: function(args) { //The args get passed in from the constructor in layout.js
                this._AppConfig = args.AppConfig;
                this._WebMap = args.WebMap;
                //mapHandler contains a reference to the actual arcgis map object and helper fxns
                this._Map = mapHandler.map;
            }

            /*** Function to handle loading the tab container.  The widget contents of a tab are lazy-loaded on click, except for the startup widget.
             This is the place to create new tabs for new widgets. See existing widgets for how-to.*/
            , CreateLeftPaneTabs: function () {
                var leftTabCont = registry.byId('leftPane');
                // Details panel- This pane gets created right away, since it is so simple and usually the start pane.
                if ((this._AppConfig.displaydetails === 'true' || this._AppConfig.displaydetails === true) && this._AppConfig.description !== "") {
                    var selectedPane = (this._AppConfig.startupwidget === 'displaydetails') ? true : false;
                    var detailCp = new contentPane({
                        title: 'Details', //i18n.tools.details.title,
                        selected: selectedPane,
                        id: "detailPanel"
                    });
                    var detailsContent = '';
                    if (this._AppConfig.embed && (this._AppConfig.displaytitle === "true" || this._AppConfig.displaytitle === true))
                        detailsContent = detailsContent.concat('<h1>', this._AppConfig.title, '</h1>', this._AppConfig.description);
                    else
                        detailsContent = this._AppConfig.description;
                    //set the detail info
                    detailCp.set('content', detailsContent);

                    leftTabCont.addChild(detailCp);
                    domClass.add(dom.byId('detailPanel'), 'panel_content');
                }

                //*** Table of Contents- use as an example of lazy-loading a pane at runtime
                if ((this._AppConfig.tablecontents === 'true' || this._AppConfig.tablecontents === true)) {
                    //*** Check if this pane was set to be the startup pane in app.js or AGO. Replace the param name in next line.
                    var configParamName = 'tablecontents';
                    //*** Give the tab's content pane a unique id
                    var paneId = 'tocPanel';
                    var tabTitle = 'Contents';
                    var modulePath = "../toc/toc";
                    //*** If your widget requires specific constructor parameters to be passed in, you can set the object here.
                    var constructorParams = { esriMap: this._Map };
                    //*** Does your widget's parent need to be resized after it's startup in order to layout properly? Default to false.
                    var resizeAfterStartup = true;

                    var selectedPane = (this._AppConfig.startupwidget === configParamName) ? true : false;
                    //Create the tab pane initially, so title is present in tab bar
                    var parentPane = new contentPane({
                        title: tabTitle, //i18n.tools.details.title,
                        selected: selectedPane,
                        id: paneId,
                        style: "padding: 0px"
                    });
                    //Add pane to tab container and style to the pane
                    leftTabCont.addChild(parentPane);
                    domClass.add(dom.byId(paneId), 'panel_content');

                    if (selectedPane) { // Get the toc widget and load immediately
                        this._CreateWidget(modulePath, parentPane, constructorParams, resizeAfterStartup);
                    } else { // Don't load the widget, unless needed- i.e. when a user clicks on the tab button (lazy loading)
                        var tocWatch = leftTabCont.watch("selectedChildWidget", lang.hitch(this, function(name, oval, nval){
                            if (nval.id === paneId) {
                                tocWatch.unwatch();
                                var standby = new Standby({target: "tocPanel"});
                                document.body.appendChild(standby.domNode);
                                standby.show();
                                this._CreateWidget(modulePath, parentPane, constructorParams, resizeAfterStartup);
                                standby.hide();
                            }
                        }));
                    }

                    /*if (selectedPane) { // Get the toc widget and load immediately
                        require([modulePath],
                            lang.hitch(this, function(tocWidg) {
                                // Create our widget and place it
                                var widget = new tocWidg({ esriMap: this._Map });
                                tocCp.addChild(widget);
                                widget.startup();
                                tocCp.resize();
                            })
                        );
                    } else { // Don't load the widget, unless needed- i.e. when a user clicks on the tab button (lazy loading)
                        //
                        var tocWatch = leftTabCont.watch("selectedChildWidget", lang.hitch(this, function(name, oval, nval){
                            if (nval.id === paneId) {
                                var contentsTab = dom.byId("tocPanel");
                                if (!contentsTab.hasLoaded) { //Widget has not been activated yet. Run-time load it now.
                                    var standby = new Standby({target: "tocPanel"});
                                    document.body.appendChild(standby.domNode);
                                    standby.show();
                                    require([modulePath],
                                        lang.hitch(this, function(tocWidg) {
                                            // Create our widget and place it
                                            var widget = new tocWidg({ esriMap: this._Map });
                                            //var tocPane = registry.byId('tocPanel');
                                            //tocPane.addChild(widget);
                                            widget.startup();
                                            tocPane.resize();
                                            contentsTab.hasLoaded = true;
                                            standby.hide();
                                            tocWatch.unwatch();
                                        })
                                    );
                                }
                            }
                        }));
                    }*/

                    //leftTabCont.addChild(tocCp);
                    //dojo.addClass(dom.byId('tocPanel'), 'panel_content');
                    if (selectedPane)
                        leftTabCont.selectChild(tocCp);
                }

                // Editor Panel - not implemented yet
                if (this._AppConfig.displayeditor == 'true' || this._AppConfig.displayeditor === true) {
                    //do we have any editable layers - if not then disregard
                    var editLayers = this._hasEditableLayers(layers);
                    if (editLayers.length > 0) {
                        var selectedPane = (this._AppConfig.startupwidget === 'displayeditor') ? true : false;
                        var editCp = new dijit.layout.ContentPane({
                            title: "Editor",//i18n.tools.editor.title,
                            selected: selectedPane,
                            id: "editPanel",
                            style: "padding: 0px"
                        });
                        leftTabCont.addChild(tocCp);
                        dojo.addClass(dom.byId('tocPanel'), 'panel_content');

                        var editWatch = leftTabCont.watch("selectedChildWidget", lang.hitch(this, function(name, oval, nval){
                            if (nval.id === 'editPanel') {
                                var contentsTab = dom.byId("editPanel");
                                if (!contentsTab.hasLoaded) { //Widget has not been activated yet. Run-time load it now.
                                    var standby = new Standby({target: "tocPanel"});
                                    document.body.appendChild(standby.domNode);
                                    standby.show();
                                    require(["../editor"],
                                        lang.hitch(this, function(editorWidg) {
                                            // Create our widget and place it
                                            var widget = new tocWidg({ esriMap: this._Map });
                                            var tocPane = registry.byId('tocPanel');
                                            tocPane.addChild(widget);
                                            widget.startup();
                                            tocPane.resize();
                                            contentsTab.hasLoaded = true;
                                            standby.hide();
                                            tocWatch.unwatch();
                                        })
                                    );
                                }
                            } else {//Destroy the dijit

                            }
                        }));

                            /*if (selectedPane) { // Get the toc widget and load immediately
                                //hide or show the editor
                                if (label === 'editPanel') {
                                    createEditor();
                                } else {
                                    destroyEditor();
                                }
                                addEditor(editLayers);
                            }*/
                    }
                }
            }

            , _CreateWidget: function (modulePath, parentPane, constructorParams, resizeAfterStartup) {
                require([modulePath], lang.hitch(this, function(Widget) {
                        // Create our widget and place it
                        var widget = new Widget(constructorParams);
                        parentPane.addChild(widget);
                        widget.startup();
                        if (resizeAfterStartup)
                            parentPane.resize();
                }));
            }



            //Determine if the webmap has any editable layers
            , _hasEditableLayers: function (layers) {
                var layerInfos = [];
                dojo.forEach(layers, function (mapLayer, index) {
                    if (mapLayer.layerObject) {
                        if (mapLayer.layerObject.isEditable) {
                            if (mapLayer.layerObject.isEditable()) {
                                layerInfos.push({
                                    'featureLayer': mapLayer.layerObject
                                });
                            }
                        }
                    }
                });
                return layerInfos;
            }
        });
    }
);