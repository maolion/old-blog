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
    RTLog          = require( "../../Libs/Log" ),
    Utils          = require( "../../Libs/Utils" ),
    Cache          = require( "../../Libs/Cache" ),
    Fs             = require( "fs" ),
    Path           = require( "path" ),
    ERROR_LOG_PATH = Path.join( Server.APP_ROOT, "/Server/ERROR.log" ),
    RT_LOG_ROOT    = Path.join( Server.APP_ROOT, "/Server/Logs" )
;



Server.get( "/manage", function( req, res, next ){
    res.render( "manage/default" );
} );

Server.get( "/manage/errorlog", function( req, res, next ){
    res.nolog = true;
    Fs.readFile( ERROR_LOG_PATH, function( err, data ){
        //console.log( data.toString( "utf8" ) );
        res.send( {
            state    : "ok",
            message  : "",
            errorlog : data && data.toString( "utf8" )
        } );
    } );
} );

Server.get( "/manage/clearErrorLog", function( req, res, next ){
    Fs.unlink( ERROR_LOG_PATH, function(){
        RTLog.log( "错误日记被删除" );
        res.send( {
            state   : "ok",
            message : ""
        } );
    } );
} );



Server.get( "/manage/clearRTLog", function( req, res, next ){
    Fs.readdir( RT_LOG_ROOT, function( err, files ){
        console.log( err );
        files && files.forEach( function( file ){
            Fs.unlink( Path.join( RT_LOG_ROOT, file ) );
        } );
        res.send( {
            state   : "ok",
            message : ""
        } );
    } );
} );

Server.get( "/manage/clearCache", function( req, res, next ){
    Fs.readdir( RT_LOG_ROOT, function( err, files ){
        Cache.deleteAll();
        res.send( {
            state   : "ok",
            message : ""
        } );
    } );
} );