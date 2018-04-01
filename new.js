function ski(val) {
  switch (val) {
  case 'I':
    this.ski = 'I';
    break;
  case 'K':
    this.ski = 'K';
    break;
  case 'S':
    this.ski = 'S';
    break;
  case 'T':
    this.ski = 'I';
    break;
  default:
    this.val = val;
    break;
  }
}

function interp(c) {
  switch (c) {
  case 'I':
    break;
  case 'K':
    break;
  case 'S':
    break:
    
  }
}

function node(left, right) {
  this.left = left;
  this.right = right;
}

function isNode(x) {
  return x !== null && typeof x === 'object' && x.hasOwnProperty('left') && x.hasOwnProperty('right');
}

function leftDepth(tree) {
  if (tree == null || typeof(tree) == "string" || !isNode(tree)) {
    return 0;
  } else {
    return (1 + leftDepth(tree.left));
  }  
}

function leftReduce(tree) {
  if (tree === null || tree === 'string' || !isNode(tree)) {
    return tree;
  } else {  
    return (convert (new node (leftReduce (tree.left), tree.right)));
  }
}


// apply primitive functions if all its required variables exist. This is part 
// of the reduction step.
function convert(tree) {
  var d = leftDepth(tree);
  
  // I x ==> x
  if ((leftDepth(tree) === 1) && (tree.left === "I")) {
    return tree.right;
  }

  // K x y ==> x
  if ((leftDepth(tree) === 2) && (tree.left.left === "K")) {
    return tree.left.right;
  }

  // S x y z ==> ((x z)(y z))
  if ((leftDepth(tree) === 3) && (tree.left.left.left === "S")) {
    return (new node ((new node (tree.left.left.right, tree.right)),
                      (new node (tree.left.right, tree.right))));
  }
  
  return tree;
}


// function nullNode 

function fold(list) {
  if (list === null)
    return (new node(null, null));
  if (list.length === 0)
    return (new node(null, null));

  var token = list.pop();

  if (token === "")
    return (new node(null, null));

  if (token === "(")
    return (new node(null, list));

  var next = fold(list);

  if (token === ")") {
    if (next.left === null) 
      return (new node (null, list));
    
    var nextnext = fold(next.right);
    
    if (nextnext.left === null) 
      return (new node (next.left, nextnext.right));
    
    return (new node ((new node (nextnext.left, next.left)),
                      nextnext.right));
  }

  if (next.left === null)
    return (new node(token, next.right));

  return (new node ((new node (next.left, token)), next.right));
}

function stringToTree(input) {
  input = input.replace(/[ \f\n\r\t\v]/g,""); // remove white space
  input = input.replace(/(.)/g, " $1");       // prepend space before everything
  return ((fold(input.split(/ /))).left);      // make array by splitting on space
}



function convertBCKW(tree) {
  var d = leftDepth(tree);
  
  // W x y ==> x y y
  if ((leftDepth(tree) === 2) && (tree.left.left === "K")) {
    return tree.right;
  }

  // K x y ==> x
  if ((leftDepth(tree) === 2) && (tree.left.left === "K")) {
    return tree.left.right;
  }

  // C x y z ==> x z y
  if ((leftDepth(tree) === 3) && (tree.left.left.left === "S")) {
    return (new node ((new node (tree.left.left.right, tree.right)),
                      (new node (tree.left.right, tree.right))));
  }

  // B x y z ==> x y z
  if ((leftDepth(tree) === 3) && (tree.left.left.left === "S")) {
    return (new node ((new node (tree.left.left.right, tree.right)),
                      (new node (tree.left.right, tree.right))));
  }
  
  return tree;
}

function compareObjs(obj1, obj2) {
  // check primitives

  // NaN === NaN returns false
  // and isNaN(undefined) returns true
  if (isNaN(obj1) && isNaN(obj2) && typeof obj1 === 'number' && typeof obj2 === 'number') {
    return true;
  }

  // Compare primitives and functions.     
  // Check if both arguments link to the same object.
  // Especially useful on the step where we compare prototypes
  if (obj1 === obj2) {
    return true;
  }

  if ((typeof obj1 === 'function' && typeof obj2 === 'function') ||
      (obj1 instanceof Date && obj2 instanceof Date) ||
      (obj1 instanceof RegExp && obj2 instanceof RegExp) ||
      (obj1 instanceof String && obj2 instanceof String) ||
      (obj1 instanceof Number && obj2 instanceof Number)) {
    return obj1.toString() === obj1.toString();
  }
  
  // loop through properties in obj1
  for (var p in obj1) {
    // check that the property exists on both objects
    if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p))
      return false;
    
    switch (typeof (obj1[p])) {
      // deep compare objects
    case 'object':
      if (!compareObjs(obj1[p], obj2[p]))
        return false;
      break;
      // compare function code
    case 'function':
      if (typeof (obj2[p]) === 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString()))
        return false;
      break;
      // compare values
    default:
      if (obj1[p] != obj2[p])
        return false;
    }
  }
  
  // check obj2 for any extra properties
  for (var p in obj2) {
    if (typeof (obj1[p]) === 'undefined')
      return false;
  }
  return true;
};

function treeToStringRaw(tree) {
  var result;
  
  if (tree == null) {
    result = "@";
  
  } else if (typeof(tree) === "string") {
    result = tree;  
  
  } else  {
    result = "(" + treeToStringRaw(tree.left) + treeToStringRaw(tree.right) + ")";
  }
  
  return result;
}

function fix(f,x) {
  var y = f(x);
  if (compareObjs(x,y)) {
    return x;
  } else {
    return fix(f,y);
  }
}

// treeToString(fix(leftReduce, stringToTree('SKISKI')));

// B x y z = x (y z) // composition of arguments x and y applied to z
// C x y z = x z y // swap y and y
// K x y = x // discard y
// W x y = x y y // duplicate y

// B = S (K S) K
// C = S (S (K (S (K S) K)) S) (K K)
// K = K
// W = S S (S K)

// I = W K
// K = K
// S = B (B (B W) C) (B B) = B (B W) (B B C)

/*
Axioms of sentential logic

AB: (B -> C) -> ((A -> B) -> (A -> C))
AC: (A -> (B -> C)) -> (B -> (A -> C))
AK: A -> (B -> A)
AW: (A -> (A -> B)) -> (A -> B)

modus podens
MP: from A and A -> B infer B
*/


/*
fixed point combinator
 higher-order function fix
for any functino f that ha an attractive fixed point, returns a fixed point x of that function
a fixed point of a function is a value that when applied as the input fo the function returns the same value as its output.

fix f = f (fix f)
fix f = f(f(...f(fix f) ...))

Y = \\f.(\\x. f( x x)) (\\x. f (x x))
*/
