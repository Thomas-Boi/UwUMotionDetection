import { LandmarkList } from "@mediapipe/hands";
import { LANDMARK_INDEX, GESTURES } from "./handsUtil";
import { Vector3 } from "babylonjs";

const MCP_INDEX = 0
const PIP_INDEX = 1
const DIP_INDEX = 2
const TIP_INDEX = 3

/*
	* The amount of variation we are giving 
	* the PIP and DIP when considering whether they are on 
	* the line. For example, if PIP is 0.1 or less off the 
	* perfect vector between MCP and TIP, we will still consider
	* it to be on the line (like a margin of error).
	* Smaller => more accurate.
	**/
const VARIATION = 0.008

/**
 * Represents a hand that was detected by the HandTracker.
 */
export class Hand {
	/**
	 * The thumb joints.
	 */
	thumb: LandmarkList

	/**
	 * The index finger joints.
	 */
	index: LandmarkList

	/**
	 * The middle finger joints.
	 */
	middle: LandmarkList

	/**
	 * The ring finger joints.
	 */
	ring: LandmarkList

	/**
	 * The pinky finger joints.
	 */
	pinky: LandmarkList

	constructor(hand: LandmarkList) {
		this.thumb = hand.slice(LANDMARK_INDEX.THUMB_CMC, LANDMARK_INDEX.THUMB_TIP + 1)
		this.index = hand.slice(LANDMARK_INDEX.INDEX_FINGER_MCP, LANDMARK_INDEX.INDEX_FINGER_TIP + 1)
		this.middle = hand.slice(LANDMARK_INDEX.MIDDLE_FINGER_MCP, LANDMARK_INDEX.MIDDLE_FINGER_TIP + 1)
		this.ring = hand.slice(LANDMARK_INDEX.RING_FINGER_MCP, LANDMARK_INDEX.RING_FINGER_TIP + 1)
		this.pinky = hand.slice(LANDMARK_INDEX.PINKY_MCP, LANDMARK_INDEX.PINKY_TIP + 1)
	}

	/**
	 * Determine the gesture that the hand is making.
	 * @returns the Gesture that was detected.
	 */
	determineGesture(): GESTURES {
		// determine the state of each finger: whether
		// they are open or closed.
		const fingerStats = [
			this.isFingerStraight(this.index),
			this.isFingerStraight(this.middle),
			this.isFingerStraight(this.ring),
			this.isFingerStraight(this.pinky)
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

	/**
	 * Determine whether the finger passed in is straight/fully extended.
	 * The function does take in minor variation.
	 * @param joints the 4 joints that make up the finger.
	 * MUST be in the order of MCP, PIP, DIP and TIP.
	 * @return whether the finger is straight.
	 */
	isFingerStraight(joints: LandmarkList): boolean {
		// strategy: find the vector between the MCP and TIP
		// determine whether PIP and DIP fit on this line
		// if both do => they fit.

		let tcp = new Vector3(joints[TIP_INDEX].x, joints[TIP_INDEX].y, joints[TIP_INDEX].z) 
		let mcp = new Vector3(joints[MCP_INDEX].x, joints[MCP_INDEX].y, joints[MCP_INDEX].z) 

		// get the vector between the two
		let line = tcp.subtract(mcp)

		// due to minor variation in hand size,
		// searching using the exact values on the eqn
		// wouldn't be a good idea => add a radius around the search area.
		// to do so, we determine how close a point is to the vector
		// above. If it's within the `variation` passed in, we consider
		// it to be "on the line".

		// to do this, we will make use of projection and Babylon provides
		// some method to do this

		let pip = new Vector3(joints[PIP_INDEX].x, joints[PIP_INDEX].y, joints[PIP_INDEX].z) 
		let pipOnLine = this.fitOnLine(pip, tcp, line, VARIATION)
		let dip = new Vector3(joints[DIP_INDEX].x, joints[DIP_INDEX].y, joints[DIP_INDEX].z) 
		let dipOnLine = this.fitOnLine(dip, tcp, line, VARIATION)

		return pipOnLine && dipOnLine
	}

	/**
	 * Determines whether point fits on the line. 
	 * If point is within range of variation (inclusive),
	 * this counts as being on the line.
	 * @param point the point we are checking.
	 * @param start the starting point of the line equation.
	 * @param vector the vector part of the line equation.
	 * @param variation the margin of error we allow point to be 
	 * off the line.
	 * @returns whether the point fits on the line.
	 */
	fitOnLine(point: Vector3, start: Vector3, vector: Vector3, variation: number): boolean {
		// find the vector from startingPoint to point
		let source = point.subtract(start)

		// we now find the project of source onto vector
		// formula is projection = (source . unit vector) * unit vector
		let unitVector = vector.normalizeToNew()
		// scale is used to multiply vector with scalar
		let projection = unitVector.scale(Vector3.Dot(source, unitVector)) 

		// we have the projection => use it to find the perpendicular component
		let perpendicular = source.subtract(projection)

		// find the magnitude/length of the perpendicular vector
		// and check that it's within the variation
		return perpendicular.length() <= variation
	}
	
	isThumbStraight() {

	}
}