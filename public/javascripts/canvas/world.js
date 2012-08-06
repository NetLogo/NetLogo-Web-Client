/**
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 8/1/12
 * Time: 11:17 AM
 * To change this template use File | Settings | File Templates.
 */

/*
The input from the server should have the following format:

input =
{
    changeType: 'create' 'update' 'remove',
    agents: {
        turtles: {
            <id>: {
                id:
                who:
                breed:
                color:
                xcor:
                ycor:
                shape:
                heading:
                isHidden:
                label:
                labelColor:
                penMode:
                penSize:
            }
        },
        patches: {
            <id>: {
                id:
                pcolor:
                plabel:
                plabelColor:
                pxcor:
                pycor:
            }
        },
        links: {
            <id>: {
                id:
                breed:
                color:
                end1:
                end2:
                isHidden:
                label:
                labelColor:
                shape:
                thickness:
            }
        }
    }
}

 */

var world = (function() {

    var isRunning = false;

    var agents = { turtles: {}, patches: {}, links: {} };

    var patchSize = 13; // in pixels
    var maxpxcor = 16;
    var maxpycor = 16;

    function resize(direction) {
        if (!world.isRunning()) {
            switch (direction) {
                case 'up left':
                    maxpxcor--;
                    maxpycor--;
                    break;
                case 'down right':
                    maxpxcor++;
                    maxpycor++;
                    break;
                case 'left':
                    maxpxcor--;
                    break;
                case 'right':
                    maxpxcor++;
                    break;
                case 'up':
                    maxpycor--;
                    break;
                case 'down':
                    maxpycor++;
                    break;
            }
        } else {
            alert('Resizing is not allowed while running a model.');
        }
    }

    function changeRunState() {
        running = !running;
    }

    function xcorToPixel(xcor) {
        if (patchSize % 2) {
            return (patchSize * xcor) + (patchSize * (2 * maxpxcor + 1) - 1) / 2;
        } else {
            return (patchSize * xcor) + patchSize * (2 * maxpxcor + 1) / 2;
        }
    }

    function ycorToPixel(ycor) {
        if (patchSize % 2) {
            return  (patchSize * (2 * maxpycor + 1) - 1) / 2 - (patchSize * ycor);
        } else {
            return patchSize * (2 * maxpycor + 1) / 2 - (patchSize * ycor);
        }
    }

    function pixelToXcor(pixel) {
        if (patchSize % 2) {
            return (pixel - (patchSize * (2 * maxpxcor + 1) - 1) / 2) / patchSize;
        } else {
            return (pixel - patchSize * (2 * maxpxcor + 1) / 2) / patchSize;
        }
    }

    function pixelToYcor(pixel) {
        if (patchSize % 2) {
            return ((patchSize * (2 * maxpycor + 1) - 1) / 2 - pixel) / patchSize;
        } else {
            return (patchSize * (2 * maxpycor + 1) / 2 - pixel) / patchSize;
        }
    }

    function updateWorld(input) {
        var type = input.changeType;
        var inputAgents = input.agents;
        if (type === 'create') {
            createAgents(inputAgents);
        } else if (type === 'update') {
            updateAgents(inputAgents);
        } else if (type === 'remove') {
            removeAgents(inputAgents);
        }
    }

    function createAgents(agentsAdditions) {
        for (var agentType in agentsAdditions) {
            var agentList = agentsAdditions[agentType];
            for (var agentNum in agentList) {
                agents[agentType][agentNum] = agentList[agentNum];
            }
        }
    }

    function updateAgents(agentsChanges) {
        for (var agentType in agentsChanges) {
            var agentList = agentsChanges[agentType];
            for (var agentNum in agentList) {
                var agent = agentList[agentNum];
                for (var agentProp in agent) {
                    agents[agentNum][agentProp] = agent[agentProp];
                }
            }
        }
    }

    function removeAgents(agentsDeaths) {
        for (var agentType in agentsDeaths) {
            var agentList = agentsDeaths[agentType];
            for (var agentNum in agentList) {
                delete agents[agentType][agentNum];
            }
        }
    }

    return {

        isRunning: function() { return isRunning },

        getTurtles: function() { return agents.turtles },
        getPatches: function() { return agents.patches },
        getLinks: function() { return agents.links },

        patchSize: function() { return patchSize },
        maxpxcor: function() { return maxpxcor },
        maxpycor: function() { return maxpycor },

        resize: resize,

        changeRunState: changeRunState,

        pixelToXcor: pixelToXcor,
        pixelToYcor: pixelToYcor,
        xcorToPixel: xcorToPixel,
        ycorToPixel: ycorToPixel,

        updateWorld: updateWorld

    };

})();
