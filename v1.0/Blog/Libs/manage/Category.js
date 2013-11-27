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


Define( "Category", Depend( "~/Cox/UI/Dom", "./MAjax", "./TipBox", "./MessageBox" ), function( require, Category, module ){
    var 
        Dom    = require( "Dom" ),
        MAjax  = require( "MAjax" ),
        TipBox = require( "TipBox" ),
        MsgBox = require( "MessageBox" )
    ;
    Category = Class( "Category", Single, Extends( Cox.EventSource ), function( Static, Public ){
    
        var 
            categoryList = Dom( "#category-list>ul" ),
            allItem      = Dom( "#category-list>ul>li.category-all" ),
            draftItem    = Dom( "#category-list>ul>li.category-draft" ),
            cache  = {},
            temple = [
                '<li class="category-item" data="{0}" >',
                '   <span><span class="title" >{0}</span><span class="count">(0)</span></span>',
                '   <button title="修改" class="modify amd-btn"></button>',
                '   <button title="删除" class="remove amd-btn"></button>',
                '</li>'
            ].join( "\n" )
        ;

        function appendToCategoryList( categorys ){
            XList.forEach( categorys, function( category ){
                var item = null;
                categoryList.append( XString.format( temple, category ) );

                cache[ category ] = item = Dom( "#category-list>ul>li:last-child" );
                
                item.on( "click", false, function(){
                    Category.sel( category );
                } );

                Dom( "#category-list>ul>li:last-child .modify" ).on( "click", function( event ){
                    Dom.stopEventBubble( event );
                    MsgBox.prompt( "输入新的分类名称", category, function( value ){
                        Category.modify( category, value || "", function( a, b ){
                            category = b;
                        } );
                    } );               
                } );

                Dom( "#category-list>ul>li:last-child .remove" ).on( "click", function( event ){
                    Dom.stopEventBubble( event );
                    MsgBox.confirm( "你确定要删除[" + category + "]分类吗？", function( ok ){
                        ok && Category.remove( category );
                    } );
                } );

            } );
        }

        Public.constructor = function(){
            this.Super( "constructor" );
            this.dispatchEvent(
                new Cox.Event( "loaded" ),
                new Cox.Event( "remove" ),
                new Cox.Event( "modify" ),
                new Cox.Event( "add" ),
                new Cox.Event( "selected" )
            );
            Dom( "#category-list>ul>li button.add" ).on( "click", function( event ){
                Dom.stopEventBubble( event );
                MsgBox.prompt( "输入分类名称", function( value ){
                    Category.add( value || "" );
                } );
            } );

            allItem.on( "click", function( event ){
                Category.sel( "all" );
            } );

            draftItem.on( "click", function( event ){
                Category.sel( "draft" );
            } );
        };

        Public.add = XFunction( String, Optional( Function ), function( value, callback ){
            value = value && XString.trim( value.toString() );
            if( !value ){
                return;
            }

            if( Category.exists( value ) ){
                TipBox.warning( "该分类已经被创建" );
                return;
            }

            MAjax.get( "/manage/addPostCategory", { name : value }, function(){
                appendToCategoryList( [ value ] );
                Category.fireEvent( "add", [ value ] );
                callback && callback( value );
            } );
        } );


        Public.modify = XFunction( String, String, Optional( Function ), function( originalValue, value, callback ){
            var 
                item  = null,
                title = null
            ;
            item = cache[ originalValue ].get(0);
            //item = Dom.query( "#category-list>ul>li[data=" + originalValue + "]" )[0];
            if( !item || !value || originalValue === value ){
                return;
            }

            if( Category.exists( value ) ){
                TipBox.warning( "该分类已经被创建" );
                return;
            }

            MAjax.get( "/manage/modifyCategory", { origin : originalValue, name : value }, function(){
                Dom.query( ".title", item )[0].innerHTML = value;
                item.setAttribute( "data", value );
                cache[ value ] = cache[ originalValue ];
                delete cache[ originalValue ];
                Category.fireEvent( "modify", [ originalValue, value ] );
                callback && callback( originalValue, value );
            } );
        } );

        Public.remove = XFunction( String, Optional( Function ) , function( value, callback ){
            if( !value || !Category.exists( value ) ){
                return;
            }

            MAjax.get( "/manage/removeCategory", { name : value }, function(){
                //Dom( "#category-list>ul>li[data=" + value + "]" ).remove();
                cache[ value ].remove();
                delete cache[ value ];
                Category.fireEvent( "remove", [ value ] );
                callback && callback( value );
            } );
        } );

        Public.exists = XFunction( String, function( category ){
            return cache.hasOwnProperty( category );
            //return Dom.query( "#category-list li[data="+ category +"]" ).length !==0
        } );

        Public.loadCategoryList = function(){
            //categoryList.empty(); 
            Dom( "#category-list>ul>li.category-item" ).remove();
            MAjax.get( "/getCategorys", function( data){
                cache = {};
                appendToCategoryList( data.categorys );
                Category.computeCount();
                Category.fireEvent( "loaded", [ data.categorys ] );
            } );
        };

        Public.computeCount = XFunction( String, Optional( Function ), function( category, callback ){
            var condition = {};
            if( category === "draft" ){
                condition.state = 0;
            }else if( category !== "all" || !category ){
                condition.category = category;
            }
            MAjax.get( "/manage/getPostCount", { condition : condition }, function( data ){
                var item = null;
                if( !category || category === "all" ){
                    item = allItem.get(0);
                }else if( category === "draft" ){
                    item = draftItem.get( 0 );
                }else{
                    item = cache[ category ];
                    item = item && item.get(0);
                }
                if( item ){
                    Dom.query( "span.count", item )[0].innerHTML = "(" + data.count + ")";
                }
                callback && callback( data );
            } );
        } );

        Public.computeCount.define( Optional( Function ), function( callback ){
            MAjax.get( "/manage/getPostCounts", function( data ){
                data = data.data;
                Dom.query( "span.count", allItem.get( 0 ) )[0].innerHTML = "(" + data.all + ")";
                Dom.query( "span.count", draftItem.get( 0 ) )[0].innerHTML = "(" + data.draft + ")";
                XObject.forEach( data.categorys, true, function( count, category ){
                    var item = cache[ category ];
                    if( !item ){
                        return;
                    }
                    Dom.query( "span.count", item.get(0) )[0].innerHTML = "(" + count + ")";
                } );               
                callback && callback( data );
            } );
        } );

        Public.sel = XFunction( String, function( category ){
            var 
                item  = null,
                type  = null
            ;
            if( category === "all" || category === "draft" ){
                type = category;
                item = Dom( "#category-list>ul>li.category-" + category );
            }else{
                type = "item";
                item = cache[ category ];
            }
            if( !item || Dom.containersClass( item.get(0), "selected" ) ){
                return;
            }
            Category.unsel();
            item.addClass( "selected" );
            Category.fireEvent( "selected", [ type, category ] );
        } ); 

        Public.unsel = function(){
            Dom( "#category-list>ul>li.selected" ).removeClass( "selected" );
        };

        Public.getsel = function(){
            var 
                item     = Dom.query( "#category-list>ul>li.selected" )[0],
                type     = null,
                category = null
            ;
            if( !item ){
                return {
                    type     : type,
                    category : category
                }
            }
            if( Dom.containersClass( item, "category-all" ) ){
                type = "all";
            }else if( Dom.containersClass( item, "category-draft" ) ){
                type = "draft";
            }else{
                type     = "item";
                category = item.getAttribute( "data" );
            }
            return {
                type     : type,
                category : category
            };
        };

        Public.getCategoryList = function(){
            var list = [];
            XObject.forEach( cache, true, function( item, category ){
                list.push( category );
            } );
            return list;
        };

    } ).getInstance();

    module.exports = Category;
} );