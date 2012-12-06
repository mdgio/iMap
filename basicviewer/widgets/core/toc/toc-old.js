// widgets.core.toc
define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/parser"/*, "dijit/layout/AccordionContainer"*/, "dijit/layout/ContentPane",
	"dojo/text!./templates/toc.html", "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang"],
    function(declare, WidgetBase, TemplatedMixin, parser/*, accordion*/, contentPane, template, domsty, fxer, language){
        return declare([WidgetBase, TemplatedMixin], {
            // Some default values for our author
			// These typically map to whatever you're handing into the constructor
			// Using dojo.moduleUrl, we can get a path to our AuthorWidget"s space
			// and we want to have a default avatar, just in case

			// Our template - important!
			templateString: template,

			// A class to be applied to the root node in our template
			baseClass: "toc",


            postCreate: function(){
                this.inherited(arguments);
                //$(this.containerNode).accordion();
                $(this.domNode.childNodes[1]).accordion()
            }
        });
});