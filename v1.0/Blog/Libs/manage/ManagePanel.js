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


Define( "ManagePanel", Depend( "~/Cox/UI/Dom" ), function( require, ManagePanel, module ){
    var
        Dom  = require( "Dom" )
    ;

    ManagePanel = module.exports = Class( "ManagePanel", Abstract, Extends( Cox.EventSource ), function( Static, Public ){
        var 
            panels = [],
            action = null
        ;

        Static.getPanels = function(){
            return panels.slice();
        };

        Public.constructor = XFunction( Object, function( warp ){
            this.Super( "constructor" );
            this.dispatchEvent( 
                new Cox.Event( "init" ),
                new Cox.Event( "show" ),
                new Cox.Event( "hide" ),
                new Cox.Event( "refresh" )
            );

            panels.push( this );
            this._warp = warp;
        } );

        Public.show = XFunction( Optional( Function ), function( callback ){
            var _this = this;
            //action && action !== _this && action.hide();
            XList.forEach( panels, function( panel ){
                panel !== _this && panel.hide();
            } );
            action = _this;
            this._warp.show( 400 );
            this.fireEvent( "show" );
            callback && callback( this );
        } );

        Public.hide = XFunction( Optional( Function ), function( callback ){
            this._warp.hide();
            this.fireEvent( "hide" );
            callback && callback( this );
        } );

    } );
    
    //Home = require( "Home" );
} );