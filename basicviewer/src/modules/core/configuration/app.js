// The class to handle configuring the application and what it loads
// If a query string parameter containing an appid is found, then it will load the config from AGO.
define(["dojo/_base/declare"],
    function(declare){
        return declare([], {
            configure: function () {
                // This is the default configuration for the application (if no appid is specified below and no appid querystring param is passed in)
                var configOptions = {
                    //The ID for the map from ArcGIS.com
                    webmap: "d9236293e0ae42798c306485bf978d93",
                    //The id for the web mapping applciation item that contains configuration info - in most
                    //cases this will be null.
                    appid: "",
                    //set to true to display the title
                    displaytitle: true,
                    //Enter a title, if no title is specified, the webmap's title is used.
                    title: "Maryland iMap",
                    //URL to title logo, if none specified, then defaults to assets/MDLogo.gif
                    //titleLogoUrl: "assets/MDlogo-small.gif",
                    titleLogoUrl: "assets/MDlogo.gif",
                    //URL to banner image, if non specified then defaults to iMap banner image.
                    headerbanner: "assets/imap/imapBanner2.jpg",
                    //Enter a description for the application. This description will appear in the left pane
                    //if no description is entered the webmap description will be used.
                    description: "",
                    //specify an owner for the app - used by the print option. The default value will be the web map's owner
                    owner: '',
                    //Specify a color theme for the app. Valid options are gray,blue,purple,green and orange
                    theme: 'imap',
                    //Optional tools - set to false to hide the tool
                    //set to false to hide the zoom slider on the map
                    displayslider: true,
                    displaymeasure: true,
                    displaybasemaps: true,
                    displayoverviewmap: true,
                    displayeditor: true,
                    ////When editing you need to specify a proxyurl (see below) if the service is on a different domain
                    //Specify a proxy url if you will be editing, using the elevation profile or have secure services or web maps that are not shared with everyone.
                    proxyurl: "proxy.ashx",
                    displaylegend: false,
                    displaysearch: true,
                    displaylayerlist: true,
                    displaybookmarks: true,
                    displaydetails: true,
                    displaytimeslider: true,
                    displayprint: true,
                    //Print options
                    printtask: "http://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
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
                    //i18n.viewer.main.scaleBarUnits,
                    //The elevation tool uses the  measurement tool to draw the lines. So if this is set
                    //to true then displaymeasure needs to be true too.
                    displayelevation: false,
                    //This option is used when the elevation chart is displayed to control what is displayed when users mouse over or touch the chart. When true, elevation gain/loss will be shown from the first location to the location under the cursor/finger.
                    showelevationdifference: false,
                    displayscalebar: true,
                    displayshare: true,
                    //if enabled enter bitly key and login below.
                    //The application allows users to share the map with social networking sites like twitter
                    //and facebook. The url for the application can be quite long so shorten it using bit.ly.
                    //You will need to provide your own bitly key and login.
                    bitly: {
                        key: '',
                        login: ''
                    },
                    //Set to true to display the left panel on startup. The left panel can contain the legend, details and editor. Set to true to
                    //hide left panel on initial startup. 2
                    leftPanelVisibility: false,
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
                    geometryserviceurl: "http://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",
                    //Specify the url and options for the locator service. If using the world geocoding service you can specify the country code and whether or not the
                    //search should be  restricted to the current extent. View the geocode.arcgis.com documentation for details http://geocode.arcgis.com/arcgis/geocoding.html#multifield
                    placefinder: {
                        "url": "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
                        "singlelinefieldname": "SingleLine",
                        "countryCode":"",
                        "currentExtent":false
                    },
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
                    //specify the width of the panel that holds the editor, legend, details
                    leftpanewidth: 228,
                    //specify the width of the panel that holds the TOC
                    rightpanewidth: 280,
                    //Restrict the map's extent to the initial extent of the web map. When true users
                    //will not be able to pan/zoom outside the initial extent.
                    constrainmapextent: false,
                    //Provide an image and url for a logo that will be displayed as a clickable image
                    //in the lower right corner of the map. If nothing is specified then the esri logo will appear.
                    //Example customLogoImage: "http://serverapi.arcgisonline.com/jsapi/arcgis/2.4compact/images/map/logo-med.png"
                    customlogo: {
                        image: '',
                        link: ''
                    },
                    //embed = true means the margins will be collapsed to just include the map no title or links
                    embed: false
                };

                urlObject = esri.urlToObject(document.location.href);
                //is an appid specified (either in the config option above, or in query string) - if so, download json from AGO, otherwise accept configOptions defaults
                if (configOptions.appid || (urlObject.query && urlObject.query.appid)) {
                    var appid = configOptions.appid || urlObject.query.appid;
                    var requestHandle = esri.request({
                        url: configOptions.sharingurl + "/" + appid + "/data",
                        content: {
                            f: "json"
                        },
                        callbackParamName: "callback",
                        load: function (response) {
                            if (response.values.title !== undefined) {
                                configOptions.title = response.values.title;
                            }
                            if (response.values.titleLogoUrl !== undefined) {
                                configOptions.titleLogoUrl = response.values.titleLogoUrl;
                            }
                            if (response.values.headerbanner !== undefined) {
                                configOptions.headerbanner = response.values.headerbanner;
                            }
                            if (response.values.description !== undefined) {
                                configOptions.description = response.values.description;
                            }
                            if (response.values.displaytitle !== undefined) {
                                configOptions.displaytitle = response.values.displaytitle;
                            }
                            if (response.values.theme !== undefined) {
                                configOptions.theme = response.values.theme;
                            }
                            if (response.values.displayeditor !== undefined) {
                                configOptions.displayeditor = response.values.displayeditor;
                            }
                            if (response.values.displayprint !== undefined) {
                                configOptions.displayprint = response.values.displayprint;
                            }
                            if (response.values.displaytimeslider !== undefined) {
                                configOptions.displaytimeslider = response.values.displaytimeslider;
                            }
                            if (response.values.displaybookmarks !== undefined) {
                                configOptions.displaybookmarks = response.values.displaybookmarks;
                            }
                            if (response.values.displaymeasure !== undefined) {
                                configOptions.displaymeasure = response.values.displaymeasure;
                            }
                            if (response.values.displaylegend !== undefined) {
                                configOptions.displaylegend = response.values.displaylegend;
                            }
                            if (response.values.displaydetails !== undefined) {
                                configOptions.displaydetails = response.values.displaydetails;
                            }
                            if (response.values.displaylayerlist !== undefined) {
                                configOptions.displaylayerlist = response.values.displaylayerlist;
                            }
                            if (response.values.displaybasemaps !== undefined) {
                                configOptions.displaybasemaps = response.values.displaybasemaps;
                            }
                            if (response.values.displayshare !== undefined) {
                                configOptions.displayshare = response.values.displayshare;
                            }
                            if (response.values.displaysearch !== undefined) {
                                configOptions.displaysearch = response.values.displaysearch;
                            }
                            if (response.values.displayslider !== undefined) {
                                configOptions.displayslider = response.values.displayslider;
                            }
                            if (response.values.displayelevation !== undefined) {
                                configOptions.displayelevation = response.values.displayelevation;
                            }
                            if (response.values.showelevationdifference !== undefined) {
                                configOptions.showelevationdifference === response.values.showelevationdifference;
                            }
                            if (response.values.displayoverviewmap !== undefined) {
                                configOptions.displayoverviewmap = response.values.displayoverviewmap;
                            }
                            if (response.values.webmap !== undefined) {
                                configOptions.webmap = response.values.webmap;
                            }
                            if (response.values.link1text !== undefined) {
                                configOptions.link1.text = response.values.link1text;
                            }
                            if (response.values.link1url !== undefined) {
                                configOptions.link1.url = response.values.link1url;
                            }
                            if (response.values.link2text !== undefined) {
                                configOptions.link2.text = response.values.link2text;
                            }
                            if (response.values.link2url !== undefined) {
                                configOptions.link2.url = response.values.link2url;
                            }
                            if (response.values.placefinderurl !== undefined) {
                                configOptions.placefinder.url = response.values.placefinderurl;
                            }
                            if (response.values.embed !== undefined) {
                                configOptions.embed = response.values.embed;
                            }
                            if (response.values.placefinderfieldname !== undefined) {
                                configOptions.placefinder.singlelinefieldname = response.values.placefinderfieldname;
                            }
                            if (response.values.customlogoimage !== undefined) {
                                configOptions.customlogo.image = response.values.customlogoimage;
                            }
                            if (response.values.customlogolink !== undefined) {
                                configOptions.customlogo.link = response.values.customlogolink;
                            }
                            if (response.values.basemapgrouptitle !== undefined && response.values.basemapgroupowner !== undefined) {
                                configOptions.basemapgroup.title = response.values.basemapgrouptitle;
                                configOptions.basemapgroup.owner = response.values.basemapgroupowner;
                            }
                            //createApp();
                        },
                        error: function (response) {
                            var e = response.message;
                            alert("Unable to create map" + " : " + e);
                            //alert(i18n.viewer.errors.createMap + " : " + e);
                        }
                    });

                }

                return configOptions;
            }
        }
        )
    }
);