import {Camera} from "@mediapipe/camera_utils"

/**
 * Handle work related to the camera.
 */
export class InputSource {
	constructor() {
		this.isRunning = true
		this.videoElement = null
		this.camera = null
	}

	/**
	 * Init the camera.
	 * This is taken from the camera util script
	 * and relies on having a video element
	 * @param {HandTracker} tracker the Hands tracker.
	 */
	initCamera(tracker) {
		// need to init a <video> element in the DOM first
		this._initVideoElement()

		this.camera = new Camera(this.videoElement, {
			onFrame: async () => {
				if (!this.isRunning) return Promise.resolve()

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