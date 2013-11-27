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
    Comments = require( "../../Models/Comments" ),
    Posts    = require( "../../Models/Posts" ),
    Cache    = require( "../../Libs/Cache" ),
    Utils    = require( "../../Libs/Utils" ),
    RTLog    = require( "../../Libs/Log" )

;


Server.get( "/manage/newInfoCount", function( req, res, next ){
    Comments.count( { $or : [
        { read : false },
        { replys : { $elemMatch : { read : false } } }
    ] }, function( err, count ){
        if( err ){
            res.send( {
                state   : "fail",
                message : "获取新信息数量失败"
            } );
            return;
        }
        
        res.send( {
            state   : "ok",
            message : "",
            count   : ~~count
        } );
    } );
} );

Server.mGet( "/manage/queryMessages", 
    function( req, res, next ){
        req.data = {};
        req.timeStart = new Date;
        Comments.count( { category : "message" }, function( err, count ){
            req.data.count = ~~count;
            if( !~~count ){
                res.send( {
                    state   : "ok",
                    message : "",
                    data    : {
                        infos     : [],
                        page      : 1,
                        pageCount : 1,
                        count     : 0,
                        time      : new Date - req.timeStart
                    }
                } );
            }
            next();
        } );
    },
    function( req, res, next ){
        var 
            count      = req.data.count,
            LIMIT      = 15,
            PAGE_COUNT = ( ~~( count / LIMIT ) ) + ( count % LIMIT ? 1 : 0 ),
            page       = ~~unescape( req.query.page ) || 1,
            page       = Math.min( page, PAGE_COUNT ),
            skip       = ( page - 1 ) * LIMIT
        ;

        Comments.find( { category : "message" } ).sort( { adate : -1 } ).skip(skip).limit(LIMIT).exec( function( err, docs ){
            docs = docs || [];
            if( err ){
                res.send( {
                    state   : "fail",
                    message : "无法获取信息列表"
                } );
                return;
            }

            res.send( {
                state   : "ok",
                message : "",
                data    : {
                    page      : page,
                    pageCount : PAGE_COUNT,
                    count     : count,
                    infos     : docs.map( function( doc ){
                        return {
                            id      : doc.id,
                            name    : doc.name,
                            email   : doc.email,
                            website : doc.website,
                            content : doc.content,
                            adate   : doc.adate
                        };
                    } ),
                    time : new Date - req.timeStart
                }
            } );
        } )
        //Comments.find(  )
    } 
);

Server.get( "/manage/deleteMessage", function( req, res, next ){
    var ids = req.query.ids || [] ;

    Comments.find( { _id : { $in : ids } } ).remove( function( err, docs ){
        if( err ){
            res.send( {
                state   : "fail",
                message : "删除信息失败"
            } );
            return;
        }
        RTLog.log( "`comments`集中的[" + ids + "]信息被删除" );
        res.send( {
            state   : "ok",
            message : ""
        } );
    } );
} );

Server.mGet( "/manage/queryComment", 
    function getCache( req, res, next ){
        res.nolog = true;
        req.timeStart = new Date;
        Cache.get( "/manage/commentlist" ).done( function( ok, comments ){
            if( !ok ){
                next();
                return;
            }
            req.comments = comments;
            next();
        } );
    },
    getPostTitle,
    function findComment( req, res, next ){
        if( req.comments ){
            next();
            return;
        }
        Comments.find( { category : "comment" }, function( err, docs ){
            var 
                comments = [],
                docs = docs || []
            ;
            
            if( err ){
                res.send( {
                    state   : "fail",
                    message : "获取评论列表失败"
                } );
                return;
            }

            docs.forEach( function( doc ){
                var 
                    comment = {},
                    post    = req.postTitles[ doc.postid ] || {}
                ;
                comments.push( {
                    id        : doc._id,
                    name      : doc.name,
                    email     : doc.email,
                    website   : doc.website,
                    content   : doc.content,
                    posttitle : post.title,
                    postlink  : post.link,
                    postid    : doc.postid,
                    adate     : doc.adate,
                    category  : "comment"
                } );

                if( doc.replys && doc.replys.length ){
                    doc.replys.forEach( function( reply, index ){
                        comments.push( {
                            index     : index,
                            id        : reply._id,
                            name      : reply.name,
                            email     : reply.email,
                            website   : reply.website,
                            at        : reply.at,
                            atwebsite : reply.atwebsite,
                            content   : reply.content,
                            posttitle : post.title,
                            postlink  : post.link,
                            postid    : doc.postid,
                            commentid : doc._id,
                            adate     : reply.adate,
                            category  : "reply"                                                        
                        } );
                    } );
                }

            } );

            req.comments = comments.sort( function( a, b ){
                return a.adate.getTime() < b.adate.getTime() ? 1 : -1 ;
            } );
            Cache.save( "/manage/commentlist", req.comments );
            next();
        } );
    },
    function send( req, res, next ){
        var 
            count      = req.comments.length,
            LIMIT      = 15,
            PAGE_COUNT = ( ~~( count / LIMIT ) ) + ( count % LIMIT ? 1 : 0 ) || 1,
            page       = ~~unescape( req.query.page ) || 1,
            page       = Math.min( page, PAGE_COUNT ),
            skip       = ( page - 1 ) * LIMIT
        ;
        res.send( {
            state     : "ok",
            message   : "",
            data      : {
                count     : count,
                page      : page,
                pageCount : PAGE_COUNT,
                time      : new Date - req.timeStart,
                infos     : req.comments.splice( skip, LIMIT )
            }
        } );
    }
);


