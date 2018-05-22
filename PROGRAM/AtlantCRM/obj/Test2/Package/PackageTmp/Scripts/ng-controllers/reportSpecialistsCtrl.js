"use strict"

//контроллер
reportSpecialistsCtrl = myApp.controller("reportSpecialistsCtrl", function reportSpecialistsCtrl($scope, $http) {

  $scope.modes = ["Общая", "Контакты", "Друзья", "По сотруднику"];
  $scope.currentMode = "Общая";
  
  //в качестве последней даты ставим текущий день
  $scope.toDate = new Date();
  //в качестве первой начало текущего месяца
  $scope.fromDate = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);

  //обновить (перестроить отчет)
  $scope.btnChangeSeansClick = function btnChangeSeansClick(e) {
    $scope.global.showWaitingForm("Формирование отчета ...");

    $http({
      method: "GET",
      url: "/Home/GetReportSpecailists",
      params: {
        fromDate: $scope.fromDate,
        toDate: $scope.toDate
      }
    }).then((data) => {
      $scope.report = data.data;
      if ($scope.selectedSpecialist == null && $scope.report.length > 0) {
      	$scope.selectedSpecialist = $scope.report[0].USERID;
      }
      $scope.global.hideWaitingForm();
    }, (err) => {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  };

  //подсчет итогов
  
  $scope.getSumFriends = () => {
    if ($scope.report == null) {
      return "";
    }
    else {
      return $scope.report.reduce((p, c) => {
        if ($scope.filterFn(c)) {
          return p + c.FRIENDS
        }
        else {
          return p;
        }
      }, 0)
    }
  };
  
  $scope.getSumAnkets = () => {
    if ($scope.report == null) {
      return "";
    }
    else {
      return $scope.report.reduce((p, c) =>{
        if ($scope.filterFn(c)) {
          return p + c.ANKETS
        }
        else {
          return p;
        }
      }, 0)
    }
  };
  
  $scope.getSumDialog = () => {
    if ($scope.report == null) {
      return "";
    }
    else {
      return $scope.report.reduce((p, c) =>{
        if ($scope.filterFn(c)) {
          return p + c.DIALOG
        }
        else {
          return p;
        }
      }, 0)
    }
  };

  $scope.getSumKontacts = () => {
    if ($scope.report == null) {
      return "";
    }
    else {
      return $scope.report.reduce((p, c) => {
        if ($scope.filterFn(c)) {
          return p + c.KONTACTS
        }
        else {
          return p;
        }
      }, 0)
    }
  };

  $scope.getSumCame = () => {
    if ($scope.report == null) {
      return "";
    }
    else {
      return $scope.report.reduce((p, c) =>{
        if ($scope.filterFn(c)) {
          return p + c.CAME
        }
        else {
          return p;
        }
      }, 0)
    }
  };

  $scope.getSumNotCame = () => {
    if ($scope.report == null) {
      return "";
    }
    else {
      return $scope.report.reduce((p, c) => {
        if ($scope.filterFn(c)) {
          return p + c.NOT_CAME
        }
        else {
          return p;
        }
      }, 0)
    }
  };

  $scope.getAvgPercent = () => {
    if ($scope.report == null) {
      return "";
    }
    else {

      var i;
      var summ = 0;
      var count = 0;
      for (i = 0; i < $scope.report.length; i++) {
        if ($scope.filterFn($scope.report[i]) && $scope.report[i].PERCENT > 0) {
          summ = summ + $scope.report[i].PERCENT;
          count = count + 1;
        }
      }

      if (count > 0) {
        return (summ / count).toFixed(0);
      }
      else {
        return 0;
      }
    }
  };

  $scope.getSumBuy = () => {
    if ($scope.report == null) {
      return "";
    }
    else {
      return $scope.report.reduce((p, c) => {
        if($scope.filterFn(c)){
          return p + c.BUY
        }
        else {
          return p;
        }
      }, 0)
    }
  };

  //проверка на необходимость отображения строки
  $scope.filterFn = function (item) {
    
    if ($scope.currentMode == "Общая") {
      return true;
    }

    var checkedUSERID = item.USERID;
    if ($scope.currentMode == "По сотруднику") {
      if ($scope.selectedSpecialist == checkedUSERID) {
        return true;
      } else {
        return false;
      }
    }

    var i;

    if ($scope.currentMode == "Контакты") {
      for (i = 0; i < $scope.report.length; i++) {
        if ($scope.report[i].USERID == checkedUSERID) {
          if ($scope.report[i].KONTACTS > 0) {
            return true;
          }
          else {
            return false;
          }
        }
      }
    }

    if ($scope.currentMode == "Друзья") {
      for (i = 0; i < $scope.report.length; i++) {
        if ($scope.report[i].USERID == checkedUSERID) {
          if ($scope.report[i].FRIENDS > 0) {
            return true;
          }
          else {
            return false;
          }
        }
      }
    }
  }

});