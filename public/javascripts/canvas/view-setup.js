/**
* Created with JetBrains WebStorm.
* User: Joe
* Date: 7/31/12
* Time: 10:14 AM
* To change this template use File | Settings | File Templates.
*/

var agents = {};
var agentPaths = { turtles: {}, patches: {}, links: {} };

var Shapes = (function() {

    var center = new Point({
        x: world.xcorToPixel(0),
        y: world.ycorToPixel(0)
    });

    var Default = function() {
        var defaultLabel = new PointText(center);
        var defaultPath = new Path();
        var segments = [
            new Point(6, 0),
            new Point(0, 15),
            new Point(6, 12),
            new Point(12, 15)
        ];
        defaultPath.addSegments(segments);
        defaultPath.closePath();
        defaultPath.position = center;
        return new Group([defaultPath, defaultLabel]);
    };

    var triangle = function() {
        var triangleLabel = new PointText(new Point(center));
        var trianglePath = new Path.RegularPolygon(center, 3, 10);
        return new Group([trianglePath, triangleLabel]);
    };

    var square = function() {
        var squareLabel = new PointText(center);
        var squarePath = new Path.RegularPolygon(center, 4, 10);
        return new Group([squarePath, squareLabel]);
    };

    var circle = function() {
        var circleLabel = new PointText(center);
        var circlePath = new Path.Circle(center, 10);
        return new Group([circlePath, circleLabel]);
    };

    var star = function() {
        var starLabel = new PointText(center);
        var starPath = new Path.Star(center, 5, 4, 10);
        starPath.rotate(180);
        return new Group([starPath, starLabel]);
    };

    var patch = function(size) {
        var patchPath = new Path.Rectangle(center, new Size(size, size));
        var patchLabel = new PointText(patchPath.position);
        return new Group([patchPath, patchLabel]);
    };

    return {
        Default: Default,
        Triangle: triangle,
        Square: square,
        Circle: circle,
        Star: star,
        Patch: patch
    }

})();

init();

