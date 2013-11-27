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

Define( "PostList", Depend( "~/Cox/UI/Dom", "./ManagePanel", "./Home", "./MAjax", "./MessageBox", './TipBox', './Category', "./PostEditor" ), function( require, PostList, module ){
    var 
        EMPTY_FUNCTION = function(){},
        DOC_ROOT       = document.documentElement,
        Dom            = require( "Dom" ),
        MsgBox         = require( "MessageBox" ),
        MAjax          = require( "MAjax" ),
        TipBox         = require( "TipBox" ),
        Category       = require( "Category" ),
        ManagePanel    = require( "ManagePanel" )
    ;
    //Category.loadCategoryList();
    PostList = Class( "PostList", Single, Extends( ManagePanel ), function( Static, Public ){
        var 
            warp              = Dom( "#post" ),
            editor            = Dom("#post>div.editor"),
            view              = Dom( "#post-view-box" ),
            sInput            = Dom.query( "#post-list>div.search-box input[name=keyword]" )[0],
            sInfo             = Dom.query( "#post-list>div.search-box .search-info" )[0],
            table             = Dom.query( "#post-list .post-list-table" )[0],
            page              = 1,
            queryStr          = "",
            caches            = {},
            tableCellTemple1  = '<a target="_blank" href="/blog/articles/{0}.html" title="{1}" >{1}</a>',
            tableCellTemple2  = [
                '<span title="{0}">{1}/{2}/{3}</span>',
                '<button title="修改" class="amd-btn modify"></button>',
                '<button title="删除" class="amd-btn remove"></button>'
            ].join( "\n" )
        ;

        function insertPostList( posts ){
            XList.forEach( posts, function( post ){
                var 
                    row  = table.insertRow( table.rows.length ),
                    cell = null
                ;
                cell = row.insertCell(0);
                cell.className = "title";
                cell.innerHTML = XString.format( 
                    tableCellTemple1,
                    ( post.category ? post.category + "/" : "" ) + post.linkname,
                    post.title
                );
                cell           = row.insertCell( 1 );
                cell.className = "visits number";
                cell.innerHTML = post.visits;
                cell           = row.insertCell( 2 );
                cell.className = "comments number";
                cell.innerHTML = post.comments || 0;
                cell           = row.insertCell( 3 );
                cell.className = "public optional";
                cell.innerHTML = '<input '+ ( post.state ? "checked" : "" ) +' type="checkbox" />';
                
                Dom( "input[type=checkbox]", cell ).on( "change", function(){
                    console.log( this.checked );
                    MAjax.get( "/manage/updatePostState", { id : post._id, state : ~~this.checked }, function( data ){
                        post.state = data.data.state;
                        Category.computeCount( "draft" );
                    } );
                } );

                cell           = row.insertCell( 4 );
                cell.className = "adate";
                post.adate     = new Date( Date.parse( post.adate ) );
                cell.innerHTML = XString.format( tableCellTemple2,
                    post.adate.toLocaleString(),
                    post.adate.getFullYear(),
                    post.adate.getMonth() + 1,
                    post.adate.getDate()
                );

                caches[ post._id ] = {
                    row  : row,
                    post : post
                };

                Dom( Dom.query( "button.modify", cell ) ).on( "click", function( event ){
                    Dom.stopEventDefault( event );
                    PostEditor.load( post._id );
                } );

                Dom( Dom.query( "button.remove", cell ) ).on( "click", function( event ){
                    Dom.stopEventDefault( event );
                    MsgBox.confirm( "确定要删除该文章记录吗?", function( ok ){
                        ok && PostList.remove( post._id );
                    } );
                } );

                //console.log( Dom.query( "button", cell ) );
            } );  
        }

        Public.constructor = function(){
            PostList = this;
            this.Super( "constructor", warp );

            this.dispatchEvent(
                new Cox.Event( "query" ),
                new Cox.Event( "remove" )
            );

            module.exports = this;
            PostEditor     = require( "PostEditor" );
            
            Category.loadCategoryList();

            Dom( "#post-list>div.search-box input[type=submit]" ).on( "click", function( event ){
                var 
                    btn      = this,
                    value    = XString.trim( sInput.value )
                ;
                Dom.stopEventDefault( event );
                if( !value ){
                    MsgBox.alert( "要求输入正确查询语句", function(){
                        sInput.focus();
                    } );
                    return;
                }
                Category.unsel();
                btn.disabled = true;
                btn.value = "搜索中...";
                page = 1;
                PostList.query( value, page ).done( function(){
                    btn.disabled = false;
                    btn.value = "搜索";
                } );
            } );

            Dom( "#post-list>footer>button.post" ).on( "click", function(){
                PostEditor.show( {
                    categorys : Category.getsel().category || ""
                } );
            } );

            Dom( "#post-list>footer>button.refresh" ).on( "click", function(){
                PostList.refresh();
            } );

            Dom( "#post-list>footer>button.prev" ).on( "click", function(){
                PostList.prevPage();
            } );

            Dom( "#post-list>footer>button.next" ).on( "click", function(){
                PostList.nextPage();
            } );

            Category.on( "selected", function( item, category ){
                //console.log( arguments );
                PostList.query( item === "all" || item === "draft" ? item + ":" : "#" + category + "#" );
            } );

            PostEditor.on( "save", function( data ){
                var 
                    cache  = caches[ data.id ],
                    update = null
                ;
                if( !cache ){
                    return;
                }
                if( data.title === cache.post.title
                 && data.state === cache.post.state
                 && data.linkname === cache.post.state
                ){
                    return ;
                }
                
                if( data.title !== cache.post.title
                 || data.linkname !== cache.post.linkname
                 || data.category !== cache.post.category 
                ){
                    update = Dom.query( "td.title a", cache.row )[0];
                    update.href = "/blog/articles/" + 
                                  ( data.category ? data.category + "/" : "" ) + 
                                  data.linkname + ".html";
                    update.title        = data.title;
                    update.innerHTML    = data.title;
                    cache.post.title    = data.title;
                    cache.post.linkname = data.linkname;
                    cache.post.category = data.category;
                }

                if( data.state !== cache.post.state ){
                    update = Dom.query( "td.public input[type=checkbox]", cache.row )[0];
                    update.checked = !!~~data.state;
                    cache.post.state = data.state;
                }

                if( data.adate !== cache.post.adate ){
                    var d = new Date( data.adate );
                    update = Dom.query( "td.adate span", cache.rwo )[0];
                    update.title = d.toLocaleString();
                    update.innerHTML = d.getFullYear() + "/" + ( d.getMonth() + 1 ) + "/" + d.getDate();
                    cache.post.adate = data.adate;
                }
                //update.removeAttribute( "checked" );
            } );

            Category.sel( "all" );

            this.fireEvent( "init" );
        };

        Public.refresh = function(){
            PostList.query( queryStr, page );
        };

        Public.prevPage = function(){
            PostList.query( queryStr, page - 1 || 1 );
        };

        Public.nextPage = function(){
            PostList.query( queryStr, page + 1 );
        };

        Public.empty = function(){
            page     = 1;
            queryStr = "";
            caches   = {};
            for( var i = table.rows.length; --i >= 1; ){
                table.deleteRow( i );
            }
        };

        Public.remove = XFunction( String, Optional( Function ), function( id, callback ){
            return MAjax.get( "/manage/removePost", { id : id }, function( data ){
                var row = caches[id];
                callback && callback( id );
                PostList.fireEvent( "remove", [id] );
                if( row ){
                    Category.computeCount( "all" );
                    row.post.category && Category.computeCount( row.post.category );
                    !~~row.post.state && Category.computeCount( "draft" );
                }
                if( !row ){
                    return;
                }
                row = row.row;
                delete caches[id];
                table.deleteRow( row.rowIndex );
                MAjax.get( "/manage/queryPost", { query : queryStr, page : page }, function( data ){
                    if( data.posts ){
                        XObject.forEach( data.posts, true, function( post ){
                            if( post._id in caches ){
                                return;
                            }
                            insertPostList( [ post ] );
                            return false;
                        } );
                    }
                } );
            } );
        } );

        Public.query = XFunction( String, Optional( Number ), Optional( Function ), function( query, p, callback ){
            sInfo.innerHTML = "";
            PostList.empty();
            queryStr = query;
            return MAjax.get( "/manage/queryPost", { query : query, page : p }, function( data ){
                page = data.page || 1;
                sInfo.innerHTML = XString.format( 
                    "{0}/{1} - {2}条记录 耗时 {3}s",
                    data.page || 0,
                    data.pageCount || 0,
                    data.count || 0,
                    data.time / 1000
                );
                data.posts && insertPostList( data.posts );
                PostList.fireEvent( "query", [ data ] );
            } );
        } );

    } ).getInstance();
} );
