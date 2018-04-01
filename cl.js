var previous_trees = [];

// build a LISP style list
function cons(car, cdr) { 
  this.car = car;
  this.cdr = cdr;
}

// an expression has a type 'primitive' or 'variable'
// and a value which is a single char token. 'S', 'K' and 'I' are primitives.
// All other single chars are variables.
function expression(type, value) {
  this.type  = type;
  this.value = value;
}

// recursively count the cars from the current position to help determine how 
// many function arguments are available
function leftDepth(tree) {  
  if (tree == null)
    return (0);
  
  if (typeof(tree) == "string")
    return (0); 
  
  if (Object.prototype.toString.call(tree) === '[object Object]' && tree.hasOwnProperty('value'))
    return (0);
  
  return (1 + leftDepth(tree.car));
}

// try to reduce the size of the tree/graph
function reduce(tree) {
  var result;

  if (tree == null)
    return tree;
  
  if (tree.hasOwnProperty('value'))
    return tree;
  
  if (tree == 'string')
    return tree;
  
  return (convert (new cons (reduce (tree.car), reduce (tree.cdr))));
}


// apply primitive functions if all its required variables exist. This is part 
// of the reduction step.
function convert(tree) {
  var d = leftDepth(tree);
  
  // I X ==> X
  if ((leftDepth(tree) == 1) && (tree.car.value == "I")) {
    result = tree.cdr;
    previous_trees.push("I => " + treeToStringRaw(result));
    return result;
    //return tree.cdr;
  }

  // K X Y ==> X
  if ((leftDepth(tree) == 2) && (tree.car.car.value == "K")) {
    result = tree.car.cdr;
    previous_trees.push("K => " + treeToStringRaw(result));
    return result;
    //return tree.car.cdr;
  }

  // S X Y Z ==> ((X Z)(Y Z))
  if ((leftDepth(tree) == 3) && (tree.car.car.car.value == "S")) {
    result = (new cons ((new cons (tree.car.car.cdr, tree.cdr)),
                      (new cons (tree.car.cdr, tree.cdr))));
    previous_trees.push("S => " + treeToStringRaw(result));
    return result;
    //return (new cons ((new cons (tree.car.car.cdr, tree.cdr)),
    //                  (new cons (tree.car.cdr, tree.cdr))));
  }
  return tree;
}

// make type and variable pair
function mkExpression(token) {
  var result;
  
  if (token === 'S' || token === 'K' || token === 'I') {
    result = new expression('primitive', token);
  
  } else {
    result = new expression('variable', token);
  }
  
  return result;
}

// recursively build cons list from an array
function fold(split) {
  if (split == null) 
    return (new cons (null, null));
  
  if (split.length == 0) 
    return (new cons (null, null));
  
  var token = split.pop();
  
  if (token == "")
    return (new cons (null, null));

  if (token == "(") 
    return (new cons (null, split));
  
  var next = fold(split);
  
  if (token == ")") {
    if (next.car == null) 
      return (new cons (null, split));
    
    var nextnext = fold(next.cdr);
    
    if (nextnext.car == null) 
      return (new cons (next.car, nextnext.cdr));
    
    return (new cons ((new cons (nextnext.car, next.car)),
                      nextnext.cdr))
  }
  
  if (next.car == null)
    return (new cons (mkExpression(token), next.cdr));
  
  return (new cons ((new cons (next.car, mkExpression(token))),
                    next.cdr))
}

// reduce try until it is no longer reducible
function fixedPoint (tree) {
  // console.log('::fixedPoint::reduced\n');
  // console.log(treeToStringRaw(tree));

  var t2 = reduce(tree);
  
  if (treeToString(tree) === treeToString(t2)) {
    return tree;
  
  } else {
    return (fixedPoint (t2));    
  }
}

// convert the tree structure to a string, this makes it easier to compare two 
// trees
function treeToString(tree) {
  if (tree == null) 
    return ("")
  
  if (tree.car == null) 
    return (tree.cdr)
  
  if ((tree.car).car == null) 
    return (treeToString(tree.car) + " " + treeToString(tree.cdr))
  
  return ("(" + treeToString(tree.car) + ")" + treeToString(tree.cdr))
}

// output the tree after reduction
function treeToStringRaw(tree) {
  var result;
  
  if (tree == null) {
    result = "@";
  
  } else if (typeof(tree) == "string") {
    result = tree;  
  
  } else if (Object.prototype.toString.call(tree) === '[object Object]' && tree.hasOwnProperty('value')) {
    result = tree.value;
  
  } else  {
    result = ("(" + treeToStringRaw(tree.car) + treeToStringRaw(tree.cdr) + ")")    
  }
  
  return result;
}

// convert the input string to a cons list (tree)
function stringToTree(input) {
  input = input.replace(/[ \f\n\r\t\v]/g,""); // remove white space
  input = input.replace(/(.)/g, " $1");       // prepend space before everything
  return ((fold(input.split(/ /))).car);      // make array by splitting on space
}

function eval(input) {
  var result = treeToStringRaw(fixedPoint(stringToTree(input)));
  // console.log(previous_trees);
  return result;
}

//console.log(eval('III(SK)K(Ki)'));
console.log(eval('Ki'));
console.log(eval('Kab'));
console.log(eval('SKK(SKK(SKK))b'));
//console.log(eval('K(Ki)K'));
// assert(eval('SKK(SKK(SKK))b') === 'b');
// assert(eval('Kab') === 'a');
// assert(eval('SKISKI') === '((SK)I)');
// assert(eval('S(KI)(SK)I') === '((SK)I)');
console.log(eval('S(K(I(S(KI))))'));
console.log(eval('SK'));
console.log(eval('K(Kab)(Kab)'));
// assert(eval('S(K(I(S(KI))))') === 'S(K(I(S(KI))))');
console.log(stringToTree('S(K(I(S(KI))))'));
console.log(stringToTree('S(KI)(SK)I'));

/*

   
  /\
 /\ S
/\ I
I I
*/

/*
Ix = x
Kxy = x
Sxyz = xz(yz) 

SKSK = KK(SK) = K


   SKSK

     S
    / \
   K  /\
     S  K

     K
    / \
   K   S
      / \
     K

     K


       S
      / \
     K  /\
       K  S
         / \
        K  /\
           K



   /\
  /\ K
 /\ S
S  K



  
 / \
/\  /\
K K S K

K

ISK ((IS)K)

    / \
  / \  K
 I   S

     I
    /
   S
  /
 K

I(SK) (I(SK))

   /\
  I /\
   S  K

SKISKI (((((SK)I)S)K)I)

S(KI)(SK)I  ((S((KI)(SK))I))

S(K(I(S(KI))))  (S(K(I(S(KI)))))




 /\
I  x  ->   x

  /\
 /\ y  -> x
K  x
                .
               / \
              /   \
   /\        /\   /\
  /\ z ->   x  z  y z
 /\ y
S x

http://people.cs.uchicago.edu/~odonnell/Teacher/Lectures/Formal_Organization_of_Knowledge/Examples/combinator_calculus/
  

  1
 / \
 2  3
/ \ \ 
4 5  6


*/
