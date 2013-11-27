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
    FriendLinks = require( "../../Models/FriendLinks" ),
    Cache       = require( "../../Libs/Cache" ),
    Utils       = require( "../../Libs/Utils" ),
    RTLog       = require( "../../Libs/Log" )
;



Server.post( "/manage/addFriendLink", function( req, res, next ){
    var body = req.body;
    res.nolog = true;
    FriendLinks.create( {
        author  : body.author,
        title   : body.title,
        url     : body.URL,
        summary : body.summary,
        state   : 1
    }, function( err, doc ){
        if( err || !doc ){
            RTLog.log( "无法向`FriendLinks`集添加新文档" );
            res.send( {
                state   : "fail",
                message : "添加友情连接信息失败"
            } );
            return;
        }
        RTLog.log( "成功向`FriendLinks`集添加新文档" );
        Cache.delete( "/data/getFriendLinks" );
        res.send( {
            state   : "ok",
            message : "",
            id      : doc._id
        } );
    } );
} );


Server.post( "/manage/updateFriendLink", function( req, res, next ){
    var body = req.body;
    res.nolog=true;
    FriendLinks.update( { _id : req.body.id }, {
        author  : body.author,
        title   : body.title,
        url     : body.URL,
        summary : body.summary
    }, function( err ){
        if( err ){
            RTLog.log( "无法向`FriendLinks`集更新文档" );
            res.send( {
                state   : "fail",
                message : "添加友情连接信息失败"
            } );
            return;
        }

        RTLog.log( "成功向`FriendLinks`集更新文档["+ req.body.id +"]" );
        Cache.delete( "/data/getFriendLinks" );
        res.send( {
            state   : "ok",
            message : ""
        } );
    } );
} );


Server.get( "/manage/updateFriendLinkState", function( req, res, next ){
    var 
        id    = req.query.id,
        state = ~~req.query.state
    ;
    res.nolog = true;
    FriendLinks.update( { _id : id }, { state  : state, }, function( err ){
        if( err ){
            RTLog.log( "无法向`FriendLinks`集更新文档" );
            res.send( {
                state   : "fail",
                message : "添加友情连接信息失败"
            } );
            return;
        }

        RTLog.log( "成功向`FriendLinks`集更新文档["+ id +"]" );
        Cache.delete( "/data/getFriendLinks" );
        res.send( {
            state   : "ok",
            message : ""
        } );
    } );
} );

Server.get( "/manage/removeFriendLink", function( req, res, next ){
    var id = req.query.id;
    res.nolog = true;
    FriendLinks.findByIdAndRemove( id, function( err, ok ){
        if( err || !ok ){
            res.send( {
                state   : "fail",
                message : "无法删除友情连接"
            } );
            return;
        }
        RTLog.log( "成功将`FriendLinks`集中的["+ id +"]文档删除" );
        Cache.delete( "/data/getFriendLinks" );
        res.send( {
            state   : "ok",
            message : ""
        } );
    } );
} );

Server.get( "/manage/getFriendLinks", function( req, res, next ){
    res.nolog=true;
    Cache.get( "/data/getFriendLinks" ).done( function( ok, data ){
        if( ok ){
            res.send( {
                state   : "ok",
                message : "",
                friends : data
            } );
            return;
        }

        FriendLinks.find().sort( { adate : -1 } ).exec( function( err, docs ){
            if( err ){
                res.send( {
                    state   : "fail",
                    message : "获取友情连接列表失败"
                } );
                return;
            }

            Cache.save( "/data/getFriendLinks", docs );
            res.send( {
                state   : "ok",
                message : "",
                friends : docs
            } );
        } );

    } );
} );


