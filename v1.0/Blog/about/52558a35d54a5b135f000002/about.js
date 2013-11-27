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


Define( "about", Depend( "~/Cox/UI/Dom", "/Libs/about/Page" ), function( require, About, module ){
    var 
        Page = require( "Page" ),
        Dom  = require( "Dom" )
    ;
    About = module.exports = Class( "About", Single, Extends( Page ), function( Static, Public ){
        Public.constructor = function(){
            var 
                id   = null,
                age = new Date().getFullYear() - 1993
            ;

            this.Super( "constructor", "about", 250, 600 );

            id = this.getId();
            console.log( this.getUrl( "pic.jpg" ) );
            this.addPanel( "about-mypic", 240, 330, 5, 5, '<img src="'+ this.getUrl( "pic.jpg" ) +'" />' );
            
            this.addPanel( "about-info", 240, 130, 5, 370, [
            '<span class="name" >;) 我叫 江宜玮</span>',
            '<span class="from">来自福建-三明</span>',
            '<span class="" >现在在广东-佛山</span>',
            '<span class="age" >今年我 '+ age +'岁</span>',
            '<span class="hehe">就是图片上帅气的那位(男).</span>'
            ].join("\n") );

            Dom.addStyleSheet( [
            '#about-mypic{ border:5px solid #c1c1c1; z-index:1; background-color:#c1c1c1; border-bottom-width:15px; box-shadow:1px 3px 3px rgba( 0, 0, 0, .3 ); border-radius: 4px; }',
            '#about-mypic img{ height:100%; width:100%; border-radius:3px; display:block; margin:0 auto; }',
            '#about-info { padding:5px; z-index:2; text-align:center; overflow:hidden; }',
            '#about-info span{ display:block; font-size:16px; margin-bottom:5px; }',
            '#about-info .name{ font-size:22px; font-weight:bold; }',
            '#about-info .hehe{ font-size:11px; }'
            ].join( "\n" ) );
            this.render();
        };
    } ).getInstance();
} );