/**
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/dom-class", "dojo/Evented"],
    function(declare, WidgetBase, TemplatedMixin, domClass){
        return declare([WidgetBase, TemplatedMixin],{
            //*** Properties needed for this style of module
            // The template HTML fragment (as a string, created in dojo/text definition above)
            templateString: '<ul id="navlist"><li id="liLyrUp" class="liLyrUpDis" data-dojo-attach-point="liLyrUpAP"><a href="#" data-dojo-attach-event="onclick:_clickUp"></a></li><li id="liLyrDwn" class="liLyrDwnDis" data-dojo-attach-point="liLyrDwnAP"><a href="#" data-dojo-attach-event="onclick:_clickDown"></a></li><li id="liLyrRem" class="liLyrRemDis" data-dojo-attach-point="liLyrRemAP"><a href="#" data-dojo-attach-event="onclick:_clickRemove"></a></li></ul>'
            // The CSS class to be applied to the root node in our template
            //, baseClass: "tocBtnBar"
            , baseClass: "navlist"
            , BtnsEnabled: false
            //*** Emitted event to let toc know a button was clicked
            , eventName: 'lyrbtnclick'

            , _clickUp: function(evt) {
                if (this.btnsEnabled) {
                    this._setState(true);
                    this.emit(this.eventName, { btn: 'u' });
                }
                //Set the anchor tag's return value to false, so the page does not reload
                evt["returnValue"] = false;
            }

            , _clickDown: function(evt) {
                if (this.btnsEnabled) {
                    this._setState(true);
                    this.emit(this.eventName, { btn: 'd' });
                }
                evt["returnValue"] = false;
            }

            , _clickRemove: function(evt) {
                if (this.btnsEnabled) {
                    this._setState(true);
                    this.emit(this.eventName, { btn: 'r' });
                }
                evt["returnValue"] = false;
            }

            , EnableButtons: function () {
                this._setState(false);
            }

            , DisableButtons: function () {
                this._setState(true);
            }

            , _setState: function (toDisabled) {
                if (toDisabled) {
                    domClass.replace(this.liLyrUpAP, "liLyrUpDis", "liLyrUp");
                    domClass.replace(this.liLyrDwnAP, "liLyrDwnDis", "liLyrDwn");
                    domClass.replace(this.liLyrRemAP, "liLyrRemDis", "liLyrRem");
                    this.btnsEnabled = false;
                } else {
                    if (!this.btnsEnabled) {
                        domClass.replace(this.liLyrUpAP, "liLyrUp", "liLyrUpDis");
                        domClass.replace(this.liLyrDwnAP, "liLyrDwn", "liLyrDwnDis");
                        domClass.replace(this.liLyrRemAP, "liLyrRem", "liLyrRemDis");
                        this.btnsEnabled = true;
                    }
                }
            }
        });
    });