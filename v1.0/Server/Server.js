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
    RJSEXT         = /.js$/i,
    Cox            = require( "../Cox" ),
    Path           = require( "path" ),
    Fs             = require( "fs" ),
    Express        = require("express"),
    Ejs            = require( "ejs" ),
    Config         = require( "./config.json" ),
    Utils          = require( "./Libs/Utils" ),
    Routes         = require( "./Libs/Routes" ),
    DB             = require( "./Libs/DB" ),
    RTLog          = require( "./Libs/Log" ),
    Cache          = require( "./Libs/Cache" ),
    Server         = Express(),
    ROUTE_FILTER   = [
        /^\/manage\/login/i
    ],
    Filter         = function( path ){
        return ROUTE_FILTER.some( function( r ){
            return r.test( path );
        } );
    }
;
//process.env.TZ    = "Asia/Shanghai";
global.Server     = Server;
Server.APP_ROOT   = Path.dirname( __dirname );
Server.APP_DIR    = Path.dirname( __filename );
Server.APP_PATH   = __filename;
Server.UPLOAD_DIR = Path.join( Server.APP_ROOT, Config.cache.root );
Server.CONFIG     = Config;

RTLog.log( "服务器程序启动", Config.server.host + ":" + Config.server.port );
RTLog.log( "TimeZone:", process.env.TZ );
//模块
Server.set( 'views', Path.join( Server.APP_ROOT , Config.temple.root ) );
Server.set( 'view engine', Config.temple.ext );
Server.engine( "." + Config.temple.ext, Ejs.__express );

XObject.mix( Server.locals, Config.temple.params );

//中间件配置
Server.use( Express.methodOverride() );
Server.use( Express.bodyParser( { uploadDir : Server.UPLOAD_DIR } ) );
Server.use( Express.cookieParser() );
Server.use( Express.session( {
    key : "JBLOG-SESSION-ID",
    secret : Config.secrets.session
} ) );
/*Server.use( Express.cookieParser( Config.secrets.cookie ) );
Server.use( Express.cookieSession( { 
    key : "JBLOG-SESSION-ID",
    secret : Config.secrets.session
} ) );*/



Server.use( function( req, res, next ){
    if( Utils.clientIsOld( req ) 
     && !/\/update\-ie\.html/i.test( req.path ) 
     && !/IESuperMan.jpg$/i.test( req.path )
    ){
        return res.redirect( "/update-ie.html" );
    }
    
    if( req.session && !req.session.visits ){
        req.session.visits = {}
    }
    //   return next();
    if( /^\/manage(?:\/.*)?$/i.test( req.path ) && !Filter( req.path ) && !req.session.manage ){
        if( Utils.isXhr( req ) ){
            return res.send( {
                state   : "fail",
                message : "无权限"
            } );
        }
        res.render( "manage/login" );
    }else{
        next();
    }
} );

//静态资源
Config.publics.forEach( function( item, index ){
    var dir = Path.join( Server.APP_ROOT, item.directory );

    if( item.open ){
        Server.use( item.prefix, Express.directory( dir, { icons : true } ) );
    }

    Server.use( item.prefix, Express.static( dir ) );

    RTLog.log( "公开[" + item.directory + "]目录" + ( item.open ? "及目录结构" : "" ) );

} );

[ "Get", "Post" ].forEach( function( method ){
    //Server[ "_" + method ] = Server[method];
    var origin = method.toLowerCase();
    Server[ "m" + method ] = XFunction( Object, Params( Function ), function( route, handlers ){
        return handlers.forEach( function( handler ){
            Server[origin]( route, handler );
        } );
    } );
} );



Server.use( Cache.get );

Server.use( function( req, res, next ){
    if( req.body && Utils.isXhr( req ) ){
        var 
            datas = [ req.body ],
            data  = null
        ;
        while( data = datas.shift() ){
            forEach( data, function( v, k ){
                if( typeof v === "object" ){
                    datas.push( v );
                    return;
                }
                data[ k ] = unescape( v );
            } );
        }
    }
    next();
} );

Server.use( function( req, res, next ){
    var 
        start = new Date,
        end   = res.end,
        ip    = Utils.getRemoteAddress( req )
    ;
    
    res.end = function( chunk, encoding ){
        res.end = end;
        res.end( chunk, encoding );
        !res.nolog && RTLog.log( XString.format( 
            "{0}({1}) \"{2}\" from {3} [use {4}.ms]",
            req.method,
            res.statusCode,
            req.originalUrl,
            ip,
            new Date - start
        ) )
    };

    next();
} );


//路由器加载
Routes.load( Path.join( Server.APP_DIR, "./Routes" ) );
Routes.load( Path.join( Server.APP_DIR, "./Routes/manage" ) );

Server.get( "*", function( req, res ){
    res.status(404).render( "404" );
} );

//Cache.clear();
Cache.deleteAll();
//连接数据库
DB.connect();

//开启服务器
Server.listen( Config.server.port || 80, Config.server.host );

