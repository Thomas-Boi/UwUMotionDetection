import { InputSource } from "./InputSource"
import { HandTracker } from "./HandTracker"
import { Controller } from "./Controller"



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
