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
    RE_YEAR    = /^\d{4}$/,
    Path       = require( "path" ),
    Fs         = require( "fs" ),
    RTLog      = require( "../../Libs/Log" ),
    Utils      = require( "../../Libs/Utils" ),
    Cache      = require( "../../Libs/Cache" ),
    Historys   = require( "../../Models/Historys" ),
    ABOUT_ROOT = Path.join( Server.APP_ROOT, "/Blog/about" )
;

Server.get( "/getHistorys", function( req, res, next ){
    res.nolog = true;
    Historys.find( {} ).sort( { date : -1 } ).exec( function( err, docs ){
        if( err ){
            res.send( {
                state   : "fail",
                message : "获取记事列表失败"
            } );
            return;
        }
        
        var data = {
            state   : "ok",
            message : "",
            data    : {
                historys : docs
            }
        }
        Cache.save( "/getHistorys", data );
        res.send( data );
    } );
} );


Server.get( "/manage/removeHistory", function( req, res, next ){
    var id = req.query.id;
    Historys.findByIdAndRemove( id, function( err ){
        if( err ){
            RTLog.log( "`historys`集中的[" + id + "]无法被删除" );
            res.send( {
                state   : "fail",
                message : ""
            } );
            return;
        }
        RTLog.log( "`historys`集中的["+ id +"]被删除" );
        Cache.delete( "/getHistorys" );
        Utils.rmdir( Path.join( ABOUT_ROOT, id ) );
        res.send( {
            state   : "ok",
            message : "",
            id      : id
        } );
    } );
} );

Server.mPost( "/manage/addHistory",  
    function( req, res, next ){
        Historys.count( { pagename : req.body.pagename }, function( err, count ){
            if( count ){
                res.send( {
                    state   : "fail",
                    message : "提交记事失败，重复的页面名称"
                } );
                return;
            }
            next();
        } );
    },
    function( req, res, next ){
        var 
            body = req.body,
            date = null,
            ny   = null
        ;

        body.date = RE_YEAR.test( body.date ) ? body.date + "/1" : body.date;
        date      = new Date( Date.parse( body.date ) );
        ny        = date.getTime() == new Date( date.getFullYear() + "/1" ).getTime();

        res.nolog = true;
        if( !req.files.contentfile ){
            res.send( {
                state   : 'fail',
                message : "提交记事失败,未设置内容文章"
            } );
            return;
        }

        Historys.create( {
            date     : new Date( Date.parse( body.date ) ),
            pagename : body.pagename,
            label    : body.label,
            summary  : body.summary,
            newyear  : ny,
            filename : req.files.contentfile.name
        }, function( err, doc ){
            if( err ){
                RTLog.log( "无法向`Historys`集添加新文档" );
                res.send( {
                    state : "fail",
                    message : "提交记事失败"
                } );
                return;
            }
            RTLog.log( "成功向`Historys`集添加新文档[" + doc._id + "]" );
            req.data = {
                doc : doc
            };
            next();
        } );
    },
    function( req, res, next ){
        var 
            contentfile = req.files.contentfile,
            path        = null
        ;
        if( contentfile && contentfile.size === 0 ){
            Fs.unlink( contentfile.path );
            req.files.contentfile = null;
            contentfile           = null;
        }
        if( contentfile ){
            var unzip = new Deferred;
            path = Path.join( ABOUT_ROOT, req.data.doc._id.toString(), contentfile.name );
            Utils.mkdir( Path.dirname( path ) ).done( function( ok ){
                if( !ok ){
                    unzip.rejected();
                    return;
                }

                Fs.rename( contentfile.path, path, function( err ){
                    if( err ){
                        unzip.rejected();
                        return;
                    }
                    Utils.unzip( path, Path.dirname( path ) ).done ( function( ok ){
                        ok ? unzip.resolved() : unzip.rejected();
                    } );
                } );    
            } );
            
            unzip.done( function( ok ){
                if( !ok ){
                    Historys.findByIdAndRemove( req.data.doc._id );
                    return res.send( {
                        state   : "fail",
                        message : "添加记事失败，解压内容文件发生异常"
                    } );
                }
                next();
            } );

        }else{
            next();
        }
    },
    function( req, res, next ){
        Fs.exists( Path.join( ABOUT_ROOT, req.data.doc._id.toString(), req.body.pagename + ".js" ), function( exists ){
            if( !exists ){
                Historys.findByIdAndRemove( req.data.doc._id );
                console.log( req.data.doc._id );
                return res.send( {
                    state   : "fail",
                    message : "添加记事失败，未设置内容文件"
                } );
            }
            
            Cache.delete( "/getHistorys" );
            res.send( {
                state   : "ok",
                message : "",
                id      : req.body.id
            } );
        } );
    }
);


