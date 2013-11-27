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
    Mongoose    = require( "mongoose" ),
    Model       = require( "../Libs/Model" ),
    FriendLinks = null
;
module.exports = FriendLinks = new Model(
    "friendlinks",
    new Mongoose.Schema( {
        author     : { type : String, default : "", index : true }, 
        title      : { type : String, default : "", index : true },
        url        : { type : String, default : "", index : true }, 
        summary    : { type : String, default : "" },
        state      : { type : Number, default : -1, index : true },
        adate      : { type : Date, default : Date.now, index : true }
    } )
);

