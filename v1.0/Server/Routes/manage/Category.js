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
    Categories = require( "../../Models/Categories" ),
    RTLog      = require( "../../Libs/Log" ),
    Utils      = require( "../../Libs/Utils" ),
    Cache      = require( "../../Libs/Cache" )
;
Server.get( "/manage/addPostCategory", function( req, res, next ){
    var 
        name = unescape( req.query.name )
    ;
    Categories.findOne( { name : name }, function( err, doc ){
        res.nolog = true;
        if( !doc ){
            Categories.create( { name : name }, function( err, doc ){

                if( !err ){
                    RTLog.log( "添加文章分类\""+ name +"\"成功" );
                    Cache.delete( "/getCategorys" );
                    res.send( {
                        state   : "ok",
                        message : doc._id
                    } );
                }else{
                    
                    Utils.errorLog( 
                        "无法向`Categories`集添加数据\n" + 
                        "URL: " +  req.originalUrl,
                        err
                    );
                    res.send( {
                        state   : "fail",
                        message : "无法创建分类名称."
                    } );
                }
            } );
        }else{
            res.send( {
                state   : "fail",
                message : "该分类名称已经被创建."
            } )
        }
    } );
} );

Server.get( "/getCategorys", function( req, res ){
    res.nolog = true;
    Categories.find( function( err, docs ){
        if( err ){
            Utils.errorLog( "无法从`Categories`集中获取数据", err );
            res.send( {
                state   : "fail",
                message : "无法获取分类列表"
            } );
        }else{
            var data = {
                state     : "ok",
                message   : "",
                categorys : []
            };
            docs = docs || [];
            docs.forEach( function( doc ){
                data.categorys.push( doc.name );
            } );
            Cache.save( req.path, data );
            res.send( data );
        }
    } );  
} );

Server.get( "/manage/modifyCategory", function( req, res ){
    res.nolog = true;
    var 
        origin = unescape( req.query.origin ),
        name   = unescape( req.query.name )
    ;
    Categories.update( { name : origin }, { $set : { name : name } }, function( err, doc ){
        if( err ){
            Utils.errorLog( "无法在`Categories`集中更新数据", err );
            res.send( {
                state   : "fail",
                message : "修改分类值失败"
            } );
            return;
        }
        if( !doc ){
            res.send( {
                state   : "fail",
                message : "修改的分类名不存在"
            } );
            return;
        }
        RTLog.log( "文章分类\"" + origin + "\"被修改为\""+ name +"\"" );
        Cache.delete( "/getCategorys" );
        res.send( {
            state    : "ok",
            message  : ""
        } );
    } );    
} );

Server.get( "/manage/removeCategory", function( req, res ){
    var name = unescape( req.query.name );
    res.nolog = true;
    Categories.remove( { name : name }, function( err, doc ){
        if( err ){
            res.send( {
                state   : "fail",
                message : "删除分类失败"
            } );
            return;
        }
        RTLog.log( "文章分类\"" + name + "\"被删除" );
        Cache.delete( "/getCategorys" );
        res.send( {
            state    : "ok",
            message  : ""
        } );
    } );
} );