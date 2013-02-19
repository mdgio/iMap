/**
 Contains the ESRI Editor dijit for feature layers.
 */
define(["dojo/_base/declare", "dojo/on", "dojo/_base/lang", "utilities/maphandler"],
    function(declare, on, lang, mapHandler){
        return declare([], {
            _editorDijit: null

            , constructor: function(args) {

            }

            // Seems you need to destroy the editor widget each time it loses focus
            , destroyEditor: function () {
                if (this._editorDijit) {
                    this._editorDijit.destroy();
                    this._editorDijit = null;
                    mapHandler.EnableMapPopups();
                }
            }
        });
    });