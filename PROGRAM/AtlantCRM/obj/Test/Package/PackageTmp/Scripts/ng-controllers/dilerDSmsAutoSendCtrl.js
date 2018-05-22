"use strict";

// контроллер
myApp.controller("dilerDSmsAutoSendCtrl", function dilerDSmsAutoSendCtrl($scope, $http) {

  // ид шаблона по умолчанию
  $scope.M_SMS_TEMPLATE_TYPE_ID = 1;
  // берем первый
  if ($scope.global.manual.M_SMS_TEMPLATE_TYPE != null) {
    $scope.M_SMS_TEMPLATE_TYPE_ID = $scope.global.manual.M_SMS_TEMPLATE_TYPE[0]["ID"];
  }

  $scope.template = {};

  // событие при открытии вкладки
  $scope.$on("global.selectedDilerDSubMenuItemChanged", function selectedDilerDSubMenuItemChanged(event, newValue) {
    if (newValue === 2) {
      $scope.refreshData();
    }
  });

  // запрос данных шаблона
  $scope.refreshData = function refreshData() {
    $scope.template = {};
    $http({
      method: "GET",
      url: "/Home/GetTemplateData",
      params: {
        ID: $scope.M_SMS_TEMPLATE_TYPE_ID
      }
    }).then(function getTemplateDataSuccess(data) {

      $scope.template = data.data;
      if (data.data == null) {
        $scope.template = {};
        $scope.template.ID = 0;
        $scope.template.M_SMS_TEMPLATE_TYPE_ID = $scope.M_SMS_TEMPLATE_TYPE_ID;
        $scope.template.SOOB = null;
        $scope.template.M_ORG_ID = $scope.global.userContext.M_ORG_ID;
      }
      $scope.global.hideWaitingForm();

    }, function getTemplateDataFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.getSmsTemplate = function getSmsTemplate() {
    $scope.refreshData();
  }

  // сохранить галочку "Активировать СМС рассылку"
  $scope.setSmsAutoSend = function setSmsAutoSend() {
    $http({
      "method": "POST",
      "url": "/Home/SaveNastrData",
      data: { n: $scope.global.manual.O_NASTR[0] }
    }).then(function saveNastrDataSuccess(data) {

      // перезапросим справочник в клиент
      $scope.global.refreshManual("O_NASTR").then(function refreshManualComplete() {
        $scope.global.hideWaitingForm();
      });

    }, function saveNastrDataFailed(err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  }

  $scope.saveData = function saveData() {

    $scope.global.showWaitingForm("Сохранение настроек...");

    $http({
      "method": "POST",
      "url": "/Home/SaveSmsTemplateData",
      data: { t: $scope.template }
    }).then(function saveDataSuccess(data) {
      $scope.refreshData();
      $scope.global.hideWaitingForm();

    }, function saveDataFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

});