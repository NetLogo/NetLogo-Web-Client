/**
* Created with JetBrains WebStorm.
* User: Joe
* Date: 7/31/12
* Time: 10:14 AM
* To change this template use File | Settings | File Templates.
*/

var turtleArray = [];

init();
createTurtles();

function init() {

    var $ticks = $('#ticks');
    var $button = $('#button');
    var $resize = $('#resize');
    var $tickCounter = $('#tickCounter');

    var viewHeight = world.patchSize() * (2 * world.maxpycor() + 1); // in pixels
    var viewWidth = world.patchSize() * (2 * world.maxpxcor() + 1); // in pixels
    view.viewSize = new Size(viewWidth, viewHeight);

    var tickWidthStr = $ticks.css('width');
    var buttonWidthStr = $button.css('width');
    var resizeWidthStr = $resize.css('width');
    var tickWidth = parseInt(tickWidthStr.substr(0, tickWidthStr.length - 2));
    var buttonWidth = parseInt(buttonWidthStr.substr(0, buttonWidthStr.length - 2));
    var resizeWidth = parseInt(resizeWidthStr.substr(0, resizeWidthStr.length - 2));
    var tickCounterWidth = viewWidth - (tickWidth + buttonWidth + resizeWidth);
    $tickCounter.css('width', tickCounterWidth);

}

function createTurtles() {
    for (var _i = 0; _i < 50; _i++) {
        var instance = new Path.RegularPolygon(new Point(0,0), 3, 10);
        instance.style = {
            strokeColor: 'white',
            fillColor: 'blue'
        };
        instance.name = "turtle " + _i; // a turtle with the name 'turtle (x)' have the id (x + 10)
        instance.position = Point.random() * view.size;
        instance.rotate(Math.random() * 360);
        turtleArray[_i] = instance;
    }
}

function onMouseDrag(event) {
    var num, turtle, viewSize = new Point(view.viewSize);
    for (num in turtleArray) {
        turtle = turtleArray[num];
        turtle.position = (viewSize + turtle.position + event.delta) % viewSize;
        turtle.fillColor = 'red';
    }
}

function onMouseUp(event) {
    var num, turtle;
    var color = new RgbColor(Math.random(), Math.random(), Math.random());
    for (num in turtleArray) {
        turtle = turtleArray[num];
        turtle.fillColor = color;
    }
}
