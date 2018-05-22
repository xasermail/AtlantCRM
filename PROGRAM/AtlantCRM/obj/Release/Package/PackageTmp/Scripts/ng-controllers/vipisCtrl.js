"use strict";

// контроллер
myApp
// директива для обработки выбора файла для <input type="file" />
.directive("fileModel", ["$parse", function ($parse) {
  return {
    restrict: "A",
    link: function (scope, element, attrs) {

      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind("change", function () {
        
        // больше 10 мегабайт нельзя
        if (element[0].files[0].size / 1024 / 1024 > 10) {
          scope.global.showErrorAlert("Нельзя загрузить файл размером больше 10 мегабайт");
          return;
        }

        scope.$apply(function () {
          modelSetter(scope, element[0].files[0]);
        });
      });

    }
  }
}])
.controller("vipisCtrl", function vipisCtrl($scope, $http, $parse, $sce) {

  // выбранные улучшения в виде массива объектов типа M_ZABOL
  $scope.selectedUluch = [];

  // событие при открытии вкладки
  $scope.$on("global.selectedSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == "4") {
      $scope.refresh();
    }

  });


  $scope.refresh = function refresh() {

    $scope.global.showWaitingForm("Получение выписки...");

    $http({
      "method": "GET",
      "url": "/Home/GetVipiski",
      params: {
        O_ANK_ID: $scope.global.ank.ID
      }
    }).then((data) => {

      $scope.O_VIPIS_ID = data.data.O_VIPIS_ID;
      $scope.M_ZABOL_GROUP_ID = data.data.M_ZABOL_GROUP_ID;
      $scope.ZABOL_TEXT = data.data.ZABOL_TEXT;
      $scope.ULUCH_TEXT = data.data.ULUCH_TEXT;
      $scope.D_ULUCH = data.data.D_ULUCH;

      $scope.LINK = data.data.LINK;
      $scope.YOUTUBE_URL = "";
      $scope.setVideo($scope.LINK);

      $scope.selectedUluch = [];
      data.data.oVipisUluch.forEach(x => {
        $scope.selectedUluch.push($scope.global.manual.M_ZABOL.find(y => y.ID == x));
      });

      return $http({
        "method": "GET",
        "url": "/Home/GetVipisZabolFiles",
        params: {
          O_VIPIS_ID: $scope.O_VIPIS_ID
        }
      });
      
    }).then((data) => {

      $scope.zabolFiles = data.data;

      return $http({
        "method": "GET",
        "url": "/Home/GetVipisUluchFiles",
        params: {
          O_VIPIS_ID: $scope.O_VIPIS_ID
        }
      });

    }).then((data) => {

      $scope.uluchFiles = data.data;
      $scope.global.hideWaitingForm();

    }).catch((err) => {

      $scope.global.showErrorAlert("Ошибка: " + JSON.stringify(err.data));
      $scope.global.hideWaitingForm();

    });
    
  };


  $scope.dobInf = function dobInf() {

    $scope.global.showWaitingForm("Сохранение выписки...");

    var vipis = {};
    vipis.O_VIPIS_ID = $scope.O_VIPIS_ID;
    vipis.O_ANK_ID = $scope.global.ank.ID;
    vipis.M_ZABOL_GROUP_ID = $scope.M_ZABOL_GROUP_ID;
    vipis.ZABOL_TEXT = $scope.ZABOL_TEXT;
    vipis.ULUCH_TEXT = $scope.ULUCH_TEXT;
    vipis.LINK = $scope.LINK;

    vipis.oVipisUluch = [];
    $scope.selectedUluch.forEach(item => vipis.oVipisUluch.push(item.ID));
    vipis.D_ULUCH = $scope.D_ULUCH;

    var fd = new FormData();
    if ($scope.zabolFotoVideo != null) {
      fd.append("zabolFiles", $scope.zabolFotoVideo);
    }
    if ($scope.zabolDobFile != null) {
      fd.append("zabolFiles", $scope.zabolDobFile);
    }
    if ($scope.uluchFotoVideo != null) {
      fd.append("uluchFiles", $scope.uluchFotoVideo);
    }
    if ($scope.uluchDobFile != null) {
      fd.append("uluchFiles", $scope.uluchDobFile);
    }

    // даже если ничего нет для передачи, параметры передаю
    if (fd.get("zabolFiles") == null) {
      fd.append("zabolFiles", null);
    }
    if (fd.get("uluchFiles") == null) {
      fd.append("uluchFiles", null);
    }

    $http({
      "method": "POST",
      "url": "/Home/VipisSaveInfo",
      data: {
        vipis: vipis
      }
    }).then(function (data) {

      // идентификатор созданной Выписки
      fd.append("O_VIPIS_ID", data.data.O_VIPIS_ID);
      
      return $http({
        "method": "POST",
        "url": "/Home/VipisSaveFiles",
        transformRequest: angular.identity,
        headers: {
          "Content-Type": undefined
        },
        data: fd
      }).then(function () {
       
        // после отправки файлов сбрасываю загруженные файлы
        $scope.zabolFotoVideo = null;
        $scope.zabolDobFile = null;
        $scope.uluchFotoVideo = null;
        $scope.uluchDobFile = null;

        $scope.global.hideWaitingForm();

      }).catch(function (err) {

        $scope.global.showErrorAlert("Ошибка: " + JSON.stringify(err.data));
        $scope.global.hideWaitingForm();

      });

    }).then((data) => {

      // после сохранения переполучаю данные режима
      $scope.refresh();

    }).catch((err) => {

      $scope.global.showErrorAlert("Ошибка: " + JSON.stringify(err.data));
      $scope.global.hideWaitingForm();

    });

  };


  // при нажатии на кнопку "Скачать файлы" Заболеваний
  $scope.btnZabolFilesClick = function btnZabolFilesClick() {
    $scope.zabolFilesShow = true;
  };

  // при нажатии на кнопку "x" списка файлов Заболеваний
  $scope.btnZabolFilesCloseClick = function btnZabolFilesCloseClick() {
    $scope.zabolFilesShow = false;
  };


  // при нажатии на кнопку "Скачать файлы" Улучшений
  $scope.btnUluchFilesClick = function btnUluchFilesClick() {
    $scope.uluchFilesShow = true;
  };

  // при нажатии на кнопку "x" списка файлов Улучшений
  $scope.btnUluchFilesCloseClick = function btnUluchFilesCloseClick() {
    $scope.uluchFilesShow = false;
  };

  // преобразует ссылку с youtube в формат iframe
  $scope.setVideo = function setVideo(link) {
    if (link != null) {
      link = link.replace("https://www.youtube.com/watch?v=", "");
      link = link.replace("https://youtu.be/", "");
      $scope.YOUTUBE_URL = $sce.trustAsResourceUrl("https://www.youtube.com/embed/" + link);
    } else {
      $scope.YOUTUBE_URL = "";
    }
  }

});