angular.module('gi.commerce').factory 'giCard'
, ['giCardType'
, (CardType) ->
  cardTypes = CardType

  camelCase = (input) ->
    input.replace(/\s/g, '-').toLowerCase().replace /-(.)/g, (match, group1) ->
      group1.toUpperCase()

  card =
    types: cardTypes
    parse: (number) ->
      if typeof number isnt 'string'
        ''
      else
        number.replace /[^\d]/g, ''

    type: (number, eager) ->
      res = null
      for name, type of CardType
        if (type.test(number, eager))
          res = type.name
          break
      res

    luhn: (number) ->
      if not number?
        return false
      len = number.length
      if len < 15
        return false

      mul = 0
      prodArr = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]
      ]
      sum = 0

      while (len--)
        sum += prodArr[mul][parseInt(number.charAt(len), 10)]
        mul ^= 1

      (sum % 10 is 0) and (sum > 0)

    isValid: (number, type) ->
      if not type?
        @luhn(number) and @type(number)
      else
        type = @types[type]
        if type?
          ((not type.luhn) or luhn(number)) and type.test(number)
        else
          false

  cvcRegex = /^\d{3,4}$/

  isCvcValid = (cvc, type) ->
    if (typeof cvc) isnt 'string'
      false
    else if not cvcRegex.test(cvc)
      false
    else if not type
      true
    else
      camelType = camelCase(type)
      if cardTypes[camelType]?
        card.types[camelType].cvcLength is cvc.length
      else
        cvc.length is 3


  card: card
  cvc:
    isValid: isCvcValid
  validate: (cardObj) ->
    card:
      type: type(cardObj.number)
      number: cardObj.number
      expirationMonth: cardObj.expirationMonth
      expirationYear: cardObj.expirationYear
      cvc: cardObj.cvc
    validCardNumber: luhn(cardObj.number)
    validCvc: isCvcValid(cardObj.cvc),
]
