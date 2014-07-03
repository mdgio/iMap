/* This class runs at startup to handle configuring the application and what it loads
     If a query string parameter containing an appid is found, then it will override any of configOptions with those found in the AGO app JSON.
     Finally, it checks for the presence of a webmap override parameter (URL to a json object), which means this application has been shared.
*/
define(["dojo/_base/declare", "dojox/html/entities", "dojo/_base/lang", "dojo/Evented", "../utilities/environment"],
    function(declare, entities, lang, Evented, environment){
        return declare([Evented], {
            configure: function () {
                // This is the default configuration for the application (if no appid is specified below and no appid querystring param is passed in)
                var configOptions = {
                    //*** Layout ***
                    //The ArcGIS Online id for a web mapping application item that was published and possibly configured on ArcGIS.com
                    // In most cases this will be null (empty quotes) and will be passed in in the URL querystring.
                    appid: "",
                    //The ID for a web map from ArcGIS Online (AGO)
                    //If not going to specify a Web Map in AGO, then use empty quotes ("") here
					webmap: "d1201eea7afb4ed49f08a310e9803f2f",      //"blank" map
					//Some sample web maps to try:
                    //webmap: "252fb36ac7404043a0f3d2022958b5d0",    //veterans services
                    //webmap: "c545bf8fde0a46c2aa52a10e9118750a",  //growthprint
                    //webmap: "9ed1f1fefd9e4cf89379af66ad33c768",  //DFIRM
                    // The URL to an ArcGIS Web Map- if not using ArcGIS.com.
                    // Can be relative to index.html. For example, if in basicviewer root- "webmap.js"
                    // If both webmap and webmapurl are empty, then a map must be programmatically defined in map.js
                    webmapurl: "webmap.js",
                    //Enter a description for the application. This description will appear in the left pane
                    //if no description is entered, the webmap description (if populated) will be used.
                    description: "The Maryland iMap Template.  Updated 7/3/2014.  <br>Change this description in app.js or add one via your map on ArcGIS Online.<br><br><a href='http://imap.maryland.gov/Pages/template-server.aspx' target='_blank'>Help Documents</a><br><br><a href='Changes.txt' target='_blank'>Change Log<a> (text)",
                    //specify an owner for the app - used by the print option. The default value will be the web map's owner
                    owner: '',

                    //*** Layout ***
                    //Specify a color theme for the app. Valid options are gray,blue,purple,green and orange
                    theme: "imap",
                    //set to true to display the title
                    displaytitle: true,
                    //Enter a title, if no title is specified, the webmap's title is used.
                    title: "",
                    //URL to title logo, if none specified, then defaults to assets/MDLogo.gif
                    titleLogoUrl: "assets/MDlogo-small.gif",
                    //The hyperlink for the title logo,
                    titleLogoLink: "http://www.maryland.gov/Pages/default.aspx",
                    //Provide an image and url for a logo that will be displayed as a clickable image
                    //in the lower right corner of the map. If nothing is specified then the esri logo will appear.
                    //Example customLogoImage: "http://serverapi.arcgisonline.com/jsapi/arcgis/2.4compact/images/map/logo-med.png"
                    customlogo: {
                        image: 'assets/mdimaplogo.png',
                        link: 'http://imap.maryland.gov/Pages/default.aspx'
                    },
                    //specify the width of the panel that holds the editor, legend, details
                    leftpanewidth: '350',
                    //specify the width of the panel that holds the TOC
                    //rightpanewidth: 280,
                    //The height (px) of the Header (where title, logo, and links are located)
                    headerHeight: "40",
                    //Set link text and url parameters if you want to display clickable links in the upper right-corner
                    //of the application.
                    //ArcGIS.com. Enter link values for the link1 and link2 and text to add links. For example
                    //url:'http://www.esri.com',text:'Esri'
                    link1: {
                        url: '',
                        text: ''
                    },
                    link2: {
                        url: '',
                        text: ''
                    },
                    //Restrict the map's extent to the initial extent of the web map. When true users
                    //will not be able to pan/zoom outside the initial extent.
                    constrainmapextent: false,
                    //embed means the margins will be collapsed to just include the map no title or links, default is to embed if in iframe
                    embed: (environment.IframeEmbedded || environment.WindowHeight < 600),

                    //*** Widgets ***
                    //Set startupwidget to one of variable names from the tabs to show on startup.  'displaydetails' is given by default.
                    // To hide on startup, set startupwidget to 'none'.  To hide a tab, set variable to false.
                    startupwidget: 'displaydetails',
					//The TABS in the left panel of the template.  
					//Tab for map details either provided by map on ArcGIS Online or via the "description" variable above.                   
					displaydetails: true,
					//Tab for Table of Contents/Legend 
                    tablecontents: true,  
                    //Tab for the Query Tools                  
                    displayquery: true,
                    //Tab for Add Data - the ability to add provided REST services via AddLayers.js
                    adddata: true,
                    //Tab for the editor - still in development 
                    displayeditor: false,
                    
                    ////When editing you need to specify a proxyurl (see below) if the service is on a different domain
                    //Specify a proxy url if you will be editing, using the elevation profile or have secure services or web maps that are not shared with everyone.
                    proxyurl: "proxy.ashx",

                    //*** Tools ***
                    //Optional tools - set to false to hide the tool
                    displaytimeslider: true,
                    //Print options - Default is to not display on mobile devices, but can be overriden manually or in AGO
                    displayprint: !(environment.TouchEnabled),
                    
                    //Use either the Maryland print service or the ESRI print service for the printtask
                    printtask: "http://geodata.md.gov/imap/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
                    //printtask: "http://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
					
                    //Set the label in the nls file for your browsers language
                    printlayouts: [{
                        layout: 'Letter ANSI A Landscape',
                        label: 'Landscape - PDF',//i18n.tools.print.layouts.label1,
                        format: 'PDF'
                    }, {
                        layout: 'Letter ANSI A Portrait',
                        label:  'Portrait - PDF',//i18n.tools.print.layouts.label2,
                        format: 'PDF'
                    }, {
                        layout: 'Letter ANSI A Landscape',
                        label:  'Landscape - PNG',//i18n.tools.print.layouts.label3,
                        format: 'PNG32'
                    }, {
                        layout: 'Letter ANSI A Portrait',
                        label:  'Portrait - PNG',//i18n.tools.print.layouts.label4,
                        format: 'PNG32'
                    }],
                    displaybasemaps: true,
                    displaybookmarks: false,
					zoomtocounty: true,
					displaydraw: true,
                    displaymeasure: true,
                    displaylocation: true,
                    displayshare: false,//if enabled enter bitly key and login below.
                    //The application allows users to share the map with social networking sites like twitter
                    //and facebook. The url for the application can be quite long so shorten it using bit.ly.
                    //You will need to provide your own bitly key and login.
                    bitly: {
                        key: '',
                        login: ''
                    },
                    //set to false to hide the zoom slider on the map
                    displayslider: true,
					//set to false to hide the home button on the map
					displayhome: true,
                    displayoverviewmap: true,
                    displaysearch: true,
                    displayscalebar: true,
                    //Drawing toolbar
                    displayinterop: !(environment.TouchEnabled),
					
					

                    //*** General Settings ***
                    //i18n.viewer.main.scaleBarUnits,

                    //If the webmap uses Bing Maps data, you will need to provide your Bing Maps Key
                    bingmapskey: "",
                    //Modify this to point to your sharing service URL if you are using the portal
                    sharingurl: "http://www.arcgis.com/sharing/content/items",
                    //specify a group in ArcGIS.com that contains the basemaps to display in the basemap gallery
                    //example: title:'ArcGIS Online Basemaps' , owner:esri
                    basemapgroup: {
                        title: '',
                        owner: ''
                    },
                    //Enter the URL to a Geometry Service
                    //geometryserviceurl: "http://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
                    //geometryserviceurl: "http://mdimap.us/ArcGIS/rest/services/GeometryService/Geometry/GeometryServer",
					geometryserviceurl: "http://geodata.md.gov/imap/rest/services/Utilities/Geometry/GeometryServer",
					
                    //Specify the url and options for the locator service. If using the world geocoding service you can specify the country code and whether or not the
                    //search should be  restricted to the current extent. View the geocode.arcgis.com documentation for details http://geocode.arcgis.com/arcgis/geocoding.html#multifield
					//ESRI's geocoder  "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
					//Maryland's geocoder  "http://mdimap.us/ArcGIS/rest/services/GeocodeServices/MD.State.MDCascadingLocatorWithZIPCodes/GeocodeServer",
					
                    placefinder: {
					    "url": "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
                        "countryCode":""
						
                    },
                    displaypointtransp: false
                };

                this._setDefaults(configOptions);

                var urlObject = esri.urlToObject(document.location.href);

                //is an appid specified (either in the config option above, or in query string) -
                // if so, download json from AGO, and override applicable defaults, otherwise configOptions defaults will be used
                if (configOptions.appid || (urlObject.query && urlObject.query.appid)) {
                    var appid = configOptions.appid || urlObject.query.appid;
                    var requestHandle = esri.request({
                        url: configOptions.sharingurl + "/" + appid + "/data",
                        content: {
                            f: "json"
                        },
                        callbackParamName: "callback",
                        load: lang.hitch(this, function (response) {
                            if (response.values.title) {
                                configOptions.title = response.values.title;
                            }
                            if (response.values.titleLogoUrl) {
                                configOptions.titleLogoUrl = response.values.titleLogoUrl;
                            }
                            if (response.values.titleLogoLink) {
                                configOptions.titleLogoLink = response.values.titleLogoLink;
                            }
                            if (response.values.leftpanewidth !== undefined) {
                                configOptions.leftpanewidth = response.values.leftpanewidth;
                            }
                            if (response.values.headerHeight) {
                                configOptions.headerHeight = response.values.headerHeight;
                            }
                            if (response.values.displaytitle != undefined) {
                                configOptions.displaytitle = response.values.displaytitle;
                            }
                            if (response.values.theme) {
                                configOptions.theme = response.values.theme;
                            }
                            if (response.values.description) {
                                configOptions.description = response.values.description;
                            }
                            if (response.values.displaydetails != undefined) {
                                configOptions.displaydetails = response.values.displaydetails;
                            }
							if (response.values.displayquery != undefined) {
                                configOptions.displayquery = response.values.displayquery;
                            }
                            if (response.values.tablecontents != undefined) {
                                configOptions.tablecontents = response.values.tablecontents;
                            }
							if (response.values.adddata != undefined) {
                                configOptions.adddata = response.values.adddata;
                            }
                            /*if (response.values.displayeditor != undefined) {
                                configOptions.displayeditor = response.values.displayeditor;
                            }*/
                            if (response.values.startupwidget) {
                                configOptions.startupwidget = response.values.startupwidget;
                            }
                            if (response.values.displayprint != undefined) {
                                configOptions.displayprint = response.values.displayprint;
                            }
							/*
                            if (response.values.displaytimeslider != undefined) {
                                configOptions.displaytimeslider = response.values.displaytimeslider;
                            }
							
                            if (response.values.displaybookmarks != undefined) {
                                configOptions.displaybookmarks = response.values.displaybookmarks;
                            }
							*/
							 if (response.values.zoomtocounty != undefined) {
                                configOptions.zoomtocounty = response.values.zoomtocounty;
							}
							
                            if (response.values.displaymeasure != undefined) {
                                configOptions.displaymeasure = response.values.displaymeasure;
                            }
							if (response.values.displaydraw != undefined) {
                                configOptions.displaydraw = response.values.displaydraw;
                            }
                            if (response.values.displaylocation != undefined) {
                                configOptions.displaylocation = response.values.displaylocation;
                            }
                            /*
							if (response.values.displaylegend !== undefined) {
                                configOptions.displaylegend = response.values.displaylegend;
                            }
							*/
                            /*
							if (response.values.displaylayerlist !== undefined) {
                                configOptions.displaylayerlist = response.values.displaylayerlist;
                            }*/
                            if (response.values.displaybasemaps != undefined) {
                                configOptions.displaybasemaps = response.values.displaybasemaps;
                            }
                            /*
							if (response.values.displayshare != undefined) {
                                configOptions.displayshare = response.values.displayshare;
                            } */
                            if (response.values.displaysearch != undefined) {
                                configOptions.displaysearch = response.values.displaysearch;
                            }
							/*
							if (response.values.displayslider) {
                                configOptions.displayslider = response.values.displayslider;
                            }*/
							/* if (response.values.displayhome) {
                                configOptions.displayhome = response.values.displayhome;
                            } */
                            if (response.values.displayoverviewmap != undefined) {
                                configOptions.displayoverviewmap = response.values.displayoverviewmap;
                            }
                            if (response.values.webmap) {
                                configOptions.webmap = response.values.webmap;
                            }
                            if (response.values.link1text) {
                                configOptions.link1.text = response.values.link1text;
                            }
                            if (response.values.link1url) {
                                configOptions.link1.url = response.values.link1url;
                            }
                            if (response.values.link2text) {
                                configOptions.link2.text = response.values.link2text;
                            }
                            if (response.values.link2url) {
                                configOptions.link2.url = response.values.link2url;
                            }
                            if (response.values.placefinderurl) {
                                configOptions.placefinder.url = response.values.placefinderurl;
                            }
                            if (response.values.embed != undefined) {
                                configOptions.embed = response.values.embed;
                            }
                            if (response.values.customlogoimage) {
                                configOptions.customlogo.image = response.values.customlogoimage;
                            }
                            if (response.values.customlogolink) {
                                configOptions.customlogo.link = response.values.customlogolink;
                            }
                            if (response.values.displaypointtransp) {
                                configOptions.displaypointtransp = response.values.displaypointtransp;
                            }
                            /*if (response.values.basemapgrouptitle && response.values.basemapgroupowner) {
                                configOptions.basemapgroup.title = response.values.basemapgrouptitle;
                                configOptions.basemapgroup.owner = response.values.basemapgroupowner;
                            }*/
                            if (response.values.displayinterop != undefined)
                                configOptions.displayinterop = response.values.displayinterop;

                            this._checkForOverrides(urlObject, configOptions);
                        }),
                        error: lang.hitch(this, function (response) {
                            var e = response.message;
                            alert("Unable to create map" + " : " + e);
                            //alert(i18n.viewer.errors.createMap + " : " + e);
                        })
                    });
                } else
                    this._checkForOverrides(urlObject, configOptions);
            }

            // Setup up default parameters for the map using the app config settings
            , _setDefaults: function (configOptions) {
                if (configOptions.geometryserviceurl && location.protocol === "https:")
                    configOptions.geometryserviceurl = configOptions.geometryserviceurl.replace('http:', 'https:');
                esri.config.defaults.geometryService = new esri.tasks.GeometryService(configOptions.geometryserviceurl);

                if (!configOptions.sharingurl)
                    configOptions.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
                esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;

                if(!configOptions.proxyurl){
                    configOptions.proxyurl = location.protocol + '//' + location.host + "/sharing/proxy";
                }
                esri.config.defaults.io.proxyUrl = configOptions.proxyurl;
                esri.config.defaults.io.alwaysUseProxy = false;
            }

            // Override configuration settings if any url parameters are set. Not
            , _checkForOverrides: function (urlObject, configOptions) {
                if (urlObject.query) {
                    // If the map is being shared by another, then alterations to the default webmap will be in the JSON
                    //   object located at the encoded URL passed in the webmapov parameter
                    if (urlObject.query.webmapov) {
                        configOptions.webmapoverride = entities.decode(urlObject.query.webmapov);
                    }
                    if (urlObject.query.webmap) {
                        configOptions.webmap = urlObject.query.webmap;
                    }
                }

                //Raise event letting calling module know configuration is complete
                this.emit('appconfigured', configOptions);
            }
       });
    }
);
