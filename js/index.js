import {WRIST_INDEX} from "./handsUtil.js"
import {Hands} from "@mediapipe/hands"
import {Camera} from "@mediapipe/camera_utils"


/**
 * The message element for testing.
 */
const messageElem = document.getElementById("message")

/**
 * Store the previous hand coordinate.
 */
let prevHandCoord = undefined

/**
 * Whether the script is running. Use for testing.
 */
let isRunning = true


main()
function main() {
  const hands = initHandsTracker()  
  const videoElement = document.getElementById('input_video')
  const camera = initCamera(hands, videoElement)
  // start getting the camera footage
  camera.start()

  // for testing
  document.getElementById("runningCheckbox").onclick = () => {
    isRunning = !isRunning
  }

}

/**
 * Init the hands tracker.
 * @returns a Hands object representing the created gesture recognizer.
 */
function initHandsTracker() {
  const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  }})

  hands.setOptions({
    maxNumHands: 1, // only need one hand
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  })

  // set callbacks whenever a result is passed
  hands.onResults(onResultsCallback)

  return hands
}

/**
 * Init the camera.
 * This is taken from the camera util script
 * and relies on having a video element
 * @param {Hands} hands the Hands tracker.
 * @param {HTMLVideoElement} videoElement - a video element
 * containing the data we want the hands to analyze.
 * @return {Camera} the created camera object.
 */
function initCamera(hands, videoElement) {
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      if (!isRunning) return Promise.resolve()

      await hands.send({image: videoElement})
    },
    width: 128,
    height: 72
  })

  return camera
}

/**
 * Handle the onResults event of the Hands tracker.
 * @param {Results} results the result of the data parsing.
 */
function onResultsCallback(results) {
  let txt = "NONE"
  if (results.multiHandLandmarks && results.multiHandLandmarks.length != 0) {

    // only care about 1 hand
    let hand = results.multiHandLandmarks[0]

    if (prevHandCoord) {
      try {
        let delta = hand[WRIST_INDEX].x - prevHandCoord[WRIST_INDEX].x

        // round to 2 decimal place, see https://stackoverflow.com/a/11832950/11683637
        delta = Math.round(delta * 100) / 100

        if (delta == 0) txt = "STAY"
        else if (delta > 0) txt = "RIGHT"
        else txt = "LEFT"
      }
      catch(e) {
        console.log("Multi handlandmarks: ", results.multiHandLandmarks)
        console.log("Hand: ", hand)
        console.log("prevHandCoord", prevHandCoord)
      }
    }

    prevHandCoord = hand
  }
  messageElem.textContent = txt
}
