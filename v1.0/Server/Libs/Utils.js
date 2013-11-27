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
    RE_IE_BROWSER= /MSIE ([\d.]+)/,
    RE_LINE_END  = /\n\r|\r\n|\r|\n/g,
    Fs           = require( "fs" ),
    Path         = require( "path" ),
    Cox          = require( "../../Cox" ),
    crypto       = require( "crypto" ),
    ZStream      = require( "zstream" ),
    Unzip        = require( "unzip" ),
    URI          = require( Path.join( Cox.Modules.getRoot( "Cox" ), "/Net/URI" ) )
;
global.Utils = exports;
exports.getRemoteAddress = function( req ){
    var sock = req.socket;
    return req.ip 
        && ( sock.socket ? sock.socket.remoteAddress : sock.remoteAddress );
};

exports.dateFormat = ( function(){
    var 
        formats = {
            "Y"  : function( date ){ return date.getFullYear(); },
            "y"  : function( date ){ return date.getFullYear().toString().slice( -2 ); },
            "M"  : function( date ){ return ( "0" + ( date.getMonth() + 1 ) ).slice( -2 ); },
            "m"  : function( date ){ return date.getMonth() + 1; },
            "D"  : function( date ){ return ( "0" + date.getDate() ).slice( -2 ); },
            "d"  : function( date ){ return date.getDate(); },
            "H"  : function( date ){ return ( "0" + date.getHours() ).slice( -2 ); },
            "h"  : function( date ){ return date.getHours(); },
            "I"  : function( date ){ return ( "0" + date.getMinutes() ).slice( -2 ); },
            "i"  : function( date ){ return date.getMinutes(); },
            "S"  : function( date ){ return ( "0" + date.getSeconds() ).slice( -2 ); },
            "s"  : function( date ){ return date.getSeconds(); },
            "MM" : function( date ){ return ( "00" + date.getMilliseconds() ).slice( -3 ); },
            "mm" : function( date ){ return date.getMilliseconds() }
        },
        RE_FORMAT_SIGN = /\%[A-Za-z]+/g
    ;
    return function( date, format ){
        RE_FORMAT_SIGN.lastIndex = 0;
        data = is( String, date ) ? new Date( date ) : date;
        return format.replace( RE_FORMAT_SIGN, function( sign ){
            if( sign.slice( 1 ) in formats ){
                return formats[ sign.slice( 1 ) ]( date );
            }else{
                return sign;
            }
        } );
    };
} )();

exports.errorLog = ( function(){
    var ERROR_FILENAME = Path.join( __dirname, "../ERROR.log" );

    return function( message, error ){
        RE_LINE_END.lastIndex = 0;
        message = exports.dateFormat( new Date, "[%Y/%M/%D %H:%I:%S] - " ) + 
                  message + 
                  "\n- " + 
                  error.stack.replace( RE_LINE_END, "\n- " ) +
                  "\n\n";
        Fs.appendFileSync( ERROR_FILENAME, message );
        console.log( message );
    };

} )();
/*
exports.host = function( config ){
    return XString.trim( 
        "http://{1}{2}",
        config.host,
        config.port === 80 ? "" : ":" + config.port,
    );
};*/
exports.mkdir = function( path, callback ){
    var 
        mkdir = new Deferred
    ;

    callback && mkdir.done( callback );

    if( !path ){
        mkdir.rejected();
        return;
    }

    Fs.exists( path, function( exists ){
        var 
            check = new Deferred,
            dir   = Path.dirname( path )
        ;

        if( exists ){
            mkdir.resolved();
            return;
        }

        if( dir ){
            check = exports.mkdir( dir );
        }else{
            check.resolved();
        }
        check.done( function( ok ){
            if( !ok ){
                mkdir.rejected();
                return;
            }
            Fs.mkdir( path, function( err ){
                err ? mkdir.rejected() : mkdir.resolved();
            } );
        } );
    } );

    return mkdir;
};

