'use strict';

/** @suppress {duplicate} */
var pMachine = pMachine || {};

(function(pm) {
    var audio = pm.audio = {};
    var audioContext = null;
    var lpFilter = null;
    var gain = null;

    function turnOn() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        startBrownNoise();
    }
    audio.turnOn = turnOn;

    function startBrownNoise() {

        var bufferSize = 4096;
        var brownNoise = (function() {
            console.log("Starting playing noise");
            var lastOut = 0.0;
            var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
            node.onaudioprocess = function(e) {

                var output = e.outputBuffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    var white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 3.5; // (roughly) compensate for gain
                }
            }
            return node;
        })();

        lpFilter = audioContext.createBiquadFilter();
        gain = audioContext.createGain();
        gain.connect(audioContext.destination);
        lpFilter.connect(gain);
        brownNoise.connect(lpFilter);
    }
    audio.startBrownNoise = startBrownNoise;

    function handleFloat(id, val) {
        if(audioContext) {
            console.log(JSON.stringify([id, val]));
            if(id == 'pm-control-downers') {
                lpFilter.frequency.value = val * 800;
            }
            else if(id == 'pm-control-uppers') {
                gain.gain.value = val;
            }
        }
    }
    audio.handleFloat = handleFloat;

})(pMachine);