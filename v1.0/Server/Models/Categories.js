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


var 
    Mongoose = require( "mongoose" ),
    Model    = require( "../Libs/Model" )
;
//哥就是牛B。
module.exports = new Model(
    "categories",
    new Mongoose.Schema( {
        name  : { type : String, default : "", index : true }, 
    } )
);
