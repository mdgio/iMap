      dojo.provide("myModules.custommenu");
      dojo.require("dijit.MenuItem");
      
      dojo.declare('myModules.custommenu', dijit.MenuItem, {
          tpl: ['<tr class="dijitReset dijitMenuItem" dojoAttachPoint="focusNode" waiRole="menuitem" tabIndex="-1"',
              'dojoAttachEvent="onmouseenter:_onHover,onmouseleave:_onUnhover,ondijitclick:_onClick">',
              '<td class="dijitReset dijitMenuItemIconCell" waiRole="presentation" style="padding:1px 2px;">',
              '<img src = "" width=24 height=24 alt="" class="dijitIcon dijitMenuItemIcon mavbarIcon" dojoAttachPoint="iconNode"/></a></td>',
              '<td class="dijitReset dijitMenuItemLabel" colspan="2" dojoAttachPoint="containerNode" style="padding:1px 2px;"></td>',
              '<td class="dijitReset dijitMenuItemAccelKey" style="display: none" dojoAttachPoint="accelKeyNode"></td>',
              '<td class="dijitReset dijitMenuArrowCell" waiRole="presentation">',
              '<div dojoAttachPoint="arrowWrapper" style="visibility: hidden">',
              '<img src="${_blankGif}" alt="" class="dijitMenuExpand"/>',
              '<span class="dijitMenuExpandA11y">+</span></div></td></tr>'
          ],
          // we don't need the iconClass property so override the mapping
          // this will work for our MenuBarItem as wellÃ¢â‚¬Â¦
          attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
              label: { node: "containerNode", type: "innerHTML" },
              icon: {node: "iconNode", type: "attribute", attribute: "src"}
          }),
          postMixInProperties: function() {
              this.templateString = this.tpl.join('');
              this.inherited(arguments);
          }
      });