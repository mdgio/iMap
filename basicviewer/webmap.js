/* This is the place to define your Web Map as a JSON object, if you do not want to do it in ArcGIS Online.
 See the following links for help and examples on defining a Web Map:
 http://help.arcgis.com/en/webapi/javascript/arcgis/jshelp/#intro_webmap
 http://resources.arcgis.com/en/help/arcgis-web-map-json/

 ***
 To enable the ability for users to save or share their map, generate a GUID for the webmap and specify as an "id" property in the main JSON object
 Can use this website to generate a GUID- http://www.guidgenerator.com/online-guid-generator.aspx

 Also, set an id property for each operational layer, to enable saving and sharing.  The id does not need to be a GUID, just unique.
 ***

 Two properties are required for the web map: "item" and "itemData".  See the first link for an example

 {
     "id": "5caf4ec5-4d38-42fd-bc94-c7a1a1cf3ddb",
     "item": {
         "title":"Soil Survey Map of USA",
         "snippet": "Detailed description of data",
         "extent": [[-139.4916, 10.7191],[-52.392, 59.5199]]
     },
     "itemData": {
         "operationalLayers": [{
             "url": "http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/Soil_Survey_Map/MapServer",
             "visibility": true,
             "opacity": 0.75,
             "title": "Soil Survey Map",
             "id": "204d94c9b1374de9a21574c9efa31164"
         }],
         "baseMap": {
             "baseMapLayers": [{
                 "opacity": 1,
                 "visibility": true,
                 "url": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer"
             },{
                 "isReference": true,
                 "opacity": 1,
                 "visibility": true,
                 "url": "http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer"
             }],
             "title": "World_Terrain_Base"
         },
         "version": "1.1"
     }
 }
 */
{
    "id": "5caf4ec5-4d38-42fd-bc94-c7a1a1cf3ddb",
    "item": {
    "title":"Soil Survey Map of USA",
        "snippet": "Detailed description of data",
        "extent": [[-139.4916, 10.7191],[-52.392, 59.5199]]
},
    "itemData": {
    "operationalLayers": [{
        "url": "http://server.arcgisonline.com/ArcGIS/rest/services/Specialty/Soil_Survey_Map/MapServer",
        "visibility": true,
        "opacity": 0.75,
        "title": "Soil Survey Map",
        "id": "204d94c9b1374de9a21574c9efa31164"
    }],
        "baseMap": {
        "baseMapLayers": [{
            "opacity": 1,
            "visibility": true,
            "url": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer"
        },{
            "isReference": true,
            "opacity": 1,
            "visibility": true,
            "url": "http://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer"
        }],
            "title": "World_Terrain_Base"
    },
    "version": "1.1"
}
}