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
    tick: <int>,
    creations: <obj>,
    updates: <obj>,
    removals: <obj>
}

<obj> =
{
    turtles: {
        <id>: {
            id:
            who:
            breed:
            color: <6-digit hex number>
            xcor: <int>
            ycor:<int>
            shape: <'Default', 'Triangle', 'Square', 'Circle', 'Star'>
            heading: <int>
            isVisible: <boolean>
            label: <string>
            labelColor: <6-digit hex number>
            penMode:
            penSize:
            isDirty:
        }
    },
    patches: {
        <id>: {
            id:
            pcolor: <6-digit hex number>
            plabel:
            plabelColor: <6-digit hex number>
            pxcor: <int>
            pycor: <int>
            isDirty:
        }
    },
    links: {
        <id>: {
            id:
            breed:
            color: <6-digit hex number>
            end1xcor:
            end1ycor:
            end2xcor:
            end2ycor:
            isVisible: <boolean>
            label:
            labelColor: <6-digit hex number>
            shape:
            thickness:
            isDirty:
        }
    }
}

The isDirty property will record three states:
    1.) changed since last world update,   (1)
    2.) unchanged since last world update, (0)
    3.) marked for deletion.               (-1)

This will allow the paperscript to save time by not redrawing agents that haven't changed.
The server should not send information changing the value of isDirty.
 */

var DirtyState = {
    CLEAN: 0,
    DIRTY: 1,
    DEAD: -1
};

exports.DirtyState = DirtyState;

var world = (function() {

    var isRunning = false;

    var agents = { turtles: {}, patches: {}, links: {} };

    var patchSize = 13; // in pixels
    var maxpxcor = 16;
    var maxpycor = 16;

    var worldHeight = (2 * maxpycor + 1);
    var worldWidth = (2 * maxpxcor + 1);

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
        return (patchSize * xcor) + (worldWidth * patchSize / 2);
    }

    function ycorToPixel(ycor) {
        return (patchSize * -ycor) + (worldWidth * patchSize / 2);
    }

    //@ These are wrong...
    function pixelToXcor(pixel) {
        return pixel / patchSize;
    }

    function pixelToYcor(pixel) {
        return pixel / patchSize;
    }

    function updateWorld(input) {
        for (var prop in input) {
            var changeAgents = changeFunction(prop);
            changeAgents(input[prop]);
        }
    }

    function changeFunction(prop) {
        var retFunc;
        switch (prop) {
            case 'creations':
                retFunc = createAgents;
                break;
            case 'updates':
                retFunc = updateAgents;
                break;
            case 'removals':
                retFunc = removeAgents;
                break;
            default:
                retFunc = doNothing;
        }
        return retFunc;
    }

    function doNothing(anything) {}

    function createAgents(agentsAdditions) {
        for (var agentType in agentsAdditions) {
            var agentList = agentsAdditions[agentType];
            for (var agentNum in agentList) {
                agents[agentType][agentNum] = agentList[agentNum];
                agents[agentType][agentNum].isDirty = DirtyState.DIRTY;
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
                agent.isDirty = DirtyState.DIRTY;
            }
        }
    }

    function removeAgents(agentsDeaths) {
        for (var agentType in agentsDeaths) {
            var agentList = agentsDeaths[agentType];
            for (var agentNum in agentList) {
                agents[agentType][agentNum].isDirty = DirtyState.DEAD;
            }
        }
    }

    return {

        isRunning: function() { return isRunning },

        getAgents: function() { return agents },

        getTurtles: function() { return agents.turtles },
        getPatches: function() { return agents.patches },
        getLinks: function() { return agents.links },

        patchSize: function() { return patchSize },
        maxpxcor: function() { return maxpxcor },
        maxpycor: function() { return maxpycor },

        worldHeight: function() { return worldHeight },
        worldWidth: function() { return worldWidth },

        kill: function(agentType, id) { delete agents[agentType][id] },

        clean: function(agentType, id) { agents[agentType][id].isDirty = DirtyState.CLEAN },

        resize: resize,

        changeRunState: changeRunState,

        pixelToXcor: pixelToXcor,
        pixelToYcor: pixelToYcor,
        xcorToPixel: xcorToPixel,
        ycorToPixel: ycorToPixel,

        updateWorld: updateWorld

    };

})();
