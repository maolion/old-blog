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


Define( "FriendEditor", Depend( "~/Cox/UI/Dom", "~/Cox/Utils", "./MAjax", "./Dialog" ), function( require, FriendEditor, module ){
    var 
        Dom    = require( "Dom" ),
        Utils  = require( "Utils" ),
        MAjax  = require( "MAjax" ),
        Dialog = require( "Dialog" )
    ;

    FriendEditor = module.exports = Class( "FriendEditor", Single, Extends( Dialog ), function( Static, Public ){
        Public.constructor = function(){
            this.Super( "constructor", "友情连接" );
            this.dispatchEvent( 
                new Cox.Event( "done" )
            );
            this.container = Dom( "#friend-editor" );
            this.form      = this.container.find( "form" ).get(0);
            this.adate     = this.container.find( "span.adate" );
            this.author    = this.container.find( "input[name=author]" ).get(0);
            this.title     = this.container.find( "input[name=title]" ).get(0);
            this.URL       = this.container.find( "input[name=URL]" ).get(0);
            this.summary   = this.container.find( "textarea[name=summary]" ).get(0);
            this.id        = this.container.find( "input[name=id]" ).get(0);
            this.container.find( "button.cancel" ).on( 'click', function(){
                FriendEditor.hide();
            } );

            this.container.find( "button.ok" ).on( "click", function(){
                if( !FriendEditor.author.value ){
                    FriendEditor.author.focus();
                    return;
                }
                if( !FriendEditor.title.value ){
                    FriendEditor.focus();
                    return;
                }
                if( !FriendEditor.URL.value ){
                    FriendEditor.focus();
                    return;
                }
                MAjax.submitForm( FriendEditor.id.value ? "/manage/updateFriendLink" : "/manage/addFriendLink", FriendEditor.form, function( data ){
                    FriendEditor.hide( function(){
                        FriendEditor.fireEvent( "done", [ data ] );
                    } );
                } );
            } );
        };
        
        Public.init = XFunction( Optional( Object, {} ), function( link ){
            this.adate.html( link.adate ? "添加于: " + Utils.dateFormat( new Date( link.adate ), "%Y/%M/%D %H:%I:%S" ) : "" );
            this.author.value  = link.author || "";
            this.title.value   = link.title || "";
            this.URL.value     = link.url || "";
            this.summary.value = link.summary || "";
            this.id.value      = link._id || "";
        } );

        Public.add = function(){
            FriendEditor.init();
            FriendEditor.show();
        };

        Public.modify = XFunction( Object, function( link ){
            FriendEditor.init( link );
            FriendEditor.show();
        } );

        Public.panel = function( panel ){
            panel.html( [
            '<div id="friend-editor">',
            '   <span class="adate" ></span>',
            '   <form method="post" >',
            '       <input name="author" type="text" placeholder="作者" />',
            '       <input name="title" type="text" placeholder="标题" />',
            '       <input name="URL" type="text" placeholder="URL" />',
            '       <textarea name="summary" placeholder="介绍" ></textarea>',
            '       <input type="hidden" name="id" />',
            '   </form>',
            '   <footer>',
            '       <button class="button ok">添加</button>',
            '       <button class="button cancel">取消</button>',
            '   </footer>',
            '</div>'
            ].join( "\n" ) );
        };
    } ).getInstance();
} );