Server.get( "/manage/deleteComment", function( req, res, next ){
    var 
        items       = req.query.ids || [],
        replys      = {},
        comments    = {},
        dels        = []
    ;
    items.forEach( function( item ){
        item = item.split(",");
        if( item[2] === "reply" ){
            if( !comments.hasOwnProperty( item[1] ) ){
                if( item[1] in replys ){
                    replys[ item[1] ].push( item[0] );
                }else{
                    replys[ item[1] ] = [ item[0] ];
                }
            }
        }else{
            delete replys[ item[0] ];
            comments[ item[0] ] = item;
        }
    } );
    comments = XObject.keys( comments );
    if( comments.length > 0 ){
        var del = new Deferred();
        dels.push( del );
        Comments.find( { _id : { $in : comments } } ).remove( function( err, doc ){
            if( err ){
                del.rejected();
                return;
            }
            RTLog.log( "`comments`集中的[" + comments + "]评论被删除" );
            Cache.delete( "/manage/commentlist" );
            del.resolved();
        } );
    }

    XObject.forEach( replys, true, function( replys, id ){
        var del = new Deferred();
        dels.push( del );
        Comments.update( { _id : id }, { $pull : {
            replys : { _id : { $in : replys } }
        } }, function( err ){
            if( err ){
                del.rejected();
                return;
            }
            console.log( replys );
            RTLog.log( "`comments`集中的[" + id + "]评论回复被删除" );
            Cache.delete( "/manage/commentlist" );
            del.resolved();
        } );
    } );    
    var x = new Deferred;
    x.resolved();
    dels.push( x );
    ( new DeferredList( dels ) ).done( function( ok ){
        if( !ok ){
            res.send( {
                state   : "fail",
                message : "删除评论失败"
            } );
            return;
        }
        res.send( {
            state   : "ok",
            message : ""
        } );
    } )
} );

Server.mGet( "/manage/getComment",
    getPostTitle,
    function getComment( req, res, next ){
        var id = req.query.id;
        Comments.findById( id, function( err, doc ){
            if( err ){
                res.send( {
                    state   : "fail",
                    message : "获取评论失败"
                } );
                return;
            }

            res.send( {
                state   : "ok",
                message : "",
                post    : req.postTitles[ doc.postid ],
                comment : doc
            } );
        } );    
    }
);

/*
Server.get( "/deletetest", function( req, res, next ){
    Comments.update( { _id : "524d0b25241bc8843e000002" }, {
        $pull : {
            replys : { _id : { $in : [ "524d0b35241bc8843e000006", "524d0b30241bc8843e000005" ] } }
        }
    }, function(  ){
        res.send( arguments );
    } )
} );*/


function getPostTitle( req, res, next ){
    if( req.comments ){
        next();
        return;
    }
    Cache.get( "/manage/getPostTitle" ).done( function( ok, titles ){
        if( !ok ){
            Posts.find( {}, { title : true, category : true, linkname : true }, function( err, docs ){
                if( err ){
                    res.send( {
                        state   : "fail",
                        message : "无法获取评论列表，获取关联文件信息发生异常"
                    } );
                    return;
                }
                req.postTitles = {};
                docs && docs.forEach( function( doc ){
                    req.postTitles[ doc._id ] = {
                        title : doc.title,
                        link  : ( doc.category ? "/" + doc.category : "" ) + "/" + doc.linkname + ".html"
                    };
                } );
                Cache.save( "/manage/getPostTitle", req.postTitles );
                next();
            } );
            return;
        }
        req.postTitles = titles;
        next();
    } );
}