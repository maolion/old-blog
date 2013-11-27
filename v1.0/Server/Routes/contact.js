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
    LIMIT_SIZE = 51200,
    RE_EMAIL_SIGN = /^[\w\.\d]+@[\w\.\d]+\.[A-Za-z]+$/,
    RE_WEBSITE_SIGN = /^https?:\/\//,
    Comments = require( "../Models/Comments" ),
    Utils = require( "../Libs/Utils" )
;

Server.get( "/blog/contact", function( req, res,next ){
    res.nolog = true;
    res.render( "contact", {
        cookies : req.cookies,
        action  : "contact"
    } );
} );


Server.mPost( "/blog/contact/send", 
    function check( req, res, next ){
        var body = req.body;
        res.nolog = true;
        if( Utils.getBytesLength( 
            body.name + 
            body.email +
            body.website + 
            body.content
        ) > LIMIT_SIZE ){
            res.send( {
                state   : "fail",
                message : "发送失败，信息大超过限制"
            } );
            return;
        }

        if( RE_EMAIL_SIGN.test( body.email ) === false ){
            res.send( {
                state   : "fail",
                message : "请输入正确格式的邮箱"
            } );
            return;
        }
        next();
    },
    function create( req, res, next ){
        var body = req.body;
        Comments.create( {
            name     : body.name,
            email    : body.email,
            website  : body.website,
            content  : body.content,
            category : "message"
        }, function( err, docs ){
            if( err || !docs ){
                res.send( {
                    state   : "fail",
                    message : "发送失败,请重试, 囧......"
                } );
                return;
            }
            res.send( {
                state   : "ok",
                message : ""
            } );
        } );
    } 
)