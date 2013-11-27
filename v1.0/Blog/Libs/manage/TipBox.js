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


Define( "TipBox", Depend( "~/Cox/UI/Dom" ), function( require, TipBox ){
    var 
        CLEAR_TIME = 5000,
        Dom        = require( "Dom" ),
        tip        = Dom( "#tip" )
    ;
    function showTip( type, message ){
        var 
            tipbox = null,
            height = null
        ;
        tip.css( "display", "block" );
        tip.prepend( '<span class="tip-box ' + type + '">' + message + "</span>" );
        tipbox = Dom( "#tip .tip-box:first-child" );
        tipbox.css( "display", "block" );
        height = parseFloat( tipbox.css( "height" ) );
        tipbox.css( "height", 0 );
        tipbox.anima( {
            opacity : 1,
            height  : height
        }, function(){
            setTimeout( function(){
                tipbox.hide();
            }, CLEAR_TIME );
        } );
    }

    TipBox.error = XFunction( String, function( message ){
        showTip( "error", message || "Error" );
    } );

    TipBox.info = XFunction( String, function( message ){
        message && showTip( "info", message );
    } );

    TipBox.warning = XFunction( String, function( message ){
        showTip( "warning", message || "Warning" );
    } );

} );