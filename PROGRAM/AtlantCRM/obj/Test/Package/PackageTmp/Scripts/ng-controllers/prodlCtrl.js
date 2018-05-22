"use strict";

// контроллер
myApp.controller("prodlCtrl", function prodlCtrl($scope, $http, $interval) {

  var i = 0;
  var j = 0;
  $scope.prodl = [];
  $scope.prodl_item = [];
  $scope.prodl_srochno_item = {};
  $scope.comment = [];
  $scope.page = 1;
  $scope.vsego = 0;
  $scope.last_page = 0;
  $scope.rows_per_page = 50;
  $scope.text = "";
  $scope.dtfrom = null;
  $scope.dtto = null;
  $scope.user = null;

  $scope.M_SOPR_STATUS_ID = 0;
  $scope.SROCHNO_STYLE = "fio-div-border-red";
  $scope.NORMAL_STYLE = "fio-div";
  $scope.SROCHNO_PRIM = false;

  // отображение окна комментариев
  $scope.commentShow = false;
  // счетчик строк
  $scope.RN = 0;
  // ссылка на анкету
  $scope.O_ANK_ID = 0;
  // ссылка на сопровождение
  $scope.O_SOPR_ID = 0;
  // текст комментария
  $scope.COMMENT = "";
  // текст задачи
  $scope.ZADACHA = "";
  // галочка "Срочно"
  $scope.IS_SROCHNO = false;

  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue, oldValue) {
    if (newValue === "menuItemProdl") {
      $scope.refreshData();
      resizeTd();
    }
  });

  // событие при открытии вкладки
  $scope.$on("global.selectedProdlSubMenuItemChanged", function selectedProdlSubMenuItemChanged(event, newValue) {
    if ($scope.global.selectedMenuItem === "menuItemProdl") {
      $scope.M_SOPR_STATUS_ID = newValue;
      $scope.page = 1;
      $scope.refreshData();
    }
  });

  // запрос основных данных
  $scope.refreshData = function refreshData() {
    $scope.commentShow = false;
    $scope.prodl = [];
    $scope.pageNums = [];

    $scope.COMMENT = "";
    $scope.ZADACHA = "";

    $scope.global.showWaitingForm("Получение данных...");

    $http({
      method: "GET",
      url: "/Home/GetProdl",
      params: {
        page: $scope.page,
        rows_per_page: $scope.rows_per_page,
        stat: $scope.M_SOPR_STATUS_ID,
        text: $scope.text,
        dtfrom: $scope.dtfrom,
        dtto: $scope.dtto,
        user: $scope.user
      }
    }).then(function prodlGetDataSuccess(data) {

      $scope.prodl = data.data;

      if ($scope.prodl.length !== 0) {
        $scope.prodl_item = $scope.prodl[0];
        $scope.vsego = $scope.prodl[0].CNT;
        $scope.last_page = $scope.prodl[0].CNT_PAGE;

        if ($scope.vsego > 0) {
          // если записей больше чем 10
          var a = $scope.page;
          if ($scope.last_page > $scope.global.const.NEXT_PREV_PAGE_COUNT) {
            // и при переходе на следующие 10 записей не выходим за границы массива
            if (($scope.page + $scope.global.const.NEXT_PREV_PAGE_COUNT) <= $scope.last_page) {
              j = $scope.page + $scope.global.const.NEXT_PREV_PAGE_COUNT - 1;
            } else {
              // например, находимся на 28-й странице, всего страниц 31
              // надо добавить 31 - 10 - с 21
              if (($scope.last_page - $scope.page) < $scope.global.const.NEXT_PREV_PAGE_COUNT) {
                if (($scope.last_page - $scope.global.const.NEXT_PREV_PAGE_COUNT) > 0) {
                  a = $scope.last_page - $scope.global.const.NEXT_PREV_PAGE_COUNT;
                  j = $scope.last_page;
                }
              } else {
                j = $scope.last_page;
              }
            }
            // записей меньше чем 10
          } else {
            j = $scope.last_page;
          }

          for (i = a; i <= j; i += 1) {
            $scope.pageNums.push(i);
          }
        }
      }

      $scope.global.hideWaitingForm();

    }, function prodlGetDataFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  // сохранить сопровождение
  $scope.saveProdl = function saveProdl(item) {
    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/SaveProdl",
      data: item
    }).then(function prodlSaveDataSuccess(data) {

      $scope.global.hideWaitingForm();

      $scope.global.showWaitingForm("Получение данных...");
      $scope.refreshData();

      $scope.global.hideWaitingForm();

    }, function prodlSaveDataFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  // "мигание" ячейки, если выбран статус "Срочно"
  $interval(function setAutoSelectedPlaceStyle() {
    if ($scope.SROCHNO_PRIM) {
      $scope.SROCHNO_STYLE = "fio-div";
      $scope.SROCHNO_PRIM = false;
    } else {
      $scope.SROCHNO_STYLE = "fio-div-border-red";
      $scope.SROCHNO_PRIM = true;
    }
  }, 1000);

  // получение комментариев, открытие модального окна
  $scope.showComment = function showComment(item) {
    $scope.O_ANK_ID = item.O_ANK_ID;
    $scope.O_SOPR_ID = item.ID;
    $scope.IS_SROCHNO = item.IS_SROCHNO;

    $scope.prodl_srochno_item = {};
    $scope.prodl_srochno_item = item;

    $scope.comment = [];
    $scope.global.showWaitingForm("Получение комментариев...");

    $http({
      method: "POST",
      url: "/Home/GetProdlComment",
      data: item
    }).then(function prodlGetDataSuccess(data) {

      $scope.comment = data.data;

      if ($scope.comment.length !== 0) {
        $scope.RN = $scope.comment[0].RN;
      } else {
        $scope.RN = 0;
      }

      $scope.global.hideWaitingForm();
      $scope.commentShow = true;

    }, function prodlGetDataFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  // добавим комментарий в таблицу
  $scope.addComment = function addComment() {
    if ($scope.COMMENT != "" || $scope.ZADACHA != "") {
      $scope.RN++;

      $scope.comment.unshift({
        ID: 0,
        RN: $scope.RN,
        D_START: new Date(),
        COMMENT: $scope.COMMENT,
        ZADACHA: $scope.ZADACHA,
        O_ANK_ID: $scope.O_ANK_ID,
        O_SOPR_ID: $scope.O_SOPR_ID,
        USERNAME: ($scope.global.userContext["SURNAME"] || "") + " " + ($scope.global.userContext["NAME"] || "")
      });

      $scope.COMMENT = "";
      $scope.ZADACHA = "";
    }
  };

  // сохранить комментарии
  $scope.saveComment = function saveComment() {
    if ($scope.comment.length === 0) {
      $scope.global.showErrorAlert("Не введено ни одного комментария или задачи");
      return false;
    }

    $scope.global.showWaitingForm("Сохранение комментариев...");
    $http({
      "method": "POST",
      "url": "/Home/SaveProdlComment",
      data: $scope.comment
    }).then(function prodlSaveDataSuccess(data) {

      $scope.global.hideWaitingForm();
      $scope.commentShow = false;

      $scope.global.showWaitingForm("Получение данных...");
      $scope.refreshData();

      $scope.global.hideWaitingForm();

    }, function prodlSaveDataFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  // закрыть модальное окно
  $scope.hideComment = function hideComment() {
    $scope.commentShow = false;
  }

  // при изменении даты
  $scope.dateChange = function dateChange() {
    $scope.page = 1;
    $scope.refreshData();
  }

  // при нажатии enter после ввода ФИО
  $scope.textKeyPress = function textKeyPress(evt) {
    if (evt.keyCode === 13) {
      $scope.page = 1;
      $scope.refreshData();
    }
  }

  // очистка фильтра
  $scope.textClear = function textClear() {
    $scope.text = "";
    $scope.dtfrom = null;
    $scope.dtto = null;
    $scope.user = null;

    $scope.refreshData();
  }

  // при выборе другой страницы
  $scope.pageNumClickHandler = function pageNumClickHandler(pageNum) {
    $scope.page = pageNum;
    $scope.refreshData();
  }

  // следующие 10 страниц
  $scope.pageNext = () => {
    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page - 1) > 0) ? ($scope.page - 1) : 1);
    $scope.refreshData();
  }

  // предыдущие 10 страниц
  $scope.pagePrev = () => {
    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page + 1) > $scope.pageNums.length) ? $scope.pageNums.length : ($scope.page + 1));
    $scope.refreshData();
  }

  // следующие 10 страниц
  $scope.pageNext10 = function pageNext10() {
    if ($scope.pageNums.length === 0) {
      return;
    }

    if ($scope.pageNums.length < $scope.global.const.NEXT_PREV_PAGE_COUNT) {
      return;
    }

    j = $scope.pageNums[$scope.pageNums.length - 1];
    var a = $scope.pageNums[0];
    if (j + $scope.global.const.NEXT_PREV_PAGE_COUNT > $scope.last_page) {
      if (($scope.last_page - j) > 0) {
        j = $scope.last_page;
        if ((j - $scope.global.const.NEXT_PREV_PAGE_COUNT) > 0) {
          a = j - $scope.global.const.NEXT_PREV_PAGE_COUNT;
        }
      } else {
        return;
      }
    } else {
      a = j;
      j = j + $scope.global.const.NEXT_PREV_PAGE_COUNT;
    }

    $scope.pageNums = [];
    for (i = a; i <= j; i++) {
      $scope.pageNums.push(i);
    }
  }

  // предыдущие 10 страниц
  $scope.pagePrev10 = function pagePrev10() {
    if ($scope.pageNums.length === 0) {
      return;
    }

    if ($scope.pageNums.length < $scope.global.const.NEXT_PREV_PAGE_COUNT) {
      return;
    }

    j = $scope.pageNums[0];
    var a = 1;
    // переходим на первую страницу 
    if (j <= $scope.global.const.NEXT_PREV_PAGE_COUNT) {
      a = 1;
      if ($scope.last_page > $scope.global.const.NEXT_PREV_PAGE_COUNT) {
        j = $scope.global.const.NEXT_PREV_PAGE_COUNT;
      } else {
        a = 1;
        j = $scope.last_page;
      }
    } else {
      a = j - $scope.global.const.NEXT_PREV_PAGE_COUNT;
    }

    $scope.pageNums = [];
    for (i = a; i <= j; i++) {
      $scope.pageNums.push(i);
    }
  };

  $(window).bind("resize", function () {
    resizeTd();
  });

  function resizeTd() {
    // ширина ячеек + padding 4px
    var w = $(document).width();
    $scope.TD1  = Math.trunc((w * 0.033));
    $scope.TD2  = Math.trunc((w * 0.045));
    $scope.TD3  = Math.trunc((w * 0.192));
    $scope.TD4  = Math.trunc((w * 0.065));
    $scope.TD5  = Math.trunc((w * 0.045));
    $scope.TD6  = Math.trunc((w * 0.065));
    $scope.TD7  = Math.trunc((w * 0.033));
    $scope.TD8  = Math.trunc((w * 0.065));
    $scope.TD9  = Math.trunc((w * 0.065));
    $scope.TD10 = Math.trunc((w * 0.035));
    $scope.TD11 = Math.trunc((w * 0.045));
    $scope.TD12 = Math.trunc((w * 0.045));
    $scope.TD13 = Math.trunc((w * 0.185));
    $scope.TD14 = Math.trunc((w * 0.1));
  }

  // сохранить галочку "Срочно"
  $scope.setIsSrochno = function setIsSrochno() {
    $http({
      "method": "POST",
      "url": "/Home/SaveProdl",
      data: $scope.prodl_srochno_item
    }).then(function prodlSaveDataSuccess(data) {
      $scope.global.hideWaitingForm();
    }, function prodlSaveDataFailed(err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  }
});