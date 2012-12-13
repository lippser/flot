/*!
 * jquery.flot.canvaslegend.js
 * Copyright (C) 2012 NETWAYS GmbH, http://netways.de
 * jquery.flot.canvaslegend.js may be freely distributed under the MIT license.
 */

; (function () {
    'use strict';
    var $ = this.jQuery,
        $options;
    /**
     * Draws the legend on the canvas. Mirros the look of the vanilla one.
     * The HTML-driven version will be removed from the DOM.
     */
    function replaceLegend($plot, ctx) {
        if ($options.legend.container) {
            /*
             * TODO(el): Off-plot placement of the legend.
             */
            return;
        }
        var $placeholder = $plot.getPlaceholder(),
            $legend = $placeholder.find('.legend');
//            $legendPosition = $legend.position(); doesn't work Node.js and jsdom ;-(
        if (!$legend) {
            // Either no data or no labels
            return;
        }
        var $labelFormatter = $options.legend.labelFormatter,
            $legendPosition = (function () {
                var html = $legend.html(),
                    top = html.match(/top: (\d+)px;/),
                    right = html.match(/right: (\d+)px;/),
                    bottom = html.match(/bottom: (\d+)px;/),
                    left = html.match(/left: (\d+)px;/),
                    x,
                    y;
                if (null === left) {
                    x = $plot.width() - parseInt(right[1], 10);
                } else {
                    x = parseInt(left[1], 10);
                }
                if (null === top) {
                    y = $plot.height() - parseInt(bottom[1], 10);
                } else {
                    y = parseInt(top[1], 10);
                }
                return {
                    x: x,
                    y: y
                };
            }());
        ctx.save();
        /*!
         * TODO(el):
         * if ($options.legend.backgroundOpacity > 0
         *     && $options.legend.backgroundOpacity < 1
         * ) {
         *     ctx.globalAlpha = $options.legend.backgroundOpacity;
         *     ctx.fillStyle = $options.legend.backgroundColor;
         *     ctx.fillRect(x, y, legendWidth, legendHeight);
         * }
         */
        ctx.font = $placeholder.css('font-style') + ' ' +
            $placeholder.css('font-variant') + ' ' +
            $placeholder.css('font-weight') + ' ' +
            $placeholder.css('font-size') + ' ' +
            $placeholder.css('font-family');
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        $.each($plot.getData(), function (i, $series) {
            if (!$series.label) {
                // continue
                return true;
            }
            $legendPosition.y += (i * 18); // 18 is the height of a color box and label line
            // Draw 18x14 rectangle filled with the label box's border color
            ctx.fillStyle = $options.legend.labelBoxBorderColor;
            ctx.fillRect($legendPosition.x, $legendPosition.y, 18, 14);
            // Draw 16x12 white filled rectangle on top of the latter,
            // i.e. leave a border with a width of one
            ctx.fillStyle = '#FFF';
            ctx.fillRect($legendPosition.x + 1, $legendPosition.y + 1, 16, 12);
            // Draw 14x10 series color filled rectangle on top of the latter,
            // i.e. leave again a border with a width of one
            ctx.fillStyle = $series.color;
            ctx.fillRect($legendPosition.x + 2, $legendPosition.y + 2, 14, 10);
            ctx.fillStyle = $options.grid.color;
            ctx.fillText(
                $labelFormatter ? $labelFormatter($series.label, $series) :
                        $series.label,
                $legendPosition.x + 22, // 22 is the width of a color box
                $legendPosition.y
            );
        });
        ctx.restore();
        $legend.remove();
    }
    function init($plot) {
        $options = $plot.getOptions();
        if ($options.legend.show) {
            $plot.hooks.draw.push(replaceLegend);
        }
    }
    $.plot.plugins.push({
        init: init,
        options: {},
        name: 'canvaslegend',
        version: '1.0'
    });
}.call(this));
