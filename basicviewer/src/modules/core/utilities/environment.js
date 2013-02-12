// A singleton utility to identify and store information about the browser environment
define(["dojo/_base/declare", "dojo/has", "dojo/window"],
    function(declare, has, win){
        //Specify an empty array, even if not inheriting anything, otherwise operates differently.
        var BrowserEnv = declare("BrowserEnv", [], {
            TouchEnabled: has("touch")
            , WindowWidth: has('device-width')
            , WindowHeight: win.getBox().h
            , IframeEmbedded: !(top === self)
            , LocalStorage: (localStorage != null)
        });
        if (!_instance) {
            var _instance = new BrowserEnv();
        }
        return _instance;
    }
);