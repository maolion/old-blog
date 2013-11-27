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
/*
<section class="comment-block" >
    <div class="warp separate-line-after">
        <header><a href="#">maolion</a></header>
        <div class="content">Hello,world</div>
        <footer>
            <span class="date" >2013/10/03 20:30</span>
            <button class="button reply-btn" >回复</button>
        </footer>
    </div>
    <section class="comment-block" >
        <div class="warp separate-line-after">
            <header><a href="#">maolion</a></header>
            <div class="content">Hello,world</div>
            <footer>
                <span class="date" >2013/10/03 20:30</span>
                <button class="button reply-btn" >回复</button>
            </footer>
        </div>
    </section>
</section>*/

Define( "CommentView", Depend( "~/Cox/Utils", "~/Cox/UI/Dom", "./MAjax", "./Dialog" ), function( require, CommentView, module ){
    var 
        Utils      = require( "Utils" ),
        MAjax      = require( "MAjax" ),
        Dialog     = require( "Dialog" ),
        Dom        = require( "Dom" ),
        ReplyInput = null
    ;


    ReplyInput = Class( "ReplyInput", Single, Extends( Dialog ), function( Static, Public ){
        Public.constructor = function(){
            this.Super( "constructor", "回复评论" );
            this.container = Dom( "#reply-input" );
            this.tip       = this.container.find( "span.tip" );
            this.comment   = this.container.find( "div.comment" );
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
                content = content.replace( /</g, "&lt;" ).replace( />/g, "&gt;" ).replace( /\r?\n/g, "<br />" );
                form.append( "content", content, true );
                MAjax.submitForm( "/reply", form, function( data ){
                    CommentView.fireEvent( "reply", [ data.commentid ] );
                    ReplyInput.hide();
                } );
            } );
        };  

        Public.init = XFunction( Params( String ), function( values ){
            ReplyInput.at.value        = values[0] || "";
            ReplyInput.atemail.value   = values[1] || "";
            ReplyInput.atwebsite.value = values[2] || "";
            ReplyInput.commentid.value = values[3] || "";
            ReplyInput.content.value   = "";
        } );
    
        Public.show = XFunction( String, String, String, String, function( at, atemail, atwebsite, commentid ){
            ReplyInput.init( at, atemail, atwebsite, commentid );
            ReplyInput.tip.html( "回复: " + '<a target="_blank" title="'+ at +'" href="'+ atwebsite +'">'+ at +'</a>' );
            ReplyInput.Super( "show" );
        } );

        Public.panel = function( panel ){
            panel.html( [
            '<div id="reply-input">',
            '   <span class="tip">回复:</span>',
            '   <form method="post" action="" >',
            '       <textarea name="content" ></textarea>',
            '       <input type="hidden" name="name" value="Joye" />',
            '       <input type="hidden" name="email" value="maolion.j@gmail.com" />',
            '       <input type="hidden" name="website" value="/blog" />',
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

    CommentView = module.exports = Class( "CommentView", Single, Extends( Cox.EventSource ), function( Static, Public ){
        var 
            info = Dom( "#info" ),
            warp = Dom( "#info .comment-view" ),
            h1 = Dom( "#info .comment-view>header>h1" ),
            temple1 = [
            '<section id="comment-block{4}" class="comment-block" >',
            '   <div class="warp separate-line-after">',
            '       <header><a href="{0}" title="{1}" target="_blank" >{1}</a></header>',
            '       <div class="content">{2}</div>',
            '       <footer>',
            '           <span class="date">{3}</span>',
            '           <button id="remove-btn{4}" class="button remove-btn">删除</button>',
            '           <button id="reply-btn{4}" class="button reply-btn">回复</button>',
            '       </footer>',
            '   </div>',
            '</section>'
            ].join("\n"),
            temple2 = [
            '<section id="comment-block{4}" class="comment-block" >',
            '   <div class="warp separate-line-after">',
            '       <header><a href="{0}" title="{1}" target="_blank" >{1}</a> 回复 <a href="{5}" title="{6}" target="_blank">{6}</a> </header>',
            '       <div class="content">{2}</div>',
            '       <footer>',
            '           <span class="date">{3}</span>',
            '           <button id="remove-btn{4}" class="button remove-btn">删除</button>',
            '           <button id="reply-btn{4}" class="button reply-btn">回复</button>',
            '       </footer>',
            '   </div>',
            '</section>'
            ].join("\n")
        ;

        function append( comment ){
            var 
                commentblock = null,
                uid          = Utils.UID()
            ;
            warp.append( XString.format(
                temple1,
                comment.website || "###" ,
                comment.name,
                comment.content,
                Utils.dateFormat( new Date(comment.adate), "%Y/%M/%D %H:%I:%S" ),
                uid
            ) );
            commentblock = Dom( "#comment-block" + uid );

            Dom( "#remove-btn" + uid ).on( "click", function(){
                CommentView.fireEvent( "remove", [ comment._id ] )                
            } );
            
            Dom( "#reply-btn" + uid ).on( "click", function(){
                ReplyInput.show( comment.name, comment.email, comment.website, comment._id  );
            } );
            

            XList.forEach( comment.replys || [] , function( reply ){
                var uuid = Utils.UID();
                commentblock.append( XString.format(
                    temple2,
                    reply.website || "###" ,
                    reply.name,
                    reply.content,
                    Utils.dateFormat( new Date(reply.adate), "%Y/%M/%D %H:%I:%S" ),
                    uuid,
                    reply.atwebsite,
                    reply.at
                ) );    
                
                Dom( "#remove-btn" + uuid ).on( "click", function(){
                    CommentView.fireEvent( "remove", [ reply._id + "," + comment._id + ",reply", comment._id, "reply" ] );
                } );
            } );

        };

        Public.constructor = function(){
            this.Super( "constructor" );
            this.dispatchEvent(
                new Cox.Event( "show" ),
                new Cox.Event( "hide" ),
                new Cox.Event( "rely" ),
                new Cox.Event( "remove" )
            );
        }

        Public.clear = function(){
            h1.html("");
            warp.find( "section.comment-block" ).remove();
        };

        Public.setTitle = XFunction( String, String, String, String, function( name, website, title, link ){
            h1.html( XString.format( 
                '<a target="_blank" href="{0}">{1}</a> 对 \"<a target="_blank" href="/blog/articles{2}" title="{3}">{3}</a>\" 的评论:',
                website,
                name,
                link,
                title                                                
            ) );
        } );

        Public.show = function( id ){
            var _this = this;
            this.clear();
            warp.show();
            Dom.scrollTo( 0, warp.offset().y );
            return MAjax.get( "/manage/getComment", { id : id }, function( data ){
                _this.setTitle( 
                    data.comment.name, 
                    data.comment.website, 
                    data.post.title, 
                    data.post.link 
                );
                append( data.comment );
            } );
        };

        Public.hide = function(){
            warp.hide();
            this.fireEvent( "hide", [] );
            this.clear();
            Dom.scrollTo( 0, 0 );
        };

    } ).getInstance();   
} );