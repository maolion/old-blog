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


Define( "SideBar", Depend( "~/Cox/UI/Dom", "~/Cox/UI/Animation" ), function( require ){
    var 
        Dom       = require( "Dom" ),
        Anima     = require( "Animation" ),
        container = Dom.query( "#container" )[0],
        btns      = Dom( "#sidebar .nav-btn" ),
        totop     = Dom( "#to-top" )
    ;

    totop.on( "click", function( event ){
        Dom.stopEventDefault( event );
        Dom.scrollTo( 0, 0 );
    } );

    Dom.scroll( function( event ){
        event.scrollTop > 300 ? totop.show() : totop.hide();
    } );

    typeof ACTION !== "undefined" && btns.forEach( function(){
        var element = this;
        if( Dom.containersClass( element, ACTION ) ){
            element.setAttribute( "action", "" );
            return false;
        }
    } );

    btns.hover(
        function(){
            var label = Dom( ".label", this );
            Dom.animaCenter.exit();

            label.css( "display", "block" );
            label.anima( {
                opacity : 1,
                right   : Dom.containersClass( container, "small-w-scren" ) ? 40 : 60
            } );
        },
        function(){
            var label = Dom( ".label", this );
            Dom.animaCenter.exit();
            label.anima( {
                opacity : 0,
                right   : Dom.containersClass( container, "small-w-scren" ) ? 20 : 40
            }, function(){
                this.style.display = "none";
            } );
        }
    );
    
} );
