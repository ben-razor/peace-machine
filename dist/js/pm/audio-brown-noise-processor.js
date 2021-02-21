 class BrownNoiseProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.lastOut = 0;
    }

    process(inputs, outputs, parameters) {
        let output = outputs[0];
        let channel1 = output[0]; 
        let bufferSize = channel1.length;
        let val = 0;

        for (var i = 0; i < bufferSize; i++) {
            var white = Math.random() * 2 - 1;
            val = (this.lastOut + (0.02 * white)) / 1.02;
            this.lastOut = val;

            output.forEach(channel => {
                channel[i] = val * 2; // (roughly compensate for gain)
            })
        }

        return true;
    }
}

registerProcessor('brown-noise-processor', BrownNoiseProcessor);
