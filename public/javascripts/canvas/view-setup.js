/**
* Created with JetBrains WebStorm.
* User: Joe
* Date: 7/31/12
* Time: 10:14 AM
* To change this template use File | Settings | File Templates.
*/

var oldAgents = {};
var agentPaths = { turtles: {}, patches: {}, links: {} };

var patchLayer = project.activeLayer;
var linkLayer = new Layer();
var turtleLayer = new Layer();

var Shapes = (function() {

    var center = new Point({
        x: world.xcorToPixel(0),
        y: world.ycorToPixel(0)
    });

    function _default() {
        turtleLayer.activate();
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
        defaultPath.name = 'path';
        return defaultPath;
    }

    function triangle() {
        turtleLayer.activate();
        var trianglePath = new Path.RegularPolygon(center, 3, 10);
        trianglePath.name = 'path';
        return trianglePath;
    }

    function square() {
        turtleLayer.activate();
        var squarePath = new Path.RegularPolygon(center, 4, 10);
        squarePath.name = 'path';
        return squarePath;
    }

    function circle() {
        turtleLayer.activate();
        var circlePath = new Path.Circle(center, 10);
        circlePath.name = 'path';
        return circlePath;
    }

    function star() {
        turtleLayer.activate();
        var starPath = new Path.Star(center, 5, 4, 10);
        starPath.name = 'path';
        starPath.rotate(180);
        return starPath;
    }

    function patch(size) {
        patchLayer.activate();
        var patchPath = new Path.Rectangle(center, new Size(size, size));
        patchPath.name = 'path';
        return patchPath;
    }

    function group(path) {
        var agentLabel = new PointText(path.position);
        agentLabel.name = 'label';
        return new Group([path, agentLabel]);
    }

    return {
        Default: _default,
        Triangle: triangle,
        Square: square,
        Circle: circle,
        Star: star,
        Patch: patch,
        Group: group
    }

})();

function onFrame(event) {
    updateView();
}

function updateView() {
    var agents = $.extend(true, {}, world.getAgents()); // Take a deep copy of `world`'s agents
    if (typeof agents !== {}) {

        for (var agentType in agents) {

            var agentList = agents[agentType];
            for (var agentNum in agentList) {

                var agent = agentList[agentNum];
                var agentGroup = agentPaths[agentType][agentNum];
                if (agent.isDirty === DirtyState.DEAD) { // This agent is marked for death.

                    destroyAgent(agentGroup, agentType, agentNum);
                    world.kill(agentType, agentNum);

                } else if (agent.isDirty === DirtyState.DIRTY) { // This agent has been changed during this frame.

                    if (agentGroup.visible || agent.isVisible) {
                        // If the agent is not remaining hidden...

                        if (agentType === "links") {
                            updateLink(agent, agentGroup);
                        }

                        for (var agentProp in agent) {

                            var propValue = agent[agentProp];
                            var oldPropValue = oldAgents[agentType][agentNum][agentProp];
                            if (propValue !== oldPropValue) {
                                switch (agentProp) {
                                    case "isVisible":
                                        agentGroup.visible = propValue;
                                        break;
                                    case "color" || "pcolor":
                                        if (agentType === 'links') {
                                            agentGroup.children['path'].strokeColor = propValue;
                                        } else { agentGroup.children['path'].fillColor = propValue }
                                        break;
                                    case "shape":
                                        changeShape(agentGroup, propValue, agent.heading);
                                        break;
                                    case "xcor":
                                        agentGroup.position.x = world.xcorToPixel(propValue);
                                        break;
                                    case "ycor":
                                        agentGroup.position.y = world.ycorToPixel(propValue);
                                        break;
                                    case "heading":
                                        var oldHeading = oldAgents[agentType][agentNum][agentProp];
                                        var rotation = oldHeading - propValue;
                                        agentGroup.children['path'].rotate(rotation);
                                        break;
                                    case "thickness":
                                        agentGroup.children['path'].strokeWidth = propValue;
                                        break;
                                    case "label" || "plabel":
                                        agentGroup.children['label'].content = propValue;
                                        break;
                                    case "labelColor" || "plabelColor":
                                        agentGroup.children['label'].fillColor = agent[agentProp];
                                        break;
                                }
                            }
                        }
                    }

                    world.clean(agentType, agentNum);

                } else if (agent.isDirty === DirtyState.BORN) { // The agent was created during this frame.

                    if (typeof agentGroup !== 'undefined') {
                        destroyAgent(agentGroup, agentType, agentNum);
                    }

                    var creationFunction = getCreateFunction(agentType);
                    creationFunction(agent, agentType, agentNum);

                    world.clean(agentType, agentNum);

                }
            }
        }

        oldAgents = agents;

    }
}

