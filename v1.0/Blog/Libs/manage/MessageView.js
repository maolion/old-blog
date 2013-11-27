/**
 * ${project} < ${FILE} >
 *
 * @DATE    ${DATE}
 * @VERSION ${version}
 * @AUTHOR  ${author}
 * 
 * ----------------------------------------------------------------------------
 *
 * ----------------------------------------------------------------------------
 */


Define( "MessageView", Depend( "~/Cox/UI/Dom", "~/Cox/Utils", "./Dialog", "./MAjax" ), function( require, MessageView, module ){
    var 
        Dom    = require( "Dom" ),
        Dialog = require( "Dialog" ),
        MAjax  = require( "MAjax" ),
        Utils  = require( "Utils" )
    ;
    MessageView = module.exports = Class( "MessageView", Single, Extends( Dialog ), function( Staitc, Public ){
        Public.constructor = function(){
            this.Super( "constructor", "信息查看器" );

            this.container = Dom( "#message-view" );
            this.form      = this.container.find( ".form" );
            this.adate     = this.container.find( ".adate" );
            this.website   = this.container.find( ".website" );
            this.content   = this.container.find( ".content" );
            this.on( "hide", function(){
                this.form.html( "undefined" );
                this.adate.html( "undefined" );
                this.website.attr( "href", "#" );
                this.website.html( "undefined" );
                this.content.value( "" );
            } );
        };  

        Public.panel = function( panel ){
            panel.html( [
            '<div id="message-view">',
            '   <span class="form" >undefined</span>',
            '   <span class="adate">undefined</span>',
            '   <span ><a target="_black" class="website" href="###">undefined</a></span>',
            '   <textarea readonly="readonly" class="content" ></textarea>',
            '</div>'
            ].join("\n") );
        };

        Public.show = XFunction( Object, function( message ){
            this.form.html( message.name + "(" + message.email + ")" );
            this.adate.html( Utils.dateFormat( new Date( message.adate ), "%Y/%M/%D %H:%I:%S" ) );
            this.website.attr( "href", message.website || "###" );
            this.website.attr( "title", message.website );
            this.website.html( message.website );
            this.content.value( message.content );
            this.Super( "show" );
        } );

    } ).getInstance();
} );