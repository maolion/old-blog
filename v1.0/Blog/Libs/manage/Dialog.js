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

Define( "Dialog", Depend( "~/Cox/UI/Dom", "~/Cox/UI/Animation" ), function( require, Dialog, module ){
    var 
        EMPTY_FUNCTION  = function(){},
        SLICE           = Array.prototype.slice,
        MIN_WIDTH       = 200,
        MIN_HEIGHT      = 50,
        Dom             = require( "Dom" ),
        Anima           = require( "Animation" ),
        dialog          = Dom( "#dialog" ),
        dialogMask      = Dom( "#dialog .dialog-mask" ),
        //dialogWindow    = Dom( "#dialog .dialog-window" ),
        //dialogTitle     = Dom( "#dialog .dialog-window>header .title" ),
        //dialogBottomBar = Dom( "#Dialog .dialog-window>footer" ),
        //dialogPlain     = Dom( "#dialog .dialog-window>div.panel" ),
        //dialogBuffer    = {},
        dialogEvents    = new Cox.EventSource,
        UID             = function(){
            var uid = new Date().getTime();
            return function( prefix ){
                return prefix + uid++;
            }
        }(),
        temple = [
            '<div id="{0}" class="dialog-window">',
            '   <header class="top-bar" >',
            '       <span class="title">{1}</span>',
            '       <button title="关闭" class="amd-btn remove" ></button>',
            '   </header>',
            '   <div class="panel"></div>',
            '</div>'
        ].join( "\n" )
    ;


    function getAB( window ){
        var 
            size  = null,
            size2 = null
        ;

        size = window.css( [ "width", "height" ] );
        size = {
            width  : parseFloat( size.width ),
            height : parseFloat( size.height )
        };

        size2 = {
            width  : Math.max( size.width - 50, MIN_WIDTH ),
            height : Math.max( size.height - 50, MIN_HEIGHT )
        };

        return {
            A : {
                width      : size2.width,
                height     : size2.height,
                marginLeft : 0 - ( size2.width / 2 ),
                marginTop  : 0 - ( size2.height / 2 )
            },
            B : {
                width      : size.width,
                height     : size.height,
                marginLeft : 0 - ( size.width / 2 ),
                marginTop  : 0 - ( size.height / 2 )
            }
        }
    };

    Dialog = Class( "Dialog", Abstract, Extends( Cox.EventSource ), function( Static, Public ){
        var 
            lock       = false,
            zindex     = 1,
            showStack = []
        ;

        showStack.remove = XFunction( String, function( id ){
            var index = XList.indexOf( showStack, id );
            if( index === -1 )return;
            showStack.splice( index, 1 );
        } );

        Public.constructor = XFunction( Optional( String ), function( title ){
            var 
                _this = this,
                id    = null
            ;
            this.Super( "constructor" );
            this.dispatchEvent(
                new Cox.Event( "show" ),
                new Cox.Event( "hide" ),
                new Cox.Event( "close" )
            );
            this._uid     = UID( "dialog" );
            id = "#" + this._uid;
            dialog.append( XString.format( temple, this._uid, title ) );
            
            this._dialog = {
                window   : Dom( id ),
                title    : Dom( id + ">header>span.title" ),
                panel    : Dom( id + ">div.panel" ),
                closeBtn : Dom( id + ">header>button.remove" )
            };

            this._dialog.closeBtn.on( "click", function(){
                _this.fireEvent( "close", [ _this ] );
                _this.hide();
            } );
            //this._lock = false;
            this.panel( this._dialog.panel );
        } );

        Public.hideCloseBtn = function(){
            this._dialog.closeBtn.css( "display", "none" );
        };

        Public.lock = function(){
            lock = true;
        };

        Public.unlock = function(){
            lock = false;
        };

        Public.showCloseBtn = function(){
            this._dialog.closeBtn.css( "display", "block" );
        };

        Public.destory = function(){
            this._dialog.window.remove();
            this._dialog = null;
        };

        Public.getUID = function(){
            return this._uid;
        };

        Public.getPlain = function(){
            return this._dialog.panel;
        };

        Public.find = XFunction( String, function( selector ){
            return Dom( Dom.query( selector, this._dialog.panel.get(0) ) );
        } );

        Public.setTitle = XFunction( String, function( title ){
            this._dialog.title.html( title );
        } );
        Public.show = XFunction( Optional( Function ), function( callback ){
            var 
                _this = this,
                ab    = null
            ;
            if( lock ){
                return;
            }
            
            showStack.push( this._uid );

            Dom.animaCenter.exit();
            dialog.css( "display", "block" );
            this._dialog.window.css( {
                opacity : 0,
                "zIndex": zindex++,
                width   : "auto",
                height  : "auto",
                display : "block"
            } );
            this._dialog.panel.css( "opacity", 0 );

            ab = getAB( this._dialog.window );

            this._dialog.window.css( {
                width      : ab.A.width + "px",
                height     : ab.A.height + "px",
                marginLeft : ab.A.marginLeft + "px",
                marginTop  : ab.A.marginTop + "px"
            } );

            ab.B.opacity = 1;
            dialogMask.show( 200, function(){
                _this._dialog.window.anima( ab.B, function(){
                    _this._dialog.panel.css( "opacity", 1 );
                    _this.fireEvent( "show", [ _this ] );
                    callback && callback.call( _this );
                }, Anima.Transition.Back.easeInOut ); 
            } );
        } );

        Public.hide = XFunction( Optional( Function ), function( callback ){
            var 
                _this = this,
                ab    = null
            ;
            if( lock ){
                return false;
            }
            Dom.animaCenter.exit();
            ab = getAB( this._dialog.window );
            ab.A.opacity = 0;
            showStack.remove( this._uid );
            if( XList.indexOf( showStack, this._uid ) !== -1 ){
                return;
            }
            this._dialog.panel.css( "opacity", 0 );
            this._dialog.window.anima( ab.A, function(){
                if( showStack.length < 1 ){
                    dialogMask.hide( 200, function(){
                        dialog.css( "display", "none" );
                        _this._dialog.window.css( "display", "none" );
                        _this.fireEvent( "hide", [ _this ] );
                        callback && callback.call( _this );
                    } );
                }else{
                    _this.fireEvent( "hide", [ _this ] );
                    callback && callback.call( _this );
                }

            }, Anima.Transition.Back.easeInOut );
        } );

        Public.panel = Function;
    } );
    
    module.exports = Dialog;
} );