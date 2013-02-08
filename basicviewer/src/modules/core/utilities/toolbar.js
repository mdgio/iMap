/**
 * Created with JetBrains WebStorm.
 * User: James.Somerville
 * Date: 2/7/13
 * Time: 6:20 PM
 * To change this template use File | Settings | File Templates.
 */
// The parent container for the Table of Contents and Add Data accordion
define(["dojo/_base/declare"],
    function(declare){
        //The module needs to be explicitly declared when it will be declared in markup.  Otherwise, do not put one in.
        return declare([], {


            //The event handlers below are not needed, unless for custom code.  They are here for reference.
            constructor: function() {
                this.inherited(arguments);
            },

            postMixInProperties: function() {
                this.inherited(arguments);
            },

            buildRendering: function () {
                this.inherited(arguments);
            },

            postCreate: function () {
                this.inherited(arguments);
            },

            startup: function () {
                this.inherited(arguments);
            }
        });
    });