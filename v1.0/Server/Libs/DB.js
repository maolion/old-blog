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
    RTLog    = require( "./Log" ),
    Utils    = require( "./Utils" ),
    Config   = require( "../config.json" )
;

module.exports = Class( "DB", Single, Extends( Cox.EventSource ), 
    function( Static, Public ){
        var 
            connect  = null,
            config   = Config.db
        ;

        Public.constructor = function(){
            var 
                _this = this,
                fail  = false
            ;
            this.Super( "constructor" );
            this.dispatchEvent(
                new Cox.Event( "connect" ),
                new Cox.Event( "close" ),
                new Cox.Event( "error" )
            );

            function connectedHandler(){
                fail = false;
                RTLog.log( "与数据库服务器建立连接" );
                _this.fireEvent( "connect", [ connect ] );
            }

            function closeHandler(){
                //connect = null;
                RTLog.log( "与数据库服务器断开连接" );
                _this.fireEvent( "close", [] );
            }

            function errorHandler( err ){
                if( fail ){
                    return;
                }
                fail = true;
                RTLog.log( "未能与数据库服务器建立连接" );
                _this.fireEvent( "error", [ err ] );
                Utils.errorLog( "未能与数据库服务器建立连接", err );
            }

            this.get = function(){
                return connect;
            };

            this.connect = function(){
                RTLog.log( "请求与数据库服务器建立连接" );
                connect = Mongoose.createConnection( config.connectInfo, {server:{auto_reconnect:true}} );
                //console.log( connect.db.on  );
                //this.fireEvent( "change", [ connect ], this );
                connect.on( "connected", connectedHandler );
                //connect.on( "reconnected",  connectedHandler );
                connect.on( "close", closeHandler );
                connect.on( "error", errorHandler );
            };
            
            this.close = function(){
                try{
                    connect.close()
                }catch( e ){
                    //...
                }
            };

        };
        
        Public.test = function( info, callback ){
            var test = Mongoose.createConnection( info, function( err ){
                if( !err ){
                    test.close();
                }
                callback( err );
            } );
        };
    } 
).getInstance();