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
        return $scope.cart = Cart;
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
            var result;
            result = card.isValid(number);
            return result;
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
  '$q', 'giCurrency', function($q, Currency) {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        item: '=',
        submitText: '@'
      },
      templateUrl: 'gi.commerce.customerForm.html',
      link: function($scope, elem, attrs) {
        return $scope.requestLogin = function() {
          return $scope.$emit('event:show-login');
        };
      }
    };
  }
]);

angular.module("gi.commerce").run(["$templateCache", function($templateCache) {$templateCache.put("gi.commerce.addressFormFields.html","<legend>{{title}}</legend>\n<div class=\"form-group\">\n  <label>Address Line 1:</label>\n  <input type=\"text\"\n         class=\"form-control\"\n         name=\"{{prefix}}-line1\"\n         ng-model=\"item.line1\"/>\n</div>\n<div class=\"form-group\">\n  <label>Address Line 2:</label>\n  <input type=\"text\"\n         class=\"form-control\"\n         name=\"{{prefix}}-line2\"\n         ng-model=\"item.line2\"/>\n</div>\n<div class=\"form-group\">\n  <label>City:</label>\n  <input type=\"text\"\n         class=\"form-control\"\n         name=\"{{prefix}}-city\"\n         ng-model=\"item.city\"/>\n</div>\n<div class=\"form-group\">\n  <label>State:</label>\n  <input type=\"text\"\n         class=\"form-control\"\n         name=\"{{prefix}}-state\"\n         ng-model=\"item.state\"/>\n</div>\n<div class=\"form-group\">\n  <label class=\"control-label\">Country:</label>\n  <ui-select ng-model=\"item.country\">\n    <ui-select-match>{{$select.selected.name}}</ui-select-match>\n    <ui-select-choices repeat=\"t in model.countries  | filter: $select.search\">\n      <div ng-bind-html=\"t.name | highlight: $select.search\"></div>\n    </ui-select-choices>\n  </ui-select>\n</div>\n");
$templateCache.put("gi.commerce.addtocart.html","<div ng-hide=\"attrs.id\">\n    <a class=\"btn btn-lg btn-primary\" ng-disabled=\"true\" ng-transclude></a>\n</div>\n<div ng-show=\"attrs.id\">\n    <div ng-hide=\"inCart()\">\n        <a class=\"btn btn-lg btn-primary\"\n           ng-click=\"addItem(item)\"\n           ng-transclude></a>\n    </div>\n    <div class=\"alert alert-info\"  ng-show=\"inCart()\">\n        This item is in your cart\n    </div>\n</div>\n");
$templateCache.put("gi.commerce.cart.html","\n<div class=\"col-xs-12\" ng-show=\"giCart.totalItems() === 0\">\n    Your cart is empty\n</div>\n\n<div class=\"table-responsive col-xs-12\" ng-show=\"giCart.totalItems() > 0\">\n\n    <table class=\"table table-striped giCart cart\">\n\n        <thead>\n        <tr>\n            <th></th>\n            <th></th>\n            <th>Quantity</th>\n            <th>Amount</th>\n            <th>Total</th>\n        </tr>\n        </thead>\n        <tfoot>\n        <tr ng-show=\"giCart.getTax()\">\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Tax ({{ giCart.getCart().tax }}%):</th>\n            <th>{{ giCart.getTax() | giCurrency:giCart.getCurrencySymbol }}</th>\n        </tr>\n        <tr ng-show=\"giCart.getShipping()\">\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Shipping:</th>\n            <th>{{ giCart.getShipping() | giCurrency:giCart.getCurrencySymbol }}</th>\n        </tr>\n        <tr>\n            <th></th>\n            <th></th>\n            <th></th>\n            <th>Total:</th>\n            <th>{{ giCart.totalCost() | giCurrency:giCart.getCurrencySymbol }}</th>\n        </tr>\n        </tfoot>\n        <tbody>\n        <tr ng-repeat=\"item in giCart.getItems() track by $index\">\n            <td><span ng-click=\"giCart.removeItem($index)\" class=\"glyphicon glyphicon-remove\"></span></td>\n            <td>{{ item.getName() }}</td>\n            <td><span class=\"glyphicon glyphicon-minus\" ng-class=\"{\'disabled\':item.getQuantity()==1}\"\n                      ng-click=\"item.setQuantity(-1, true)\"></span>&nbsp;&nbsp;\n                {{ item.getQuantity() | number }}&nbsp;&nbsp;\n                <span class=\"glyphicon glyphicon-plus\" ng-click=\"item.setQuantity(1, true)\"></span></td>\n            <td>{{ item.getPrice(giCart.getCurrencyCode()) | giCurrency:giCart.getCurrencySymbol}}</td>\n            <td>{{ item.getTotal(giCart.getCurrencyCode()) | giCurrency:giCart.getCurrencySymbol }}</td>\n        </tr>\n        </tbody>\n    </table>\n</div>\n<style>\n    .giCart.cart span[ng-click] {\n        cursor: pointer;\n    }\n    .giCart.cart .glyphicon.disabled {\n        color:#aaa;\n    }\n</style>\n");
$templateCache.put("gi.commerce.cartStage.html","<div class=\"row gi-checkout\" style=\"border-bottom:0;\">\n  <div class=\"col-xs-3 gi-checkout-stage\"\n       ng-class=\"{complete: cart.getStage()>1, active: cart.getStage()==1}\">\n    <div class=\"text-center gi-checkout-stagenum\">Review Cart</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(1)\" class=\"gi-checkout-dot\"></a>\n  </div>\n  <div class=\"col-xs-3 gi-checkout-stage\"\n    ng-class=\"{complete: cart.getStage()>2, active: cart.getStage()==2, disabled: cart.getStage()<2}\">\n    <div class=\"text-center gi-checkout-stagenum\">Your Details</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(2)\" class=\"gi-checkout-dot\"></a>\n  </div>\n  <div class=\"col-xs-3 gi-checkout-stage\"\n    ng-class=\"{complete: cart.getStage()>3, active: cart.getStage()==3, disabled: cart.getStage()<3}\">\n    <div class=\"text-center gi-checkout-stagenum\">Payment</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(3)\" class=\"gi-checkout-dot\"></a>\n  </div>\n  <div class=\"col-xs-3 gi-checkout-stage\"\n       ng-class=\"{complete: cart.getStage()>4, active: cart.getStage()==4, disabled: cart.getStage()<4}\">\n    <div class=\"text-center gi-checkout-stagenum\">Complete</div>\n    <div class=\"progress\"><div class=\"progress-bar\"></div></div>\n    <a ng-click=\"cart.setStage(4)\" class=\"gi-checkout-dot\"></a>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.checkout.html","<div class=\"container\">\n  <gi-cart-stage model=\"model\"></gi-cart-stage>\n  <div class=\"row small-gap\">\n    <gi-cart ng-if=\"cart.getStage() == 1\" model=\"model\"></gi-cart>\n    <gi-customer-info ng-if=\"cart.getStage() == 2\" model=\"model\"></gi-customer-info>\n    <gi-payment-info ng-if=\"cart.getStage() == 3\"></gi-payment-info>\n    <pre ng-if=\"cart.getStage() == 4\">Thankyou message to go here</pre>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-md-1\">\n      <div ng-if=\"cart.getStage() > 1\" class=\"btn btn-primary\" ng-click=\"cart.prevStage()\">Prev</div>\n    </div>\n    <div class=\"col-md-1 col-md-offset-10\">\n      <div ng-if=\"cart.getStage() < 3\" class=\"btn btn-primary\" ng-click=\"cart.nextStage()\">Next</div>\n      <div ng-if=\"cart.getStage() == 3\" class=\"btn btn-primary\" ng-click=\"cart.payNow()\">Pay Now</div>\n    </div>\n  </div>\n  <div class=\"row medium-gap\">\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.countryForm.html","<div ng-form name=\"countryForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"countryName\"\n           ng-model=\"model.selectedItem.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Code:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"countryCode\"\n           ng-model=\"model.selectedItem.code\"/>\n  </div>\n  <div class=\"form-group\">\n    <label class=\"control-label\">Currency:</label>\n    <ui-select ng-model=\"model.selectedItem.currencyId\">\n      <ui-select-match>{{$select.selected.name}}</ui-select-match>\n      <ui-select-choices repeat=\"c._id as c in model.currencies  | filter: $select.search\">\n        <div ng-bind-html=\"c.name | highlight: $select.search\"></div>\n      </ui-select-choices>\n    </ui-select>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-primary btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"countryForm.$dirty || model.selectedItem._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"model.selectedItem._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.currencyForm.html","<div ng-form name=\"currencyForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"currencyName\"\n           ng-model=\"item.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Code:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"currencyCode\"\n           ng-model=\"item.code\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Symbol:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"currencSymbol\"\n           ng-model=\"item.symbol\"/>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-primary btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"currencyForm.$dirty || item._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"item._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.customerForm.html","<div ng-form name=\"customerForm\" class=\"well form\">\n  <div class=\"row\">\n    <div class=\"col-md-12\">\n      <div class=\"form-group\" ng-if=\"model.me.loggedIn\">\n        Hi {{model.me.user.firstName}} welcome back. We will e-mail confirmation of your order to your e-mail address:\n        <strong>{{model.me.user.email}}</strong>\n      </div>\n      <div class=\"form-group\" ng-if=\"!model.me.loggedIn\">\n        Already have an account? <a ng-click=\"requestLogin()\">Please Sign In</a>\n      </div>\n      <div class=\"form-group\">\n        <div class=\"checkbox\">\n          <label>\n            <input type=\"checkbox\" ng-model=\"cart.business\"> Buying for a company?\n          </label>\n        </div>\n      </div>\n    </div>\n    <div class=\"col-md-6\" ng-if=\"!model.me.loggedIn\">\n      <div class=\"form-group\">\n        <label>Name:</label>\n        <input type=\"text\"\n               class=\"form-control\"\n               name=\"name\"\n               ng-model=\"model.selectedItem.name\"/>\n      </div>\n      <div class=\"form-group\">\n        <label>Email:</label>\n        <input type=\"text\"\n               class=\"form-control\"\n               name=\"email\"\n               ng-model=\"model.selectedItem.email\"/>\n      </div>\n      <div class=\"form-group\">\n        <label>Password:</label>\n        <input type=\"password\"\n               class=\"form-control\"\n               name=\"password\"\n               ng-model=\"model.selectedItem.password\"/>\n      </div>\n    </div>\n    <div class=\"col-md-6\" ng-if=\"cart.business\">\n      <div class=\"form-group\" >\n        <label>Company Name:</label>\n        <input type=\"text\"\n               class=\"form-control\"\n               name=\"countryName\"\n               ng-model=\"cart.companyName\"/>\n      </div>\n      <div class=\"form-group\">\n        <label>VAT Number (optional):</label>\n        <input type=\"text\"\n               class=\"form-control\"\n               name=\"countryName\"\n               ng-model=\"cart.companyVAT\"/>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.customerInfo.html","<div class=\"row medium-gap\">\n  <div class=\"col-md-12\">\n    <gi-customer-form model=\"model\"><gi-customer-form>\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col-md-12\">\n    <div ng-form name=\"addressForm\" class=\"form well\">\n      <div class=\"row\">\n        <div ng-if=\"cart.needsShipping()\" class=\"col-md-12\">\n          <div class=\"form-group\">\n            <div class=\"checkbox\">\n              <label>\n                <input type=\"checkbox\" ng-model=\"cart.differentShipping\"> Ship to different address?\n              </label>\n            </div>\n          </div>\n        </div>\n        <div class=\"col-md-6\">\n          <gi-address-form-fields item=\"cart.billingAddress\"\n                           title=\"Please enter your billing address\"\n                           prefix=\"billing\">\n          </gi-address-form-fields>\n        </div>\n\n        <div class=\"col-md-6\" ng-if=\"cart.differentShipping\">\n          <gi-address-form-fields item=\"cart.shippingAddress\"\n                           title=\"Please enter your shipping address\"\n                           prefix=\"shipping\">\n          </gi-address-form-fields>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.paymentInfo.html","<div ng-form name=\"cardForm\" class=\"well form\">\n  <legend>Please enter your card details</legend>\n  <div class=\"form-group\" ng-class=\"{\'has-error\': isNumberValidationError(), \'has-success\': isNumberValidationSuccess()}\">\n    <label class=\"control-label\">Card Number:</label>\n    <div class=\"input-group\">\n      <input type=\"text\"\n           class=\"form-control\"\n           name=\"cardNumber\"\n           ng-model=\"cart.card.number\"\n           gi-cc-num\n           cc-eager-type />\n      <span class=\"input-group-addon\"><i class=\"fa fa-lg\" ng-class=\"getCreditFont()\"></i></span>\n    </div>\n    <p class=\"control-label\" ng-show=\"isNumberValidationError()\">\n      Not a valid card number!\n    </p>\n  </div>\n  <div class=\"form-group\">\n    <label>Expiry Date:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"cardExpiry\"\n           ng-model=\"cart.card.expiry\"/>\n  </div>\n  <div class=\"form-group\" ng-class=\"{\'has-error\': isSecurityValidationError(), \'has-success\': isSecurityValidationSuccess()}\">\n    <label>CVC:</label>\n    <div class=\"input-group\">\n      <input type=\"text\"\n             class=\"form-control\"\n             name=\"cardSecurity\"\n             ng-model=\"cart.card.security\"\n             gi-cc-cvc\n             gi-cc-type=\"cardForm.cardNumber.$giCcType\"/>\n      <span class=\"input-group-addon\"><i class=\"fa fa-lg\" ng-class=\"getCvcFont()\"></i></span>\n    </div>\n    <p class=\"control-label\" ng-show=\"isSecurityValidationError()\">\n      Not a valid cvc number!\n    </p>\n\n  </div>\n  <pre>{{cardForm.cardNumber.$giCcType | json}}</pre>\n</div>\n<pre>{{cardForm.cardNumber.$giCcType | json}}</pre>\n");
$templateCache.put("gi.commerce.priceForm.html","<div ng-form name=\"priceForm\" class=\"well form\">\n  <div class=\"form-group\">\n    <label>Name:</label>\n    <input type=\"text\"\n           class=\"form-control\"\n           name=\"priceListName\"\n           ng-model=\"model.selectedItem.name\"/>\n  </div>\n  <div class=\"form-group\">\n    <label>Prices:</label>\n    <div ng-repeat=\"(code, price) in model.selectedItem.prices\">\n      <div class=\"input-group\">\n         <div class=\"input-group-addon currency\">{{code}}</div>\n         <input type=\"text\" class=\"form-control\" id=\"exampleInputAmount\" placeholder=\"Amount\" ng-model=\"model.selectedItem.prices[code]\"/>\n         <div class=\"input-group-addon\" ng-click=\"removePriceForCurrency(code)\">  <span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span></div>\n       </div>\n    </div>\n  </div>\n  <div class=\"form-group\">\n    <div class=\"input-group\">\n      <div class=\"input-group-addon currency\" style=\"\">\n        <ui-select ng-model=\"local.code\">\n           <ui-select-match>{{$select.selected.code}}</ui-select-match>\n           <ui-select-choices repeat=\"c.code as c in model.currencies  | filter: $select.search\">\n             <div ng-bind-html=\"c.code | highlight: $select.search\"></div>\n           </ui-select-choices>\n        </ui-select>\n      </div>\n      <input type=\"text\" class=\"form-control currency-pick\" id=\"exampleInputAmount\" placeholder=\"Enter Amount\" ng-model=\"local.price\"/>\n      <div class=\"input-group-addon\" ng-click=\"savePriceForCurrency(local.code)\">  <span class=\"glyphicon glyphicon-save\" aria-hidden=\"true\"></span></div>\n     </div>\n  </div>\n  <div class=\"form-group\">\n    <button class=\"form-control btn btn-success btn-save-asset\"\n            ng-click=\"save()\">{{submitText}}</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"priceForm.$dirty || model.selectedItem._id\">\n    <button class=\"form-control btn btn-warning\"\n            ng-click=\"clear()\">Cancel</button>\n  </div>\n  <div class=\"form-group\" ng-show=\"model.selectedItem._id\">\n    <button class=\"form-control btn btn-danger\" ng-click=\"destroy()\">\n      Delete <span ng-if=\"confirm\">- Are you sure? Click again to confirm</span>\n    </button>\n  </div>\n</div>\n");
$templateCache.put("gi.commerce.summary.html","<div class=\"row\">\n  <div class=\"col-xs-5\">\n    <svg version=\"1.1\"  class=\"icon basket\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" width=\"30px\" height=\"30px\" xml:space=\"preserve\">\n      <path d=\"M27.715,10.48l-2.938,6.312c-0.082,0.264-0.477,0.968-1.318,0.968H11.831\n                c-0.89,0-1.479-0.638-1.602-0.904l-2.048-6.524C7.629,8.514,8.715,7.933,9.462,7.933c0.748,0,14.915,0,16.805,0\n                C27.947,7.933,28.17,9.389,27.715,10.48L27.715,10.48z M9.736,9.619c0.01,0.061,0.026,0.137,0.056,0.226l1.742,6.208\n                c0.026,0.017,0.058,0.028,0.089,0.028h11.629l2.92-6.27c0.025-0.073,0.045-0.137,0.053-0.192H9.736L9.736,9.619z M13.544,25.534\n                c-0.819,0-1.482-0.662-1.482-1.482s0.663-1.484,1.482-1.484c0.824,0,1.486,0.664,1.486,1.484S14.369,25.534,13.544,25.534\n                L13.544,25.534z M23.375,25.534c-0.82,0-1.482-0.662-1.482-1.482s0.662-1.484,1.482-1.484c0.822,0,1.486,0.664,1.486,1.484\n                S24.197,25.534,23.375,25.534L23.375,25.534z M24.576,21.575H13.965c-2.274,0-3.179-2.151-3.219-2.244\n                c-0.012-0.024-0.021-0.053-0.028-0.076c0,0-3.56-12.118-3.834-13.05c-0.26-0.881-0.477-1.007-1.146-1.007H2.9\n                c-0.455,0-0.82-0.364-0.82-0.818s0.365-0.82,0.82-0.82h2.841c1.827,0,2.4,1.103,2.715,2.181\n                c0.264,0.898,3.569,12.146,3.821,12.999c0.087,0.188,0.611,1.197,1.688,1.197h10.611c0.451,0,0.818,0.368,0.818,0.818\n                C25.395,21.21,25.027,21.575,24.576,21.575L24.576,21.575z\"/>\n    </svg>\n  </div>\n  <div class=\"col-xs-7\">\n    <span class=\"badge\">{{ giCart.totalItems() }}</span>\n  </div>\n</div>\n");}]);
angular.module('gi.commerce').directive('giCustomerInfo', [
  'giCart', function(Cart) {
    return {
      restrict: 'E',
      templateUrl: 'gi.commerce.customerInfo.html',
      scope: {
        model: '='
      },
      link: function($scope, elem, attrs) {
        return $scope.cart = Cart;
      }
    };
  }
]);

