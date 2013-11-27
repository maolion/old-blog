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


Define( "Comment", Depend( "~/Cox/UI/Dom", "~/Cox/Env", "~/Cox/Utils", "~/Cox/Net/Cookies", "~/Cox/Net/Ajax" ), function( require ){
    var 
        COOKIE_MAX_AGE = 31536000000,
        Env            = require( "Env" ),
        Dom            = require( "Dom"),
        Utils          = require( "Utils" ),
        Ajax           = require( "Ajax" ),
        Cookies        = require( "Cookies" ),
        form           = Dom( "#comment-form" ),
        tip            = form.find( "span.tip" ),
        visitInfo      = Dom( "#visit-info" ),
        textarea       = Dom( "#comment-form textarea[name=content]" ),
        init_height    = parseInt( textarea.css( "height" ) ),
        submit_btn     = Dom.query( "#comment-form input[type=submit]" )[0],
        footer         = Dom( "section.comments>footer" ),
        formWarp       = Dom( "section.comments section.form" ),
        postid         = Dom.query( "#comment-form input[name=postid]" )[0].value,
        commentTemple1 = [
        '<section id="{5}" class="comment-block" >',
        '    <a class="avatar-warp" href="{0}"><img alt={2} src="{1}" class="avatar" /></a>',
        '    <div class="warp separate-line-after" >',
        '        <header><a title="{2}" href="{0}">{2}</a> :</header>',
        '        <div class="content" >{3}</div>',
        '        <footer>',
        '            <span>{4}</span>',
        '            <button id="{8}" class="reply-btn" >回复</button>',
        '        </footer>',
        '    </div>',
        '</section>'
        ].join( "\n" ),
        commentTemple2 = [
        '<section id="{5}" class="comment-block" >',
        '    <a class="avatar-warp" href="{0}"><img alt={2} src="{1}" class="avatar" /></a>',
        '    <div class="warp separate-line-after" >',
        '        <header><a title="{2}" href="{0}">{2}</a> 回复 <a href="{6}" title="{7}">{6}</a> :</header>',
        '        <div class="content" >{3}</div>',
        '        <footer>',
        '            <span>{4}</span>',
        '            <button id="{8}" class="reply-btn" >回复</button>',
        '        </footer>',
        '    </div>',
        '</section>'
        ].join( "\n" )
    ;

    form.name      = form.find( "input[name=name]" ).get(0);
    form.email     = form.find( "input[name=email]" ).get(0);
    form.website   = form.find( "input[name=website]" ).get(0);
    form.content   = form.find( "textarea[name=content]" ).get(0);
    form.postid    = form.find( "input[name=postid]" ).get(0);
    form.commentid = form.find( "input[name=commentid]" ).get(0);
    form.at        = form.find( "input[name=at]" ).get(0);
    form.atwebsite = form.find( "input[name=atwebsite]" ).get(0);
    form.atemail   = form.find( "input[name=atemail]" ).get(0);
    Dom( "#comment-form>a.avatar-warp" ).on( "click", function( event ){
        visitInfo.toggleClass( "show" );
    } );

    function textareaResize(){
        this.style.height = init_height + "px";
        if( this.scrollHeight > this.offsetHeight + 2 ){
            this.style.height = this.scrollHeight + 2 + "px";
        }else{
            this.style.height = init_height + ( window.chrome ? 4 : 0 ) + "px";
        }
    }

    function resetForm( event ){
        event && Dom.stopEventDefault( event );
        tip.html( "" );
        form.content.value   = "";
        form.at.value        = "";
        form.atwebsite.value = "";
        form.commentid.value = "";
        form.atemail.value   = "";
        textareaResize.call( form.content );
        formWarp.append( form );
    }

    textarea.on( "input", textareaResize );
    Env.name === "ie" && textarea.on( "keydown", textareaResize );

    form.find( "input[type=reset]" ).on( "click", resetForm );

    form.on( "submit", function( event ){
        var 
            content    = null,
            formdata   = null,
            cookie_age = new Date
        ;
        Dom.stopEventDefault( event );
        if( XString.trim( form.name.value ) === "" ){
            alert( "请输入您的呢称." );
            form.name.value = "";
            if( !Dom.containersClass( visitInfo.get(0), "show" ) ){
                visitInfo.toggleClass( "show", true );
                form.name.focus();
            }
            return;
        }

        if( form.content.value === "" ){
            alert( "请输入评论内容" );
            form.content.focus();
            return;
        }

        cookie_age.setTime( cookie_age.getTime() + COOKIE_MAX_AGE );

        if( Cookies.get( "visitName" ) !== form.name.value 
         || Cookies.get( "visitEmail" ) !== form.email.value
         || Cookies.get( "visitWebsite" ) !== form.website.value
        ){
            Cookies.set( "visitName", XString.trim( form.name.value ), cookie_age, "/" );
            Cookies.set( "visitEmail", XString.trim( form.email.value ), cookie_age, "/" );
            Cookies.set( "visitWebsite", XString.trim( form.website.value ), cookie_age, "/" );
        }

        visitInfo.toggleClass( "show", false );
        submit_btn.disabled = true;
        submit_btn.value    = "提交中...";
        formdata = new Ajax.FormData( form.get(0) );
        content  = form.content.value;
        content  = content.replace( /</g, "&lt;" ).replace( />/g, "&gt;" );
        content  = content.replace( /\r?\n/g, "<br />" );
        formdata.append( "content", content, true );
        tip.html( "稍后..." );
        Ajax.submitForm( 
            form.commentid.value ? "/reply" : "/comment", "json", formdata,
            function( data ){
                var 
                    warp = null,
                    html = null,
                    id   = null
                ;
                submit_btn.disabled = false;
                submit_btn.value    = "提交";

                if( data.state !== "ok" ){
                    alert( data.message );
                    tip.html( "提交失败" );
                    return;
                }
                data = data.data;
                Dom( "section.comments section.none" ).hide();
                Dom( "section.form img.avatar" ).attr( "src", data.avatar );
                Cookies.set( "visitAvatar", data.avatar, cookie_age, "/" );
                //warp = form.commentid ? Dom( form.commentid ) : formWarp;
                html = XString.format( 
                    form.at.value ? commentTemple2 : commentTemple1,
                    form.website.value || "###",
                    data.avatar,
                    form.name.value,
                    content,
                    Utils.dateFormat( new Date( data.adate ), "%Y/%M/%D %H:%I" ),
                    data.commentid,
                    form.at.value,
                    form.atwebsite.value,
                    id = Utils.UID( "REPLYBTN" )
                );
                if( form.commentid.value ){
                    Dom( "#"+form.commentid.value ).append( html );
                }else{
                    formWarp.after( html );
                }
                setupReplyBtn( 
                    id,
                    data.commentid, 
                    form.name.value, 
                    form.website.value, 
                    form.email.value 
                );
                resetForm();        
            },
            function(){
                tip.html( "提交失败" );
                submit_btn.value    = "提交";
                submit_btn.disabled = false;
                alert( "向服务器发送请求失败！" );
            }
        );
    } );
    
    footer.none = footer.find( ".none" );
    footer.more = footer.find( ".more" );
    footer.wait = footer.find( ".wait" );
    footer.all  = footer.find( ".none, .more, .wait, .retry" );
    footer.more.on( "click", function( event ){
        pullComments();
    } );
    footer.tip = function( type ){
        footer.show();
        footer.all.hide();
        footer[type].show();
    };


    function pullComments(){
        Dom( "section.comments section.none" ).hide();
        var skip = Dom.query( "section.comment-block" ).length;
        footer.tip( "wait" );
        Ajax.get( 
            "/comments?_n=" + Utils.UID(), "json", { postid : postid, skip : skip }, 
            function( data ){
                footer.tip( "more" );
                if( data.state !== "ok" ){
                    alert( data.message );
                    return;
                }
                if( data.comments.length === 0 ){
                    if( skip === 0 ){
                        footer.hide();
                        Dom( "section.comments section.none" ).show();
                    }else{
                        footer.tip( "none" );
                    }
                    return;
                }
                XList.forEach( data.comments, function( comment ){
                    var 
                        commentBlock = null,
                        btnid        = null
                    ;
                    footer.before( XString.format( 
                        commentTemple1,
                        comment.website || "###",
                        comment.avatar,
                        comment.name,
                        comment.content,
                        Utils.dateFormat( new Date( comment.adate ), "%Y/%M/%D %H:%I" ),
                        comment._id,
                        "",
                        "",
                        btnid = Utils.UID( "REPLYBTN" )
                    ) );
                    commentBlock = Dom( "#" + comment._id );
                    setupReplyBtn( 
                        btnid,
                        comment._id, 
                        comment.name, 
                        comment.website, 
                        comment.email
                    );
                    XList.forEach( comment.replys, function( reply ){
                        commentBlock.append( XString.format( 
                            commentTemple2,
                            reply.website || "###",
                            reply.avatar,
                            reply.name,
                            reply.content,
                            Utils.dateFormat( new Date( reply.adate ), "%Y/%M/%D %H:%I" ),
                            reply._id,
                            reply.at,
                            reply.atwebsite,
                            btnid = Utils.UID( "REPLYBTN" )
                        ) );
                        setupReplyBtn( 
                            btnid,
                            comment._id, 
                            reply.name, 
                            reply.website, 
                            reply.email
                        );
                    } );
                    //setupReplyBtn( comment._id, comment.name, comment.website || "#" );
                } );
            },
            function(){
                alert( "向服务器发送请求失败！" );
                footer.tip( "show" );
            }
        )
    }
    pullComments();

    function setupReplyBtn( btnid, cid, at, atwebsite, atemail ){
        var commentBlock = Dom( "#" + cid );
        Dom( "#"+btnid ).on( "click", function(){
            Dom.stopEventDefault( event );
            form.commentid.value = cid;
            commentBlock.append( form );
            tip.html( '回复 <a target="_blank" href="'+ atwebsite +'">'+ at +'</a>' );
            form.at.value        = at;
            form.atwebsite.value = atwebsite;
            form.atemail.value   = atemail;
            form.content.focus();
            Dom.scrollTo( 0, form.offset().y - 100 );
        } );
    }
} );

