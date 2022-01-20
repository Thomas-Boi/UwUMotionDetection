import {GESTURES } from "./handsUtil"
import { Results } from "@mediapipe/hands"
import { HandTracker } from "./HandTracker"
import * as BABYLON from "babylonjs"
import { Hand } from "./Hand"
import { getDelta } from "./util"

const TRANSLATE_MULTIPLIER = 3

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


	constructor() {
		this.scene = null 
		this.mesh = null
		this.hand = null
		this.init3DScene()
	}

	init3DScene() {
		const canvas = <HTMLCanvasElement> document.getElementById("canvas")
		const engine = new BABYLON.Engine(canvas, true)

		this.scene = new BABYLON.Scene(engine)
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
	 */
	firstFrameCallback(results: Results | null, prevResults: Results | null, bothValid: boolean) {
		// only care about 1 hand
		this.hand = new Hand(results.multiHandLandmarks[0])
		this.prevHand = new Hand(results.multiHandLandmarks[0])

	}

	/**
	 * Handle the onResults event of the Hands tracker.
	 * @param results the result of the data parsing.
	 * @param prevResults the result of the data parsing.
	 * @param bothValid whether both results are usable. 
	 * If true, both results contain data. If false, 
	 * either one or both results are null or empty.
	 */
	onResultsCallback(results: Results | null, prevResults: Results | null, bothValid: boolean) {
		if (!bothValid) return
		// only care about 1 hand
		this.hand.updateHand(results.multiHandLandmarks[0])
		this.prevHand.updateHand(prevResults.multiHandLandmarks[0])
		if (this.hand.determineGesture() === GESTURES.FIST) {
			this.translate(this.hand, this.prevHand)
		}
	}

	/**
	 * Translate the object on screen based on the hand and prevHand.
	 * @param hand the hand of this current frame.
	 * @param prevHand the hand of the previous frame.
	 */
	translate(hand: Hand, prevHand: Hand) {
		// has to flip horizontal footage since camera flips the view
		let horizontalDelta = -getDelta(hand.wrist.x, prevHand.wrist.x, 5)

		// has to flip vertical footage since image y-axis run top to bottom (increase downward like js)
		let verticalDelta = -getDelta(hand.wrist.y, prevHand.wrist.y, 5)

		this.mesh.translate(BABYLON.Axis.X, TRANSLATE_MULTIPLIER * horizontalDelta)
		this.mesh.translate(BABYLON.Axis.Y, TRANSLATE_MULTIPLIER * verticalDelta)
	}

	/**
	 * Subscribe to the HandTracker object.
	 * @param tracker a HandTracker object.
	 */
	subscribe(tracker: HandTracker) {
		tracker.addListener(this.onResultsCallback.bind(this))
	}
}