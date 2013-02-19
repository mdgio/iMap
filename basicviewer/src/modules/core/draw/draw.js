/**
 * Created with JetBrains WebStorm.
 * User: SSporik
 * Date: 2/16/13
 * Time: 2:47 PM
 * To change this template use File | Settings | File Templates.
 */
define(["dojo/_base/declare", "dojo/dom-construct", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/on", "dijit/registry", "dojo/ready", "dojo/parser",
    "dojo/text!./templates/draw.html", "dojo/dom-style", "dojo/_base/fx", "dojo/_base/lang"],
    function(declare, domConstruct, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, dojoOn, dojoRegistry, ready, parser, template, domsty, fxer, language){
        return declare("widgets/core/interop/interop", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin],{
            //declare([WidgetBase, TemplatedMixin], {

            // The template HTML fragment (as a string, created in dojo/text definition above)
            templateString: template,
            // The CSS class to be applied to the root node in our template
            /*baseClass: "interop",*/
            //Floater
            floaterDiv: null,
            //Floater child
            innerDiv: null,
            //URL for portal
            portalUrl: 'http://www.arcgis.com',
            // The ESRI map object to bind to the TOC
            map: null,
            // The table of contents dijit
            _floatingPane: null,
            //_dijitToc: null,
        constructor: function(args){

            declare.safeMixin(this,args);
            //create Floating Pane to house the Drawing Tools

           var fpI = new dojo.layout.FloatingPane({
               title: 'Drawing & Markup',
               resizable: false,
               dockable: false,
               closable: false,
               style: "position:absolute;top:0;left:50px;width:245px;height:265px;z-index:100;visibility:hidden;",
               id: 'floaterDraw'
           }, dojo.byId(this.floaterDivDraw));
            fpI.startup();

            //Create a title bar for Floating Pane
            var titlePane = dojo.query('#floaterDraw .dojoxFloatingPaneTitle')[0];
            //Add close button to title pane
            var closeDiv = dojo.create('div', {
                id: "closeBtn",
                innerHTML: esri.substitute({
                    close_title: i18n.panel.close.title,
                    close_alt: i18n.panel.close.label
                }, '<a alt=${close_alt} title=${close_title} href="JavaScript:toggleInterop();"><img  src="../toc/images/close.png"/></a>')
            }, titlePane);
            //Set the content of the Floating Pane to the template HTML.
            dojo.byId(this.innerDiv).innerHTML = template;
        },


        )
        }
    }