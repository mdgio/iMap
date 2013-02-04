/**
 * Created with JetBrains WebStorm.
 * User: James.Somerville
 * Date: 2/1/13
 * Time: 2:49 PM
 * To change this template use File | Settings | File Templates.
 */
define(["dojo/_base/declare", "../utilities/environment", "dojo/_base/lang", "dojo/Evented"],
    function(declare, environment, lang, Evented){
        return declare([Evented],
            {
                configure: function(appConfig) {
                    //load the specified theme
                    var ss = document.createElement("link");
                    ss.type = "text/css";
                    ss.rel = "stylesheet";
                    ss.href = "css/" + appConfig.theme + ".css";
                    document.getElementsByTagName("head")[0].appendChild(ss);

                    //Is this app embedded - if so turn off title and links
                    //if (configOptions.embed === "true" || configOptions.embed === true) {
                    if (environment.IframeEmbedded) {
                    /*    configOptions.displaytitle = false;
                     appConfig.link1.url = "";
                     appConfig.link2.url = "";*/
                        }else{
                        dojo.addClass(dojo.body(),'notembed');
                        dojo.query("html").addClass("notembed");
                    }

                    //create the links for the top of the application if provided
                    if (appConfig.link1.url && appConfig.link2.url) {
                        if (appConfig.displaytitle == "false" || appConfig.displaytitle === false) {
                            //size the header to fit the links
                            dojo.style(dojo.byId("header"), "height", "25px");
                        }
                        esri.show(dojo.byId('nav'));
                        dojo.create("a", {
                            href: appConfig.link1.url,
                            target: '_blank',
                            innerHTML: appConfig.link1.text
                        }, 'link1List');
                        dojo.create("a", {
                            href: appConfig.link2.url,
                            target: '_blank',
                            innerHTML: appConfig.link2.text
                        }, 'link2List');
                    }

                    //create the map and enable/disable map options like slider, wraparound, esri logo etc
                    if (appConfig.displayslider === 'true' || appConfig.displayslider === true) {
                        appConfig.displaySlider = true;
                    } else {
                        appConfig.displaySlider;
                    }
                    if (appConfig.constrainmapextent === 'true' || appConfig.constrainmapextent === true) {
                        appConfig.constrainmapextent = true;
                    } else {
                        appConfig.constrainmapextent = false;
                    }
                }
            }
        )
    }
);