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

Define( "JoyeBlog", Depend( "~/Cox/UI/Dom", "/Libs/about/Page" ), function( require, JoyeBlog, module ){
    var 
        Dom  = require( "Dom" ),
        Page = require( "Page" )
    ;
    JoyeBlog = module.exports = Class( "JoyeBlog", Single, Extends( Page ), function( Static, Public ){
        Public.constructor = function(){
            this.Super( "constructor", "JoyeBlog", 950, 630 );
            this.addPanel( "JoyeBlog-v1", 240, 400, 355, 0, '<img src="'+ this.getUrl( "V1.jpg" ) +'" />' );
            this.addPanel( "JoyeBlog-v3", 350, 222, 10, 125, '<img src="'+ this.getUrl( "V3.jpg" ) +'" />' );
            this.addPanel( "JoyeBlog-v2", 350, 222, 580, 125, '<img src="'+ this.getUrl( "V2.jpg" ) +'" />' );
            this.addPanel( "JoyeBlog-t1", 340, 30, 305, 415, '<span>2013年10月8日 <a href="/">Joye\'s Blog</a> 部署上线</span>' );
            //this.addPanel(  );
            Dom.addStyleSheet( [
            '#JoyeBlog-v1, #JoyeBlog-v2, #JoyeBlog-v3{ border-radius:5px; box-shadow:1px 2px 2px rgba( 0, 0, 0, .3 ); border:5px solid #c1c1c1; }',
            '#JoyeBlog-v1 img, #JoyeBlog-v2 img, #JoyeBlog-v3 img{ width:100%; height:100% }',
            '#JoyeBlog-v1{z-index:10; box-shadow:0px 3px 3px rgba( 0, 0, 0, .4 ); }',
            '#JoyeBlog-t1{ text-align:center; font-size:18px; line-height:30px; overflow:hidden; }'
            ].join('\n') );
            this.render();
        };
    } ).getInstance();
} );