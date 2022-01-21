import {Camera} from "@mediapipe/camera_utils"
import { HandTracker } from "./HandTracker"

/**
 * Tracks how many steps/update we can do per second.
 * This frame cap improve performance (doesn't update unless needed).
 * Also prevent the camera from taking duplicate images where the
 * user's hand hasn't move => also improve performance so we don't
 * update the app when we don't need to.
 */
const STEPS_PER_SEC = 10

/**
 * Tracks how long in second each step should take.
 */
const UPDATE_STEP_IN_SEC = 1000 / STEPS_PER_SEC

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


	constructor() {
		this.videoElement = null
		this.camera = null
		this.isRunning = false
		this.processedFrame = false
	}

	/**
	 * Init the camera.
	 * This is taken from the camera util script
	 * and relies on having a video element
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
					// this.fps++
					await tracker.hands.send({image: this.videoElement})
					this.processedFrame = true
				}
			},
			width: 128,
			height: 72
		})

		setInterval(this.setProcessedFrame.bind(this, false), UPDATE_STEP_IN_SEC)
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