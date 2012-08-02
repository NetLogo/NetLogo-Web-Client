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
    type: 'create' 'update' 'remove'
    Agents: {
        Turtles: {
            id: {
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
        }
        Patches: {
            id: {
                id:
                pcolor:
                plabel:
                plabelColor:
                pxcor:
                pycor:
            }
        }
        Links: {
            id: {
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

 The objects turtles, patches, and links (below) will have the same formats as Turtles, Patches, Links (above).
 */

var world = (function() {

    var isRunning = false;

    var turtles = {};
    var patches = {};
    var links = {};

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
        var Agents = input.Agents;
        if (input.type === 'create') {
            createAgents(Agents);
        } else if (input.type === 'update') {
            updateAgents(Agents);
        } else if (input.type === 'remove') {
            removeAgents(Agents);
        }
    }

    function createAgents(agentsAdditions) {
        var turtlesAdditions = agentsAdditions.Turtles;
        var linksAdditions = agentsAdditions.Links;
        addTurtles(turtlesAdditions);
        addLinks(linksAdditions);
    }

    function updateAgents(agentsChanges) {
        var turtlesChanges = agentsChanges.Turtles;
        var patchesChanges = agentsChanges.Patches;
        var linksChanges = agentsChanges.Links;
        updateTurtles(turtlesChanges);
        updatePatches(patchesChanges);
        updateLinks(linksChanges);
    }

    function removeAgents(agentsDeaths) {
        var turtleDeaths = agentsDeaths.Turtles;
        var linksDeaths = agentsDeaths.Links;
        removeTurtles(turtleDeaths);
        removeLinks(linksDeaths);
    }

    function addTurtles(additions) {
        var id;
        for (id in additions) {
            turtles[id] = additions[id];
        }
    }

    function addLinks(additions) {
        var id;
        for (id in additions) {
            links[id] = additions[id];
        }
    }

    function updateTurtles(changes) {
        var id;
        for (id in changes) {
            var turtleChanges = changes[id];
            var turtle = turtles[id];
            var prop;
            for (prop in turtleChanges) {
                turtle[prop] = turtleChanges[prop];
            }
        }
    }

    function updatePatches(changes) {
        var id;
        for (id in changes) {
            var patchChanges = changes[id];
            var patch = patches[id];
            var prop;
            for (prop in patchChanges) {
                patch[prop] = patchChanges[prop];
            }
        }
    }

    function updateLinks(changes) {
        var id;
        for (id in changes) {
            var linkChanges = changes[id];
            var link = links[id];
            var prop;
            for (prop in linkChanges) {
                link[prop] = linkChanges[prop];
            }
        }
    }

    function removeTurtles(deaths) {
        var id;
        for (id in deaths) {
            delete turtles[id];
        }
    }

    function removeLinks(deaths) {
        var id;
        for (id in deaths) {
            delete links[id];
        }
    }

    return {

        isRunning: function() { return isRunning },

        getTurtles: function() { return turtles },
        getPatches: function() { return patches },
        getLinks: function() { return links },

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