//看见没有，这就是找死的人
exports.rmdir = function( path, callback ){
    var 
        rmdir    = new Deferred,
        rmsubdir = new Deferred
    ;

    callback && rmdir.done( callback );

    if( !path ){
        rmdir.rejected();
        return rmdir;
    }

    Fs.readdir( path, function( err, files ){
        var rms = null;
        if( err ){
            rmdir.rejected();
            return;
        }
        rms = [];
        files.forEach( function( file ){
            var 
                spath = Path.join( path, file ),
                rm    = new Deferred
            ;
            rms.push( rm );
            Fs.stat( spath, function( err, stat ){
                if( err ){
                    rm.rejected( err );
                    return;
                }

                if( stat.isFile() ){
                    Fs.unlink( spath, function( err ){
                        err ? rm.rejected( err ) : rm.resolved( spath );
                    } );
                    return;
                }

                exports.rmdir( spath ).done( function( ok, value ){
                    !ok ? rm.rejected( value ) : rm.resolved( value );
                } );

            } );
        } );
        if( rms.length === 0 ){
            rmsubdir.resolved();
            return;
        }
        new DeferredList( rms ).done( function( ok, value ){
            !ok ? rmsubdir.rejected( value ) : rmsubdir.resolved();
        } );
    } );
    
    rmsubdir.done( function(){
        if( this.isRejected() ){
            rmdir.rejected();
            return;
        }

        Fs.rmdir( path, function( err ){
            err ? rmdir.rejected( err ) : rmdir.resolved( path );
        } );

    } );

    return rmdir;
};

exports.isXhr = function( req ){
    return !!req.get( "X-Requested-With" );
};

exports.md5 = function( data ){
    var md5 = crypto.createHash( "md5" );
    return md5.update( data ).digest( "hex" );
};

exports.gravatar = XFunction( String, Optional( Number, 100 ), function( email, size ){
    var d = escape( "http://1.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=" + size )
    return "http://www.gravatar.com/avatar/" + exports.md5( XString.trim( email ).toLowerCase() ) + "?s=" + size + "&d=" + d
} );

exports.getBytesLength = function( data ){
    var len = 0;
    for( var i = data.length, c = null; i-- ;  ){
        c = data.charCodeAt(i);
        if( ( c >= 0x0001 && c <= 0x007e ) 
         || ( c >= 0xff60 && c <= 0xff9f )
        ){
            len++;
        }else{
            len += 3;
        }
    }
    return len;
}

exports.getArticleUrl = XFunction( String, String, function( category, linkname ){
    return "/blog/articles" + ( category ? "/" + category : "" ) + "/" + linkname + ".html";
} );

exports.getPageUrl = XFunction( String, Optional( String, "page" ), Number, function( url, pname, page ){
    url = new URI( url );
    url.query.set( pname, page );
    return url.toString();
} );

exports.getZipFileList = XFunction( String, function( path ){
    var 
        zipParser = new ZStream.Parser(),
        get = new Deferred,
        files = {}
    ;

    Fs.readFile( path, { encoding : "utf8" }, function( err, buffer ){
        if( err ){
            get.rejected( err );
            return;
        }
        zipParser.parse( buffer );
    } );

    zipParser.on( "entry", function( file ){
        files[ file.path ] = file;
    } );
    zipParser.on( "end", function(){
        get.resolved( files );
    } );
    return get;
} );

exports.unzip = XFunction( String, String, function( zipfile, output ){
    var 
        unzip = new Deferred,
        reader = Fs.createReadStream( zipfile ),
        extract = Unzip.Extract( { path : output } )
    ;
    unzip.extract = extract;
    reader.pipe( extract );
    extract.on( "close", function(){
        unzip.resolved();
    } );
    extract.on( "end", function(){
        console.log( "end" );
    } )
    extract.on( "error", function(){
        unzip.rejected();
    } );

    return unzip;
} );

exports.clientIsOld = XFunction( Object, function( req ){
    var 
        ua = req.get( "User-Agent" ),
        ie = RE_IE_BROWSER.exec( ua );
    ;
    return ie && parseInt( ie[1] ) < 9;
} );