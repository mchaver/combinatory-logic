var cc = (function() {

  // private functions

  // util functions

  // node constructor
  // the program is represented as a series of node
  // binary tree
  function node(left, right) {
    this.left = left;
    this.right = right;
  }

  function isNode(x) {
    return x !== null && typeof x === 'object' && x.hasOwnProperty('left') && x.hasOwnProperty('right');
  }

  function leftDepth(tree) {
    if (tree === null || typeof(tree) === "string" || !isNode(tree)) {
      return 0;
    } else {
      return (1 + leftDepth(tree.left));
    }  
  }

  function rightDepth(tree) {
    if (tree === null || typeof(tree) === "string" || !isNode(tree)) {
      return 0;
    } else {
      return 1 + rightDepth(tree.right);
    }
  }

  function leftReduce(f, tree) {
    if (tree === null || tree === 'string' || !isNode(tree)) {
      return tree;
    } else {  
      return f(new node(leftReduce(f,tree.left), tree.right));
    }
  }


  // apply primitive functions if all its required variables exist. This is part 
  // of the reduction step.
  function evalSKI(tree) {
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

  function evalIota(tree) {

    /*
ι = λf.fSK 
I = (ιι) = (λf.fSK (λf.fSK))

K = (ι(ι(ιι)))

S = (ι(ι(ι(ιι))))
*/
    var d = leftDepth(tree);

    // I x ==> x
    // ι ι x ==> x
    if ((leftDepth(tree) === 2) && (tree.left.left === "ι") && (tree.left.right === "ι")) {
      return tree.right;
    }

    // K x y ==> x
    // ι(ι(ιι)) x y ==> x
    if ((leftDepth(tree) === 3) &&
        (rightDepth(tree.left.left) === 3) &&
        (tree.left.left.left === "ι") &&
        (tree.left.left.right.left === "ι") &&
        (tree.left.left.right.right.left === "ι") &&
        (tree.left.left.right.right.right === "ι")) {
      return tree.left.right;
    }

    // S x y z ==> ((x z)(y z))
    // ι(ι(ι(ιι))) x y z ==> ((x z)(y z))
    
    if ((leftDepth(tree) === 4) &&
        (rightDepth(tree.left.left.left) === 4) &&
        (tree.left.left.left.left === "ι") &&
        (tree.left.left.left.right.left === "ι") &&
        (tree.left.left.left.right.right.left === "ι") &&
        (tree.left.left.left.right.right.right.left === "ι") &&
        (tree.left.left.left.right.right.right.right === "ι")) {
      return (new node ((new node (tree.left.left.right, tree.right)),
                        (new node (tree.left.right, tree.right))));
    }
    
    return tree;
  }

  function evalBCKW(tree) {
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

  // fold function
  // recursive
  function tokensToTree(list) {
    if (list === null)
      return (new node(null, null));

    if (list.length === 0)
      return (new node(null, null));

    var token = list.pop();

    if (token === "")
      return (new node(null, null));

    if (token === "(")
      return (new node(null, list));

    var next = tokensToTree(list);

    if (token === ")") {
      if (next.left === null) 
        return (new node (null, list));
      
      var nextnext = tokensToTree(next.right);
      
      if (nextnext.left === null) 
        return (new node (next.left, nextnext.right));
      
      return (new node ((new node (nextnext.left, next.left)),
                        nextnext.right));
    }

    if (next.left === null)
      return (new node(token, next.right));

    return (new node ((new node (next.left, token)), next.right));
  }

  // convert a string to an AST
  function stringToTree(input) {
    input = input.replace(/[ \f\n\r\t\v]/g,""); // remove white space
    input = input.replace(/(.)/g, " $1");       // prepend space before everything
    return tokensToTree(input.split(/ /)).left; // make array by splitting on space
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

  function fixWithSteps(f,x,ys) {
    var y = f(x);
    if (compareObjs(x,y)) {
      return ys;
    } else {
      ys.push(y);
      return fixWithSteps(f,y,ys);
    }
  }

  function curry(fn) {
    var slice = Array.prototype.slice,
        stored_args = slice.call(arguments, 1);
    return function () {
      var new_args = slice.call(arguments),
          args = stored_args.concat(new_args);
      return fn.apply(null, args);
    };
  }

  function ski(input) {
    return treeToStringRaw(fix(curry(leftReduce, evalSKI), stringToTree(input)));
  }

  function skiWithSteps(input) {
    var steps = fixWithSteps(curry(leftReduce, evalSKI), stringToTree(input), [stringToTree(input)]);
    for (var i = 0; i < steps.length; i++) {
      steps[i] = treeToStringRaw(steps[i]);
    }
    return steps;
  }
  
  function iota(input) {
    return treeToStringRaw(fix(curry(leftReduce, evalIota), stringToTree(input)));
  }

  function bckw(input) {
    return treeToStringRaw(fix(curry(leftReduce, evalBCKW), stringToTree(input))); 
  }

  assert (ski('I') === 'I');
  assert (ski('Kab') === 'a');
  assert (ski('SKISKI') === '((SK)I)');

  assert (iota('ιιx') === 'x');
  assert (iota('ι(ι(ιι))xy') === 'x');
  assert (iota('ι(ι(ι(ιι)))xyz') === '((xz)(yz))');

  function widthAux(tree, parent) {
    var parent = parent | 0;
    if (tree === null || typeof(tree) === "string" || !isNode(tree)) {
      return [];
    } else {
      var left = parent - 1;
      var right = parent + 1;
      return [left,right].concat(widthAux(tree.left,left),widthAux(tree.right,right));
    }  
  }

  function width(tree) {
    var result = widthAux(tree);
    return {left: Math.min.apply(null, result), right: Math.max.apply(null, result)};
  }

  assert (compareObjs(width(stringToTree('SKI')), {left: -2, right: 1}));
  assert (compareObjs(width(stringToTree('ι(ι(ι(ιι)))xyz')), {left: -4, right: 1}));
/*
K ≡ λx y.x
S ≡ λx y z.x z(y z)
λx y.y x = S(K(SI))(S(KK)I)

undecidable
(S I I (S I I))

if left print one less, iff right print one more
ι(ι(ι(ιι)))xyz
-4 and 1
67
568 left is node, right is string
47
    /\
   /\ z
  /\ x
 /\ y
ι /\
 ι /\
  ι /\
   ι  ι

       /\
      /  \
     /\   \
    /  \   z
   /\   x
  /  \
 /\   y
ι  \
   /\
  /  \
 ι   /\
    /  \
   ι   /\
      ι  ι

Sabc
    /\
   /  \
  /    \
 /\    /\
a  c  b  c

SKI
  /\     
 /\ I
S  K

Ix
 /\
I  x
*/
  
  return {
    ski: ski,

    skiWithSteps: skiWithSteps,

    iota: iota,

    bckw: bckw,

    stringToTree: stringToTree,

    // utils
    leftDepth: leftDepth,
    rightDepth: rightDepth
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = cc;
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


/*
iota combinator

I = (ιι)

K = (ι(ι(ιι)))

S = (ι(ι(ι(ιι))))


SKI=
(ι(ι(ι(ιι)))(ι(ι(ιι)))(ιι)ι(ι(ι(ιι)))(ι(ι(ιι)))(ιι))

ιι = ιSK = SSKK = SK(KK) = I

ι(ι(ιι)) = ι(ιI) yields ι(ISK) = ι(SK) = SKSK = K

ι(ι(ι(ιι))) = ιK = KSK = S
*/
