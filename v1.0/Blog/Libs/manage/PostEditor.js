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


Define( "PostEditor", Depend( "~/Cox/UI/Dom", "./Utils", "./PostList", "./MAjax", "./Category", "./MessageBox", "./TipBox" ), function( require, PostEditor, module ){
    var 
        RE_TAGS_SPLIT = /\s*;\s*/,
        Dom      = require( "Dom" ),
        Utils    = require( "Utils" ),
        MAjax    = require( "MAjax" ),
        Category = require( "Category" ),
        MsgBox   = require( "MessageBox" ),
        TipBox   = require( "TipBox" ),
        PostList = require( "PostList" )
    ;
    //console.log( module );
    //console.log(  );
    //console.log( PostList );
    PostEditor = Class( "PostEditor", Single, Extends( Cox.EventSource ), function( Static, Public ){
        var 
            Annex            = null,
            editorWarp       = Dom( "#post>div.editor" ),
            editor           = Dom( "#post-editor>form" ),
            postbtn          = Dom.query( "#post-editor>form button.post" )[0],
            FormData         = window.FormData
        ;
        

        Annex = Class( "Annex", Single, Extends( Cox.EventSource ), function( Static, Public ){
            var 
                annexList = Dom( "#annex-list>ul" ),
                uploadBtn = Dom.query( "#annex-list .file-btn .button" )[0],
                uploader  = Dom.query( "#file-uploader-1" )[0],
                annexs    = {},
                caches    = {},
                temple    = [
                    '<li ext="{1}" title="{2}" >',
                    '   <span>{0}</span>',
                    '   <button title="删除" class="amd-btn remove" ></button>',
                    '</li>'
                ].join( "\n" )
            ;

            function appendToAnnexList( newAnnexs ){
                //console.log( newAnnexs );
                XList.forEach( newAnnexs, function( annex ){
                    //console.log( annex );
                    if( annexs.hasOwnProperty( annex.filename ) ){
                        annexs[ annex.filename ].info = annex;
                        return;
                    }
                    annexList.append( XString.format( 
                        temple,
                        annex.filename,
                        annex.ext,
                        annex.filename + "\n" +
                        Utils.byteUnit( annex.size )
                    ) );

                    annexs[ annex.filename ] = {
                        element : Dom( "#annex-list>ul>li:last-child" ),
                        info    : annex
                    };

                    Dom( "#annex-list>ul>li:last-child button.remove" ).on( "click", function( event ){
                        MsgBox.confirm( "确定要将附件[" + annex.filename + "]删除吗?", function( ok ){
                            ok && Annex.remove( annex.filename );
                        } );
                    } );
                } );
            }

            Public.constructor = function(){
                this.Super( "constructor" );
                this.dispatchEvent( 
                    new Cox.Event( "load" ),
                    new Cox.Event( "add" ),
                    new Cox.Event( "remove" ),
                    new Cox.Event( "update" )
                );

                Dom.on( uploader, "change", function(){
                    if( this.files && this.files.length ){
                        var 
                            form = null,
                            xhr  = null
                        ;
                        if( !FormData ){
                            uploader.get(0).value = ""
                            TipBox.error( "该功能在当前浏览器环境中不被支持." );
                            return;
                        }
                        form = new FormData();
                        form.append( "annex", uploader.files[0] );
                        uploader.value     = null;
                        uploader.disabled  = true;
                        uploadBtn.disabled = true;
                        xhr = MAjax.submitForm2( "/manage/addAnnex", form, function( data ){
                            appendToAnnexList( [ data ] );
                            caches[ data.filename ] = data;
                            Annex.fireEvent( "add", [ data ] );
                        } ).xhr;

                        xhr.on( "done", function(){
                            uploader.disabled = false;
                            uploadBtn.disabled = false;
                            uploadBtn.innerHTML = "添加附件";
                        } );

                        xhr.on( "progress", function( event ){
                            if( event.lengthComputable ){
                                uploadBtn.innerHTML = Math.round( event.loaded / event.total * 100 ) + "%";
                            }
                        } );                
                    }
                } );
            };  

            Public.load = function( annexs ){
                appendToAnnexList( annexs );
                Annex.fireEvent( "load", [ annexs ] );
            };

            Public.empty = function(){
                annexList.empty();
                annexs = {};
                caches = {};
            };

            Public.remove = function( filename ){
                var annex = annexs[ filename ];
                if( !annex ){
                    TipBox.error( "该附件不存在" );
                    return;
                }
                MAjax.get( "/manage/removeAnnex", 
                    { 
                        filename : filename,
                        category : annex.info.category,
                        link     : annex.info.link
                    }, 
                    function(){
                        annex.element.remove();
                        delete annexs[ filename ];
                        delete caches[ filename ];
                        Annex.fireEvent( "remove", [ filename ] );
                    } 
                );
            };

            Public.updateInfo = function( link, category ){
                XObject.forEach( annexs, true, function( annex, filename ){
                    delete caches[filename];
                    annex = annex.info;
                    annex.link     = link;
                    annex.category = category;
                } );
                Annex.fireEvent( "update", [ link, category ] );
            };

            Public.removeCache = function(){
                var tempAnnexs = XObject.keys( caches );
                
                if( !tempAnnexs.length ){
                    return;
                }

                MAjax.post( "/manage/removeTempAnnex", { caches : tempAnnexs } );
            };

            Public.getCaches = function(){
                return XObject.keys( caches );
            };

        } ).getInstance();

        function reLoadCategoyList(){
            editor.categorys.options.length = 1;
            XList.forEach( Category.getCategoryList(), function( category ){
                editor.categorys.options.add( new Option(
                    category, category
                ) );
            } );
        }

        Public.constructor = function(){
            this.Super( "constructor" );
            this.dispatchEvent(
                new Cox.Event( "save" ),
                new Cox.Event( "load" ),
                new Cox.Event( "show" ),
                new Cox.Event( "hide" ),
                new Cox.Event( "quit" )
            );
            this._id = "";

            editor.categorys  = Dom.query( "#post-editor select[name=category]" )[0];
            editor.title      = Dom.query( "#post-editor input[name=title]" )[0];
            editor.content    = Dom.query( "#post-editor textarea[name=content]" )[0];
            editor.linkname   = Dom.query( "#post-editor input[name=linkname]" )[0];
            editor.tags       = Dom.query( "#post-editor input[name=tags]" )[0];
            editor.state      = Dom.query( "#post-editor input[name=state]" )[0];
            editor.id         = Dom.query( "#post-editor input[name=id]" )[0];
            editor.originlink = Dom.query( "#post-editor input[name=originlink]" )[0];

            Category.on( "loaded", reLoadCategoyList );
            Category.on( "add", reLoadCategoyList );
            Category.on( "modify", reLoadCategoyList );
            Category.on( "remove", reLoadCategoyList );
            
            Dom.on( postbtn, "click", function( event ){
                Dom.stopEventDefault( event );
                editor.state.value = 1;
                PostEditor.save( function( data ){
                    MsgBox.confirm( "保存成功<br />是否返回到文章列表", function( ok ){
                        ok && PostEditor.hide();
                    } );
                } );
            } );

            Dom( "#post-editor>form button.draft" ).on( "click", function( evnet ){
                Dom.stopEventDefault( event );
                editor.state.value = 0;
                PostEditor.save( function( data ){
                    MsgBox.confirm( "保存成功<br />是否返回到文章列表", function( ok ){
                        ok && PostEditor.hide();
                    } );
                } );
            } );

            Dom( "#post-editor>form button.close" ).on( "click", function( event ){
                Dom.stopEventDefault( event );
                MsgBox.confirm( "是否放弃当前编辑的内容.", function( ok ){
                    if( ok ){
                        PostEditor.fireEvent( "quit", [] );
                        PostEditor.hide();
                    }
                } );
            } );

            this.on( "hide", function(){
                PostEditor.initForm();
            } );

            this.on( "quit", function(){
                Annex.removeCache();
            } );
            this.on( "save", function(){
                Category.computeCount();
            } );
        };

        Public.initForm = function(){
            Annex.empty();
            editor.categorys.value  = "";
            editor.title.value      = "";
            editor.content.value    = "";
            editor.linkname.value   = "";
            editor.tags.value       = "";
            editor.state.value      = 1;
            editor.id.value         = "";
            editor.originlink.value = "";
        };

        Public.show = XFunction( Optional( Object, {} ), function( initValue ){
            editorWarp.show();
            PostEditor.initForm();
            XObject.forEach( initValue, true, function( v, k ){
                editor.hasOwnProperty( k ) && ( editor[ k ].value = v );
            } );
            //console.log( editorWarp.offset() );
            Dom.scrollTo( 0, editorWarp.offset().y, function(){
                PostEditor.fireEvent( "show", [] );
            } );
        } );

        Public.save = XFunction( Optional( Function ), function( callback ){
            var 
                form = null,
                save = null
            ;
            editor.linkname.value = XString.trim( editor.linkname.value );
            editor.tags.value     = XString.trim( editor.tags.value );

            if( editor.content.value === "" 
             || editor.linkname.value === ""
             || editor.title.value === ""
            ){
                MsgBox.alert( "文章标题、内容和连接名不能为空数据！" );
                return;
            }
            form = new MAjax.FormData( editor.get(0) );
            form.append( "caches", Annex.getCaches() );
            form.append( "tags", editor.tags.value.split( RE_TAGS_SPLIT ), true );
            
            MsgBox.wait( "正在保存...", save = MAjax.submitForm( 
                editor.id.value ? "/manage/updatePost" : "/manage/addPost", 
                form, 
                function( data ){
                    data = data.data;
                    editor.id.value = data.id;
                    Annex.updateInfo( data.linkname, data.category );
                    callback && callback( data );
                    PostEditor.fireEvent( "save", [ data ] );
                }
            ) );

            return save;
        } );

        Public.hide = function(){
            //PostEditor.hide();
            editorWarp.hide();
            PostEditor.fireEvent( "hide", [] );
            PostList.show();
        };

        Public.load = XFunction( String, Optional( Function ), function( id, callback ){
            var load = null;
            PostEditor.show();
            MsgBox.wait( "正在加载...", load = MAjax.get( "/manage/getPost?id=" + id, function( data ){
                data = data.data;
                XObject.forEach( data, true, function( value, key ){
                    key in editor && ( editor[key].value = value );
                } );
                editor.categorys.value = data.category;
                editor.tags.value      = data.tags.join( "; " );
                Annex.load( data.annexs );
                callback && callback( data );
                PostEditor.fireEvent( "load", [ data ] );
            } ) );
            return load;
        } );

    } ).getInstance();
    
    module.exports = PostEditor;



} );
