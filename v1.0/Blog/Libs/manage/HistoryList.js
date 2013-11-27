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


Define( "HistoryList", Depend( "~/Cox/UI/Dom", "~/Cox/Utils", "./MAjax", "./ManagePanel", "./MessageBox", "./HistoryInput" ), function( require, HistoryList, module ){
    var 
        Dom          = require( "Dom" ),
        Utils        = require( "Utils" ),
        ManagePanel  = require( "ManagePanel" ),
        MsgBox       = require( "MessageBox" ),
        MAjax        = require( "MAjax" ),
        HistoryInput = require( "HistoryInput" )
    ;


    HistoryList = module.exports = Class( "HistoryList", Single, Extends( ManagePanel ), function( Static, Public ){
        var 
            warp = Dom( "#about" ),
            temple = [
            '<section class="item {0}" title="{1}" >',
            '   <button class="amd-btn remove" title="删除" ></button>',
            '   <a title="下载内容文件" href="/download/about/{3}" class="amd-btn down" ></a>',
            '   <span class="title">{2}</span>',
            '</section>'
            ].join( "\n" )
        ;
        function append( historys ){
            XList.forEach( historys, function( history ){
                var nsection = null;
                warp.append( XString.format(
                    temple,
                    history.newyear ? "newyear" : "",
                    history.summary,
                    history.label,
                    history._id + "/" + history.filename
                ) );
                nsection = warp.find( "section:last-child" );

                nsection.on( "click", function(){
                    HistoryInput.show( history );
                } );

                nsection.find( ".amd-btn" ).on( "click", function( event ){
                    Dom.stopEventBubble( event );
                } );

                nsection.find( "button.remove" ).on( "click", function( event ){
                    MsgBox.confirm( "确定要删除该项吗？", function( ok ){
                        ok && HistoryList.remove( history._id );
                    } );
                } );
            } );
        };

        Public.constructor = function(){
            this.Super( "constructor", warp );
            
            this.dispatchEvent(
                new Cox.Event( "refresh" ),
                new Cox.Event( "remove" )
            );

            warp.find( "button.add" ).on( "click", function(){
                HistoryInput.show();
            } );

            warp.find( "button.refresh" ).on( "click", function(){
                HistoryList.refresh();
            } );

            this.once( "show", function(){
                HistoryList.refresh();
            } );
            HistoryInput.on( "done", function(){
                HistoryList.refresh();
            } );
        };

        Public.remove = XFunction( String, function( id ){
            MAjax.get( "/manage/removeHistory", { id : id }, function( data ){
                HistoryList.fireEvent( "remove", [ id ] );
                HistoryList.refresh();
            } );
        } );

        Public.refresh = function(){
            MAjax.get( "/getHistorys", function( data ){
                warp.find( "section.item" ).remove();
                append( data.data.historys );
            } );
        };

    } ).getInstance();

} );