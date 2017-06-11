function cons(car, cdr) {
  this.car = car;
  this.cdr = cdr;
}

// takes a stack of symbols, returns a pair: a tree and the remaining symbols
function fold(split) {
  if (split == null) return (new cons (null, null));
  if (split.length == 0) return (new cons (null, null));
  var token = split.pop();
  if (token == "") return (new cons (null, null));
//System.stdout.writeln("Token: |" + token + "|");
  if (token == "(") return (new cons (null, split));
  var next = fold(split);
  if (token == ")") {
    if (next.car == null) return (new cons (null, split));
    var nextnext = fold(next.cdr);
    if (nextnext.car == null) return (new cons (next.car, nextnext.cdr));
    return (new cons ((new cons (nextnext.car, next.car)),
                      nextnext.cdr))
  }
  if (next.car == null) return (new cons (token, next.cdr));
  return (new cons ((new cons (next.car, token)),
                    next.cdr))
}

// Keep reducing until there is no more change
function fixedPoint (tree) {
  var t2 = reduce(tree);
  if (treeToString(tree) == treeToString(t2)) return (tree);
  return (fixedPoint (t2));
}

// Reduce all the arguments, then try to do beta conversion on the whole
function reduce(tree) {
  if (tree == null) {
    console.log('tree is null');
    return (tree);
  } else if (typeof(tree) == "string") {
    console.log('tree is string: ' + tree);
    return (tree);
  } else {
    console.log('tree is: ');
    console.log(tree);
    var a = reduce (tree.car);
    var b = reduce (tree.cdr);
    return (convert (new cons (a, b)));
  }
}

/*
// Reduce all the arguments in a list
function mapReduce(tree) {
  if (tree == null) return (tree);
  if (tree.car == null) return (tree);
  return (new cons (reduce (tree.car), mapReduce(tree.cdr )));
}
*/

function leftDepth(tree) {
  if (tree == null) return (0);
  if (typeof(tree) == "string") return (0); 
  return (1 + leftDepth(tree.car));
} 

function convert(tree) {

  // I X ==> X
  if ((leftDepth(tree) == 1) && (tree.car == "I"))
    return (tree.cdr);

  // K X Y ==> X
  if ((leftDepth(tree) == 2) && (tree.car.car == "K"))
    return (tree.car.cdr);

  // S X Y Z ==> ((X Z)(Y Z))
  if ((leftDepth(tree) == 3) && (tree.car.car.car == "S"))
    return (new cons ((new cons (tree.car.car.cdr, tree.cdr)),
                      (new cons (tree.car.cdr, tree.cdr))));

  return(tree); 
}

function treeToString(tree) {
  if (tree == null) return ("")
  if (tree.car == null) return (tree.cdr)
  if ((tree.car).car == null) 
    return (treeToString(tree.car) + " " + treeToString(tree.cdr))
  return ("(" + treeToString(tree.car) + ")" + treeToString(tree.cdr))
}

// use this instead of treeToString if you want to see the full structure
function treeToStringRaw(tree) {
  if (tree == null) return ("@")
  if (typeof(tree) == "string") return (tree);
  return ("("+treeToStringRaw(tree.car) + treeToStringRaw(tree.cdr) + ")")
}

function stringToTree(input) {
  input = input.replace(/[ \f\n\r\t\v]/g,"");
  input = input.replace(/(.)/g, " $1");
//System.stdout.writeln(input);
  return ((fold(input.split(/ /))).car);
}
/*
function mytry(form) { 
  i = 0;
  form.result.value = treeToStringRaw(fixedPoint(stringToTree(form.input.value)));
}
*/
function mytry(input) { 
  i = 0;
  result = treeToStringRaw(fixedPoint(stringToTree(input)));
  console.log(result);
}

mytry('Kab');
//mytry('Ki');
//mytry('K(Ki)K');
