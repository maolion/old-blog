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
    DB       = require( "./DB" ),
    RTLog    = require( "./Log" )
;
//这想法虽然影响性能，不过不觉得感觉很有安全感嘛
module.exports = Class( "Model", Finaly, function( Static, Public ){
    var 
        ModelBuffer = Class( "ModelBuffer", function( Static, Public ){
            Public.constructor = function( modelname ){
                this.buffers   = [];
                this.modelName = modelname;
            };

            [
                "create", "update", "remove",
                "find", "findById", "findOne", "findByIdAndRemove", "findOneAndUpdate", "findByIdAndUpdate",
                "count", "distinct", "ensureIndexes"
            ].forEach( function( key ){
                Public[ key ] = function(){
                    RTLog.log(  "`"+ this.modelName +"`数据表的[" + key + "]操作被记录在缓存区" );
                    this.buffers.push( {
                        method : key,
                        args   : arguments
                    } );
                };
            } );

            Public.flush = function( model ){
                var 
                    name    = this.modelName,
                    buffers = this.buffers.slice()
                ;
                this.buffers.length = 0;
                buffers.forEach( function( op ){
                    RTLog.log(  "`"+ name +"`数据表的[" + op.method + "]操作从缓存区取出交移至实体模式执行" );
                    model[op.method].apply( model, op.args );
                } );
            };

        } )
    ;

    Static.OID = Mongoose.Schema.Types.ObjectId;

    Public.constructor = XFunction(
        String, Mongoose.Schema, function( name, schema ){
            var 
                _this = this
            ;

            this.modelName    = name;
            this.schema       = schema;
            this._modelBuffer = new ModelBuffer( name );
            this.model       = this._modelBuffer;
            
            DB.on( "connect", function( connect ){
                _this._resetModel( connect );
            } );

            DB.on( "close", function(){
                _this.model = _this._modelBuffer;
            } );

            DB.on( "error", function(){
                _this.model = _this._modelBuffer;
            } );

        }
    );

    Public._resetModel = function( connect ){
        var collection = null;

        this.model = connect.model( this.modelName, this.schema );
        collection  = this.model.collection;
        
        this.model.remove = function(){
            collection.remove.apply( collection, arguments );
        }; 

        this._modelBuffer.flush( this.model );
    };

    [
        "create", "update", "remove",
        "find", "findById", "findOne", "findByIdAndRemove", "findOneAndUpdate", "findByIdAndUpdate",
        "count", "distinct", "ensureIndexes"
    ].forEach( function( key ){
        Public[ key ] = function(){
            return this.model[ key ].apply( this.model, arguments );
        };
    } );

} );
