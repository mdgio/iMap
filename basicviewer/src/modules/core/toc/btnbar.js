/**
 */
define(["dojo/_base/declare", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/dom-class", "dojo/Evented"],
    function(declare, WidgetBase, TemplatedMixin, domClass){
        return declare([WidgetBase, TemplatedMixin],{
            //*** Properties needed for this style of module
            // The template HTML fragment (as a string, created in dojo/text definition above)
            templateString: '<ul id="navlist"><li id="liLyrUp" class="liLyrUp" data-dojo-attach-point="liLyrUpAP"><a href="#" data-dojo-attach-event="onclick:_clickUp"></a></li><li id="liLyrDwn" class="liLyrDwn" data-dojo-attach-point="liLyrDwnAP"><a href="#" data-dojo-attach-event="onclick:_clickDown"></a></li><li id="liLyrRem" class="liLyrRem" data-dojo-attach-point="liLyrRemAP"><a href="#" data-dojo-attach-event="onclick:_clickRemove"></a></li></ul>'
            // The CSS class to be applied to the root node in our template
            //, baseClass: "tocBtnBar"
            , baseClass: "navlist"
            , eventInProgress: false

            , _clickUp: function(evt) {
                if (!this.eventInProgress) {
                    this.eventInProgress = true;
                    this._setState(true);

                }
                evt["returnValue"] = false;
            }

            , _clickDown: function(evt) {
                if (!this.eventInProgress) {
                    this.eventInProgress = true;
                    this._setState(true);

                }
                evt["returnValue"] = false;
            }

            , _clickRemove: function(evt) {
                if (!this.eventInProgress) {
                    this.eventInProgress = true;
                    this._setState(true);

                }
                evt["returnValue"] = false;
            }

            , EnableButtons: function () {
                this._setState(false);
                this.eventInProgress = false;
            }

            , _setState: function (toWaiting) {
                if (toWaiting) {
                    domClass.replace(this.liLyrUpAP, "liLyrUpDis", "liLyrUp");
                    domClass.replace(this.liLyrDwnAP, "liLyrDwnDis", "liLyrDwn");
                    domClass.replace(this.liLyrRemAP, "liLyrRemDis", "liLyrRem");
                    //try { document.body.style.cursor = "wait"; } catch (e) {}
                } else {
                    domClass.replace(this.liLyrUpAP, "liLyrUp", "liLyrUpDis");
                    domClass.replace(this.liLyrDwnAP, "liLyrDwn", "liLyrDwnDis");
                    domClass.replace(this.liLyrRemAP, "liLyrRem", "liLyrRemDis");
                    //try { document.body.style.cursor = "auto"; } catch (e) {}
                }
            }
        });
    });