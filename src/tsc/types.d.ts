import { Results } from "@mediapipe/hands";

/**
 * Defines a function that can subscribe to the HandTracker.
 */
export type HandTrackerListener = (results: Results | null, prevResults: Results | null) => (void)