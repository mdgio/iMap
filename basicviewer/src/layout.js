var map, locator;
var clickHandler, clickListener;
var editLayers = [],editorWidget;
var webmapExtent;
var urlObject;

var measure;

function initMap() {
  /*
  //setup defaults
  if (configOptions.geometryserviceurl && location.protocol === "https:") {
    configOptions.geometryserviceurl = configOptions.geometryserviceurl.replace('http:', 'https:');
  }
  esri.config.defaults.geometryService = new esri.tasks.GeometryService(configOptions.geometryserviceurl);


  if (!configOptions.sharingurl) {
    configOptions.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
  }
  
  esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;

       
  if(!configOptions.proxyurl){   
	configOptions.proxyurl = location.protocol + '//' + location.host + "/sharing/proxy";
   }

  
  esri.config.defaults.io.proxyUrl = configOptions.proxyurl;

  esri.config.defaults.io.alwaysUseProxy = false;
*/
  
/*
  urlObject = esri.urlToObject(document.location.href);

  //is an appid specified - if so read json from there
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
        createApp();
      },
      error: function (response) {
        var e = response.message;
        alert(i18n.viewer.errors.createMap + " : " + e);
      }
    });

  } else {
    createApp();
  }
*/


//});
}

//CREATE APPLICATION FROM CONFIG SETTINGS
function createApp() {
/*
  //override configuration settings if any url parameters are set 
  if (urlObject.query) {
    if (urlObject.query.title) {
      configOptions.title = urlObject.query.title;
    }
    if (urlObject.query.customlogoimage) {
      configOptions.customlogo.image = urlObject.query.customlogoimage;
    }
    if (urlObject.query.webmap) {
      configOptions.webmap = urlObject.query.webmap;
    }
    if (urlObject.query.displaytitle) {
      configOptions.displaytitle = (urlObject.query.displaytitle === 'true') ? true : false;
    }
    if (urlObject.query.theme) {
      configOptions.theme = urlObject.query.theme;
    }
    if (urlObject.query.bingmapskey) {
      configOptions.bingmapskey = urlObject.query.bingmapskey;
    }
    if (urlObject.query.displaymeasure) {
      configOptions.displaymeasure = (urlObject.query.displaymeasure === 'true') ? true : false;
    }
    if (urlObject.query.displayshare) {
      configOptions.displayshare = (urlObject.query.displayshare === 'true') ? true : false;
    }
    if (urlObject.query.displaybasemaps) {
      configOptions.displaybasemaps = (urlObject.query.displaybasemaps === 'true') ? true : false;
    }
    if (urlObject.query.displayoverviewmap) {
      configOptions.displayoverviewmap = (urlObject.query.displayoverviewmap === 'true') ? true : false;
    }
    if (urlObject.query.displayeditor) {
      configOptions.displayeditor = (urlObject.query.displayeditor === 'true') ? true : false;
    }
    if (urlObject.query.displaylegend) {
      configOptions.displaylegend = (urlObject.query.displaylegend === 'true') ? true : false;
    }
    if (urlObject.query.displaysearch) {
      configOptions.displaysearch = (urlObject.query.displaysearch === 'true') ? true : false;
    }
    if (urlObject.query.displaybookmarks) {
      configOptions.displaybookmarks = (urlObject.query.displaybookmarks === 'true') ? true : false;
    }
    if (urlObject.query.displaylayerlist) {
      configOptions.displaylayerlist = (urlObject.query.displaylayerlist === 'true') ? true : false;
    }
    if (urlObject.query.displaydetails) {
      configOptions.displaydetails = (urlObject.query.displaydetails === 'true') ? true : false;
    }
    if (urlObject.query.displaytimeslider) {
      configOptions.displaytimeslider = (urlObject.query.displaytimeslider === 'true') ? true : false;
    }
    if (urlObject.query.displayelevation) {
      configOptions.displayelevation = (urlObject.query.displayelevation === 'true') ? true : false;
    }
    if (urlObject.query.showelevationdifference) {
      configOptions.showelevationdifference = (urlObject.query.showelevationdifference === 'true') ? true : false;
    }
    if (urlObject.query.displayprint) {
      configOptions.displayprint = (urlObject.query.displayprint === 'true') ? true : false;
    }
    if (urlObject.query.displayscalebar) {
      configOptions.displayscalebar = (urlObject.query.displayscalebar === 'true') ? true : false;
    }
    if (urlObject.query.displayslider) {
      configOptions.displayslider = (urlObject.query.displayslider === 'true') ? true : false;
    }
    if (urlObject.query.constrainmapextent) {
      configOptions.constrainmapextent = (urlObject.query.constrainmapextent === 'true') ? true : false;
    }
    if (urlObject.query.basemapGroupOwner && urlObject.query.basemapGroupTitle) {
      configOptions.basemapgroup.title = urlObject.query.basemapGroupTitle;
      configOptions.basemapgroup.owner = urlObject.query.basemapGroupOwner;
    }
    if (urlObject.query.extent) {
      configOptions.extent = urlObject.query.extent;
    }
    if (urlObject.query.gcsextent) {
      configOptions.gcsextent = urlObject.query.gcsextent;
    }
    if (urlObject.query.customLogoImage) {
      configOptions.customlogo.image = urlObject.query.customLogoImage;
    }
    if (urlObject.query.embed) {
      configOptions.embed = (urlObject.query.embed === 'true') ? true : false;
    }
    if (urlObject.query.leftpanelvisible) {
      configOptions.leftPanelVisibility = (urlObject.query.leftpanelvisible === 'true') ? true : false;
    }

  }
*/

/* Moved to layout module
  //load the specified theme 
  var ss = document.createElement("link");
  ss.type = "text/css";
  ss.rel = "stylesheet";
  ss.href = "css/" + configOptions.theme + ".css";
  document.getElementsByTagName("head")[0].appendChild(ss);

  //will this app be embedded - if so turn off title and links
  if (configOptions.embed === "true" || configOptions.embed === true) {
/*    configOptions.displaytitle = false;
    configOptions.link1.url = "";
    configOptions.link2.url = "";*//*
  }else{
    dojo.addClass(dojo.body(),'notembed');
    dojo.query("html").addClass("notembed");
  }

  //create the links for the top of the application if provided
  if (configOptions.link1.url && configOptions.link2.url) {
    if (configOptions.displaytitle == "false" || configOptions.displaytitle === false) {
      //size the header to fit the links
      dojo.style(dojo.byId("header"), "height", "25px");
    }
    esri.show(dojo.byId('nav'));
    dojo.create("a", {
      href: configOptions.link1.url,
      target: '_blank',
      innerHTML: configOptions.link1.text
    }, 'link1List');
    dojo.create("a", {
      href: configOptions.link2.url,
      target: '_blank',
      innerHTML: configOptions.link2.text
    }, 'link2List');
  }


  //create the map and enable/disable map options like slider, wraparound, esri logo etc
  if (configOptions.displayslider === 'true' || configOptions.displayslider === true) {
    configOptions.displaySlider = true;
  } else {
    configOptions.displaySlider;
  }
  if (configOptions.constrainmapextent === 'true' || configOptions.constrainmapextent === true) {
    configOptions.constrainmapextent = true;
  } else {
    configOptions.constrainmapextent = false;
  }
*/

/*Not going to worry about this, only possible in querystring anyways
  if (configOptions.gcsextent) {
 
    //make sure the extent is valid minx,miny,maxx,maxy
    var extent = configOptions.gcsextent;
    if (extent) {
      var extArray = extent.split(",");
      if (dojo.some(extArray, function (value) {
        return isNaN(value);
      })) {
        getItem(configOptions.webmap);
      } else {
        if (extArray.length == 4) {
          getItem(configOptions.webmap, extArray);
        } else {
          createMap(configOptions.webmap);
        }
      }
    }
  } else {
    createMap(configOptions.webmap);
  }

*/

}

/* left out
function getItem(item, extArray) {
  //get the item and update the extent then create the map 
  var deferred = esri.arcgis.utils.getItem(item);

  deferred.addCallback(function (itemInfo) {
    if (extArray) {
      itemInfo.item.extent = [
        [parseFloat(extArray[0]), parseFloat(extArray[1])],
        [parseFloat(extArray[2]), parseFloat(extArray[3])]
      ];
    }
    createMap(itemInfo);
  });

  deferred.addErrback(function (error) {
    alert(i18n.viewer.errors.createMap + " : " + dojo.toJson(error.message));
  });
}
*/

   //CREATE MAP
