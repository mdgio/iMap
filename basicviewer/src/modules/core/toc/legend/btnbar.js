/** A pattern to use for custom tools. Implements a floating pane with custom content (or an esri dijit) inside.
 *  dojo/text! and xstyle/css! are used to dynamically load an HTML fragment and CSS sheet for this module. Update to your file names.
 *  utilities/maphandler is a singleton object containing a reference to the map object and other properties/fxns- such as enabling/disabling popups.
 *  A good help sample: http://dojotoolkit.org/documentation/tutorials/1.8/recipes/custom_widget/
 *  If using an esri dijit, they should all be AMD-compatible. Help: http://help.arcgis.com/en/webapi/javascript/arcgis/jshelp/#inside_dojo_amd
 *
 *  Note: It seems when working with map layer events (e.g. "onClick"),
 *  in order to work with modules, dojo/aspect after() or before() functions should be used.
 */
define(["dojo/_base/declare", "dojo/aspect", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/on", "dijit/registry", "dojo/ready"
    , "dojo/_base/lang"
    , "dojo/dom"],
    function(declare, aspect, domConstruct, WidgetBase, TemplatedMixin, on, registry, ready, lang
        , dom){
        return declare([WidgetBase, TemplatedMixin],{
            //*** Properties needed for this style of module
            // The template HTML fragment (as a string, created in dojo/text definition above)
            templateString: '<ul id="navlist"><li id="home"><a href="default.asp"></a></li><li id="prev"><a href="css_intro.asp"></a></li><li id="next"><a href="css_syntax.asp"></a></li></ul>'
            // The CSS class to be applied to the root node in our template
            //, baseClass: "tocBtnBar"
            , baseClass: "navlist"

            /*constructor: function(args) {
                declare.safeMixin(this,args);
            }*/
        });
    });