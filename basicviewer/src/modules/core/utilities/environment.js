// A singleton utility to identify and store information about the browser environment
define(["dojo/_base/declare", "dojo/has", "dojo/window"],
    function(declare, has, win){
        //Specify an empty array, even if not inheriting anything, otherwise operates differently.
        var BrowserEnv = declare("BrowserEnv", [], {
            TouchEnabled: has("touch")
            , WindowWidth: has('device-width')
            //This is a hack for ie 8 and 7, not sure what property is available on startup
            , WindowHeight: (has('ie') < 9) ? 1000 : win.getBox().h
            , IframeEmbedded: !(top === self)
            , LocalStorage: (localStorage != null)
            , CreateLinksInString: function (stringToCheck) {
                //Get an array of URLs in the string http://codegolf.stackexchange.com/questions/464/shortest-url-regex-match-in-javascript/480#480
                var urls = stringToCheck.match(/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi);
                var links = new Array();
                if (urls) { //Replace raw URLS with anchor tags
                    for (var i = 0; i < urls.length; i++) {
                        links[i] = '<a href="' + urls[i] + '" target="_blank">link</a>';
                        stringToCheck = stringToCheck.replace(urls[i], links[i]);
                    }
                }
                return stringToCheck;
            }
        });
        if (!_instance) {
            var _instance = new BrowserEnv();
        }
        return _instance;
    }
);