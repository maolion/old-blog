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


Define( "Page", Depend( "~/Cox/UI/Dom", "~/Cox/Utils", "~/Cox/UI/Animation", "./Loading" ), function( require, Page, module ){
    var 
        Dom     = require( "Dom" ),
        Anima   = require( "Animation" ),
        Utils   = require( "Utils" ),
        Loading = require( "Loading" )
    ;


    Page = module.exports = Class( "Page", Abstract, Extends( Cox.EventSource ), function( Static, Public ){
        var 
            REL       = document.documentElement.firstChild,
            END_TIMES = [ 500, 660, 700, 880, 900 ],
            BODY      = Dom( document.body ),
            DOC_ROOT  = document.documentElement,
            pages     = {},
            tasklist  = {},
            loading   = {},
            prev      = null
        ;
        Static.UNSET = 0;
        Static.INIT  = 1;
        Static.SHOW  = 2;
        Static.HIDE  = 3;

        function loadPage( id, pagename ){
            var loader = null;
            if( pagename in loading ){
                return;
            }
            Loading.show();

            loading[ pagename ] = id;
            
            Use( Modules( "/Blog/about/" + id + "/" + pagename  ), function( require ){
                require( pagename );
                delete loading[id];
            } );
        }

        Static.show = XFunction( String, String, function( id, pagename ){
            var page = pages[ pagename ];

            if( page ){
                Loading.hide();
                return page.show();
            }
            tasklist[ pagename ] = "show";
            loadPage( id, pagename );
        } );

        Static.hide = XFunction( String, String, function( id, pagename ){
            var page = pages[ pagename ];
            if( page ){
                Loading.hide();
                return page.hide();
            }
            tasklist[ pagename ] = "hide";
            loadPage( id, pagename );
        } );

        Public.constructor = XFunction( String, Optional( Number ), Optional( Number ), function( pagename, width, height ){
            var _this = this;
            this.Super( "constructor" );
            this.dispatchEvent(
                new Cox.Event( "render" ),
                new Cox.Event( "show" ),
                new Cox.Event( "hide" ),
                new Cox.Event( "free" )
            );

            pages[ pagename ] = this;
            this._id          = loading[ pagename ];
            this.pagename     = pagename;
            this.state        = Static.UNSET;
            this.width        = width;
            this.height       = height;
            this.panels       = {};
            this.showAnima    = new Anima( Anima.Transition.Back.easeOut );
            this.hideAnima    = new Anima( Anima.Transition.Back.easeInOut );
            this.showAnima.on( "done", function(){
                _this.fireEvent( "show" );
            } );
            
            this.hideAnima.on( "done", function(){
                _this.fireEvent( "hide" );
            } );

            this.once( "render", function(){
                _this.state = Static.HIDE;
                Loading.hide();
                if( pagename in tasklist ){
                    _this[ tasklist[ pagename ] ]();
                    delete tasklist[ pagename ];
                }
            } );
        } );
    
        Public.getId = function(){
            return this._id;
        };
        Public.getDir = function(){
            return "/blog/about/" + this._id;
        };
        Public.getUrl = XFunction( String, function( filename ){
            return "/blog/about/" + this._id + "/" + filename;
        } );
        Public.render = function(){
            var
                _this  = this,
                panels = [],
                sAnima = null,
                hAnima = null,
                index  = 0
            ;
            this.state = Static.INIT;
            sAnima = this.showAnima;
            hAnima = this.hideAnima;
            sAnima.removeAllClip();
            sAnima.clips = [];
            hAnima.removeAllClip();
            hAnima.clips = [];

            XObject.forEach( this.panels, true, function( panel ){
                var 
                    element = null,
                    clip    = null
                ;
                index++;
                if( panel.render ){
                    panels.push( panel.element );
                    return;
                }
                BODY.append( XString.format(
                    '<div class="panel" id="{0}">{1}</div>',
                    panel.id,
                    panel.content
                ) );
                panel.render  = true;
                panel.element = element = Dom( "#"+panel.id );
                panels.push( panel.element );

                clip = [
                    { key : "width", from : 0, to : panel.width, el : element },
                    { key : "height", from : 0, to : panel.height },
                    { key : "left", from : 0, _to : panel.left },
                    { key : "top", from : 0, _to : panel.top },
                    { key : "opacity", from : 0, to : 1 }
                ];
                
                sAnima.addClip( index * 100, index * 100 + END_TIMES[ index % 6 ] - 200, clip,  updateCSS );
                sAnima.clips.push( clip );

                clip = [
                    { key : "width", to : 0, from : panel.width, el : element },
                    { key : "height", to : 0, from : panel.height },
                    { key : "left", to : 0, from : panel.left },
                    { key : "top", to : 0, from : panel.top },
                    { key : "opacity", to : 0, from : 1 }
                ];

                hAnima.addClip( index * 100, index * 100 + END_TIMES[ index % 6 ], clip,  updateCSS );
                hAnima.clips.push( clip );

                function updateCSS( values ){
                    panel.element.css( {
                        width   : values.width + "px",
                        height  : values.height + "px",
                        top     : values.top + "px",
                        left    : values.left + "px",
                        opacity : values.opacity
                    } );
                }
            } );

            this.fireEvent( "render", [ panels ] );
            return panels;
        };

        Public.addPanel = XFunction( 
            Optional( String ), Number, Number, Number, Number, String, 
            function( id, width, height, left, top, content ){
                id = id || Utils.UID( "page-panel" );
                return this.panels[ id ] = {
                    id      : id,
                    width   : width,
                    height  : height,
                    top     : top,
                    left    : left,
                    content : content,
                    element : null,
                    render  : false
                };
            }
        );

        Public.removePanel = XFunction( String, function( id ){
            if( id in this.panels ){
                var panel = this.panels[id];
                panel.element && panel.element.remove();
                return panel;
            }
        } );

        Public.show = function(){
            var 
                pos   = null,
                csize = {
                    width : this.width,
                    height : this.height
                },
                wsize = {
                    width  : DOC_ROOT.clientWidth,
                    height : DOC_ROOT.clientHeight
                }
            ;

            if( this.state === Static.SHOW ){
                return;
            }
            this.cancelAnima();
            
            /*if( this.state === Static.UNSET ){
                //this.render();
            }*/
            //this.cancelAnima();
            pos = {
                x : wsize.width / 2,
                y : wsize.height - 80
            };
            this.state = Static.SHOW;

            XObject.forEach( this.panels, true, function( panel ){
                panel.element.css( {
                    width   : 0,
                    height  : 0,
                    left    : pos.x + "px",
                    top     : pos.y + "px",
                    opacity : 0,
                    display : "block"
                } );
            } );

            XList.forEach( this.showAnima.clips, function( clip ){
                clip[2].from = pos.x;
                clip[2].to   = csize.width ? ( wsize.width - csize.width ) / 2 + clip[2]._to : clip[2]._to;
                clip[3].from = pos.y;
                clip[3].to   = csize.height ? ( wsize.height - csize.height ) / 2 + clip[3]._to : clip[3]._to;
            } );

            this.showAnima.play();
        };

        Public.hide = function(){
            var pos = null;


            if( this.state === Static.HIDE ){
                return;
            }
            this.cancelAnima();
            
            /*if( this.state === Static.UNSET ){
                this.render();
            }*/
            pos        = { x : DOC_ROOT.clientWidth / 2 };
            pos.y      = 0;
            this.state = Static.HIDE;
            XList.forEach( this.hideAnima.clips, function( clip ){
                //console.log( clip )
                var o = clip[0].el.offset();
                //clip[2].width  = parseInt( clip[0].el.css( "width" ) );
                //clip[2].height = parseInt( clip[0].el.css( 'height' ) );
                clip[2].from   = o.x;
                clip[2].to     = pos.x;
                clip[3].from   = o.y;
                clip[3].to     = pos.y;
            } );

            this.hideAnima.play();
        };

        Public.isShow = function(){
            return this.state === Static.SHOW;
        };

        Public.isHide = function(){
            return this.state === Static.HIDE;
        };

        Public.cancelAnima = function(){
            if( this.showAnima.playing() ){
                this.showAnima.exit();
            }
            if( this.hideAnima.playing() ){
                this.hideAnima.exit();
            }
        };

        Public.free = function(){
            XObject.forEach( this.panels, function( panel ){
                panel.element && panel.element.remove();
                panel.element = null;
                panel.render  = false;
            } );
            this.state = Static.UNSET;
            this.showAnima = null;
            this.hideAnima = null;
            this.fireEvent( "free", [] );
        };

    } );
} );