function createMap(webmapitem) {
  var mapDeferred = esri.arcgis.utils.createMap(webmapitem, "map", {
    mapOptions: {
      slider: configOptions.displaySlider,
      sliderStyle:'small',
      nav: false,
      wrapAround180: !configOptions.constrainmapextent,
      showAttribution:true,
      //set wraparound to false if the extent is limited.
      logo: !configOptions.customlogo.image //hide esri logo if custom logo is provided
    },
    ignorePopups: false,
    bingMapsKey: configOptions.bingmapskey
  });

  mapDeferred.addCallback(function (response) {
    //add webmap's description to details panel 
    if (configOptions.description === "") {
      if (response.itemInfo.item.description !== null) {
        configOptions.description = response.itemInfo.item.description;
      }
    }

      configOptions.owner = response.itemInfo.item.owner;
      document.title = configOptions.title || response.itemInfo.item.title;
      //add a title
      if (configOptions.displaytitle === "true" || configOptions.displaytitle === true) {
          configOptions.title = configOptions.title || response.itemInfo.item.title;

          //add small image and application title to the toolbar SJS
          //createToolbarTitle();

          //Add a logo to the header if set SJS
          var logoImgHtml = '<img id="titleLogo" src="' +  configOptions.titleLogoUrl + '" alt="MD Logo" />';
          dojo.create("div", {
              id: 'webmapTitle',
              innerHTML: logoImgHtml
          }, "header");
          dojo.style(dojo.byId("header"), "height", "80px");
          var logoImgHtml = '<img id="tbLogoImage" src="' +  configOptions.titleLogoUrl + '" alt="MD Logo" style="height:100%" />';
         // dojo.byId('ToolbarLogo').innerHTML = logoImgHtml
          //dojo.style(dojo.byId("header"), "height", "70px");
      } else if (!configOptions.link1.url && !configOptions.link2.url) {
          //no title or links - hide header
          esri.hide(dojo.byId('header'));
          esri.show(dojo.byId('ToolbarLogo'));
          dojo.addClass(dojo.body(), 'embed');
          dojo.query("html").addClass("embed");
      }
      //add banner image to header SJS
      if (configOptions.headerbanner) {
          var hdImgHTML = "url(" + configOptions.headerbanner + ")";
          dojo.style(dojo.byId("header"), "background-image", hdImgHTML)
      }

    //get the popup click handler so we can disable it when measure tool is active
    clickHandler = response.clickEventHandle;
    clickListener = response.clickEventListener;
    map = response.map;
    //Constrain the extent of the map to the webmap's initial extent
    if (configOptions.constrainmapextent === 'true' || configOptions.constrainmapextent === true) {
      webmapExtent = response.map.extent.expand(1.5);
    }

    //if an extent was specified using url params go to that extent now    
    if (configOptions.extent) {
      map.setExtent(new esri.geometry.Extent(dojo.fromJson(configOptions.extent)));
    }

    if (map.loaded) {
        addToolbarToMap();
      initUI(response);
    } else {
      dojo.connect(map, "onLoad", function () {
          addToolbarToMap();
        initUI(response);
      });
    }
    dojo.connect(dijit.byId('map'), 'resize', map, resizeMap);
  });

  mapDeferred.addErrback(function (error) {
    alert(i18n.viewer.errors.createMap + " : " + dojo.toJson(error.message));
  });

    //if embed set to true, change the map size.
    if (configOptions.embed === "true" || configOptions.embed === true) {
        changeMapSize()
    }
}

function initUI(response) {


  var layers = response.itemInfo.itemData.operationalLayers;


  //constrain the extent
  if (configOptions.constrainmapextent === 'true' || configOptions.constrainmapextent === true) {
    var basemapExtent = map.getLayer(map.layerIds[0]).fullExtent.expand(1.5);
    //create a graphic with a hole over the web map's extent. This hole will allow
    //the web map to appear and hides the rest of the map to limit the visible extent to the webmap.
    var clipPoly = new esri.geometry.Polygon(map.spatialReference);
    clipPoly.addRing([
      [basemapExtent.xmin, basemapExtent.ymin],
      [basemapExtent.xmin, basemapExtent.ymax],
      [basemapExtent.xmax, basemapExtent.ymax],
      [basemapExtent.xmax, basemapExtent.ymin],
      [basemapExtent.xmin, basemapExtent.ymin]
    ]);
    //counter-clockwise to add a hole
    clipPoly.addRing([
      [webmapExtent.xmin, webmapExtent.ymin],
      [webmapExtent.xmax, webmapExtent.ymin],
      [webmapExtent.xmax, webmapExtent.ymax],
      [webmapExtent.xmin, webmapExtent.ymax],
      [webmapExtent.xmin, webmapExtent.ymin]
    ]);

    var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(), new dojo.Color("white"));

    var maxExtentGraphic = new esri.Graphic(clipPoly, symbol);

    map.graphics.add(maxExtentGraphic);
  }



  //add a custom logo to the map if provided
  if (configOptions.customlogo.image) {
    esri.show(dojo.byId('logo'));
    //if a link isn't provided don't make the logo clickable
    if (configOptions.customlogo.link) {
      var link = dojo.create('a', {
        href: configOptions.customlogo.link,
        target: '_blank'
      }, dojo.byId('logo'));

      dojo.create('img', {
        src: configOptions.customlogo.image
      }, link);
    } else {
      dojo.create('img', {
        id: 'logoImage',
        src: configOptions.customlogo.image
      }, dojo.byId('logo'));
      //set the cursor to the default instead of the pointer since the logo is not clickable
      dojo.style(dojo.byId('logo'), 'cursor', 'default');
    }

  }

  //initialize the geocoder
  if (configOptions.placefinder.url && location.protocol === "https:") {
    configOptions.placefinder.url = configOptions.placefinder.url.replace('http:', 'https:');
  }
  locator = new esri.tasks.Locator(configOptions.placefinder.url);
  locator.outSpatialReference = map.spatialReference;
  dojo.connect(locator, "onAddressToLocationsComplete", showResults);

  if (configOptions.displayscalebar === "true" || configOptions.displayscalebar === true) {
    //add scalebar
    var scalebar = new esri.dijit.Scalebar({
      map: map,
      scalebarUnit: i18n.viewer.main.scaleBarUnits //metric or english
    });
  }

  //Add/Remove tools depending on the config settings or url parameters
  if (configOptions.displayprint === "true" || configOptions.displayprint === true) {
    addPrint();
  }
  if (configOptions.displaylayerlist === 'true' || configOptions.displaylayerlist === true) {
    addLayerList(layers);
  }
  if (configOptions.displaybasemaps === 'true' || configOptions.displaybasemaps === true) {
    //add menu driven basemap gallery if embed = true
    if (configOptions.embed) {
      addBasemapGalleryMenu();
    } else {
      addBasemapGallery();
    }
  }

  if (configOptions.displaymeasure === 'true' || configOptions.displaymeasure === true) {
    addMeasurementWidget();
  } else {
    esri.hide(dojo.byId('floater'));
  }
  if (configOptions.displayelevation && configOptions.displaymeasure) {

    esri.show(dojo.byId('bottomPane'));
    createElevationProfileTools();
  }
  if (configOptions.displaybookmarks === 'true' || configOptions.displaybookmarks === true) {
    addBookmarks(response);
  }
  if (configOptions.displayoverviewmap === 'true' || configOptions.displayoverviewmap === true) {
    //add the overview map - with initial visibility set to false.
    addOverview(false);
  }

  //do we have any editable layers - if not then set editable to false
  editLayers = hasEditableLayers(layers);
  if (editLayers.length === 0) {
    configOptions.displayeditor = false;
  }

  //do we have any operational layers - if not then set legend to false
  var layerInfo = buildLayersList(layers);
  if (layerInfo.length === 0) {
    configOptions.displaylegend = false;
  }

  //hide the left pane if editor, details and legend are all false
  if (configOptions.displayeditor === 'true' || configOptions.displayeditor === true) {
    configOptions.displayeditor = true;
  }

  if (configOptions.displaydetails === 'true' || configOptions.displaydetails === true) {
    configOptions.displaydetails = true;
  }
  if (configOptions.displaylegend === 'true' || configOptions.displaylegend === true) {
    configOptions.displaylegend = true;
  }
	addInterop();

  if (displayLeftPanel()) {

    //create left panel
	var bc = dijit.byId('leftPane');
	esri.show(dojo.byId('leftPane'));
    var cp = new dijit.layout.ContentPane({
      id: 'leftPaneHeader',
      region: 'top',
      style: 'height:10px;',
      content: esri.substitute({
        close_title: i18n.panel.close.title,
        close_alt: i18n.panel.close.label
      }, '<div style="float:right;clear:both;" id="paneCloseBtn"><a title=${close_title} alt=${close_alt} href="JavaScript:hideLeftOrRightPanel(\'left\');"><img src=images/closepanel.png border="0"/></a></div>')
    });
	bc.addChild(cp);
    var cp2 = new dijit.layout.StackContainer({
      id: 'stackContainer',
	  region:'center',
	  style:'height:98%;'
    });
    bc.addChild(cp2);

    dojo.style(dojo.byId("leftPane"), "width", configOptions.leftpanewidth + "px");

      //Add the Editor Button and Panel
      if (configOptions.displayeditor == 'true' || configOptions.displayeditor === true) {
        addEditor(editLayers); //only enabled if map contains editable layers
      }

      //Add the Detail button and panel
      if ((configOptions.displaydetails === 'true' || configOptions.displaydetails === true) && configOptions.description !== "") {

        var detailTb = new dijit.form.ToggleButton({
          showLabel: true,
          label: i18n.tools.details.label,
          title: i18n.tools.details.title,
          checked: true,
          iconClass: 'esriDetailsIcon',
          id: 'detailButton'
        }, dojo.create('div'));
        dojo.byId('webmap-toolbar-left').appendChild(detailTb.domNode);

        dojo.connect(detailTb, 'onClick', function () {
          navigateStack('detailPanel');
        });

        var detailCp = new dijit.layout.ContentPane({
          title: i18n.tools.details.title,
          selected: true,
          region:'center',
          id: "detailPanel"
        });


        //set the detail info
        detailCp.set('content', configOptions.description);


        dijit.byId('stackContainer').addChild(detailCp);
        dojo.addClass(dojo.byId('detailPanel'), 'panel_content');
        navigateStack('detailPanel');
      }
      if (configOptions.displaylegend == 'true' || configOptions.displaylegend === true) {
        addLegend(layerInfo);
      }

      if (configOptions.leftPanelVisibility == 'false' || configOptions.leftPanelVisibility === false) {
          hideLeftOrRightPanel('left');
      }
      //***edit
    //dijit.byId('mainWindow').resize();
    //resizeMap();
  }

    //Instantiate the right panel
    var rightPaneDiv = dojo.byId('rightPane')
    esri.show(rightPaneDiv);
    dojo.style(rightPaneDiv, "width", configOptions.rightpanewidth + "px");
    hideLeftOrRightPanel('right');

    dijit.byId('mainWindow').resize();
    resizeMap();


  //Create the search location tool
  if (configOptions.displaysearch === 'true' || configOptions.displaysearch === true) {
    createSearchTool();
  } else {
    esri.hide(dojo.byId('webmap-toolbar-right'));
  }

  //add the time slider if the layers are time-aware 
  if (configOptions.displaytimeslider === 'true' || configOptions.displaytimeslider === true) {
    if (response.itemInfo.itemData.widgets && response.itemInfo.itemData.widgets.timeSlider) {
      addTimeSlider(response.itemInfo.itemData.widgets.timeSlider.properties);
    } else {
      //check to see if we have time aware layers 
      var timeLayers = hasTemporalLayer(layers);
      if (timeLayers.length > 0) {
        //do we have time aware layers? If so create time properties
        var fullExtent = getFullTimeExtent(timeLayers);
        var timeProperties = {
          'startTime': fullExtent.startTime,
          'endTime': fullExtent.endTime,
          'thumbCount': 2,
          'thumbMovingRate': 2000,
          'timeStopInterval': findDefaultTimeInterval(fullExtent)
        }
        addTimeSlider(timeProperties);
      } else {
        configOptions.displaytimeslider = false;
        esri.hide(dojo.byId('timeFloater'));
      }

    }
  }

  //Display the share dialog if enabled 
  if (configOptions.displayshare === 'true' || configOptions.displayshare === true) {
    createSocialLinks();
  }

  //resize the border container 
   dijit.byId('bc').resize();
   
    resizeMap(); //resize the map in case any of the border elements have changed
}

