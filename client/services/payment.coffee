angular.module('gi.commerce').factory 'giPayment'
, [ '$q', '$http'
, ($q, $http) ->

  stripe:
    setKey: (key) ->
      Stripe.setPublishableKey(key)

    getToken: (card) ->
      deferred = $q.defer()
      stripeCard =
        number: card.number
        cvc: card.security
        exp_month: card.expiry.split('/')[0]
        exp_year: card.expiry.split('/')[1]
      Stripe.card.createToken stripeCard, (status, response) ->
        if response.error?
          deferred.reject response.error.message
        else
          deferred.resolve(response)
      deferred.promise

    charge: (chargeRequest) ->
      deferred = $q.defer()

      $http.post('/api/checkout', chargeRequest)
      .success () ->
        deferred.resolve 'payment completed'
      .error () ->
        deferred.reject 'payment not completed'

      deferred.promise
]
