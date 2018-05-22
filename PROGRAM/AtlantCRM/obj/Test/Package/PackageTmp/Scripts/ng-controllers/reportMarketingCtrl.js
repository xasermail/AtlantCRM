"use strict";

// контроллер
myApp.controller("reportMarketingCtrl", function reportMarketingCtrl($scope, $http) {



  // событие при открытии вкладки
  $scope.$on("global.selectedReportSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == 10) {

      $scope.global.showWaitingForm("Получение отчёта..");

      // получаю доступные года
      $http({
        "method": "GET",
        "url": "/Home/GetReportMarketingYears"
      }).then(function getReportMarketingYearsSuccess(data) {

        $scope.years = data.data;


        // если какая-нибудь новая организация и данных ещё вообще
        // нет, то годов не будет и соответсвенно данных тоже
        if ($scope.years.length === 0) {
          $scope.global.hideWaitingForm();
          return;
        }

        // проставляю год по умолчанию
        if ($scope.years.find(x => x === (new Date()).getFullYear())) {
          $scope.year = (new Date()).getFullYear();
        } else {
          $scope.year = $scope.years[$scope.years.length - 1];
        }

        // запрашиваю данные
        $scope.refresh();

        $scope.global.hideWaitingForm();

      }, function getReportMarketingYearsFailed(err) {

        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();

      });


    }

  });

  $scope.refresh = function refresh() {

    $scope.global.showWaitingForm("Получение отчёта..");

    $scope.report = null;

    $http({
      "method": "GET",
      "url": "/Home/GetReportMarketing",
      params: {
        year: $scope.year
      }
    }).then(function getReportMarketingSuccess(data) {

      $scope.report = data.data;

      // скрываю все колонки кроме месяцев
      $scope.report.filter(x => x.tip === "month").forEach(x => x.visible = 1);
      // 
      // и Всего
      $scope.report.find(x => x.tip === "year").visible = 1;

      $scope.global.hideWaitingForm();

    }, function getReportMarketingFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

  };


  // расчет среднего при выборе строки
  $scope.checkboxClick = function checkboxClick() {

    // элементы с проставленной галочкой
    var selectedAr = $scope.report.filter(x => x.checked === 1);
    
    // сколько выбрано позиций
    var cnt = selectedAr.length;

    // расчёт Среднее
    for (var item in $scope.report[0]) {
      if (cnt > 0) {
        $scope.sr[item] = (selectedAr.reduce((p, c) => { return p + c[item]; }, 0) / cnt).toFixed(2);
      } else {
        $scope.sr[item] = 0;
      }
    }

  };


  // при изменении года
  $scope.yearChanged = function yearChanged() {

    $scope.refresh();

  };


  // при нажатии "+" рядом с годом
  $scope.btnYearExpandClick = function btnYearExpandClick(item) {
    
    // нажать можно по строке с месяцем и неделей
    // если нажали по строке с месяцем надо показать
    // все недели этого месяца, а если по недели нажали,
    // то все дни этой недели
    if (item.tip === "month") {
      $scope.report.filter(x => x.tip === "week" && x.month_number === item.month_number)
                   .forEach(x => {

                     x.visible = 1 - (x.visible || 0);

                     // если неделя скрывается, то надо скрыть ещё все
                     // отображённые дни этой недели
                     if (x.visible === 0) {
                       $scope.report.filter(y => y.tip === "day" && y.week_number === x.week_number)
                                    .forEach(y => y.visible = 0)
                     }

                   })
      ;
    } else if (item.tip === "week") {
      $scope.report.filter(x => x.tip === "day" &&
                           x.month_number === item.month_number &&
                           x.week_number === item.week_number)
                   .forEach(x => x.visible = 1 - (x.visible || 0))
      ;
    }


    // при нажатии кнопки "+" делаю надпись "-" и наоборот
    if ((item.buttonCaption || "+") === "+") {
      item.buttonCaption = "-";
    } else {
      item.buttonCaption = "+";
    }

  };


});