function addToolbarToMap(){
    var placeholder = dojo.byId('toolbarContainer');
    //placeholder.load('widgets/toolbar/templates/toolbar.html');
    // points to $dojoroot/dijit/form/tests/TestFile.html
//   var url = require.toURL("widgets/core/toolbar/templates/toolbar.htm");
//    xhr.get({
//        url: url,
//        load: function(html){
//            dom.byId("map_root").innerHTML = html;
//        }
//    })
   dojo.byId('map_root').appendChild(placeholder);
}

function createToolbarTitle(){
    //Add a title to the toolbar Left SJS
    dojo.create("div", {
        id: 'ToolbarLogo',
        style: 'display:none;height:27px;margin-right:8px; '
    }, "webmap-toolbar-left", "first");
    dojo.create("div", {
        id: 'ProperTitle',
        innerHTML: configOptions.title,
        style: 'font: 14pt/16pt times, cursive, Serif; padding-left:5px; padding-top:5px; display:inline-block;'
    }, "webmap-toolbar-left");
    return
}

function displayLeftPanel() {
  //display the left panel if any of these options are enabled. 
  var display = false;
  if (configOptions.displaydetails && configOptions.description !== '') {
    display = true;
  }
  if (configOptions.displaylegend) {
    display = true;
  }
  if (configOptions.displayeditor) {
    display = true;
  }
  return display;
}

function resizeMap() {
  if (map) {
    map.resize();
    map.reposition();
  }
}


//select panels in the stack container. The stack container is used to organize content 
//in the left panel (editor, legend, details)
function navigateStack(label) {
  //display the left panel if its hidden
    showLeftOrRightPanel('left');

  //select the appropriate container 
  dijit.byId('stackContainer').selectChild(label);

  //hide or show the editor 
  if (label === 'editPanel') {
    createEditor();
  } else {
    destroyEditor();
  }

  //toggle the other buttons
  var buttonLabel = '';
  switch (label) {
  case 'editPanel':
    buttonLabel = 'editButton';
    break;
  case 'legendPanel':
    buttonLabel = 'legendButton';
    break;
  case 'detailPanel':
    buttonLabel = 'detailButton';
    break;
  }
  toggleToolbarButtons(buttonLabel);
}

//use the locator to find the input location
function findLocation() {
  var searchText = dojo.byId('searchField').value;
  //clear any existing map graphics
  map.graphics.clear();

  var address = {};
  address[configOptions.placefinder.singlelinefieldname] = searchText;

  //was a country code specified - if so use it. This will make searches faster. 
  if(configOptions.placefinder.countryCode){
    address.CountryCode = configOptions.placefinder.countryCode;
  }

  var options = {
    address: address,
    outFields: ["*"]
  };
  if(configOptions.placefinder.currentExtent){
    options.searchExtent = map.extent;
  }


  locator.addressToLocations(options);

}
//display the location results on the map 
function showResults(candidates) {
  var candidate;
  var geom;
  //hide the info window if displayed
  if (map.infoWindow.isShowing) {
    map.infoWindow.clearFeatures();
    map.infoWindow.hide();
  }
  var zoomExtent;
  dojo.every(candidates, function (candidate) {

    if (candidate.score > 80) {
      geom = candidate.location;
      map.infoWindow.setTitle(i18n.tools.search.title);
      map.infoWindow.setContent(candidate.address);
      map.infoWindow.show(geom);
      //old geocoder with west_lon, south_lat properties 
      var minx, miny, maxx, maxy
      if(candidate.attributes.West_Lon){
         minx = parseFloat(candidate.attributes.West_Lon);
         miny = parseFloat(candidate.attributes.South_Lat);
         maxx = parseFloat(candidate.attributes.East_Lon);
         maxy = parseFloat(candidate.attributes.North_Lat);
     }
     if(candidate.attributes.Xmax){
        minx = parseFloat(candidate.attributes.Xmin);
        maxx = parseFloat(candidate.attributes.Xmax);
        miny = parseFloat(candidate.attributes.Ymin);
        maxy = parseFloat(candidate.attributes.Ymax);
     }
      zoomExtent = new esri.geometry.Extent(minx, miny, maxx, maxy, new esri.SpatialReference({wkid:4326}));
      
      return false; //break out of loop after one candidate with score greater  than 80 is found.
    }
  });
  if (geom !== undefined) {
    //if the extent is constrained check to see if geocode result is within extent.If it is then zoom otherwise don't.
    if ((configOptions.constrainmapextent === 'true' || configOptions.constrainmapextent === true) && !webmapExtent.contains(geom)) {
      dojo.byId('searchField').value = i18n.tools.search.errors.missingLocation;
      map.infoWindow.hide();
    } else {
    //zoom to the best fit extent 
      var mapSr = checkMapSpatialReference();
      if(mapSr.mapIsGCS){
        map.setExtent(zoomExtent);        
      }
      if(mapSr.mapIsWebMercator){
        map.setExtent(esri.geometry.geographicToWebMercator(zoomExtent));
      }
      if(!mapSr.mapIsWebMercator && !mapSr.mapIsGCS){
        //project and then zoom to extent 
        var outSR = mapSr.mapSR;
         esri.config.defaults.geometryService .project([zoomExtent],outSR,function(results){
            if(results.length > 0){
             map.setExtent(results[0]);
            }
        });
      }

    }
  } else {
    //no matches found
    dojo.byId('searchField').value = i18n.tools.search.errors.missingLocation;
  }
}

