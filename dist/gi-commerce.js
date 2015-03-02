angular.module('gi.commerce', ['gi.commerce.directives']).config([function() {}]).provider('$giCart', function() {
  return {
    $get: function() {}
  };
}).run([
  '$rootScope', 'giCart', 'giCartItem', 'store', function($rootScope, giCart, giCartItem, store) {
    $rootScope.$on('giCart:change', function() {
      return giCart.$save();
    });
    if (angular.isObject(store.get('cart'))) {
      return giCart.$restore(store.get('cart'));
    } else {
      return giCart.init();
    }
  }
]).service('giCart', [
  '$rootScope', 'giCartItem', 'store', function($rootScope, giCartItem, store) {
    this.init = function() {
      this.$cart = {
        shipping: null,
        tax: null,
        items: []
      };
    };
    this.addItem = function(id, name, price, quantity, data) {
      var inCart, newItem;
      inCart = this.getItemById(id);
      if (angular.isObject(inCart)) {
        inCart.setQuantity(quantity, false);
      } else {
        newItem = new giCartItem(id, name, price, quantity, data);
        this.$cart.items.push(newItem);
        $rootScope.$broadcast('giCart:itemAdded', newItem);
      }
      return $rootScope.$broadcast('giCart:change', {});
    };
    this.getItemById = function(itemId) {
      var build, items;
      items = this.getCart().items;
      build = null;
      angular.forEach(items, function(item) {
        if (item.getId() === itemId) {
          return build = item;
        }
      });
      return build;
    };
    this.setShipping = function(shipping) {
      return this.$cart.shipping = shipping;
    };
    this.getShipping = function() {
      if (this.getCart().items.length === 0) {
        return 0;
      }
      return this.getCart().shipping;
    };
    this.setTax = function(tax) {
      return this.$cart.tax = tax;
    };
    this.getTax = function() {
      return (this.getSubTotal() / 100) * this.getCart().tax;
    };
    this.setCart = function(cart) {
      return this.$cart = cart;
    };
    this.getCart = function() {
      return this.$cart;
    };
    this.getItems = function() {
      return this.getCart().items;
    };
    this.totalItems = function() {
      return this.getCart().items.length;
    };
    this.getSubTotal = function() {
      var total;
      total = 0;
      angular.forEach(this.getCart().items, function(item) {
        return total += item.getTotal();
      });
      return total;
    };
    this.totalCost = function() {
      return this.getSubTotal() + this.getShipping() + this.getTax();
    };
    this.removeItem = function(index) {
      this.$cart.items.splice(index, 1);
      $rootScope.$broadcast('giCart:itemRemoved', {});
      return $rootScope.$broadcast('giCart:change', {});
    };
    this.empty = function() {
      this.$cart.items = [];
      return localStorage.removeItem('cart');
    };
    this.$restore = function(storedCart) {
      this.init();
      this.$cart.shipping = storedCart.shipping;
      this.$cart.tax = storedCart.tax;
      angular.forEach(storedCart.items, (function(_this) {
        return function(item) {
          return _this.$cart.items.push(new giCartItem(item._id, item._name, item._price, item._quantity, item._data));
        };
      })(this));
      return this.$save();
    };
    this.$save = function() {
      return store.set('cart', JSON.stringify(this.getCart()));
    };
    return this;
  }
]).factory('giCartItem', [
  '$rootScope', 'store', function($rootScope, store) {
    var item;
    item = function(id, name, price, quantity, data) {
      this.setId(id);
      this.setName(name);
      this.setPrice(price);
      this.setQuantity(quantity);
      return this.setData(data);
    };
    item.prototype.setId = function(id) {
      if (id) {
        return this._id = id;
      } else {
        return console.error('An ID must be provided');
      }
    };
    item.prototype.getId = function() {
      return this._id;
    };
    item.prototype.setName = function(name) {
      if (name) {
        return this._name = name;
      } else {
        return console.error('A name must be provided');
      }
    };
    item.prototype.getName = function() {
      return this._name;
    };
    item.prototype.setPrice = function(price) {
      price = parseFloat(price);
      if (price) {
        if (price <= 0) {
          console.error('A price must be over 0');
        }
        return this._price = price;
      } else {
        return console.error('A price must be provided');
      }
    };
    item.prototype.getPrice = function() {
      return this._price;
    };
    item.prototype.setQuantity = function(quantity, relative) {
      quantity = parseInt(quantity);
      if (quantity % 1 === 0) {
        if (relative === true) {
          this._quantity += quantity;
        } else {
          this._quantity = quantity;
        }
        if (this._quantity < 1) {
          this._quantity = 1;
        }
      } else {
        this._quantity = 1;
        console.info('Quantity must be an integer and was defaulted to 1');
      }
      return $rootScope.$broadcast('giCart:change', {});
    };
    item.prototype.getQuantity = function() {
      return this._quantity;
    };
    item.prototype.setData = function(data) {
      if (data) {
        this._data = data;
      }
    };
    item.prototype.getData = function() {
      if (this._data != null) {
        return this._data;
      } else {
        console.info('This item has no data');
      }
    };
    item.prototype.getTotal = function() {
      return this.getQuantity() * this.getPrice();
    };
    return item;
  }
]).service('store', [
  '$window', function($window) {
    return {
      get: function(key) {
        var cart;
        if ($window.localStorage[key]) {
          cart = angular.fromJson($window.localStorage[key]);
          return JSON.parse(cart);
        }
        return false;
      },
      set: function(key, val) {
        if (val == null) {
          $window.localStorage.removeItem(key);
        } else {
          $window.localStorage[key] = angular.toJson(val);
        }
        return $window.localStorage[key];
      }
    };
  }
]).controller('CartController', [
  '$scope', 'giCart', function($scope, giCart) {
    return $scope.giCart = giCart;
  }
]).value('version', '0.0.1-rc.2');

