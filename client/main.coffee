require
  shim:
    'services/order':
      deps: [
        'services/orderLine'
      ]
  [
    'services/product'
    'services/order'
    'services/orderLine'
  ], () ->
    console.log 'gint-commerce loaded'