angular.module('gi.commerce').directive('giPaymentInfo', [
  'giCart', function(Cart) {
    return {
      restrict: 'E',
      templateUrl: 'gi.commerce.paymentInfo.html',
      scope: {
        model: '='
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
        $scope.getCvcFont = function() {
          if ($scope.cardForm.cardSecurity.$touched) {
            if ($scope.cardForm.cardSecurity.$invalid) {
              return "fa-exclamation-circle";
            } else {
              return "fa-check-circle";
            }
          } else {
            return "";
          }
        };
        $scope.isNumberValidationError = function() {
          return $scope.cardForm.cardNumber.$invalid && $scope.cardForm.cardNumber.$touched && $scope.cardForm.cardNumber.$dirty;
        };
        $scope.isNumberValidationSuccess = function() {
          return $scope.cardForm.cardNumber.$valid && $scope.cardForm.cardNumber.$touched && $scope.cardForm.cardNumber.$dirty;
        };
        $scope.isSecurityValidationError = function() {
          return $scope.cardForm.cardSecurity.$invalid && $scope.cardForm.cardSecurity.$touched && $scope.cardForm.cardSecurity.$dirty;
        };
        $scope.isSecurityValidationSuccess = function() {
          return $scope.cardForm.cardSecurity.$valid && $scope.cardForm.cardSecurity.$touched && $scope.cardForm.cardSecurity.$dirty;
        };
        return $scope.isPayNowEnabled = function() {
          return $scope.cardForm.$valid;
        };
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
        return total += item.getTotal(cart.currency.code);
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
      getCurrencyCode: function() {
        return cart.currency.code;
      },
      setCountry: function(code) {
        return Currency.getFromCountryCode(code).then(function(currency) {
          if (currency != null) {
            return cart.currency = currency;
          }
        });
      },
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
          return cart.items.push(new giCartItem(item._id, item._name, item._priceList, item._quantity, item._data));
        });
        return save();
      }
    };
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
    item.prototype.getPrice = function(currencyCode) {
      var ref, ref1;
      if (((ref = this._priceList) != null ? (ref1 = ref.prices) != null ? ref1[currencyCode] : void 0 : void 0) != null) {
        return this._priceList.prices[currencyCode];
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
    item.prototype.getTotal = function(currencyCode) {
      return this.getQuantity() * this.getPrice(currencyCode);
    };
    item.prototype.needsShipping = function() {
      return this._data.physical;
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