function getCreateFunction(agentType) {
    var retFunc = function(anything) { alert('Could not find creation function for agent type: ' + agentType); };
    switch (agentType) {
        case "turtles":
            retFunc = createTurtle;
            break;
        case "patches":
            retFunc = createPatch;
            break;
        case "links":
            retFunc = createLink;
            break;
    }
    return retFunc;
}

function createTurtle(agent, agentType, agentNum) {
    turtleLayer.activate();
    var shape = agent.shape;
    var newTurtlePath = Shapes[shape]();
    var newTurtleGroup = Shapes.Group(newTurtlePath);
    var newTurtleLabel = newTurtleGroup.children['label'];
    newTurtleGroup.position = {
        x: world.xcorToPixel(agent.xcor),
        y: world.ycorToPixel(agent.ycor)
    };
    newTurtlePath.fillColor = agent.color;
    newTurtlePath.rotate(agent.heading);
    newTurtleLabel.fillColor = agent.labelColor;
    newTurtleLabel.content = agent.label;
    newTurtleGroup.visible = agent.isVisible;
    newTurtleGroup.name = agent.id;
    agentPaths[agentType][agentNum] = newTurtleGroup;
}

function createPatch(agent, agentType, agentNum) {
    patchLayer.activate();
    var newPatchPath = Shapes.Patch(world.patchSize());
    var newPatchGroup = Shapes.Group(newPatchPath);
    var newPatchLabel = newPatchGroup.children['label'];
    newPatchGroup.position = {
        x: world.xcorToPixel(agent.pxcor),
        y: world.ycorToPixel(agent.pycor)
    };
    newPatchPath.fillColor = agent.pcolor;
    newPatchLabel.fillColor = agent.plabelColor;
    newPatchLabel.content = agent.plabel;
    newPatchGroup.name = agent.id;
    agentPaths[agentType][agentNum] = newPatchGroup;
}

function createLink(agent, agentType, agentNum) {
    linkLayer.activate();
    var end1 = {
        x: world.xcorToPixel(agent.end1xcor),
        y: world.ycorToPixel(agent.end1ycor)
    };
    var end2 = {
        x: world.xcorToPixel(agent.end2xcor),
        y: world.ycorToPixel(agent.end2ycor)
    };
    var newLinkPath = new Path.Line(end1, end2);
    var newLinkLabel = new PointText(newLinkPath.position);
    var newLinkGroup = new Group([newLinkPath, newLinkLabel]);
    newLinkPath.name = 'path';
    newLinkLabel.name = 'label';
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
}

function updateLink(agent, agentGroup) {
    linkLayer.activate();
    var updatedEnd1 = {
        x: world.xcorToPixel(agent.end1xcor),
        y: world.ycorToPixel(agent.end1ycor)
    };
    var updatedEnd2 = {
        x: world.xcorToPixel(agent.end2xcor),
        y: world.ycorToPixel(agent.end2ycor)
    };
    var updatedLinkPath = new Path.Line(updatedEnd1, updatedEnd2);
    updatedLinkPath.name = 'path';
    updatedLinkPath.style = agentGroup.children['path'].style;
    agentGroup.children['label'].point = updatedLinkPath.position;
    agentGroup.removeChildren(0, 1);
    agentGroup.insertChild(0, updatedLinkPath);
}

function changeShape(agentGroup, propValue, heading) {
    var oldPath = agentGroup.children['path'];
    var newPath = Shapes[propValue]();
    newPath.position = oldPath.position;
    newPath.rotate(heading);
    newPath.style = oldPath.style;
    agentGroup.removeChildren(0,1);
    agentGroup.insertChild(0, newPath);
}

function destroyAgent(agentGroup, agentType, agentNum) {
    agentGroup.remove();
    delete agentPaths[agentType][agentNum];
}
