import { Vector3 } from "babylonjs"
import { DIRECTION } from "./handsUtil"

/**
 * NOTE: All gestures are created from the POV of the viewer.
 */

/**
 * A specialized array that holds valid directions
 * for a finger to point at. This means if the finger
 * matches the state in the array, it counts as valid.
 */
export class ValidDirections extends Array<Vector3> {
}

/**
 * A specialized array that holds invalid directions
 * for a finger to point at. This means if the finger
 * matches the state in the array, it's invalid.
 */
export class InvalidDirections extends Array<Vector3> {
}

export interface FingerState {
	/**
	 * Whether the finger is straight/fully extended.
	 * Null is for when it doesn't matter.
	 */
	isStraight: boolean | null

	/**
	 * Represent the closest allowed vector(s) that the finger is pointing to (for
	 * ValidDirections<Vector3>) OR the not-allowed vector(s) (for InvalidDirections<Vector3>).
	 * It is up to the user to check which type it is.
	 * The allowed vectors are the ones in DIRECTION or combination
	 * of them. So DIRECTION.UP is allowed, so is DIRECTION.UP + DIRECTION.RIGHT.
	 * Null is for when it doesn't matter.
	 */
	direction: ValidDirections | InvalidDirections | null
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
	direction: new ValidDirections(
		Vector3.Up(),
		Vector3.Up().add(Vector3.Left()),
		Vector3.Up().add(Vector3.Right())
	)
}

/**
 * The state of an opened thumb pointing outwards from palm.
 * Account for right hand only.
 */
const OUTWARD_THUMB: FingerState = {
	isStraight: true,
	direction: new ValidDirections(
		Vector3.Right(),
		Vector3.Right().add(Vector3.Up()),
		Vector3.Right().add(Vector3.Up()).add(DIRECTION.TOWARD_SCREEN()),
		DIRECTION.TOWARD_SCREEN(),
		Vector3.Up().add(DIRECTION.TOWARD_SCREEN())
	)
}

/**
 * The state of a closed thumb. Opposite of an outward thumb.
 */
const CLOSED_THUMB: FingerState = {
	isStraight: null,
	direction: new InvalidDirections(
		Vector3.Right(),
		Vector3.Right().add(Vector3.Up()),
		Vector3.Right().add(Vector3.Up()).add(DIRECTION.TOWARD_SCREEN()),
		DIRECTION.TOWARD_SCREEN(),
		Vector3.Up().add(DIRECTION.TOWARD_SCREEN())
	)
}


export class Gesture {
	/**
	 * 
	 */
	// name: string

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

	constructor(thumb: FingerState=CLOSED_THUMB, index: FingerState=CLOSED_FINGER,
		middle: FingerState=CLOSED_FINGER, ring: FingerState=CLOSED_FINGER, pinky: FingerState=CLOSED_FINGER) {
		
		this.thumb = thumb
		this.index = index
		this.middle = middle
		this.ring = ring
		this.pinky = pinky
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
export const FIVE = new Gesture(OUTWARD_THUMB, UP_FINGER, UP_FINGER, UP_FINGER, UP_FINGER)

/**
 * Gestures specific to 3D viewer
 */

/**
 * The shape of the finger to rotate an object around the x axis.
 * This means the right hand's index finger is 
 */
const ROTATE_X_INDEX_FINGER: FingerState = {
	isStraight: true,
	direction: new ValidDirections(
		Vector3.Right(),
		Vector3.Right().add(Vector3.Up()),
		Vector3.Right().add(Vector3.Up()).add(DIRECTION.TOWARD_SCREEN()),
		Vector3.Right().add(DIRECTION.TOWARD_SCREEN())
	)
}
export const ROTATE_X = new Gesture(CLOSED_THUMB, ROTATE_X_INDEX_FINGER)