// _TOCNode is a node, with 3 possible types: layer(service)|layer|legend
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin"
    , "dijit/Menu" ],
    function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Menu){
        //Had to create a variable name for the class here, so an internal function could reference it to create new _TOCNodes
        return declare([WidgetBase, TemplatedMixin, WidgetsInTemplateMixin, Menu], {
            templateString: ['<tr class="dijitReset dijitMenuItem" dojoAttachPoint="focusNode" waiRole="menuitem" tabIndex="-1"',
                'dojoAttachEvent="onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick">',
                '<td class="dijitReset dijitMenuItemIconCell" waiRole="presentation" style="padding:1px 2px;">',
                '<img src = "" width=24 height=24 alt="" class="dijitIcon dijitMenuItemIcon mavbarIcon" dojoAttachPoint="iconNode"/></a></td>',
                '<td class="dijitReset dijitMenuItemLabel" colspan="2" dojoAttachPoint="containerNode" style="padding:1px 2px;"></td>',
                '<td class="dijitReset dijitMenuItemAccelKey" style="display: none" dojoAttachPoint="accelKeyNode"></td>',
                '<td class="dijitReset dijitMenuArrowCell" waiRole="presentation">',
                '<div dojoAttachPoint="arrowWrapper" style="visibility: hidden">',
                '<img src="${_blankGif}" alt="" class="dijitMenuExpand"/>',
                '<span class="dijitMenuExpandA11y">+</span></div></td></tr>'
            ].join('')

            , label: null
            , icon: null

            , constructor: function(params) {
                dojo.mixin(this, params);
            }

            , postMixInProperties: function() {
                this.inherited(arguments);
            }
        });
    });
