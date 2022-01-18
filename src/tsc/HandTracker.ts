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
	listeners: Map<String, HandTrackerListener>

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
		this.listeners = new Map()
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 */
	onResultsCallback(results: Results) {
		let bothValid = results.multiHandWorldLandmarks 
			&& results.multiHandWorldLandmarks.length != 0
			&& this.prevResults 
			&& this.prevResults.multiHandWorldLandmarks.length != 0

		this.listeners.forEach(listener => listener(results, this.prevResults, bothValid))
		this.prevResults = results
	}

	/**
	 * Add a Listener to the HandTracker.
	 * @param listener a new listener.
	 * @param key the name of the listener. Default is
	 * a random value if you don't intend to reaccess the
	 * listener.
	 */
	addListener(listener: HandTrackerListener, key: String=null) {
		if (key === null) key = `${new Date().getTime()}`
		this.listeners.set(key, listener)
	}

	/**
	 * Remove a listener based on the name.
	 * @param key the listener's name that we want to remove.
	 * @return true if the object was deleted. Else, false.
	 */
	removeListener(key: String) {
		return this.listeners.delete(key)
	}
}