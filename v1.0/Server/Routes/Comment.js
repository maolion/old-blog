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
    LIMIT_SIZE = 10240,
    RE_EMAIL_SIGN = /^[\w\.\d]+@[\w\.\d]+\.[A-Za-z]+$/,
    RE_WEBSITE_SIGN = /^https?:\/\//,
    Cache    = require( "../Libs/Cache" ),
    Utils    = require( "../Libs/Utils" ),
    Comments = require( "../Models/Comments" ),
    Posts    = require( "../Models/Posts" )
;


Server.mPost( "/comment", 
    checkSize,
    checkContent,
    function createComment( req, res, next ){
        var body = req.body;
        res.nolog = true;
        Comments.create( {
            name     : body.name,
            email    : body.email,
            website  : body.website,
            content  : body.content,
            category : "comment",
            avatar   : body.email && Utils.gravatar( body.email, 48 ) || "/images/default_avatar.jpg",
            postid   : body.postid,
            reply    : []
        }, function( err, doc ){
            if( err ){
                res.send( {
                    state   : "fail",
                    message : "提交评论失败"
                } );
                return;
            }
            Cache.delete( "/manage/commentlist" );
            res.send( {
                state     : "ok",
                message   : "",
                data      : {
                    avatar    : doc.avatar,
                    commentid : doc.id,
                    adate     : doc.adate
                }
            } );
        } );
    }
);

Server.mPost( "/reply", 
    checkSize,
    function( req, res, next ){
        var 
            body   = req.body,
            id     = body.commentid,
            avatar = body.email && Utils.gravatar( body.email, 48 ) || "/images/default_avatar.jpg"
        ;
        res.nolog = true;
        Comments.findOneAndUpdate( { _id : id } , {
            $push : {
                replys : {
                    name      : body.name,
                    email     : body.email,
                    website   : body.website,
                    avatar    : avatar,
                    content   : body.content,
                    at        : body.at,
                    atwebsite : body.atwebsite,
                    atemail   : body.email
                }
            }
        }, function( err, doc ){
            if( err || !doc ){
                res.send( {
                    state   : "fail",
                    message : "回复失败"
                } );
                return;
            }
            Cache.delete( "/manage/commentlist" );
            res.send( {
                state   : "ok",
                message : "",
                data    : {
                    commentid : id,
                    avatar    : avatar,
                    adate     : doc.adate
                }
            } );
        } );
    } 
);

Server.get( "/comments", function( req, res, next ){
    var 
        skip   = ~~req.query.skip,
        postid = unescape( req.query.postid )
    ;
    res.nolog = true;
    Comments.find( { postid : postid, category : "comment" } ).sort( { adate : -1 } ).skip( skip ).limit( 10 ).exec( function( err, docs ){
        if( err ){
            res.send( {
                state   : "fail",
                message : "获取评论失败"
            } );
            return;
        }
        res.send( {
            state    : "ok",
            message  : "",
            comments : docs
        } );
    } );
} );

function checkSize( req, res, next ){
    var body = req.body;
    if( Utils.getBytesLength( body.name + body.email + body.website + body.content ) > LIMIT_SIZE ){
        res.send( {
            state   : "fail",
            message : "提交的数据字节数超过最大限制."
        } );
        return;
    }
    if( !RE_EMAIL_SIGN.test( body.email ) ){
        body.email = "";
    }
    if( !RE_WEBSITE_SIGN.test( body.website ) ){
        body.website = "";
    }
    next();
}

function checkContent( req, res, next ){
    var 
        body      = req.body,
        condition = {
            email    : body.email,
            content  : body.content,
            category : "comment",
            postid   : body.postid
        }
    ;

    Comments.count( condition, function( err, count ){
        if( count ){
            res.send( {
                state   : "fail",
                message : "提交评论失败，内容重复"
            } );
            return;
        }
        next();
    } );
}


