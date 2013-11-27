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

Cox.Modules.addRoot( "Cox", "/Cox/modules" );

Use( Modules( "~/Cox/UI/Dom", "~/Cox/UI/Animation", "/Libs/about/TimeLine", "/Libs/about/Page" ), function( require ){
    var 
        Dom      = require( "Dom" ),
        TimeLine = require( "TimeLine" ),
        Anima    = require( "Animation" ),
        Page     = require( "Page" )
    ;

    TimeLine.loadTimePoint();
} );