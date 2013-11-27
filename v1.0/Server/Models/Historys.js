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
    Model       = require( "../Libs/Model" )
;
module.exports = new Model(
    "Historys",
    new Mongoose.Schema( {
        date       : { type : Date, default : Date.now, index : true }, 
        pagename   : { type : String, default : "", index : true },
        label      : { type : String, default : "", index : true },
        summary    : { type : String, default : "" },
        newyear    : { type : Boolean, default : false, index : true },
        filename   : { type : String, default : "", index : true }
    } )
);

