// build a LISP style list
function cons(car, cdr) { 
  this.car = car;
  this.cdr = cdr;
}

function expression(type, value) {
  this.type  = type;
  this.value = value;
}

// count the cars from the current position to help determine how many function 
// arguments are available
function leftDepth(tree) {
  console.log('::leftDepth\n');
  console.log(tree);
  if (tree == null) return (0);
  if (typeof(tree) == "string") return (0); 
  if (Object.prototype.toString.call(tree) === '[object Object]' && tree.hasOwnProperty('value')) return (0);
  return (1 + leftDepth(tree.car));
  /*
  if (Object.prototype.toString.call(tree) === '[object Object]' && tree.hasOwnProperty('car')) {
    return (1 + leftDepth(tree.car));
  } else {
    return 0;
  }
  */
}

/*
function leftDepth(tree) {
  console.log('::leftDepth\n');
  if (tree == null) return (0);
  if (typeof(tree) == "string") return (0); 
  return (1 + leftDepth(tree.car));
} 
*/


function reduce(tree) {
  console.log('::reduce\n');
  console.log(tree);  
  var result;

/*
  if (tree == null) {
    result = tree;
  } else if (tree.hasOwnProperty('value')) {
    console.log('has value')
    console.log(tree);
    result = tree.value;
  } else {
    result = convert (new cons (reduce (tree.car), reduce (tree.cdr)));
  }
  
  return result;
*/  
  if (tree == null) return (tree);
  if (tree.hasOwnProperty('value')) return (tree);
  if (tree == 'string') return (tree);
  return (convert (new cons (reduce (tree.car), reduce (tree.cdr))));
}

function mkExpression(token) {
  var result;
  if (token === 'S' || token === 'K' || token === 'I') {
    result = new expression('primitive', token);
  } else {
    result = new expression('variable', token);
  }
  
  return result;
}

/*
function fold(split) {
  console.log('::fold\n');
  console.log(split);
  var result;
  
  if (split == null) {
    result = new cons (null, null);
    
  } else if (split.length == 0) {
    result = new cons (null, null);
  
  } else {
    var token = split.pop();
    
    if (token == "") {
      result = new cons (null, null);
  
    } else if (token == "(") {
      result = new cons (null, split);
  
    } else {
      var next = fold(split);
      
      if (token == ")") {
        if (next.car == null) {
          result = new cons (null, split);
  
        } else {        
          var nextnext = fold(next.cdr);
          if (nextnext.car == null) {
            result = new cons (next.car, nextnext.cdr);
  
          } else {
            result = new cons ((new cons (nextnext.car, next.car)), nextnext.cdr);
          }
        }
      } else if (next.car == null) { 
        result = new cons (mkExpression(token), next.cdr); // build right side with next
  
      } else {
        result = new cons ((new cons (next.car, mkExpression(token))), next.cdr);
      }
    }
  }
  console.log('::fold::result');
  console.log(result);
  return result;
}
*/
function fold(split) {
  console.log('::fold\n');
  console.log(split);
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
  if (next.car == null) return (new cons (mkExpression(token), next.cdr));
  return (new cons ((new cons (next.car, mkExpression(token))),
                    next.cdr))
}

// reduce try until it is no longer reducible
function fixedPoint (tree) {
  console.log('::fixedPoint\n');  
  var t2 = reduce(tree);
  console.log('::fixedPoint::reduced\n');
  console.log(t2);
  
  if (treeToString(tree) === treeToString(t2)) {
    return tree;
  } else {
    return (fixedPoint (t2));    
  }
}

function convert(tree) {
  console.log('::convert\n');
  console.log(tree)
  var d = leftDepth(tree);
  console.log(d);
  // I X ==> X
  if ((leftDepth(tree) == 1) && (tree.car.value == "I"))
    return (tree.cdr);

  // K X Y ==> X
  if ((leftDepth(tree) == 2) && (tree.car.car.value == "K")) {
    console.log('its K... returning');
    console.log(tree.car.cdr);
    return (tree.car.cdr);
  }

  // S X Y Z ==> ((X Z)(Y Z))
  if ((leftDepth(tree) == 3) && (tree.car.car.car.value == "S"))
    return (new cons ((new cons (tree.car.car.cdr, tree.cdr)),
                      (new cons (tree.car.cdr, tree.cdr))));

  return(tree); 
}

/*
function convert(tree) {
  console.log('::convert\n');
  var treeDepth = leftDepth(tree);
  
  if (treeDepth === 1 && tree.car.value === 'I') {
    return tree.cdr;
    
  } else if (treeDepth === 2 && tree.car.car.value === 'K') {
    return tree.car.cdr;
  
  } else if (treeDepth === 3 && tree.car.car.car.value === 'S') {
    return new cons((new cons (tree.car.car.cdr, tree.cdr)),
                    (new cons (tree.car.cdr, tree.cdr)));
  }
  
  return tree;
}
*/
/*
function treeToString(tree) {
  console.log('::treeToString\n');
  //console.log(tree);
  var result;
  
  if (tree == null) {
    result = "";
  } else if (tree.car == null) {
    result = tree.cdr;
  } else if ((tree.car).car == null) {
    result = (treeToString(tree.car) + " " + treeToString(tree.cdr));
  } else {
    result = ("(" + treeToString(tree.car) + ")" + treeToString(tree.cdr));
  }
  return result;
}
*/
function treeToString(tree) {
  console.log('::treeToString\n');
  if (tree == null) return ("")
  if (tree.car == null) return (tree.cdr)
  if ((tree.car).car == null) 
    return (treeToString(tree.car) + " " + treeToString(tree.cdr))
  return ("(" + treeToString(tree.car) + ")" + treeToString(tree.cdr))
}



function treeToStringRaw(tree) {
  console.log('::treeToStringRaw\n');
  console.log(tree);
  var result;
  
  if (tree == null) {
    result = "@";
  
  } else if (typeof(tree) == "string") {
    result = tree;  
  //} else if (typeof(tree) == "object") {
  } else if (Object.prototype.toString.call(tree) === '[object Object]' && tree.hasOwnProperty('value')) {
    console.log("IT IS CONS")
    result = tree.value;
  } else  {
    result = ("(" + treeToStringRaw(tree.car) + treeToStringRaw(tree.cdr) + ")")    
  }
  console.log('treeToStringRaw result');
  console.log(result);
  return result;
}

/*
function treeToStringRaw(tree) {
  console.log('::treeToStringRaw');
  console.log(tree);
  if (tree == null) return ("@")
  if (typeof(tree) == "string") return (tree);
  return ("("+treeToStringRaw(tree.car) + treeToStringRaw(tree.cdr) + ")")
} 
*/


function stringToTree(input) {
  console.log('::stringToTree\n');
  input = input.replace(/[ \f\n\r\t\v]/g,""); // remove white space
  input = input.replace(/(.)/g, " $1");       // prepend space before everything
  return ((fold(input.split(/ /))).car);      // make array by splitting on space
}

function eval(input) {
  return treeToStringRaw(fixedPoint(stringToTree(input)));
  //return stringToTree(input);
}

//console.log(eval('III(SK)K(Ki)'));
//console.log(eval('Ki'));
//console.log(eval('Kab'));
//console.log(eval('SKK(SKK(SKK))b'));
console.log(eval('K(Ki)K)'));
