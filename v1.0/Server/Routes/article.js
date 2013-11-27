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
    RTLog        = require( "../Libs/Log" ),
    Path         = require( "path" ),
    Fs           = require( "fs" ),
    Posts        = require( "../Models/Posts" ),
    Comments     = require( "../Models/Comments" ),
    Side         = require( "./side.js" ),
    Cache        = require( "../Libs/Cache" ),
    ANNEXS_ROOT = Path.join( Server.APP_ROOT, "/Blog/annexs" )
;


function sendAnnex( req, res, next ){
    res.nolog = true;
    var path = Path.join( ANNEXS_ROOT, req.params[0]||"", Path.basename( req.path ) );
  
    Fs.exists( path, function( exists ){
        exists ? res.sendfile( path ) : res.render( "404" );
    } );
}

Server.mGet( "/blog/articles",
    Side.getTags,
    Side.getCategorys,
    Side.getHotPost,
    Side.getTopPost,
    Side.getFriendLinks,
    function( req, res, next ){
        var condition = { state : 1 };

        if( req.query.category ){
            condition.category = unescape( req.query.category );
        }

        if( req.query.tag ){
            condition.tags = unescape( req.query.tag );
        }

        Posts.find( condition ).sort( { adate : -1 } ).exec( function( err, posts ){
            if( err ){
                res.redirect( "/404" );
                return;
            }
            req.data.posts = posts || [] ;
            next();
        } );
    },
    function( req, res, next ){
        var 
            count      = req.data.posts.length,
            LIMIT      = 15,
            PAGE_COUNT = ( ~~( count / LIMIT ) ) + ( count % LIMIT ? 1 : 0 ) || 1,
            page       = ~~unescape( req.query.page ) || 1,
            page       = Math.min( page, PAGE_COUNT ),
            skip       = ( page - 1 ) * LIMIT
        ;

        req.data.count     = count;
        req.data.page      = page;
        req.data.pageCount = PAGE_COUNT;
        req.data.posts     = req.data.posts.splice( skip, LIMIT );
        next();
    },
    function( req, res, next ){
        var 
            posts = {},
            ids = req.data.posts.map( function( post ){
                posts[ post._id ] = post;
                return post._id;
            } )
        ;

        Comments.find( { postid : { $in : ids } }, function( err, docs ){
            ( docs || [] ).forEach( function( doc ){
                posts[ doc.postid ].comments++;
            } );
            next();
        } );
    },
    function( req, res, next ){
        res.nolog=true;
        res.render( "articles", {
            action        : "post",
            postCategorys : req.data.getCategorys,
            postTags      : req.data.getTags,
            hotPosts      : req.data.getHotPost,
            topPosts      : req.data.getTopPost,
            posts         : req.data.posts,
            page          : req.data.page,
            pageCount     : req.data.pageCount,
            postCount     : req.data.count,
            friendLinks   : req.data.getFriendLinks,
            URL           : req.originalUrl,
            category      : unescape( req.query.category || "" )
        } );
    }
);

Server.mGet( /^\/blog\/articles\/(?:([^\/]+)\/)?([^\/?#]+)\.html$/i, 
    function find( req, res, next ){
        var 
            category = req.params[0] || "",
            linkname = req.params[1],
            path     = category + "/" + linkname,
            newvisit = path in req.session.visits ? 0 : 1
        ;
        res.nolog = true;
        Posts.findOneAndUpdate( 
            { category : category, linkname : linkname, state : 1 }, 
            { $inc : { visits : newvisit } },
            function( err, post ){
                
                if( err || !post ){
                    sendAnnex( req, res, next );
                    return;
                }
                
                if( newvisit ){
                    req.session.visits[ path ] = 1;
                }
                Cache.delete( "/data/getHotPost" );
                req.data = {
                    category : category,
                    linkname : linkname,
                    post     : post,
                    path     : path
                };
                next();
            } 
        );
    },
    function getCommentCount( req, res, next ){
        Comments.count( { postid : req.data.post._id }, function( err, count ){
            req.data.post.comments = ~~count;
            next();
        } );
    },
    Side.getTags,
    Side.getCategorys,
    Side.getTopPost,
    Side.getHotPost,
    Side.getFriendLinks,
    function getLikePost( req, res, next ){
        req.data.getLikePosts = [];
        Posts.find( { 
            _id : { $ne : req.data.post._id },
            $or : [ 
                { category : req.data.category },
                { tags : { $in : req.data.post.tags } } 
            ]
        } ).limit( 5 ).sort( { adate : -1 } ).exec( function( err, docs ){
            if( err || !docs || docs.length === 0 ){
                next();
                return;
            }
            req.data.getLikePosts = docs.map( function( doc ){
                return {
                    title    : doc.title,
                    category : doc.category,
                    linkname : doc.linkname
                }
            } );
            next();
        } );
    },
    function render( req, res, next ){
        var 
            post = req.data.post
        ;
    
        delete post.content;
        delete post.state;
        delete post.summary;
        post.originlink = post.originlink ? post.originlink : Server.CONFIG.server.hostname + req.originalUrl;
        res.render( "articleView", {
            _filename     : Path.basename( req.path ),
            path          : req.data.path,
            category      : req.data.category,
            linkname      : req.data.linkname,
            postCategorys : req.data.getCategorys,
            postTags      : req.data.getTags,
            topPosts      : req.data.getTopPost,
            hotPosts      : req.data.getHotPost,
            likePosts     : req.data.getLikePosts,
            friendLinks   : req.data.getFriendLinks,
            cookies       : req.cookies,
            post          : post
        } );
    }
);

Server.get( /^\/blog\/articles\/(?:([^\/]+)\/)?.*$/i, sendAnnex );
