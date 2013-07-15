###global angular ###
angular.module('app').factory 'Product'
, ['$q', '$filter', 'Crud', 'Category', 'OrderLine'
, ($q, $filter, Crud, Category, OrderLine) ->

  crudService = Crud.factory 'products', true

  all = (params) ->
    deferred = $q.defer()
    crudService.all(params).then (products) ->
      angular.forEach products, (product) ->
        d = product.date
        product.date = moment([d.getFullYear(),d.getMonth(),d.getDate()]).toDate()
      deferred.resolve products
    deferred.promise

  findById = (id) ->
    deferred = $q.defer()
    crudService.get(id).then (product) ->
      d = product.date
      product.date = moment([d.getFullYear(),d.getMonth(),d.getDate()]).toDate()
      deferred.resolve product
    deferred.promise
        
  forCategory = (id) ->
    deferred = $q.defer()
    Category.all().then (categories) ->
      catList = $filter('filter')(categories, (category) ->
        (category.slug is id) or (category._id is id)
      )
      if catList.length > 0 
        crudService.all({categories: catList[0]._id}).then (results) ->
          deferred.resolve results
      else
        deferred.resolve()

    deferred.promise

  save = (product) ->
    d = product.date
    product.date =  moment.utc([d.getFullYear(),d.getMonth(),d.getDate()]).toDate()
    crudService.save(product)

  getCached (id) ->
    product = crudService.getCached(id)
    if product?
      d = product.date
      product.date =  moment([d.getFullYear(),d.getMonth(),d.getDate()]).toDate()
    product

  variantFactory = (parentId, callback) ->
    deferred = $q.defer()
    crudService.get(parentId).then (product) ->
      result =
        siteId: product.siteId
        stock: product.stock
        price: product.price
        date: moment().toDate()
        categories: product.categories
        parentId: parentId
        description: product.description
        detail: product.detail
        notes: ''
      deferred.resolve result
    deferred.promise


  variantFactory: variantFactory
  all: all
  get: findById
  findById: findById
  getCached: getCached
  save: save
  destroy: crudService.destroy
  forCategory: forCategory

]