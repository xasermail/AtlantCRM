"use strict";

var scopeReportDayCtrl;

//контроллер
reportDayCtrl = myApp.controller("reportDayCtrl", function reportDayCtrl($scope, $http) {

  scopeReportDayCtrl = $scope;

    //минимальное значение для того чтобы считать строку хорошей
    var MIN_VALUE_GOOD_ROW = 81;
    //максимальное значение для того чтобы считать строку плохой
  var MAX_VALUE_BAD_ROW = 56;

    //сегодняшняя дата без времени
    $scope.dayOfFormation = new Date(new Date().setHours(0, 0, 0, 0));

    $scope.dayOfFormationChangeHandler = function dayOfFormationChangeHandler() {
        $scope.refreshReport();
    };

    //обновить (перестроить) отчет
    $scope.refreshReport = function refreshReport(){
        $scope.global.showWaitingForm("Формирование отчета ...");

        $http({
            method: "GET",
            url: "/Home/GetReportDay",
            params: {
                M_ORG_ID: $scope.global.userContext.M_ORG_ID,
                dayOfFormation: $scope.dayOfFormation
            }
        }).then((data) => {
            $scope.report = data.data.Data;
            $scope.statCount = data.data.CountState;
            $scope.DifferentForTommorow = data.data.DifferentForTommorow;
            $scope.DifferentForYesterday = data.data.DifferentForYesterday;
            $scope.global.hideWaitingForm();
        }, (err) => {
            $scope.global.showErrorAlert(err.data);
            $scope.global.hideWaitingForm();
        });
    };

    $scope.$on("global.selectedReportSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

        if (newValue == 0) {
          //// прячем настройки
          //$scope.global.pravoNaSpravRej = 0;
          //$scope.global.selectedMenuItem = newValue;

          $scope.refreshReport();
        }
    });

    //определяет что значение уменьшилось
    $scope.decreaseCount = function decreaseCount(c) {
        return c < 0;
    };

    //определяет что значение увеличилось
    $scope.increaseCount = function increaseCount(c) {
        return c > 0;
    };

    //определяем является ли строка хорошей
    $scope.goodRow = function goodRow(c) {
        return c >= MIN_VALUE_GOOD_ROW;
    }

    //определяем является ли строка плохой
    $scope.badRow = function barRow(c) {
      return c < MAX_VALUE_BAD_ROW;
    }

    //определяет является ли строка средней
    $scope.avgRow = function avgRow(c) {
      return !($scope.goodRow(c) || $scope.badRow(c));
    }

    
    //округляет число для вывода
    $scope.roundPercent = function roundPercent(c) {
      return Math.round(c * 100) / 100;
    }


    /////////////////////////////////////////////////////////////
    //////////////////подсчет итогов////////////////////////////
    //итог по колонке "Завтра"
    $scope.getSumDiferent = () => {
        if ($scope.report == null) {
            return "";
        }
        else {
          return $scope.report.reduce((p, c) => { return p + c.RecordForTommorrow }, 0)
        }
    };

    //итог по колонке Новых
    $scope.getSumNew = () => {
        if ($scope.report == null) {
            return "";
        }
        else {
            return $scope.report.reduce((p, c) => { return p + c.CountNew }, 0)
        }
    };

    //итог по колонке первый ряд
    $scope.getSumFirstRyad = () => {
        if ($scope.report == null) {
            return "";
        }
        else {
            return $scope.report.reduce((p, c) => { return p + c.FirstRyad }, 0)
        }
    };

    //итог по колонке второй ряд
    $scope.getSumSecondRyad = () => {
        if ($scope.report == null) {
            return "";
        }
        else {
            return $scope.report.reduce((p, c) => { return p + c.SecondRyad }, 0)
        }
    };

    //итог по колонке "Родненькие"
    $scope.getSumOld = () => {
        if ($scope.report == null) {
            return "";
        }
        else {
            return $scope.report.reduce((p, c) => { return p + c.CountOld }, 0)
        }
    };

    //итог по колонке "Сумма"
    $scope.getSumAll = () => {
        if ($scope.report == null) {
            return "";
        }
        else {
            return $scope.report.reduce((p, c) => { return p + c.CountAll }, 0)
        }
    };

    //итог по колонке "Наполн"
    $scope.getAvgNapoln = () => {
        //в случае если коллекция еще не создана или пуста просто пустая строка,
        //в противном случае вычитываем среднее арифметическое всех элементов
        if ($scope.report == null) {
            return "";
        }
        if ($scope.report.length == 0)
        {
            return 0;
        }

        var i;
        var summ = 0;
        var count = 0;
        for (i = 0; i < $scope.report.length; i++)
        {
          if ($scope.report[i].Napol > 0)
          {
            summ = summ + $scope.report[i].Napol;
            count = count + 1;
          }
        }
        
        if(count > 0){
          return (summ / count).toFixed(2);
        }
        else {
            return 0;
        }
    };

    //////////////отображение инфомации по людям////////////////////////
    //отвечает за отображение панели с детализацией
    $scope.data = { previewInfoShow: false };
    //отображение таблицы ФИО Телефон
    $scope.data = { firstType: false };
    //ФИО Телефон Время регистрации Время на рядах Кто общался на 1 ряду Кто общался на 2 ряду
    $scope.data = { secondType: false };
    

    //записались
    $scope.showRecord = function showRecord() {
        $scope.previewInfoShow = true;
        $scope.firstType = true;

        $scope.global.showWaitingForm("Получение списка записавшихся ...");

        $http({
            method: "GET",
            url: "/Home/GetListRecord",
            params: {
                M_ORG_ID: $scope.global.userContext.M_ORG_ID,
                dayOfFormation: $scope.dayOfFormation
            }
        }).then((data) => {
            $scope.firstTypeInfo = data.data;
            $scope.global.hideWaitingForm();
        }, (err) => {
            $scope.global.showErrorAlert(err.data);
            $scope.global.hideWaitingForm();
        });
    };

    //Пришли
    $scope.showCame = function showCame() {
        //debugger;
        $scope.previewInfoShow = true;
        $scope.firstType = true;

        $scope.global.showWaitingForm("Получение списка пришедших ...");

        $http({
            method: "GET",
            url: "/Home/GetListCame",
            params: {
                M_ORG_ID: $scope.global.userContext.M_ORG_ID,
                dayOfFormation: $scope.dayOfFormation
            }
        }).then((data) => {
            $scope.firstTypeInfo = data.data;
            $scope.global.hideWaitingForm();
        }, (err) => {
            $scope.global.showErrorAlert(err.data);
            $scope.global.hideWaitingForm();
        });
    };


    //не пришли
    $scope.showNoCame = function showNoCame() {
        $scope.previewInfoShow = true;
        $scope.firstType = true;

        $scope.global.showWaitingForm("Получение списка не пришедших ...");

        $http({
            method: "GET",
            url: "/Home/GetListNotCame",
            params: {
                M_ORG_ID: $scope.global.userContext.M_ORG_ID,
                dayOfFormation: $scope.dayOfFormation
            }
        }).then((data) => {
            $scope.firstTypeInfo = data.data;
            $scope.global.hideWaitingForm();
        }, (err) => {
            $scope.global.showErrorAlert(err.data);
            $scope.global.hideWaitingForm();
        });
    };

    //новенькие
    $scope.showNew = function showNew() {
        $scope.previewInfoShow = true;
        $scope.firstType = true;

        $scope.global.showWaitingForm("Получение списка новеньких ...");

        $http({
            method: "GET",
            url: "/Home/GetListNew",
            params: {
                M_ORG_ID: $scope.global.userContext.M_ORG_ID,
                dayOfFormation: $scope.dayOfFormation
            }
        }).then((data) => {
            $scope.firstTypeInfo = data.data;
            $scope.global.hideWaitingForm();
        }, (err) => {
            $scope.global.showErrorAlert(err.data);
            $scope.global.hideWaitingForm();
        });
    };
    
    //Ушли и не записались
    $scope.showNotRecord = function showNotRecord() {
        $scope.previewInfoShow = true;
        $scope.secondType = true;

        $scope.global.showWaitingForm("Получение списка ушедших и не записавшихся ...");

        $http({
            method: "GET",
            url: "/Home/GetListNotRecord",
            params: {
                M_ORG_ID: $scope.global.userContext.M_ORG_ID,
                dayOfFormation: $scope.dayOfFormation
            }
        }).then((data) => {
            $scope.secondTypeInfo = data.data;
            $scope.global.hideWaitingForm();
        }, (err) => {
            $scope.global.showErrorAlert(err.data);
            $scope.global.hideWaitingForm();
        });
    }; 
    
    //не зарегистировались
    $scope.showNotReg = function showNotReg() {
        $scope.previewInfoShow = true;
        $scope.threeType = true;

        $scope.global.showWaitingForm("Получение списка не зарегистированных ...");

        $http({
            method: "GET",
            url: "/Home/GetListNotReg",
            params: {
                M_ORG_ID: $scope.global.userContext.M_ORG_ID,
                dayOfFormation: $scope.dayOfFormation
            }
        }).then((data) => {
            $scope.threeTypeInfo = data.data;
            $scope.global.hideWaitingForm();
        }, (err) => {
            $scope.global.showErrorAlert(err.data);
            $scope.global.hideWaitingForm();
        });
    };

    $scope.goBack = function goBack() {
        $scope.previewInfoShow = false;
        $scope.firstType = false;
        $scope.secondType = false;
        $scope.threeType = false;
    }

    $scope.infoPrint = function infoPrint(strid) {
        var prtContent = document.querySelector("#reportDay #" + strid);
        var prtCSS = "";
        var WinPrint = window.open('', '', 'left=100,top=50,width=800,height=640,toolbar=0,scrollbars=1,status=0');

        var print = document.createElement("div");
        print.className = "contentpane";
        print.setAttribute("id", "print");
        print.appendChild(prtContent.cloneNode(true));
        WinPrint.document.body.appendChild(print);
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    }
});

