import { InputSource } from "./InputSource"
import { HandTracker } from "./HandTracker"
import { Controller } from "./Controller"



main()
function main() {
  // set up components
  const tracker = new HandTracker()
  const inputSource = new InputSource()
  const controller = new Controller(inputSource.facingMode)

  // connect the pipeline
  // input -> tracker -> controller
  inputSource.initCamera(tracker)
  controller.subscribe(tracker)

  inputSource.start()
}
