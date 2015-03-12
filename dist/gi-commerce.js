angular.module('gi.commerce', ['gi.util']).value('version', '0.2.0').run([
  '$rootScope', 'giCart', 'giCartItem', 'giLocalStorage', function($rootScope, giCart, giCartItem, store) {
    $rootScope.$on('giCart:change', function() {
      return giCart.save();
    });
    if (angular.isObject(store.get('cart'))) {
      return giCart.restore(store.get('cart'));
    } else {
      return giCart.init();
    }
  }
]);

angular.module('gi.commerce').filter('giCurrency', [
  '$filter', function($filter) {
    return function(amount, currencySymbol, fractionSize) {
      if (angular.isFunction(currencySymbol)) {
        currencySymbol = currencySymbol();
      }
      return $filter('currency')(amount, currencySymbol, fractionSize);
    };
  }
]);

angular.module('gi.commerce').filter('giCurrencyId', [
  'giCurrency', function(Currency) {
    return function(currencyId) {
      var cur, result;
      result = "N/A";
      if (currencyId != null) {
        cur = Currency.getCached(currencyId);
        if (cur != null) {
          result = cur.symbol + ' ' + cur.code;
        }
      }
      return result;
    };
  }
]);

angular.module('gi.commerce').directive('giAddToCart', [
  'giCart', function(giCart) {
    return {
      restrict: 'E',
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
        scope.addItem = function(item) {
          return giCart.addItem(item);
        };
        return scope.inCart = function() {
          return giCart.getItemById(attrs.id);
        };
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCart', [
  'giCart', function(giCart) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'gi.commerce.cart.html',
      link: function($scope, element, attrs) {
        return $scope.giCart = giCart;
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCartStage', [
  'giCart', 'giCountry', function(Cart, Country) {
    return {
      restrict: 'E',
      templateUrl: 'gi.commerce.cartStage.html',
      scope: {
        model: '='
      },
      link: function($scope, elem, attrs) {
        $scope.cart = Cart;
        return $scope.$watch('model.userCountry', function(newVal) {
          if (newVal != null) {
            return Cart.setCountry(newVal.code);
          }
        });
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCartSummary', [
  'giCart', function(giCart) {
    return {
      restrict: 'E',
      scope: {},
      transclude: true,
      templateUrl: 'gi.commerce.summary.html',
      link: function(scope, elem, attrs) {
        return scope.giCart = giCart;
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCheckout', [
  'giCart', function(giCart) {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: 'gi.commerce.checkout.html',
      link: function($scope, element, attrs) {
        return $scope.cart = giCart;
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCountryForm', [
  '$q', 'giCurrency', 'giCountry', function($q, Currency, Country) {
    return {
      restrict: 'E',
      scope: {
        submitText: '@',
        model: '='
      },
      templateUrl: 'gi.commerce.countryForm.html',
      link: {
        pre: function($scope) {
          $scope.save = function() {
            return Country.save($scope.model.selectedItem).then(function() {
              var alert;
              alert = {
                name: 'country-saved',
                type: 'success',
                msg: "Country Saved."
              };
              $scope.$emit('event:show-alert', alert);
              $scope.$emit('country-saved', $scope.model.selectedItem);
              return $scope.clear();
            }, function(err) {
              var alert;
              alert = {
                name: 'country-not-saved',
                type: 'danger',
                msg: "Failed to save Country. " + err.data.error
              };
              return $scope.$emit('event:show-alert', alert);
            });
          };
          $scope.clear = function() {
            $scope.model.selectedItem = {};
            $scope.countryForm.$setPristine();
            $scope.confirm = false;
            return $scope.$emit('country-form-cleared');
          };
          return $scope.destroy = function() {
            if ($scope.confirm) {
              return Country.destroy($scope.model.selectedItem._id).then(function() {
                var alert;
                alert = {
                  name: 'country-deleted',
                  type: 'success',
                  msg: 'Country Deleted.'
                };
                $scope.$emit('event:show-alert', alert);
                $scope.$emit('country-deleted');
                return $scope.clear();
              }, function() {
                var alert;
                alert = {
                  name: "Country not deleted",
                  msg: "Country not deleted.",
                  type: "warning"
                };
                $scope.$emit('event:show-alert', alert);
                return $scope.confirm = false;
              });
            } else {
              return $scope.confirm = true;
            }
          };
        }
      }
    };
  }
]);

angular.module("gi.commerce").run(["$templateCache", function($templateCache) {$templateCache.put("gi.commerce.addtocart.html","<div ng-hide=\"attrs.id\">\n    <a class=\"btn btn-lg btn-primary\" ng-disabled=\"true\" ng-transclude></a>\n</div>\n<div ng-show=\"attrs.id\">\n    <div ng-hide=\"inCart()\">\n        <a class=\"btn btn-lg btn-primary\"\n           ng-click=\"addItem(item)\"\n           ng-transclude></a>\n    </div>\n    <div class=\"alert alert-info\"  ng-show=\"inCart()\">\n        This item is in your cart\n    </div>\n</div>\n");
$templateCache.put("gi.commerce.cart.html","\n<div class=\"col-xs-12\" ng-show=\"giCart.totalItems() === 0\">\n    Your cart is empty\n</div>\n\n<div class=\"table-responsive col-xs-12\" ng-show=\"giCart.totalItems() > 0\">\n\n    <table class=\"table table-striped giCart cart\">\n\n        <thead>\n        <tr>\n            <th></th>\n            <th></th>\n            <th>Quantity</th>\n            <th>Amount</th>\n            <th>Total</th>\n        </tr>\n        </thead>\n        <tfoot>\n        <tr ng-show=\"giCart.getTax()\">\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Tax ({{ giCart.getCart().tax }}%):</th>\n            <th>{{ giCart.getTax() | giCurrency:giCart.getCurrencySymbol }}</th>\n        </tr>\n        <tr ng-show=\"giCart.getShipping()\">\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Shipping:</th>\n            <th>{{ giCart.getShipping() | giCurrency:giCart.getCurrencySymbol }}</th>\n        </tr>\n        <tr>\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Total:</th>\n            <th>{{ giCart.totalCost() | giCurrency:giCart.getCurrencySymbol }}</th>\n        </tr>\n        </tfoot>\n        <tbody>\n        <tr ng-repeat=\"item in giCart.getItems() track by $index\">\n            <td><span ng-click=\"giCart.removeItem($index)\" class=\"glyphicon glyphicon-remove\"></span></td>\n            <td>{{ item.getName() }}</td>\n            <td><span class=\"glyphicon glyphicon-minus\" ng-class=\"{\'disabled\':item.getQuantity()==1}\"\n                      ng-click=\"item.setQuantity(-1, true)\"></span>&nbsp;&nbsp;\n                {{ item.getQuantity() | number }}&nbsp;&nbsp;\n                <span class=\"glyphicon glyphicon-plus\" ng-click=\"item.setQuantity(1, true)\"></span></td>\n            <td>{{ item.getPrice() | giCurrency:giCart.getCurrencySymbol}}</td>\n            <td>{{ item.getTotal() | giCurrency:giCart.getCurrencySymbol }}</td>\n        </tr>\n        </tbody>\n    </table>\n</div>\n<style>\n    .giCart.cart span[ng-click] {\n        cursor: pointer;\n    }\n    .giCart.cart .glyphicon.disabled {\n        color:#aaa;\n    }\n</style>\n");
$templateCache.put("gi.commerce.cartStage.html","<div class=\"row gi-checkout\" style=\"border-bottom:0;\">\n  <div class=\"col-xs-3 gi-checkout-stage\"\n       ng-class=\"{complete: cart.getStage()>1, active: cart.getStage()==1}\">\n    <div class=\"text-center gi-checkout-stagenum\">Review Cart</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(1)\" class=\"gi-checkout-dot\"></a>\n  </div>\n  <div class=\"col-xs-3 gi-checkout-stage\"\n    ng-class=\"{complete: cart.getStage()>2, active: cart.getStage()==2, disabled: cart.getStage()<2}\">\n    <div class=\"text-center gi-checkout-stagenum\">Your Details</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(2)\" class=\"gi-checkout-dot\"></a>\n  </div>\n  <div class=\"col-xs-3 gi-checkout-stage\"\n    ng-class=\"{complete: cart.getStage()>3, active: cart.getStage()==3, disabled: cart.getStage()<3}\">\n    <div class=\"text-center gi-checkout-stagenum\">Payment</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(3)\" class=\"gi-checkout-dot\"></a>\n  </div>\n  <div class=\"col-xs-3 gi-checkout-stage\"\n       ng-class=\"{complete: cart.getStage()>4, active: cart.getStage()==4, disabled: cart.getStage()<4}\">\n    <div class=\"text-center gi-checkout-stagenum\">Complete</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(4)\" class=\"gi-checkout-dot\"></a>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.checkout.html","<div class=\"container\">\n  <gi-cart-stage model=\"model\"></gi-cart-stage>\n  <div class=\"row\">\n    <div class=\"col-md-1\">\n      <div ng-if=\"cart.getStage() > 1\" class=\"btn btn-primary\" ng-click=\"cart.prevStage()\">Prev</div>\n    </div>\n    <div class=\"col-md-1 col-md-offset-10\">\n      <div ng-if=\"cart.getStage() < 4\" class=\"btn btn-primary\" ng-click=\"cart.nextStage()\">Next</div>\n    </div>\n  </div>\n  <div class=\"row small-gap\">\n    <gi-cart ng-if=\"cart.getStage() == 1\" model=\"model\"></gi-cart>\n    <pre ng-if=\"cart.getStage() == 2\">Address capture form to go here</pre>\n    <pre ng-if=\"cart.getStage() == 3\">Stripe Payment form to go here</pre>\n    <pre ng-if=\"cart.getStage() == 4\">Thankyou message to go here</pre>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.countryForm.html","<div ng-form name=\"countryForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"countryName\"\n           ng-model=\"model.selectedItem.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Code:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"countryCode\"\n           ng-model=\"model.selectedItem.code\"/>\n  </div>\n  <div class=\"form-group\">\n    <label class=\"control-label\">Currency:</label>\n    <ui-select ng-model=\"model.selectedItem.currencyId\">\n      <ui-select-match>{{$select.selected.name}}</ui-select-match>\n      <ui-select-choices repeat=\"c._id as c in model.currencies  | filter: $select.search\">\n        <div ng-bind-html=\"c.name | highlight: $select.search\"></div>\n      </ui-select-choices>\n    </ui-select>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-primary btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"countryForm.$dirty || model.selectedItem._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"model.selectedItem._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.currencyForm.html","<div ng-form name=\"currencyForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"currencyName\"\n           ng-model=\"item.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Code:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"currencyCode\"\n           ng-model=\"item.code\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Symbol:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"currencSymbol\"\n           ng-model=\"item.symbol\"/>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-primary btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"currencyForm.$dirty || item._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"item._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.priceForm.html","<div ng-form name=\"priceForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"priceListName\"\n           ng-model=\"model.selectedItem.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Prices:</label>\n    <div ng-repeat=\"(code, price) in model.selectedItem.prices\">\n      <div class=\"input-group\">\n         <div class=\"input-group-addon currency\">{{code}}</div>\n         <input type=\"text\" class=\"form-control\" id=\"exampleInputAmount\" placeholder=\"Amount\" ng-model=\"model.selectedItem.prices[code]\"/>\n         <div class=\"input-group-addon\" ng-click=\"removePriceForCurrency(code)\">  <span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span></div>\n       </div>\n    </div>\n  </div>\n  <div class=\"form-group\">\n    <div class=\"input-group\">\n      <div class=\"input-group-addon currency\" style=\"\">\n        <ui-select ng-model=\"local.code\">\n           <ui-select-match>{{$select.selected.code}}</ui-select-match>\n           <ui-select-choices repeat=\"c.code as c in model.currencies  | filter: $select.search\">\n             <div ng-bind-html=\"c.code | highlight: $select.search\"></div>\n           </ui-select-choices>\n        </ui-select>\n      </div>\n      <input type=\"text\" class=\"form-control currency-pick\" id=\"exampleInputAmount\" placeholder=\"Enter Amount\" ng-model=\"local.price\"/>\n      <div class=\"input-group-addon\" ng-click=\"savePriceForCurrency(local.code)\">  <span class=\"glyphicon glyphicon-save\" aria-hidden=\"true\"></span></div>\n     </div>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-success btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"priceForm.$dirty || model.selectedItem._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"model.selectedItem._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.summary.html","<div class=\"row\">\n  <div class=\"col-xs-5\">\n    <svg version=\"1.1\"  class=\"icon basket\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"30px\" height=\"30px\" xml:space=\"preserve\">\n      <path d=\"M27.715,10.48l-2.938,6.312c-0.082,0.264-0.477,0.968-1.318,0.968H11.831\n                c-0.89,0-1.479-0.638-1.602-0.904l-2.048-6.524C7.629,8.514,8.715,7.933,9.462,7.933c0.748,0,14.915,0,16.805,0\n                C27.947,7.933,28.17,9.389,27.715,10.48L27.715,10.48z M9.736,9.619c0.01,0.061,0.026,0.137,0.056,0.226l1.742,6.208\n                c0.026,0.017,0.058,0.028,0.089,0.028h11.629l2.92-6.27c0.025-0.073,0.045-0.137,0.053-0.192H9.736L9.736,9.619z M13.544,25.534\n                c-0.819,0-1.482-0.662-1.482-1.482s0.663-1.484,1.482-1.484c0.824,0,1.486,0.664,1.486,1.484S14.369,25.534,13.544,25.534\n                L13.544,25.534z M23.375,25.534c-0.82,0-1.482-0.662-1.482-1.482s0.662-1.484,1.482-1.484c0.822,0,1.486,0.664,1.486,1.484\n                S24.197,25.534,23.375,25.534L23.375,25.534z M24.576,21.575H13.965c-2.274,0-3.179-2.151-3.219-2.244\n                c-0.012-0.024-0.021-0.053-0.028-0.076c0,0-3.56-12.118-3.834-13.05c-0.26-0.881-0.477-1.007-1.146-1.007H2.9\n                c-0.455,0-0.82-0.364-0.82-0.818s0.365-0.82,0.82-0.82h2.841c1.827,0,2.4,1.103,2.715,2.181\n                c0.264,0.898,3.569,12.146,3.821,12.999c0.087,0.188,0.611,1.197,1.688,1.197h10.611c0.451,0,0.818,0.368,0.818,0.818\n                C25.395,21.21,25.027,21.575,24.576,21.575L24.576,21.575z\"/>\n    </svg>\n  </div>\n  <div class=\"col-xs-7\">\n    <span class=\"badge\">{{ giCart.totalItems() }}</span>\n  </div>\n</div>\n");}]);
angular.module('gi.commerce').directive('giCurrencyForm', [
  '$q', 'giCurrency', function($q, Currency) {
    return {
      restrict: 'E',
      scope: {
        item: '=',
        submitText: '@'
      },
      templateUrl: 'gi.commerce.currencyForm.html',
      link: {
        pre: function($scope) {
          $scope.save = function() {
            return Currency.save($scope.item).then(function() {
              var alert;
              alert = {
                name: 'cohort-saved',
                type: 'success',
                msg: "Currency Saved."
              };
              $scope.$emit('event:show-alert', alert);
              $scope.$emit('cohort-saved', $scope.item);
              return $scope.clear();
            }, function(err) {
              var alert;
              alert = {
                name: 'currency-not-saved',
                type: 'danger',
                msg: "Failed to save currency. " + err.data.error
              };
              return $scope.$emit('event:show-alert', alert);
            });
          };
          $scope.clear = function() {
            $scope.item = {};
            $scope.cohortForm.$setPristine();
            $scope.confirm = false;
            return $scope.$emit('currency-form-cleared');
          };
          return $scope.destroy = function() {
            if ($scope.confirm) {
              return Currency.destroy($scope.item._id).then(function() {
                var alert;
                alert = {
                  name: 'currency-deleted',
                  type: 'success',
                  msg: 'Currency Deleted.'
                };
                $scope.$emit('event:show-alert', alert);
                $scope.$emit('currency-deleted');
                return $scope.clear();
              }, function() {
                var alert;
                alert = {
                  name: "Currency not deleted",
                  msg: "Currency not deleted.",
                  type: "warning"
                };
                $scope.$emit('event:show-alert', alert);
                return $scope.confirm = false;
              });
            } else {
              return $scope.confirm = true;
            }
          };
        }
      }
    };
  }
]);

angular.module('gi.commerce').directive('giPriceForm', [
  '$q', 'giCurrency', 'giPriceList', function($q, Currency, PriceList) {
    return {
      restrict: 'E',
      scope: {
        submitText: '@',
        model: '='
      },
      templateUrl: 'gi.commerce.priceForm.html',
      link: {
        pre: function($scope) {
          $scope.local = {};
          $scope.savePriceForCurrency = function(code) {
            if ($scope.model.selectedItem != null) {
              if ($scope.model.selectedItem.prices == null) {
                $scope.model.selectedItem.prices = {};
              }
              $scope.model.selectedItem.prices[code] = $scope.local.price;
              return $scope.local = {};
            }
          };
          $scope.removePriceForCurrency = function(code) {
            var ref;
            if (((ref = $scope.model.selectedItem) != null ? ref.prices : void 0) != null) {
              return delete $scope.model.selectedItem.prices[code];
            }
          };
          $scope.save = function() {
            return PriceList.save($scope.model.selectedItem).then(function() {
              var alert;
              alert = {
                name: 'price-saved',
                type: 'success',
                msg: "Price Saved."
              };
              $scope.$emit('event:show-alert', alert);
              $scope.$emit('price-saved', $scope.model.selectedItem);
              return $scope.clear();
            }, function(err) {
              var alert;
              alert = {
                name: 'price-not-saved',
                type: 'danger',
                msg: "Failed to save price. " + err.data.error
              };
              return $scope.$emit('event:show-alert', alert);
            });
          };
          $scope.clear = function() {
            $scope.model.selectedItem = {};
            $scope.priceForm.$setPristine();
            $scope.confirm = false;
            return $scope.$emit('price-form-cleared');
          };
          return $scope.destroy = function() {
            if ($scope.confirm) {
              return PriceList.destroy($scope.model.selectedItem._id).then(function() {
                var alert;
                alert = {
                  name: 'price-deleted',
                  type: 'success',
                  msg: 'price Deleted.'
                };
                $scope.$emit('event:show-alert', alert);
                $scope.$emit('price-deleted');
                return $scope.clear();
              }, function() {
                var alert;
                alert = {
                  name: "Price not deleted",
                  msg: "Price not deleted.",
                  type: "warning"
                };
                $scope.$emit('event:show-alert', alert);
                return $scope.confirm = false;
              });
            } else {
              return $scope.confirm = true;
            }
          };
        }
      }
    };
  }
]);

angular.module('gi.commerce').factory('giCart', [
  '$rootScope', 'giCartItem', 'giLocalStorage', 'giCurrency', function($rootScope, giCartItem, store, Currency) {
    var cart, getItemById, getShipping, getSubTotal, init, save;
    cart = {};
    getItemById = function(itemId) {
      var build;
      build = null;
      angular.forEach(cart.items, function(item) {
        if (item.getId() === itemId) {
          return build = item;
        }
      });
      return build;
    };
    getSubTotal = function() {
      var total;
      total = 0;
      angular.forEach(cart.items, function(item) {
        return total += item.getTotal();
      });
      return total;
    };
    getShipping = function() {
      if (cart.items.length === 0) {
        return 0;
      }
      return cart.shipping;
    };
    init = function() {
      cart = {
        shipping: null,
        tax: null,
        items: [],
        stage: 1,
        currency: {
          code: 'GBP',
          symbol: '£'
        }
      };
    };
    save = function() {
      return store.set('cart', JSON.stringify(cart));
    };
    return {
      init: init,
      addItem: function(id, name, price, quantity, data) {
        var inCart, newItem;
        inCart = getItemById(id);
        if (angular.isObject(inCart)) {
          inCart.setQuantity(quantity, false);
        } else {
          newItem = new giCartItem(id, name, price, quantity, data);
          cart.items.push(newItem);
          $rootScope.$broadcast('giCart:itemAdded', newItem);
        }
        return $rootScope.$broadcast('giCart:change', {});
      },
      setShipping: function(shipping) {
        return cart.shipping = shipping;
      },
      getShipping: getShipping,
      setTax: function(tax) {
        return cart.tax = tax;
      },
      getTax: function() {
        var sub;
        sub = getSubTotal();
        return (getSubTotal() / 100) * cart.tax;
      },
      getSubTotal: getSubTotal,
      getItems: function() {
        return cart.items;
      },
      getStage: function() {
        return cart.stage;
      },
      nextStage: function() {
        if (cart.stage < 4) {
          return cart.stage += 1;
        }
      },
      prevStage: function() {
        if (cart.stage > 1) {
          return cart.stage -= 1;
        }
      },
      setStage: function(stage) {
        if (stage > 0 && stage < 4) {
          return cart.stage = stage;
        }
      },
      getCurrencySymbol: function() {
        return cart.currency.symbol;
      },
      setCountry: function(code) {
        return Currency.getFromCountryCode(code).then(function(currency) {
          if (currency != null) {
            return cart.currency = currency;
          }
        });
      },
      totalItems: function() {
        return cart.items.length;
      },
      totalCost: function() {
        return getSubTotal() + getShipping() + this.getTax();
      },
      removeItem: function(index) {
        cart.items.splice(index, 1);
        $rootScope.$broadcast('giCart:itemRemoved', {});
        return $rootScope.$broadcast('giCart:change', {});
      },
      empty: function() {
        cart.items = [];
        return localStorage.removeItem('cart');
      },
      save: save,
      restore: function(storedCart) {
        init();
        cart.shipping = storedCart.shipping;
        cart.tax = storedCart.tax;
        angular.forEach(storedCart.items, function(item) {
          return cart.items.push(new giCartItem(item._id, item._name, item._price, item._quantity, item._data));
        });
        return save();
      }
    };
  }
]);

angular.module('gi.commerce').factory('giCartItem', [
  '$rootScope', 'giLocalStorage', function($rootScope, store) {
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
]);

angular.module('gi.commerce').factory('giCountry', [
  'giCrud', function(Crud) {
    return Crud.factory('country');
  }
]);

angular.module('gi.commerce').factory('giCurrency', [
  '$filter', 'giCrud', 'giCountry', function($filter, Crud, Country) {
    var crud, getFromCountryCode;
    crud = Crud.factory('currency');
    getFromCountryCode = function(code) {
      return Country.all().then(function(countries) {
        var countryCode, cur, result, temp;
        countryCode = code.toUpperCase();
        result = null;
        temp = $filter('filter')(countries, function(country) {
          return country.code === countryCode;
        });
        if (temp.length > 0) {
          cur = crud.getCached(temp[0].currencyId);
          if (cur != null) {
            result = cur;
          }
        }
        return result;
      });
    };
    crud.getFromCountryCode = getFromCountryCode;
    return crud;
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

angular.module('gi.commerce').factory('giPriceList', [
  'giCrud', function(Crud) {
    return Crud.factory('priceList');
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
