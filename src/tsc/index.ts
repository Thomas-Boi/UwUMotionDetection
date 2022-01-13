import { InputSource } from "./InputSource"
import { HandTracker } from "./HandTracker"
import { Controller } from "./Controller"



main()
function main() {
  const tracker = new HandTracker()
  const inputSource = new InputSource()

  // for testing, do not hide the video
  inputSource.initVideoElement(false)

  inputSource.initCamera(tracker)
  const controller = new Controller()
  controller.subscribe(tracker)

  inputSource.start()
  let checkbox = <HTMLInputElement> document.getElementById("runningCheckbox")
  checkbox.checked = true

  // for testing
  checkbox.onclick = () => {
    inputSource.isRunning ? inputSource.stop() : inputSource.start()
  }

}
