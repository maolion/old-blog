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
    RJSEXT = /.js$/i,
    Fs     = require( "fs" ),
    Path   = require( "path" ),
    Utils  = require( "./Utils" ),
    RTLog  = require( "./Log" )
;

exports.load = function( dir ){

    var routes = Fs.readdirSync( dir ).filter( function( path ){
        return RJSEXT.test( path );
    } );

    return routes.map( function( filename ){
        try{
            var route = require( Path.join( dir, filename ) );
            filename = Path.join( Path.basename( dir ), filename );
            RTLog.log( "加载[" + filename + "]路由文件" );
            return route;
        }catch( e ){
            Utils.errorLog( "加载[" + filename + "]路由文件时发生异常", e );
            throw e;
        }
    } );
};