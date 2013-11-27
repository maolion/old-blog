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
module.exports = new Model(
    "comments",
    new Mongoose.Schema( {
        name     : { type : String, default : "", index : true }, 
        email    : { type : String, default : "", index : true },
        content  : { type : String, default : "" },     
        website  : { type : String, default : "#" },
        adate    : { type : Date, default : Date.now, index : true },
        category : { type : String, default : "", index : true },
        avatar   : { type : String, default : "/images/default_avatar.jpg" },
        postid   : { type : Model.OID, default : null, index : true },
        read     : { type : Boolean, default : false, index : true },
        replys   : [ {
            name      : { type : String, default : "", index : true },
            email     : { type : String, default : "", index : true },
            website   : { type : String, default : "", index : true },
            avatar    : { type : String, default : "/images/default_avatar.jpg" },
            content   : { type : String, default : "" },
            at        : { type : String, default : "", index : true },
            atwebsite : { type : String, default : "", index : true },
            atemail   : { type : String, default : "", index : true },
            adate     : { type : Date, default : Date.now, index : true },
            read      : { type : Boolean, default : false, index : true }
        } ]
    } )
);
