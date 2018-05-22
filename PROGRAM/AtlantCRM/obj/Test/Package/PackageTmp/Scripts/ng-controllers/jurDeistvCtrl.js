"use strict";

// контроллер
myApp.controller("jurDeistvCtrl", function jurDeistvCtrl($scope, $http, $timeout) {

  var i = 0;

  $scope.deistv = {};

  $scope.deistv.S_USER_ID = null;
  $scope.deistv.M_DEISTV_ID = null;
  $scope.deistv.DATE_FROM = new Date();
  $scope.deistv.DATE_TO = new Date();
  $scope.deistv.SUBSTR = null;

  // событие при открытии вкладки
  $scope.$on("global.selectedJurSubMenuItemChanged", function selectedJurSubMenuItemChanged(event, newValue) {

    if (newValue === 0) {
      refreshDeistv();
    }

  });

  function refreshDeistv() {
    $scope.global.showWaitingForm("Получение данных журнала...");
    $scope.s_user = [];
    $scope.m_deistv = [];
    $scope.data = [];

    $scope.s_user.push({
      ID: null,
      FIO: "Все пользователи"
    });

    $scope.m_deistv.push({
      ID: null,
      NAME: "Все действия"
    });

    if (typeof $scope.global.manual.S_USER !== "undefined") {
      for (var i = 0; i < $scope.global.manual.S_USER.length; i++) {
        if ($scope.global.manual.S_USER[i]["M_ORG_ID"] === $scope.global.userContext.M_ORG_ID) {
          $scope.s_user.push({
            ID: $scope.global.manual.S_USER[i]["ID"],
            FIO: $scope.global.manual.S_USER[i]["FIO"]
          });
        }
      }
    }

    if (typeof $scope.global.manual.M_DEISTV !== "undefined") {
      for (var i = 0; i < $scope.global.manual.M_DEISTV.length; i++) {
        $scope.m_deistv.push({
          ID: $scope.global.manual.M_DEISTV[i]["ID"],
          NAME: $scope.global.manual.M_DEISTV[i]["NAME"]
        });
      }
    }

    $http({
      method: "GET",
      url: "/Home/GetDeistvData",
      params: $scope.deistv
    }).then(function jurDeistvSuccess(data) {
      $scope.data = data.data;

      if (typeof data.data === "undefined") {
        $scope.data = [];
        $scope.data.push({
          MESS: ""
        });
      }

      $scope.global.hideWaitingForm();
    }, function jurDeistvFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.refreshData = function refreshData() {
    refreshDeistv();
  }

  $scope.openDialogRej = function openDialogRej(O_ANK_ID) {
    $scope.global.openAnk(O_ANK_ID);
    $scope.global.openAnkDone = () => {
      $timeout(() => {
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.selectedSubMenuItem = 2;
      }, 10);
    };
  };

  $scope.openZvonokRej = function openZvonokRej(O_ANK_ID) {
    $scope.global.openAnk(O_ANK_ID);
    $scope.global.openAnkDone = () => {
      $timeout(() => {
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.selectedSubMenuItem = 6;
      }, 10);
    };
  };

  $scope.btnExecUvedomlClick = function btnExecUvedomlClick(uvedoml) {
    //выполнить уведомление
  }

  $scope.changeUvedoml = function changeUvedoml(uvedoml) {
    //отредактировать уведомление
  }

  $scope.openCall = function openCall(uvedoml) {
  //осуществить звонок и сделать увелдомление отмеченным
  }
});