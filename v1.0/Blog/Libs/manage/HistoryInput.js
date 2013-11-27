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

Define( "HistoryInput", Depend( "~/Cox/Utils", "~/Cox/UI/Dom", "./MAjax", "./Dialog" ), function( require, HistoryInput, module ){
    var 
        Utils      = require( "Utils" ),
        MAjax      = require( "MAjax" ),
        Dialog     = require( "Dialog" ),
        Dom        = require( "Dom" )
    ;


    HistoryInput = module.exports = Class( "HistoryInput", Single, Extends( Dialog ), function( Static, Public ){
        Public.constructor = function(){
            this.Super( "constructor", "记事" );

            this.dispatchEvent(
                new Cox.Event( "done" )
            );

            this.container   = Dom( "#history-input" );
            this.date        = this.container.find( "input[name=date]" ).get(0);
            this.id          = this.container.find( "input[name=id]" ).get(0);
            this.pagename    = this.container.find( "input[name=pagename]" ).get(0);
            this.label       = this.container.find( "input[name=label]" ).get(0);
            this.summary     = this.container.find( "input[name=summary]" ).get(0);
            this.ofilename   = this.container.find( "input[name=ofilename]" ).get(0);
            this.filename    = this.container.find( "div.content .filename" );
            this.form        = this.container.find( "form" ).get(0);
            this.contentfile = this.container.find( "input[name=contentfile]" ).get(0);
            this.submitbtn   = this.container.find( "button.submit" ).get(0);
            
            Dom.on( this.contentfile, "change", function(){
                HistoryInput.filename.html( this.files[0].name );
            } );

            this.container.find( "button.cancel" ).on( "click", function(){
                HistoryInput.hide();
            } );

            function xhrDone(){ 
                HistoryInput.unlock();
                HistoryInput.submitbtn.disabled = false;
                HistoryInput.setTitle( "记事" );
                HistoryInput.submitbtn.innerHTML = "提交";
            }

            function xhrProgress( event ){
                if( event.lengthComputable ){
                    var progress = Math.round( event.loaded / event.total * 100 ) + "%";
                    HistoryInput.submitbtn.innerHTML = progress;
                    HistoryInput.setTitle( "提交完成 " + progress );
                }
            }

            Dom.on( this.submitbtn, "click", function(){
                var 
                    xhr = null
                ;

                if( !HistoryInput.date.value ){
                    return HistoryInput.date.focus();
                }
                if( !HistoryInput.pagename.value ){
                    return HistoryInput.pagename.focus();
                }
                if( !HistoryInput.label.value ){
                    return HistoryInput.label.focus();
                }
                if( !HistoryInput.contentfile.files.length && !HistoryInput.ofilename.value ){
                    return HistoryInput.filename.html( "未设置内容文件" );
                }
                HistoryInput.submitbtn.disabled = true;
                HistoryInput.lock();

                xhr = MAjax.submitForm2( HistoryInput.id.value ? "/manage/updateHistory" : "/manage/addHistory", new FormData( HistoryInput.form ), function( data ){  
                    HistoryInput.unlock();
                    HistoryInput.fireEvent( "done", [ data ] );
                    HistoryInput.hide();
                } ).xhr;

                xhr.on( "done", xhrDone );
                xhr.on( "progress", xhrProgress );

            } );

        };  

        Public.init = XFunction( Optional( Object, {} ), function( history ){
            HistoryInput.date.value        = history.date && Utils.dateFormat( new Date( history.date ), "%Y/%M/%D %H:%I:%S" ) || "";
            HistoryInput.pagename.value    = history.pagename || "";
            HistoryInput.label.value       = history.label || "";
            HistoryInput.summary.value     = history.summary || "";
            HistoryInput.id.value          = history._id || "";
            HistoryInput.ofilename.value   = history.filename || "";
            HistoryInput.contentfile.value = "";
            HistoryInput.filename.html( history.filename || "未设置内容文件" );
        } );

        Public.show = XFunction( Optional( Object, {} ), function( history ){
            HistoryInput.init( history );
            HistoryInput.Super( "show" );
        } );

        Public.panel = function( panel ){
            panel.html( [
            '<div id="history-input">',
            '   <form method="post" >',
            '       <input type="text" placeholder="日期" name="date" />',
            '       <input type="text" placeholder="Page Name" name="pagename" />',
            '       <input type="text"  placeholder="标签" name="label" />',
            '       <input type="text"  placeholder="概述" name="summary" />',
            '       <div class="content" >',
            '           <span class="filename" >未设置内容文件</span>',
            '           <label for="file-uploader-2" class="amd-btn upload" title="上传内容文件" ></label>',
            '           <input accept="application/x-zip-compressed" id="file-uploader-2" type="file" name="contentfile" class="uploader" />',
            '       </div>',
            '       <input type="hidden" name="ofilename">',
            '       <input type="hidden" name="id" />',
            '   </form>',
            '   <footer>',
            '       <button class="button submit">提交</button>',
            '       <button class="button cancel">取消</button>',
            '   </footer>',
            '</div>'
            ].join( "\n" ) );
        };
    } ).getInstance();

} );