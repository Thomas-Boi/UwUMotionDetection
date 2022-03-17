import { LANDMARK_AMOUNT } from "./handsUtil"
import * as Gesture from "./Gesture"
import { Results } from "@mediapipe/hands"
import { HandTracker } from "./HandTracker"
import * as BABYLON from "babylonjs"
import { Hand } from "./Hand"
import { FINGER_INDICES } from "./Finger"
import { getDelta } from "./util"
import { Vector3 } from "babylonjs"

// for interacting with the cube
const TRANSLATE_MULTIPLIER = 4
const ROTATE_MULTIPLIER = 6
const SCALE_MULTIPLIER = 2

// tracks how long the user needs to hold their
// hand to activate something
const RESET_COUNTER_THRESHOLD_MILISEC = 1000
const START_THRESHOLD_MILISEC = 600

// when the track counter pass this threshold,
// we are confident that the user is intentionally making a shape 
// with their hand and not due to noises.
const SHAPE_COUNTER_THRESHOLD = 5
const statusSpan = document.getElementById("status")

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
	camera: BABYLON.ArcRotateCamera

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
	 * Track when we need to switch to a new state. 
	 * Used to set the curState.
	 */
	shapeCounter: number

	/**
	 * The current state of the user's hand.
	 */
	curState: null | Gesture.Gesture

	/**
	 * The latest shape that we detected from the user.
	 */
	latestGesture: null | Gesture.Gesture

	/**
	 * The counter for tracking the reset gesture. Increment
	 * for every second the user holds the gesture.
	 */
	resetCounter: number

	/**
	 * The current time in milisecond.
	 */
	gestureStartTime: number

	/**
	 * The gestures we want the controller to look for.
	 */
	gesturesToDetect: Array<Gesture.Gesture>

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
		this.shapeCounter = 0

		this.gesturesToDetect = [
			Gesture.FIVE,
			Gesture.GRAB_FIST,
			Gesture.ONE,
			Gesture.ROTATE_X,
			Gesture.THUMBS_UP,
			Gesture.L_SHAPE
		]

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
			faceColors: [
				new BABYLON.Color4(1, 0, 0, 0), new BABYLON.Color4(1, 0, 0, 0), new BABYLON.Color4(1, 0, 0, 0),
				new BABYLON.Color4(0, 1, 0, 0), new BABYLON.Color4(0, 1, 0, 0), new BABYLON.Color4(0, 1, 0, 0)
			],
			size: 0.5
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
		// show the start message
		document.getElementById("loadingUI").style.display = "none"
		document.getElementById("startMsg").style.display = "flex"
		document.getElementById("status").style.display = "inline-block"

		// check and see the state of the Controller, which is
		// the current hand gesture of the user.
		this.detectShape(results)

		if (this.curState == Gesture.FIVE) {
			if (Date.now() - this.gestureStartTime >= START_THRESHOLD_MILISEC) {
				tracker.removeListener(key)
				tracker.addListener(this.onResultsCallback.bind(this))
				document.getElementById("loadingScreen").style.display = "none"
			}
		}
	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 * @param results the result of the data parsing.
	 */
	onResultsCallback(results: Results | null) {
		// check and see the state of the Controller, which is
		// the current hand gesture of the user.
		this.detectShape(results)

		if (!(this.hand && this.prevHand)) {
			// do nothing since we need both to be valid
			// to do calc, just skip the checks

			// for prevHand
			// if there's a none flash in between
			// two valid gestures, the 2nd valid gesture will have
			// a null prevHand => this checks avoid it
		}
		else if (this.curState == Gesture.GRAB_FIST) {
			this.translate(this.hand, this.prevHand)
		}
		else if (this.curState == Gesture.ONE) {
			this.rotateAroundY(this.hand, this.prevHand)
		}
		else if (this.curState == Gesture.ROTATE_X) {
			this.rotateAroundX(this.hand, this.prevHand)
		}
		else if (this.curState == Gesture.THUMBS_UP) {
			this.zoom(this.hand, this.prevHand)
		}
		else if (this.curState == Gesture.L_SHAPE) {
			if (Date.now() - this.gestureStartTime >= RESET_COUNTER_THRESHOLD_MILISEC) {
				this.reset()
				// change the start time so we don't reset multiple times
				this.gestureStartTime = Date.now()
			}

		}

		this.prevHand = this.hand
	}

	/**
	 * Detect the shape of the user's hand.
	 */
	detectShape(results: Results | null) {
		// check if the result is usable
		// if not, mark this.prevHand to null to signify
		// we can't do any calculations.
		let newGesture = null
		if (!results || results.multiHandLandmarks.length === 0) {
			statusSpan.style.backgroundColor = "#ff0007"  // bright red
			this.hand = null
		}
		else {
			// valid data => start analyzing the shape
			statusSpan.style.backgroundColor = "#02fd49" // neon green
			this.hand = new Hand(results.multiHandLandmarks[0])
			for (let gesture of this.gesturesToDetect) {
				if (this.hand.matches(gesture)) {
					newGesture = gesture
					break
				}
			}
		}

		// matching our state => do nothing and continue as normal
		if (newGesture == this.curState) {
			this.latestGesture = newGesture
			return
		}

		// new gesture we never see before => start counting
		if (newGesture != this.latestGesture) {
			this.shapeCounter = 1
		}
		// we've seen this gesture recently => user might be switching
		// so we start counting
		else this.shapeCounter++

		// pretty sure this is what the user wants => switch to the new state
		if (this.shapeCounter >= SHAPE_COUNTER_THRESHOLD) {
			this.curState = newGesture
			// only get the time when switch to new gesture
			this.gestureStartTime = Date.now()
		}
		this.latestGesture = newGesture

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
		// has to fliip the vertical to get the right rotation
		let verticalDelta = -getDelta(hand.index.joints[FINGER_INDICES.TIP].y, prevHand.index.joints[FINGER_INDICES.TIP].y, 5)

		this.mesh.rotate(BABYLON.Axis.X, ROTATE_MULTIPLIER * verticalDelta, BABYLON.Space.WORLD)
	}

	/**
	 * Zoom/scale the object on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	zoom(hand: Hand, prevHand: Hand) {
		let horizontalDelta = getDelta(hand.middle.joints[FINGER_INDICES.PIP].x, prevHand.middle.joints[FINGER_INDICES.PIP].x, 5)
		// has to flip horizontal footage since camera flips the view
		if (this.isSelfieMode) horizontalDelta *= -1

		let scale = horizontalDelta * SCALE_MULTIPLIER
		this.mesh.scaling.addInPlaceFromFloats(scale, scale, scale)

	}

	/**
	 * Reset the cube's position, rotation, and scale to its original.
	 */
	reset() {
		this.mesh.scaling = new Vector3(1, 1, 1)
		this.mesh.position = new Vector3(0, 0, 0)
		this.mesh.rotation = new Vector3(0, 0, 0)
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