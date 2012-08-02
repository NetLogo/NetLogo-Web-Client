/**
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 8/2/12
 * Time: 12:02 PM
 * To change this template use File | Settings | File Templates.
 */

/*
The input from the server should have the following format:

Changes =
{
    Turtles: {
        who: {
            who:
            color:
            xcor:
            ycor:
            shape:
            heading:
            isHidden:
        }
    }
    Patches: {}
    Links: {}
 }
 */

var view = (function() {

    var paper;

    var turtles = [];
    var patches = [];
    var links = [];

    var patchSize = 13;
    var maxpxcor = 16;
    var maxpycor = 16;

    function init() {

        var $ticks = $('#ticks');
        var $button = $('#button');
        var $resize = $('#resize');
        var $tickCounter = $('#tickCounter');
        var $view = $('#view');

        var viewHeight = patchSize * (2 * maxpycor + 1); // in pixels
        var viewWidth = patchSize * (2 * maxpxcor + 1); // in pixels
        $view.css({ width: viewWidth, height: viewHeight });

        var tickWidthStr = $ticks.css('width');
        var buttonWidthStr = $button.css('width');
        var resizeWidthStr = $resize.css('width');
        var tickWidth = parseInt(tickWidthStr.substr(0, tickWidthStr.length - 2));
        var buttonWidth = parseInt(buttonWidthStr.substr(0, buttonWidthStr.length - 2));
        var resizeWidth = parseInt(resizeWidthStr.substr(0, resizeWidthStr.length - 2));
        var tickCounterWidth = viewWidth - (tickWidth + buttonWidth + resizeWidth);
        $tickCounter.css('width', tickCounterWidth);

        paper = Raphael('view', viewWidth, viewHeight);

    }

    function updateView(changes) {
        var turtlesChanges = changes.Turtles;
        var patchesChanges = changes.Patches;
        var linksChanges = changes.Links;
        updateTurtles(turtlesChanges);
        updatePatches(patchesChanges);
        updateLinks(linksChanges);
    }

    function updateTurtles(changes) {
        var who;
        for (who in changes) {

            var turtleChanges = changes[who];
            var turtle = turtles[who];

            var property;
            for (property in turtleChanges) {
                turtle.data(property, turtleChanges[property]);
            }

            // use updated data to calculate element attributes
        }
    }

    return {

        init: init

    }

})();
