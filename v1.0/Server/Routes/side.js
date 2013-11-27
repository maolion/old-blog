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
    Posts       = require( "../Models/Posts" ),
    Categories  = require( "../Models/Categories" ),
    FriendLinks = require( "../Models/FriendLinks" ),
    Cache       = require( "../Libs/Cache" ),
    Side        = exports
;

Side.getHotPost = function( req, res, next ){
    req.data = req.data || {};
    req.data.getHotPost = [];

    Cache.get( "/data/getHotPost" ).done( function( ok, data ){
        if( data ){
            req.data.getHotPost = data;
            next();
            return;
        }

        Posts.find( { state : 1 } ).sort( { visits : -1 } ).limit( 5 ).exec( function( err, docs ){
            if( err || !docs || docs.length === 0 ){
                next();
                return;
            }
            req.data.getHotPost = docs.map( function( doc ){
                return {
                    title    : doc.title,
                    category : doc.category,
                    linkname : doc.linkname
                };
            } );
            Cache.save( "/data/getHotPost", req.data.getHotPost );
            next();
        } );
    } );
}

Side.getTopPost = function( req, res, next ){
    req.data = req.data || {};
    req.data.getTopPost = [];

    Cache.get( "/data/getTopPost" ).done( function( ok, data ){
        if( data ){
            req.data.getTopPost = data;
            next();
            return;
        }

        Posts.find( { state : 1 } ).sort( { adate : -1 } ).limit( 5 ).exec( function( err, docs ){
            if( err || !docs || docs.length === 0 ){
                next();
                return;
            }
            req.data.getTopPost = docs.map( function( doc ){
                return {
                    title    : doc.title,
                    category : doc.category,
                    linkname : doc.linkname
                };
            } );
            Cache.save( "/data/getTopPost", req.data.getTopPost );
            next();
        } );
    } );
}

Side.getCategorys = function( req, res, next ){
    req.data = req.data || {};
    req.data.getCategorys = [ [], [] ];
    Cache.get( "/getCategorys" ).done( function( ok, data ){
        var 
            categorys = req.data.getCategorys,
            list      = null
        ;

        if( ok ){
            data.categorys.forEach( function( category, index ){
                categorys[ index % 2 ].push( category );
            } );
            next();
            return;
        }

        list = [];
        Categories.find( {}, { name : true }, function( err, doc ){
            
            if( err || !doc ){
                next();
                return;
            }
            doc.forEach( function( doc, index ){
                list.push( doc.name );
                categorys[ index % 2 ].push( doc.name );
            } );

            Cache.save( "/getCategorys", {
                state     : "ok",
                message   : "",
                categorys : list
            } );
            next();
        } );
    } );
};


Side.getFriendLinks = function( req, res, next ){
    req.data = req.data || {};
    req.data.getFriendLinks = [ [], [] ];
    Cache.get( "/data/getFriendLinks" ).done( function( ok, data ){
        var 
            friendlinks = req.data.getFriendLinks,
            list        = null
        ;

        if( ok ){
            var i = 0;
            data.forEach( function( link ){
                link.state && friendlinks[ i++ % 2 ].push( link );
            } );
            next();
            return;
        }

        list = [];
        FriendLinks.find( {}, function( err, docs ){
            if( err || !docs ){
                next();
                return;
            }
            var i = 0;
            docs.forEach( function( doc ){
                doc.state && friendlinks[ i++ % 2 ].push( doc );
            } );

            Cache.save( "/data/getFriendLinks", docs );
            next();
        } );
    } );
};



Side.getTags = function( req, res, next ){
    req.data = req.data || {};
    req.data.getTags = [];

    Cache.get( "/data/getTags" ).done( function( ok, data ){
        var tags = null;

        if( ok ){
            req.data.getTags = data;
            next();
            return;
        }
        tags = req.data.getTags;
        Posts.find( {}, { tags : true }, function( err, docs ){
            var buffer = {};
            if( err || !docs || docs.length === 0 ){
                next();
                return;
            }
            docs.forEach( function( doc ){
                tags.push.apply( tags, doc.tags );
            } );

            tags.forEach( function( tag ){
                buffer[ tag ] = ~~buffer[tag] + 1;
            } );

            req.data.getTags = XObject.keys( buffer ).sort( function( a, b ){
                return buffer[a] < buffer[b];
            } );

            Cache.save( "/data/getTags", req.data.getTags );
            next();
        } );

    } );

};

/*Side.TagsSnak = function( tags ){
    var 
        html   = "",
        buffer = {}
    ;
    tags = tags || [];
    tags.forEach( function( tag ){
        buffer[tag] = ~~buffer[tag] + 1;
    } );
    tags = XObject.keys( buffer );
    tags.sort( function( a ){ b }{
        return buffer[ a ] > buffer [ b ];
    } );


    return html;
};
*/
