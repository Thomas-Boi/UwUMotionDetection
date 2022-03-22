import {Camera} from "@mediapipe/camera_utils"
import { HandTracker } from "./HandTracker"

/**
 * Tracks how many steps/update we can do per second.
 * This frame cap improve performance (doesn't update unless needed).
 * Also prevent the camera from taking duplicate images where the
 * user's hand hasn't move => also improve performance so we don't
 * update the app when we don't need to.
 */
const STEPS_PER_SEC = 20

/**
 * Tracks how long in second each step should take.
 */
const UPDATE_STEP_IN_A_SEC = 1000 / STEPS_PER_SEC

/**
 * Handle work related to the camera.
 */
export class InputSource {
	/**
	 * The video element that we are storing the stream in.
	 */
	videoElement: HTMLVideoElement

	/**
	 * The MediaPipe Camera object.
	 */
	camera: Camera

	/**
	 * Whether the input source is running.
	 */
	isRunning: boolean

	/**
	 * Whether we have processed the frame within this step.
	 */
	processedFrame: boolean

	/**
	 * The camera input we are getting.
	 * "User" means front facing (relavtive to screen) aka selfie mode.
	 * "Environment" means back facing aka normal camera mode.
	 */
	facingMode: "user" | "environment"

	constructor() {
		this.videoElement = null
		this.camera = null
		this.isRunning = false
		this.processedFrame = false
		
		// detect whether we are on a mobile phone
		// if we are on a phone, switch to env facing mode
		// if we are on a desktop => front facing 
		this.facingMode = /Mobi/.test(navigator.userAgent) ? "environment" : "user"
	}

	/**
	 * Init the camera.
	 * @note the left and right side of the input image
	 * is depended on the camera type. For a camera,
	 * moving your hand to the left will yield a video showing
	 * your hand moving to the right (in your POV). This is because 
	 * your hand is moving at (-1, 0). However, since the camera is opposite of
	 * you, it sees that your hand is moving at (1, 0). Thus, it will draw
	 * your hand moving at (1, 0) on the canvas => for us, it will
	 * be moving to the right. 
	 * @param tracker the Hands tracker.
	 */
	initCamera(tracker: HandTracker) {
		// need to init a <video> element in the DOM first
		if (this.videoElement == null) this.initVideoElement()

		this.camera = new Camera(this.videoElement, {
			onFrame: async () => {
				// do this to ensure that we only process the frame
				// according to the interval set below
				if (!this.processedFrame) {
					await tracker.hands.send({image: this.videoElement})
					this.processedFrame = true
				}
			},
			// only need a small resolution
			width: 256,
			height: 144,
			facingMode: this.facingMode
		})

		setInterval(this.setProcessedFrame.bind(this, false), UPDATE_STEP_IN_A_SEC)
	}

	/**
	 * Create the video element in the DOM.
	 * @param hideVid whether to hide the video element.
	 */
	initVideoElement(hideVid: boolean=true) {
		let videoElement = document.createElement("video")
		if (hideVid) videoElement.style.display = "none"
		document.body.append(videoElement)
		this.videoElement = videoElement
	}

	/**
	 * @param value the new value.
	 */
	setProcessedFrame(value: boolean) {
		this.processedFrame = value
	}

	/**
	 * Start getting the inputs.
	 */
	start() {
		this.camera.start()
		this.isRunning = true
	}

	/**
	 * Stop getting the inputs.
	 */
	stop() {
		this.camera.stop()
		this.isRunning = false
	}
}