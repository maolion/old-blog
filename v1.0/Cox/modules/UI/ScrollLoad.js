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


Define( "ScrollLoad", Depend("~/Cox/Extends/jQuery", "~/Cox/Extends/jQuery.Dom", "~/Cox/Net/Loader"), function(require, ScrollLoad, module)
{
    var 
        jQuery = require("jQuery"),
        Dom    = require("jQuery.Dom"),
        Loader = require("Loader"),
        WIN    = jQuery(window),
        DOC    = jQuery(document)
    ;
    ScrollLoad.Image = Class("ScrollLoadImage", Extends(Loader.ImageLoader), function(Static, Public)
    {
        var DELY_TIMEOUT = 50;
        Public.constructor = XFunction(Optional(jQuery, WIN), Optional(Boolean, false), Optional(Number, Loader.ImageLoader.DEFAULT_THREAD_COUNT), function(container, timely, threadCount)
        {
            var 
                _this     = this,
                delyTimer = null
            ;
            this.Super("constructor", threadCount);
            this.dispatchEvent(
                new Cox.Event("visible")
            );
            this._container = container;
            this._buffer    = [];
            this._listener  = false;
            this._loadHandler = function()
            {
                var 
                    buffer= _this._buffer;
                    vimgs = [],
                    n     = 0
                ;
                for (var i = 0, l = buffer.length; i < l; i++) {
                    var img = buffer[i];
                    if (Dom.elementIsVisible(img, _this._container)) {
                        vimgs.push(img);
                    } else {
                        buffer[n++] = img;
                    }
                }
                buffer.length = n;
                if (vimgs.length) {
                    _this.fireEvent("visible", [vimgs]);
                    _this.push.apply(_this, vimgs);
                }
                if (!n && _this._listener) {
                    _this._container.off("scroll", _this._loadHandler.wrap);
                    _this._listener = false;
                }
            };

            this._loadHandler.wrap  = [
                this._loadHandler,
                function()
                {
                    delyTimer && clearTimeout(delyTimer);
                    delyTimer = setTimeout(_this._loadHandler, DELY_TIMEOUT);
                }
            ][timely ? 0 : 1];

        });
        
        Public.load = XFunction(Array, function(imgs)
        {
            this._buffer.push.apply(this._buffer, XList.map(imgs, getJQueryObject));
            if (!this._listener) {
                this._listener = true;
                this._container.on("scroll", this._loadHandler.wrap);
            }
        });

        Public.load.define(Params(Dom.XImageElement), function(imgs)
        {
            this.load(imgs);
        });

        Public.load.define(jQuery, function(imgs)
        {
            this.load(imgs.get());
        });

        function getJQueryObject(obj)
        {
            return jQuery(obj);
        };
    });
} );
