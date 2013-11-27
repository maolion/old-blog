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


Define( "Utils", function( require, Utils ){
    Utils.byteUnit = function byteUnit( size ){
        if( size < 1024 ){
            return size + "字节";
        }else if( size < 1048576 ){
            return ( size / 1024 ).toFixed(2) + "KB";
        }else if( size < 1073741824 ){
            return ( size / 1048576 ).toFixed(2) + "M";
        }else{
            return ( size / 1073741824 ).toFixed(2) + "G";
        }
    };
} );