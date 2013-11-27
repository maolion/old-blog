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


Define( "MAjax", Depend( "~/Cox/Net/Ajax", "./TipBox" ), function( require, MAjax ){
    var 
        Ajax   = require( "Ajax" ),
        TipBox = require( "TipBox" ),
        UID    = new Date().getTime()
    ;

    function errorHandler(){
        TipBox.error( "向服务器发送请求失败." );
    }

    XList.forEach( [ "get", "post", "submitForm", "submitForm2" ], function( method ){
        if( !Ajax[ method ] ){
            return;
        }
        MAjax[method] = XFunction(
            String, Optional( Object, {} ), Function, Optional( Function ),
            function( url, data, success, fail ){
                if( method === "get" ){
                    data._n = UID++;
                }
                return Ajax[method]( url, "json", data, function( data ){
                    if( data.state !== "ok" ){
                        TipBox.error( data.message || "" );
                        fail && fail( data );
                        return;
                    }
                    success && success( data );
                }, errorHandler );   
            }
        );

        MAjax[method].define(
            String, Optional( Object, {} ), 
            function( url, data, success, fail ){
                if( method === "get" ){
                    data._n = UID++;
                }
                return Ajax[method]( url, "json", data, function( data ){
                    if( data.state !== "ok" ){
                        TipBox.error( data.message || "" );
                        return;
                    }
                }, errorHandler );   
            }
        );
    } );

    MAjax.FormData = Ajax.FormData;

} );