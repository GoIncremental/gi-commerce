angular.module('gi.commerce', ['gi.util', 'gi.security']).value('version', '0.2.0').run([
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

angular.module('gi.commerce').directive('giAddressFormFields', [
  'giCart', function(Cart) {
    return {
      restrict: 'E',
      templateUrl: 'gi.commerce.addressFormFields.html',
      scope: {
        model: '=',
        item: '=',
        title: '@',
        prefix: '@'
      },
      link: function($scope, elem, attrs) {
        $scope.cart = Cart;
        if ($scope.item == null) {
          return $scope.item = {};
        }
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCcNum', [
  '$parse', 'giCard', function($parse, Card) {
    return {
      restrict: 'A',
      require: 'ngModel',
      compile: function(elem, attrs) {
        var card, linkFn;
        attrs.$set('pattern', '[0-9]*');
        card = Card.card;
        linkFn = function($scope, elem, attrs, controller) {
          var $viewValue, ngModelController;
          ngModelController = controller;
          $scope.$watch(attrs.ngModel, function(number) {
            ngModelController.$giCcType = card.type(number);
          });
          $viewValue = function() {
            return ngModelController.$viewValue;
          };
          if (attrs.ccEagerType != null) {
            $scope.$watch($viewValue, function(number) {
              var res;
              if (number != null) {
                number = card.parse(number);
                res = card.type(number, true);
                ngModelController.$giCcEagerType = res;
              }
            });
          }
          $scope.$watch(attrs.giCcType, function(type) {
            ngModelController.$validate();
          });
          ngModelController.$parsers.unshift(function(number) {
            return card.parse(number);
          });
          ngModelController.$validators.giCcNumber = function(number) {
            return card.isValid(number);
          };
          return ngModelController.$validators.giCcNumberType = function(number) {
            return card.isValid(number, $parse(attrs.giCcType)($scope));
          };
        };
        return linkFn;
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCcExp', [
  '$parse', function($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      compile: function(elem, attrs) {
        var linkFn;
        attrs.$set('pattern', '[0-9]*');
        linkFn = function($scope, elem, attrs, controller) {
          var $viewValue, ngModelController;
          ngModelController = controller;
          $viewValue = function() {
            return ngModelController.$viewValue;
          };
          return ngModelController.$validators.giCcExp = function(x) {
            var date, exp, givenExpiry, match;
            exp = /^(0[1-9]|1[0-2])\/?(?:20)?([0-9]{2})$/;
            match = exp.exec(x);
            if (match != null) {
              date = moment.utc();
              givenExpiry = moment.utc(match[1] + '-' + match[2], "MM-YY").endOf('Month');
              return date.isBefore(givenExpiry);
            } else {
              return false;
            }
          };
        };
        return linkFn;
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCcCvc', [
  '$parse', 'giCard', function($parse, Card) {
    return {
      restrict: 'A',
      require: 'ngModel',
      compile: function(elem, attrs) {
        var cvc, linkFn;
        attrs.$set('maxlength', 4);
        attrs.$set('pattern', '[0-9]*');
        cvc = Card.cvc;
        linkFn = function($scope, elem, attrs, controller) {
          controller.$validators.giCcCvc = function(value) {
            return cvc.isValid(value, $parse(attrs.giCcType)($scope));
          };
          return $scope.$watch(attrs.giCcType, function(x) {
            controller.$validate();
          });
        };
        return linkFn;
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCart', [
  'giCart', function(giCart) {
    return {
      restrict: 'E',
      scope: {
        stage: '@'
      },
      templateUrl: 'gi.commerce.cart.html',
      link: function($scope, element, attrs) {
        $scope.giCart = giCart;
        return $scope.$watch('giCart.totalItems()', function(numItems) {
          var valid;
          valid = numItems > 0;
          return $scope.giCart.setStageValidity($scope.stage, valid);
        });
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
        $scope.cart = giCart;
        return $scope.$watch('cart.getStage()', function(newVal) {
          if (newVal != null) {
            if (newVal === 3) {
              return $scope.cart.calculateTaxRate();
            }
          }
        });
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
            $scope.model.selectedItem.acl = "public-read";
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
            $scope.item.acl = "public-read";
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

angular.module('gi.commerce').directive('giCustomerForm', [
  '$q', 'giCurrency', 'giCart', function($q, Currency, Cart) {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        item: '=',
        submitText: '@',
        stage: '@'
      },
      templateUrl: 'gi.commerce.customerForm.html',
      link: function($scope, elem, attrs) {
        var fieldUsed;
        $scope.cart = Cart;
        if ($scope.item == null) {
          $scope.item = {};
        }
        $scope.requestLogin = function() {
          return $scope.$emit('event:show-login');
        };
        $scope.$watch('model.me', function(me) {
          if ((me != null ? me.user : void 0) != null) {
            return Cart.setCustomer(me.user);
          }
        });
        fieldUsed = function(prop) {
          return $scope.customerForm[prop].$dirty && $scope.customerForm[prop].$touched;
        };
        $scope.isPropertyValidationError = function(prop) {
          return fieldUsed(prop) && $scope.customerForm[prop].$invalid;
        };
        $scope.isPropertyValidationSuccess = function(prop) {
          return fieldUsed(prop) && $scope.customerForm[prop].$valid;
        };
        $scope.isConfirmPasswordSuccess = function(prop) {
          return $scope.isPropertyValidationSuccess(prop) && $scope.isPropertyValidationSuccess('password');
        };
        $scope.isUsernameTaken = function() {
          return fieldUsed('email') && (!$scope.customerForm.email.$error.email) && $scope.customerForm.email.$error.giUsername;
        };
        $scope.isEmailInvalid = function() {
          return fieldUsed('email') && $scope.customerForm.email.$error.email;
        };
        return $scope.$watch('customerForm.$valid', function(valid) {
          return $scope.cart.setStageValidity($scope.stage, valid);
        });
      }
    };
  }
]);

angular.module('gi.commerce').directive('giCustomerInfo', [
  'giCart', function(Cart) {
    return {
      restrict: 'E',
      templateUrl: 'gi.commerce.customerInfo.html',
      scope: {
        model: '=',
        stage: '@'
      },
      link: function($scope, elem, attrs) {
        var substagesValid;
        $scope.cart = Cart;
        substagesValid = function(stage) {
          return function() {
            var stage1;
            stage1 = !$scope.cart.isStageInvalid(stage + '-1');
            return stage1;
          };
        };
        return $scope.$watch(substagesValid($scope.stage), function(newVal) {
          return $scope.cart.setStageValidity($scope.stage, newVal);
        });
      }
    };
  }
]);

angular.module('gi.commerce').directive('giMarketForm', [
  '$q', 'giCrud', 'giMarket', function($q, Crud, Model) {
    return Crud.formDirectiveFactory('Market', Model);
  }
]);

angular.module('gi.commerce').directive('giOrderSummary', [
  'giCart', function(Cart) {
    return {
      restrict: 'E',
      templateUrl: 'gi.commerce.orderSummary.html',
      link: function($scope, elem, attrs) {
        return $scope.cart = Cart;
      }
    };
  }
]);

angular.module("gi.commerce").run(["$templateCache", function($templateCache) {$templateCache.put("gi.commerce.addressFormFields.html","<legend>{{title}}</legend>\n<div class=\"form-group\">\n  <label>Address Line 1:</label>\n  <input type=\"text\"\n         class=\"form-control\"\n         name=\"{{prefix}}-line1\"\n         ng-model=\"item.line1\"/>\n</div>\n<div class=\"form-group\">\n  <label>Address Line 2:</label>\n  <input type=\"text\"\n         class=\"form-control\"\n         name=\"{{prefix}}-line2\"\n         ng-model=\"item.line2\"/>\n</div>\n<div class=\"form-group\">\n  <label>City:</label>\n  <input type=\"text\"\n         class=\"form-control\"\n         name=\"{{prefix}}-city\"\n         ng-model=\"item.city\"/>\n</div>\n<div class=\"form-group\">\n  <label>State:</label>\n  <input type=\"text\"\n         class=\"form-control\"\n         name=\"{{prefix}}-state\"\n         ng-model=\"item.state\"/>\n</div>\n<div class=\"form-group\">\n  <label>Post / Zip Code:</label>\n  <input type=\"text\"\n         class=\"form-control\"\n         name=\"{{prefix}}-code\"\n         ng-model=\"item.code\"/>\n</div>\n<div class=\"form-group\">\n  <label class=\"control-label\">Country:</label>\n  <ui-select ng-model=\"item.country\">\n    <ui-select-match>{{$select.selected.name}}</ui-select-match>\n    <ui-select-choices repeat=\"t.code as t in model.countries  | filter: $select.search\">\n      <div ng-bind-html=\"t.name | highlight: $select.search\"></div>\n    </ui-select-choices>\n  </ui-select>\n</div>\n");
$templateCache.put("gi.commerce.addtocart.html","<div ng-hide=\"attrs.id\">\n    <a class=\"btn btn-lg btn-primary\" ng-disabled=\"true\" ng-transclude></a>\n</div>\n<div ng-show=\"attrs.id\">\n    <div ng-hide=\"inCart()\">\n        <a class=\"btn btn-lg btn-primary\"\n           ng-click=\"addItem(item)\"\n           ng-transclude></a>\n    </div>\n    <div class=\"alert alert-info\"  ng-show=\"inCart()\">\n        This item is in your cart\n    </div>\n</div>\n");
$templateCache.put("gi.commerce.cart.html","<div class=\"row\">\n<div class=\"col-xs-12\" ng-show=\"giCart.totalItems() === 0\" style=\"text-align: center;\">\n    Your cart is empty\n       </br>\n    </br>\n    \n  </div>\n  <div class=\"col-xs-12\">\n    <div class=\"table-responsive hidden-xs\" ng-show=\"giCart.totalItems() > 0\">\n\n      <table class=\"table giCart cart\">\n        <thead>\n          <tr>\n            <th></th>\n            <th></th>\n            <th>Quantity</th>\n            <th><div class=\"pull-right\">Amount</div></th>\n            <th><div class=\"pull-right\">Tax</div></th>\n            <th><div class=\"pull-right\">Total</div></th>\n          </tr>\n        </thead>\n        <tfoot>\n          <tr ng-show=\"giCart.getShipping()\">\n            <th></th>\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Shipping:</th>\n            <th><div class=\"pull-right\">{{ giCart.getShipping() | giCurrency:giCart.getCurrencySymbol }}</div></th>\n          </tr>\n          <tr ng-show=\"giCart.getTaxRate() >= 0\">\n            <th></th>\n            <th></th>\n            <th></th>\n            <th></th>\n            <th><div class=\"pull-right\">Tax:</div></th>\n            <th><div class=\"pull-right\">{{ giCart.getTaxTotal() | giCurrency:giCart.getCurrencySymbol }}</div></th>\n          </tr>\n          <tr>\n            <th></th>\n            <th></th>\n            <th></th>\n            <th></th>\n            <th><div class=\"pull-right\">Total:</div></th>\n            <th><div class=\"pull-right\">{{ giCart.totalCost() | giCurrency:giCart.getCurrencySymbol }}</div></th>\n          </tr>\n        </tfoot>\n        <tbody>\n          <tr ng-repeat=\"item in giCart.getItems() track by $index\">\n            <td><span ng-click=\"giCart.removeItem($index)\" class=\"glyphicon glyphicon-remove\"></span></td>\n            <td>{{ item.getName() }}</td>\n            <td><span class=\"glyphicon glyphicon-minus\" ng-class=\"{\'disabled\':item.getQuantity()==1}\"\n              ng-click=\"item.setQuantity(-1, true)\"></span>&nbsp;&nbsp;\n              {{ item.getQuantity() | number }}&nbsp;&nbsp;\n              <span class=\"glyphicon glyphicon-plus\" ng-click=\"item.setQuantity(1, true)\"></span></td>\n              <td><div class=\"pull-right\">{{ item.getSubTotal(giCart.getPricingInfo()) | giCurrency:giCart.getCurrencySymbol}}</div></td>\n              <td><div class=\"pull-right\">{{ item.getTaxTotal(giCart.getPricingInfo()) | giCurrency:giCart.getCurrencySymbol}}</div></td>\n              <td><div class=\"pull-right\">{{ item.getTotal(giCart.getPricingInfo()) | giCurrency:giCart.getCurrencySymbol}}</div></td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n\n      <div class=\"visible-xs\" ng-show=\"giCart.totalItems() > 0\">\n        <div class=\"mobile-cart-box\" ng-repeat=\"item in giCart.getItems() track by $index\">\n          <h4>{{item.getName() }} </h4>\n          <div class=\"col-xs-6\">\n            <p> Quantity: </p>\n            <span class=\"glyphicon glyphicon-minus\" ng-class=\"{\'disabled\':item.getQuantity()==1}\"\n            ng-click=\"item.setQuantity(-1, true)\"></span>&nbsp;&nbsp;\n            {{ item.getQuantity() | number }}&nbsp;&nbsp;\n            <span class=\"glyphicon glyphicon-plus\" ng-click=\"item.setQuantity(1, true)\"></span>\n          </div>\n          <div class=\"col-xs-6\">\n            <p> Price: <span class=\"pull-right\"> Tax:</span></p>\n\n            <div class=\"pull-left\">{{ item.getSubTotal(giCart.getPricingInfo()) | giCurrency:giCart.getCurrencySymbol}}\n            </div>\n\n            <div class=\"pull-right\">{{ item.getTaxTotal(giCart.getPricingInfo()) | giCurrency:giCart.getCurrencySymbol}}\n            </div>\n\n          </div>\n        </br>\n      </br>\n    </br>\n  </br>\n  <a ng-click=\"giCart.removeItem($index)\" class=\"pull-right\"> Remove </a>\n</br>\n</br>\n\n</div>\n\n<div class=\"col-xs-12\">\n  <div class=\"col-xs-6\">\n    <p class=\"pull-left\"> Total: </p>\n  </div>\n  <div class=\"col-xs-6\">\n    <div class=\"pull-right\">{{ giCart.totalCost() | giCurrency:giCart.getCurrencySymbol }}</div>\n  </div>\n</div>\n<div class=\"col-xs-12\" ng-show=\"giCart.getTaxRate() >= 0\" >\n  <div class=\"col-xs-6\">\n    <p class=\"pull-left\"> Total Tax: </p>\n  </div>\n  <div class=\"col-xs-6\">\n    <div class=\"pull-right\">{{ giCart.getTaxTotal() | giCurrency:giCart.getCurrencySymbol }}\n    </div>\n  </div>\n</div>\n<div class=\"col-xs-12\">\n  <div class=\"col-xs-6\">\n    <p class=\"pull-left\"> Order Total: </p>\n  </div>\n  <div class=\"col-xs-6\">\n    <div class=\"pull-right\">{{ giCart.totalCost() | giCurrency:giCart.getCurrencySymbol }}</div>\n  </div>\n</div>\n<div class=\"col-xs-12\" ng-show=\"giCart.getShipping()\">\n  <div class=\"col-xs-6\">\n    <p> Shipping </p>\n  </div>\n  <div class=\"col-xs-6\">\n    <div class=\"pull-right\">{{ giCart.getShipping() | giCurrency:giCart.getCurrencySymbol }}</div>\n  </div>\n</div>\n</div> \n</div>\n</div>\n<style>\n  .giCart.cart span[ng-click] {\n    cursor: pointer;\n  }\n  .giCart.cart .glyphicon.disabled {\n    color:#aaa;\n  }\n</style>\n");
$templateCache.put("gi.commerce.cartStage.html","<div class=\"row gi-checkout\" style=\"border-bottom:0;\">\n  <div class=\"col-xs-3 gi-checkout-stage\"\n       ng-class=\"{complete: cart.getStage()>1, active: cart.getStage()==1}\">\n    <div class=\"text-center gi-checkout-stagenum\">Review</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(1)\" class=\"gi-checkout-dot\"></a>\n  </div>\n  <div class=\"col-xs-3 gi-checkout-stage\"\n    ng-class=\"{complete: cart.getStage()>2, active: cart.getStage()==2, disabled: cart.getStage()<2}\">\n    <div class=\"text-center gi-checkout-stagenum\">Details</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(2)\" class=\"gi-checkout-dot\"></a>\n  </div>\n  <div class=\"col-xs-3 gi-checkout-stage\"\n    ng-class=\"{complete: cart.getStage()>3, active: cart.getStage()==3, disabled: cart.getStage()<3}\">\n    <div class=\"text-center gi-checkout-stagenum\">Payment</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(3)\" class=\"gi-checkout-dot\"></a>\n  </div>\n  <div class=\"col-xs-3 gi-checkout-stage\"\n       ng-class=\"{complete: cart.getStage()>4, active: cart.getStage()==4, disabled: cart.getStage()<4}\">\n    <div class=\"text-center gi-checkout-stagenum\">Complete</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(4)\" class=\"gi-checkout-dot\"></a>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.checkout.html","<div class=\"container\">\n  <gi-cart-stage model=\"model\"></gi-cart-stage>\n  <div class=\"small-gap\">\n    <gi-cart ng-if=\"cart.getStage() == 1\" model=\"model\" stage=\"1\"></gi-cart>\n    <gi-customer-info ng-if=\"cart.getStage() == 2\" model=\"model\" stage=\"2\">\n    </gi-customer-info>\n    <div ng-if=\"cart.getStage() == 3\" >\n      <div class=\"row\">\n        <div class=\"col-md-4 col-md-push-8\">\n          <gi-order-summary></gi-order-summary>\n        </div>\n        <div class=\"col-md-8 col-md-pull-4\">\n          <gi-payment-info stage=\"3\"></gi-payment-info>\n        </div>\n      </div>\n    </div>\n    <pre ng-if=\"cart.getStage() == 4\">Thankyou message to go here</pre>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-xs-6\">\n      <div ng-if=\"cart.getStage() == 1\" class=\"btn btn-primary\"\n           ng-click=\"cart.continueShopping()\">Continue Shopping</div>\n      <div ng-if=\"cart.getStage() > 1\" class=\"btn btn-primary\"\n           ng-click=\"cart.prevStage()\">Back</div>\n    </div>\n    <div class=\"col-xs-6\">\n      <div class=\"pull-right\">\n        <div ng-if=\"cart.getStage() < 3\" class=\"btn btn-primary btn-cart\"\n             ng-click=\"cart.checkAccount()\"\n             ng-disabled=\"cart.isStageInvalid(cart.getStage())\"\n             >Next</div>\n        <div ng-if=\"cart.getStage() == 3\" class=\"btn btn-primary btn-cart pay-now\"\n             ng-click=\"cart.payNow()\"  ng-disabled=\"cart.isStageInvalid(cart.getStage())\">Pay Now</div>\n      </div>\n    </div>\n  </div>\n  <div class=\"row medium-gap\">\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.countryForm.html","<div ng-form name=\"countryForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"countryName\"\n           ng-model=\"model.selectedItem.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Code:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"countryCode\"\n           ng-model=\"model.selectedItem.code\"/>\n  </div>\n  <div class=\"form-group\">\n    <label class=\"control-label\">Market:</label>\n    <ui-select ng-model=\"model.selectedItem.marketId\">\n      <ui-select-match>{{$select.selected.name}}</ui-select-match>\n      <ui-select-choices repeat=\"c._id as c in model.markets  | filter: $select.search\">\n        <div ng-bind-html=\"c.name | highlight: $select.search\"></div>\n      </ui-select-choices>\n    </ui-select>\n  </div>\n  <div class=\"form-group\">\n    <div class=\"checkbox\">\n      <label>\n        <input type=\"checkbox\" ng-model=\"model.selectedItem.default\"> Use as Default Country?\n      </label>\n    </div>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-primary btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"countryForm.$dirty || model.selectedItem._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"model.selectedItem._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.currencyForm.html","<div ng-form name=\"currencyForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"currencyName\"\n           ng-model=\"item.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Code:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"currencyCode\"\n           ng-model=\"item.code\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Symbol:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"currencySymbol\"\n           ng-model=\"item.symbol\"/>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-primary btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"currencyForm.$dirty || item._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"item._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.customerForm.html","<div ng-form name=\"customerForm\" class=\"well form\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div class=\"form-group\" ng-if=\"model.me.loggedIn\">\n        Hi {{model.me.user.firstName}} welcome back. We will e-mail confirmation of your order to your e-mail address:\n        <strong>{{model.me.user.email}}</strong>\n      </div>\n      <div class=\"form-group\" ng-if=\"!model.me.loggedIn\">\n        Already have an account? <a ng-click=\"requestLogin()\">Please Sign In</a>\n      </div>\n      <div class=\"form-group\">\n        <div class=\"checkbox checkbox-success checkbox-circle\">\n          <input type=\"checkbox\" ng-model=\"cart.business\">\n          <label>Buying for a company?  </label>\n        </div>\n      </div>\n    </div>\n    <div class=\"col-md-12\" ng-if=\"!model.me.loggedIn\"  >\n      <div class=\"form-group\" ng-class=\"{\'has-error\': isPropertyValidationError(\'firstName\'), \'has-success\': isPropertyValidationSuccess(\'firstName\')}\">\n        <label class=\"control-label\">First Name:</label>\n        <input type=\"text\"\n               class=\"form-control\"\n               name=\"firstName\"\n               ng-model=\"item.firstName\"\n               required/>\n         <p class=\"control-label\" ng-show=\"isPropertyValidationError(\'firstName\')\">\n            Please enter your first name.\n         </p>\n      </div>\n      <div class=\"form-group\" ng-class=\"{\'has-error\': isPropertyValidationError(\'lastName\'), \'has-success\': isPropertyValidationSuccess(\'lastName\')}\">\n        <label class=\"control-label\">Last Name:</label>\n        <input type=\"text\"\n               class=\"form-control\"\n               name=\"lastName\"\n               ng-model=\"item.lastName\"\n               required/>\n         <p class=\"control-label\" ng-show=\"isPropertyValidationError(\'lastName\')\">\n            Please enter your last name.\n         </p>\n      </div>\n      <div class=\"form-group\" ng-class=\"{\'has-error\': isPropertyValidationError(\'email\'), \'has-success\': isPropertyValidationSuccess(\'email\')}\">\n        <label class=\"control-label\">Email:</label>\n        <input type=\"email\"\n               class=\"form-control\"\n               name=\"email\"\n               ng-model=\"item.email\"\n               required\n               gi-username />\n         <p class=\"control-label\" ng-show=\"isEmailInvalid()\">\n            Please enter a valid e-mail.\n         </p>\n         <p class=\"control-label\" ng-show=\"isUsernameTaken()\">\n            Username already taken.\n         </p>\n      </div>\n      <div class=\"form-group\"  ng-class=\"{\'has-error\': isPropertyValidationError(\'password\'), \'has-success\': isPropertyValidationSuccess(\'password\')}\">\n        <label class=\"control-label\">Password:</label>\n        <input type=\"password\"\n               class=\"form-control\"\n               name=\"password\"\n               ng-model=\"item.password\"\n               ng-required=\"!model.me.loggedIn\"\n               gi-password />\n         <p class=\"control-label\" ng-show=\"isPropertyValidationError(\'password\')\">\n            Password does not meet minimum requirements (8 characters, at least one number)\n         </p>\n      </div>\n      <div class=\"form-group\" ng-class=\"{\'has-error\': isPropertyValidationError(\'confirm\'), \'has-success\': isConfirmPasswordSuccess(\'confirm\')}\">\n        <label class=\"control-label\">Confirm Password:</label>\n        <input type=\"password\"\n               class=\"form-control\"\n               name=\"confirm\"\n               ng-model=\"item.confirm\"\n               ng-required=\"!model.me.loggedIn\"\n               gi-match=\"item.password\"/>\n        <p class=\"control-label\" ng-show=\"isPropertyValidationError(\'confirm\')\">\n           Passwords do not match\n        </p>\n      </div>\n    </div>\n    <div class=\"col-md-12\">\n      <div class=\"form-group\" >\n        <label>Company Name:</label>\n        <input type=\"text\"\n               class=\"form-control\"\n               name=\"companyName\"\n               ng-model=\"cart.company.Name\"\n               ng-disabled=\"!cart.business\"/>\n      </div>\n      <div class=\"form-group\">\n        <label>VAT Number (optional):</label>\n        <input type=\"text\"\n               class=\"form-control\"\n               name=\"countryName\"\n               ng-model=\"cart.company.VAT\"\n               ng-disabled=\"!cart.business\"/>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.customerInfo.html","<div class=\"row medium-gap\">\n  <div class=\"col-md-4 col-md-push-8\">\n    <gi-order-summary></gi-order-summary>\n  </div>\n  <div class=\"col-md-8 col-md-pull-4\">\n    <gi-customer-form item=\"cart.customerInfo\" model=\"model\" stage=\"{{stage}}-1\"><gi-customer-form>\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col-md-8\">\n    <div ng-form name=\"addressForm\" class=\"form well\">\n        <div ng-if=\"cart.needsShipping()\" class=\"col-md-12\">\n          <div class=\"form-group\">\n            <div class=\"checkbox checkbox-success checkbox-circle\">\n              <input type=\"checkbox\" ng-model=\"cart.differentShipping\">\n              <label>Ship to different address?  </label>\n            </div>\n          </div>\n        </div>\n        <gi-address-form-fields item=\"cart.billingAddress\"\n                         model=\"model\"\n                         title=\"Please enter your billing address\"\n                         prefix=\"billing\">\n        </gi-address-form-fields>\n\n        <div ng-if=\"cart.differentShipping\">\n          <gi-address-form-fields item=\"cart.shippingAddress\"\n                           model=\"model\"\n                           title=\"Please enter your shipping address\"\n                           prefix=\"shipping\">\n          </gi-address-form-fields>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.marketForm.html","<div ng-form name=\"marketForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"marketName\"\n           ng-model=\"model.selectedItem.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Code:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"marketCode\"\n           ng-model=\"model.selectedItem.code\"/>\n  </div>\n  <div class=\"form-group\">\n    <label class=\"control-label\">Currency:</label>\n    <ui-select ng-model=\"model.selectedItem.currencyId\">\n      <ui-select-match>{{$select.selected.name}}</ui-select-match>\n      <ui-select-choices repeat=\"c._id as c in model.currencies  | filter: $select.search\">\n        <div ng-bind-html=\"c.name | highlight: $select.search\"></div>\n      </ui-select-choices>\n    </ui-select>\n  </div>\n  <div class=\"form-group\">\n    <div class=\"checkbox\">\n      <label>\n        <input type=\"checkbox\" ng-model=\"model.selectedItem.default\"> Use as Default Market?\n      </label>\n    </div>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-primary btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"countryForm.$dirty || model.selectedItem._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"model.selectedItem._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.orderSummary.html","<div class = \"form-inline well hidden-sm hidden-xs\">\n  <div class=\"row\">\n    <div class=\"col-md-2\"></div>\n    <div class=\"col-md-8\">\n      <legend>Order Summary</legend>\n    </div>\n  </div>\n\n  <div class=\"row \">\n    <div class=\"col-md-2\">\n    </div>\n    <div class=\"col-md-4\">\n      <label class=\"order-summary\">Amount:</label>\n    </div>\n    <div class=\"col-md-4\">\n      <div class=\"pull-right\">\n        <label class=\"order-summary\">{{ cart.getSubTotal() | giCurrency:cart.getCurrencySymbol }}</label>\n      </div>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-2\">\n    </div>\n    <div class=\"col-md-4\">\n      <label class=\"order-summary\">Tax:</label>\n    </div>\n    <div class=\"col-md-4\">\n      <div class=\"pull-right\">\n        <label class=\"order-summary\">{{ cart.getTaxTotal() | giCurrency:cart.getCurrencySymbol }}</label>\n      </div>\n    </div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-2\">\n    </div>\n    <div class=\"col-md-4\">\n      <label>Total:</label>\n    </div>\n    <div class=\"col-md-4\">\n      <div class=\"pull-right\">\n        <label>{{ cart.totalCost() | giCurrency:cart.getCurrencySymbol }}</label>\n      </div>\n    </div>\n\n  </div>\n</div>\n<div class=\"visible-sm visible-xs\">\n<div class = \"form-inline well\" style=\"height: 140px; \">\n  <div class=\"row\">\n    <div class=\"col-md-2\">\n      \n    </div>\n    <div class=\"col-md-8\">\n      <legend>Order Summary</legend>\n    </div>\n  </div>\n\n    <div style=\"margin-top: -10px;\">\n    <div class=\"col-xs-6\" >\n      <label class=\"pull-right\">Amount:   \n      </label>\n    </div>\n    <div class=\"col-xs-6\">\n      <label><span class=\"\">{{ cart.getSubTotal() | giCurrency:cart.getCurrencySymbol }}</span></label>\n    </div>\n    <div class=\"col-xs-6\">\n      <label class=\"pull-right\">Tax:   \n      </label>\n    </div>\n    <div class=\"col-xs-6\">\n      <label><span class=\"\">{{ cart.getTaxTotal() | giCurrency:cart.getCurrencySymbol }}</span></label>\n    </div>\n    <div class=\"col-xs-6\">\n      <label class=\"pull-right\">Total:   \n      </label>\n    </div>\n    <div class=\"col-xs-6\">\n      <label>{{ cart.totalCost() | giCurrency:cart.getCurrencySymbol }}</label>\n    </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.paymentInfo.html","<div class=\"row\">\n  <div class=\"col-xs-12\">\n    <div ng-form name=\"cardForm\" class=\"well form\">\n      <legend>Please enter your card details</legend>\n      <div class=\"form-group\" ng-class=\"{\'has-error\': isPropertyValidationError(\'cardNumber\'), \'has-success\': isPropertyValidationSuccess(\'cardNumber\')}\">\n        <label class=\"control-label\">Card Number:</label>\n        <div class=\"input-group\">\n          <input type=\"text\"\n               class=\"form-control\"\n               name=\"cardNumber\"\n               ng-model=\"cart.card.number\"\n               placeholder=\"Card Number\"\n               gi-cc-num\n               cc-eager-type />\n          <span class=\"input-group-addon\"><i class=\"fa fa-lg\" ng-class=\"getCreditFont()\"></i></span>\n        </div>\n        <p class=\"control-label\" ng-show=\"isPropertyValidationError(\'cardNumber\')\">\n          Not a valid card number!\n        </p>\n      </div>\n      <div class=\"form-group\" ng-class=\"{\'has-error\': isPropertyValidationError(\'cardExpiry\'), \'has-success\': isPropertyValidationSuccess(\'cardExpiry\')}\">\n        <label class=\"control-label\">Expiry Date:</label>\n        <div class=\"input-group\">\n          <input type=\"text\"\n                 class=\"form-control\"\n                 name=\"cardExpiry\"\n                 placeholder=\"MM/YY\"\n                 ng-model=\"cart.card.expiry\"\n                 gi-cc-exp />\n          <span class=\"input-group-addon\"><i class=\"fa fa-lg\" ng-class=\"getPropertyFont(\'cardExpiry\')\"></i></span>\n        </div>\n        <p class=\"control-label\" ng-show=\"isPropertyValidationError(\'cardExpiry\')\">\n          Not a valid expiry date!\n        </p>\n      </div>\n      <div class=\"form-group\"  ng-class=\"{\'has-error\': isPropertyValidationError(\'cardSecurity\'), \'has-success\': isPropertyValidationSuccess(\'cardSecurity\')}\">\n        <label class=\"control-label\">CVC:</label>\n        <div class=\"input-group\">\n          <input type=\"text\"\n                 class=\"form-control\"\n                 name=\"cardSecurity\"\n                 ng-model=\"cart.card.security\"\n                 placeholder=\"CVC\"\n                 gi-cc-cvc\n                 gi-cc-type=\"cardForm.cardNumber.$giCcType\"/>\n          <span class=\"input-group-addon\"><i class=\"fa fa-lg\" ng-class=\"getPropertyFont(\'cardSecurity\')\"></i></span>\n        </div>\n        <p class=\"control-label\" ng-show=\"isPropertyValidationError(\'cardSecurity\')\">\n          Not a valid cvc number!\n        </p>\n\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.priceForm.html","<div ng-form name=\"priceForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"priceListName\"\n           ng-model=\"model.selectedItem.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Prices:</label>\n    <div ng-repeat=\"(code, price) in model.selectedItem.prices\">\n      <div class=\"input-group\">\n         <div class=\"input-group-addon market\">{{code}}</div>\n         <input type=\"text\" class=\"form-control\" id=\"exampleInputAmount\" placeholder=\"Amount\" ng-model=\"model.selectedItem.prices[code]\"/>\n         <div class=\"input-group-addon\" ng-click=\"removePriceForMarket(code)\">  <span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span></div>\n       </div>\n    </div>\n  </div>\n  <div class=\"form-group\">\n    <div class=\"input-group\">\n      <div class=\"input-group-addon market\" style=\"\">\n        <ui-select ng-model=\"local.code\">\n           <ui-select-match>{{$select.selected.code}}</ui-select-match>\n           <ui-select-choices repeat=\"c.code as c in model.markets  | filter: $select.search\">\n             <div ng-bind-html=\"c.code | highlight: $select.search\"></div>\n           </ui-select-choices>\n        </ui-select>\n      </div>\n      <input type=\"text\" class=\"form-control market-pick\" id=\"exampleInputAmount\" placeholder=\"Enter Amount\" ng-model=\"local.price\"/>\n      <div class=\"input-group-addon\" ng-click=\"savePriceForMarket(local.code)\">  <span class=\"glyphicon glyphicon-save\" aria-hidden=\"true\"></span></div>\n     </div>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-success btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"priceForm.$dirty || model.selectedItem._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"model.selectedItem._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.summary.html","<div class=\"row\">\n  <div class=\"col-xs-5\">\n    <span class=\"fa fa-shopping-cart fa-lg\"></span>\n  </div>\n  <div class=\"col-xs-7\">\n    <span class=\"badge\">{{ giCart.totalItems() }}</span>\n  </div>\n</div>\n");}]);
angular.module('gi.commerce').directive('giPaymentInfo', [
  'giCart', function(Cart) {
    return {
      restrict: 'E',
      templateUrl: 'gi.commerce.paymentInfo.html',
      scope: {
        model: '=',
        stage: '@'
      },
      link: function($scope, elem, attrs) {
        $scope.cart = Cart;
        $scope.getCreditFont = function() {
          switch ($scope.cardForm.cardNumber.$giCcEagerType) {
            case "Visa":
              return "fa-cc-visa";
            case "MasterCard":
              return "fa-cc-mastercard";
            default:
              return "fa-credit-card";
          }
        };
        $scope.getPropertyFont = function(prop) {
          if ($scope.cardForm[prop].$touched) {
            if ($scope.cardForm[prop].$invalid) {
              return "fa-exclamation-circle";
            } else {
              return "fa-check-circle";
            }
          } else {
            return "";
          }
        };
        $scope.isPropertyValidationError = function(prop) {
          return $scope.cardForm[prop].$invalid && $scope.cardForm[prop].$touched && $scope.cardForm[prop].$dirty;
        };
        $scope.isPropertyValidationSuccess = function(prop) {
          return $scope.cardForm[prop].$valid && $scope.cardForm[prop].$touched && $scope.cardForm[prop].$dirty;
        };
        $scope.isPayNowEnabled = function() {
          return $scope.cardForm.$valid;
        };
        return $scope.$watch('cardForm.$valid', function(valid) {
          return $scope.cart.setStageValidity($scope.stage, valid);
        });
      }
    };
  }
]);

angular.module('gi.commerce').directive('giPriceForm', [
  '$q', 'giPriceList', function($q, PriceList) {
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
          $scope.savePriceForMarket = function(code) {
            if ($scope.model.selectedItem != null) {
              if ($scope.model.selectedItem.prices == null) {
                $scope.model.selectedItem.prices = {};
              }
              $scope.model.selectedItem.prices[code] = $scope.local.price;
              return $scope.local = {};
            }
          };
          $scope.removePriceForMarket = function(code) {
            var ref;
            if (((ref = $scope.model.selectedItem) != null ? ref.prices : void 0) != null) {
              return delete $scope.model.selectedItem.prices[code];
            }
          };
          $scope.save = function() {
            $scope.model.selectedItem.acl = "public-read";
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

angular.module('gi.commerce').filter('giMarketId', [
  'giMarket', function(Model) {
    return function(id) {
      var cur, result;
      result = "N/A";
      if (id != null) {
        cur = Model.getCached(id);
        if (cur != null) {
          result = cur.code;
        }
      }
      return result;
    };
  }
]);

angular.module('gi.commerce').factory('giCard', [
  'giCardType', function(CardType) {
    var camelCase, card, cardTypes, cvcRegex, isCvcValid;
    cardTypes = CardType;
    camelCase = function(input) {
      return input.replace(/\s/g, '-').toLowerCase().replace(/-(.)/g, function(match, group1) {
        return group1.toUpperCase();
      });
    };
    card = {
      types: cardTypes,
      parse: function(number) {
        if (typeof number !== 'string') {
          return '';
        } else {
          return number.replace(/[^\d]/g, '');
        }
      },
      type: function(number, eager) {
        var name, res, type;
        res = null;
        for (name in CardType) {
          type = CardType[name];
          if (type.test(number, eager)) {
            res = type.name;
            break;
          }
        }
        return res;
      },
      luhn: function(number) {
        var len, mul, prodArr, sum;
        if (number == null) {
          return false;
        }
        len = number.length;
        if (len < 15) {
          return false;
        }
        mul = 0;
        prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]];
        sum = 0;
        while (len--) {
          sum += prodArr[mul][parseInt(number.charAt(len), 10)];
          mul ^= 1;
        }
        return (sum % 10 === 0) && (sum > 0);
      },
      isValid: function(number, type) {
        if (type == null) {
          return this.luhn(number) && this.type(number);
        } else {
          type = this.types[type];
          if (type != null) {
            return ((!type.luhn) || luhn(number)) && type.test(number);
          } else {
            return false;
          }
        }
      }
    };
    cvcRegex = /^\d{3,4}$/;
    isCvcValid = function(cvc, type) {
      var camelType;
      if ((typeof cvc) !== 'string') {
        return false;
      } else if (!cvcRegex.test(cvc)) {
        return false;
      } else if (!type) {
        return true;
      } else {
        camelType = camelCase(type);
        if (cardTypes[camelType] != null) {
          return card.types[camelType].cvcLength === cvc.length;
        } else {
          return cvc.length === 3;
        }
      }
    };
    return {
      card: card,
      cvc: {
        isValid: isCvcValid
      },
      validate: function(cardObj) {
        return {
          card: {
            type: type(cardObj.number),
            number: cardObj.number,
            expirationMonth: cardObj.expirationMonth,
            expirationYear: cardObj.expirationYear,
            cvc: cardObj.cvc
          },
          validCardNumber: luhn(cardObj.number),
          validCvc: isCvcValid(cardObj.cvc)
        };
      }
    };
  }
]);

var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

angular.module('gi.commerce').factory('giCardType', [
  function() {
    var CardType, amex, dinersClub, discover, jcb, masterCard, unionPay, visa;
    CardType = (function() {
      function CardType(name, pattern, eagerPattern, cvcLength) {
        this.name = name;
        this.pattern = pattern;
        this.eagerPattern = eagerPattern;
        this.cvcLength = cvcLength;
        this.test = bind(this.test, this);
      }

      CardType.prototype.luhn = true;

      CardType.prototype.test = function(number, eager) {
        if (eager != null) {
          return this.eagerPattern.test(number);
        } else {
          return this.pattern.test(number);
        }
      };

      return CardType;

    })();
    visa = new CardType('Visa', /^4[0-9]{12}(?:[0-9]{3})?$/, /^4/, 3);
    masterCard = new CardType('MasterCard', /^5[1-5][0-9]{14}$/, /^5/, 3);
    amex = new CardType('American Express', /^3[47][0-9]{13}$/, /^3[47]/, 4);
    dinersClub = new CardType('Diners Club', /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/, /^3(?:0|[68])/, 3);
    discover = new CardType('Discover', /^6(?:011|5[0-9]{2})[0-9]{12}$/, /^6/, 3);
    jcb = new CardType('JCB', /^35\d{14}$/, /^35/, 3);
    unionPay = new CardType('UnionPay', /^62[0-5]\d{13,16}$/, /^62/, 3);
    unionPay.luhn = false;
    return {
      visa: visa,
      masterCard: masterCard,
      americanExpress: amex,
      dinersClub: dinersClub,
      discover: discover,
      jcb: jcb,
      unionPay: unionPay
    };
  }
]);

angular.module('gi.commerce').factory('giCart', [
  '$rootScope', '$http', 'giCartItem', 'giLocalStorage', 'giCountry', 'giCurrency', 'giPayment', 'giMarket', '$window', function($rootScope, $http, giCartItem, store, Country, Currency, Payment, Market, $window) {
    var c, calculateTaxRate, cart, getItemById, getPricingInfo, getSubTotal, getTaxTotal, init, save;
    cart = {};
    getPricingInfo = function() {
      return {
        marketCode: cart.market.code,
        taxRate: cart.tax,
        taxInclusive: cart.taxInclusive
      };
    };
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
      var priceInfo, subTotal;
      subTotal = 0;
      priceInfo = getPricingInfo();
      angular.forEach(cart.items, function(item) {
        return subTotal += item.getSubTotal(priceInfo);
      });
      return +subTotal.toFixed(2);
    };
    getTaxTotal = function() {
      var priceInfo, taxTotal;
      taxTotal = 0;
      priceInfo = getPricingInfo();
      angular.forEach(cart.items, function(item) {
        return taxTotal += item.getTaxTotal(priceInfo);
      });
      return +taxTotal.toFixed(2);
    };
    init = function() {
      cart = {
        tax: null,
        taxName: "",
        items: [],
        stage: 1,
        validStages: {},
        country: {
          code: 'GB'
        },
        currency: {
          code: 'GBP',
          symbol: '£'
        },
        market: {
          code: 'UK'
        },
        company: {},
        taxInclusive: true
      };
    };
    save = function() {
      return store.set('cart', JSON.stringify(cart));
    };
    calculateTaxRate = function() {
      var countryCode, ref, ref1, uri;
      countryCode = cart.country.code;
      uri = '/api/taxRate?countryCode=' + countryCode;
      if (((ref = c.company) != null ? ref.VAT : void 0) != null) {
        uri += '&vatNumber=' + c.company.VAT;
      }
      if (((ref1 = c.billingAddress) != null ? ref1.code : void 0) != null) {
        uri += '&postalCode=' + c.billingAddress.code;
      }
      return $http.get(uri).success(function(data) {
        cart.tax = data.rate;
        cart.taxName = data.name;
        return cart.tax;
      }).error(function(err) {
        cart.tax = -1;
        cart.taxName = "";
        return cart.tax;
      });
    };
    c = {
      init: init,
      addItem: function(id, name, priceList, quantity, data) {
        var inCart, newItem;
        inCart = getItemById(id);
        if (angular.isObject(inCart)) {
          inCart.setQuantity(quantity, false);
        } else {
          newItem = new giCartItem(id, name, priceList, quantity, data);
          cart.items.push(newItem);
          $rootScope.$broadcast('giCart:itemAdded', newItem);
        }
        return $rootScope.$broadcast('giCart:change', {});
      },
      setTaxRate: function(tax) {
        return cart.tax = tax;
      },
      getTaxRate: function() {
        if (cart.tax >= 0) {
          return cart.tax;
        } else {
          return -1;
        }
      },
      setTaxInclusive: function(isInclusive) {
        return cart.taxInclusive = isInclusive;
      },
      getSubTotal: getSubTotal,
      getTaxTotal: getTaxTotal,
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
      setStageValidity: function(stage, valid) {
        return cart.validStages[stage] = valid;
      },
      isStageInvalid: function(stage) {
        if (cart.validStages[stage] != null) {
          return !cart.validStages[stage];
        } else {
          return true;
        }
      },
      getCurrencySymbol: function() {
        return cart.currency.symbol;
      },
      getCurrencyCode: function() {
        return cart.currency.code;
      },
      getCountryCode: function() {
        return cart.country.code;
      },
      getPricingInfo: getPricingInfo,
      setCustomer: function(customer) {
        return this.customer = customer;
      },
      setCountry: function(code) {
        return Currency.all().then(function() {
          return Market.all().then(function(markets) {
            return Country.getFromCode(code).then(function(country) {
              if (country != null) {
                cart.country = country;
                cart.market = Market.getCached(cart.country.marketId);
                cart.currency = Currency.getCached(cart.market.currencyId);
                return calculateTaxRate();
              }
            });
          });
        });
      },
      calculateTaxRate: calculateTaxRate,
      needsShipping: function() {
        var result;
        result = false;
        angular.forEach(cart.items, function(item) {
          if (item.needsShipping()) {
            return result = true;
          }
        });
        return result;
      },
      totalItems: function() {
        return cart.items.length;
      },
      totalCost: function() {
        return getSubTotal() + getTaxTotal();
      },
      removeItem: function(index) {
        cart.items.splice(index, 1);
        $rootScope.$broadcast('giCart:itemRemoved', {});
        return $rootScope.$broadcast('giCart:change', {});
      },
      continueShopping: function() {
        return $window.history.back();
      },
      checkAccount: function() {
        if (!this.customer) {
          $rootScope.$broadcast('giCart:accountRequired', this.customerInfo);
        }
        return cart.stage += 1;
      },
      payNow: function() {
        var that;
        that = this;
        return Payment.stripe.getToken(that.card).then(function(token) {
          var chargeRequest, item;
          chargeRequest = {
            token: token.id,
            total: that.totalCost(),
            billing: that.billingAddress,
            shipping: that.shippingAddress,
            customer: that.customer,
            currency: that.getCurrencyCode().toLowerCase(),
            tax: {
              rate: cart.tax,
              name: cart.taxName
            },
            items: (function() {
              var i, len, ref, results;
              ref = cart.items;
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                item = ref[i];
                results.push({
                  id: item._data._id,
                  name: item._data.name,
                  purchaseType: item._data.purchaseType
                });
              }
              return results;
            })()
          };
          return Payment.stripe.charge(chargeRequest).then(function(result) {
            $rootScope.$broadcast('giCart:paymentCompleted');
            return cart.stage = 4;
          }, function(err) {
            return $rootScope.$broadcast('giCart:paymentFailed', err);
          });
        }, function(err) {
          return $rootScope.$broadcast('giCart:paymentFailed', err);
        });
      },
      empty: function() {
        cart.items = [];
        return localStorage.removeItem('cart');
      },
      save: save,
      restore: function(storedCart) {
        init();
        cart.tax = storedCart.tax;
        angular.forEach(storedCart.items, function(item) {
          return cart.items.push(new giCartItem(item._id, item._name, item._priceList, item._quantity, item._data));
        });
        return save();
      }
    };
    return c;
  }
]);

angular.module('gi.commerce').factory('giCartItem', [
  '$rootScope', 'giLocalStorage', function($rootScope, store) {
    var item;
    item = function(id, name, priceList, quantity, data) {
      this.setId(id);
      this.setName(name);
      this.setPriceList(priceList);
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
    item.prototype.setPriceList = function(priceList) {
      if (priceList != null) {
        return this._priceList = priceList;
      } else {
        return console.error('A Price List must be provided');
      }
    };
    item.prototype.getPrice = function(priceInfo) {
      var marketCode, ref, ref1;
      marketCode = priceInfo.marketCode;
      if (((ref = this._priceList) != null ? (ref1 = ref.prices) != null ? ref1[marketCode] : void 0 : void 0) != null) {
        return this._priceList.prices[marketCode];
      } else {
        return 0;
      }
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
    item.prototype.getSubTotal = function(priceInfo) {
      var itemPrice;
      itemPrice = this.getPrice(priceInfo);
      if (priceInfo.taxRate > 0 && priceInfo.taxInclusive) {
        itemPrice = itemPrice / (1 + (priceInfo.taxRate / 100));
      }
      return +(this.getQuantity() * itemPrice).toFixed(2);
    };
    item.prototype.getTaxTotal = function(priceInfo) {
      var itemPrice, taxTotal;
      if (priceInfo.taxRate > 0) {
        itemPrice = this.getPrice(priceInfo);
        taxTotal = 0;
        if (priceInfo.taxInclusive) {
          taxTotal = itemPrice - (itemPrice / (1 + (priceInfo.taxRate / 100)));
        } else {
          taxTotal = itemPrice * (priceInfo.taxRate / 100);
        }
        return +(this.getQuantity() * taxTotal).toFixed(2);
      } else {
        return 0;
      }
    };
    item.prototype.getTotal = function(priceInfo) {
      return this.getSubTotal(priceInfo) + this.getTaxTotal(priceInfo);
    };
    item.prototype.needsShipping = function() {
      return this._data.physical;
    };
    return item;
  }
]);

angular.module('gi.commerce').factory('giCountry', [
  '$filter', 'giCrud', function($filter, Crud) {
    var crud, getDefault, getFromCode;
    crud = Crud.factory('country');
    getFromCode = function(code) {
      return crud.all().then(function(countries) {
        var countryCode, temp;
        countryCode = code.toUpperCase();
        temp = $filter('filter')(countries, function(country) {
          return country.code === countryCode;
        });
        if (temp.length > 0) {
          return temp[0];
        } else {
          return getDefault();
        }
      });
    };
    getDefault = function() {
      return crud.all().then(function(countries) {
        var result, temp;
        result = null;
        temp = $filter('filter')(countries, function(country) {
          return country["default"];
        });
        if (temp.length > 0) {
          result = temp[0];
        }
        return result;
      });
    };
    crud.getDefault = getDefault;
    crud.getFromCode = getFromCode;
    return crud;
  }
]);

angular.module('gi.commerce').factory('giCurrency', [
  '$filter', 'giCrud', 'giCountry', function($filter, Crud, Country) {
    return Crud.factory('currency');
  }
]);

angular.module('gi.commerce').factory('giEcommerceAnalytics', [
  'giLog', 'giAnalytics', function(Log, Analytics) {
    return {
      viewProductList: function(name, items) {
        Log.log('Product list: ' + name + ' with: ' + items.length + ' items viewed');
        angular.forEach(items, function(item, idx) {
          var impression;
          Log.log(item);
          impression = {
            id: item.name,
            name: item.displayName,
            list: name,
            position: idx + 1
          };
          return Analytics.Impression(impression);
        });
        return Analytics.PageView();
      }
    };
  }
]);

angular.module('gi.commerce').factory('giMarket', [
  'giCrud', function(Crud) {
    return Crud.factory('market');
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

angular.module('gi.commerce').factory('giPayment', [
  '$q', '$http', function($q, $http) {
    return {
      stripe: {
        setKey: function(key) {
          return Stripe.setPublishableKey(key);
        },
        getToken: function(card) {
          var deferred, exp, match, stripeCard;
          deferred = $q.defer();
          stripeCard = {
            number: card.number,
            cvc: card.security
          };
          exp = /^(0[1-9]|1[0-2])\/?(?:20)?([0-9]{2})$/;
          match = exp.exec(card.expiry);
          if (match != null) {
            stripeCard.exp_month = match[1];
            stripeCard.exp_year = "20" + match[2];
          }
          Stripe.card.createToken(stripeCard, function(status, response) {
            if (response.error != null) {
              return deferred.reject(response.error.message);
            } else {
              return deferred.resolve(response);
            }
          });
          return deferred.promise;
        },
        charge: function(chargeRequest) {
          var deferred;
          deferred = $q.defer();
          $http.post('/api/checkout', chargeRequest).success(function() {
            return deferred.resolve('payment completed');
          }).error(function() {
            return deferred.reject('payment not completed');
          });
          return deferred.promise;
        }
      }
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
