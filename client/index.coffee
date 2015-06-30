angular.module('gi.commerce', ['gi.util', 'gi.security'])
.value('version', '0.6.11-dev')
.config(['giI18nProvider', (I18nProvider) ->
  messages =
    US: [
      {key: 'gi-postal-area', value: 'state'}
    ]
    GB: [
      {key: 'gi-postal-area', value: 'county'}
    ]
    ROW: [
      {key: 'gi-postal-area', value: 'region'}
    ]
  angular.forEach messages, (messages, countryCode) ->
    I18nProvider.setMessagesForCountry messages, countryCode
])
.run ['$rootScope', 'giCart','giCartItem', 'giLocalStorage'
, ($rootScope, giCart, giCartItem, store) ->
  $rootScope.$on 'giCart:change', () ->
    giCart.save()

  if angular.isObject(store.get('cart'))
    giCart.restore(store.get('cart'))
  else
    giCart.init()
]
