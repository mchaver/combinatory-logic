function eval(input) {
  return treeToStringRaw(fixedPoint(stringToTree(input)));
}

function cons(car, cdr) { 
  this.car = car;
  this.cdr = cdr;
}

function leftDepth(tree) {
  if (Object.prototype.toString.call(tree) === '[object Object]' && tree.hasOwnProperty('car')) {
    return (1 + leftDepth(tree.car));
  } else {
    return 0;
  }
}

function reduce(tree) {
  if (tree == null) return (tree);
  if (typeof(tree) == "string") return (tree);
  return (convert (new cons (reduce (tree.car), reduce (tree.cdr))));
}

function fold(split) {
  if (split == null) return (new cons (null, null));
  if (split.length == 0) return (new cons (null, null));
  var token = split.pop();
  if (token == "") return (new cons (null, null));
  if (token == "(") return (new cons (null, split));
  var next = fold(split);
  if (token == ")") {
    if (next.car == null) return (new cons (null, split));
    var nextnext = fold(next.cdr);
    if (nextnext.car == null) return (new cons (next.car, nextnext.cdr));
    return (new cons ((new cons (nextnext.car, next.car)),
                      nextnext.cdr))
  }
  if (next.car == null) return (new cons (token, next.cdr)); // build right side with next
  return (new cons ((new cons (next.car, token)),
                    next.cdr))
}

function fixedPoint (tree) {
  var t2 = reduce(tree);
  if (treeToString(tree) == treeToString(t2)) return (tree);
  console.log(t2);
  return (fixedPoint (t2));
}


function convert(tree) {
  var treeDepth = leftDepth(tree);
  
  if (treeDepth === 1 && tree.car === 'I') {
    return tree.cdr;
  }
  
  if (treeDepth === 2 && tree.car.car === 'K') {
    return tree.car.cdr;
  }
  
  if (treeDepth === 3 && tree.car.car.car === 'S') {
    return (new cons((new cons (tree.car.car.cdr, tree.cdr)),
                     (new cons (tree.car.cdr, tree.cdr))));
  }
  
  return (tree);
}

function treeToString(tree) {
  if (tree == null) return ("")
  if (tree.car == null) return (tree.cdr)
  if ((tree.car).car == null) 
    return (treeToString(tree.car) + " " + treeToString(tree.cdr))
  return ("(" + treeToString(tree.car) + ")" + treeToString(tree.cdr))
}

function treeToStringRaw(tree) {
  if (tree == null) return ("@")
  if (typeof(tree) == "string") return (tree);
  return ("("+treeToStringRaw(tree.car) + treeToStringRaw(tree.cdr) + ")")
}

function stringToTree(input) {
  input = input.replace(/[ \f\n\r\t\v]/g,""); // remove white space
  input = input.replace(/(.)/g, " $1"); // prepend space before everything
  console.log(input);
  return ((fold(input.split(/ /))).car); // make array by splitting on space
}

console.log(eval('III(SK)K(Ki)'));
