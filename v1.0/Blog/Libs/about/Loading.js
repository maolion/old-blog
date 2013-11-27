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


Define( "Loading", Depend( "~/Cox/UI/Dom", "~/Cox/UI/Animation" ) , function( require, Loading ){
    var 
        NOOP  = function(){},
        Dom   = require( "Dom" ),
        Anima = require( "Animation" ),
        cat   = Dom( "img.loading" )
    ;

    Loading.show = function(){
        cat.css( {
            display    : "block",
            left       : "50%",
            width      : 0,
            height     : 0,
            marginTop  : 0,
            marginLeft : "-1500px",
        } );

        cat.anima( 
            1600,
            {
                width      : 128,
                height     : 102,
                marginTop  : -51,
                marginLeft : -64
            },
            NOOP,
            Anima.Transition.Back.easeOut
        );
    };

    Loading.hide = function(){
        cat.anima() && cat.anima().exit();
        cat.css( "left", "-999999px" );
        /*this.img.anima( 
            1000,
            {
                marginLeft : 1500,
                marginTop  : 0,
                width      : 0,
                height     : 0,
            }, 
            function(){
                this.style.left = "-999999px";
            },
            Anima.Transition.Back.easeIn
        );  */
    }

} );