'use strict';

/** @suppress {duplicate} */
var pMachine = pMachine || {};

(function(pm) {
    var audio = pm.audio = {};
    var audioContext = null;
    var lpFilter = null;
    var gain = null;
    var stoppingAudioTimer = null;

    function turnOn() {
        clearTimeout(stoppingAudioTimer);
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        startBrownNoise();
    }
    audio.turnOn = turnOn;

    function turnOff() {
        let seconds = 2;

        if(audioContext) {
            let now = audioContext.currentTime;
            gain.gain.linearRampToValueAtTime(0, now + seconds);
        }

        stoppingAudioTimer = setTimeout(function() {
            audioContext.close();
            audioContext = null;
        }, seconds * 1000);
    }
    audio.turnOff = turnOff;

    function startBrownNoise() {
        var bufferSize = 4096;
        var brownNoise = (function() {
            var lastOut = 0.0;
            var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
            node.onaudioprocess = function(e) {

                var output = e.outputBuffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    var white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 2; // (roughly) compensate for gain
                }
            }
            return node;
        })();

        lpFilter = audioContext.createBiquadFilter();
        gain = audioContext.createGain();
        gain.gain.value = 0;

        gain.connect(audioContext.destination);
        lpFilter.connect(gain);
        brownNoise.connect(lpFilter);

        getData(audioContext, lpFilter);
    }
    audio.startBrownNoise = startBrownNoise;

    let source = null;
    function getData(audioCtx, connectTo) {
        source = audioCtx.createBufferSource();
        let request = new XMLHttpRequest();
      
        request.open('GET', 'audio/forest-ambient-loop-1.wav', true);
      
        request.responseType = 'arraybuffer';
      
        request.onload = function() {
          var audioData = request.response;
      
          audioCtx.decodeAudioData(audioData, function(buffer) {
              let myBuffer = buffer;
              source.buffer = myBuffer;
              source.playbackRate.value = 1; //playbackControl.value;
              source.connect(connectTo);
              source.loop = true;
              source.start(0);
            },
      
            function(e){"Error with decoding audio data" + e.err});
      
        }
      
        request.send();
      }

    /**
     * Handle a numeric value.
     * 
     * @param {string} id 
     * @param {number} val 
     * @param {number} t Linear ramp to value over this time period
     */
    function handleFloat(id, val, t) {
        if(audioContext) {
            let now = audioContext.currentTime;

            console.log(JSON.stringify([id, val]));
            if(id == 'pm-control-downers') {
                lpFilter.frequency.linearRampToValueAtTime(val * 800, now + t);
            }
            else if(id == 'pm-control-uppers') {
                gain.gain.linearRampToValueAtTime(val, now + t);
            }
        }
    }

    audio.handleFloat = handleFloat;

})(pMachine);