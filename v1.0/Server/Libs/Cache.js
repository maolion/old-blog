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
    ROOT   = null,
    RE_SEP = /\\|\//g,
    Fs     = require( "fs" ),
    Path   = require( "path" ),
    RTLog  = require( "./Log" ),
    Utils  = require( "./Utils" ),
    Config = require( "../config.json" ).cache,
    Cache  = exports
;

ROOT = Path.join( Path.dirname( Path.dirname( __dirname ) ), Config.root );
function dataParse( data ){
    return ( new Function( 'return ' + data ) )();
}

Cache.get = XFunction( String, function( id ){
    var get  = new Deferred;

    Fs.readFile( Path.join( ROOT, id.replace( RE_SEP, "_" ) ), function( err, data ){
        err || !data ? get.rejected() : get.resolved( dataParse( data ) );
    } );

    return get;
} );

Cache.get.define( Object, Object, Function, function( req, res, next ){
    var path = Path.join( ROOT, req.path.replace( RE_SEP, "_" ) );
    
    Fs.exists( path, function( exists ){
        exists ? res.sendfile( path ) : next();
    } );
} );

Cache.save = XFunction( String, Object, function( id, data ){
    id = id.replace( RE_SEP, "_" );
    var path = Path.join( ROOT, id );
    data = JSON.stringify( data );
    Fs.writeFile( path, data, function( err ){
        if( err ){
            Utils.errorLog( "无法在服务器中保存/创建缓存文件", err );
        }else{
            RTLog.log( "已经创建[" + id + "]缓存块" );
        }
    } );
} );

Cache.delete = XFunction( String, function( id ){
    Fs.unlink( Path.join( ROOT, id.replace( RE_SEP, "_" ) ) );
} );

Cache.deleteAll = function(){
    Fs.readdir( ROOT, function( err, files ){
        if( err ){
            Utils.errorLog( "无法枚举缓存目录`" + ROOT +  "` 的文件列表", err );
            return;
        }
        files.forEach( function( filename ){
            Fs.unlink( Path.join( ROOT, filename ) );                                   
        } );
        RTLog.log( "缓存文件被清空" );
    } );
};

Cache.clear = function(){
    var 
        age   = new Date().getTime() - Config.maxAge
    ;

    if( Config.maxAge === 0 ){
        return;
    }
    Fs.readdir( root, function( err, files ){
        if( err ){
            Utils.errorLog( "无法枚举缓存目录`" + ROOT +  "` 的文件列表", err );
            return;
        }
        files.forEach( function( filename ){
            var path = Path.join( ROOT, filename );
            Fs.stat( path, function( err, stat ){
                if( err ){
                    Utils.errorLog( "无法获取缓存文件`" + filename + "` 的文件信息", err );
                    return;
                }
                if( stat.ctime.getTime() < age ){
                    Fs.unlink( path );                                   
                    RTLog( "缓存文件`" + filename +"` 因过期被删除" );
                }
            } );
        } );
    } );
};
