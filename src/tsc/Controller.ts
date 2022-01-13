import {WRIST_INDEX} from "./handsUtil"
import { Results } from "@mediapipe/hands"

const messageElem = document.getElementById("message")

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
		let txt = "NONE"
		// only care about 1 hand
		let hand = results.multiHandLandmarks[0]

		if (prevResults) {
			let prevHand = prevResults.multiHandLandmarks[0]

			try {
				let delta = hand[WRIST_INDEX].x - prevHand[WRIST_INDEX].x

				// round to 2 decimal place, see https://stackoverflow.com/a/11832950/11683637
				delta = Math.round(delta * 100) / 100

				if (delta == 0) txt = "STAY"
				else if (delta > 0) txt = "RIGHT"
				else txt = "LEFT"
			}
			catch(e) {
				console.log("Multi handlandmarks: ", results.multiHandLandmarks)
				console.log("Hand: ", hand)
				console.log("prevHandCoord", prevHand)
			}
		}

		messageElem.textContent = txt
	}
}