 class BrownNoiseProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.lastOut = 0;
    }

    process(inputs, outputs, parameters) {
        let output = outputs[0];
        let val = 0;

        output.forEach(channel => {
            let bufferSize = channel.length;

            for (var i = 0; i < bufferSize; i++) {
                var white = Math.random() * 2 - 1;
                val = (this.lastOut + (0.02 * white)) / 1.02;
                this.lastOut = val;
                channel[i] = val * 2;
            }
        });

        return true;
    }
}

registerProcessor('brown-noise-processor', BrownNoiseProcessor);
