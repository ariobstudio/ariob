/**
 * Hello World - THE app example
 *
 * THE views exist on a line. We control:
 * - flow: direction of line (>, <, v, ^)
 * - drip: alignment on line (-1, 0, 1)
 * - fill: color [r,g,b,a] or text "string"
 * - size: dimensions [[w,unit], [h,unit]]
 * - turn: rotation [z, x, y] in turns
 * - grab: translation [x, y, z]
 * - zoom: scale [x, y, z]
 * - time: transition duration in seconds
 *
 * @param {Object} the - THE runtime instance
 */
export default function(the){
  // Set text on root view
  the.view.fill = "Hello World!"
}
