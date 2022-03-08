import { LANDMARK_AMOUNT } from "./handsUtil"
import * as Gesture from "./Gesture"
import { Results } from "@mediapipe/hands"
import { HandTracker } from "./HandTracker"
import * as BABYLON from "babylonjs"
import { Hand } from "./Hand"
import { FINGER_INDICES } from "./Finger"
import { getDelta } from "./util"

const TRANSLATE_MULTIPLIER = 4
const ROTATE_MULTIPLIER = 4
const statusSpan = document.getElementById("status")

let frame = 0

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

	/**
	 * A BABYLON Camera object
	 */
	camera: BABYLON.Camera

	/**
	 * Hold information on the state of the user's current hand.
	 */
	hand: Hand

	/**
	 * Hold information on the state of the user's previous hand.
	 */
	prevHand: Hand

	/**
	 * Whether the camera is in selfie mode.
	 * Useful to deal with different camera inputs.
	 */
	isSelfieMode: boolean

	/**
	 * Count how many times the hand were tracked 
	 * consecutively. Used to set the curShape.
	 */
	trackCounter: number

	/**
	 * The current shape of the user's hand.
	 */
	curShape: null | Gesture.Gesture

	constructor(facingMode: "user"|"environment") {
		this.scene = null 
		this.mesh = null
		// init with random values
		this.hand = new Hand(new Array(LANDMARK_AMOUNT).fill(0))
		
		// set to null because we can check whether we need to
		// make a new hand or just use this.hand after we are done.
		this.prevHand = null
		this.init3DScene()

		this.isSelfieMode = facingMode === "user" ? true : false
	}

	init3DScene() {
		const canvas = <HTMLCanvasElement> document.getElementById("canvas")
		const engine = new BABYLON.Engine(canvas, true)

		this.scene = new BABYLON.Scene(engine)
		this.scene.clearColor = new BABYLON.Color4(0, 0, 0)
		this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), this.scene)
		this.camera.attachControl(canvas, true)
		
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
	 * Handle the result for the first frame received by
	 * the HandTracker. This include removing the
	 * loading icon, setting up the hand etc.
	 * @param tracker the HandTracker.
	 * @param key the listener name we subscribed to tracker.
	 * @param results 
	 */
	firstFrameCallback(tracker: HandTracker, key: string, results: Results | null) {
		tracker.removeListener(key)
		tracker.addListener(this.onResultsCallback.bind(this))
		document.getElementById("loading").style.display = "none"
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 * @param results the result of the data parsing.
	 */
	onResultsCallback(results: Results | null) {
		this.detectShape(results)

		if (!this.prevHand) {
			// ensure that we always save prevHand
			this.prevHand = this.hand
			return
		}

		if (this.hand.matches(Gesture.CLOSED_FIST)) {
			this.translate(this.hand, this.prevHand)
		}
		else if (this.hand.matches(Gesture.ONE)) {
			this.rotateAroundY(this.hand, this.prevHand)
		}
		else if (this.hand.matches(Gesture.ROTATE_X)) {
			this.rotateAroundX(this.hand, this.prevHand)
		}

		this.prevHand = this.hand
	}

	/**
	 * Detect the shape of the user's hand.
	 */
	detectShape(results: Results | null) {
		if (!results || results.multiHandLandmarks.length === 0) {
			statusSpan.style.backgroundColor = "red"
			// this.trackCounter = 0
			this.prevHand = null
			return
		}

		// don't do anything if there's only 1 track =>
		// use this to eliminate flashes of hands
		// if (++this.trackCounter == 1) return

		statusSpan.style.backgroundColor = "green"

		// console.log("tracked")
		this.hand = new Hand(results.multiHandLandmarks[0])

	}

	/**
	 * Translate the object on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	translate(hand: Hand, prevHand: Hand) {
		let horizontalDelta = getDelta(hand.middle.joints[FINGER_INDICES.PIP].x, prevHand.middle.joints[FINGER_INDICES.PIP].x, 5)
		// has to flip horizontal footage since camera flips the view
		if (this.isSelfieMode) horizontalDelta *= -1

		// has to flip vertical footage since image y-axis run top to bottom (increase downward like js)
		let verticalDelta = -getDelta(hand.wrist.y, prevHand.wrist.y, 5)

		this.mesh.translate(BABYLON.Axis.X, TRANSLATE_MULTIPLIER * horizontalDelta, BABYLON.Space.WORLD)
		this.mesh.translate(BABYLON.Axis.Y, TRANSLATE_MULTIPLIER * verticalDelta, BABYLON.Space.WORLD)
	}

	/**
	 * Rotate the object around the y axis on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	rotateAroundY(hand: Hand, prevHand: Hand) {
		// don't need to flip the horizontal for this. The rotation matches
		// with the flipped image
		let horizontalDelta = getDelta(hand.index.joints[FINGER_INDICES.TIP].x, prevHand.index.joints[FINGER_INDICES.TIP].x, 5)
		if (!this.isSelfieMode) horizontalDelta *= -1

		this.mesh.rotate(BABYLON.Axis.Y, ROTATE_MULTIPLIER * horizontalDelta)
	}

	/**
	 * Rotate the object around x-axis on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	rotateAroundX(hand: Hand, prevHand: Hand) {
		let verticalDelta = getDelta(hand.index.joints[FINGER_INDICES.TIP].y, prevHand.index.joints[FINGER_INDICES.TIP].y, 5)

		this.mesh.rotate(BABYLON.Axis.X, ROTATE_MULTIPLIER * verticalDelta)
	}
	/**
	 * Subscribe to the HandTracker object for the first time.
	 * This function will be call the first time the HandTracker
	 * is initialize. Afterwards, it will switch to the usual
	 * onFrameCallback.
	 * @param tracker a HandTracker object.
	 */
	subscribe(tracker: HandTracker) {
		let key = "firstFrame"
		tracker.addListener(this.firstFrameCallback.bind(this, tracker, key), key)
	}
}