angular.module('gi.commerce.directives', []).controller('gicartController', [
  '$scope', 'giCart', function($scope, giCart) {
    return $scope.giCart = giCart;
  }
]).directive('gicartAddtocart', [
  'giCart', function(giCart) {
    return {
      restrict: 'E',
      controller: 'gicartController',
      scope: {
        id: '@',
        name: '@',
        quantity: '@',
        price: '@',
        data: '='
      },
      transclude: true,
      templateUrl: 'gi.commerce.addtocart.html',
      link: function(scope, element, attrs) {
        scope.attrs = attrs;
        return scope.inCart = function() {
          return giCart.getItemById(attrs.id);
        };
      }
    };
  }
]).directive('gicartCart', [
  'giCart', function(giCart) {
    return {
      restrict: 'E',
      controller: 'CartController',
      scope: {},
      templateUrl: 'gi.commerce.cart.html'
    };
  }
]).directive('gicartSummary', [
  'giCart', function(giCart) {
    return {
      restrict: 'E',
      controller: 'CartController',
      scope: {},
      transclude: true,
      templateUrl: 'gi.commerce.summary.html'
    };
  }
]);

angular.module('gi.commerce').factory('giOrder', [
  '$q', 'giCrud', 'giCustomer', 'giOrderLine', function($q, Crud, Customer, OrderLine) {
    var crudService, factory, findById, forOwner;
    crudService = Crud.factory('orders', true);
    findById = function(id) {
      var deferred;
      deferred = $q.defer();
      crudService.get(id).then(function(order) {
        if ((order != null) && (order.owner != null)) {
          return Customer.getSimple(order.owner.key, function(customer) {
            order.customer = customer;
            return OrderLine.forOrder(id).then(function(orderLines) {
              order.orderLines = orderLines;
              return deferred.resolve(order);
            });
          });
        } else {
          return deferred.resolve();
        }
      });
      return deferred.promise;
    };
    forOwner = function(ownerId) {
      var deferred;
      deferred = $q.defer();
      crudService.query({
        'owner.key': ownerId
      }).then(function(orders) {
        return deferred.resolve(orders);
      });
      return deferred.promise;
    };
    factory = function() {
      return {
        customerId: '',
        invoiceNumber: '',
        date: moment().toDate(),
        notes: '',
        attributes: [
          {
            name: "confirmationSent",
            value: "false"
          }, {
            name: "excessDue",
            value: "0"
          }
        ]
      };
    };
    return {
      findById: findById,
      get: findById,
      destroy: crudService.destroy,
      save: crudService.save,
      factory: factory,
      forOwner: forOwner
    };
  }
]);

