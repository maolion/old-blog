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

Define( "CoxV1", Depend( "~/Cox/UI/Dom", "/Libs/about/Page" ), function( require, CoxV1, module ){
    var 
        Page = require( "Page" ),
        Dom  = require( "Dom" )
    ;
    CoxV1 = module.exports = Class( "Cox-v1.0", Single, Extends( Page ), function( Static, Public ){
        Public.constructor = function(){
            this.Super( "constructor", "CoxV1", 630, 430 );
            this.addPanel( "CoxV1-b", 630, 50, 0, 0, '<span>2013年9月份完成 Cox-V1.0</span>' );
            this.addPanel( "CoxV1-a", 630, 200, 0, 55, '<div id="highlighter_940223" class="syntaxhighlighter  "><table border="0" cellpadding="0" cellspacing="0"><tbody><tr><td class="gutter"><div class="line number1 index0 alt2">1</div><div class="line number2 index1 alt1">2</div><div class="line number3 index2 alt2">3</div><div class="line number4 index3 alt1">4</div><div class="line number5 index4 alt2">5</div><div class="line number6 index5 alt1">6</div><div class="line number7 index6 alt2">7</div><div class="line number8 index7 alt1">8</div><div class="line number9 index8 alt2">9</div><div class="line number10 index9 alt1">10</div><div class="line number11 index10 alt2">11</div><div class="line number12 index11 alt1">12</div><div class="line number13 index12 alt2">13</div><div class="line number14 index13 alt1">14</div></td><td class="code"><div class="container"><div class="line number1 index0 alt2"><code class="comments">//Happy, Codeing</code></div><div class="line number2 index1 alt1"><code class="plain">Use( Modules( </code><code class="string">"HTTP"</code><code class="plain">, </code><code class="string">"WebKit"</code> <code class="plain">), </code><code class="keyword">function</code><code class="plain">( require ){</code></div><div class="line number3 index2 alt2"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="keyword">var</code></div><div class="line number4 index3 alt1"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="plain">HTTP&nbsp;&nbsp;&nbsp;&nbsp; = require( </code><code class="string">"HTTP"</code> <code class="plain">),</code></div><div class="line number5 index4 alt2"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="plain">Webkit&nbsp;&nbsp; = require( </code><code class="string">"WebKit"</code> <code class="plain">),</code></div><div class="line number6 index5 alt1"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="plain">JoyeBlog = </code><code class="keyword">null</code></div><div class="line number7 index6 alt2"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="plain">;</code></div><div class="line number8 index7 alt1"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="plain">JoyeBlog = Class( </code><code class="string">"JoyeBlog"</code><code class="plain">, Extends( HTTP ), </code><code class="keyword">function</code><code class="plain">( Static, Public ){</code></div><div class="line number9 index8 alt2"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="plain">Public.constructor = </code><code class="keyword">function</code><code class="plain">(){</code></div><div class="line number10 index9 alt1"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="plain">WebKit.render( </code><code class="keyword">this</code><code class="plain">.request( </code><code class="string">"Joye\'s Blog"</code> <code class="plain">) );</code></div><div class="line number11 index10 alt2"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="plain">};</code></div><div class="line number12 index11 alt1"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="plain">} );</code></div><div class="line number13 index12 alt2"><code class="undefined spaces">&nbsp;&nbsp;&nbsp;&nbsp;</code><code class="keyword">new</code> <code class="plain">JoyeBlog();</code></div><div class="line number14 index13 alt1"><code class="plain">} );</code></div></div></td></tr></tbody></table></div>' );
            this.addPanel( "CoxV1-c", 630, 30, 0, 280, '<a target="_blank" href="https://github.com/maolion/cox.js">https://github.com/maolion/cox.js</a>' );
            Dom.addStyleSheet( [
            '#CoxV1-a{ background:rgba( 0, 0, 0, .3 ); padding:0; border-radius:10px; padding:10px 0; }',
            '#CoxV1-a>div{overflow:hidden !important; margin:0 !important; }',
            '#CoxV1-b>span{ display:block; line-height:50px; text-align:center; font-size:18px; }',
            '#CoxV1-c{ text-align:center; }',
            '#CoxV1-c>a{ line-height:30px; font-size:14px; }',
            ].join( "\n" ) );
            this.render();
        };
    } ).getInstance();
} );


