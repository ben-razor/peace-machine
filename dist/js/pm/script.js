'use strict';

/** @suppress {duplicate} */
var pMachine = pMachine || {};

(function(pm) {

    pm.config = {
        "default_vibe": "beige_haze",
        "vibes": [
            {
                "id": "beige_haze",
                "text": "Beige Haze",
                "img": "sunset-1.jpg",
                "audio": "beige_haze"
            },
            {
                "id": "ocean_beach",
                "text": "Ocean Beach",
                "img": "beach.jpg",
                "audio": "ocean-1.wav"
            },
            {
                "id": "zabriskie_point",
                "text": "Zabriskie Point",
                "img": "desert.jpg",
                "audio": "desert-loop-1.wav"
            },
            {
                "id": "rabbit_hole",
                "text": "Rabbit Hole",
                "img": "garden.jpg",
                "audio": "garden-1.wav"
            },
            {
                "id": "bummer_trip",
                "text": "Bummer Trip",
                "img": "bummer-trip.jpg",
                "audio": "bummer-trip-1.wav"
            }
        ],
        "page_fade_time": 1200,
        "default_downers": 1,
        "default_uppers": 0.5
    };

    const PAGE_FADE_TIME = pm.config["page_fade_time"];;

    pm.currentVibe = pm.config['default_vibe'];

    /*
     * When a rotatable element is touched, we set it as
     * the active element, all movement on the ui will then be
     * forwarded to that element.
     */
    var $activeElem = null;
    /** Touch / mouse position x */
    var targetX = 0;

    /** Touch / mouse position x */
    var targetY = 0;

    /** Translation of control before rotation dynamically applied */
    var controlTranslation = 'translate(-50%, -50%) ';

    /** Low value on a db control */
    var dBControlLow = -42;

    /** High value on a db control */
    var dBControlHigh = 0;

    /**
     * Interface object to pass control information to.
     * For example, provided by a mobile WebView
     */
    var backend = window["PeaceMachineInterface"] || pMachine.audio;

    var storage = window.localStorage;

    var $rotatable = null;
    $(function() {
        $rotatable = $('.rotatable'); 

        /**
         * When a rotatable element (knob) is touched, we set it as
         * the active element, all movement on the ui will then be
         * forwarded to that element via the handleMove function until
         * the touch is lifted from the ui.
         */
        $rotatable.bind('mousedown touchstart', function(e) {
            e.stopPropagation();
            e.preventDefault();
            $activeElem = $(e.target);
        });

        /**
         * Once a control is active we want it to stay active even if
         * the mouse or finger leaves the element.
         */
        $rotatable.bind('touchend', function(e) {
            e.stopPropagation();
            $activeElem = null;
        });
    
        /**
         * Bind mouse/touch move events to the body. The position
         * is passed to the handleMove function wich will carry out
         * actions on any element that has been activated by a mouse
         * or touch down event.
         */
        $(document.body).bind('mousemove touchmove', function(e) {
            var touchInfo = e;
            if(isTouch(e)) {
                touchInfo = e.originalEvent.touches[0];
            }
            targetX = touchInfo.pageX;
            targetY = touchInfo.pageY;
            handleMove(targetX, targetY);
            e.stopPropagation();
        });

       
        /**
         * Stop responding to move events once the touch or mouse is
         * lifted from the ui.
         */
        $(document.body).bind('mouseup mouseleave', function(e) {
            $activeElem = null;
        })
    });
  
    /**
     * @param {event} e Check if event was touch not mouse
     */
    function isTouch(e) {
        return e.originalEvent && e.originalEvent.touches;
    }

    /**
     * Converts canvas rotation to continuous cw rotation from 
     * 0 to 2pi.
     * 
     * @param {rot} rot canvas rotation (0 to pi ccw, 0 to -pi cw)
     */
    function canvasRotToCWRot(rot) {
        return physii.math.loneRanger(rot, -Math.PI, Math.PI, 0, Math.PI * 2);
    }

    /**
     * Converts canvas rotation to knob value between 0 and 1.
     * Val 0 is at 45deg cw from vertically down.
     * Val 1 is at 45deg ccw from vertically down.
     * @param {float} rot canvas rotation (0 to pi ccw, 0 to -pi cw)
     * @returns {float} Control value from 0 to 1
     */
    function rotToValue(rot) {
        var val = canvasRotToCWRot(rot);
        val = physii.math.loneRanger(val, Math.PI/4, 7*Math.PI/4, 0, 1);
        return val;
    }

    /**
     * Converts val from 0 to 1 to rotation in radians.
     * 
     * @param {float} val 
     */
    function valueToRot(val) {
        var cwRot = physii.math.loneRanger(val, 0, 1, Math.PI/4, 7 * Math.PI/4);
        var rot = physii.math.loneRanger(cwRot, 0, 2 * Math.PI, -Math.PI, Math.PI);
        return rot;
    }

    /**
     * Handles mouse or touch movement.
     * 
     * @param {int} x Mouse/touch x pos
     * @param {int} y Mouse/touch y pos
     */
    function handleMove(x, y) {
        if($activeElem) {
            var $elem = $activeElem;
            var w = $elem.width();
            var h = $elem.height();
            var relX = 0, relY = 0;
            var rect = $elem[0].getBoundingClientRect();
            var w = rect.width;
            var h = rect.height;

            var offset = $elem.offset(); 
            relX = x - (offset.left + w/2);
            relY = y - (offset.top + h/2);
            // Rotate 90 deg anticlockwise as atan2 uses x pointing right not up
            var relXRot = -relY;
            var relYRot = relX;

            var rot = Math.atan2(relYRot, relXRot);
            var val = rotToValue(rot);
            let id = $elem.attr('id');

            if(id === 'pm-control-uppers') {
                let minVal = dBToMul(dBControlLow);
                let dBVal = physii.math.loneRanger(val, 0, 1, dBControlLow, dBControlHigh);
                val = dBToMul(dBVal);

                // Set volume to zero when control fully off
                if(val - minVal < 0.001) {
                    val = 0;
                }
            }

            setValue(id, val);
            
            if(rot > 3 * Math.PI / 4) {
                rot = 3 * Math.PI / 4;
            }
            else if(rot < -3 * Math.PI / 4) {
                rot = -3 * Math.PI / 4;
            }
           
            $elem.css('transform', controlTranslation + ' rotate(' + rot + 'rad)');
        }
    }

    /**
     * Sets the controls to their default positions or values retrieved
     * from storage.
     */
    function initUI() {
        var ids = ["pm-control-uppers", "pm-control-downers"];

        pm.currentVibe = getValue('currentVibe');

        for(var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var $elem = $('#' + id);
            var val = getValue(id);
 
            if(backend) {
                backend.handleFloat(id, val, 1);
            }
           
            if(id === 'pm-control-uppers') {
                val = mulToVal(val, dBControlLow, dBControlHigh);
            }
            var rot = valueToRot(val);
            $elem.css('transform', controlTranslation + ' rotate(' + rot + 'rad)');
        }

        if(!isMobile()) {
            $('.promo-button').show();
        }
    }

    function isMobile() {
        return "PeaceMachineInterface" in window;
    }

    /**
     * Converts a value in dB to a multiplier.
     * 
     * E.g. 
     *   0dB -> 1
     *   -6dB -> 0.5
     * 
     * @param {number} dB 
     */
    function dBToMul(dB) {
        let value = 10**(dB / 20)
        return value;
    }
    pm.dBToMul = dBToMul;

    /**
     * Converts a logarithic multiplier to a linear value
     * between 0 and 1 for display on a control.
     * 
     * E.g. 0.25 -> -12dB -> 0.5 if the scale is from -24dB to 0.
     * 
     * @param {number} mul 
     * @param {number} dBLow
     * @param {number} dBHigh
     */
    function mulToVal(mul, dBLow, dbHigh) {
        let val = mulTodB(mul)
        val = physii.math.loneRanger(val, dBLow, dbHigh, 0, 1);
        return val;
    }

    /**
     * Converts to a linear value between 0 and 1 
     * to a logarithic multiplier.
     * 
     * E.g. 0.5 -> -12dB -> 0.25 if the scale is from -24dB to 0.
     * 
     * @param {number} mul 
     * @param {number} dBLow
     * @param {number} dBHigh
     */
    function valToMul(val, dBLow, dbHigh) {
        let db = physii.math.loneRanger(val, 0, 1, dBLow, dbHigh);
        let mul = dBToMul(db);
        return mul;
    }
    pm.valToMul = valToMul;

    /**
     * Converts a multiplier to dB. For example, -6dB is approx 
     * eqivalent to 0.5 * volume.
     * 
     * @param {number} mul 
     */
    function mulTodB(mul) {
        return 20 * Math.log10(mul);
    }

    /**
     * Send a changed UI value to any connected backend. Save the value
     * for recovery across sessions.
     * 
     * @param {string} key 
     * @param {object} value 
     */
    function setValue(key, value) {
        console.log(key, value);
        storage.setItem(key, JSON.stringify(value));

        if(backend) {
            backend.handleFloat(key, value, 0.01);
        }
    }

    /**
     * Recover stored UI values from storage to initialize UI and any connected
     * backends.
     * 
     * @param {string} key 
     */
    function getValue(key) {
        var val = JSON.parse(storage.getItem(key));

        if(val === null) {
            if(key === 'currentVibe') {
                val = pm.config['default_vibe'];
            }
            if(key === 'pm-control-downers') {
                val = pm.config['default_downers'];
            }
            else if(key === 'pm-control-uppers') {
                val = valToMul(pm.config['default_uppers'], dBControlLow, dBControlHigh);
            }
        }
        return val;
    }

    /**
     * Switch to the main page and call the backend to enable audio.
     */
    function turnOn() {
        backend.turnOn();
        initUI();
        let $landingPage = $('.pm-landing');
        let $mainPage = $('#pm-main-page');
        
        $mainPage.stop();
        $landingPage.stop();
        $mainPage.css('opacity', 0);
        $mainPage.css('display', '');

        $mainPage.addClass('pm-top-page');
        $landingPage.removeClass('pm-top-page');

        $landingPage.fadeOut(PAGE_FADE_TIME);

        $mainPage.animate({'opacity': 1}, PAGE_FADE_TIME);
    }
    pm.turnOn = turnOn;

    /**
     * Can be called from the backend after initialisation is complete.
     */
    function handleTurnOn() {
        backend.selectVibe(pm.currentVibe);
    }
    pm.handleTurnOn = handleTurnOn;

    /**
     * Stop sounds and return to landing page.
     */
    function dropOut() {
        backend.turnOff();

        let $landingPage = $('.pm-landing');
        let $mainPage = $('#pm-main-page');

        $landingPage.stop();
        $mainPage.stop();
        $landingPage.css('opacity', 0);
        $landingPage.css('display', '');
        $landingPage.addClass('pm-top-page');
        $mainPage.removeClass('pm-top-page').addClass('pm-middle-page');
        $landingPage.animate({'opacity': 1}, PAGE_FADE_TIME);
    }
    pm.dropOut = dropOut;
    let swiper = null;

    /**
     * Initialize the swiper for choosing vibes.
     */
    function initVibesSwiper() {
        let currentSlideIndex = getSlideIndex(pm.currentVibe);

        if(swiper) {
            swiper.destroy();
        }
        swiper = new Swiper('.swiper-container', {
            // Optional parameters
            direction: 'horizontal',
            autoHeight: true,
          
            // If we need pagination
            pagination: {
              el: '.swiper-pagination',
            },
          
            // Navigation arrows
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            initialSlide: currentSlideIndex
        });

        swiper.on('slideChange', function() {
            console.log('slide changed', swiper.realIndex, pm.config["vibes"][swiper.realIndex]);
            var vibeConfig = pm.config['vibes'][swiper.realIndex];
            pm.currentVibe = vibeConfig['id'];
            setValue('currentVibe', pm.currentVibe);
            backend.selectVibe(pm.currentVibe);
        });
    }

    /**
     * Returns the slide index of the currently selected vibe.
     * 
     * @param {string} vibeID 
     */
    function getSlideIndex(vibeID) {
        let slideIndex = pm.config['vibes'].findIndex(x => x['id'] === vibeID);
        return slideIndex;
    }
    
    /**
     * Switches to a panel where the user can select from different sounds.
     */
    function tuneIn() {
        let $landingPage = $('.pm-landing');
        let $tuneInPage = $('.pm-tune-in');
        let $mainPage = $('pm-main-page');

        $landingPage.stop();
        $tuneInPage.stop();
        $mainPage.stop();

        $mainPage.removeClass('pm-top-page').addClass('pm-middle-page');

        $tuneInPage.css('opacity', 0);
        $tuneInPage.addClass('pm-top-page');
        $tuneInPage.show();
        initVibesSwiper();
        $tuneInPage.animate({'opacity': 1}, PAGE_FADE_TIME);
    }
    pm.tuneIn = tuneIn;

    /**
     * Switches from the vibe chooser panel back to the main page.
     */
    function tuneOut() {
        let $tuneInPage = $('.pm-tune-in');
        let $mainPage = $('#pm-main-page');
        $tuneInPage.stop();
        $mainPage.stop();

        $mainPage.css('opacity', 0);
        $mainPage.addClass('pm-top-page');
        $tuneInPage.removeClass('pm-top-page').addClass('pm-middle-page');
        $tuneInPage.animate({'opacity': 0}, PAGE_FADE_TIME);
        $mainPage.animate({'opacity': 1}, PAGE_FADE_TIME);
    }
    pm.tuneOut = tuneOut;

    /**
     * Helper method for backends to get vibe config
     * the web side.
     */
    function getVibesConfig() {
        return JSON.stringify(pm.config["vibes"]);
    }
    pm.getVibesConfig = getVibesConfig;

    /**
     * Called by backends when samples / generators have been created.
     * 
     * If that processor is the active one, it can start being used to 
     * create sound
     */
    function handleVibeCreated(vibeID) {
        if(vibeID === pm.currentVibe) {
            backend.selectVibe(vibeID);
        }
    }
    pm.handleVibeCreated = handleVibeCreated;

    backend.initAudio();
    initUI();

})(pMachine);