angular.module("gi.commerce").run(["$templateCache", function($templateCache) {$templateCache.put("gi.commerce.addtocart.html","\n<div ng-hide=\"attrs.id\">\n    <a class=\"btn btn-lg btn-primary\" ng-disabled=\"true\" ng-transclude></a>\n\n</div>\n<div ng-show=\"attrs.id\">\n    <div ng-hide=\"inCart()\">\n        <a class=\"btn btn-lg btn-primary\"\n           ng-click=\"giCart.addItem(item)\"\n           ng-transclude></a>\n    </div>\n    <div class=\"alert alert-info\"  ng-show=\"inCart()\">\n        This item is in your cart\n    </div>\n\n</div>\n");
$templateCache.put("gi.commerce.cart.html","\n<div class=\"col-xs-12\" ng-show=\"giCart.totalItems() === 0\">\n    Your cart is empty\n</div>\n\n<div class=\"table-responsive col-xs-12\" ng-show=\"giCart.totalItems() > 0\">\n\n    <table class=\"table table-striped giCart cart\">\n\n        <thead>\n        <tr>\n            <th></th>\n            <th></th>\n            <th>Quantity</th>\n            <th>Amount</th>\n            <th>Total</th>\n        </tr>\n        </thead>\n        <tfoot>\n        <tr ng-show=\"giCart.getTax()\">\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Tax ({{ giCart.getCart().tax }}%):</th>\n            <th>{{ giCart.getTax() | currency }}</th>\n        </tr>\n        <tr ng-show=\"giCart.getShipping()\">\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Shipping:</th>\n            <th>{{ giCart.getShipping() | currency }}</th>\n        </tr>\n        <tr>\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Total:</th>\n            <th>{{ giCart.totalCost() | currency }}</th>\n        </tr>\n        </tfoot>\n        <tbody>\n        <tr ng-repeat=\"item in giCart.getCart().items track by $index\">\n            <td><span ng-click=\"giCart.removeItem($index)\" class=\"glyphicon glyphicon-remove\"></span></td>\n            <td>{{ item.getName() }}</td>\n            <td><span class=\"glyphicon glyphicon-minus\" ng-class=\"{\'disabled\':item.getQuantity()==1}\"\n                      ng-click=\"item.setQuantity(-1, true)\"></span>&nbsp;&nbsp;\n                {{ item.getQuantity() | number }}&nbsp;&nbsp;\n                <span class=\"glyphicon glyphicon-plus\" ng-click=\"item.setQuantity(1, true)\"></span></td>\n            <td>{{ item.getPrice() | currency}}</td>\n            <td>{{ item.getTotal() | currency }}</td>\n        </tr>\n        </tbody>\n    </table>\n</div>\n<style>\n    .giCart.cart span[ng-click] {\n        cursor: pointer;\n    }\n    .giCart.cart .glyphicon.disabled {\n        color:#aaa;\n    }\n</style>\n");
$templateCache.put("gi.commerce.summary.html","<div class=\"row\">\n  <div class=\"col-xs-5\">\n    <svg version=\"1.1\"  class=\"icon basket\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"30px\" height=\"30px\" xml:space=\"preserve\">\n      <path d=\"M27.715,10.48l-2.938,6.312c-0.082,0.264-0.477,0.968-1.318,0.968H11.831\n                c-0.89,0-1.479-0.638-1.602-0.904l-2.048-6.524C7.629,8.514,8.715,7.933,9.462,7.933c0.748,0,14.915,0,16.805,0\n                C27.947,7.933,28.17,9.389,27.715,10.48L27.715,10.48z M9.736,9.619c0.01,0.061,0.026,0.137,0.056,0.226l1.742,6.208\n                c0.026,0.017,0.058,0.028,0.089,0.028h11.629l2.92-6.27c0.025-0.073,0.045-0.137,0.053-0.192H9.736L9.736,9.619z M13.544,25.534\n                c-0.819,0-1.482-0.662-1.482-1.482s0.663-1.484,1.482-1.484c0.824,0,1.486,0.664,1.486,1.484S14.369,25.534,13.544,25.534\n                L13.544,25.534z M23.375,25.534c-0.82,0-1.482-0.662-1.482-1.482s0.662-1.484,1.482-1.484c0.822,0,1.486,0.664,1.486,1.484\n                S24.197,25.534,23.375,25.534L23.375,25.534z M24.576,21.575H13.965c-2.274,0-3.179-2.151-3.219-2.244\n                c-0.012-0.024-0.021-0.053-0.028-0.076c0,0-3.56-12.118-3.834-13.05c-0.26-0.881-0.477-1.007-1.146-1.007H2.9\n                c-0.455,0-0.82-0.364-0.82-0.818s0.365-0.82,0.82-0.82h2.841c1.827,0,2.4,1.103,2.715,2.181\n                c0.264,0.898,3.569,12.146,3.821,12.999c0.087,0.188,0.611,1.197,1.688,1.197h10.611c0.451,0,0.818,0.368,0.818,0.818\n                C25.395,21.21,25.027,21.575,24.576,21.575L24.576,21.575z\"/>\n    </svg>\n  </div>\n  <div class=\"col-xs-7\">\n    <span class=\"badge\">{{ giCart.totalItems() }}</span>\n  </div>\n</div>\n");}]);
angular.module('gi.commerce').factory('giOrderLine', [
  '$q', 'giCrud', function($q, Crud) {
    var crudService, forCustomer, forOrder, forProduct;
    crudService = Crud.factory('orderlines', true);
    forOrder = function(orderId) {
      var deferred;
      deferred = $q.defer();
      crudService.query({
        orderId: orderId
      }).then(function(orderlines) {
        return deferred.resolve(orderlines);
      });
      return deferred.promise;
    };
    forCustomer = function(customerId) {
      var deferred;
      deferred = $q.defer();
      crudService.query({
        'attributes.value': customerId
      }).then(function(orderlines) {
        return deferred.resolve(orderlines);
      });
      return deferred.promise;
    };
    forProduct = function(productId) {
      var deferred;
      deferred = $q.defer();
      crudService.query({
        productId: productId
      }).then(function(orderlines) {
        return deferred.resolve(orderlines);
      });
      return deferred.promise;
    };
    return {
      findById: crudService.get,
      get: crudService.get,
      forOrder: forOrder,
      save: crudService.save,
      destroy: crudService.destroy,
      forCustomer: forCustomer,
      forProduct: forProduct
    };
  }
]);


