// The class to handle configuring the webmap.
// Checks for the presence of a
define(["dojo/_base/declare"],
    function(declare){
        return declare([],
            {
                _AppConfig: null

                , constructor: function(args) {
                    declare.safeMixin(this,args);
                }

                , configure: function () {
                    //Configure the map in the application based on specified web map and shared or local customizations
                }

            }
        )
    }
);