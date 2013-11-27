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
    Model    = require( "../Libs/Model" ),
    Post     = null
;
//哥就是牛B。
module.exports = Post = new Model(
    "post",
    new Mongoose.Schema( {
        author     : { type : String, default : "", index : true }, 
        title      : { type : String, default : "", index : true }, 
        linkname   : { type : String, default : "", index : true }, 
        originlink : { type : String, default : "", index : true }, 
        summary    : { type : String, default : "" },
        content    : { type : String, default : "" }, 
        html       : { type : String, default : "" },
        state      : { type : Number, default : -1, index : true },
        visits     : { type : Number, default : 0 },
        adate      : { type : Date, default : Date.now, index : true },
        mdate      : { type : Date, default : Date.now, index : true },
        category   : { type : String, default : null, index : true },
        comments   : { type : Number, default : 0, index : true },
        tags       : Array
    } )
);

Post.PUBLIC = 1;
Post.DRAFT  = -1;

