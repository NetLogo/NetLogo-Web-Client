/*! Textarea Line Count - v1.4 - 2012-06-27
* https://bitbucket.org/MostThingsWeb/textarea-line-count
* Copyright (c) 2012 MostThingsWeb (Chris Laplante); Licensed MIT */

(function($){
    $.countLines = function(ta, options){
        var masterCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var counter;
        var value = ta.val();
        switch (options.charsMode){
            case "random":
                // Build a random collection of characters
                options.chars = "";
                masterCharacters += ".,?!-+;:'\"";
                for (counter = 1; counter <= 12; counter++){
                    options.chars += masterCharacters[(Math.floor(Math.random() * masterCharacters.length))];
                }
                break;
            case "alpha":
                options.chars = masterCharacters;
                break;
            case "alpha_extended":
                options.chars = masterCharacters + ".,?!-+;:'\"";
                break;
            case "from_ta":
                // Build a random collection of characters from the textarea
                if (value.length < 15){
                    options.chars = masterCharacters;
                }
                else {
                    for (counter = 1; counter <= 15; counter++){
                        options.chars += value[(Math.floor(Math.random() * value.length))];
                    }
                }
                break;
            case "custom":
                // Already defined in options.chars
                break;
        }

        // Decode chars
        if (!$.isArray(options.chars)){
            options.chars = options.chars.split("");
        }

        // Generate a span after the textarea with a random ID
        var id = "";
        for (counter = 1; counter <= 10; counter++){
            id += (Math.floor(Math.random() * 10) + 1);
        }

        ta.after("<span id='s" + id + "'></span>");
        var span = $("#s" + id);

        // Hide the span
        span.hide();

        // Apply the font properties of the textarea to the span class
        $.each(options.fontAttrs, function(i, v){
            span.css(v, ta.css(v));
        });

        // Get the number of lines
        var lines = value.split("\n");
        var linesLen = lines.length;

        var averageWidth;

        // Check if the textarea has a cached version of the average character width
        if (options.recalculateCharWidth || ta.data("average_char") == null) {
            // Get a pretty good estimation of the width of a character in the textarea. To get a better average, add more characters and symbols to this list
            var chars = options.chars;

            var charLen = chars.length;
            var totalWidth = 0;

            $.each(chars, function(i, v){
                span.text(v);
                totalWidth += span.width();
            });

            // Store average width on textarea
            ta.data("average_char", Math.ceil(totalWidth / charLen));
        }

        averageWidth = ta.data("average_char");

        // We are done with the span, so kill it
        span.remove();

        // Determine missing width (from padding, margins, borders, etc); this is what we will add to each line width
        var missingWidth = (ta.outerWidth() - ta.width()) * 2;

        // Calculate the number of lines that occupy more than one line
        var lineWidth;

        var wrappingLines = 0;
        var wrappingCount = 0;
        var blankLines = 0;

        $.each(lines, function(i, v){
            // Calculate width of line
            lineWidth = ((v.length + 1) * averageWidth) + missingWidth;
            // Check if the line is wrapped
            if (lineWidth >= ta.outerWidth()){
                // Calculate number of times the line wraps
                var wrapCount = Math.floor(lineWidth / ta.outerWidth());
                wrappingCount += wrapCount;
                wrappingLines++;
            }

            if ($.trim(v) === ""){
                blankLines++;
            }
        });

        var ret = {};
        ret["actual"] = linesLen;
        ret["wrapped"] = wrappingLines;
        ret["wraps"] = wrappingCount;
        ret["visual"] = linesLen + wrappingCount;
        ret["blank"] = blankLines;

        return ret;
    };
}(jQuery));

