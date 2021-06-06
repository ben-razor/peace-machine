'use strict';

// const { is } = require("core-js/core/object");

/** @suppress {duplicate} */
var pMachine = pMachine || {};

(function(pm) {
    var audio = pm.audio = {};
    var audioContext = null;
    var lpFilter = null;
    var gain = null;
    let turnedOn = false;

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
        initAudio();
        turnedOn = true;
        pm.handleTurnOn();
    }
    audio.turnOn = turnOn;

    /**
     * Called by front end when user deactivates audio.
     */
    function turnOff() {
        turnedOn = false;
        let seconds = 2;

        if(audioContext) {
            let now = audioContext.currentTime;
            gain.gain.linearRampToValueAtTime(0, now + seconds);
        }
    }
    audio.turnOff = turnOff;

    /**
     * Creates an audio processor that generates an approximation of 
     * brown noise.
     * 
     * @param {object} audioContext 
     * @param {object} connectTo 
     */
    async function createBrownNoise(audioContext, connectTo) {
        await audioContext.audioWorklet.addModule('js/pm/audio-brown-noise-processor.js');
        const brownNoise = new AudioWorkletNode(audioContext, 'brown-noise-processor');
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
            let fileName = vibeConfig['audio'];
            let isMobile = pm.isMobile();

            if(!isMobile) {
                fileName = fileName.replace('.wav', '.mp3');
            }
            
            let vibeID = vibeConfig['id'];

            let isSample = fileName.indexOf('.') != -1;
            if(isSample) {
                let request = new XMLHttpRequest();
                request.open('GET', 'audio/' + fileName, true);
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
                        pm.handleVibeCreated(vibeID);
                    }, function(e) { "Error decoding audio" + e.err }); 
                }

                request.send();
            }
            else {
                if(vibeID === 'beige_haze') {
                    createBrownNoise(audioCtx, connectTo).then((source) => {
                        sources[vibeID] = new Source(source).connect(connectTo).setVolume(0, 0);
                        pm.handleVibeCreated(vibeID);
                    });
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
        if(turnedOn) {
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
    }
    audio.selectVibe = selectVibe;

})(pMachine);