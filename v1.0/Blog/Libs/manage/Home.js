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


Define( "Home", Depend( "~/Cox/UI/Dom", "./MAjax", "./MessageBox", "./ManagePanel" ), function( require, Home, module ){
    var
        Dom         = require( "Dom" ),
        ManagePanel = require( "ManagePanel" ),
        MAjax       = require( "MAjax" ),
        MsgBox      = require( "MessageBox" )
    ;

    Home = module.exports = Class( "Home", Single, Extends( ManagePanel ), function( Static, Public ){
        var 
            warp = Dom( "#home" ),
            view = Dom( "#home>.view" )
        ;
        Public.constructor = function(){
            this.Super( "constructor", warp );

            this.once( "show", function(){
                Home.refresh();
            } );
            warp.find( "button.refresh" ).on( "click", function(){
                Home.refresh();
            } );
            warp.find( "button.clear-errlog" ).on( "click", function(){
                Home.clearErrorLog();
            } );
            warp.find( "button.clear-rtlog" ).on( "click", function(){
                Home.clearRTLog();
            } );
            warp.find( "button.clear-cache" ).on( "click", function(){
                Home.clearCache();
            } );
        };

        Public.clearErrorLog = function(){
            MsgBox.confirm( "确定要删除[错误日志]吗？", function( ok ){
                ok && MAjax.get( "/manage/clearErrorLog", function(){
                    Home.refresh();
                } );
            } );
        };

        Public.clearRTLog = function(){
            MsgBox.confirm( "确定要删除[运行时日志]吗？", function( ok ){
                ok && MAjax.get( "/manage/clearRTLog" );
            } );
        };
    
        Public.clearCache = function(){
            MsgBox.confirm( "确定要删除[缓存]吗？", function( ok ){
                ok && MAjax.get( "/manage/clearCache" );
            } );
        };
                

        Public.refresh = function(){
            MAjax.get( "/manage/errorlog", function( data ){
                view.html( data.errorlog || '<span class="welcome" >Hello, World</span>' );
            } );
        };

    } ).getInstance();

} );