function checkMapSpatialReference() {

    var mapIsWebMercator = false;
    var mapIsGCS = false;

    var  mapSR = map.spatialReference;
    var web_mercator=  [3857, 102113, 102100, 900913];
    mapIsWebMercator = (dojo.some(web_mercator, function(el2){
      return el2 === mapSR.wkid;
    }));
    mapIsGCS = (mapSR.wkid === 4326);
		
    return {mapIsWebMercator: mapIsWebMercator, mapIsGCS:mapIsGCS, mapSR: mapSR};

  }

//Utility functions that handles showing and hiding the left or right panel. Hide occurs when
//the x (close) button is clicked for left panel.
/*function showLeftPanel() {
  //display the left panel if hidden
  var leftPaneWidth = dojo.style(dojo.byId("leftPane"), "width");
  if (leftPaneWidth === 0) {
    dojo.style(dojo.byId("leftPane"), "width", configOptions.leftpanewidth + "px");
    dijit.byId("mainWindow").resize();
  }
}*/
function showLeftOrRightPanel(direction) {
    var targetDivId = direction.toLowerCase() + "Pane";
    var targetDiv = dojo.byId(targetDivId);
    var targetPaneWidth = dojo.style(targetDiv, "width");
    if (targetPaneWidth === 0) {
        dojo.style(targetDiv, "width", configOptions[targetDivId.toLowerCase() + "width"] + "px");
        dijit.byId("mainWindow").resize();
    }
}

/*function hideLeftPanel() {
  //close the left panel when x button is clicked
  var leftPaneWidth = dojo.style(dojo.byId("leftPane"), "width");
  if (leftPaneWidth === 0) {
    leftPaneWidth = configOptions.leftpanewidth;
  }
  dojo.style(dojo.byId("leftPane"), "width", "0px");
  dijit.byId('mainWindow').resize();
  resizeMap();
  //uncheck the edit, detail and legend buttons
  setTimeout(function () {
    toggleToolbarButtons('');

  }, 100);
}*/
function hideLeftOrRightPanel(direction) {
    //close the left panel when x button is clicked
    direction = direction.toLowerCase();
    var targetDivId = direction + "Pane";
    var targetDiv = dojo.byId(targetDivId);
    var targetPaneWidth = dojo.style(targetDiv, "width");
    if (targetPaneWidth === 0) {
        targetPaneWidth = configOptions[targetDivId.toLowerCase() + "width"];
    }
    dojo.style(targetDiv, "width", "0px");
    dijit.byId('mainWindow').resize();
    resizeMap();
    //uncheck the edit, detail and legend buttons
    if (direction === 'left') {
        setTimeout(function () {
            toggleToolbarButtons('');
        }, 100);
    }
}


//LEFT TOOLBAR BUTTONS

function toggleToolbarButtons(label) {
  var buttons = ['detailButton', 'editButton', 'legendButton'];
  dojo.forEach(buttons, function (button) {
    if (dijit.byId(button)) {
      if (button === label) {
        dijit.byId(label).set('checked', true);
      } else {
        dijit.byId(button).set('checked', false);
      }
    }
  });

}


//SOCIAL MEDIA TOOLS
//Create links for sharing the app via social networking use bitly to shorten the url
function updateLinkUrls() {
  //get the current map extent
  var extent = "";
  extent = "&extent=" + dojo.toJson(map.extent.toJson());

  var appUrl = (document.location.href.split("?"));
  var link = appUrl[0] + "?" + extent;
  if (appUrl[1]) {
    link += "&" + appUrl[1];
  }


  var mapTitle = "Web Map";
  if (dojo.byId("webmapTitle")) {
    mapTitle = encodeURIComponent(dojo.byId("webmapTitle").innerHTML);
  }

  if (configOptions.bitly.key && configOptions.bitly.login) {
    var url = "http://api.bit.ly/v3/shorten?" + "login=" + configOptions.bitly.login + "&apiKey=" + configOptions.bitly.key + "&longUrl=" + encodeURIComponent(link) + "&format=json";
    esri.request({
      url: url,
      handleAs: "json",
      callbackParamName: "callback",
      load: function (results) {
        createLink(mapTitle, results.data.url);
      },
      error: function (e) {
        alert(i18n.viewer.errors.general + ":" + dojo.toJson(error.message));
      }
    });
  } else {
    //no bitly key provided use long url 
    var url = encodeURIComponent(link);
    createLink(mapTitle, url);

  }


}

function createLink(mapTitle, url) {
  dojo.byId('mailLink').href = "mailto:?subject=" + mapTitle + "&body=Check out this map: %0D%0A " + url;
  dojo.byId('facebookLink').href = "http://www.facebook.com/sharer.php?u=" + url + "&t=" + mapTitle;
  dojo.byId('twitterLink').href = "http://www.twitter.com/home?status=" + mapTitle + "+" + url;
}


//BASEMAP GALLERY
function addBasemapGalleryMenu() {
  //This option is used for embedded maps so the gallery fits well with apps of smaller sizes. 
  var basemapGroup = null;
  if (configOptions.basemapgroup.title && configOptions.basemapgroup.owner) {
    basemapGroup = {
      "owner": configOptions.basemapgroup.owner,
      "title": configOptions.basemapgroup.title
    }
  }

  var ht = map.height / 2;
  var cp = new dijit.layout.ContentPane({
    id: 'basemapGallery',
    style: "height:" + ht + "px;width:190px;"
  });

  var basemapMenu = new dijit.Menu({
    id: 'basemapMenu'
  });

  //if a bing maps key is provided - display bing maps too.
  var basemapGallery = new esri.dijit.BasemapGallery({
    showArcGISBasemaps: true,
    basemapsGroup: basemapGroup,
    bingMapsKey: configOptions.bingmapskey,
    map: map
  });
  cp.set('content', basemapMenu.domNode);
  dojo.connect(basemapGallery, 'onLoad', function () {
    dojo.forEach(basemapGallery.basemaps, function (basemap) {
      //Add a menu item for each basemap, when the menu items are selected
      dijit.byId('basemapMenu').addChild(new myModules.custommenu({
        label: basemap.title,
        icon: basemap.thumbnailUrl,
        onClick: function () {
          basemapGallery.select(basemap.id);
        }
      }));

    });
  });

  var button = new dijit.form.DropDownButton({
    //label: i18n.tools.basemap.label,
    id: "basemapBtn",
    iconClass: "esriBasemapIcon",
    title: i18n.tools.basemap.title,
    dropDown: cp
  });

  dojo.byId('webmap-toolbar-center').appendChild(button.domNode);

  dojo.connect(basemapGallery, "onSelectionChange", function () {
    //close the basemap window when an item is selected
    //destroy and recreate the overview map  - so the basemap layer is modified.
    destroyOverview();
    dijit.byId('basemapBtn').closeDropDown();
  });

  basemapGallery.startup();
}

