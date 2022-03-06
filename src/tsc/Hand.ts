import { LandmarkList, Landmark } from "@mediapipe/hands";
import { LANDMARK_INDEX } from "./handsUtil";
import { Gesture, InvalidDirections, ValidDirections } from "./Gesture";
import { Finger, Thumb } from "./Finger";
import { FingerState } from "./Gesture"


/**
 * Represents a hand that was detected by the HandTracker.
 */
export class Hand {
	/**
	 * The wrist of the hand
	 */
	wrist: Landmark

	/**
	 * The thumb joints.
	 */
	thumb: Thumb

	/**
	 * The index finger joints.
	 */
	index: Finger

	/**
	 * The middle finger joints.
	 */
	middle: Finger

	/**
	 * The ring finger joints.
	 */
	ring: Finger

	/**
	 * The pinky finger joints.
	 */
	pinky: Finger

	constructor(hand: LandmarkList) {
		this.wrist = hand[LANDMARK_INDEX.WRIST]
		this.thumb = new Thumb(hand.slice(LANDMARK_INDEX.THUMB_CMC, LANDMARK_INDEX.THUMB_TIP + 1))
		this.index = new Finger(hand.slice(LANDMARK_INDEX.INDEX_FINGER_MCP, LANDMARK_INDEX.INDEX_FINGER_TIP + 1))
		this.middle = new Finger(hand.slice(LANDMARK_INDEX.MIDDLE_FINGER_MCP, LANDMARK_INDEX.MIDDLE_FINGER_TIP + 1))
		this.ring = new Finger(hand.slice(LANDMARK_INDEX.RING_FINGER_MCP, LANDMARK_INDEX.RING_FINGER_TIP + 1))
		this.pinky = new Finger(hand.slice(LANDMARK_INDEX.PINKY_MCP, LANDMARK_INDEX.PINKY_TIP + 1))
	}

	/**
	 * Update the hand's coordinates. Recall that camera flips the
	 * image
	 * @param hand a list of landmarks created by MediaPipe.
	 */
	updateHand(hand: LandmarkList) {
		this.wrist = hand[LANDMARK_INDEX.WRIST]
		this.thumb.setJoints(hand.slice(LANDMARK_INDEX.THUMB_CMC, LANDMARK_INDEX.THUMB_TIP + 1))
		this.index.setJoints(hand.slice(LANDMARK_INDEX.INDEX_FINGER_MCP, LANDMARK_INDEX.INDEX_FINGER_TIP + 1))
		this.middle.setJoints(hand.slice(LANDMARK_INDEX.MIDDLE_FINGER_MCP, LANDMARK_INDEX.MIDDLE_FINGER_TIP + 1))
		this.ring.setJoints(hand.slice(LANDMARK_INDEX.RING_FINGER_MCP, LANDMARK_INDEX.RING_FINGER_TIP + 1))
		this.pinky.setJoints(hand.slice(LANDMARK_INDEX.PINKY_MCP, LANDMARK_INDEX.PINKY_TIP + 1))

		this.thumb.analyzeFinger();
		this.index.analyzeFinger();
		this.middle.analyzeFinger();
		this.ring.analyzeFinger();
		this.pinky.analyzeFinger();
	}


	/**
	 * Determine the gesture that the hand is making.
	 * @returns whether the hand is making the gesture passed in. 
	 */
	matches(gesture: Gesture): boolean {
		for (let fingerName of Object.keys(gesture)) {
			let finger: Finger = this[fingerName]
			let fingerState: FingerState = gesture[fingerName]

			if (fingerState.isStraight !== null) {
				if (fingerState.isStraight !== finger.isStraight) 
					return false
			}

			// don't need to check anything since it's null aka doesn't matter
			if (fingerState.direction === null) continue

			let searchResult = fingerState.direction.find(
					direction => finger.direction.equals(direction)) 

			if (fingerName == "index") console.log("matching index state", searchResult)
			if (fingerState.direction instanceof ValidDirections && searchResult === undefined) {
				return false // doesn't match any => finger failed => whole gesture fails
			}
			else if (fingerState.direction instanceof InvalidDirections && searchResult !== undefined) {
				return false // match invalid vector => finger failed
			}
		}
		return true
	}

}