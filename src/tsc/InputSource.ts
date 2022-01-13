import {Camera} from "@mediapipe/camera_utils"
import { HandTracker } from "./HandTracker"

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

	constructor() {
		this.videoElement = null
		this.camera = null
	}

	/**
	 * Init the camera.
	 * This is taken from the camera util script
	 * and relies on having a video element
	 * @param tracker the Hands tracker.
	 */
	initCamera(tracker: HandTracker) {
		// need to init a <video> element in the DOM first
		this._initVideoElement()

		this.camera = new Camera(this.videoElement, {
			onFrame: async () => {
				await tracker.hands.send({image: this.videoElement})
			},
			width: 128,
			height: 72
		})
	}

	/**
	 * Create the video element in the DOM.
	 */
	_initVideoElement() {
		let videoElement = document.createElement("video")
		videoElement.style.display = "none"
		document.body.append(videoElement)
		this.videoElement = videoElement
	}

	/**
	 * Start getting the inputs.
	 */
	start() {
		this.camera.start()
	}
}