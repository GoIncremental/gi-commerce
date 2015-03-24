angular.module('gi.commerce').factory 'giCardType'
, [ () ->

  class CardType
    constructor: (@name, @pattern, @eagerPattern, @cvcLength) ->
    luhn: true
    test: (number, eager) =>
      if eager?
        @eagerPattern.test(number)
      else
        @pattern.test(number)

  visa = new CardType 'Visa'
    , /^4[0-9]{12}(?:[0-9]{3})?$/
    , /^4/
    , 3

  masterCard = new CardType 'MasterCard'
    , /^5[1-5][0-9]{14}$/
    , /^5/
    , 3

  amex = new CardType 'American Express'
    , /^3[47][0-9]{13}$/
    , /^3[47]/
    , 4

  dinersClub = new CardType 'Diners Club'
    , /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/
    , /^3(?:0|[68])/
    , 3

  discover = new CardType 'Discover'
    , /^6(?:011|5[0-9]{2})[0-9]{12}$/
    , /^6/
    , 3

  jcb = new CardType 'JCB'
    , /^35\d{14}$/
    , /^35/
    , 3

  unionPay = new CardType 'UnionPay'
    , /^62[0-5]\d{13,16}$/
    , /^62/
    , 3

  unionPay.luhn = false

  #export the instantiated card types
  visa: visa
  masterCard: masterCard
  americanExpress: amex
  dinersClub: dinersClub
  discover: discover
  jcb: jcb
  unionPay: unionPay

]
