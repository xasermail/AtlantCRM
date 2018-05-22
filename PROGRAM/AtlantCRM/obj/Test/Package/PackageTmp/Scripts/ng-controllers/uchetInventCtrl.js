"use strict";

// контроллер
myApp.controller("uchetInventCtrl", function uchetInventCtrl($scope, $http) {
  
  // для подгонки фото по div'у
  var size = "width: 123px; height: 120px";
  var emptyPhoto = "/Content/img/u4.png";
  $scope.inv_edit = {};
  $scope.editMode = 0;

  // для хранения base64
  $scope.before_photo = "";
  $scope.before_check_photo = "";

  $scope.before_photo_size = "";
  $scope.before_check_photo_size = "";

  $scope.photo = "";
  $scope.check_photo = "";

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetSubMenuItemChanged", function selectedSubMenuItemChanged(event, newValue) {

    if (newValue === 6) {
      $scope.refresh();
    }

  });

  // запрашиваем данные
  $scope.refresh = function refresh() {
    $scope.inv = [];
    $scope.global.showWaitingForm("Получение данных инвентаризации...");

    $http({
      "method": "GET",
      "url": "/Home/GetInventData"
    }).then(function uchetSkladSuccess(data) {
      var summa = 0;
      var kolvo = 0;

      var d = data.data;
      for (var i = 0; i < d.length; i++) {
        summa = summa + d[i]["COST"];
        kolvo = kolvo + d[i]["KOLVO"];

        // получаем изображения
        var photo = "/Home/GetInventPhoto/" + d[i]["ID"];
        var check_photo = "/Home/GetInventCheckPhoto/" + d[i]["ID"];
        var photo_size = "";
        var check_photo_size = "";

        if (d[i]["PHOTO_SIZE"] === 1) photo_size = size;
        if (d[i]["CHECK_PHOTO_SIZE"] === 1) check_photo_size = size;

        $scope.inv.push({
          ID: d[i]["ID"],
          NAME: d[i]["NAME"],
          KOLVO: d[i]["KOLVO"],
          COST: d[i]["COST"],
          INV_NUM: d[i]["INV_NUM"],
          IS_SPISAN: d[i]["IS_SPISAN"],
          COMMENT: d[i]["COMMENT"],
          PHOTO: photo,
          CHECK_PHOTO: check_photo,
          PHOTO_SIZE: photo_size,
          CHECK_PHOTO_SIZE: check_photo_size
        });
      }

      if (summa !== 0) {
        $scope.itogo = formatNumber(summa);
      }

      if (kolvo !== 0) {
        $scope.kolvo = kolvo;
      }

      $scope.global.hideWaitingForm();

    }, function uchetSkladFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });
  }

  // функция считывания файла фото
  $scope.setFile = function (element, field) {
    $scope.currentFile = element.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
      $scope.inv_edit[field] = event.target.result;

      if (field === "PHOTO") {
        $scope.inv_edit.PHOTO_SIZE = size;
        $scope.photo = event.target.result;
      }

      if (field === "CHECK_PHOTO") {
        $scope.inv_edit.CHECK_PHOTO_SIZE = size;
        $scope.check_photo = event.target.result;
      }

      $scope.$apply();
    }
    reader.readAsDataURL(element.files[0]);
  }

  // добавить элемент в таблицу
  $scope.addItem = function addItem() {
    $scope.inv_edit = {};
    $scope.inv_edit.KOLVO = 1;
    $scope.inv_edit.PHOTO = emptyPhoto;
    $scope.inv_edit.CHECK_PHOTO = emptyPhoto;
    $scope.inv_edit.ID = 0;
    $scope.editMode = 1;
  }

  // нажали отмена
  $scope.cancel = function cancel() {
    // возвращаем фото обратно
    $scope.inv_edit.PHOTO = $scope.before_photo;
    $scope.inv_edit.CHECK_PHOTO = $scope.before_check_photo;

    $scope.inv_edit.PHOTO_SIZE = $scope.before_photo_size;
    $scope.inv_edit.CHECK_PHOTO_SIZE = $scope.before_check_photo_size;

    $scope.editMode = 0;
    $scope.inv_edit = {};

    $scope.before_photo = "";
    $scope.before_check_photo = "";

    $scope.before_photo_size = "";
    $scope.before_check_photo_size = "";
    // нет выбранных фото
    $scope.photo = "";
    $scope.check_photo = "";
  }

  // изменить элемент в таблице
  $scope.editItem = function editItem(item, e) {
    if ($scope.global.function.noHavePravoWrite(8, 35)) return false;
    
    // сохраняем фото перед правкой, на случай отмены редактирования
    $scope.before_photo = item.PHOTO;
    $scope.before_check_photo = item.CHECK_PHOTO;
    // стили тоже
    $scope.before_photo_size = item.PHOTO_SIZE;
    $scope.before_check_photo_size = item.CHECK_PHOTO_SIZE;

    $scope.inv_edit = item;
    $scope.editMode = 1;
  }

  $scope.saveItem = function saveItem() {
    $scope.global.showWaitingForm("Сохранение данных...");

    $scope.inv_edit.PHOTO = null;
    $scope.inv_edit.CHECK_PHOTO = null;

    $http({
      "method": "POST",
      "url": "/Home/SaveInventData",
      data: {
        i: $scope.inv_edit,
        photo: $scope.photo.substring($scope.photo.indexOf(",") + 1),
        check_photo: $scope.check_photo.substring($scope.check_photo.indexOf(",") + 1)
      }
    }).success(function (data) {
      $scope.global.hideWaitingForm();
      // перезапросим данные
      $scope.refresh();

      $scope.before_photo = "";
      $scope.before_check_photo = "";

      $scope.before_photo_size = "";
      $scope.before_check_photo_size = "";

      $scope.photo = "";
      $scope.check_photo = "";

      $scope.editMode = 0;
      $scope.inv_edit = {};

    }).error(function (err) {
      $scope.global.hideWaitingForm();
      $scope.global.showErrorAlert(err);
    });
  }

  $scope.spisatItem = function spisatItem(item) {
    // форму редактирования скрываем
    $scope.editMode = 0;
    item.IS_SPISAN = 0;
    $scope.global.function.showYesNoDialog("Вы уверены, что хотите списать/отменить списание?", () => {
      $http({
        method: "POST",
        url: "/Home/SpisatInvent",
        params: {
          id: item.ID
        }
      }).then(function (data) {
        // перезапросим данные
        $scope.refresh();
      }).catch((err) => {
        $scope.global.showErrorAlert("Ошибка: " + JSON.stringify(err.data));
      });
    });
  }

  $scope.print = function print() {
    var w = window.open("/Home/PrintInvent");
    w.printData = { data: $scope.inv };
    //w.printData.data = $scope.inv;

    w.printData.data.push({
      NAME: "Итого",
      KOLVO: $scope.kolvo,
      COST: $scope.itogo
    });
  }

  function formatNumber(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
  }

});