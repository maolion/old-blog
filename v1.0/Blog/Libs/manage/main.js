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


Use( Modules("~/Cox/UI/Dom", "~/Manage/MAjax", "~/Manage/Home", "~/Manage/MessageBox" ), function( require ){
    var 
        Dom      = require( "Dom"),
        Home     = require( "Home" ),
        MAjax    = require( "MAjax" ),
        MsgBox   = require( "MessageBox" ),
        modules  = {},
        hbtn     = Dom( "#sidebar nav.navigation li.manage" ),
        btns     = Dom( "#sidebar nav.navigation li.nav-btn[target]" )
    ;
    Home.show();
    hbtn.on( "click", function( evnet ){
        Home.show();
    } );
    Home.on( "show", function(){
        hbtn.attr( "action", "" );
    } );

    Home.on( "hide", function(){
        hbtn.removeAttr( "action" );
    } );

    btns.once( "click", function(){
        var 
            target = this.getAttribute( "target" ),
            btn    = Dom( this )
        ;
        MsgBox.wait( "Please wait..",
        Use( Modules( "~/Manage/" + target  ), function( require ){
            var panel = require( target );
            btn.on( "click", function(){
                panel.show();
            } );

            panel.on( "show", function(){
                btn.attr( "action", "" );
            } );
            panel.on( "hide", function(){
                btn.removeAttr( "action" );
            } );

            panel.show();
        } )
        );
    } );

} );
