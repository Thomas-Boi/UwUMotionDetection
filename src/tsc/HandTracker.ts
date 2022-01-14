import { Hands, Results } from "@mediapipe/hands"
import { HandTrackerListener } from "./types"


/**
 * Track the hands using the MediaPipe Hands then preprocess
 * it to intepret gestures.
 */
export class HandTracker {
	/**
	 * The MediaPipe Hands object.
	 */
	hands: Hands

	/**
	 * Track the previous results that we scanned.
	 */
	prevResults: Results | null

	/**
	 * The listeners that are registered to get data from HandTracker
	 * once it finishes parsing it.
	 */
	listeners: Array<HandTrackerListener>

	constructor() {
		let hands = new Hands({locateFile: (file) => {
			return `build/libs/${file}`
		}})

		hands.setOptions({
			maxNumHands: 1, // only need one hand
			modelComplexity: 1,
			minDetectionConfidence: 0.5,
			minTrackingConfidence: 0.5
		})

		hands.onResults(this.onResultsCallback.bind(this))

		this.hands = hands
		this.prevResults = null
		this.listeners = []
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 */
	onResultsCallback(results: Results) {
		let bothValid = results.multiHandLandmarks 
			&& results.multiHandLandmarks.length != 0
			&& this.prevResults 
			&& this.prevResults.multiHandLandmarks.length != 0

		this.listeners.forEach(listener => listener(results, this.prevResults, bothValid))
		this.prevResults = results
	}

	/**
	 * Add a Listener to the HandTracker.
	 * @param listener a new listener.
	 */
	addListener(listener: HandTrackerListener) {
		this.listeners.push(listener)
	}
}