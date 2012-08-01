/**
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 7/30/12
 * Time: 11:53 AM
 * To change this template use File | Settings | File Templates.
 */

// NetLogo's view has six resize arrows: Up Left, Down Right, Left, Right, Up, Down.
const numArrows = 6;

var ArrowList = [];

for (var _i = 0; _i < numArrows; _i++) {
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
upLeftArrow.name = 'up left';

var downRightArrow = ArrowList[1].rotate(180).translate(new Point(7, 6));
downRightArrow.name = 'down right';

var leftArrow = ArrowList[2].rotate(315).translate(new Point(26, 4));
leftArrow.name = 'left';

var rightArrow = ArrowList[3].rotate(135).translate(new Point(29, 4));
rightArrow.name = 'right';

var upArrow = ArrowList[4].rotate(45).translate(new Point(50, 3));
upArrow.name = 'up';

var downArrow = ArrowList[5].rotate(225).translate(new Point(50, 6));
downArrow.name = 'down';

function onMouseUp(event) {
    world.resize(event.item.name);
}
