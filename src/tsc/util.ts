import { Vector3 } from "babylonjs";

/**
 * Determines whether point fits on the line. 
 * If point is within range of variation (inclusive),
 * this counts as being on the line.
 * @param point the point we are checking.
 * @param start the starting point of the line equation.
 * @param vector the vector part of the line equation.
 * @param variation the margin of error we allow point to be 
 * off the line.
 * @returns whether the point fits on the line.
 */
export function fitOnLine(point: Vector3, start: Vector3, vector: Vector3, variation: number): boolean {
	// find the vector from startingPoint to point
	let source = point.subtract(start)

	// we now find the project of source onto vector
	// formula is projection = (source . unit vector) * unit vector
	let unitVector = vector.normalizeToNew()
	// scale is used to multiply vector with scalar
	let projection = unitVector.scale(Vector3.Dot(source, unitVector)) 

	// we have the projection => use it to find the perpendicular component
	let perpendicular = source.subtract(projection)

	// find the magnitude/length of the perpendicular vector
	// and check that it's within the variation
	return perpendicular.length() <= variation
}

/**
 * Get the difference between 2 numbers. Also round it
 * to decimalPlace.
 * @param a, the first number. 
 * @param b, the second number.
 * @param decimalPlace, how much we are rounding the delta result.
 * Default to 2 decimal place.
 * @returns 
 */
export function getDelta(a: number, b: number, decimalPlace: number=2) {
	let delta = a - b

	// round to x decimal place, see https://stackoverflow.com/a/11832950/11683637
	let decimalConvertor = 10 ** decimalPlace
	delta = Math.round(delta * decimalConvertor) / decimalConvertor
	return delta
}
