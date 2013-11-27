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

var 
    RE_PRE_START  = /<pre[^>]*>/ig,
    RE_PRE_END    = /<\/pre>/ig,
    RE_PRE_BRUSH  = /<pre\s*class\s*=\s*("|')([^"']+)\1\s*>([\s\S]*)<\/pre>/i,
    BRUSH_ROOT    = "SyntaxHighlighter/brushs/",
    BRUSH_ALIASES = require( "SyntaxHighlighter/brushs/aliases" )
;

function parsePreTag( data ){
    var 
        match = null
    ;
    pres = [];
    RE_PRE_START.lastIndex = 0;
    RE_PRE_END.lastIndex   = 0;
    
    while( match = RE_PRE_START.exec( data ) ){
        var 
            start = match.index,
            end   = RE_PRE_START.lastIndex,
            pos   = {
                start : start,
                end   : 0
            }
        ;
        start = RE_PRE_START.lastIndex;
        while( RE_PRE_END.exec( data ) ){
            end = RE_PRE_END.lastIndex;
            if( !RE_PRE_START.exec( data ) 
             || RE_PRE_START.lastIndex > end
            ){
                RE_PRE_START.lastIndex = end;
                break;
            }
        }

        pos.end = end;
        pres.push( pos );
    }

    return pres;
}

function convertPreToSyntaxHigh( pre, option ){
    var 
        option = option || {},
        match  = RE_PRE_BRUSH.exec( pre ),
        aliase = match && match[2].toLowerCase(),
        brush  = null
    ;
    if( !match || !BRUSH_ALIASES.hasOwnProperty( aliase ) ){
        return pre;
    }

    brush = new ( require( BRUSH_ROOT + BRUSH_ALIASES[ aliase ] ).Brush );
    brush.init( option );
    return brush.getHtml( match[3] );
}


exports.parse = XFunction( String, Optional( Cox.PlainObject ), function( data, option ){
    var 
        pres    = parsePreTag( data ),
        newdata = "",
        end     = 0
    ;
    if( pres.length === 0 ){
        return data;
    }

    pres.forEach( function( prepos ){
        newdata += data.slice( end, prepos.start );
        newdata += convertPreToSyntaxHigh( 
            data.slice( prepos.start, prepos.end ),
            option 
        );
        end = prepos.end;
    } );
    newdata += data.slice( end );
    return newdata;
} );
