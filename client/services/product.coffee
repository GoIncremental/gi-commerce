###global angular ###
angular.module('app').factory 'Product'
, ['$q', '$filter', 'Crud', 'Category', 'OrderLine'
, ($q, $filter, Crud, Category, OrderLine) ->

  crudService = Crud.factory 'products', true

  findById = (id) ->
    deferred = $q.defer()
    crudService.get(id).then (product) ->
      product.date = new Date(product.date)
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

  variantFactory = (parentId, callback) ->
    deferred = $q.defer()
    crudService.get(parentId).then (product) ->
      result =
        siteId: product.siteId
        stock: product.stock
        price: product.price
        date: new Date()
        categories: product.categories
        parentId: parentId
        description: product.description
        detail: product.detail
        notes: ''
      deferred.resolve result
    deferred.promise


  variantFactory: variantFactory
  all: crudService.all
  get: findById
  findById: findById
  getCached: crudService.getCached
  save: crudService.save
  destroy: crudService.destroy
  forCategory: forCategory

]