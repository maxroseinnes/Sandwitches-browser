function quickSort(arr) {
	if (arr.length <= 1) { 
		return arr;
	} else {
		var left = [];
		var right = [];
		var newArr = [];
		var pivot = arr.pop();

		for (var i = 0; i < arr.length; i++) {
			if (arr[i] <= pivot) {
				left.push(arr[i]);
			} else {
				right.push(arr[i]);
			}
		}

		return newArr.concat(quickSort(left), pivot, quickSort(right));
	}
}

var arr = [-74,-61,-95,-74,51,-93,34,34,86,39,2,-33,-24,30,77,61,9,89,-11,-89,22,-37,-98,80,-44,99,-10,-92,50,40,-45,-31,2,3,-6,66,80,-50,-2,-29,31,70,70,69,50,76,1,70,-98,11,-59,3,-16,-53,-74,-80,39,53,-12,14,85,-42,-68,52,46,26,74,72,-68,-51,54,-56,-90,-85,-69,94,-24,-78,-23,-87,59,-66,59,-35,89,-44,0,86,75,-7,19,-36,-80,-25,-26,-66,-26,7,96,98]


var newarr = quickSort(arr)
console.log(newarr)