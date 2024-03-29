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

Define("Loader", Depend("~/Cox/Extends/jQuery", "~/Cox/Tools/Queue", "~/Cox/Env"), function(require, Loader, module)
{

    var 
        Queue        = require("Queue"),
        jQuery       = require("jQuery"),
        Env          = require("Env"),
        OLD_IE       = Env.name === "ie" && ~~Env.version < 9,
        ImageElement = {
            __instancelike__ : function(obj)
            {
                if (!obj || obj.nodeName !== "IMG" || obj.nodeType !== 1) {
                    return false;
                }
                return true;   
            }
        }
    ;
    Loader.loadStyleSheet = XFunction(String, [
        function(CSS){
            document.createStyleSheet().cssText = cssText;
        },
        function(css){
            var style         = document.createElement('style');
            style.type        = 'text/css';
            style.textContent = cssText;
            document.documentElement.insertBefore( style, null );   
        }
    ][document.createStyleSheet ? 0 : 1]);

    Loader.ImageLoader = Class("ImageLoader", Extends(Queue), function(Static, Public)
    {
        var Loader = null;
        Static.DEFAULT_THREAD_COUNT = 3;

        Loader = Class("Loader", Extends(Queue.Handler), function(Static, Public)
        {
            Public.constructor = XFunction(function()
            {
                var _this = this;
                this.Super("constructor");
                this._curImage = null;

                this._onLoadHandler = [
                    function()
                    {
                        setTimeout(function(){
                            _this.fireEvent("done", [true, _this._curImage]);
                        }, 0);
                        _this._curImage.off("error", _this._onErrorHandler);
                        
                    },
                    function()
                    {
                        _this._curImage.off("error", _this._onErrorHandler);
                        _this.fireEvent("done", [true, _this._curImage]);
                    }
                ][OLD_IE ? 0 : 1];

                this._onErrorHandler = function()
                {
                    _this._curImage.off("load", _this._onLoadHandler);
                    _this.fireEvent("done", [false, _this._curImage]);
                }
            });

            Public.exec = function(image)
            {
                var 
                    src   = image.attr("data-src")
                ;
                this._curImage = image;
                this._busy = true;
                if (!src) {
                    this.fireEvent("done", [false, image]);
                    return;
                }  
                image.one("load", this._onLoadHandler);
                image.one("error", this._onErrorHandler);
                image.attr('src', src);
                image = null;
            }
            Public.reset = function()
            {
                this._busy     = false;
                this._curImage = null;
            };
        });

        Public.constructor = XFunction(Optional(Number, Static.DEFAULT_THREAD_COUNT), function(threadCount)
        {
            this.Super("constructor", Loader, threadCount);
        });

        Public.load = XFunction(jQuery, function(imgs)
        {
            var _this = this;
            imgs.each(function(index, img)
            {
                _this.push(imgs.slice(index, index + 1));
            });
        });

        Public.load.define(Params(ImageElement), function(imgs)
        {
            var _this = this;
            XList.forEach(imgs, function(img, index)
            {
                _this.push(jQuery(img));
            });
        });

        Public.load.define(String, function(src)
        {
            this.push(jQuery("<img data-src='"+src+"'/>"));
        });
    });
});