function init() {

    var $ticks = $('#ticks');
    var $button = $('#button');
    var $resize = $('#resize');
    var $tickCounter = $('#tickCounter');

    var viewHeight = world.patchSize() * world.worldHeight(); // in pixels
    var viewWidth = world.patchSize() * world.worldWidth(); // in pixels
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
    if (typeof agents !== 'undefined') {

        for (var agentType in agents) {

            var agentList = agents[agentType];
            for (var agentNum in agentList) {

                var agent = agentList[agentNum];
                var agentGroup = agentPaths[agentType][agentNum];
                if (agent.isDirty === -1) { // This agent is marked for death.

                    agentGroup.remove();
                    delete agentPaths[agentType][agentNum];
                    world.kill(agentType, agentNum);

                } else if (agent.isDirty === 1) { // This agent has been changed or created during this frame.

                    if ((typeof agentGroup !== "undefined") && (agentGroup.visible || agent.isVisible)) {
                        // If the agent existed but has been changed, and is not remaining hidden...

                        for (var agentProp in agent) {

                            var propValue = agent[agentProp];

                            switch (agentProp) {
                                case "isVisible":
                                    agentGroup.visible = propValue;
                                    break;
                                case "color" || "pcolor":
                                    agentGroup.firstChild.fillColor = propValue;
                                    agentGroup.firstChild.strokeColor = propValue;
                                    break;
                                case "shape":
                                    var oldPath = agentGroup.firstChild;
                                    var newPath = Shapes[propValue];
                                    newPath.position = oldPath.position;
                                    newPath.style = oldPath.style;
                                    newPath.name = oldPath.name;
                                    agentGroup.removeChildren(0);
                                    agentGroup.insertChild(0, newPath);
                                    break;
                                case "xcor":
                                    agentGroup.position.x = propValue;
                                    break;
                                case "ycor":
                                    agentGroup.position.y = propValue;
                                    break;
                                case "heading":
                                    var oldHeading = parseInt(agentGroup.name);
                                    var diff = oldHeading - propValue;
                                    agentGroup.firstChild.rotate(diff);
                                    agentGroup.firstChild.name = propValue.toString();
                                    break;
                                case "label" || "plabel":
                                    agentGroup.lastChild.content = propValue;
                                    break;
                                case "labelColor" || "plabelColor":
                                    agentGroup.lastChild.fillColor = agent[agentProp];
                                    break;
                            }
                        }

                        if (agentType === "links") {
                            var updatedEnd1 = {
                                x: agent.end1xcor,
                                y: agent.end1ycor
                            };
                            var updatedEnd2 = {
                                x: agent.end2xcor,
                                y: agent.end2ycor
                            };
                            var updatedLinkPath = new Path.Line(updatedEnd1, updatedEnd2);
                            updatedLinkPath.style = agentGroup.firstChild.style;
                            agentGroup.lastChild.point = updatedLinkPath.position;
                            agentGroup.removeChildren(0);
                            agentGroup.insertChild(0, updatedLinkPath);
                        }

                    } else { // The agent was created during this frame.

                        switch (agentType) {
                            case "turtles":
                                var shape = agent.shape;
                                var newTurtleGroup = Shapes[shape];
                                var newTurtlePath = newTurtleGroup.firstChild;
                                var newTurtleLabel = newTurtleGroup.lastChild;
                                newTurtleGroup.position = {
                                    x: world.xcorToPixel(agent.xcor),
                                    y: world.ycorToPixel(agent.ycor)
                                };
                                newTurtlePath.fillColor = agent.color;
                                newTurtlePath.strokeColor = agent.color;
                                newTurtlePath.name = agent.heading.toString();
                                newTurtlePath.rotate(agent.heading);
                                newTurtleLabel.fillColor = agent.labelColor;
                                newTurtleLabel.content = agent.label;
                                newTurtleGroup.visible = agent.isVisible;
                                newTurtleGroup.name = agent.id;
                                agentPaths[agentType][agentNum] = newTurtleGroup;
                                break;
                            case "patches":
                                var newPatchGroup = Shapes.Patch(world.patchSize());
                                var newPatchPath = newPatchGroup.firstChild;
                                var newPatchLabel = newPatchGroup.lastChild;
                                newPatchGroup.position = {
                                    x: world.xcorToPixel(agent.pxcor),
                                    y: world.ycorToPixel(agent.pycor)
                                };
                                newPatchPath.fillColor = agent.pcolor;
                                newPatchPath.strokeColor = agent.pcolor;
                                newPatchLabel.fillColor = agent.plabelColor;
                                newPatchLabel.content = agent.plabel;
                                newPatchGroup.name = agent.id;
                                agentPaths[agentType][agentNum] = newPatchGroup;
                                break;
                            case "links":
                                var end1 = {
                                    x: agent.end1xcor,
                                    y: agent.end1ycor
                                };
                                var end2 = {
                                    x: agent.end2xcor,
                                    y: agent.end2ycor
                                };
                                var newLinkPath = new Path.Line(end1, end2);
                                var newLinkLabel = new PointText(newLinkPath.position);
                                var newLinkGroup = new Group([newLinkPath, newLinkLabel]);
                                newLinkPath.style = {
                                    strokeColor: agent.color,
                                    strokeWidth: agent.thickness,
                                    strokeCap: 'round'
                                };
                                newLinkLabel.fillColor = agent.labelColor;
                                newLinkLabel.content = agent.label;
                                newLinkGroup.visible = agent.isVisible;
                                newLinkGroup.name = agent.id;
                                agentPaths[agentType][agentNum] = newLinkGroup;
                                break;
                        }

                    }

                    world.clean(agentType, agentNum);

                }
            }
        }
    }
}

function onFrame(event) {
    updateView();
}
