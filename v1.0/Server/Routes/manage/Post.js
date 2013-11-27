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
    Path             = require( "path" ),
    Fs               = require( "fs" ),
    RTLog            = require( "../../Libs/Log" ),
    Utils            = require( "../../Libs/Utils" ),
    Cache            = require( "../../Libs/Cache" ),
    SHParse          = require( "../../Libs/SHParse" ),
    Posts            = require( "../../Models/Posts" ),
    Categories       = require( "../../Models/Categories" ),
    Comments         = require( "../../Models/Comments" )
    MIME             = require( Path.join( Cox.Modules.getRoot( "Cox" ), "MIME" ) ),
    Markdown         = require( "markdown-js" ),
    CACHE_ROOT       = Path.join( Server.APP_ROOT, Server.CONFIG.cache.root ),
    ARTICLE_ROOT     = Path.join( Server.APP_ROOT, "./Blog/annexs/" ),
    MORE_LINK_TEMPLE = '<a title="查看详细" href="{0}">...</a>',
    RE_QUERY         = /^(?:(all|public|draft):\s*)?(?:#([^#]+)#)?(.*)?$/i,
    RE_SPLIT1        = /\s*;\s*/,
    RE_SPLIT2        = /\s+/,
    ObjectId         = Posts.constructor.OID
;
Server.post( "/manage/addAnnex", function( req, res ){
    var annex = req.files.annex;
    RTLog.log( "附件[" + annex.name + "]上传到服务器" );
    Fs.rename( 
        annex.path, Path.join( CACHE_ROOT, annex.name ),
        function( err ){
            if( err ){
                res.send( {
                    state   : "fail",
                    message : "附件上传失败"
                } );
                return;
            }
        
            res.send( {
                state    : "ok",
                link     : "",
                size     : annex.size,
                ext      : MIME.get( annex.type ),
                filename : annex.name
            } );
        } 
    )
} );

Server.get( "/manage/removeAnnex", function( req, res ){
    var 
        link     = unescape( req.query.link ),
        filename = unescape( req.query.filename ),
        category = unescape( req.query.category ),
        path     = link ? Path.join( ARTICLE_ROOT, category, link, filename ) 
                        : Path.join( CACHE_ROOT, filename )
    ;

    Fs.unlink( path, function( err ){
        if( err ){
            RTLog.log( "无法将附件[" + path + "]删除" );
            res.send( {
                state   : "fail",
                message : "删除附件失败"
            } );
        }else{
            RTLog.log( "在[" + ( link ? link : "缓存" ) + "]中的附件[" + filename + "]被删除" )
            res.send( {
                state   : "ok",
                message : ""
            } );
        }
    } );
} );


Server.post( "/manage/removeTempAnnex", function( req, res ){
    var 
        caches  = req.body.caches,
        removers = []
    ;

    caches.forEach( function( filename ){
        var 
            remover = new Deferred,
            path    = Path.join( CACHE_ROOT, filename )
        ;
        Fs.unlink( path, function( err ){
            if( err ){
                RTLog.log( "无法将附件[" + path + "]删除" );
                remover.rejected();
            }else{
                RTLog.log( "在[缓存]中的附件[" + filename + "]被删除" );
                remover.resolved();
            }
        } );
        removers.push( remover );
    } );
    
    ( new DeferredList( removers ) ).then( 
        function(){
            res.send( {
                state   : "ok",
                message : ""
            } );
        },
        function(){
            res.send( {
                state   : "fail",
                message : "未能将临时附件完全删除"
            } );
        }
    );
} );

Server.mGet( "/manage/queryPost",
    function parseQuery( req, res, next ){
        var 
            query     = XString.trim( unescape( req.query.query ) ),
            query     = query.match( RE_QUERY ),
            condition = {},
            words     = null
        ;
        res.nolog     = true;
        req.startTime = new Date();
        req.condition = condition;
        if( !query ){
            next();
            return;
        }
        if( query[1] 
         && query[1].toLowerCase()
         && query[1] !== "all"
        ){
            condition.state = ~~( query[1] === "public" );
        }

        if( query[2] ){
            condition.category = { $in : query[2].split( RE_SPLIT1 ) };
        }
        if( !query[3] || !( words = XString.trim( query[3] ) ) ){
            next();
            return;
        }
        words = words.split( RE_SPLIT2 );
        
        condition.$or = [
            { title    : new RegExp( words.join("|"), "i" ) },
            { linkname : new RegExp( words.join("|"), "i" ) },
            { tags     : { $in : words } }                        
        ];

        next();
    },
    function getCount( req, res, next ){
        Posts.count( req.condition, function( err, count ){
            if( err ){
                //console.log( err );
                res.send( {
                    state   : "fail",
                    message : "查询文章数据失败"
                } );
                return;
            }
            req.count = count;
            if( count === 0 ){
                res.send( {
                    state   : "ok",
                    message : "",
                    page    : 0,
                    count   : 0,
                    time    :　new Date - req.strtTime
                } );
            }
            next();
        } );
    },
    function find( req, res, next ){
        var 
            count      = req.count,
            LIMIT      = 15,
            PAGE_COUNT = ( ~~( count / LIMIT ) ) + ( count % LIMIT ? 1 : 0 ),
            page       = ~~unescape( req.query.page ) || 1,
            page       = Math.min( page, PAGE_COUNT ),
            skip       = ( page - 1 ) * LIMIT
        ;
        //50 % 10

        Posts.find( req.condition, {
            _id      : true,
            title    : true,
            visits   : true,
            state    : true,
            adate    : true,
            linkname : true,
            category : true
        } ).skip( skip ).limit( LIMIT ).sort( {
            adate : -1
        } ).exec( function( err, docs ){
            if( err ){
                res.send( {
                    state   : "fail",
                    message : "查询文章数据失败"
                } );
                return;
            }
            req.data = {
                state     : "ok",
                message   : "",
                posts     : docs,
                page      : page,
                pageCount : PAGE_COUNT,
                count     : count,
                time      : new Date - req.startTime
            };
            next();
        } );
    },
    function getCommentsCount( req, res, next ){
        //Comments.count( {  } )
        var counts = [];
        req.data.posts.forEach( function( post ){
            var _count = new Deferred;
            counts.push( _count );
            Comments.count( { postid : post._id }, function( err, count ){
                post.comments = ~~count;
                _count.resolved();
            } );
        } );
        (new DeferredList( counts )).done( function(){
            res.send( req.data );
        } );
    }
);

Server.get( "/manage/getPostCount", function( req, res, next ){
    var 
        condition = req.query.condition || {}
    ;
    res.nolog = true;
    XObject.forEach( condition, true, function( v, k ){
        condition[ k ] = unescape( v );
    } );

    Posts.count( condition, function( err, count ){
        if( err ){
            res.send( {
                state   : "fail",
                message : "无法获取文章数量",
            } );
            return;
        }

        res.send( {
            state   : "ok",
            message : "",
            count   : count
        } );
    } );

} );

Server.mGet( "/manage/getPostCounts", 
    function allCount( req, res, next ){
        res.nolog = true;
        req.data  = {
            all       : 0,
            draft     : 0,
            categorys : {}
        };
        Posts.count( {}, function( err, count ){
            if( err ){
                res.send( {
                    state   : "fail",
                    message : "无法获取文章数量"
                } );
                return;
            }
            req.data.all = count;
            next();
        } );
    },
    function draftCount( req, res, next ){
        if( !req.data.all ){
            next();
            return;
        }
        Posts.count( { state : 0 }, function( err, count ){
            if( err ){
                res.send( {
                    state   : "fail",
                    message : "无法获取文章数量"
                } );
                return;
            }
            req.data.draft = count;
            next();
        } );
    },
    function categoryCount( req, res, next ){
        if( !req.data.all ){
            next();
            return;
        }
        Categories.find( {}, function( err, docs ){
            var counts = [];
            if( err ){
                res.send( {
                    state   : 'fail',
                    message : "获取文章数量失败，无法获取分类列表"
                } );
                return;
            }
            if( !docs || docs.length === 0 ){
                next();
                return;
            }
            docs.forEach( function( doc ){
                var count = new Deferred
                counts.push( count );
                Posts.count( { category : doc.name }, function( err, c ){
                    count.resolved( { name : doc.name, count : c || 0 } );
                } );
            } );

            ( new DeferredList( counts ) ).done( function( ok, counts ){
                var categorys = req.data.categorys;
                counts.forEach( function( count ){
                    categorys[ count.name ] = count.count;
                } );
                next();
            } );

        } );
    },
    function send( req, res, next ){
        var data = {
            state   : "ok",
            message : "",
            data    : req.data
        };
        Cache.save( "/manage/getPostCounts", data );
        res.send( data );
    }
);

Server.mGet( "/manage/getPost",  
    function findPost( req, res, next ){
        var id = unescape( req.query.id );
        res.nolog = true;
        Posts.findOne( { _id : id }, function( err, doc ){
            if( doc === null || err ){
                res.send( {
                    state   : "fail",
                    message : "获取文章失败，该记录不存在"
                } ); 
                return;    
            }
            
            req.data = {
                doc : doc
            };

            next();
        } );
    },
    function getAnnexs( req, res, next ){
        var 
            doc    = req.data.doc,
            path   = Path.join( ARTICLE_ROOT, doc.category, doc.linkname ),
            annexs = []
        ;
        Fs.readdir( path, function( err, files ){
            annexs = [];
            req.data.annexs = [];
            if( files.length === 0 ){
                next();
                return;
            }

            files.forEach( function( file ){
                var annex = new Deferred;
                annexs.push( annex );
                Fs.stat( Path.join( path, file ), function( err, stat ){
                    if( err ){
                        RTLog.log( "无法获取[" + Path.join( path, file ) + "]文件信息" );
                        annex.rejected();
                        return;
                    }
                    annex.resolved( {
                        filename : file,
                        link     : doc.linkname,
                        category : doc.category,
                        size     : stat.size,
                        ext      : Path.extname( file ).slice(1)
                    } );

                } );
            } );

            ( new DeferredList( annexs ) ).done( function( ok, annexs ){
                if( !ok ){
                    res.send( {
                        state   : "fail",
                        message : "获取附件失败"
                    } );
                    return;
                }
                req.data.annexs = annexs;
                next();
            } );

        } );
    },
    function( req, res, next ){
        var doc = req.data.doc;
        res.send( {
            state   : "ok",
            message : "",
            data : {
                id         : doc._id,
                title      : doc.title,
                linkname   : doc.linkname,
                originlink : doc.originlink,
                category   : doc.category,
                tags       : doc.tags,
                content    : doc.content,
                state      : doc.state,
                annexs     : req.data.annexs
            }
        } );      
    }
);

Server.mPost( "/manage/updatePost",
    function findPost( req, res, next ){
        req.body.category = req.body.category || "";
        res.nolog = true;
        Posts.findById( req.body.id, function( err, doc ){
            if( !doc ){
                res.send( {
                    state   : "fail",
                    message : "更新失败,记录不存在"
                } );
                return;
            }

            req.data = {
                content : parseContent( req.body.content, Utils.getArticleUrl( doc.category, doc.linkname ) ),
                doc     : doc
            }

            next();
        } );    
    },
    function moveAnnex( req, res, next ){
        var 
            body   = req.body,
            doc    = req.data.doc,
            source = Path.join( ARTICLE_ROOT, doc.category, doc.linkname ),
            dest   = Path.join( ARTICLE_ROOT, body.category, body.linkname )
        ;

        if( source === dest ){
            next();
            return;
        }

        Utils.mkdir( Path.dirname( dest ), function( ok ){
            if( !ok ){
                RTLog.log( "无法创建[" + Path.dirname( dest ) + "]目录" );
                res.send( {
                    state   : "fail",
                    message : "更新文章失败，无法创建附件目录"
                } );
                return;
            }

            Fs.rename( source, dest, function( err ){
                source = source.replace( ARTICLE_ROOT, "" );
                dest   = dest.replace( ARTICLE_ROOT, "" );
                if( err ){
                    RTLog.log( "无法将[" + source +"]中的复制到[" + dest + "]" );
                    res.send( {
                        state   : "fail",
                        message : "更新文章失败, 无法转移附件"
                    } );
                    return;
                }

                next();
            } );
            //Fs.unlink( Path.join( VIEW_ROOT, _doc.category, _doc.linkname + ".html" ) );        

        } );
    },
    function moveTempAnnex( req, res, next ){
        var body = req.body;
        copyAnnexTo( body.caches, body.category, body.linkname ).done( function( ok ){
            if( !ok ){
                res.send( {
                    state   : "fail",
                    message : "更新文章失败,无法将转移临时附件"
                } );
                return;
            }
            next();
        } );
    },
    function fixContentAnnexLink( req, res, next ){
        var body = req.body;
        fixContentAnnexLinks( body.category, body.linkname, req.data.content ).done( function( ok, value ){
            if( !ok ){
                res.send( {
                    state   : "fail",
                    message : "更新文章失败，修复附件链接时发生错误"
                } );
                return;
            }
            req.data.content.summary = value.summary;
            req.data.content.html    = value.html;
            next();
        } );
    },
    function updatePost( req, res, next ){
        var 
            body = req.body,
            doc  = req.data.doc
        ;
        Posts.update( 
            { _id : body.id },
            { $set : {
                title      : body.title,
                linkname   : body.linkname,
                originlink : body.originlink,
                summary    : req.data.content.summary,
                html       : req.data.content.html,
                content    : body.content,
                state      : body.state,
                adate      : ( doc.adate = body.state && !doc.state ? new Date() : doc.adate ),
                mdate      : new Date,
                category   : body.category,
                tags       : XList.unique( body.tags || [] ).filter( function( tag ){
                    return XString.trim( tag )
                } )
            } },
            function( err ){
                if( err ){
                    RTLog.log( "无法完成`posts`集中[" + body.id + "]文档的更新" );
                    res.send( {
                        state   : "fail",
                        message : "更新文章失败",
                    } );
                    return;
                }
                body.atime = doc.adate;
                RTLog.log( "完成`posts`集中[" + body.id + "]文档的更新" );
                removeCache();
                res.send( {
                    state   : "ok",
                    message : "",
                    data    : {
                        id       : body.id,
                        title    : body.title,
                        state    : body.state,
                        adate    : doc.adate,
                        linkname : body.linkname,
                        category : body.category
                    }
                } );
            }
        );        
    }
);

Server.mPost( "/manage/addPost",
    function findPost( req, res, next ){
        var body = req.body;
        body.category = body.category || "";
        res.nolog = true;
        Posts.count( { linkname : body.linkname, category : body.category }, function( err, count ){
            if( count > 0 ){
                res.send( {
                    state   : "fail",
                    message : "添加文章失败, 链接名重复"
                } ); 
                return;    
            }
            next();
        } );
    },
    function moveTempAnnex( req, res, next ){
        var body = req.body;
        copyAnnexTo( body.caches, body.category, body.linkname ).done( function( ok ){
            if( !ok ){
                res.send( {
                    state   : "fail",
                    message : "添加文章失败,无法将转移临时附件"
                } );
                return;
            }
            next();
        } );
    },
    function fixContentAnnexLink( req, res, next ){
        var body = req.body;

        fixContentAnnexLinks( body.category, body.linkname, parseContent( body.content, Utils.getArticleUrl( body.category, body.linkname ) ) ).done( function( ok, value ){
            if( !ok ){
                res.send( {
                    state   : "fail",
                    message : "添加文章失败，修复附件链接时发生错误"
                } );
                return;
            }

            req.data = {
                content : {
                    summary : value.summary,
                    html    : value.html
                }
            }

            next();
        } );
    },
    function createPost( req, res, next ){
        var body = req.body;
        Posts.create( 
            {
                author     : "Joye",
                title      : body.title,
                linkname   : body.linkname,
                originlink : body.originlink,
                summary    : req.data.content.summary, 
                html       : req.data.content.html,
                content    : body.content,
                state      : body.state,
                adate      : new Date,
                category   : body.category,
                tags       : XList.unique( body.tags || [] ).filter( function( tag ){
                    return XString.trim( tag )
                } )
            },
            function( err, doc ){
                if( err ){
                    RTLog.log( "无法向`posts`集中添加新文档" );
                    res.send( {
                        state   : "fail",
                        message : "添加文章失败"
                    } );
                }else{
                    removeCache();
                    RTLog.log( "`post`集中添加了新文档[" + doc._id + "]" );
                    res.send( {
                        state   : "ok",
                        message : "",
                        data    : {
                            id       : doc._id,
                            linkname : body.linkname,
                            category : body.category,
                            adate    : doc.adate
                        }
                    } );
                }
            }
        );
    }
);

Server.get( "/manage/updatePostState", function( req, res, next ){
    var 
        id    = unescape( req.query.id ),
        state = unescape( req.query.state )
    ;
    Posts.update( { _id : id }, { $set : { state : state } }, function( err ){
        if( err ){
            res.send( {
                state   : "fail",
                message : "更新文章状态失败"
            } ); 
            return;
        }
        RTLog.log( "文章[" + id + "]状态被更新" );
        Cache.delete( "/manage/getPostCounts" );
        res.send( {
            state   : "ok",
            message : "",
            data    : {
                id  : id,
                state : state
            }
        } );
    } );
} );


Server.get( "/manage/removePost", function( req, res, next ){
    var id = unescape( req.query.id );
    Posts.findByIdAndRemove( id, function( err, doc ){
        if( err ){
            res.send( {
                state   : "fail",
                message : "删除文章失败"
            } ); 
            return;
        }
        RTLog.log( "文章[" + id + "]被删除" );
        Utils.rmdir( Path.join( ARTICLE_ROOT, doc.category, doc.linkname ) );
        Comments.find( { postid : id } ).remove();
        removeCache();
        res.send( {
            state   : "ok",
            message : "",
            data    : {
                id : id
            }
        } );
    } );
} );

function parseContent( content, link ){
    var _content = _parseContent( content, link );
    if( _content ){
        return _content;
    }
    content = Markdown.parse( content );
    return {
        summary : SHParse.parse( content, { toolbar : false } ),
        html    : SHParse.parse( content )
    };
}

function _parseContent( content, link ){
    var 
        l = content.length,
        s = 0,
        e = 0,
        b = "",
        m = ""
    ;
    while( ( s = content.indexOf( "<summary" ) ) !== -1 ){
        var anchor = null;
        b += content.slice( 0, s );
        content = content.slice( s );
        
        if( ( e = content.indexOf( ">" ) ) === -1 ){
            return null;
        } 
        
        if( e > 8 ){
            anchor = content.slice( 0, e).match( /\ (.+)/ );
            anchor = anchor && XString.trim( anchor[1] );
        }
        
        if( anchor ){
            b += '<a id="'+ anchor +'"></a>';
        }

        content = content.slice( e + 1 );
        e       = content.indexOf( "</summary>" );
        s       = content.indexOf( "<summary" );

        if( e === -1 || ( s > -1 && e > s ) ){
            return null;
        }
        b += content.slice( 0, e );
        m += content.slice( 0, e ) + ( anchor ? 
            XString.format( MORE_LINK_TEMPLE, link + "#" + anchor ) : "" 
        ) + "\n";
        content = content.slice( e + 10 );
    }
    b += content;

    if( ( s = b.indexOf( "<imgsSummary>" ) ) !== -1 ){
        e = b.indexOf( "</imgsSummary>" );
        if( e === -1 || e < s ){
            return null;
        }
        m += '<div class="imgs-summary">' + 
             b.slice( s + 13, e ) + 
             '</div>'
        ;
        b = b.slice( 0, s ) + b.slice( e + 14 );
    }

    return {
        summary :  SHParse.parse( Markdown.parse(m||b), { toolbar : false } ),
        html    :  SHParse.parse( Markdown.parse(b), { toolbar : false } )
    }
}

function copyAnnexTo( annexs, category, link ){
    var 
        copy = new Deferred,
        dir  = Path.join( ARTICLE_ROOT, category, link )
    ;

    Utils.mkdir( dir, function( ok ){
        var moves = null;
        if( !ok ){
            RTLog.log( "无法创建[" + dir + "]目录" );
            copy.rejected();
            return;
        }
        
        if( !annexs || annexs.length === 0 ){
            copy.resolved();
            return;
        }

        moves = [];
        annexs.forEach( function( annex ){
            var 
                move   = new Deferred,
                source = Path.join( CACHE_ROOT, annex ),
                dest   = Path.join( dir, annex )
            ;
            moves.push( move );

            Fs.rename( source, dest, function( err ){
                dest = category + "/" + link;
                if( err ){
                    RTLog.log( "无法将缓存文件" + annex + "]复制到[" + dest + "]" );
                    move.rejected();                    
                    return;
                }

                move.resolved();
                Fs.unlink( source );
            } );
        } );
        ( new DeferredList( moves ) ).done( function( ok ){
            !ok ? copy.rejected() : copy.resolved();
        } );
    } );

    return copy;
}

function fixContentAnnexLinks( category, linkname, content ){
    var 
        summary = content.summary,
        html    = content.html,
        fix     = new Deferred
    ;

    Fs.readdir( Path.join( ARTICLE_ROOT, category, linkname ), function( err, files ){
        var root = null;
        if( err || files.length === 0 ){
            err ? fix.rejected() : fix.resolved( content );
            return;
        }

        root = "/Blog/articles" + ( category ? "/" + category : "" ) + "/"; 
        files.forEach( function( file ){
            var 
                regexp  = new RegExp( '(href|src)\\s*=\\s*(\'|")(?:\\./)?' + file.replace( /\./g, "\\." ) + '\\2', "ig" ),
                newlink = '$1="' + root + linkname + "/" + file + '"'               
            ;
            html = html.replace( regexp, newlink );
            regexp.lastIndex = 0;
            summary = summary.replace( regexp, newlink );
        } );

        fix.resolved( {
            summary : summary,
            html    : html
        } );
    } );

    return fix;
};

function updateArticleView( category, linkname, html ){
    var 
        update = new Deferred
    ;

    Utils.mkdir( Path.join( VIEW_ROOT, category ) ).done( function( ok ){
        var path = null;
        if( !ok ){
            RTLog.log( "无法创建[" + Path.join( VIEW_ROOT, category ) + "]模板目录" );
            update.rejected();
            return;
        }
        Fs.writeFile(
            path = Path.join( VIEW_ROOT, category, linkname + ".html" ),
            html,
            function( err ){
                if( err ){
                    RTLog.log( "无法将文章HTML写入[" + path + "]模块文件" );
                    update.rejected();
                    return;    
                }
                update.resolved();
            }
        );

    } );

    return update;
}



function removeCache(){
    Cache.delete( "/manage/getPostCounts" );    
    Cache.delete( "/data/getTags" );   
    Cache.delete( "/data/getTopPost" );
    Cache.delete( "/data/getHotPost" );
    Cache.delete( "/manage/commentlist" );
    Cache.delete( "/manage/getPostTitle" );
}