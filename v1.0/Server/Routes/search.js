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
    Path = require( "path" ),
    Fs   = require( "fs" ),
    //MIME = require( Path.join( Cox.Modules.getRoot("Cox"), "MIME" ) ),
    Side = require( "./side.js" ),
    Utils = require( "../Libs/Utils" ),
    Posts = require( "../Models/Posts" ),
    Comments = require( "../Models/Comments" ),
    RE_KEYWORD = /^(?:#([^\[\]#]+)#)?\s*(.*)\s*$/,
    RE_SPLIT1 = /\s*;\s*/g,
    RE_SPLIT2 = /\s+/g
;

function parseKeyword( keyword ){
    var 
        match = RE_KEYWORD.exec( keyword ),
        categorys = null,
        keywords  = null
    ;
    if( !match ){
        return null;
    }
    if( match[1] ){
        categorys = new RegExp( XString.trim( match[1] ).replace( RE_SPLIT1, "|" ), "i" );
    }
    if( match[2] ){
        keywords = XString.trim( match[2] ).replace( RE_SPLIT2, "|" );
    }
    return {
        categorys : categorys,
        keywords  : keywords
    };
}


Server.mGet( "/blog/search",
    function( req, res, next ){
        res.nolog = true;
        req.data = {};
        req.timeStart = new Date;
        next();
    },
    Side.getTags,
    Side.getCategorys,
    Side.getHotPost,
    Side.getTopPost,
    Side.getFriendLinks,
    function( req, res, next ){
        var 
            keyword   = parseKeyword( unescape( req.query.keywords || "" ) ) || {},
            condition = { state : 1 }
        ;

        if( keyword.categorys ){
            condition.category = keyword.categorys;
        }
        if( keyword.keywords ){
            condition.$or = [
                { title    : new RegExp( keyword.keywords, "i" ) },
                { linkname : new RegExp( keyword.keywords, "i" ) },
                { tags     : { $in : keyword.keywords.split("|") } }
            ]
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
            PAGE_COUNT = ( ~~( count / LIMIT ) ) + ( count % LIMIT ? 1 : 0 ),
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
        res.render( "search.html", {
            action        : "search",
            postCategorys : req.data.getCategorys,
            postTags      : req.data.getTags,
            hotPosts      : req.data.getHotPost,
            topPosts      : req.data.getTopPost,
            posts         : req.data.posts,
            page          : req.data.page,
            pageCount     : req.data.pageCount,
            postCount     : req.data.count,
            friendLinks   : req.data.getFriendLinks,
            time          : new Date - req.timeStart,
            keywords      : unescape( req.query.keywords || "" ),
            URL           : req.originalUrl
        } );
    }
);