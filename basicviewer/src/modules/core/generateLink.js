/**
Creates an ESRI basemaps dijit.
Also contains a function to recreate an overview map (apparently needed when basemap is switched).
*/
define(["dojo/_base/declare", "jquery", "dijit/_WidgetBase", "dojo/_base/lang", "dojo/topic", "./utilities/maphandler", "dijit/layout/ContentPane"
    , "dijit/Menu", "esri/dijit/Gallery", "dijit/Dialog", "dijit/registry", "dojo/aspect" /*, "./custommenu"*/
    , "dijit/form/Button", "dijit/layout/StackContainer", "dijit/layout/ContentPane", "dojo/dom", "dojo/dom-construct", "dojo/on"],
    function (declare, $, WidgetBase, lang, topic, mapHandler, ContentPane, Menu, Gallery, Dialog, registry, aspect /*, custommenu*/
        , Button, StackContainer, ContentPane, dom, domConstruct, on) {
        return declare([WidgetBase, Button], {
            // The ESRI map object to bind to the TOC. Set in constructor
            map: null,

            //The application configuration properties (originated as configOptions from app.js then overridden by AGO if applicable)
            AppConfig: null,

            //*** Create the basemap gallery
            constructor: function (args) {
                // safeMixin automatically sets the properties above that are passed in from the toolmanager.js
                declare.safeMixin(this, args);
                // mapHandler is a singleton object that you can require above and use to get a reference to the map.
                this.map = mapHandler.map;

            }

            , postCreate: function () {
                this.inherited(arguments);
            },

            onClick: function () {
                var ht = (window.innerHeight - 450) / 2;
                var htStr = ht + "px";
                var linkWindow = new Dialog({
                    id: "linkWindow",
                    title: "Link Current Map",
                    style: "width: 300px; height: auto; position: absolute; top:" + htStr
                });

                var linkTxt = dojo.create("p", { id: "linkTxt", style: "word-wrap: break-word; width:100%" });
                var extentBBoxTxt = mapHandler.map.extent.xmin + "," + mapHandler.map.extent.ymin + "," + mapHandler.map.extent.xmax + "," + mapHandler.map.extent.ymax;
                var extentSRTxt = mapHandler.map.extent.spatialReference.wkid;
                var linkURL = document.location.href.replace(document.location.search, "") + "?extentBBox=" + extentBBoxTxt + "&extentSR=" + extentSRTxt;
                if (this.map.layerIds.length > 0) {
                    var mapLayers = [];
                    if (location.search.indexOf("sggWebmap") > -1) {
                        function getObjects(obj, key, val) {
                            var objects = [];
                            for (var i in obj) {
                                if (!obj.hasOwnProperty(i)) continue;
                                if (typeof obj[i] == 'object') {
                                    objects = objects.concat(getObjects(obj[i], key, val));
                                } else if (i == key && obj[key] == val) {
                                    objects.push(obj);
                                }
                            }
                            return objects;
                        }
                        for (var j = 0; j < this.map.graphicsLayerIds.length; j++) {
                            if (this.map.graphicsLayerIds[j].length == 3) {
                                var chklayer = this.map.getLayer(this.map.graphicsLayerIds[j]);
                                var vis = "";
                                if (chklayer.visible == false) {
                                    vis = "I";
                                } else {
                                    vis = "V";
                                }
                                var opac = parseInt(chklayer.opacity * 100);
                                mapLayers.push(this.map.graphicsLayerIds[j] + vis + opac);
                            } else {
                                var chkURL = this.map.getLayer(this.map.graphicsLayerIds[j]).url;
                                if (chkURL != null) {
                                    chkURL = chkURL.replace("www.mdimap.us", "mdimap.us");
                                    chkURL = chkURL.replace("mdimap.towson.edu", "mdimap.us");
                                    chkURL = chkURL.replace("204.145.182.27", "staging.geodata.md.gov");
                                    chkURL = chkURL.replace("ArcGIS", "arcgis");
                                    var chkLayerArr = getObjects(this.AppConfig.sggLayerArr, "url", chkURL);
                                    if (chkLayerArr.length > 0) {
                                        var chklayer = this.map.getLayer(this.map.graphicsLayerIds[j]);
                                        var matchObj = chkLayerArr[0];
                                        var vis = "";
                                        if (chklayer.visible == false) {
                                            vis = "I";
                                        } else {
                                            vis = "V";
                                        }
                                        var opac = parseInt(chklayer.opacity * 100);
                                        mapLayers.push(matchObj.id + vis + opac);
                                    }
                                }
                            }
                        }
                        for (var i = 0; i < this.map.layerIds.length; i++) {
                            if (this.map.layerIds[i].length == 3) {
                                var chklayer = this.map.getLayer(this.map.layerIds[i]);
                                var vis = "";
                                if (chklayer.visible == false) {
                                    vis = "I";
                                } else {
                                    vis = "V";
                                }
                                var opac = parseInt(chklayer.opacity * 100);
                                mapLayers.push(this.map.layerIds[i] + vis + opac);
                            } else {
                                var chkURL = this.map.getLayer(this.map.layerIds[i]).url;
                                if (chkURL != null) {
                                    chkURL = chkURL.replace("www.mdimap.us", "mdimap.us");
                                    chkURL = chkURL.replace("mdimap.towson.edu", "mdimap.us");
                                    chkURL = chkURL.replace("204.145.182.27", "staging.geodata.md.gov");
                                    chkURL = chkURL.replace("ArcGIS", "arcgis");
                                    var chkLayerArr = getObjects(this.AppConfig.sggLayerArr, "url", chkURL);
                                    if (chkLayerArr.length > 0) {
                                        var chklayer = this.map.getLayer(this.map.layerIds[i]);
                                        var matchObj = chkLayerArr[0];
                                        var vis = "";
                                        if (chklayer.visible == false) {
                                            vis = "I";
                                        } else {
                                            vis = "V";
                                        }
                                        var opac = parseInt(chklayer.opacity * 100);
                                        mapLayers.push(matchObj.id + vis + opac);
                                    }
                                }

                            }
                        }
                    } else {
                        for (var j = 0; j < this.map.graphicsLayerIds.length; j++) {
                            if (this.map.graphicsLayerIds[j].length == 3) {
                                var chklayer = this.map.getLayer(this.map.graphicsLayerIds[j]);
                                var vis = "";
                                if (chklayer.visible == false) {
                                    vis = "I";
                                } else {
                                    vis = "V";
                                }
                                var opac = parseInt(chklayer.opacity * 100);
                                mapLayers.push(this.map.graphicsLayerIds[j] + vis + opac);
                            }
                        }
                        for (var i = 0; i < this.map.layerIds.length; i++) {
                            if (this.map.layerIds[i].length == 3) {
                                var chklayer = this.map.getLayer(this.map.layerIds[i]);
                                var vis = "";
                                if (chklayer.visible == false) {
                                    vis = "I";
                                } else {
                                    vis = "V";
                                }
                                var opac = parseInt(chklayer.opacity * 100);
                                mapLayers.push(this.map.layerIds[i] + vis + opac);
                            }
                        }
                    }

                    var sggData = JSON.stringify(mapLayers)
                    if (sggData != "[]") {
                        linkURL += "&sggdata=" + encodeURIComponent(sggData).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                    }
                }

                var genlinkDiv = dojo.create('div', { id: "genLinkDiv" });

                var linkDiv = dojo.create('div', { id: "linkDiv" });
                genlinkDiv.appendChild(linkDiv);

                var linkObj = dojo.create('a', { id: "createLinkA", href: linkURL, target: "_blank", innerHTML: "Click Here to Open Link" });
                linkDiv.appendChild(linkObj);

                var copyDiv = dojo.create('div', { id: "copyToCDiv" });
                genlinkDiv.appendChild(copyDiv);

                var linkCopyButton = dojo.create('div', { id: "copyButton", onclick: "prompt('Press Ctrl + C, then Enter to copy to clipboard','" + linkURL + "')", innerHTML: "<p>Copy Link</p>" });
                copyDiv.appendChild(linkCopyButton);

                var fbLinkDiv = dojo.create('div', { id: "fbLinkDiv" });
                genlinkDiv.appendChild(fbLinkDiv);

                var facebookLink = "https://www.facebook.com/sharer/sharer.php?s=100&p[url]=" + linkURL + "&p[images][0]=&p[title]=MD%20Smart%20Green%20and%20Growing%20Map&p[summary]=";
                var linkFB = dojo.create('a', { id: "createFBLink", href: facebookLink, target: "_blank", innerHTML: "<p>Share on Facebook</p>", title: "Share on Facebook" });
                fbLinkDiv.appendChild(linkFB);
                var fbImage = dojo.create('img', { id: "fbImg", src: 'assets/sgg/facebook.png' });
                domConstruct.place(fbImage, linkFB, "first");

                linkWindow.set("content", genlinkDiv);

                linkWindow.hide = function () {
                    linkWindow.destroy();
                };

                linkWindow.show();
            },

            addAppGallery: function () {

            }

        });
    });