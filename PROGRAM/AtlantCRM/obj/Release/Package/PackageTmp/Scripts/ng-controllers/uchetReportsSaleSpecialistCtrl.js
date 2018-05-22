"use strict";

//контроллер
myApp.controller("uchetReportsSaleSpecialistCtrl", function uchetReportsSaleSpecialistCtrl($scope, $http){

  // текущая страница
  $scope.page = 1;

  //доступные специалисты
  $scope.accesebleSpecialist = [];
  //выбранные спициалисты
  $scope.selectedSpecialist = [];

  //доступные продукты
  $scope.accesebleProduct = [];
  //выбранные продукты
  $scope.selectedPropuct = [];

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetReportsSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 2) {
    	if (typeof $scope.toDate === "undefined") $scope.toDate = new Date();
    	if (typeof $scope.fromDate === "undefined") $scope.fromDate = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);;
      $scope.btnRefreshReportClick();
    };

    //возвращаемт список доступны ля отчета специалистов
    $scope.getAccesebleSpecialist = function getAccesebleSpecialist() {
      if ($scope.accesebleSpecialist.length == 0) {
        for (var i = 0; i < $scope.global.manual.S_USER.length; i++) {
          if ($scope.global.manual.S_USER[i].M_ORG_ID === $scope.global.userContext.M_ORG_ID) {
            $scope.accesebleSpecialist.push({
              id: $scope.global.manual.S_USER[i].ID,
              name: (($scope.global.manual.S_USER[i].SURNAME || '') + ' ' + ($scope.global.manual.S_USER[i].NAME || ' ')
                            + ' ' + ($scope.global.manual.S_USER[i].SECNAME || ' '))
            });
          };
        }
      }
      return $scope.accesebleSpecialist;
    }

    $scope.getAcceseblePropuct = function getAcceseblePropuct() {
      if ($scope.accesebleProduct.length == 0) {
        for (var i = 0; i < $scope.global.manual.M_PRODUCT.length; i++) {
          $scope.accesebleProduct.push({
            id: $scope.global.manual.M_PRODUCT[i].ID,
            name: $scope.global.manual.M_PRODUCT[i].NAME
          });
        }
      }
      return $scope.accesebleProduct;
    }

  });


  $scope.btnRefreshReportClick = function btnRefreshReportClick() {
    $scope.global.showWaitingForm("Формирование отчета ...");

    var idsSelectedSpecialist = ",";
    for (var i = 0; i < $scope.selectedSpecialist.length; i++) {
      //idsSelectedSpecialist.push($scope.selectedSpecialist[i].id);
      idsSelectedSpecialist = idsSelectedSpecialist + $scope.selectedSpecialist[i].id + ",";
    }

    var idsSelectedTovar = ",";
    for (var i = 0; i < $scope.selectedPropuct.length; i++) {
      //idsSelectedTovar.push($scope.selectedPropuct[i].id);
      idsSelectedTovar = idsSelectedTovar + $scope.selectedPropuct[i].id + ",";
    }

    $http({
      method: "GET",
      url: "/Home/GetUchetReportSaleSpecailists",
      params: {
        fromDate: $scope.fromDate,
        toDate: $scope.toDate,
        numPage: $scope.page,
        idsSpecialist: idsSelectedSpecialist,
        idsTovar: idsSelectedTovar
      }
    }).then((data) => {
      $scope.report = data.data;
      if (data.data.length > 0) {
        $scope.allCount = data.data[0].COUNT_ALL;
        $scope.pageNums = [];
        var i;
        var ss = Math.ceil($scope.allCount / 9);
        //for (i = 1; i <= data.totalPageCount; i += 1) {
        for (i = 1; i <= ss; i += 1) {
          $scope.pageNums.push(i);
        }
      }

      if ($scope.selectedSpecialist == null && $scope.report.length > 0) {
        $scope.selectedSpecialist = $scope.report[0].USERID;
      }
      $scope.global.hideWaitingForm();
    }, (err) => {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  };

  // при выборе другой страницы
  $scope.pageNumClickHandler = function pageNumClickHandler(pageNum) {
    $scope.page = pageNum;
    $scope.btnRefreshReportClick();
  };

  //нажатие на выбор предыдущей страницы
  $scope.prevPageClickHandler = function prevPageClickHandler() {
    //если страниц всего одна или нет вообще делаем выбранной первую
    if ($scope.pageNums.length <= 1) {
      $scope.page = 1;
      //обновляем содержимое
      $scope.btnRefreshReportClick();
      return;
    }

    //если не на находимся не на первой странице уменьшаем номер текущей страницы на 1
    if ($scope.page > 1) {
      $scope.page = $scope.page - 1;
    }
    //обновляем содержимое
    $scope.btnRefreshReportClick();
  }

  //нажатие на выбор следующие страницы
  $scope.nextPageClickHandler = function nextPageClickHandler() {
    //если страниц всего одна или нет вообще делаем выбранной первую
    if ($scope.pageNums.length <= 1) {
      $scope.page = 1;
      //обновляем содержимое
      $scope.btnRefreshReportClick();
      return;
    }

    //получаем последний элемнет
    var lastElem = $scope.pageNums[$scope.pageNums.length - 1];
    if ($scope.page != lastElem) {
      $scope.page = $scope.page + 1;
      //обновляем содержимое
      $scope.btnRefreshReportClick();
    }

  }

  // нажатие по элементу из поля Статусы
  $scope.fioItemClick = function fioItemClick(item) {

    // нет права просмотра "Расход со склада"
    if ($scope.global.function.noHavePravoRead(8, 27)) return false;

    $scope.global.openUchetSkladRasProduct(item.O_SKLAD_RAS_ID);

  };
});