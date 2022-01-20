import { Vector3 } from "babylonjs"

interface FingerState {
	/**
	 * Whether the finger is straight/fully extended.
	 * Null is for when it doesn't matter.
	 */
	isStraight: boolean | null

	/**
	 * Represent the closest allowed vector(s) that the finger is pointing to.
	 * The allowed vectors are the ones in DIRECTION or combination
	 * of them. So DIRECTION.UP is allowed, so is DIRECTION.UP + DIRECTION.RIGHT.
	 * Null is for when it doesn't matter.
	 */
	direction: Array<Vector3> | null
}

interface HandState {
	/**
	 * The thumb joints.
	 */
	thumb: FingerState

	/**
	 * The index finger joints.
	 */
	index: FingerState

	/**
	 * The middle finger joints.
	 */
	middle: FingerState

	/**
	 * The ring finger joints.
	 */
	ring: FingerState

	/**
	 * The pinky finger joints.
	 */
	pinky: FingerState
}

/**
 * Some preset common finger. 
 */

/**
 * The state of a closed non-thumb finger.
 */
const CLOSED_FINGER: FingerState = {
	isStraight: false,
	direction: null
}

/**
 * The state of an opened finger pointing up.
 */
const UP_FINGER: FingerState = {
	isStraight: true,
	direction: [Vector3.Up()]
}

/**
 * The state of a closed thumb.
 */
const CLOSED_THUMB: FingerState = {
	isStraight: false,
	direction: null
}

/**
 * The state of an opened finger pointing up.
 */
const OPEN_THUMB: FingerState = {
	isStraight: true,
	direction: [Vector3.Left(), Vector3.Up().add(Vector3.Left())]
}

export class Gesture {
	/**
	 * The condition needed to make this gesture.
	 */
	condition: HandState

	constructor(thumb: FingerState=CLOSED_FINGER, index: FingerState=CLOSED_FINGER,
		middle: FingerState=CLOSED_FINGER, ring: FingerState=CLOSED_FINGER, pinky: FingerState=CLOSED_FINGER) {
		this.condition = {
			thumb,
			index,
			middle,
			ring,
			pinky
		}
	}
}

/**
 * Some preset common gestures.
 */
export const CLOSED_FIST = new Gesture()
export const ONE = new Gesture(CLOSED_THUMB, UP_FINGER)
export const TWO = new Gesture(CLOSED_THUMB, UP_FINGER, UP_FINGER)
export const THREE = new Gesture(CLOSED_THUMB, UP_FINGER, UP_FINGER, UP_FINGER)
export const FOUR = new Gesture(CLOSED_THUMB, UP_FINGER, UP_FINGER, UP_FINGER, UP_FINGER)
export const FIVE = new Gesture(OPEN_THUMB, UP_FINGER, UP_FINGER, UP_FINGER, UP_FINGER)
