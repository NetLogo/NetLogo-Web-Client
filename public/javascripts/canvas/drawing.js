/**
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 7/6/12
 * Time: 3:25 PM
 * To change this template use File | Settings | File Templates.
 */
var index = 0;
var path = new Path.RegularPolygon(new Point(0,0), 3, 10);
path.style = {
    strokeColor: 'white',
    fillColor: 'blue',
    id: "turtle " + index
};

var symbol = new Symbol(path);

var symbolArray = {};

for (var _i = 0; _i < 50; _i++) {
    var instance = symbol.place();
    instance.position = Point.random() * view.size;
    instance.rotate(Math.random() * 360);
    symbolArray[index] = instance;
    index++;
}


tool.minDistance = 5;

function onMouseDrag(event) {
    var num, turtle;
    var color = new RgbColor(Math.random(), Math.random(), Math.random());
    for (num in symbolArray) {
        turtle = symbolArray[num];
        turtle.position = turtle.position + event.delta;
        turtle.fillColor = 'red';
    }
}

function onMouseUp(event) {
    alert(event.item);
}

/*function onMouseUp(event) {
    var num, turtle;
    var color = new RgbColor(Math.random(), Math.random(), Math.random());
    for (num in symbolArray) {
        turtle = symbolArray[num];
        turtle.style.fillColor = color;
    }
}*/
