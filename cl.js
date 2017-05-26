/*
console.log('hello');

var pfs = 'SKI';
// [1, 2, 3].indexOf(1) >= 0
function parse(input) {
  var stack = [];
  for (var i = 0; i < input.length; i++) {
    var c = input[i];
    if (pfs.indexOf(c) > -1) {
      console.log('is primitive function')
    }
    console.log(input[i]);
  }
}

var root = {
  value: 'root'
, left:  null
, right: null
};
*/
/*
parse('K');
parse('SKKi');
parse('S (K (K i))')
parse('S (K (K)) i')
parse('S (K K) i')
*/
/*
function BinarySearchTree() {
  this._root = null;
}

BinarySearchTree.prototype = {
  //restore constructor
  constructor: BinarySearchTree,

  add: function (value){
  },

  contains: function(value){
  },

  remove: function(value){
  },

  size: function(){
  },

  toArray: function(){
  },

  toString: function(){
  }
};
*/
// left associative
// (((S K) K) i)  [i, K, K, S]
// S (K K) i


/*
general structure 

all have a type

general Primitive function {type: 'primitive', value: 'K|S', children: []}
specific primitive function 
{type:'I', x: {}}
{type:'K', x: {}, y:{}}
{type:'S', x: {}, y:{}, z:{}}
{type:'variable', value:''}

function mkI(x)
function mkK(x,y) {
  return {type:'primitive', value:'K', x: x, y: y};
}
function addX(p, x) {
  var pcopy = Object.assign({}, p);
  pcopy['x'] = x;
  return pcopy;
}
function mkS(x,y,z)
function mkVar()
*/
/*
data Expr
  = Var Name
  | App Expr Expr
  | Lam Name Expr
  
expressions
  {type: 'variable', value: 'a'}
*/

/*
function reduce(tc) {
  var t = Object.assign({}, tc);
  if (t.value === 'K') {
    var new = {value: 'Kx', closure : { t.child } }
    return reduce()
  } else if (t.value === 'Kx') {
    return t.closure.x;
  } else {
    return t.value;
  }
}
*/
/*


Kia
-> Kxy
-> Kx
-> Ky
-> ki -- intermediate form, remember x
-> a   return x

Sxyz ->
  sx
  sxy
*/


/*
function reduce(tc) {
  var t = Object.assign({}, tc);
  if (t.type === 'primitive') {
    if (t.value === 'S') {
      if (t.children.length === 3) {
        var x = t.children[0];
        var y = t.children[1];
        var z = t.children[2];
        y.children = [z];
        x.children = [z,y];
        return reduce(x);
      }
    } else if (t.value === 'K') {
      if (t.children.length === 2) {
        //xy exist, throw away y, return reduction of x
        return reduce(t.children[0]);
      } 
      if (t.children.length === 1) {
        //only x exists, reduce x, and return with K
        x = reduce(t.children[0]);
        t.children = [x];
        return t;
      }
      
    }
  } else if (t.type === 'variable') {
    return t.value;
  }
}

var test  = {type: 'primitive', value:'K', children: [{type: 'variable' , value:'i'},{type:'variable',value:'a'}]};
var test2 = {type: 'primitive', value:'K', children: [{type: 'primitive', value:'K', children: [{type:'variable',value:'i'},{type:'variable',value:'a'}]}]}; // Ki
var test3 = {type: 'primitive', value:'K', children: [{type: 'primitive', value:'K', children: [{type:'variable',value:'i'},{type:'variable',value:'a'}]},{type: 'primitive', value:'K', children: [{type:'variable',value:'i'},{type:'variable',value:'a'}]}]}; // Ki
var test4 = {
  type: 'primitive'
, value:'S'
, children: [
    {type: 'primitive' ,value:'K', children: []}
   ,{type: 'primitive' ,value:'K', children: []}
   ,{type: 'variable'  ,value:'i', children: []}
 ]};
 
 var test5 = {
   type: 'primitive'
 , value:'S'
 , children: [
     {type: 'primitive' ,value:'K', children: []}
    ,{type: 'primitive' ,value:'K', children: []}
    ,{
      type: 'primitive'
    , value:'S'
    , children: [
        {type: 'primitive' ,value:'K', children: []}
       ,{type: 'primitive' ,value:'K', children: []}
       ,{type: 'variable'  ,value:'i', children: []}
     ]}
  ]};
//'Kia'
//'(Ki)a'
//'i'
*/
function eval(input) {
  return treeToStringRaw(fixedPoint(stringToTree(input)));
}

function cons(car, cdr) { this.car = car; this.cdr = cdr; }


function leftDepth(tree) {
  if (Object.prototype.toString.call(tree) === '[object Object]' && tree.hasOwnProperty('car')) {
    return(1 + leftDepth(tree.car));
  } else {
    return (0);
  }
}

/*
function leftDepth(tree) {
  if (tree == null) return (0);
  if (typeof(tree) == "string") return (0); 
  return (1 + leftDepth(tree.car));
} 
*/

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


/*
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
*/
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

//console.log(convert(stringToTree('Ii')));
//console.log(convert(stringToTree('Kii')));
//console.log(eval('K(Ii)ii'));
console.log(eval('III(SK)K(Ki)'));
//console.log(eval('Ki'));
/*
   /\
  /\ z
 /\ y
S x

 /\
/\ y
K x      
         /\
        /  i
       /  
      /  /\
     /\ /\ y
    /  K  x
   / 
  /  /\
 /\ /\ y
S  K  x

      /\
  /\ /\ y
 /  K  i
/
K i

*/

// (K (K i i) (K i)) = i
// [[i,i,K],[K,i],K]
// (K (K (K i i) (K i)) i) = i
// [i,[[i,i,K],[K,i],K],K]
/*
S = \a.\b.\c.((a(c))(b(c)) 
K = \a.\b.(a) 

B,C,K,W syste

Fokker's X combinator and Barker's X combinator

S x y z = x z (y z) 


S = \x -> \y -> \z -> x z (y z)
        \y -> \z -> 1 z (y z)
              \z -> 1 z (2 z)
Y x y   = x

SKKi  = s1 K z (y z)
        s2 K z (K z)
        s3 K i (K i)
        k1 K i
      
SKKi  front S, front K, front K, front i
last
*/
