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

['EOF', 'LAMBDA', 'LPAREN', 'RPAREN', 'LCID', 'DOT']

class Abstraction {
  constructor(param, body) {
    this.param = param;
    this.body = body;
  }

  toString(ctx) {
    return '(λ' + this.param + '. ' + this.body.toString([this.param].concat(ctx));
  }
}

_nextToken() {
  switch (c) {
  case 'λ':
  case '\\':
    this._token = new Token(Token.LAMBDA);
    break;

  case '.':
    this._token = new Token(Token.DOT);
    break;

  case '(':
    this._token = new Token(Token.LPAREN);
    break;

  case ')':
    this._token = new Token(Token.RPAREN);
    break;
  }
}

term() {
  if (this.lexer.skip(Token.LAMBDA) {
    var id = this.lexer.token(Token.LCID);
    this.lexer.match(Token.DOT);
    var term = this.term();
    return new AST.Abstraction(id, term);
  } else {
    return this.application();
  }
}

application() {
  lhs = this.atom();
  while (true) {
    var rhs = this.atom();
    while (true) {
      var rhs = this.atom();
      if (!rhs) {
        return lhs;
      } else {
        lhs = new AST.Application(lhs,rhs);
      }
    }
  }
}