//Add the basemap gallery widget to the application. 
function addBasemapGallery() {
  //if a basemap group was specified listen for the callback and modify the query
  var basemapGroup = null;
  if (configOptions.basemapgroup.title && configOptions.basemapgroup.owner) {
    basemapGroup = {
      "owner": configOptions.basemapgroup.owner,
      "title": configOptions.basemapgroup.title
    }
  }
  var cp = new dijit.layout.ContentPane({
    id: 'basemapGallery',
    style: "max-height:448px;width:380px;"
  });

  //if a bing maps key is provided - display bing maps too.
  var basemapGallery = new esri.dijit.BasemapGallery({
    showArcGISBasemaps: true,
    basemapsGroup: basemapGroup,
    bingMapsKey: configOptions.bingmapskey,
    map: map
  }, dojo.create('div'));


  cp.set('content', basemapGallery.domNode);


  var button = new dijit.form.DropDownButton({
    //label: i18n.tools.basemap.label,
    id: "basemapBtn",
    iconClass: "esriBasemapIcon",
    title: i18n.tools.basemap.title,
    dropDown: cp
  });

  dojo.byId('webmap-toolbar-center').appendChild(button.domNode);

  dojo.connect(basemapGallery, "onSelectionChange", function () {
    //close the basemap window when an item is selected
    //destroy and recreate the overview map  - so the basemap layer is modified.
    destroyOverview();
    dijit.byId('basemapBtn').closeDropDown();
  });

  basemapGallery.startup();
}


//BOOKMARKS
//add any bookmarks to the application
function addBookmarks(info) {
  //does the web map have any bookmarks
  if (info.itemInfo.itemData.bookmarks) {
    var bookmarks = new esri.dijit.Bookmarks({
      map: map,
      bookmarks: info.itemInfo.itemData.bookmarks
    }, dojo.create("div"));


    dojo.connect(bookmarks, "onClick", function () {
      //close the bookmark window when an item is clicked
      dijit.byId('bookmarkButton').closeDropDown();
    });


    var cp = new dijit.layout.ContentPane({
      id: 'bookmarkView'
    });
    cp.set('content', bookmarks.bookmarkDomNode);
    var button = new dijit.form.DropDownButton({
      label: i18n.tools.bookmark.label,
      id: "bookmarkButton",
      iconClass: "esriBookmarkIcon",
      title: i18n.tools.bookmark.title,
      dropDown: cp
    });

    dojo.byId('webmap-toolbar-center').appendChild(button.domNode);
  }

}
//Create a menu with a list of operational layers. Each menu item contains a check box
//that allows users to toggle layer visibility.

//LAYERS
function addLayerList(layers) {
  /*var layerList = buildLayerVisibleList(layers);
  if (layerList.length > 0) {
    //create a menu of layers
    layerList.reverse();
    var menu = new dijit.Menu({
      id: 'layerMenu'
    });
    dojo.forEach(layerList, function (layer) {
      menu.addChild(new dijit.CheckedMenuItem({
        label: layer.title,
        checked: layer.visible,
        onChange: function () {
          if (layer.layer.featureCollection) {
            //turn off all the layers in the feature collection even
            //though only the  main layer is listed in the layer list 
            dojo.forEach(layer.layer.featureCollection.layers, function (layer) {
              layer.layerObject.setVisibility(!layer.layerObject.visible);
            });
          } else {
            layer.layer.setVisibility(!layer.layer.visible);
          }

        }
      }));
    });


    var button = new dijit.form.DropDownButton({
      label: i18n.tools.layers.label,
      id: "layerBtn",
      iconClass: "esriLayerIcon",
      title: i18n.tools.layers.title,
      dropDown: menu
    });

    dojo.byId('webmap-toolbar-center').appendChild(button.domNode);
  }*/

    var toggleButton = new dijit.form.ToggleButton({
        //label: i18n.tools.layers.label,
        title: i18n.tools.layers.title,
        id: "layerBtn",
        iconClass: "esriLayerIcon"
    });

    dojo.connect(toggleButton, "onClick", function () {
        var targetPaneWidth = dojo.style(dojo.byId('leftPane'), "width");
        if (targetPaneWidth === 0) {
            showLeftOrRightPanel('right');
            dijit.byId('tocWidg').initializeDijitToc(map);
        } else
            hideLeftOrRightPanel('right');
    });

    dojo.byId('webmap-toolbar-center').appendChild(toggleButton.domNode);
}

//build a list of layers for the toggle layer list - this list
//is slightly different than the legend because we don't want to list lines,points,areas etc for each
//feature collection type. 
/*function buildLayerVisibleList(layers) {
  var layerInfos = [];
  dojo.forEach(layers, function (mapLayer, index) {
    if (mapLayer.featureCollection && !mapLayer.layerObject) {
      if (mapLayer.featureCollection.layers) {
        //add the first layer in the layer collection... not all  - when we turn off the layers we'll 
        //turn them all off 
        if (mapLayer.featureCollection.layers) {
          layerInfos.push({
            "layer": mapLayer,
            "visible": mapLayer.visibility,
            "title": mapLayer.title
          });
        }
      }
    } else if (mapLayer.layerObject) {
      layerInfos.push({
        layer: mapLayer.layerObject,
        visible: mapLayer.layerObject.visible,
        title: mapLayer.title
      });
    }
  });
  return layerInfos;
}*/


//PRINT WIDGET
function addPrint() {
    var layoutOptions ={
    'authorText':configOptions.owner,
    'titleText': configOptions.title,
    'scalebarUnit': (i18n.viewer.main.scaleBarUnits === 'english') ? 'Miles' : 'Kilometers',
    'legendLayers':[]
    };

    var templates = dojo.map(configOptions.printlayouts,function(layout){
    layout.layoutOptions = layoutOptions;
    return layout;
    });
    // print dijit
    var printer = new esri.dijit.Print({
      map: map,
      templates: templates,
      url: configOptions.printtask
    },dojo.create('span'));
    
    dojo.query('.esriPrint').addClass('esriPrint');

    dojo.byId('webmap-toolbar-center').appendChild(printer.printDomNode);

    printer.startup();
}

//DATA WIDGET
function addInterop() {
   /*var fpI = new dojox.layout.FloatingPane({
		title: 'Data Interoperability',
		resizable: false,
		dockable: false,
		closable: false,
		style: "position:absolute;top:0;left:50px;width:245px;height:175px;z-index:100;visibility:hidden;",
		id: 'interop'
	}, dojo.byID('interop'));
    //fpI.startup();*/


  /*var titlePane = dojo.query('#interop .dojoxFloatingPaneTitle')[0];
  //add close button to title pane
  var closeDiv = dojo.create('div', {
    id: "closeBtn",
    innerHTML: esri.substitute({
      close_title: i18n.panel.close.title,
      close_alt: i18n.panel.close.label
    }, '<a alt=${close_alt} title=${close_title} href="JavaScript:toggleInterop();"><img  src="images/close.png"/></a>')
  }, titlePane);*/

  //create interop programatically
  //var objInterop = new dataInterop('interop');
  /*var objInterop = new dataInteropDijit({
  	id: interopTool'
  }, 'interopDiv');*/
    //var floater = 'floaterIO';
    //var innerDiv = 'interopDiv';
    var objInterop = new dataInteropDijit({ 
    	floaterDiv: 'floaterIO', 
    	innerDiv: 'interopDiv'
    	//map: map
    	});
  objInterop.startup();

  var tglbtnInterop = new dijit.form.ToggleButton({
    //label: "Data",
    title: "Data",
    iconClass: "esriDataIcon",
    id: "tglbtnInterop"
  });

  dojo.connect(tglbtnInterop, "onClick", function () {
    toggleInterop();
   
  });

  dojo.byId('webmap-toolbar-center').appendChild(tglbtnInterop.domNode);
}

//Show/hide the interop widget when the data button is clicked.
function toggleInterop() {
  if (dojo.byId('floaterIO').style.visibility === 'hidden') {
    dijit.byId('floaterIO').show();
  } else {
    dijit.byId('floaterIO').hide();
    dijit.byId('tglbtnInterop').set('checked', false); //uncheck the measure toggle button
  }

}


