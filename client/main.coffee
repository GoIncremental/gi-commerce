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
    return  #gint-commerce loaded