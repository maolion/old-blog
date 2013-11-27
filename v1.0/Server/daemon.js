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
    //引用模块
    Fs             = require( "fs" ),
    Path           = require( "path" ),
    Spawn          = require( "child_process" ).spawn,
    //常量
    PACKAGE_CONFIG = require( "./package.json" ),
    APP_NAME       = PACKAGE_CONFIG.name,
    DEBUG_CONFIG   = PACKAGE_CONFIG.debug,
    ROOT           = __dirname,
    APP_PATH       = Path.join( ROOT, PACKAGE_CONFIG.main ),
    FILE_TYPES     = [ "文件", "目录" ],
    STATES         = [
        "被删除",
        "被修改",
        "重置监听",
        "应用程序启动",
        "应用程序退出"
    ],
    STATE_DELETE   = 0,
    STATE_MODIFIER = 1,
    STATE_RESET    = 2,
    STATE_RUN      = 3
    STATE_EXIT     = 4,
    STDOUT         = process.stdout,
    //变量
    watchers       = {},
    app            = null
;

//解析过虑器中配置的正则表达式
DEBUG_CONFIG.filters = DEBUG_CONFIG.filters.map( function( v ){
    return new RegExp( v );
} );

function state_log( type, path, state ){
    console.log( "[" + new Date().toGMTString().replace( " GMT", "" )  +"] - <" + FILE_TYPES[type] + "> " + path + " " + STATES[state] );  
}

function watch( path, file_type ){
    var 
        isdir   = +file_type === 1,
        watcher = Fs.watchFile( 
            path, 
            DEBUG_CONFIG.watch, 
            function( cur, prev ){                        
                if( cur.mtime.getTime() === 0 ){
                    Fs.unwatchFile( path );
                    delete watchers[ path ];
                    state_log( +file_type, path, STATE_DELETE );
                }else{
                    state_log( +file_type, path, STATE_MODIFIER  );
                    if( isdir ){
                        Fs.unwatchFile( path );
                        state_log( +file_type, path, STATE_RESET );
                        addWatch( path );
                    }
                }

                app.run();
            } 
        )
    ;
    watchers[ path ] = watcher;
    //watchers = watcher;
}

function addWatch( dir ){
    var 
        queue = [ dir ],
        files = null
    ;
    while( dir = queue.pop() ){
        files = Fs.readdirSync( dir ).filter( function( name ){
            var 
                path  = Path.join( dir, name ),
                rpath = path.replace( __dirname, "" )
            ;
            return !( path in watchers )  
                && path !== __filename
                && !DEBUG_CONFIG.filters.some( function( re ){
                        return re.test( rpath );
                    } );
        } ); 

        files.forEach( function( name ){
            var
                path = Path.join( dir, name ),
                stat = Fs.statSync( path )
            ;

            if( stat.isFile() ){
                watch( path, false );
            }else{
                queue.push( path );
            }

        } );
        //console.log( root );
        watch( dir, true );
    }
}


app = {
    running : null,
    process : null,
    __p     : [],
    dataHandler : function( data ){
        if( data ){
            STDOUT.write( data, "utf8" );
        }
    },
    exitHandler : function(){
        var pid = null;
        
        while( pid = app.__p.pop() ){
            try{
                process.kill( pid );
            }catch( e ){
                //....
            }
        }

        state_log( 0, APP_NAME, STATE_EXIT );
        app.running = false;
        app.process = false;
        app.run();
    },
    run : function(){
        app.exit();
        if( !app.running ){
            app.running = true;
            setTimeout( function(){
                if(  app.process ){
                    return;
                }
                app.process = Spawn( "node", DEBUG_CONFIG.arguments.concat( APP_PATH ) ); 
                app.__p.push( app.process.pid );
                app.process.stdout.on( "data", app.dataHandler );
                app.process.stderr.on( "data", app.dataHandler );
                app.process.on( "exit", app.exitHandler );
                state_log( 0, APP_NAME + " - [" + app.process.pid + "]", STATE_RUN  );
            }, 500 );
        }
    },
    exit : function(){
        if( app.process ){
            try{
                //state_log( 0, APP_NAME + " - [" + app.process.pid + "]", STATE_EXIT  );
                process.kill( app.process.pid );
            }catch( e ){
                //....
            }
            app.running = false;
            app.process = null;
        }
    }
};

addWatch( __dirname );
app.run();
