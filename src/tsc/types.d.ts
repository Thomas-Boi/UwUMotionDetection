import { Results } from "@mediapipe/hands";

/**
 * Handle the onResults event of the Hands tracker.
 * @param results the result of the data parsing.
 * @param prevResults the result of the data parsing.
 * @param bothValid whether both results are usable. If true, both results
 * contain data. If false, either one or both results are null or empty.
 */
export type HandTrackerListener = (results: Results | null, prevResults: Results | null, bothValid: boolean) => (void)