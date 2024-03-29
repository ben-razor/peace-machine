'use strict';
/** @suppress {duplicate} */
var physii = physii || {};

(function(p) {
	p.math = 
	{
		/**
		 * Calculate the mean of an array of numbers.
		 * 
		 * @param {number[]} vals 
		 */
		avg: function(vals)
		{
			var sum = 0;		
			var avg = 0;
			var num = vals.length;

			if(num) 
			{
				for(var i = 0; i < num; i++)
				{
					sum += vals[i];
				}
				
				avg = sum / num;
			}

			return avg;
		},

		/**
		 * Check if two numbers are close to each other within precision.
		 * 
		 * Default precision is micro.
		 * 
		 * @param {number} val1 
		 * @param {number} val2 
		 * @param {number} precision 
		 */
		closeTo: function(val1, val2, precision)
		{
			precision = precision || 1e-6;
			return Math.abs(val1 - val2) < precision;
		},

		/**
		 * Takes two arrays of same length. Checks if elements of each are close
		 * within precision.
		 * 
		 * Default precision is micro.
		 * 
		 * @returns {boolean} false if any pair of elements are not close within precision
		 * @param {number[]} arr1 
		 * @param {number[]} arr2 
		 * @param {number} precision 
		 */
		closeToArr: function(arr1, arr2, precision)
		{
			var result = true;
			precision = precision || 1e-6;

			for(var i = 0; i < arr1.length; i++)
			{
				result = my.closeTo(arr1[i], arr2[i], precision);
				if(!result) 
				{
				  break;
				}
			}

			return result;
		},

		/**
		 * Wraps a float into a range given by start and end.
		 * 
		 * Example:
		 *   wrapF(2.3, 1, 2) -> 1.3
		 *   wrapF(0.7, 1, 2) => 1.7
		 * 
		 * @param {float} val 
		 * @param {float} start 
		 * @param {float} end 
		 */
		wrapF: function(val, start, end)
		{
			var range = end - start;

			if(val > end)
			{
				val = start + (val % end);
			}
			else if(val < start)
			{
				val = end - ((start - val) % end);
			}

			return val;
		},

		/**
		 * Wraps an int into a range given by start and end.
		 * 
		 * Example:
		 *   wrapF(5, 1, 4) -> 2 
		 *   wrapF(1, 3, 6) => 4 
		 * 
		 * @param {float} val 
		 * @param {float} start 
		 * @param {float} end 
		 */
		wrap: function(val, start, end)
		{
			var range = end - start;

			if(val > end)
			{
				val = start + (val % (end + 1));
			}
			else if(val < start)
			{
				val = end - ((start - (val + 1)) % end);	
			}

			return val;
		},

		/**
		 * Checks if val is in range[0] -> range[1] inclusive.
		 * 
		 * @param {number} val 
		 * @param {number[2]} range 
		 */
		inRange: function(val, range)
		{
			var rangeLow = range[0];
			var rangeHigh = range[1];
			if(rangeLow > rangeHigh)
			{
				var temp = rangeLow;
				rangeLow = rangeHigh;
				rangeHigh = temp;
			}
			return (val >= rangeLow && val <= rangeHigh);
		},

		/**
		 * Checks if val is in an array of ranges inclusive.
		 * 
		 * @param {number} val 
		 * @param {number[2]} range 
		 */
		inRanges: function(val, ranges)
		{
			var success = false;
			for(var i = 0; i < ranges.length; i++)
			{
				var range = ranges[i];
				if(my.inRange(val, range))
				{
					success = true;
					break;
				}
			}
			return success;
		},

		/**
		 * Takes the location of a number in one range and scales / translates / flips
		 * it into a different range.
		 * 
		 * Example:
		 *   loneRanger(10, 0, 100, 0, 200) -> 20         // scale
		 *   loneRanger(10, 0, 100, 400, 200) -> 380      // scale + flip + translate
		 * 
		 * Behaviour is undefined if val is not within the first range.
		 * 
		 * @param {number} val 
		 * @param {number} inFrom 
		 * @param {number} inTo 
		 * @param {number} outFrom 
		 * @param {number} outTo 
		 */
		loneRanger: function(val, inFrom, inTo, outFrom, outTo) 
		{
			if(outFrom === undefined) 
			{
				outFrom = inFrom;
			}
			if(outTo === undefined)
 			{
				outTo = inTo;
			}

			var low = Math.min(inFrom, inTo);
			var high = Math.max(inFrom, inTo);

			val = Math.min(val, high);
			val = Math.max(val, low);

			var newVal = val - inFrom;
			var mul = newVal / (inTo - inFrom);
			var outRange = outTo - outFrom;
			var out = outFrom + mul * outRange;

			return out;
		},

		/**
		 * Applies standard quadratic equation solver to find roots of
		 * ax^2 + bx + c = 0.
		 * 
		 * @returns {number[2]} roots or null if no roots
		 * 
		 * @param {number} a 
		 * @param {number} b 
		 * @param {number} c 
		 */
		quadraticFormula: function(a, b, c)
		{
			var solutions = null;
			var toRoot = 0, root = 0;

			if(a != 0)
			{
				toRoot = b * b - 4 * a * c;

				if(toRoot >= 0)
				{
					root = Math.sqrt(toRoot);
					solutions = [];
					solutions[0] = (-b + root) / (2 * a);
					solutions[1] = (-b - root) / (2 * a);
				}
			}
			return solutions;
		},

		/**
		 * Gets the solution of lower value from the solutions returned
		 * by the quadratic formula.
		 * 
		 * @param {number[2]} solutions
		 */
		getLowestSolution: function(solutions)
		{
			if(!solutions)
			{
				return;
			}
			var solution = 0;
			var soln1 = solutions[0];
			var soln2 = solutions[1];
			var soln1Valid = soln1 && soln1 > 0;
			var soln2Valid = soln2 && soln2 > 0;

			if(soln1Valid && soln2Valid)
			{
				solution = Math.min(soln1, soln2);
			}
			else if(soln1Valid)
			{
				solution = soln1;
			}
			else if(soln2Valid)
			{
				solution = soln2;
			}
			
			return solution;
		},

		/**
		 * Converts from metres per sec to other units.
		 * 
		 * @param {number} val 
		 * @param {string} to mph|kph 
		 */
		convMPerSec: function(val, to)
		{
			var returnVal = 0;

			if(to === 'mph' || to === 'MPH')
			{
				returnVal = val * 2.2369;
			}
			else if(to === 'kph' || to === 'KPH')
			{
				returnVal = val * 3.6;
			}

			return returnVal;
		},

		/**
		 * Finds the number in an array of values that is closest to val.
		 * 
		 * @param {number} val 
		 * @param {number[]} vals 
		 */
		closest: function(val, vals) 
		{
			var closestDist = Infinity;
			var closestVal = val;

			for(var i = 0; i < vals.length; i++)
			{
				var curVal = vals[i];
				var dist = Math.abs(val - curVal);
				if(dist < closestDist)
				{
					closestDist = dist;
					closestVal = curVal; 
				}
			}

			return closestVal;
		},

		/**
		 * Puts a number on the other side of a pivot number.
		 *
		 * E.g. 18 pivoted around 16 is 14.
		 * 5 pivoted around 0 is -5
		 */
		pivotNumber: function(val, pivot)
		{
			return pivot + (pivot - val);
		},

		/**
		 * Finds if a value is between start and end value.
		 * 
		 * @param {number} val
		 * @param {number} start
		 * @param {number} end 
		 * @param {boolean=} exclusive
		 */
		between: function(val, start, end, exclusive)
		{
			if(end < start)
			{
				var temp = end;
				end = start;
				start = temp;
			}

			if(exclusive)
			{
				return val > start && val < end;
			}
			else
			{
				return val >= start && val <= end;
			}
		},

		/**
		 * Clamps number into a range.
		 * 
		 * @param {number} val 
		 * @param {number} start 
		 * @param {number} end 
		 */
		putInRange: function(val, start, end)
		{
			var temp = null;
			if(start > end)
			{
				temp = start;
				start = end;
				end = temp;
			}
			return Math.max(Math.min(val, end), start);
		},

		/**
		 * Chop a range into a number of segments.
		 *
		 * Get the start and end value for a segment of the line at an index.
		 */
		getLineSegment: function(segmentIndex, start, end, numSegments, safetyDist)
		{
			safetyDist = safetyDist || 0;
			var length = (end - start) - (safetyDist * 2);
			var segmentLength = length / numSegments;
			var segmentStart = (start + safetyDist) + (segmentIndex * segmentLength);
			var segmentEnd = segmentStart + segmentLength;
			return [segmentStart, segmentEnd]; 
		},

		/**
		 * Chop a range into a number of segments.
		 *
		 * Get the start and end value for a segment of the line at an index.
		 *
		 *
		 */
		getLineSegmentRatio: function(segmentIndex, start, end, segments, safetyDist)
		{
			var numSegments = segments.length;
			safetyDist = safetyDist || 0;
			var length = (end - start) - (safetyDist * 2);
			var segmentLength = length / numSegments;
			var segmentStartRatio = segments[segmentIndex]; 
			var endIndex = segmentIndex + 1;
			var segmentEndRatio = segmentIndex < segments.length - 1 ? segments[endIndex] : 1;
			var segmentStart = (start + safetyDist) + (segmentStartRatio * length);
			var segmentEnd = (start + safetyDist) + length * segmentEndRatio;
			return [segmentStart, segmentEnd]; 
		},

		/**
		 * Linear interpolation of ratio into range start to end.
		 * 
		 * Optionally clamps the value into range start end.
		 * 
		 * @param {number} start 
		 * @param {number} end 
		 * @param {number} ratio 
		 * @param {number} clamp 
		 */
		interpolate: function(start, end, ratio, clamp)
		{
			var val = start + ((end - start) * ratio);

			if(clamp)
			{
				val = Math.min(end, Math.max(start, val));
			}

			return val;
		}
	};
	var my = p.math;
})(physii);

