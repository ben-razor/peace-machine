'use strict';

/** @suppress {duplicate} */
var pMachine = pMachine || {};

(function(pm) {
    var audio = pm.audio = {};
    var audioContext = null;
    var lpFilter = null;
    var gain = null;
    var stoppingAudioTimer = null;

    /**
     * Set up master channel and call initVibes to load samples.
     */
    function initAudio() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();

        lpFilter = audioContext.createBiquadFilter();
        gain = audioContext.createGain();
        gain.gain.value = 0;

        gain.connect(audioContext.destination);
        lpFilter.connect(gain);
 
        initVibes(audioContext, lpFilter);
    }
    audio.initAudio = initAudio;

    /**
     * Called by front end when user activates listening to audio.
     */
    function turnOn() {
        clearTimeout(stoppingAudioTimer);
        pm.handleTurnOn();
    }
    audio.turnOn = turnOn;

    /**
     * Called by front end when user deactivates audio.
     */
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

    /**
     * Creates an audio processor that generates an approximation of 
     * brown noise.
     * 
     * @param {object} audioContext 
     * @param {object} connectTo 
     */
    function createBrownNoise(audioContext, connectTo) {
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

        return brownNoise;
    }

    let source = null;
    let sources = {};
    pm.sources = sources;

    /**
     * Represents an AudioSource that is wrapped with a 
     * gain control so its volume can be changed.
     */
    class Source {
        constructor(source) {
            this.source = source;
            this.gain = audioContext.createGain();
            this.gain.gain.value = 0;
            this.source.connect(this.gain);
        }

        /**
         * Connects this node to an output.
         * 
         * @param {object} connectTo 
         */
        connect(connectTo) {
            this.gain.connect(connectTo);
            return this;
        }

        /**
         * Lerp to volume at a time from now in seconds.
         * 
         * @param {number} volume 
         * @param {number} time Seconds
         */
        setVolume(volume, time) {
            let now = audioContext.currentTime;
            this.gain.gain.linearRampToValueAtTime(volume, now + time);
            return this;
        }
    }

    /**
     * Loop through a collection of peace machine vibe configs and create
     * either sample or generated audio sources.
     * 
     * @param {object} audioCtx 
     * @param {object} connectTo 
     */
    function initVibes(audioCtx, connectTo) {
      
        let vibeConfigs = pm.config['vibes'];

        for(let vibeConfig of vibeConfigs) {
            let audio = vibeConfig['audio'];
            let vibeID = vibeConfig['id'];

            let isSample = audio.indexOf('.') != -1;
            if(isSample) {
                let request = new XMLHttpRequest();
                request.open('GET', 'audio/' + audio, true);
                request.responseType = 'arraybuffer';
                request.vibeID = vibeID;
                request.onload = function() {
                    let audioData = request.response;
                    let vibeID = request.vibeID;
                    audioCtx.decodeAudioData(audioData, function(buffer) {
                        let myBuffer = buffer; 
                        source = audioCtx.createBufferSource();
                        source.buffer = myBuffer;
                        source.playbackRate.value = 1;
                        source.loop = true;
                        source.start(0);
                        sources[vibeID] = new Source(source).connect(connectTo).setVolume(0, 0);
                    }, function(e) { "Error decoding audio" + e.err }); 
                }

                request.send();
            }
            else {
                if(vibeID === 'beige_haze') {
                    let source = createBrownNoise(audioCtx, connectTo);
                    sources[vibeID] = new Source(source).connect(connectTo).setVolume(0, 0);
                }
            }
        }
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

    /**
     * Vibes are either audio samples or generated audio with a name
     * and an image for display in the front end.
     * 
     * This crossfades to the audio the user has selected.
     *  
     * @param {string} id 
     */
    function selectVibe(id) {
        for(let sourceID of Object.keys(sources)) {
            let source = sources[sourceID];
            if(sourceID === id) {
                source.setVolume(1, 1);
            }
            else {
                source.setVolume(0, 1);
            }
        }
    }
    audio.selectVibe = selectVibe;

})(pMachine);