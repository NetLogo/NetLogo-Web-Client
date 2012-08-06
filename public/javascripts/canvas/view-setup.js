/**
* Created with JetBrains WebStorm.
* User: Joe
* Date: 7/31/12
* Time: 10:14 AM
* To change this template use File | Settings | File Templates.
*/

var agents = {};
var agentPaths = {};

var Shapes = (function() {

    var center = new Point({
        x: world.xcorToPixel(0),
        y: world.ycorToPixel(0)
    });

    var triangle = function() {
        var triangleLabel = new PointText(new Point(0,0));
        var trianglePath = new Path.RegularPolygon(center, 3, 10);
        return new Group([trianglePath, triangleLabel]);
    };

    var square = function() {
        var squareLabel = new PointText(0,0);
        var squarePath = new Path.RegularPolygon(center, 4, 10);
        return new Group([squarePath, squareLabel]);
    };

    return {
        Triangle: triangle,
        Square: square
    }

})();

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

function updateView() {
    agents = world.getAgents();
    for (var agentType in agents) {

        var agentList = agents[agentType];
        for (var agentNum in agentList) {

            var agent = agentList[agentNum];
            var agentPath = agentPaths[agentNum];
            if (agent.isDirty === -1) { // This agent is marked for death.

                delete agentPaths[agentNum];
                agentPath.remove();
                world.kill(agentType, agentNum);

            } else if (agent.isDirty === 1) { // This agent has been changed.

                for (var agentProp in agent) {

                    var propValue = agent[agentProp];

                    switch (agentProp) {
                        case "isVisible":
                            agentPath.visible = propValue;
                            break;
                        case "color" || "pcolor":
                            agentPath.firstChild.fillColor = propValue;
                            agentPath.firstChild.strokeColor = propValue;
                            break;
                        case "shape":
                            var oldPath = agentPath.firstChild;
                            var newPath = Shapes[propValue];
                            newPath.position = oldPath.position;
                            newPath.style = oldPath.style;
                            newPath.visible = oldPath.visible;
                            newPath.name = oldPath.name;
                            agentPath.removeChildren(0);
                            agentPath.insertChild(0, newPath);
                            break;
                        case "xcor":
                            agentPath.position.x = propValue;
                            break;
                        case "ycor":
                            agentPath.position.y = propValue;
                            break;
                        case "heading":
                            var oldHeading = parseInt(agentPath.name);
                            var diff = oldHeading - propValue;
                            agentPath.firstChild.rotate(diff);
                            agentPath.name = propValue.toString();
                            break;
                        case "label" || "plabel":
                            agentPath.lastChild.content = propValue;
                            break;
                        case "labelColor" || "plabelColor":
                            agentPath.lastChild.fillColor = agent[agentProp];
                            break;
                    }
                }
            }
        }
    }
}

function onFrame(event) {
    updateView();
}

// Need to refine use of name to record heading.
// Keep track of whose name will be used, and refactor for clarity (path vs label vs group).

/*
function createTurtles() {
    var turtles = world.getTurtles();
    var _i, length = turtles.length;
    for (_i = 0; _i < length; _i++) {

        var turtle = turtles[_i];
        var color = turtle.color;
        var turtleProp;
        var turtlePath = new Path();

        for (turtleProp in turtle) {
            if (turtleProp === 'position') {
                turtlePath[turtleProp] = new Point(turtle[turtleProp]);
            } else {
                turtlePath[turtleProp] = turtle[turtleProp];
            }
        }

        turtleArray[turtlePath.name] = turtlePath;

    }
}

function updateTurtles() {
    var turtlesChanges = world.getTurtleChanges();
    var turtleWho;
    for (turtleWho in turtlesChanges) {
        var turtle = turtleArray[turtleWho];
        var turtleChanges = turtlesChanges[turtleWho];
        var prop;
        for (prop in turtleChanges) {
            if (prop === 'position') {
                turtle[prop] = new Point(turtleChanges[prop]);
            } else {
                turtle[prop] = turtleChanges[prop];
            }
        }
    }
}
*/
