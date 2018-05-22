var myApp;

var scopeAppCtrl;
var httpAppCtrl;

myApp = angular.module("myApp", ['ui.multiselect']);

// обработка всех неотловленных ошибок
myApp.config(function ($provide) {
  $provide.decorator("$exceptionHandler", ['$delegate', function ($delegate) {
    return function (exception, cause) {
      $delegate(exception, cause);
      try {
        // scopeAppCtrl - это scope контроллера appCtrl
        scopeAppCtrl.global.showErrorAlert(exception.message);
      } catch (e) {
        alert("Произошла ошибка: " + exception.message);
      }
    };
  }]);
});


// директива постраничного отображения
//
// пример использования
// <pagination class="div-pagination" page-nums="pageNums" refresh-fn="refresh" page="page" max-pages-count="10" />
//   page-nums - как называется переменная, которая в режиме, куда встраивается постраничное отображение, содержит
//               массив с номерами всех доступных страниц
//   refresh-fn - как называется функция, которая в режиме отвечает за отображение заданной страницы
//   page - как называется переменная, которая хранит номер текущей выбранной страницы
//   max-pages-count - количество кнопок для перехода на страницу, которые отображаются одновременно
myApp.directive("pagination", function ($parse) {
  return {
    restrict: "E",
    link: function (scope, element, attrs) {

      // сколько максимум страниц отображается на одной прокрутке
      var maxPagesCount = scope.maxPagesCount;
      if (maxPagesCount == null) {
        maxPagesCount = 10;
      }

      // scope.pageNums - это массив всех доступных страниц, делаю из него 10 или меньше,
      // которые будут отображаться в данный момент
      scope.pages = [];
      scope.$watch("pageNums.length", (newValue, oldValue) => {

        if (newValue == null) {
          return;
        }

        if (scope.page == null) {
          scope.page = 1;
        }

        if (scope.pageNums.length <= maxPagesCount) {
          scope.pages = scope.pageNums;
        } else if (scope.page + maxPagesCount - 1 > scope.pageNums.length) {
          for (var i = scope.pageNums.length - maxPagesCount + 1; i <= scope.pageNums.length; i += 1) {
            scope.pages.push(i);
          }
        } else {
          var j = maxPagesCount;
          for (var i = scope.page; j > 0; i += 1) {
            scope.pages.push(i);
            j -= 1;
          }
        }
      });

      // следующая страница
      scope.pageNext = function pageNext() {

        if (scope.pageNums.length === 0) {
          return;
        }
        scope.page = (((scope.page + 1) > scope.pageNums.length) ? scope.pageNums.length : (scope.page + 1));
        scope.refreshFn()(scope.page);

      };

      // прокрутить следующие 10 страниц
      scope.pageNext10 = function pageNext10() {

        if (scope.pageNums.length <= maxPagesCount) {
          return;
        } else if (scope.pages[scope.pages.length - 1] + maxPagesCount > scope.pageNums.length) {
          scope.pages = [];
          for (var i = scope.pageNums.length - maxPagesCount + 1; i <= scope.pageNums.length; i += 1) {
            scope.pages.push(i);
          }
        } else {
          var currPage = scope.pages[scope.pages.length - 1] + 1;
          scope.pages = [];
          var j = maxPagesCount;
          for (var i = currPage; j > 0; i += 1) {
            scope.pages.push(i);
            j -= 1;
          }
        }

      };


      // предыдущая страница
      scope.pagePrev = function pagePrev() {

        if (scope.pageNums.length === 0) {
          return;
        }
        scope.page = (((scope.page - 1) > 0) ? (scope.page - 1) : 1);
        scope.refreshFn()(scope.page);

      };

      // прокрутить предыдущие 10 страниц
      scope.pagePrev10 = function pagePrev10() {

        if (scope.pageNums.length === 0) {
          return;
        }
        
        var currPage = scope.pages[0];
        currPage = currPage - maxPagesCount;
        if (currPage <= 0) {
          currPage = 1;
        }

        scope.pages = [];
        var j = maxPagesCount;
        for (var i = currPage; j > 0 && i <= scope.pageNums.length; i += 1) {
          scope.pages.push(i);
          j -= 1;
        }

      };


      // перейти на страницу с номером
      scope.pageNumClick = function pageNumClick(num) {
        scope.refreshFn()(num);
      };


      
    },
    /*controller: function ($scope) {
      $scope.myFunc1 = function () {
        alert("a");
      }
    },*/
    scope: {
      pageNums: "=pageNums",
      page: "=page",
      refreshFn: "&refreshFn",
      maxPagesCount: "=maxPagesCount"
    },
    replace: true,
    template: function (element, attrs) {
      return '' + 
        '<div>                                                         ' +
        '  <nav aria-label="Page navigation">                                                 ' +
        '    <ul class="pagination">                                                          ' +
        '      <li ng-click="pagePrev()">                                                     ' +
        '        <a href="#" aria-label="Previous">                                           ' +
        '          <span aria-hidden="true">&laquo;</span>                                    ' +
        '        </a>                                                                         ' +
        '      </li>                                                                          ' +
        '      <li ng-click="pagePrev10()">                                                   ' +
        '        <a href="#" aria-label="Previous 10 pages">                                  ' +
        '          <span aria-hidden="true">&lsaquo;</span>                                   ' +
        '        </a>                                                                         ' +
        '      </li>                                                                          ' +
        '      <li ng-repeat="item in pages" ng-class="{active: item === page}">           ' +
        '        <a href="#" ng-click="pageNumClick(item)">{{item}}</a>                       ' +
        '      </li>                                                                          ' +
        '      <li ng-click="pageNext10()">                                                   ' +
        '        <a href="#" aria-label="Next 10 pages">                                      ' +
        '          <span aria-hidden="true">&rsaquo;</span>                                   ' +
        '        </a>                                                                         ' +
        '      </li>                                                                          ' +
        '      <li ng-click="pageNext()">                                                     ' +
        '        <a href="#" aria-label="Next">                                               ' +
        '          <span aria-hidden="true">&raquo;</span>                                    ' +
        '        </a>                                                                         ' +
        '      </li>                                                                          ' +
        '    </ul>                                                                            ' +
        '  </nav>                                                                             ' +
        '</div>                                                                               '
      ;


    },
  };
});



/* это заготовка на попозже, пока оставляю закомметированной
navigator.serviceWorker.register("/SW.js", { scope: "/" })
  .then(function registerWorker(reg) {
    console.log("Registration succeeded. Scope is " + reg.scope);
  })
  .catch(function registerWorkerCatch(error) {
    console.log("Registration failed with " + error);
  })
;
*/