Server.mPost( "/manage/updateHistory",  
    function( req, res, next ){
        Historys.count( { _id : { $ne : req.body.id }, pagename : req.body.pagename }, function( err, count ){
            if( count ){
                res.send( {
                    state   : "fail",
                    message : "更新记事失败，重复的页面名称"
                } );
                return;
            }
            next();
        } );
    },
    function( req, res, next ){
        var 
            body = req.body,
            date = null,
            ny   = null
        ;
        body.date = RE_YEAR.test( body.date ) ? body.date + "/1" : body.date;
        date      = new Date( Date.parse( body.date ) );
        ny        = date.getTime() == new Date( date.getFullYear() + "/1" ).getTime();

        res.nolog = true;
        Historys.update( 
            { _id : body.id },
            {
                date     : new Date( Date.parse( body.date ) ),
                pagename : body.pagename,
                label    : body.label,
                summary  : body.summary,
                newyear  : ny,
                filename : req.files.contentfile && req.files.contentfile.name || body.ofilename || ""
            }, 
            function( err, doc ){
                if( err ){
                    RTLog.log( "无法向`Historys`集更新文档" );
                    res.send( {
                        state : "fail",
                        message : "更新记事失败"
                    } );
                    return;
                }
                RTLog.log( "成功向`Historys`集更新文档[" + body.id + "]" );
                next();
            } 
        );
    },
    function( req, res, next ){
        var 
            contentfile = req.files.contentfile,
            path        = null
        ;
        if( contentfile && contentfile.size === 0 ){
            Fs.unlink( contentfile.path );
            req.files.contentfile = null;
            contentfile           = null;
        }
        if( contentfile ){
            var unzip = new Deferred;
            path = Path.join( ABOUT_ROOT, req.body.id.toString(), contentfile.name );
            Utils.rmdir( Path.dirname( path ) ).done( function(){
                Utils.mkdir( Path.dirname( path ) ).done( function( ok ){
                    if( !ok ){
                        unzip.rejected();
                        return;
                    }

                    Fs.rename( contentfile.path, path, function( err ){
                        if( err ){
                            unzip.rejected();
                            return;
                        }
                        Utils.unzip( path, Path.dirname( path ) ).done ( function( ok ){
                            ok ? unzip.resolved() : unzip.rejected();
                        } );
                    } );    
                } );
            } );
            
            unzip.done( function( ok ){
                ok ? next() : res.send( {
                    state   : "fail",
                    message : "更新记事失败，解压内容文件发生异常"
                } );
            } );

        }else{
            next();
        }
    },
    function( req, res, next ){
        console.log( Path.join( ABOUT_ROOT, req.body.id, req.body.pagename + ".js" ) );
        Fs.readdir( Path.join( ABOUT_ROOT, req.body.id ), function( err, files ){
            console.log( files );
        } );
        Fs.exists( Path.join( ABOUT_ROOT, req.body.id, req.body.pagename + ".js" ), function( exists ){
            console.log( arguments );
            if( !exists ){
                return res.send( {
                    state   : "fail",
                    message : "更新记事失败，未设置内容文件"
                } );
            }
            
            Cache.delete( "/getHistorys" );
            res.send( {
                state   : "ok",
                message : "",
                id      : req.body.id
            } );
        } );
    }
);