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

Modules.addRoot( "Cox", "/Cox/modules" );
Modules.addRoot( "Manage", "/Libs/manage" );
Use( Modules( "~/Cox/UI/Dom", "/Libs/SideBar" ), function( require ){
    var 
        Dom           = require( "Dom" ),
        container     = Dom("#container"),
        main          = Dom("#main")
        historycolumn = Dom( "#history-column" ),
        postindex     = Dom( "#post-index" )
    ;  
    require( "SideBar" );

    postindex.exists = !!postindex.get(0)

    if( postindex.exists ){
        postindex.top = postindex.offset().y;
        Dom.scroll( function( event ){
            if( Dom.containersClass( container, "small-w-scren" ) ){
                return;
            }
            if( event.scrollTop > postindex.top && postindex.css("position") !== "fixed" ){
                postindex.top = postindex.offset().y;
                postindex.css( {
                    position : "fixed",
                    top      : "5px",
                    right    : "55px",
                    width    : parseInt( historycolumn.css( "width" ) ) - 5 + "px"
                } );
            }else if( event.scrollTop < postindex.top ){
                postindex.top = postindex.offset().y;
                postindex.css( {
                    position : "static",
                    width    : "auto"
                } );
            }
        } );
    }

    Dom.resize( function( event ){
        var ss  = event.clientWidth < 700;
        var ss2 = event.clientHeight <= 400;
        container.toggleClass( "small-w-scren", ss );         
        container.toggleClass( "small-h-scren", ss2 );
        main.css( "width", event.clientWidth - ( ss ? 40 : 60 ) + "px" );
        if( postindex.exists ){
            ss && postindex.css( "position", "static" );
            postindex.top = parseInt( historycolumn.css( "height" ) ) + historycolumn.offset().y;
            if( !ss && postindex.css( "position" ) === "fixed" ){
                postindex.css( "width", parseInt( historycolumn.css( "width" ) ) - 5 + "px" );
            }
        }

    } );
} );

