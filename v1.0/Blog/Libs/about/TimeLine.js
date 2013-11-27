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


Define( "TimeLine", Depend( "~/Cox/UI/Dom", "~/Cox/UI/Animation", "~/Cox/Net/Ajax", "./Page", "./Loading" ), function( require, TimeLine, module ){
    var 
        Dom     = require( "Dom" ),
        Anima   = require( "Animation" ),
        Ajax    = require( "Ajax" ),
        Loading = require( "Loading" ),
        Page    = require( "Page" )
    ;

    TimeLine = module.exports = Class( "TimeLine", Single, Extends( Cox.EventSource ), function( Static, Public ){
        var 
            DELAY    = 300,
            timeline = Dom( "#time-line" ),
            warp     = timeline.find( "div.warp" ),
            action   = null,
            temple   = [
            '<section id="{3}" pagename={4} title="{0}" class="item {1}" >',
            '   <span class="label" >{2}</span>',
            '</section>'
            ].join( "\n" )
        ;
        function getNext( section ){
            var next = section;
            while( ( next = next.nextSibling ) && next.tagName !== section.tagName );
            return next;
        }
        function getPrev( section ){
            var prev = section;
            while( ( prev = prev.previousSibling ) && prev.tagName !== section.tagName );
            return prev;   
        }
        function append( historys ){
            XList.forEach( historys, function( history ){
                warp.append( XString.format(
                    temple,
                    history.summary,
                    history.newyear ? "newyear" : "",
                    history.label,
                    history._id,
                    history.pagename
                ) );
            } );
        }
        Public.constructor = function(){
            var defer = null;
            this.Super( "constructor" );
            this.dispatchEvent(
                new Cox.Event( "action" ),
                new Cox.Event( "unaction" ),
                new Cox.Event( "load" )
            );
            

            Dom.on( document, "keydown", function( event ){
                switch( event.which || event.keyCode ){
                    case 37: TimeLine.prevAction(); break;
                    case 39: TimeLine.nextAction(); break;
                }
            } );
            Dom.resize( function(){
                if( !action ){
                    return;
                }
                var 
                    linewidth = parseInt( timeline.css( "width" ) ),
                    width     = parseInt( action.css( "width" ) ),
                    offset    = action.offset().x - warp.offset().x
                ;
                warp.css( "left", ( linewidth - width ) / 2 - offset + "px" );
            } );
            this.on( "action", function( action ){
                Page.show( action.attr( "id" ), action.attr( "pagename" ) );
            } );
            this.on( "unaction", function( action ){
                Page.hide( action.attr( "id" ), action.attr( "pagename" ) );
            } );
        };

        Public.loadTimePoint = function(){
            Loading.show();
            Ajax.get( "/getHistorys", "json", function( data ){
                var historys = null;
                if( data.state !== "ok" ){
                    alert( "抱歉,程序发生异常无法正常运行。" );
                }
                historys = data.data.historys.reverse();
                historys.length;
                if( historys.length ){
                    Loading.hide();
                    warp.find( "section.item" ).remove();
                    append( historys );
                    TimeLine.sections = warp.find( "section" );
                    TimeLine.action( warp.find("section:first-child") );

                    TimeLine.sections.on( "click", function(){
                        TimeLine.action( this.cache || ( this.cache = Dom( this ) ) );
                    } );

                    TimeLine.fireEvent( "load", [ historys ] );
                }
            } );
        };

        //Public.loadPage = function(  )

        Public.action = XFunction( Dom.XDom, function( section ){
            var
                linewidth = parseInt( timeline.css( "width" ) ),
                width     = parseInt( section.css( "width" ) ),
                offset    = section.offset().x - warp.offset().x
            ;
            if( action === section ){
                return;
            }
            if( action ){
                warp.anima() && warp.anima().exit();
                action.removeClass( "action" );
                TimeLine.fireEvent( "unaction", [ action ] );
            }
            action = section;
            section.addClass( "action" );
            //action = section;
            warp.anima( 600, {
                left : ( linewidth - width  ) / 2 - offset
            }, function(){
                TimeLine.fireEvent( "action", [ action ] );
            } );
        } );

        Public.nextAction = function(){
            var next = getNext( action.get(0) );
            next && TimeLine.action( next.cache || ( next.cache = Dom( next ) ) );
        };

        Public.prevAction = function(){
            var prev = getPrev( action.get(0) );
            prev && TimeLine.action( prev.cache || (  prev.cache = Dom( prev ) ) );
        };

    } ).getInstance();
} );