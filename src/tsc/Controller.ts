import {LANDMARK_INDEX} from "./handsUtil"
import { Results } from "@mediapipe/hands"
import { HandTracker } from "./HandTracker"

const horizontalMsgElem = document.getElementById("horizontalMessageBox")
const verticalMsgElem = document.getElementById("verticalMessageBox")
const depthMsgElem = document.getElementById("depthMessageBox")

/**
 * Use the HandTracker's data and manipulate the scene using it.
 */
export class Controller {
	/**
	 * Handle the onResults event of the Hands tracker.
	 * @param results the result of the data parsing.
	 * @param prevResults the result of the data parsing.
	 */
	onResultsCallback(results: Results | null, prevResults: Results | null) {
		let horizontalMsg = "NONE"
		let verticalMsg = "NONE"
		let depthMsg = "NONE"
		if (results.multiHandLandmarks && results.multiHandLandmarks.length != 0) {
			// only care about 1 hand
			let hand = results.multiHandLandmarks[0]

			if (prevResults && prevResults.multiHandLandmarks.length != 0) {
				let prevHand = prevResults.multiHandLandmarks[0]

				// has to flip horizontal footage since camera flips the view
				let horizontalDelta = -this.getDelta(hand[LANDMARK_INDEX.WRIST].x, prevHand[LANDMARK_INDEX.WRIST].x)
				if (horizontalDelta == 0) horizontalMsg = "STAY"
				else if (horizontalDelta > 0) horizontalMsg = "RIGHT"
				else horizontalMsg = "LEFT"

				// has to flip vertical footage since image y-axis run top to bottom (increase downward like js)
				let verticalDelta = -this.getDelta(hand[LANDMARK_INDEX.WRIST].y, prevHand[LANDMARK_INDEX.WRIST].y)
				if (verticalDelta == 0) verticalMsg = "STAY"
				else if (verticalDelta > 0) verticalMsg = "UP"
				else verticalMsg = "DOWN"

				// can't use wrist for z index
				let depthDelta = this.getDelta(hand[LANDMARK_INDEX.MID_FINGER_MCP].z, prevHand[LANDMARK_INDEX.MID_FINGER_MCP].z)
				if (depthDelta == 0) depthMsg = "STAY"
				else if (depthDelta > 0) depthMsg = "TOWARD USER"
				else depthMsg = "AWAY FROM USER"

			}

		}

		horizontalMsgElem.textContent = horizontalMsg
		verticalMsgElem.textContent = verticalMsg
		depthMsgElem.textContent = depthMsg
	}

	/**
	 * Get the difference between 2 numbers. Also round it
	 * to decimalPlace.
	 * @param a, the first number. 
	 * @param b, the second number.
	 * @param decimalPlace, how much we are rounding the delta result.
	 * Default to 2 decimal place.
	 * @returns 
	 */
	getDelta(a: number, b: number, decimalPlace: number=2) {
		let delta = a - b

		// round to x decimal place, see https://stackoverflow.com/a/11832950/11683637
		let decimalConvertor = 10 ** decimalPlace
		delta = Math.round(delta * decimalConvertor) / decimalConvertor
		return delta
	}

	/**
	 * Subscribe to the HandTracker object.
	 * @param tracker a HandTracker object.
	 */
	subscribe(tracker: HandTracker) {
		tracker.addListener(this.onResultsCallback.bind(this))
	}
}