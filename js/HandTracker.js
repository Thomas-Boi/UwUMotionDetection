import {Hands} from "@mediapipe/hands"

/**
 * Track the hands using the MediaPipe Hands then preprocess
 * it to intepret gestures.
 */
export class HandTracker {
	constructor() {
		let hands = new Hands({locateFile: (file) => {
			console.log(file)
			return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
		}})

		hands.setOptions({
			maxNumHands: 1, // only need one hand
			modelComplexity: 1,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5
		})

		hands.onResults(this.onResultsCallback)

		/**
		 * The MediaPipe Hands object.
		 * @type { Hands }
		 */
		this.hands = hands

		/**
		 * Track the previous results that we scanned.
		 */
		this.prevResults = null

		/**
		 * The listeners that are registered to get data from HandTracker
		 * once it finishes parsing it.
		 */
		this.listeners = []
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 * @param {Results} results the result of the data parsing.
	 */
	onResultsCallback(results) {
		if (results.multiHandLandmarks && results.multiHandLandmarks.length != 0) {
			this.listeners.forEach(listener => listener(results, this.prevResults))
			this.prevResults = results
		}
	}

	/**
	 * Add a Listener to the HandTracker.
	 * @param {Function} listener 
	 */
	addListener(listener) {
		this.listeners.push(listener)
	}
}