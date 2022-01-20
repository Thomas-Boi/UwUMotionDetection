import { LandmarkList, Landmark } from "@mediapipe/hands";
import { LANDMARK_INDEX, GESTURES } from "./handsUtil";
import { Finger } from "./Finger";


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
	thumb: Finger

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
		this.thumb = new Finger(hand.slice(LANDMARK_INDEX.THUMB_CMC, LANDMARK_INDEX.THUMB_TIP + 1))
		this.index = new Finger(hand.slice(LANDMARK_INDEX.INDEX_FINGER_MCP, LANDMARK_INDEX.INDEX_FINGER_TIP + 1))
		this.middle = new Finger(hand.slice(LANDMARK_INDEX.MIDDLE_FINGER_MCP, LANDMARK_INDEX.MIDDLE_FINGER_TIP + 1))
		this.ring = new Finger(hand.slice(LANDMARK_INDEX.RING_FINGER_MCP, LANDMARK_INDEX.RING_FINGER_TIP + 1))
		this.pinky = new Finger(hand.slice(LANDMARK_INDEX.PINKY_MCP, LANDMARK_INDEX.PINKY_TIP + 1))
	}

	/**
	 * Update the hand's coordinates.
	 * @param hand a list of landmarks created by MediaPipe.
	 */
	updateHand(hand: LandmarkList) {
		this.wrist = hand[LANDMARK_INDEX.WRIST]
		this.thumb.setJoints(hand.slice(LANDMARK_INDEX.THUMB_CMC, LANDMARK_INDEX.THUMB_TIP + 1))
		this.index.setJoints(hand.slice(LANDMARK_INDEX.INDEX_FINGER_MCP, LANDMARK_INDEX.INDEX_FINGER_TIP + 1))
		this.middle.setJoints(hand.slice(LANDMARK_INDEX.MIDDLE_FINGER_MCP, LANDMARK_INDEX.MIDDLE_FINGER_TIP + 1))
		this.ring.setJoints(hand.slice(LANDMARK_INDEX.RING_FINGER_MCP, LANDMARK_INDEX.RING_FINGER_TIP + 1))
		this.pinky.setJoints(hand.slice(LANDMARK_INDEX.PINKY_MCP, LANDMARK_INDEX.PINKY_TIP + 1))
	}

	/**
	 * Determine the gesture that the hand is making.
	 * @returns the Gesture that was detected.
	 */
	determineGesture(): GESTURES {
		// determine the state of each finger: whether
		// they are open or closed.
		const fingerStats = [
			this.index.isStraight,
			this.middle.isStraight,
			this.ring.isStraight,
			this.pinky.isStraight,
		]

		let count = 0
		for (let fingerIsOpen of fingerStats) {
			if (fingerIsOpen) count++
			else break
		}

		switch(count) {
			case 0:
				return GESTURES.FIST
			case 1:
				return GESTURES.ONE
			case 2:
				return GESTURES.TWO
			case 3:
				return GESTURES.THREE
			case 4:
				return GESTURES.FOUR
			case 5:
				return GESTURES.FIVE
			default:
				return GESTURES.NONE
		}
	}

}