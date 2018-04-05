// (λx. λy. x) (λy. y) (λx. x)

// term
// application
// atom

/*
term ::= application | LAMBDA LCID DOT term

application ::= application atom | atom

atom ::= LPAREN term RPAREN | LCID

LPAREN (
RPAREN )
LAMBDA  λ
DOT '.'
LCID /[a-z][a-zA-Z]/

remove left recursion

application ::= application atom
              | atom

application ::= atom application'

application' ::= atom application' | ε

right recurisve rule can only expane appliationc' whil there is another atom
*/


class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

var tokens = ['EOF', 'LAMBDA', 'LPAREN', 'RPAREN', 'LCID', 'DOT'];

// var Token = [];

for (var i = 0; i < tokens.length; i++) {
  Token[tokens[i]] = tokens[i];
}

function nextChar(input, index) {
  if (index >= input.length) {
    return '\0';
  }

  return input[index];
}

function nextToken(input, index) {
  var c = nextChar(input, index);
  index++;
  while (/\s/.test(c)) {
    c = nextChar(input, index);
    index++;
  }
  
  var token;
  switch (c) {
  case 'λ':
    token = new Token(Token.LAMBDA);
    break;
  case '\\':
    token = new Token(Token.LAMBDA);
    break;

  case '.':
    token = new Token(Token.DOT);
    break;

  case '(':
    token = new Token(Token.LPAREN);
    break;

  case ')':
    token = new Token(Token.RPAREN);
    break;

  case '\0':
    token = new Token(Token.EOF);
    break;

  default:
    if (/[a-z]/.test(c)) {
      // var str = '';
      var str = c;
      c = nextChar(input, index);
      index++;
      while (/[a-zA-Z]/.test(c)) {
        str += c;
        c = nextChar(input, index);
        index++;
      }

      // put back the last char which is not part of the identifier
      index--;

      token = new Token(Token.LCID, str);
    } else {
      throw new Error("Unexpected token at offset " + String(index) + ": " + c);
    }
  }
  
  return {token: token, index: index};
}

// assert that the next token has a given type, return it, and
// skip to the next token
function tokenValue(token, type, input, index) {
  if (!type) {
    return token.value;
  }

  return {value: token.value, next: match(token, type, input, index)};
  // return token.value;
}

// does the next token have a give type?
function next(token, type) {
  return token.type == type;
}

// assert that the next token has a given type and skip it
// {token:, index: }
function match(token, type, input, index) {
  if (next(token, type)) {
    return nextToken(input, index);
  }
  console.error(String(index) + " : Invalid token: Expected '" + type + "' found '" + token.type + "'");
  throw new Error('Parse Error');
}

// same as next, but skips the token if it matches the expected type.
// {result:, token:, index: }
function skip(token, type, input, index) {
  if (next(token, type)) {
    var x = nextToken(input, index);
    return {result: true, token: x.token, index: x.index};
  }
  return {result: false, token: token, index: index};
}

class Abstraction {
  constructor(param, body) {
    this.param = param;
    this.body = body;
  }

  toString(ctx=[]) {
    return "(λ" + this.param + ". " + this.body.toString([this.param].concat(ctx));
  }
}

class Application {
  constructor(lhs, rhs) {
    this.lhs = lhs;
    this.rhs = rhs;
  }

  toString(ctx) {
    return this.lhs.toString(ctx) + " " + this.rhs.toString(ctx);
  }
}

class Identifier {
  constructor(value) {
    this.value = value;
  }

  toString(ctx) {
    return ctx[this.value];
  }
}

function parse() {

}

// term ::= LAMBDA LCID DOT term
//        | application
function term(token, input, index, ctx) {
  var result = skip(token, Token.LAMBDA, input, index);

  if (result.result) {
    var id = tokenValue(result.token, Token.LCID, input, result.index);
    var nt = match(id.next.token, Token.DOT, input, id.next.index);
    var newTerm = term(nt.token, input, nt.index, [id.value].concat(ctx));
    return {state: {token: newTerm.state.token, index: newTerm.state.index}, ast: new Abstraction(id.value, newTerm.ast)};
    
  } else {
    return application(result.token, input, result.index, ctx);
 
  }
}

// application ::= atom application'
function application(token, input, index, ctx) {
  var lhs = atom(token, input, index, ctx);
  console.log(lhs);
  token = lhs.state.token;
  index = lhs.state.index;
  lhs = lhs.ast;
  // application' ::= atom application'
  //                | ε
  while (true) {
    var rhs = atom(token,input,index,ctx);
    
    if (!rhs) {
      return {state: {token: token, index: index}, ast: lhs};
    } else {
      lhs = new Application(lhs, rhs.ast);
    }
    token = rhs.state.token;
    index = rhs.state.index;
  }
}

// atom ::= LPAREN term RPAREN
//        | LCID
function atom(token, input, index, ctx) {
  var result = skip(token, Token.LPAREN, input, index);

  if (result.result) {
    var newTerm = term(result.token, input, result.index, ctx);
    var rparen = match(newTerm.state.token, Token.RPAREN, input, newTerm.state.index);
    return {state: {token: rparen.token, index: rparen.index}, ast: newTerm.ast};
    
  } else if (next(token, Token.LCID)) {
    var id = tokenValue(token, Token.LCID, input, index);
    var idIndex = -1;
    for (var i = 0; i < ctx.length; i++) {
      if (ctx[i] == id.value) {
        idIndex = i;
        break;
      }
    }
    
    return {state: {token: id.next.token, index: id.next.index}, ast: new Identifier(idIndex)};

  } else {
    return undefined;
  }
}


var source = "(λx. x)";
// console.log(term(source, , 0, []));
var a = nextToken(source, 0);

/*
var b = nextToken(source, a.index);
var c = nextToken(source, b.index);
var d = nextToken(source, c.index);
var e = nextToken(source, d.index);
var f = nextToken(source, e.index);
var g = nextToken(source, f.index);
console.log(a);
console.log(b);
console.log(c);
console.log(d);
console.log(e);
console.log(f);
console.log(g);
*/
console.log(source);
console.log(source[3]);
console.log(term(a.token,source,a.index,[]));
/*
// assuming you have some source
const source = '(λx. λy. x) (λx. x) (λy. y)';

// wire all the pieces together
const lexer = new Lexer(source);
const parser = new Parser(lexer);
const ast = parser.parse();
const result = Interpreter.eval(ast);

// assuming you have some source
source = '(λx. λy. x) (λx. x) (λy. y)';

// wire all the pieces together
const lexer = new Lexer(source);
const parser = new Parser(lexer);
const ast = parser.parse();
const result = Interpreter.eval(ast);
*/