//MEASUREMENT/DRAW
//create a floating pane to hold the measure widget and add a button to the toolbar
//that allows users to hide/show the measurement widget.
function addMeasurementWidget() {
  var fp = new dojox.layout.FloatingPane({
    title: i18n.tools.measure.title,
    resizable: false,
    dockable: false,
    closable: false,
    style: "position:absolute;top:0;left:50px;width:245px;height:175px;z-index:100;visibility:hidden;",
    id: 'floater'
  }, dojo.byId('floater'));
  fp.startup();

  var titlePane = dojo.query('#floater .dojoxFloatingPaneTitle')[0];
  //add close button to title pane
  var closeDiv = dojo.create('div', {
    id: "closeBtn",
    innerHTML: esri.substitute({
      close_title: i18n.panel.close.title,
      close_alt: i18n.panel.close.label
    }, '<a alt=${close_alt} title=${close_title} href="JavaScript:toggleMeasure();"><img  src="images/close.png"/></a>')
  }, titlePane);

  measure = new esri.dijit.Measurement({
    map: map,
    id: 'measureTool'
  }, 'measureDiv');

  measure.startup();


  var toggleButton = new dijit.form.ToggleButton({
    //label: i18n.tools.measure.label,
    title: i18n.tools.measure.title,
    id: "toggleButton",
    iconClass: "esriMeasureIcon"
  });

  dojo.connect(toggleButton, "onClick", function () {
    toggleMeasure();
  });

  dojo.byId('webmap-toolbar-center').appendChild(toggleButton.domNode);
}

//Show/hide the measure widget when the measure button is clicked.
function toggleMeasure() {
  if (dojo.byId('floater').style.visibility === 'hidden') {
    dijit.byId('floater').show();
    disablePopups(); //disable map popups otherwise they interfere with measure clicks
  } else {
    dijit.byId('floater').hide();
    enablePopups(); //enable map popup windows
    dijit.byId('toggleButton').set('checked', false); //uncheck the measure toggle button
    //deactivate the tool and clear the results
    var measure = dijit.byId('measureTool');
    measure.clearResult();
    if (measure.activeTool) {
      measure.setTool(measure.activeTool, false);
    }
  }

}


//OVERVIEW MAP
function addOverview(isVisible) {
  //attachTo:bottom-right,bottom-left,top-right,top-left
  //opacity: opacity of the extent rectangle - values between 0 and 1. 
  //color: fill color of the extnet rectangle
  //maximizeButton: When true the maximize button is displayed
  //expand factor: The ratio between the size of the ov map and the extent rectangle.
  //visible: specify the initial visibility of the ovmap.
  var overviewMapDijit = new esri.dijit.OverviewMap({
    map: map,
    attachTo: "top-right",
    opacity: 0.5,
    color: "#000000",
    expandfactor: 2,
    maximizeButton: false,
    visible: isVisible,
    id: 'overviewMap'
  });
  overviewMapDijit.startup();
}

function destroyOverview() {
  var ov = dijit.byId('overviewMap');
  if (ov) {
    var vis = ov.visible;
    ov.destroy();
    addOverview(vis);
  }
}


//LEGEND
//Add the legend to the application - the legend will be 
//added to the left panel of the application. 
function addLegend(layerInfo) {

  var legendTb = new dijit.form.ToggleButton({
    showLabel: true,
    label: i18n.tools.legend.label,
    title: i18n.tools.legend.title,
    checked: true,
    iconClass: 'esriLegendIcon',
    id: 'legendButton'
  }, dojo.create('div'));

  dojo.byId('webmap-toolbar-left').appendChild(legendTb.domNode);

  dojo.connect(legendTb, 'onClick', function () {
    navigateStack('legendPanel');
  });
  var legendCp = new dijit.layout.ContentPane({
    title: i18n.tools.legend.title,
    selected: true,
	region:'center',
    id: "legendPanel"
  });

  dijit.byId('stackContainer').addChild(legendCp);
  dojo.addClass(dojo.byId('legendPanel'), 'panel_content');

  var legendDijit = new esri.dijit.Legend({
    map: map,
    layerInfos: layerInfo
  }, dojo.create('div'));

  dojo.byId('legendPanel').appendChild(legendDijit.domNode);
  legendDijit.startup();
  navigateStack('legendPanel');


}

//build a list of layers to dispaly in the legend
function buildLayersList(layers){

 //layers  arg is  response.itemInfo.itemData.operationalLayers;
  var layerInfos = [];
  dojo.forEach(layers, function (mapLayer, index) {
      var layerInfo = {};
      if (mapLayer.featureCollection && mapLayer.type !== "CSV") {
        if (mapLayer.featureCollection.showLegend === true) {
            dojo.forEach(mapLayer.featureCollection.layers, function (fcMapLayer) {
              if (fcMapLayer.showLegend !== false) {
                  layerInfo = {
                      "layer": fcMapLayer.layerObject,
                      "title": mapLayer.title,
                      "defaultSymbol": false
                  };
                  if (mapLayer.featureCollection.layers.length > 1) {
                      layerInfo.title += " - " + fcMapLayer.layerDefinition.name;
                  }
                  layerInfos.push(layerInfo);
              }
            });
          }
      } else if (mapLayer.showLegend !== false && mapLayer.layerObject) {
      var showDefaultSymbol = false;
      if (mapLayer.layerObject.version < 10.1 && (mapLayer.layerObject instanceof esri.layers.ArcGISDynamicMapServiceLayer || mapLayer.layerObject instanceof esri.layers.ArcGISTiledMapServiceLayer)) {
        showDefaultSymbol = true;
      }
      layerInfo = {
        "layer": mapLayer.layerObject,
        "title": mapLayer.title,
        "defaultSymbol": showDefaultSymbol
      };
        //does it have layers too? If so check to see if showLegend is false
        if (mapLayer.layers) {
            var hideLayers = dojo.map(dojo.filter(mapLayer.layers, function (lyr) {
                return (lyr.showLegend === false);
            }), function (lyr) {
                return lyr.id;
            });
            if (hideLayers.length) {
                layerInfo.hideLayers = hideLayers;
            }
        }
        layerInfos.push(layerInfo);
    }
  });
  return layerInfos;
  }

