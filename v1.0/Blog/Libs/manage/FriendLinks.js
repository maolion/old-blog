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


Define( "FriendLinks", Depend( "~/Cox/UI/Dom", "./MessageBox", "./MAjax", "./ManagePanel", "./FriendEditor" ), function( require, FriendLinks, module ){
    var 
        Dom         = require( "Dom" ),
        MsgBox      = require( "MessageBox" ),
        MAjax       = require( "MAjax" ),
        ManagePanel = require( "ManagePanel" ),
        FriendEditor = require( "FriendEditor" )
    ;

    FriendLinks = module.exports = Class( "FriendLinks", Single, Extends( ManagePanel ), function( Static, Public ){
        var 
            warp  = Dom( "#friend" ),
            table = warp.find( "tbody.list-table" ).get(0)
        ;

        function append( links ){
            XList.forEach( links, function( link ){
                var 
                    row  = table.insertRow( table.rows.length ),
                    cell = null;
                ;

                cell = row.insertCell( 0 );
                cell.innerHTML = table.rows.length - 1;

                cell = row.insertCell( 1 );
                cell.innerHTML = link.title;

                cell = row.insertCell( 2 );
                cell.innerHTML = XString.format( 
                    '<a target="_blank" href="{0}" title="{0}" >{0}</a>',
                    link.url
                );

                cell = row.insertCell( 3 );
                cell.innerHTML = link.author;

                cell = row.insertCell( 4 );
                cell.innerHTML = '<input type="checkbox" '+ ( link.state ? "checked" : "" ) +' />';
                Dom.on( Dom.query( "input", cell )[0], "click", function(){
                    var _this = this;
                    MAjax.get( "/manage/updateFriendLinkState", { id : link._id, state : ~~this.checked } );
                } );

                cell = row.insertCell( 5 );
                cell.innerHTML = '<button class="amd-btn modify" ></button> <button class="amd-btn remove"></button>';
                Dom.on( Dom.query( "button.modify", cell )[0], "click", function(){
                    FriendEditor.modify( link );
                } );
                Dom.on( Dom.query( "button.remove", cell )[0], "click", function(){
                    FriendLinks.remove( link._id );
                } );
            } );
        }

        Public.constructor = function(){
            this.Super( "constructor", warp );
            this.dispatchEvent( 
                new Cox.Event( "load" )
            );
            warp.find( "button.add" ).on( "click", function(){
                FriendEditor.add();
            } );
            warp.find( "button.refresh" ).on( "click", this.refresh );
            this.once( "show", this.refresh );
            FriendEditor.on( "done", this.refresh );
        };

        Public.remove = XFunction( String, function( id ){
            MsgBox.confirm( "确定要删除该记录吗？", function( ok ){
                ok && MAjax.get( "/manage/removeFriendLink", { id : id }, FriendLinks.refresh );
            } )
        } );

        Public.refresh = function(){
            for( var i = table.rows.length-1; i > 0; i-- ){
                table.deleteRow( i );
            }
            MAjax.get( "/manage/getFriendLinks", function( data ){
                append( data.friends );
                FriendLinks.fireEvent( "load", [ data ] );
            } );
        };
    } ).getInstance();
} );