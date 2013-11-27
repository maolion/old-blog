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


Define( "InfoList", Depend( "~/Cox/UI/Dom", "~/Cox/Utils", "./MAjax", "./MessageBox", "./MessageView", "./ReplyInput", "./ManagePanel" ), function( require, InfoList, module ){
    var 
        DAY         = 24*60*60*1000,
        YEAR        = DAY*365,
        Dom         = require( "Dom" ),
        Utils       = require( "Utils" ),
        MsgBox      = require( "MessageBox" ),
        MAjax       = require( "MAjax" ),
        ManagePanel = require( "ManagePanel" ),
        MessageView = require( "MessageView" ),
        ReplyInput  = require( "ReplyInput" ),
        Info        = null,
        Message     = null,
        Comment     = null
    ;

    Info = Class( "Info", Abstract, Extends( Cox.EventSource ), function( Static, Public ){

        Public.constructor = XFunction( Dom.XDom, Function, function( warp, appendHandler ){
            var _this = this;
            this.Super( "constructor" );
            this.dispatchEvent(
                new Cox.Event( "load" ),
                new Cox.Event( "remove" ),
                new Cox.Event( "show" ),
                new Cox.Event( "hide" )
            );
            this.cpage         = 1;
            this.warp          = warp;
            this.table         = warp.find( ".list-table" ).get(0);
            this.tip           = warp.find( "span.tip" );
            this.appendHandler = appendHandler;
            warp.find( ".delete-all" ).on( "click", function(){
                var ids = [];
                XList.forEach( Dom.query( "input[type=checkbox]", _this.table ), function( sel ){
                    sel.checked && ids.push( sel.value );
                } );
                if( ids.length === 0 ){
                    return;
                }
                _this.remove( ids );
            } );

            warp.find( ".refresh" ).on( "click",  XFunction.bind( this.refresh, this ) );
            warp.find( ".prev" ).on( "click", XFunction.bind( this.prevPage, this ) );
            warp.find( ".next" ).on( "click", XFunction.bind( this.nextPage, this ) );
            this.once( "show", function(){
                _this.refresh();
            } );
        } );
        
        Public.remove = XFunction( String, Array, function( uri, ids ){
            var _this = this;
            return MsgBox.confirm( "确定要删除这些信息吗？", function( ok ){
                if( !ok ){
                    return;
                }
                MAjax.get( uri, { ids : ids }, function( data ){
                    _this.fireEvent( "remove", [ data ] );
                    _this.refresh();
                } );
            } );
        } );

        Public.query = XFunction( String, Number, function( uri, page ){
            var _this = this;
            return MAjax.get( uri, { page : Math.max( ~~page, 1 ) }, function( data ){
                data        = data.data;
                _this.cpage = data.page;

                for( var i = _this.table.rows.length; i--;  ){
                    _this.table.deleteRow( i );
                }

                _this.tip.html( XString.format(
                    "{0}/{1} {2}条信息 耗时 {3}s",
                    data.page,
                    data.pageCount,
                    data.count,
                    data.time / 1000
                ) );
                _this.appendHandler( _this.table, data.infos );
                _this.fireEvent( "load", [ data ] );
            } );
        } );

        Public.nextPage = function(){
            this.query( this.cpage + 1 );
        };

        Public.prevPage = function(){
            this.query( this.cpage - 1 || 1 );
        };
        
        Public.refresh = function(){
            this.query( this.cpage );
        };

        Public.show = function(){
            this.warp.show();
            this.fireEvent( "show", [] );
        };

        Public.hide = function(){
            this.warp.hide();
            this.fireEvent( "hide", [] );
        };
    } );
    

    Message = Class( "Message", Single, Extends( Info ), function( Static, Public ){
        function appendToMessageList( table, messages ){
            XList.forEach( messages, function( message ){
                var
                    row  = table.insertRow( table.rows.length ),
                    cell = null,
                    now  = new Date(),
                    date = new Date( message.adate )
                ;
                cell           = row.insertCell(0);
                cell.innerHTML = '<input class="delitem" type="checkbox" value="'+ message.id +'" />';
                cell.width     = "2.5%";

                Dom.on( Dom.query( "input", cell )[0], "click", function( event ){
                    Dom.stopEventBubble( event );
                } );

                cell           = row.insertCell(1);
                cell.width     = "25%";
                cell.innerHTML = XString.format(
                    '<a target="_blank" href="{0}" title="{1}" >{1}</a>({2})',
                    message.website || "#",
                    message.name,
                    message.email
                );
                cell           = row.insertCell(2);
                cell.width     = "52.5%";
                cell.innerHTML = message.content.slice( 0, 30 ) + ( message.content.length > 30 ? "..." : "" );
                cell           = row.insertCell(3);
                cell.width     = "15%";
                date.format    = now - date > YEAR ? "%Y/" : "";
                date.format   += now-date > DAY || now.getHours() < date.getHours() ? "%M/%D " : "";
                date.format   += "%H:%I";
                cell.innerHTML = Utils.dateFormat( date, date.format );
                cell.title     = Utils.dateFormat( date, "%Y/%M/%D %H:%I:%S" );
                cell           = row.insertCell(4);
                cell.width     = "5%";
                cell.innerHTML = '<button title="删除" class="amd-btn remove" ></button>';
                Dom.on( Dom.query( "button.remove", cell )[0], "click", function( event ){
                    Dom.stopEventBubble( event );
                    Message.remove( [ message.id ] );
                } );
                Dom.on( row, "click", function( event ){
                    MessageView.show( message );
                } );
            } );
        }

        Public.constructor = function(){
            this.Super( "constructor", Dom( "#message-list" ), appendToMessageList );
        };

        Public.remove = XFunction( Array, function( ids ){
            return this.Super( "remove", "/manage/deleteMessage", ids );
        } );

        Public.query = XFunction( Number, function( page ){
            return this.Super( "query", "/manage/queryMessages", page );
        } );
    } ).getInstance();
    
    Comment = Class( "Comment", Single, Extends( Info ), function( Static, Public ){
        function appendToCommentList( table, comments ){
            XList.forEach( comments, function( comment ){
                var 
                    row  = table.insertRow( table.rows.length ),
                    cell = null,
                    now  = new Date(),
                    date = new Date( comment.adate )
                ;

                cell           = row.insertCell(0);
                cell.innerHTML = '<input class="delitem" type="checkbox" value="'+ comment.id + "," + comment.commentid + "," + comment.category +'" />';
                cell.width     = "2.5%";

                Dom.on( Dom.query( "td, input", row )[0], "click", function( event ){
                    Dom.stopEventBubble( event );
                } );

                cell           = row.insertCell(1);
                cell.width     = "20%";
                cell.innerHTML = XString.format(
                    '<a target="_blank" href="{0}" title="{1}" >{1}</a>' + ( comment.category === "reply" ? ' 回复 <a target="_blank" title="{2}" href="{3}">{2}</a>' : "" ) ,
                    comment.website || "###",
                    comment.name,
                    comment.at,
                    comment.atwebsite || "###"
                );

                cell           = row.insertCell(2);
                cell.width     = "22.5%";
                cell.innerHTML = XString.format( 
                    '<a target="_blank" href="/blog/articles{0}">{1}</a>',
                    comment.postlink,
                    comment.posttitle.substr( 0, 20 ) + ( comment.posttitle.length > 20 ? "..." : "" )
                );

                cell           = row.insertCell(3);
                cell.width     = "40%";
                cell.innerHTML = comment.content.substr( 0, 30 ) + ( comment.content.length > 30 ? "..." : "" );

                cell           = row.insertCell(4);
                cell.width     = "10%";
                date.format    = now - date > YEAR ? "%Y/" : "";
                date.format   += now-date > DAY || now.getHours() < date.getHours() ? "%M/%D " : "";
                date.format   += "%H:%I";
                cell.innerHTML = Utils.dateFormat( date, date.format );
                cell.title     = Utils.dateFormat( date, "%Y/%M/%D %H:%I:%S" );
                
                cell           = row.insertCell(5);
                cell.width     = "5%";
                cell.innerHTML = '<button title="删除" class="amd-btn remove" ></button>';
                
                Dom.on( Dom.query( "button.remove", cell )[0], "click", function( event ){
                    Dom.stopEventBubble( event );
                    Comment.remove( [ comment.id + "," + comment.commentid + "," + comment.category  ] );
                } );

                Dom.on( row, "click", function( event ){
                    ReplyInput.show( comment );
                } );
            } );
        }

        Public.constructor = function(){
            this.Super( "constructor", Dom( "#comment-list" ), appendToCommentList );
            ReplyInput.on( "done", function(){
                Comment.refresh();
            } );
        };

        Public.remove = XFunction( Array, function( ids ){
            return this.Super( "remove", "/manage/deleteComment", ids );
        } );

        Public.query = XFunction( Number, function( page ){
            return this.Super( "query", "/manage/queryComment", page );
        } );        

    } ).getInstance();

    InfoList = module.exports = Class( "InfoList", Single, Extends( ManagePanel ), function( Static, Public ){
        var warp = Dom( "#info" );
        Public.constructor = function(){
            var 
                message_btn = Dom( "#info .navbar .btn-list li.message" ),
                comment_btn = Dom( "#info .navbar .btn-list li.comment" )
            ;
            this.Super( "constructor", warp );

            message_btn.on( "click", function(){
                message_btn.addClass( "action" );
                comment_btn.removeClass( "action" );
                Message.show();
                Comment.hide();
            } );
            comment_btn.on( "click", function(){
                comment_btn.addClass( "action" );
                message_btn.removeClass( "action" );
                Comment.show();
                Message.hide();
            } );

            message_btn.addClass( "action" );
            Message.show();
        };
    } ).getInstance();

} );