/**
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 7/30/12
 * Time: 11:53 AM
 * To change this template use File | Settings | File Templates.
 */

var ArrowList = [];

for (var _i = 0; _i < 6; _i++) {
    var segments = [new Point(0,0), new Point(11,0), new Point(0,11)];
    var arrow = new Path(segments);
    arrow.closePath();
    arrow.style = {
        fillColor: 'black',
        strokeColor: 'black'
    };
    ArrowList[_i] = arrow;
}

var upLeftArrow = ArrowList[0].translate(new Point(5, 3));

var downRightArrow = ArrowList[1].rotate(180).translate(new Point(7, 6));

var leftArrow = ArrowList[2].rotate(315).translate(new Point(26, 4));

var rightArrow = ArrowList[3].rotate(135).translate(new Point(29, 4));

var upArrow = ArrowList[4].rotate(45).translate(new Point(50, 3));

var downArrow = ArrowList[5].rotate(225).translate(new Point(50, 6));

function onMouseUp(event) {
    switch (event.item) {
        case upLeftArrow:
            alert('up left');
            break;
        case downRightArrow:
            alert('down right');
            break;
        case leftArrow:
            alert('left');
            break;
        case rightArrow:
            alert('right');
            break;
        case upArrow:
            alert('up');
            break;
        case downArrow:
            alert('down');
            break;
    }
}
