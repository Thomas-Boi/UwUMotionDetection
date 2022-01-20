import { DIRECTION } from "./handsUtil"
import { Vector3 } from "babylonjs"
import { LandmarkList } from "@mediapipe/hands"
import { fitOnLine } from "./util"

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
 * The indices for finger joints within their LandmarkList.
 */
const FINGER_INDICES = {
	MCP: 0,
	PIP: 1,
	DIP: 2,
	TIP: 3
}


export class Finger {
	/**
	 * The joints in the finger as detected by MediaPipe.
	 */
	joints: LandmarkList

	/**
	 * Whether the finger is straight/fully extended.
	 */
	isStraight: boolean

	/**
	 * Represent the closest alloweed vector that the finger is pointing to.
	 * The allowed vectors are the ones in DIRECTION or combination
	 * of them. So DIRECTION.UP is allowed, so is DIRECTION.UP + DIRECTION.RIGHT.
	 */
	direction: Vector3

	constructor(joints: LandmarkList) {
		this.joints = null
		this.isStraight = null
		this.direction = null
		this.setJoints(joints)
	}

	/**
	 * Set the joints to the new ones.
	 * @param joints 
	 */
	setJoints(joints: LandmarkList) {
		this.joints = joints
		this.isStraight = this.isFingerStraight()
	}

	/**
	 * Determine whether the finger passed in is straight/fully extended.
	 * The function does take in minor variation.
	 * @param joints the 4 joints that make up the finger.
	 * MUST be in the order of MCP, PIP, DIP and TIP.
	 * @return whether the finger is straight.
	 */
	isFingerStraight(): boolean {
		// strategy: find the vector between the MCP and TIP
		// determine whether PIP and DIP fit on this line
		// if both do => they fit.

		let tcp = new Vector3(this.joints[FINGER_INDICES.TIP].x, this.joints[FINGER_INDICES.TIP].y, this.joints[FINGER_INDICES.TIP].z) 
		let mcp = new Vector3(this.joints[FINGER_INDICES.MCP].x, this.joints[FINGER_INDICES.MCP].y, this.joints[FINGER_INDICES.MCP].z) 

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

		let pip = new Vector3(this.joints[FINGER_INDICES.PIP].x, this.joints[FINGER_INDICES.PIP].y, this.joints[FINGER_INDICES.PIP].z) 
		let pipOnLine = fitOnLine(pip, tcp, line, VARIATION)
		let dip = new Vector3(this.joints[FINGER_INDICES.DIP].x, this.joints[FINGER_INDICES.DIP].y, this.joints[FINGER_INDICES.DIP].z) 
		let dipOnLine = fitOnLine(dip, tcp, line, VARIATION)

		return pipOnLine && dipOnLine
	}
}