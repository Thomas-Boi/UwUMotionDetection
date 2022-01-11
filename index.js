const videoElement = document.getElementsByClassName('input_video')[0];
// const canvasElement = document.getElementsByClassName('output_canvas')[0];
// const canvasCtx = canvasElement.getContext('2d');
const messageElem = document.getElementById("message")
const WRIST_INDEX = 0

let prevHandCoord = undefined
let isRunning = true

function onResults(results) {
  if (!isRunning) return
  // multiHandLandmarks contains up to 2 arrays representing two hands
  // each element represents 1 hand and contains an arrays of landmarks 
  /**
   * multiHandLandmarks = [
   *  [ // hand 1
   *    {x, y, z}  // a landmark
   *  ] 
   * ]
   */
  let txt = "NONE";
  if (results.multiHandLandmarks && results.multiHandLandmarks.length != 0) {
    let hand = results.multiHandLandmarks[0]
    if (prevHandCoord) {
      try {
        let delta = hand[WRIST_INDEX].x - prevHandCoord[WRIST_INDEX].x

        // round to 2 decimal place, see https://stackoverflow.com/a/11832950/11683637
        delta = Math.round(delta * 100) / 100
        console.log(delta)

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
  messageElem.textContent = txt;
}

document.getElementById("runningCheckbox").onclick = toggleIsRunning;
function toggleIsRunning() {
  isRunning = !isRunning;
}

function drawHandsDetected(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
      results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks) {
    // draw out the detection spots
    for (const landmarks of multiHandLandmarks) {
      // functions below taken from drawing-utils HTML script
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                      {color: '#00FF00', lineWidth: 5});
      drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
    }
  }
  canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
  maxNumHands: 1, // only need one hand
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

// set callbacks whenever a result is passed
hands.onResults(onResults);

// init the camera
// taken from the camera util script
// this relies on having a video element
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
  },
  width: 128,
  height: 72
});
camera.start();