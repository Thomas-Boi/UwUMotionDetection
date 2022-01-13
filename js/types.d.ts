import { Results } from "@mediapipe/hands";

export type HandTrackerListener = (results: Results, prevResults: Results | null) => (void);