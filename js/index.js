import { InputSource } from "./InputSource.js"
import { HandTracker } from "./HandTracker.js"
import { Controller } from "./Controller.js"



main()
function main() {
  const tracker = new HandTracker()
  const inputSource = new InputSource()
  inputSource.initCamera(tracker)
  const controller = new Controller()
  tracker.addListener(controller.onResultsCallback)

  inputSource.start()

  // for testing
  // document.getElementById("runningCheckbox").onclick = () => {
  //   isRunning = !isRunning
  // }

}