/*global angular */
angular.module('gi.commerce').factory('giProduct', [
  '$q', '$filter', 'giCrud', 'giCategory', 'giOrderLine', function($q, $filter, Crud, Category, OrderLine) {
    var all, crudService, findById, forCategory, getCached, save, variantFactory;
    crudService = Crud.factory('products', true);
    all = function(params) {
      var deferred;
      deferred = $q.defer();
      crudService.all(params).then(function(products) {
        angular.forEach(products, function(product) {
          var d;
          d = moment.utc(product.date).toDate();
          return product.date = moment([d.getFullYear(), d.getMonth(), d.getDate()]).toDate();
        });
        return deferred.resolve(products);
      });
      return deferred.promise;
    };
    findById = function(id) {
      var deferred;
      deferred = $q.defer();
      crudService.get(id).then(function(product) {
        var d;
        d = moment.utc(product.date).toDate();
        product.date = moment([d.getFullYear(), d.getMonth(), d.getDate()]).toDate();
        return deferred.resolve(product);
      });
      return deferred.promise;
    };
    forCategory = function(id) {
      var deferred;
      deferred = $q.defer();
      Category.all().then(function(categories) {
        var catList;
        catList = $filter('filter')(categories, function(category) {
          return (category.slug === id) || (category._id === id);
        });
        if (catList.length > 0) {
          return all({
            categories: catList[0]._id
          }).then(function(results) {
            return deferred.resolve(results);
          });
        } else {
          return deferred.resolve();
        }
      });
      return deferred.promise;
    };
    save = function(product) {
      var d;
      d = product.date;
      product.date = moment.utc([d.getFullYear(), d.getMonth(), d.getDate()]).toDate();
      return crudService.save(product);
    };
    getCached = function(id) {
      var d, product;
      product = crudService.getCached(id);
      if (product != null) {
        d = moment.utc(product.date).toDate();
        product.date = moment([d.getFullYear(), d.getMonth(), d.getDate()]).toDate();
      }
      return product;
    };
    variantFactory = function(parentId, callback) {
      var deferred;
      deferred = $q.defer();
      crudService.get(parentId).then(function(product) {
        var result;
        result = {
          siteId: product.siteId,
          stock: product.stock,
          price: product.price,
          date: moment().toDate(),
          categories: product.categories,
          parentId: parentId,
          description: product.description,
          detail: product.detail,
          notes: ''
        };
        return deferred.resolve(result);
      });
      return deferred.promise;
    };
    return {
      variantFactory: variantFactory,
      query: all,
      all: all,
      get: findById,
      findById: findById,
      getCached: getCached,
      save: save,
      destroy: crudService.destroy,
      forCategory: forCategory
    };
  }
]);
