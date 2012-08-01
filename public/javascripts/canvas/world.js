/**
 * Created with JetBrains WebStorm.
 * User: Joe
 * Date: 8/1/12
 * Time: 11:17 AM
 * To change this template use File | Settings | File Templates.
 */

var world = (function() {

    var isRunning = false;

    var turtles = [];
    var patches = [];
    var links = [];

    var patchSize = 13; // in pixels
    var maxpxcor = 16;
    var maxpycor = 16;

    function resize(direction) {
        if (!running) {
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

    function setTurtles(newTurtles) {
        if (typeof newTurtles === typeof turtles) {
            turtles = newTurtles;
        }
    }

    function setPatches(newPatches) {
        if (typeof newPatches === typeof patches) {
            patches = newPatches;
        }
    }

    function setLinks(newLinks) {
        if (typeof newLinks === typeof links) {
            links = newLinks;
        }
    }

    return {

        isRunning: function() { return isRunning },

        turtles: function() { return turtles },
        patches: function() { return patches },
        links: function() { return links },

        patchSize: function() { return patchSize },
        maxpxcor: function() { return maxpxcor },
        maxpycor: function() { return maxpycor },

        resize: resize,

        changeRunState: changeRunState,

        pixelToXcor: pixelToXcor,
        pixelToYcor: pixelToYcor,
        xcorToPixel: xcorToPixel,
        ycorToPixel: ycorToPixel,

        setTurtles: setTurtles,
        setPatches: setPatches,
        setLinks: setLinks

    };

})();
