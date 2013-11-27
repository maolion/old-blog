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

Define( "ReplyInput", Depend( "~/Cox/Utils", "~/Cox/UI/Dom", "./MAjax", "./Dialog" ), function( require, ReplyInput, module ){
    var 
        Utils      = require( "Utils" ),
        MAjax      = require( "MAjax" ),
        Dialog     = require( "Dialog" ),
        Dom        = require( "Dom" ),
        MYINFO     = {
            name    : "Joye",
            email   : "maolion.j@gmail.com",
            website : "/blog"
        }
    ;


    ReplyInput = module.exports = Class( "ReplyInput", Single, Extends( Dialog ), function( Static, Public ){
        Public.constructor = function(){
            this.Super( "constructor", "回复评论" );
            this.dispatchEvent(
                new Cox.Event( "done" )
            );

            this.container = Dom( "#reply-input" );
            this.tip       = this.container.find( "span.tip" );
            this.post      = this.container.find( "span.post" );
            this.view      = this.container.find( "div.comment-view" );
            this.form      = this.container.find( "form" ).get(0);
            this.content   = this.container.find( "textarea" ).get(0);
            this.commentid = this.container.find( "input[name=commentid]" ).get(0);
            this.at        = this.container.find( "input[name=at]" ).get(0);
            this.atemail   = this.container.find( "input[name=atemail]" ).get(0);
            this.atwebsite = this.container.find( "input[name=atwebsite]" ).get(0);
            this.on( "hide", function(){
                ReplyInput.init();
            } );
            this.container.find( "button.cancel" ).on( "click", function(){
                ReplyInput.hide();
            } );

            this.container.find( "button.reply" ).on( "click", function(){
                var 
                    form    = new MAjax.FormData( ReplyInput.form ),
                    content = ReplyInput.content.value
                ;
                if( !content ){
                    ReplyInput.content.focus();
                }
                content = content.replace( /</g, "&lt;" ).replace( />/g, "&gt;" ).replace( /\r?\n/g, "<br />" );
                form.append( "content", content, true );
                MAjax.submitForm( "/reply", form, function( data ){
                    ReplyInput.hide( function(){
                        ReplyInput.fireEvent( "done", [ data.commentid ] );
                    } );
                } );
            } );
        };  

        Public.init = XFunction( Optional( Object, {} ), function( comment ){
            ReplyInput.at.value        = comment.name || "";
            ReplyInput.atemail.value   = comment.email || "";
            ReplyInput.atwebsite.value = comment.website || "";
            ReplyInput.commentid.value = comment.commentid || comment.id || "";
            ReplyInput.view.html( comment.content || "" );
            ReplyInput.content.value   = "";
        } );

        Public.show = XFunction( Object, function( comment ){
            ReplyInput.init( comment );
            ReplyInput.tip.html( XString.format(
                '<a target="_blank" title="{0}" href="{1}">{0}</a>' + ( comment.category === "reply" ? ' 回复 <a href="{2}" title="{3}" target="_blank">{3}</a> :' : " :" ),
                comment.name,
                comment.website,
                comment.atwebsite,
                comment.at
            ) );
            ReplyInput.post.html( XString.format(
                '文章：<a href="/blog/articles{0}" target="_blank" title="{1}" >{1}</a>',
                comment.postlink,
                comment.posttitle
            ) );
            ReplyInput.Super( "show" );
        } );

        Public.panel = function( panel ){
            panel.html( [
            '<div id="reply-input">',
            '   <span class="post separate-line-after">undefined</span>',
            '   <span class="tip"></span>',
            '   <div class="comment-view"></div>',
            '   <form method="post" action="" >',
            '       <textarea name="content" ></textarea>',
            '       <input type="hidden" name="name" value="'+ MYINFO.name +'" />',
            '       <input type="hidden" name="email" value="'+ MYINFO.email +'" />',
            '       <input type="hidden" name="website" value="'+ MYINFO.website +'" />',
            '       <input type="hidden" name="commentid" value="" />',
            '       <input type="hidden" name="at" vlaue="" />',
            '       <input type="hidden" name="atemail" value="" />',
            '       <input type="hidden" name="atwebsite" value="" />',
            '   </form>',
            '   <footer>',
            '       <button class="button reply">回复</button>',
            '       <button class="button cancel">取消</button>',
            '   </footer>',
            '</div>'
            ].join( "\n" ) );
        };
    } ).getInstance();

} );