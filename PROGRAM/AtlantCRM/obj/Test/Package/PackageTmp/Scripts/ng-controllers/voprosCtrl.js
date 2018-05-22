"use strict";

// контроллер
myApp.controller("voprosCtrl", function voprosCtrl($scope, $http) {

  $scope.addTab = {};
  $scope.addTab.showSave = 0;
  $scope.addTab.M_VOPROS_TAB_ID = 0; // для привязки Ид вкладки к вопросу
  $scope.addTab.M_VOPROS_ID = 0;
  $scope.addTab.activeTabId = 0;
  $scope.addTab.ID = 0;
  var i = 0;
  var j = 0;

  // событие при открытии вкладки
  $scope.$on("global.selectedSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {
    if (newValue == "3") {
      refresh();
    }
  });


  function refresh() {
    $scope.submenu = [];
    $scope.vopros = [];
    $scope.data = [];
    $scope.addTab.showSave = 0;

    if (typeof $scope.global.manual.M_VOPROS_TAB !== "undefined") {
      for (var i = 0; i < $scope.global.manual.M_VOPROS_TAB.length; i++) {

        if (i === 0) $scope.addTab.activeTabId = $scope.global.manual.M_VOPROS_TAB[i]["ID"];

        $scope.submenu.push({
          ID: $scope.global.manual.M_VOPROS_TAB[i]["ID"],
          NAME: $scope.global.manual.M_VOPROS_TAB[i]["NAME"]
        });

        // отображаем вкладку сохранить
        $scope.addTab.showSave = 1;
      }
    }

    if (typeof $scope.global.manual.M_VOPROS !== "undefined") {
      for (var i = 0; i < $scope.global.manual.M_VOPROS.length; i++) {
        if (i === 0) $scope.addTab.M_VOPROS_ID = $scope.global.manual.M_VOPROS[i]["ID"];
      }
    }

    // если не заполнена таблица вопросов - выходим, чтобы не плодить ошибки
    if ($scope.addTab.M_VOPROS_ID === 0) {
      $scope.global.hideWaitingForm();
      $scope.global.showErrorAlert("Не заполнен справочник вопросов!");
      return false;
    }

    $scope.global.showWaitingForm("Получение данных...");

    // выбрана первая вкладка
    $scope.selectedMenuItem = 0;

    // запрашиваем данные вопросов
    $http({
      method: "GET",
      url: "/Home/GetAnkVoprosy",
      params: { ID: $scope.global.ank.ID }
    }).then(function voprosSuccess(data) {

      $scope.vopros = data.data;
      if (typeof $scope.vopros !== "undefined") {
        if ($scope.vopros.length !== 0) {
          if ($scope.vopros[0].ID === -1) {
            $scope.addTab.ID = -2;
          }
        }
      }

      $scope.global.hideWaitingForm();

    }, function voprosFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  // переход со вкладки на вкладку
  $scope.selectItem = function (index) {
    $scope.selectedMenuItem = index;
    $scope.addTab.activeTabId = $scope.submenu[index].ID;

    // нет ни одной записи для этой вкладки
    if (typeof $scope.vopros !== "undefined") {
      var a = $scope.vopros.find(x => x.M_VOPROS_TAB_ID == $scope.submenu[index].ID);
      if (typeof a === "undefined") {
        addVopros($scope.submenu[index].ID);
      }
    }
  }

  // нажали "Добавить вкладку"
  $scope.addTabClickHandler = function addTabClickHandler(e) {
    var elem = e.currentTarget;

    $scope.addTab.left = $(elem).offset().left;
    var w = document.body.clientWidth;

    //если выходим за пределы экрана
    if ($scope.addTabLeft > w) {
      $scope.addTabLeft = $scope.addTabLeft - ($scope.addTabLeft - w) - 10;
    }

    $scope.addTab.top = $(elem).offset().top - 80;
    $scope.addTab.height = 65;
    $scope.addTab.show = 1;
  }

  // отменили добавление вкладки
  $scope.addTabClose = function addTabClose() {
    $scope.addTab.show = 0;
  }

  // добавим вкладку
  $scope.addTabOk = function addTabOk() {
    if ((typeof $scope.addTab.name === "undefined") || ($scope.addTab.name === "")) return false;

    // все новые записи имеют Ид < 0
    $scope.addTab.M_VOPROS_TAB_ID--;
    $scope.submenu.push({
      ID: $scope.addTab.M_VOPROS_TAB_ID,
      NAME: $scope.addTab.name.charAt(0).toUpperCase() + $scope.addTab.name.substr(1)
    });

    $scope.selectedMenuItem = $scope.submenu.length - 1;
    $scope.addTab.show = 0;
    $scope.addTab.showSave = 1;
    $scope.addTab.activeTabId = $scope.addTab.M_VOPROS_TAB_ID;
    addVopros($scope.submenu[$scope.selectedMenuItem].ID);
  }

  // добавляем строку вопроса с Ид вкладки
  function addVopros(ID) {
    $scope.addTab.ID--;
    $scope.vopros.push({
      ID: $scope.addTab.ID,
      O_ANK_ID: $scope.global.ank.ID,
      M_YES_NO_ID: 2, // нет
      M_VOPROS_ID: $scope.addTab.M_VOPROS_ID,
      M_VOPROS_TAB_ID: ID
    });

    $scope.addTab.showSave = 1;
  }

  $scope.add = function add(index) {
    $scope.addTab.ID--;
    $scope.vopros.push({
      ID: $scope.addTab.ID,
      O_ANK_ID: $scope.global.ank.ID,
      M_YES_NO_ID: 2, // нет
      M_VOPROS_ID: $scope.addTab.M_VOPROS_ID,
      M_VOPROS_TAB_ID: $scope.submenu[$scope.selectedMenuItem].ID
    });

    $scope.addTab.showSave = 1;
  }

  $scope.remove = function remove(id) {
    var d = $scope.vopros.find(x => x.ID === id);
    if (typeof d !== "undefined") {
      var index = $scope.vopros.indexOf(d);
      $scope.vopros.splice(index, 1);
    }
  }

  $scope.saveVopros = function saveVopros() {
    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/SaveAnkVoprosy",
      data: {
        t: $scope.submenu,
        v: $scope.vopros,
        o_ank_id: $scope.global.ank.ID
      }
    }).success(function (data) {
      // перезапросим справочник в клиент
      $scope.global.refreshManual("M_VOPROS_TAB").then(function refreshManualComplete() {
        refresh();
      });
    }).error(function (err) {
      $scope.global.hideWaitingForm();
      $scope.global.showErrorAlert(err);
    });
  }
});