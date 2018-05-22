"use strict";

//контроллер
myApp.controller("tehOtdelCtrl", function tehOtdelCtrl($scope, $http) {
  
  var i = 0;
  var j = 0;
  $scope.teh = {};
  $scope.teh.TEXT = "";
  $scope.teh.show = 0;
  $scope.item = {};

  $scope.$on("global.userContextLoaded", function userContextLoaded() {
    if (typeof $scope.global.manual.M_ORG !== "undefined") {
      for (var i = 0; i < $scope.global.manual.M_ORG.length; i++) {
        if ($scope.global.manual.M_ORG[i]["M_ORG_ID_TEH_OTDEL"] === $scope.global.userContext.M_ORG_ID) {
          $scope.teh.M_ORG_ID_TEH_OTDEL = $scope.global.manual.M_ORG[i]["ID"];
          break;
        }
      }
    }

    $scope.getData();
  });

  $scope.getData = function getData() {
    $scope.global.showWaitingForm("Получение данных...");
    $http({
      method: "GET",
      url: "/Home/GetTehOtdelData",
      params: {
        M_ORG_ID: $scope.teh.M_ORG_ID_TEH_OTDEL,
        TEXT: $scope.teh.TEXT
      }
    }).then((data) => {
      
      $scope.tehotdel = [];
      $scope.stat = [];

      $scope.tehotdel = data.data;

      if (typeof $scope.global.manual.M_SERVICE_TYPE !== "undefined") {
        for (var i = 0; i < $scope.global.manual.M_SERVICE_TYPE.length; i++) {
          var cnt = 0;
          if (typeof data.data !== "undefined") {
            for (var j = 0; j < data.data.length; j++) {
              
              if (($scope.global.manual.M_SERVICE_TYPE[i]["ID"] === data.data[j]["M_SERVICE_TYPE_ID"]) && 
                  (data.data[j]["M_SERVICE_TYPE_ID_TEH_OTDEL"] !== $scope.global.const.M_SERVICE_TYPE_ID_SDELAL)) {
                cnt++;
              }
            }
          }

          if ($scope.global.manual.M_SERVICE_TYPE[i]["ID"] !== $scope.global.const.M_SERVICE_TYPE_ID_SDELAL) {
            $scope.stat.push({
              NAME: $scope.global.manual.M_SERVICE_TYPE[i]["NAME"] + " " + cnt
            });
          }
        }
      }

      $scope.global.hideWaitingForm();

    }, (err) => {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  $scope.getDataOrg = function getDataOrg() {
    $scope.teh.TEXT = "";
    $scope.getData();
  }

  $scope.editRow = function editRow(item) {
    $scope.item = {};
    $scope.item = item;

    if (typeof $scope.global.manual.M_ORG !== "undefined") {
      var d = $scope.global.manual.M_ORG.find(x => x["ID"] === item["M_ORG_ID"]);
      if (typeof d !== "undefined") {
        $scope.item.ADRES = d.ADRES;
        $scope.item.PHONE = d.PHONE;
      }
    }

    $scope.item.PRODUCT_PHOTO = "/Home/GetServiceProductPhoto/" + item.ID;
    $scope.item.GUARANTEE_PHOTO = "/Home/GetServiceGuaranteePhoto/" + item.ID;
    $scope.item.PRODUCT_CHECK = "/Home/GetServiceCheckPhoto/" + item.ID;
    $scope.item.PHOTO_SIZE = "width: 123px; height: 123px";
    $scope.teh.show = 1;
  }

  $scope.closeForm = function closeForm() {
    $scope.item = {};
    $scope.teh.show = 0;
  }

  $scope.saveForm = function saveForm() {
    $scope.teh.show = 0;
    $scope.global.showWaitingForm("Сохранение данных...");

    $scope.item.PRODUCT_PHOTO = null;
    $scope.item.GUARANTEE_PHOTO = null;
    $scope.item.PRODUCT_CHECK = null;
    $scope.item.PHOTO_SIZE = "";

    $http({
      "method": "POST",
      "url": "/Home/SaveTehOtdel",
      data: {
        s: $scope.item
      }
    }).success(function (data) {
      $scope.global.hideWaitingForm();
      $scope.item = {};
      $scope.teh.show = 0;
      $scope.getData();
    }).error(function (err) {
      $scope.teh.show = 0;
      $scope.global.hideWaitingForm();
      $scope.global.showErrorAlert(err);
    });
  }

});