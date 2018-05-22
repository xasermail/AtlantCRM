"use strict";

// контроллер
serviceCtrl = myApp.controller("serviceCtrl", function serviceCtrl($scope, $http) {
  
  // сбрасывается, если выбрана новая анкета
  var loaded = false;
  // для подгонки фото по div'у
  var size = "width: 123px; height: 120px";

  // если выбрали новую анкету, сбрасываю признак открытия режима
  $scope.$on("openAnk", function selectedSubMenuItemChanged(event, newValue) {
    loaded = false;
  });

  // если нажали на подвкладку "Новый", то создаётся новая Анкета,
  // сбрасываю признак открытия режима
  $scope.$on("menuItemNewClick", () => {
    loaded = false;
  });

  // событие при открытии вкладки
  $scope.$on("global.selectedSubMenuItemChanged", function selectedSubMenuItemChanged(event, newValue) {
    if (newValue == "8" && loaded === false) {
      // перезапрашиваю данные
      $scope.refreshService();
      loaded = true;
    }
  });


  $scope.refreshService = function refreshService() {
    $scope.EmptyPhoto = "/Content/img/u4.png";
    $scope.PhotoProductSize = "";
    $scope.PhotoProductGuaranteeSize = "";
    $scope.PhotoProductCheckSize = "";
    $scope.currentFile = "";
    $scope.o_service = [];

    // получаем данные
    $http({
      method: "GET",
      url: "/Home/GetServiceData",
      params: { id: $scope.global.ank.ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      for (var i = 0; i < data.length; i++) {
        $scope.o_service.push({
          id: data[i].ID,
          o_ank_id: data[i].O_ANK_ID,
          m_service_type_id: data[i].M_SERVICE_TYPE_ID,
          m_product_id: data[i].M_PRODUCT_ID,
          serial_number: data[i].SERIAL_NUMBER,
          comment: data[i].COMMENT
        });

        $http({
          method: "GET",
          url: "/Home/GetProductPhoto",
          params: { id: $scope.o_service[0].id }
        }).success(function (data) {
          $scope.o_service[0].product_photo = data;
          $scope.PhotoProductSize = size;
          if (data.length === 0) {
            $scope.o_service[0].product_photo = $scope.EmptyPhoto;
            $scope.PhotoProductSize = "";
          }
        });

        $http({
          method: "GET",
          url: "/Home/GetProductGuarantee/",
          params: { id: $scope.o_service[0].id }
        }).success(function (data) {
          $scope.o_service[0].guarantee_photo = data;
          $scope.PhotoProductGuaranteeSize = size;
          if (data.length === 0) {
            $scope.o_service[0].guarantee_photo = $scope.EmptyPhoto;
            $scope.PhotoProductGuaranteeSize = "";
          }
        });

        $http({
          method: "GET",
          url: "/Home/GetProductCheck/",
          params: { id: $scope.o_service[0].id },
        }).success(function (data) {
          $scope.o_service[0].product_check = data;
          $scope.PhotoProductCheckSize = size;
          if (data.length === 0) {
            $scope.o_service[0].product_check = $scope.EmptyPhoto;
            $scope.PhotoProductCheckSize = "";
          }
        });
      }

      if (data.length === 0) {
        $scope.o_service.push({
          id: 0,
          o_ank_id: $scope.global.ank.ID,
          m_service_type_id: 1,
          m_product_id: 1,
          serial_number: "",
          product_photo: $scope.EmptyPhoto,
          guarantee_photo: $scope.EmptyPhoto,
          product_check: $scope.EmptyPhoto,
          comment: ""
        });

        $scope.PhotoProductSize = "";
        $scope.PhotoProductGuaranteeSize = "";
        $scope.PhotoProductCheckSize = "";
      }
    });
  }

  $scope.setFile = function (element, field) {
    $scope.currentFile = element.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
      if (field === "product") {
        $scope.o_service[0].product_photo = event.target.result;
        $scope.PhotoProductSize = size;
      }
      if (field === "guarantee") {
        $scope.o_service[0].guarantee_photo = event.target.result;
        $scope.PhotoProductGuaranteeSize = size;
      }
      if (field === "check") {
        $scope.o_service[0].product_check = event.target.result;
        $scope.PhotoProductCheckSize = size;
      }
      $scope.$apply();
    }

    reader.readAsDataURL(element.files[0]);
  }

  $scope.saveService = function saveService() {
    var d = {
      ID: $scope.o_service[0].id,
      O_ANK_ID: $scope.global.ank.ID,
      M_SERVICE_TYPE_ID: $scope.o_service[0].m_service_type_id,
      M_PRODUCT_ID: $scope.o_service[0].m_product_id,
      SERIAL_NUMBER: $scope.o_service[0].serial_number,
      COMMENT: $scope.o_service[0].comment
    };

    var productPhoto = "";
    if ($scope.o_service[0].product_photo !== $scope.EmptyPhoto) {
      productPhoto = $scope.o_service[0].product_photo.substring($scope.o_service[0].product_photo.indexOf(",") + 1);
    }

    var guaranteePhoto = "";
    if ($scope.o_service[0].guarantee_photo !== $scope.EmptyPhoto) {
      guaranteePhoto = $scope.o_service[0].guarantee_photo.substring($scope.o_service[0].guarantee_photo.indexOf(",") + 1);
    }

    var checkPhoto = "";
    if ($scope.o_service[0].guarantee_photo !== $scope.EmptyPhoto) {
      checkPhoto = $scope.o_service[0].product_check.substring($scope.o_service[0].product_check.indexOf(",") + 1);
    }

    $scope.global.showWaitingForm("Сохранение данных сервиса...");
    $http({
      "method": "POST",
      "url": "/Home/SaveService",
      data: { s: d, productPhoto: productPhoto, guaranteePhoto: guaranteePhoto, checkPhoto: checkPhoto }
    }).success(function (data) {
      $scope.refreshService();
      loaded = true;
      $scope.global.hideWaitingForm();
    });
  }
});
