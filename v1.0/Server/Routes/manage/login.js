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
    Md5    = require( "md5" ),
    RTLog  = require( "../../Libs/Log" ),
    Utils  = require( "../../Libs/Utils" ),
    Config = Server.CONFIG.manage,
    LIMIT  = Config.auth.limit,
    limit  = {
        intime : null,
        times  : 0
    }
;

Server.post( "/manage/login", function( req, res, next ){
    if( limit.times > LIMIT.times ){
        if( !limit.intime ){
            limit.intime = new Date;
            RTLog.log( Utils.getRemoteAddress( req ) + " 登录博客管理中心请求被限制" );
        }
        var now = new Date();
        if( now - limit.intime < LIMIT.waittime  ){
            res.send( {
                state   : "limit",
                message : LIMIT.waittime - (now - limit.intime)
            } );
            return;
        }
        limit.intime = null;
        limit.times  = 0;
    }
    RTLog.log( Utils.getRemoteAddress( req ) + " 请求登录到博客管理中心" );
    if( Md5.digest_s( req.body.user ) === Config.auth.user 
     && Md5.digest_s( req.body.pwd ) === Config.auth.pwd 
    ){
        limit.intime = null;
        limit.times  = 0;
        req.session.manage = {
            user      : req.params.user,
            logintime : new Date,
            ip        : Utils.getRemoteAddress( req )
        };
        RTLog.log( Utils.getRemoteAddress( req ) + " 登录到博客管理中心" );
        res.send( { state : "ok" } );
    }else{
        limit.times++;
        res.send( { state : "fail", message : "账号或密码未通过验证." } );
    }

} );

Server.get( "/manage/loginout", function( req, res, next ){
    req.session.manage = null;
    res.redirect( "/blog" );
    //res.send(  )
} );