//EDITOR
//Determine if the webmap has any editable layers  
function hasEditableLayers(layers) {
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

//if the webmap contains editable layers add an editor button to the map
//that adds basic editing capability to the app.
function addEditor(editLayers) {

  //create the button that show/hides the editor 
  var editTb = new dijit.form.ToggleButton({
    showLabel: true,
    label: i18n.tools.editor.label,
    title: i18n.tools.editor.title,
    checked: false,
    iconClass: 'esriEditIcon',
    id: 'editButton'
  }, dojo.create('div'));

  //add the editor button to the left side of the application toolbar 
  dojo.byId('webmap-toolbar-left').appendChild(editTb.domNode);
  dojo.connect(editTb, 'onClick', function () {
    navigateStack('editPanel');
  });

  //create the content pane that holds the editor widget 
  var editCp = new dijit.layout.ContentPane({
    title: i18n.tools.editor.title,
    selected: "true",
    id: "editPanel",
	region: "center"
  });

  //add this to the existing div
  dijit.byId('stackContainer').addChild(editCp);
  navigateStack('editPanel');
  //create the editor if the legend and details panels are hidden - otherwise the editor
  //will be created when the edit button is clicked.
  if ((configOptions.displaydetails === false || configOptions.displaydetails === 'false') && (configOptions.displaylegend === false || configOptions.displaylegend === 'false')) {
    createEditor();
  }
}

//Functions to create and destroy the editor. We do this each time the edit button is clicked. 
function createEditor() {

  if (editorWidget) {
    return;
  }
  if (editLayers.length > 0) {
    //create template picker 
    var templateLayers = dojo.map(editLayers, function (layer) {
      return layer.featureLayer;
    });

    var eDiv = dojo.create("div", {
      id: "editDiv"
    });
    dojo.byId('editPanel').appendChild(eDiv);
    var editLayerInfo = editLayers;

    var templatePicker = new esri.dijit.editing.TemplatePicker({
      featureLayers: templateLayers,
      rows: 'auto',
      columns:'auto',
	  grouping:true,
	  showTooltip:false,
      style: 'height:98%;width:'+ (configOptions.leftpanewidth-4) + 'px;'
    }, 'editDiv');
    templatePicker.startup();

    var settings = {
      map: map,
      templatePicker: templatePicker,
      layerInfos: editLayerInfo,
      toolbarVisible: false
    };
    var params = {
      settings: settings
    };
    editorWidget = new esri.dijit.editing.Editor(params);
    editorWidget.startup();

    disablePopups();
  }

}

function destroyEditor() {
  if (editorWidget) {
    editorWidget.destroy();
    editorWidget = null;
    enablePopups();
  }

}


//POPUPS
//Utility methods used to enable/disable popups. For example when users are measuring locations
//on the map we want to turn popups off so they don't appear when users click to specify a measure area. 
function enablePopups() {
  if (clickListener) {
    clickHandler = dojo.connect(map, "onClick", clickListener);
  }
}

function disablePopups() {
  if (clickHandler) {
    dojo.disconnect(clickHandler);
  }
}

//SOCIAL NETWORKING
//Create menu of social network sharing options (Email, Twitter, Facebook)
function createSocialLinks() {
  //extend the menu item so the </a> links are clickable 
  dojo.provide('dijit.anchorMenuItem');

  dojo.declare('dijit.anchorMenuItem', dijit.MenuItem, {
    _onClick: function (evt) {
      this.firstChild.click(this, evt);
    }
  });
  //create a dropdown button to display the menu
  //build a menu with a list of sharing options 
  var menu = new dijit.Menu({
    id: 'socialMenu',
    style: 'display:none;'
  });

  menu.addChild(new dijit.anchorMenuItem({
    label: esri.substitute({
      email_text: i18n.tools.share.menu.email.label
    }, "<a id='mailLink' target='_blank' class='iconLink'>${email_text}</a>"),
    iconClass: "emailIcon"
  }));
  menu.addChild(new dijit.anchorMenuItem({
    label: esri.substitute({
      facebook_text: i18n.tools.share.menu.facebook.label
    }, "<a id='facebookLink' target='_blank' class='iconLink'>${facebook_text}</a>"),
    iconClass: "facebookIcon"
  }));
  menu.addChild(new dijit.anchorMenuItem({
    label: esri.substitute({
      twitter_text: i18n.tools.share.menu.twitter.label
    }, "<a id='twitterLink' target='_blank' class='iconLink'>${twitter_text}</a>"),
    iconClass: "twitterIcon"
  }));
  //create dropdown button to display menu
  var menuButton = new dijit.form.DropDownButton({
    //label: i18n.tools.share.label,
    id: 'shareButton',
    title: i18n.tools.share.title,
    dropDown: menu,
    iconClass: 'esriLinkIcon'
  });
  dojo.connect(menuButton, 'onClick', function () {
    updateLinkUrls();
  });
  dojo.byId('webmap-toolbar-center').appendChild(menuButton.domNode);

}

//SEARCH TOOL
//Tool that allows users to search for an address or place. 
//This tool uses a single line address locator.
function createSearchTool(){
    // create the geocoder
    geocoder = new esri.dijit.Geocoder({
        map: map
    }, "search");
    geocoder.startup();
}
//function createSearchTool() {
//  //add the toolbar section that holds the search tool
//  var wrapperDiv = dojo.create('div', {
//    id: 'searchWrapper'
//  }, dojo.byId('webmap-toolbar-right'));
//  dojo.addClass('searchWrapper', 'searchwrapper');
//  var searchInput = dojo.create('input', {
//    id: 'searchField',
//    type: 'text',
//    placeholder: i18n.tools.search.title,
//    onkeydown: function (e) {
//      if (e.keyCode === 13) {
//        findLocation();
//      }
//    }
//  }, wrapperDiv);
//  dojo.addClass(dojo.byId('searchField'), 'searchbox');
//
//  dojo.create('input', {
//    type: 'image',
//    id: 'blankImage',
//    src: 'images/blank.gif'
//  }, wrapperDiv);
//  dojo.connect(dojo.byId('blankImage'), 'onclick', function () {
//    findLocation();
//  });
//  dojo.addClass(dojo.byId('blankImage'), 'searchbutton');
//
//  //add placeholder for browsers that don't support (IE)
//  if (!supportsPlaceholder()) {
//    var search = dojo.byId("searchField");
//    var text_content = i18n.tools.search.title;
//
//    search.style.color = "gray";
//    search.value = text_content;
//
//    search.onfocus = function () {
//      if (this.style.color === "gray") {
//        this.value = "";
//        this.style.color = "black";
//      }
//    };
//
//    search.onblur = function () {
//      if (this.value === "") {
//        this.style.color = "gray";
//        this.value = text_content;
//      }
//    };
//  }
//}
//determine if the browser supports HTML5 input placeholder
function supportsPlaceholder() {
  var i = document.createElement('input');
  return 'placeholder' in i;
}

//TIME SLIDER
//Add the time slider if the webmap has time-aware layers 
function addTimeSlider(timeProperties) {
  esri.show(dojo.byId('timeFloater'));
  //add time button and create floating panel
  var fp = new dojox.layout.FloatingPane({
    title: i18n.tools.time.title,
    resizable: false,
    dockable: false,
    closable: false,
    style: "position:absolute;bottom:10px;left:10px;width:80%;height:150px;z-index:100;visibility:hidden;",
    id: 'timeFloater'
  }, dojo.byId('timeFloater'));
  fp.startup();



  //add close button to title pane
  var titlePane = dojo.query('#timeFloater .dojoxFloatingPaneTitle')[0];
  var closeDiv = dojo.create('div', {
    id: "closeBtn",
    innerHTML: esri.substitute({
      close_title: i18n.panel.close.title,
      close_alt: i18n.panel.close.label
    }, '<a alt=${close_alt} title=${close_title} href="JavaScript:toggleTime(null);"><img  src="images/close.png"/></a>')
  }, titlePane);


  //add a button to the toolbar to toggle the time display 
  var toggleButton = new dijit.form.ToggleButton({
    label: i18n.tools.time.label,
    title: i18n.tools.time.title,
    id: "toggleTimeButton",
    iconClass: "esriTimeIcon"
  });

  dojo.connect(toggleButton, "onClick", function () {
    toggleTime(timeProperties);
  });

  dojo.byId('webmap-toolbar-center').appendChild(toggleButton.domNode);


}

function formatDate(date, datePattern) {
  return dojo.date.locale.format(date, {
    selector: 'date',
    datePattern: datePattern
  });
}

function hasTemporalLayer(layers) {
  var timeLayers = [];
  for (var i = 0; i < layers.length; i++) {
    var layer = layers[i];
    if (layer.layerObject) {
      if (layer.layerObject.timeInfo && layer.layerObject.visible) {
        timeLayers.push(layer.layerObject);
      }
    }
  }
  return timeLayers;
}

function getFullTimeExtent(timeLayers) {
  var fullTimeExtent = null;
  dojo.forEach(timeLayers, function (layer) {
    var timeExtent = layer.timeInfo.timeExtent;
    if (!fullTimeExtent) {
      fullTimeExtent = new esri.TimeExtent(new Date(timeExtent.startTime.getTime()), new Date(timeExtent.endTime.getTime()));
    } else {
      if (fullTimeExtent.startTime > timeExtent.startTime) {
        fullTimeExtent.startTime = new Date(timeExtent.startTime.getTime());
      }
      if (fullTimeExtent.endTime < timeExtent.endTime) {
        fullTimeExtent.endTime = new Date(timeExtent.endTime.getTime());
      }
    }
  });
  // round off seconds
  fullTimeExtent.startTime = new Date(fullTimeExtent.startTime.getFullYear(), fullTimeExtent.startTime.getMonth(), fullTimeExtent.startTime.getDate(), fullTimeExtent.startTime.getHours(), fullTimeExtent.startTime.getMinutes(), 0, 0);
  fullTimeExtent.endTime = new Date(fullTimeExtent.endTime.getFullYear(), fullTimeExtent.endTime.getMonth(), fullTimeExtent.endTime.getDate(), fullTimeExtent.endTime.getHours(), fullTimeExtent.endTime.getMinutes() + 1, 1, 0);
  return fullTimeExtent;
}

function findDefaultTimeInterval(fullTimeExtent) {
  var interval;
  var units;
  var timePerStop = (fullTimeExtent.endTime.getTime() - fullTimeExtent.startTime.getTime()) / 10;
  var century = 1000 * 60 * 60 * 24 * 30 * 12 * 100;
  if (timePerStop > century) {
    interval = Math.round(timePerStop / century);
    units = "esriTimeUnitsCenturies";
  } else {
    var decade = 1000 * 60 * 60 * 24 * 30 * 12 * 10;
    if (timePerStop > decade) {
      interval = Math.round(timePerStop / decade);
      units = "esriTimeUnitsDecades";
    } else {
      var year = 1000 * 60 * 60 * 24 * 30 * 12;
      if (timePerStop > year) {
        interval = Math.round(timePerStop / year);
        units = "esriTimeUnitsYears";
      } else {
        var month = 1000 * 60 * 60 * 24 * 30;
        if (timePerStop > month) {
          interval = Math.round(timePerStop / month);
          units = "esriTimeUnitsMonths";
        } else {
          var week = 1000 * 60 * 60 * 24 * 7;
          if (timePerStop > week) {
            interval = Math.round(timePerStop / week);
            units = "esriTimeUnitsWeeks";
          } else {
            var day = 1000 * 60 * 60 * 24;
            if (timePerStop > day) {
              interval = Math.round(timePerStop / day);
              units = "esriTimeUnitsDays";
            } else {
              var hour = 1000 * 60 * 60;
              if (timePerStop > hour) {
                interval = Math.round(timePerStop / hour);
                units = "esriTimeUnitsHours";
              } else {
                var minute = 1000 * 60;
                if (timePerStop > minute) {
                  interval = Math.round(timePerStop / minute);
                  units = "esriTimeUnitsMinutes";
                } else {
                  var second = 1000;
                  if (timePerStop > second) {
                    interval = Math.round(timePerStop / second);
                    units = "esriTimeUnitsSeconds";
                  } else {
                    interval = Math.round(timePerStop);
                    units = "esriTimeUnitsMilliseconds";
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  var timeStopInterval = {};
  timeStopInterval.units = units;
  timeStopInterval.interval = interval;
  return timeStopInterval;


}
function toggleTime(timeProperties) {
  if (dojo.byId('timeFloater').style.visibility === 'hidden') {
    //create and display the time slider 
    createTimeSlider(timeProperties);
    dijit.byId('timeFloater').show();
    dijit.byId('mainWindow').resize();
    resizeMap();
  } else {
    //stop the time slider if its playing then destroy and hide the time slider 
    if (dijit.byId('timeSlider').playing) {
      dijit.byId('timeSlider').pause();
    }
    dijit.byId('timeSlider').destroy();
    map.setTimeExtent(null);
    map.setTimeSlider(null);

    dijit.byId('timeFloater').hide();
    dijit.byId('toggleTimeButton').set('checked', false);
  }
}

function createTimeSlider(timeProperties) {
  var startTime = timeProperties.startTime;
  var endTime = timeProperties.endTime;
  var fullTimeExtent = new esri.TimeExtent(new Date(startTime), new Date(endTime));

  map.setTimeExtent(fullTimeExtent);
  var timeView = dojo.create('div', {
    id: 'timeViewContent'
  });
  dijit.byId('timeFloater').set('content', timeView);

  //create a time slider and a label to hold date details and add to the floating time panel
  var timeSlider = new esri.dijit.TimeSlider({
    style: "width: 100%;",
    id: "timeSlider"
  }, dojo.create('div'));

  var timeSliderLabel = dojo.create('div', {
    id: 'timeSliderLabel'
  }, dojo.byId('timeViewContent'));

  dojo.addClass('timeSliderLabel', 'timeLabel');

  dojo.place(timeSlider.domNode, dojo.byId('timeViewContent'), "last");


  map.setTimeSlider(timeSlider);
  //Set time slider properties 
  timeSlider.setThumbCount(timeProperties.thumbCount);
  timeSlider.setThumbMovingRate(timeProperties.thumbMovingRate);
  //define the number of stops
  if (timeProperties.numberOfStops) {
    timeSlider.createTimeStopsByCount(fullTimeExtent, timeProperties.numberOfStops);
  } else {
    timeSlider.createTimeStopsByTimeInterval(fullTimeExtent, timeProperties.timeStopInterval.interval, timeProperties.timeStopInterval.units);
  }
  //set the thumb index values if the count = 2
  if (timeSlider.thumbCount === 2) {
    timeSlider.setThumbIndexes([0, 1]);
  }

  dojo.connect(timeSlider, 'onTimeExtentChange', function (timeExtent) {
    //update the time details span.
    var timeString, datePattern;
    if (timeProperties.timeStopInterval !== undefined) {
      switch (timeProperties.timeStopInterval.units) {
      case 'esriTimeUnitsCenturies':
        datePattern = 'yyyy G';
        break;
      case 'esriTimeUnitsDecades':
        datePattern = 'yyyy';
        break;
      case 'esriTimeUnitsYears':
        datePattern = 'MMMM yyyy';
        break;
      case 'esriTimeUnitsWeeks':
        datePattern = 'MMMM d, yyyy';
        break;
      case 'esriTimeUnitsDays':
        datePattern = 'MMMM d, yyyy';
        break;
      case 'esriTimeUnitsHours':
        datePattern = 'h:m:s.SSS a';
        break;
      case 'esriTimeUnitsMilliseconds':
        datePattern = 'h:m:s.SSS a';
        break;
      case 'esriTimeUnitsMinutes':
        datePattern = 'h:m:s.SSS a';
        break;
      case 'esriTimeUnitsMonths':
        datePattern = 'MMMM d, y';
        break;
      case 'esriTimeUnitsSeconds':
        datePattern = 'h:m:s.SSS a';
        break;
      }
      var startTime = formatDate(timeExtent.startTime, datePattern);
      var endTime = formatDate(timeExtent.endTime, datePattern);
      timeString = esri.substitute({
        "start_time": startTime,
        "end_time": endTime
      }, i18n.tools.time.timeRange);
    } else {
      timeString = esri.substitute({
        "time": formatDate(timeExtent.endTime, datePattern)
      }, i18n.tools.time.timeRangeSingle);

    }
    dojo.byId('timeSliderLabel').innerHTML = timeString;
  });
  timeSlider.startup();

}


//ELEVATION PROFILE TOOL
function createElevationProfileTools() {

  // DO WE HAVE THE MEASURE TOOL ENABLED //
  if (!measure) {
    console.error("This template requires the measure tool to be enabled.");
    return;
  }



   dijit.byId('bottomPane').set('content','<div id="profileChartPane" dojotype="apl.ElevationsChart.Pane"></div>');

  // GET DEFAULT DISTANCE UNITS BASED ON SCALEBAR UNITS     //
  // IF SCALEBAR IS NOT DISPLAYED THEN USE MILES AS DEFAULT //
  var defaultDistanceUnits = measure.units.esriMiles;
  if (configOptions.displayscalebar === "true" || configOptions.displayscalebar === true) {
    if (i18n.viewer.main.scaleBarUnits === 'metric') {
      defaultDistanceUnits = measure.units.esriKilometers;
    }
  }


  // INITIALIZE ELEVATIONS PROFILE CHART WIDGET               //
  //                                                          //
  // @param {esri.Map} map                                    //
  // @param {esri.dijit.Measurement} measure                  //
  // @param {String} defaultDistanceUnits ( Miles || Meters ) //
  // @param {Boolean} showElevationDifference                 //
  dijit.byId('profileChartPane').init({
    map: map,
    measure: measure,
    defaultDistanceUnits: defaultDistanceUnits,
    showElevationDifference: configOptions.showelevationdifference
  });
}

//EXPAND TO FULL PAGE
//SJS
function changeMapSize() {

    var visible = dojo.byId('header').getAttribute('display');
    var btn = document.getElementsByName('btnShowHide');
    if (visible != 'none') {
        esri.hide(dojo.byId('header'));
        esri.hide(dojo.byId('bottomPane'));
//        esri.show(dojo.byId('ToolbarLogo'));
        dojo.style(dojo.byId('ToolbarLogo'), 'display', 'inline-block')
//        dojo.style('header', 'display', 'none');
//        dojo.style('bottomPane', 'display', 'none');
//        dojo.style(dojo.byId("header"), "height", "0px");
//        dojo.style(dojo.byId("bottomPane"), "height", "0px");
        dijit.byId('bc').resize();
        resizeMap();
        dojo.byId('header').setAttribute('display', 'none');
        //       btn.src = 'images/reset.png;';
    } else {
        esri.show(dojo.byId('header'));
        esri.show(dojo.byId('bottomPane'));
        esri.hide(dojo.byId('ToolbarLogo'));
//        dojo.style('header', 'display', 'block');
//        dojo.style('bottomPane', 'display', 'block');
//        dojo.style(dojo.byId("header"), "height", "80px");
//        dojo.style(dojo.byId("bottomPane"), "height", "80px");
        dijit.byId('bc').resize();
        resizeMap();
        //       btn.src = 'images/expand.png';
        dojo.byId('header').setAttribute('display', 'block');
        resizeMap()
    }
}