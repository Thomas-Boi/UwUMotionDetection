import {LANDMARK_INDEX} from "./handsUtil"
import { LandmarkList, Results } from "@mediapipe/hands"
import { HandTracker } from "./HandTracker"
import * as BABYLON from "babylonjs"

// const horizontalMsgElem = document.getElementById("horizontalMessageBox")
// const verticalMsgElem = document.getElementById("verticalMessageBox")
// const depthMsgElem = document.getElementById("depthMessageBox")

/**
 * Use the HandTracker's data and manipulate the scene using it.
 */
export class Controller {
	/**
	 * A BABYLON Scene object.
	 */
	scene: BABYLON.Scene

	/**
	 * A BABYLON Mesh object
	 */
	mesh: BABYLON.Mesh


	constructor() {
		this.scene = null 
		this.mesh = null
		this.init3DScene()
	}

	init3DScene() {
		const canvas = <HTMLCanvasElement> document.getElementById("canvas")
		const engine = new BABYLON.Engine(canvas, true)

		this.scene = new BABYLON.Scene(engine)
		const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), this.scene)
		camera.attachControl(canvas, true)
		
		const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this.scene)
		this.mesh = BABYLON.MeshBuilder.CreateBox("box", {
			faceColors: [new BABYLON.Color4(1, 0, 0, 0)]
		}, this.scene)

		// attach the render callback
		engine.runRenderLoop(() => this.scene.render())

		// handle resizing
		window.addEventListener("resize", () => {
			engine.resize()
		})
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 * @param results the result of the data parsing.
	 * @param prevResults the result of the data parsing.
	 * @param bothValid whether both results are usable. 
	 * If true, both results contain data. If false, 
	 * either one or both results are null or empty.
	 */
	onResultsCallback(results: Results | null, prevResults: Results | null, bothValid) {
		if (!bothValid) return

		// only care about 1 hand
		let hand = results.multiHandLandmarks[0]
		let prevHand = prevResults.multiHandLandmarks[0]
		this.translate(hand, prevHand)
	}

	/**
	 * Translate the object on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	translate(hand: LandmarkList, prevHand: LandmarkList) {
		// has to flip horizontal footage since camera flips the view
		let horizontalDelta = -this.getDelta(hand[LANDMARK_INDEX.WRIST].x, prevHand[LANDMARK_INDEX.WRIST].x)

		// has to flip vertical footage since image y-axis run top to bottom (increase downward like js)
		let verticalDelta = -this.getDelta(hand[LANDMARK_INDEX.WRIST].y, prevHand[LANDMARK_INDEX.WRIST].y)

		this.mesh.translate(BABYLON.Axis.X, 1 * horizontalDelta)
		this.mesh.translate(BABYLON.Axis.Y, 1 * verticalDelta)
	}

	// old callback used for testing
	// onResultsCallback(results: Results | null, prevResults: Results | null) {
	// 	let horizontalMsg = "NONE"
	// 	let verticalMsg = "NONE"
	// 	let depthMsg = "NONE"
	// 	if (results.multiHandLandmarks && results.multiHandLandmarks.length != 0) {
	// 		// only care about 1 hand
	// 		let hand = results.multiHandLandmarks[0]

	// 		if (prevResults && prevResults.multiHandLandmarks.length != 0) {
	// 			let prevHand = prevResults.multiHandLandmarks[0]

	// 			// has to flip horizontal footage since camera flips the view
	// 			let horizontalDelta = -this.getDelta(hand[LANDMARK_INDEX.WRIST].x, prevHand[LANDMARK_INDEX.WRIST].x)
	// 			if (horizontalDelta == 0) horizontalMsg = "STAY"
	// 			else if (horizontalDelta > 0) horizontalMsg = "RIGHT"
	// 			else horizontalMsg = "LEFT"

	// 			// has to flip vertical footage since image y-axis run top to bottom (increase downward like js)
	// 			let verticalDelta = -this.getDelta(hand[LANDMARK_INDEX.WRIST].y, prevHand[LANDMARK_INDEX.WRIST].y)
	// 			if (verticalDelta == 0) verticalMsg = "STAY"
	// 			else if (verticalDelta > 0) verticalMsg = "UP"
	// 			else verticalMsg = "DOWN"

	// 			// can't use wrist for z index
	// 			let depthDelta = this.getDelta(hand[LANDMARK_INDEX.MID_FINGER_MCP].z, prevHand[LANDMARK_INDEX.MID_FINGER_MCP].z)
	// 			if (depthDelta == 0) depthMsg = "STAY"
	// 			else if (depthDelta > 0) depthMsg = "TOWARD USER"
	// 			else depthMsg = "AWAY FROM USER"

	// 		}

	// 	}

	// 	horizontalMsgElem.textContent = horizontalMsg
	// 	verticalMsgElem.textContent = verticalMsg
	// 	depthMsgElem.textContent = depthMsg
	// }

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