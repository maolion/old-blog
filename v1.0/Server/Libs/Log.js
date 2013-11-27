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
    Fs       = require( "fs" ),
    Path     = require( "path" ),
    Utils    = require( "./Utils" ),
    Config   = require( "../config.json" ),
    Logger   = require( Path.join( Cox.Modules.getRoot( "Cox" ), "Logger" ) ),
    Log      = null,
    APP_ROOT = Path.dirname( Path.dirname( __dirname ) )
;


Log = Class( "Log", Single, Extends( Logger ),
    function( Static, Public ){
        var 
            STREAM_CONFIG = {
                flags    : "a",
                encoding : "utf8",
                mode     : 0644
            },
            STDOUT = process.stdout,
            config = Config.log,
            date   = 0
        ;

        Public.constructor = function(){
            var _this = this;
            this.Super( "constructor" );

            this.dispatchEvent(
                new Cox.Event( "expired" ),
                new Cox.Event( "error" )
            );

            this.on( "writeBefore", function(){
                if( date.getDate() !== new Date().getDate() ){
                    this.setOStream( );
                }
            } );

            this.on( "outputStreamChange", function(){
                _this.clearExpiredLog();
            } );
            this.setOStream();
        };

        Public.setOStream = function(){
            date = new Date;
            if( config.root ){
                try{
                    this.Super( 
                        "setOStream", 
                        Fs.createWriteStream( 
                            Path.join( APP_ROOT, config.root, Utils.dateFormat( date, "%Y-%M-%D.log" ) ),
                            STREAM_CONFIG
                        ),
                        STDOUT
                    );
                }catch( e ){
                    this.fireEvent( "error", [ error ] );
                    Utils.errorLog( "无法创建日志数据输出流", e );
                }
            }else{
                this.Super( "setOStream", STDOUT );
            }
        };

        Public.clearExpiredLog = function(){
            var 
                _this = this,
                root  = Path.join( APP_ROOT, config.root ),
                age   = new Date().getTime() - config.maxAge
            ;
            
            if( !config.root || config.maxAge === 0 ){
                return ;
            }

            Fs.readdir( root, function( err, files ){
                
                if( err ){
                    _this.fireEvent( "error", [ err ] );
                    Utils.errorLog( "无法枚举日志目录`" + root +  "` 的文件列表", err );
                    return;
                }
                files.forEach( function( filename ){
                    var path = Path.join( root, filename );
                    Fs.stat( path, function( err, stat ){
                        if( err ){
                            _this.fireEvent( "error", [ err ] );
                            Utils.errorLog( "无法获取日志文件`" + filename + "` 的文件信息", err );
                            return;
                        }
                        if( stat.ctime.getTime() < age ){
                            Fs.unlink( path );                                   
                            _this.log( "日志文件`" + filename + "` 因过期被删除." ); 
                            _this.fireEvent( "expired", [ path, stat ] );
                        }
                    } );
                } );
            } );
        };

        Public.prefix = function( message ){
            return Utils.dateFormat( new Date, "[%H:%I:%S] - " );
        };
    }
);

module.exports = new Log;
