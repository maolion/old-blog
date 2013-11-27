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
    MIME = require( Path.join( Cox.Modules.getRoot("Cox"), "MIME" ) ),
    Side = require( "./side.js" ),
    Utils = require( "../Libs/Utils" ),
    Posts = require( "../Models/Posts" ),
    Comments = require( "../Models/Comments" )
;

Server.mGet( /^\/(?:blog\/?)?$/i, 
    Side.getTags,
    Side.getCategorys,
    Side.getHotPost,
    Side.getFriendLinks,
    function( req, res, next ){
        res.nolog = true;
        Posts.find( { state : 1 } ).sort( { adate : -1 } ).limit( 10 ).exec( function( err, posts ){
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
        res.render( "index", {
            action        : "home",
            postCategorys : req.data.getCategorys,
            postTags      : req.data.getTags,
            hotPosts      : req.data.getHotPost,
            friendLinks   : req.data.getFriendLinks,
            posts         : req.data.posts
        } );
    } 
);

Server.mGet( /^\/download(\/.+$)/i, 
    function( req, res, next ){
        var path = null;
        req.filepath = req.params[0];
        path = Path.join( Server.APP_ROOT, "/Downloads/", req.filepath );
        Fs.exists( path, function( exists ){
            if( !exists ){
                return next();
            }
            res.download( path );
        } );
    },
    function( req, res, next ){
        var path = null;
        path = Path.join( Server.APP_ROOT, "/Blog/", req.filepath );
        Fs.exists( path, function( exists ){
            if( !exists ){
                return next();
            }
            res.download( path );
        } );
    },
    function( req, res, next ){
        var path = null;
        path = Path.join( Server.APP_ROOT, "/Cox/", req.filepath );
        Fs.exists( path, function( exists ){
            if( !exists ){
                return next();
            }
            res.download( path );
        } );
    },
    function( req, res, next ){
        var path = null;
        path = Path.join( Server.APP_ROOT, "/Demos/", req.filepath );
        Fs.exists( path, function( exists ){
            if( !exists ){
                return next();
            }
            res.download( path );
        } );
    }
);

Server.get( "*", function( req, res, next ){
    var path = Path.join( Server.APP_ROOT, "/Blog", decodeURI( req.path ) );
    res.nolog = true;    
    Fs.exists( path, function( exists ){
        if( !exists ){
            return next();
        }
        res.nolog = true;
        res.sendfile( path );

    } );

} );

Server.post(/(?:cgi-bin\/php5|%63%67%69%2D%62%69%6E\/%70%68%70)/i, function(req, res, next)
{
    res.send("5oiR5LiN55+l6YGT5L2g55qE55uu55qE5piv5LuA5LmI77yM5L2G5piv5oiR5oOz6K6p5L2g55+l6YGT77yM5L2g5Lir55qE6K+V5LqG6L+Z5LmI5aSa5qyh77yM6Zq+5Yiw5bCx5LiN55+l6YGT5LiN6KGM5Zib77yM5oiR5pyN5Yqh5Zmo5LiK5rKh6KOFUEhQ55qE56iL5bqP5aW95Zib77yM5aW95Zib77yM5aW95Zib44CC5aSn5ZOl5pS+6L+H5oiRLOaIkeWPquaYr+S4quWwj+iPnOm4n+OAgg==");
});