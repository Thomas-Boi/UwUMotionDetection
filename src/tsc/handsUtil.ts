/**
 * The indices that correspond to the enum names within
 * a LandmarkList.
 */
const LANDMARK_INDEX = {
	WRIST: 0,
	THUMB_CMC: 1,
	THUMB_MCP: 2,
	THUMB_IP: 3,
	THUMB_TIP: 4,
	INDEX_FINGER_MCP: 5,
	INDEX_FINGER_PIP: 6,
	INDEX_FINGER_DIP: 7,
	INDEX_FINGER_TIP: 8,
	MIDDLE_FINGER_MCP: 9,
	MIDDLE_FINGER_PIP: 10,
	MIDDLE_FINGER_DIP: 11,
	MIDDLE_FINGER_TIP: 12,
	RING_FINGER_MCP: 13,
	RING_FINGER_PIP: 14,
	RING_FINGER_DIP: 15,
	RING_FINGER_TIP: 16,
	PINKY_MCP: 17,
	PINKY_PIP: 18,
	PINKY_DIP: 19,
	PINKY_TIP: 20
}

enum FINGER_STATE {
	OPEN,
	CLOSED
}

/**
 * The gestures that the app will recognize.
 * The numbers refer to how the average Canadians
 * would count on their fingers (1 is index finger, 2 is index + middle finger).
 */
enum GESTURES {
	FIST,
	ONE,
	TWO,
	THREE,
	FOUR,
	FIVE,
	NONE // none of the above
}

export {
	LANDMARK_INDEX,
	GESTURES
}