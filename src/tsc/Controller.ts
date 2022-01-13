import {WRIST_INDEX} from "./handsUtil"
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
	onResultsCallback(results: Results, prevResults: Results | null) {
		let horizontalMsg = "NONE"
		let verticalMsg = "NONE"
		let depthMsg = "NONE"

		// only care about 1 hand
		let hand = results.multiHandLandmarks[0]

		if (prevResults) {
			let prevHand = prevResults.multiHandLandmarks[0]

			let horizontalDelta = this.getDelta(hand[WRIST_INDEX].x, prevHand[WRIST_INDEX].x)
			if (horizontalDelta == 0) horizontalMsg = "STAY"
			else if (horizontalDelta > 0) horizontalMsg = "RIGHT"
			else horizontalMsg = "LEFT"

			let verticalDelta = this.getDelta(hand[WRIST_INDEX].y, prevHand[WRIST_INDEX].y)
			if (verticalDelta == 0) verticalMsg = "STAY"
			else if (verticalDelta > 0) verticalMsg = "UP"
			else verticalMsg = "DOWN"

			let depthDelta = this.getDelta(hand[WRIST_INDEX].z, prevHand[WRIST_INDEX].z)
			if (depthDelta == 0) depthMsg = "STAY"
			else if (depthDelta > 0) depthMsg = "TOWARD USER"
			else depthMsg = "AWAY FROM USER"

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