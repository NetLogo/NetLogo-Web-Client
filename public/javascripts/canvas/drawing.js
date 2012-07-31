/**
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 7/6/12
 * Time: 3:25 PM
 * To change this template use File | Settings | File Templates.
 */

var turtleArray = [];

for (var _i = 0; _i < 50; _i++) {
    var instance = new Path.RegularPolygon(new Point(0,0), 3, 10);
    instance.style = {
        strokeColor: 'white',
        fillColor: 'blue'
    };
    instance.name = "turtle " + _i;
    instance.position = Point.random() * view.size;
    instance.rotate(Math.random() * 360);
    turtleArray[_i] = instance;
}

tool.minDistance = 5;

function onMouseDrag(event) {
    var $view = document.getElementById('view');
    var num, turtle, viewSize = new Point($view.width, $view.height);
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
