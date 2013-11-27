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


Define( "MessageBox", Depend( "~/Cox/UI/Dom", "./Dialog" ), function( require, MessageBox ){
    var 
        Dom     = require( "Dom" ),
        Dialog  = require( "Dialog" ),
        MDialog = null

    ; 

    MDialog = Class( "MessageDialog", Single, Extends( Dialog ), function( Static, Public ){
        Public.constructor = function(){
            var 
                _this     = this,
                container = null,
                inputbox  = null,
                prev      = null
            ;
            this.Super( "constructor", "消息提示" );
            this.dispatchEvent(
                new Cox.Event( "ok" ),
                new Cox.Event( "cancel" )
            );
            this.container = this.find( "#message-container" ).get(0);
            this.inputbox  = this.find( "input[type=text]" ).get(0);
            this.tip       = this.find( "span.tip" ).get(0);
            this.on( "close", function(){
                this.fireEvent( "cancel", [ false ] );
            } );

            this.find( "button.cancel" ).on( "click", function(){
                _this.fireEvent( "cancel", [ false ] );
                _this.hide( );
            } );

            this.find( "button.ok" ).on( "click", function(){
                _this.fireEvent( 
                    "ok", 
                    Dom.containersClass( _this.container, "prompt" ) ? 
                    [ _this.inputbox.value ] : [ true ]
                );
                _this.hide( );
            } );
        };

        Public.show = XFunction( String, String, Optional( String ), function( mode, message, initValue ){
            var _this = this;

            Dom.removeClass( this.container, "alert" );
            Dom.removeClass( this.container, "confirm" );
            Dom.removeClass( this.container, "prompt" );
            Dom.removeClass( this.container, "wait" );
            Dom.addClass( this.container, mode );
            this.un( "ok" )
            this.un( "cancel" );
            this.tip.innerHTML   = message;
            _this.inputbox.value = "";
            this.Super( "show", function(){
                if( mode === "prompt" ){
                    _this.inputbox.value = initValue;
                    _this.inputbox.focus();
                }
            } );
        } );

        Public.panel = function( panel ){
            panel.html( [
                '<div id="message-container" >',
                '   <span class="tip" ></span>',
                '   <input type="text" placeholder="请输入数值..." />',
                '   <div class="button-bar">',
                '       <button class="button ok">确定</button>',
                '       <button class="button cancel">取消</button>',
                '   </div>',
                '</div>'
            ].join("\n") );
        };

    } ).getInstance();

    MessageBox.OK     = "ok";
    MessageBox.CANCEL = "cancel";

    MessageBox.alert = XFunction( 
        String, Optional( Function ), function( message, callback ){
            MDialog.show( "alert", message );
            MDialog.showCloseBtn();
            callback && MDialog.once( "ok", callback );
            callback && MDialog.once( "cancel", callback );
        } 
    );

    MessageBox.confirm = XFunction( 
        String, Function, Optional( Function ), 
        function( message, okCallback, cancelCallback ){
            MDialog.show( "confirm", message );
            MDialog.showCloseBtn();
            MDialog.once( "ok", okCallback );
            MDialog.once( "cancel", cancelCallback || okCallback );
        } 
    );

    MessageBox.prompt = XFunction( 
        String, Optional( String ), Function, Optional( Function ), 
        function( message, initValue, okCallback, cancelCallback ){
            MDialog.show( "prompt", message, initValue );
            MDialog.showCloseBtn();
            MDialog.once( "ok", okCallback );
            MDialog.once( "cancel", cancelCallback || function(){
                okCallback( undefined );
            } );
        } 
    );

    MessageBox.wait = XFunction(
        String, Optional( Deferred ), function( message, deferr ){
            MDialog.show( "wait", message );
            MDialog.hideCloseBtn();
            deferr&&deferr.done( function(){
                MDialog.hide();
            } );
        }
    );

} );