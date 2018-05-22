"use strict";

// контроллер
manualCtrl = myApp.controller("manualCtrl", function manualCtrl($scope, $http) {
  var i = 6;
  var j = 0;
  $scope.temp = [];
  $scope.manual = [];
  $scope.m_temp = [];
  $scope.e_temp = [];
  $scope.work_days = [];
  $scope.place = [];
  $scope.zabol = [];

  $scope.emptyTdHeight = 21;

  $scope.newManual = 0;
  $scope.newManualLeft = 0;
  $scope.newManualTop = 0;
  $scope.newManualHeight = 0;

  $scope.existsEditHeight = 1;
  $scope.existsEditError = "";

  $scope.newSeansTime = 0;
  $scope.newSeansTimeLeft = 0;
  $scope.newSeansTimeTop = 0;
  $scope.newSeansTimeHeight = 0;
  $scope.errorTimeHeight = 0;
  $scope.errorTime = "";

  $scope.min_time = new Date();
  $scope.max_time = new Date();

  $scope.newSeansPlace = 0;
  $scope.newSeansPlaceLeft = 0;
  $scope.newSeansPlaceTop = 0;
  $scope.newSeansPlaceHeight = 0;

  $scope.errorPlaceHeight = 1;
  $scope.errorPlace = "";

  $scope.newZabol = 0;
  $scope.newZabolLeft = 0;
  $scope.newZabolTop = 0;
  $scope.newZabolHeight = 0;

  $scope.errorZabolHeight = 0;
  $scope.errorZabol = "";

  $scope.id = 0;
  $scope.name = "Оборудование";
  $scope.m_ryad_id = 1;
  $scope.m_product_id = 1;

  $scope.m_zabol_group_id = 1;

  $scope.existsHeight = 1;
  $scope.existsError = "";

  // отобразить combobox
  $scope.temp.push({ id: 1 });
  // строку ввода
  $scope.m_temp.push({ name: "" });

  // загрузка всех справочников, когда загрузилась вся программа
  $scope.$on("global.appCtrlLoaded", function appCtrlLoadedManualCtrl() {

    // загрузим справочники c полями id, name
    initLoad(1);

    loadSeansPlace();

    loadWorkDays();

    loadZabol();

  });

  function initLoad(x) {
    $scope.manual = [];
    var id = 0;
    if (typeof x !== "undefined") {
      id = x;
    } else {
      id = $scope.temp[0].id;
    }

    if (typeof $scope.global.manual.M_MANUAL !== "undefined") {
      var a = $scope.global.manual.M_MANUAL.find(m => m["ID"] === id);
      if (typeof a !== "undefined") {
        if (id === $scope.global.const.M_MANUAL_ID) {
          $scope.manual = $scope.global.manual["M_PRODUCT_ALL"];
          $scope.temp[0]["name"] = a.NAME_ENG;
        } else {
          $scope.manual = $scope.global.manual[a.NAME_ENG];
          $scope.temp[0]["name"] = a.NAME_ENG;
        }
      }
    }

    if (typeof $scope.manual === "undefined") {
      $scope.manual = [];
      $scope.manual.push({
        ID: 0,
        NAME: "",
        DEISTV: 1,
        IS_ABON: 0
      });
    } else {
      if (id === $scope.global.const.M_MANUAL_ID) {
        for (var i = 0; i < $scope.manual.length; i++) {
          var m = $scope.global.manual.M_PRODUCT_ORG.find(x => x["M_PRODUCT_ID"] === $scope.manual[i]["ID"]);
          var p = $scope.global.manual.M_PRODUCT_ALL.find(x => x["ID"] === $scope.manual[i]["ID"] && x["IS_ABON"] === 1);

          if (m != null) {
            $scope.manual[i]["DEISTV"] = 1;
          } else {
            $scope.manual[i]["DEISTV"] = 0;
          }

          if (p != null) {
            $scope.manual[i]["IS_ABON"] = 1;
          } else {
            $scope.manual[i]["IS_ABON"] = 0;
          }
        }
      } else {
        for (var i = 0; i < $scope.manual.length; i++) {
          $scope.manual[i]["DEISTV"] = 1;
          $scope.manual[i]["IS_ABON"] = 0;
        }
      }

    }
  }

  // загрузим справочник мест
  function loadSeansPlace() {
    $scope.place = [];
    var p_id = 0;
    var r_id = 0;
    var p = $scope.global.manual.M_SEANS_PLACE;
    if (typeof p !== "undefined") {

      for (var i = 0; i < p.length; i++) {
        var r = $scope.global.manual.M_RYAD;
        var s = $scope.global.manual.M_PRODUCT;
        var group = "";
        var prod = "";

        if (typeof r !== "undefined") {
          var t = r.find(m => m["ID"] === p[i]["M_RYAD_ID"]);
          if (typeof t !== "undefined") {
            group = t["NAME"];
            r_id = t["ID"];
          } else {
            r_id = 1;
          }
        }

        if (typeof s !== "undefined") {
          var t = s.find(m => m["ID"] === p[i]["M_PRODUCT_ID"]);
          if (typeof t !== "undefined") {
            prod = t["NAME"];
            p_id = t["ID"];
          } else {
            p_id = 1;
          }
        }

        $scope.place.push({
          ID: p[i]["ID"],
          NUM: i + 1,
          M_PRODUCT_ID: p_id,
          M_RYAD_ID: r_id
        });


        $scope.place[i]["NAME"] = p[i]["NAME"];
        $scope.place[i]["TYPE"] = prod;
        $scope.place[i]["GROUP"] = group;
      }
    }

    if ($scope.place.length === 0) {
      $scope.place.push({
        ID: 0,
        NUM: " "
      }); // одна запись для формирования таблицы
    }

    if (!$scope.$$phase) {
      $scope.$apply();
    }
  }

  // загрузка справочника заболеваний
  function loadZabol() {
    $scope.zabol = [];
    var group = "";
    var group_id = 0;
    if (typeof $scope.global.manual.M_ZABOL !== "undefined") {
      for (var i = 0; i < $scope.global.manual.M_ZABOL.length; i++) {
        group = "";
        var g = $scope.global.manual.M_ZABOL_GROUP;
        if (typeof g !== "undefined") {
          var t = g.find(m => m["ID"] === $scope.global.manual.M_ZABOL[i]["M_ZABOL_GROUP_ID"]);
          if (typeof t !== "undefined") {
            group = t["NAME"];
            group_id = t["ID"];
          }
        }

        $scope.zabol.push({
          ID: $scope.global.manual.M_ZABOL[i]["ID"]
        });

        $scope.zabol[i]["NAME"] = $scope.global.manual.M_ZABOL[i]["NAME"];
        $scope.zabol[i]["GROUP"] = group;
        $scope.zabol[i]["GROUP_ID"] = group_id;
      }

      if ($scope.zabol.length === 0) {
        $scope.zabol.push({
          ID: 0
        }); // одна запись для формирования таблицы
      }

    }

    if (!$scope.$$phase) {
      $scope.$apply();
    }

  }

  function loadWorkDays() {
    var d = $scope.global.manual.M_WORK_DAY;

    // справочник рабочих дней
    for (var i = 1; i < 7; i++) {
      if (typeof d !== "undefined") {
        var w = d.find(m => m["DAY_ID"] === i);
        if (typeof w !== "undefined") {
          $scope.work_days.push({
            id: w["ID"],
            day_id: i,
            name: days[i],
            chk: true
          });
        } else {
          $scope.work_days.push({
            id: 0,
            day_id: i,
            name: days[i],
            chk: false
          });
        }
      } else {
        $scope.work_days.push({
          id: 0,
          day_id: i,
          name: days[i],
          chk: false
        });
      }
    }

    // день воскресение в javascript равен 0, суббота - 6
    if (typeof d !== "undefined") {
      var w = d.find(m => m["DAY_ID"] === 0);
      if (typeof w !== "undefined") {
        $scope.work_days.push({
          id: w["ID"],
          day_id: 0,
          name: days[0],
          chk: true
        });
      } else {
        $scope.work_days.push({
          id: 0,
          day_id: 0,
          name: days[0],
          chk: false
        });
      }
    } else {
      $scope.work_days.push({
        id: 0,
        day_id: 0,
        name: days[0],
        chk: false
      });
    }
  }

  // загрузка справочника по выбору
  $scope.loadManual = function loadManual(x) {
    $scope.temp[0].id = x;
    initLoad(x);
  }

  // создание новой записи
  $scope.saveManual = function saveManual() {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    if ($scope.m_temp[0]["name"] === "") return false;
    var id = $scope.temp[0].id;
    var data = [];
    var a = $scope.global.manual.M_MANUAL.find(m => m["ID"] === id);
    if (typeof a !== "undefined") {
      data = $scope.global.manual[a.NAME_ENG];
    }
    // пуст, надо переинициализировать
    if (typeof data === "undefined") {
      $scope.global.manual[a.NAME_ENG] = [];
    } else {
      // проверим наименование
      var b = data.find(n => n["NAME"].toUpperCase() === $scope.m_temp[0]["name"].toUpperCase());
      if (typeof b !== "undefined") {
        $scope.existsHeight = 20;
        $scope.existsError = "Наименование уже существует";
        return false;
      } else {
        $scope.existsHeight = 1;
        $scope.existsError = "";
      }
      $scope.global.showWaitingForm("Сохранение данных...");
      $http({
        "method": "POST",
        "url": "/Home/SaveManualName",
        data: {
          id: 0,
          name: $scope.m_temp[0]["name"],
          manual: a.NAME_ENG
        }
      }).success(function (data) {
        if (data["success"] === "exists") {
          $scope.existsHeight = 20;
          $scope.existsError = "Наименование уже существует";
          $scope.global.hideWaitingForm();
        } else if (data["success"] === "true") {
          // перезапросим справочник в клиент
          $scope.global.refreshManual(data["data"]).then(function refreshManualComplete() { 

            $scope.m_temp[0]["name"] = "";
            $scope.existsHeight = 1;
            $scope.existsError = "";

            if (!$scope.$$phase) {
              $scope.$apply();
            }

            $scope.global.hideWaitingForm();

          });
        }
        $scope.global.hideWaitingForm();
      }).error(function (err) {
        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();
      });
    }
  }

  // нажали редактировать
  $scope.editManual = function editManual(e) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    $scope.e_temp = [];
    var elem = e.currentTarget;
    var id = parseInt(elem.attributes[0].value);
    var name = elem.attributes[1].value;
    if (id === 0) {
      return false;
    }

    // очищаем ввод новой записи
    $scope.m_temp[0]["name"] = "";
    $scope.existsEditHeight = 1;
    $scope.existsEditError = "";

    $scope.e_temp.push({
      id: id,
      name: name,
      name_eng: $scope.temp[0]["name"]
    });

    // закрываем все открытые формы редактирования
    $scope.newSeansPlace = 0;
    $scope.newSeansTime = 0;
    $scope.newZabol = 0;
    $scope.newManual = 1;

    $scope.newManualLeft = 10;
    $scope.newManualTop = $(elem).offset().top;
    $scope.newManualHeight = 65;
  }

  // нажали отменить
  $scope.btnManualCancel = function btnManualCancel() {
    $scope.newManual = 0;
    $scope.newManualLeft = 0;
    $scope.newManualTop = 0;
    $scope.newManualHeight = 0;
    $scope.existsEditHeight = 1;
    $scope.existsEditError = "";
    $scope.e_temp = [];
  }

  // сохраняем изменение
  $scope.btnManualSave = function btnManualSave() {
    if ($scope.e_temp[0]["name"] === "") {
      $scope.existsEditHeight = 20;
      $scope.newManualHeight = 85;
      $scope.existsEditError = "Не указано наименование";
      return false;
    }

    // проверим наименование
    var b = $scope.global.manual[$scope.e_temp[0]["name_eng"]].find(n => n["NAME"].toUpperCase() === $scope.e_temp[0]["name"].toUpperCase() &&
                                                                         n["ID"] !== $scope.e_temp[0]["id"]);
    if (typeof b !== "undefined") {
      $scope.existsEditHeight = 20;
      $scope.existsEditError = "Наименование уже существует";
      $scope.newManualHeight = 85;
      return false;
    } else {
      $scope.existsEditHeight = 1;
      $scope.existsEditError = "";
    }
    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/SaveManualName",
      data: {
        id: $scope.e_temp[0]["id"],
        name: $scope.e_temp[0]["name"],
        manual: $scope.e_temp[0]["name_eng"]
      }
    }).success(function (data) {
      if (data["success"] === "exists") {
        $scope.existsEditHeight = 20;
        $scope.existsEditError = "Наименование уже существует";
        $scope.newManualHeight = 85;
        $scope.global.hideWaitingForm();
      } else if (data["success"] === "true") {
        // перезапросим справочник в клиент
        $scope.global.refreshManual(data["data"]).then(function refreshManualComplete() {
          $scope.newManual = 0;
          $scope.newManualLeft = 0;
          $scope.newManualTop = 0;
          $scope.newManualHeight = 0;
          $scope.existsEditHeight = 1;
          $scope.existsEditError = "";
          $scope.e_temp = [];

          if (!$scope.$$phase) {
            $scope.$apply();
          }
          $scope.global.hideWaitingForm();
        });
      }
      $scope.global.hideWaitingForm();
    }).error(function (err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  }

  function getDateTime(s) {
    var d = new Date();
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    if (day <= 9) day = "0" + day;
    if (month <= 9) month = "0" + month;
    var now = year + "-" + month + "-" + day;
    return new Date(now + " " + s + ":00");
  }

  function getMinuteFromDate(d) {
    return (d.getHours() * 60) +  d.getMinutes();
  }

  function getHoursMinuteFromDate(d) {
    var hours = d.getHours();
    var minutes = d.getMinutes();
    if (hours <= 9) hours = "0" + hours;
    if (minutes <= 9) minutes = "0" + minutes;
    return hours + ":" + minutes;
  }

  // нажатие на кнопку - добавить время в расписание
  $scope.addSeansTime = function addSeansTime(e) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    var elem = e.currentTarget;
    $scope.id = 0;
    $scope.min_time = getDateTime("09:00");  // начало работы
    $scope.max_time = getDateTime("17:00");  // окончание

    $scope.newSeansTimeLeft = 285;
    $scope.newSeansTimeTop = $(elem).offset().top;
    $scope.newSeansTimeHeight = 85;

    // закрываем все открытые формы редактирования
    $scope.newZabol = 0;
    $scope.newManual = 0;
    $scope.newSeansPlace = 0;
    $scope.newSeansTime = 1;
  }

  // нажали редактировать время
  $scope.editSeansTime = function editSeansTime(e) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    var elem = e.currentTarget;
    $scope.id = parseInt(elem.attributes[0].value);
    if ($scope.id === 0) {
      return false;
    }

    if (typeof $scope.global.manual.M_SEANS_TIME !== "undefined") {
      var m = $scope.global.manual.M_SEANS_TIME.find(x => x["ID"] === $scope.id);
      if (typeof m !== "undefined") {

        $scope.min_time = getDateTime(m["MIN_TIME"]);
        $scope.max_time = getDateTime(m["MAX_TIME"]);

        $scope.newSeansTimeLeft = 285;
        $scope.newSeansTimeTop = $(elem).offset().top;
        $scope.newSeansTimeHeight = 85;

        // закрываем все открытые формы редактирования
        $scope.newZabol = 0;
        $scope.newManual = 0;
        $scope.newSeansPlace = 0;
        $scope.newSeansTime = 1;
      }
    }
  }

  // нажали отмена
  $scope.btnSeansTimeCancel = function btnSeansTimeCancel() {
    $scope.newSeansTimeLeft = 0;
    $scope.newSeansTimeTop = 0;
    $scope.newSeansTimeHeight = 1;
    $scope.newSeansTime = 0;
    $scope.errorTimeHeight = 0;
    $scope.errorTime = "";
  }


  $scope.btnSeansTimeSave = function btnSeansTimeSave() {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    var i = 0;
    var min = 0;
    var max = 0;
    var min_time = $scope.min_time;
    var max_time = $scope.max_time;
    var s = {};
    if ((min_time === null || max_time === null) ||
        (min_time === "" || max_time === "") ||
        (typeof min_time === "undefined" || typeof max_time === "undefined")) {
      $scope.errorTimeHeight = 20;
      $scope.errorTime = "Не указано время сеанса";
      $scope.newSeansTimeHeight = 105;
      return false;
    } else {
      $scope.errorTimeHeight = 0;
      $scope.errorTime = "";
      $scope.newSeansTimeHeight = 85;
    }

    for (var i = 0; i < $scope.global.manual.M_SEANS_TIME.length; i++) {
      if ($scope.id !== $scope.global.manual.M_SEANS_TIME[i]["ID"]) {
        var a = parseInt($scope.global.manual.M_SEANS_TIME[i]["MIN_TIME"].substring(0, 2)) * 60;
        var b = parseInt($scope.global.manual.M_SEANS_TIME[i]["MIN_TIME"].substring(3));
        min = a + b;
        a = parseInt($scope.global.manual.M_SEANS_TIME[i]["MAX_TIME"].substring(0, 2)) * 60;
        b = parseInt($scope.global.manual.M_SEANS_TIME[i]["MAX_TIME"].substring(3));
        max = a + b;

        var c = getMinuteFromDate($scope.min_time);
        var d = getMinuteFromDate($scope.max_time);
        // ввод
        if (c > d) {
          $scope.errorTimeHeight = 40;
          $scope.errorTime = "Начало сеанса больше окончания";
          $scope.newSeansTimeHeight = 125;
          return false;
        } else

        if (c === d) {
          $scope.errorTimeHeight = 40;
          $scope.errorTime = "Начало сеанса равно окончанию";
          $scope.newSeansTimeHeight = 125;
          return false;
        }

        // время уже есть 
        if ((min === c) && (max === d)) {
          $scope.errorTimeHeight = 20;
          $scope.errorTime = "Интервал времени уже задан";
          $scope.newSeansTimeHeight = 105;
          return false;
        } else

        // пересекается с существующим интервалом
        if (((c > min) && (c < max)) ||
            ((d > min) && (d < max))) {
          $scope.errorTimeHeight = 40;
          $scope.errorTime = "Интервал пересекается с существующим сеансом";
          $scope.newSeansTimeHeight = 125;
          return false;
        } else

        if ((c < min) && (d > max)) {
          $scope.errorTimeHeight = 40;
          $scope.errorTime = "Интервал пересекается с существующим сеансом";
          $scope.newSeansTimeHeight = 125;
          return false;
        } else {
          $scope.errorTimeHeight = 0;
          $scope.errorTime = "";
        }
      }
    }
    s["id"] = $scope.id;
    s["min_time"] = getHoursMinuteFromDate($scope.min_time);
    s["max_time"] = getHoursMinuteFromDate($scope.max_time);
    s["name"] = s["min_time"] + "-" + s["max_time"];
    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      method: "POST",
      url: "/Home/SaveSeansTime",
      data: s
    }).success(function (data) {
      if (data.length !== 0) {
        if (data["success"] === "true") {
          // перезапросим справочник в клиент
          $scope.global.refreshManual("M_SEANS_TIME").then(function refreshManualComplete() {
            $scope.newSeansTimeLeft = 0;
            $scope.newSeansTimeTop = 0;
            $scope.newSeansTimeHeight = 1;
            $scope.newSeansTime = 0;
            $scope.errorTimeHeight = 0;
            $scope.errorTime = "";
            if (!$scope.$$phase) {
              $scope.$apply();
            }
            $scope.global.hideWaitingForm();
          });

        } else if (data["success"] === "exists") {
          $scope.errorTimeHeight = 40;
          $scope.errorTime = "Интервал пересекается с существующим сеансом";
          $scope.newSeansTimeHeight = 125;
        }
      }
      $scope.global.hideWaitingForm();
    }).error(function (err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  }

  // установить снять - отметку графика работы
  $scope.setWorkDay = function setWorkDay(e) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    var elem = e.currentTarget;
    var id = elem.attributes[0].value;
    var day_id = elem.attributes[1].value;
    var chk = elem.checked;
    var d = {};

    if (chk) {
      d = {
        id: 0,
        day_id: day_id,
        name: days[day_id]
      };
    } else {
      d = {
        id: id,
        day_id: day_id,
        name: "delete"
      };
    }

    $http({
      method: "POST",
      url: "/Home/SaveWorkDay",
      data: d
    }).success(function (data) {
      // перезапросим справочник в клиент
      $scope.global.refreshManual("M_WORK_DAY").then(function refreshManualComplete() {
        if (!$scope.$$phase) {
          $scope.$apply();
        }
        $scope.global.hideWaitingForm();
      });
    }).error(function (err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  }

  // добавить новое место
  $scope.addPlace = function addPlace(e) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    var elem = e.currentTarget;
    $scope.newSeansPlaceLeft = 606;
    $scope.newSeansPlaceTop = $(elem).offset().top;
    $scope.newSeansPlaceHeight = 112;

    // закрываем все открытые формы редактирования
    $scope.newManual = 0;
    $scope.newSeansTime = 0;
    $scope.newZabol = 0;
    $scope.newSeansPlace = 1;

    $scope.id = 0;
    $scope.m_product_id = 1;
    $scope.name = "Оборудование";
  }

  // вставляем наименование
  $scope.getPlaceName = function getPlaceName() {
    if ($scope.m_product_id === 1) {
      $scope.name = "Оборудование";
    } else {
      $scope.name = "Ковер";
    }
  }

  // нажали изменить место
  $scope.editPlace = function editPlace(e) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    var elem = e.currentTarget;
    $scope.id = parseInt(elem.attributes[0].value);
    if ($scope.id === 0) {
      return false;
    }

    if (typeof $scope.place !== "undefined") {
      var m = $scope.place.find(x => x["ID"] === $scope.id);
      if (typeof m !== "undefined") {
        $scope.name = m["NAME"];
        $scope.m_product_id = m["M_PRODUCT_ID"];
        $scope.m_ryad_id = m["M_RYAD_ID"];
        $scope.newSeansPlaceLeft = 606;
        $scope.newSeansPlaceTop = $(elem).offset().top;
        $scope.newSeansPlaceHeight = 112;

        // закрываем все открытые формы редактирования
        $scope.newSeansTime = 0;
        $scope.newZabol = 0;
        $scope.newManual = 0;
        $scope.newSeansPlace = 1;
      }
    }
  }

  // нажали отмена
  $scope.btnPlaceCancel = function btnPlaceCancel() {
    $scope.newSeansPlaceLeft = 0;
    $scope.newSeansPlaceTop = 0;
    $scope.newSeansPlaceHeight = 0;
    $scope.newSeansPlace = 0;
  }

  // сохраняем место
  $scope.btnPlaceSave = function btnPlaceSave() {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    if ($scope.name === "") {
      $scope.errorPlaceHeight = 20;
      $scope.errorPlace = "Не указано наименование";
      $scope.newSeansPlaceHeight = 132;
      return false;
    } else {
      $scope.errorPlaceHeight = 1;
      $scope.errorPlace = "";
    }

    var d = {};
    d = {
      ID: $scope.id,
      NAME: $scope.name,
      M_PRODUCT_ID: $scope.m_product_id,
      M_RYAD_ID: $scope.m_ryad_id
    };
    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      method: "POST",
      url: "/Home/SaveSeansPlace",
      data: d
    }).success(function (data) {
      // перезапросим справочник в клиент
      $scope.global.refreshManual("M_SEANS_PLACE").then(function refreshManualComplete() {
        $scope.global.hideWaitingForm();
        $scope.newSeansPlaceLeft = 0;
        $scope.newSeansPlaceTop = 0;
        $scope.newSeansPlaceHeight = 0;
        $scope.newSeansPlace = 0;

        loadSeansPlace();
      });
      $scope.global.hideWaitingForm();
    }).error(function (err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  }

  // нажали новое заболевание
  $scope.addZabol = function addZabol(e) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    var elem = e.currentTarget;
    $scope.name = "";
    $scope.newZabolLeft = 870;
    $scope.newZabolTop = $(elem).offset().top;
    $scope.newZabolHeight = 88;

    // закрываем все открытые формы редактирования
    $scope.newManual = 0;
    $scope.newSeansPlace = 0;
    $scope.newSeansTime = 0;
    $scope.newZabol = 1;
    $scope.id = 0;
  }

  $scope.editZabol = function editZabol(e) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    var elem = e.currentTarget;
    $scope.id = parseInt(elem.attributes[0].value);
    if ($scope.id === 0) {
      return false;
    }

    if (typeof $scope.zabol !== "undefined") {
      var m = $scope.zabol.find(x => x["ID"] === $scope.id);
      if (typeof m !== "undefined") {
        $scope.name = m["NAME"];
        $scope.m_zabol_group_id = m["GROUP_ID"];
        $scope.newZabolLeft = 870;
        $scope.newZabolTop = $(elem).offset().top;
        $scope.newZabolHeight = 88;

        // закрываем все открытые формы редактирования
        $scope.newManual = 0;
        $scope.newSeansPlace = 0;
        $scope.newSeansTime = 0;
        $scope.newZabol = 1;
      }
    }
  }

  // нажали отмена
  $scope.btnZabolCancel = function btnZabolCancel() {
    $scope.newZabolLeft = 0;
    $scope.newZabolTop = 0;
    $scope.newZabolHeight = 0;
    $scope.newZabol = 0;
    $scope.errorZabolHeight = 0;
    $scope.errorZabol = "";
  }

  // сохраняем заболевание
  $scope.btnZabolSave = function btnZabolSave() {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(2, 20)) return false;

    var d = {};
    if ($scope.name === "") {
      $scope.errorZabolHeight = 20;
      $scope.errorZabol = "Не указано наименование заболевания";
      $scope.newZabolHeight = 108;
      return false;
    } else {
      $scope.errorZabolHeight = 0;
      $scope.errorZabol = "";
    }

    if (typeof $scope.zabol !== "undefined") {
      for (var i = 0; i < $scope.zabol.length; i++) {
        if (($scope.zabol[i]["NAME"].toUpperCase() === $scope.name.toUpperCase()) &&
            ($scope.zabol[i]["GROUP_ID"] === $scope.m_zabol_group_id) &&
            ($scope.zabol[i]["ID"] !== $scope.id)) {
          $scope.errorZabolHeight = 20;
          $scope.errorZabol = "Указанное наименование уже существует в справочнике";
          $scope.newZabolHeight = 108;
          return false;
        } else {
          $scope.errorZabolHeight = 0;
          $scope.errorZabol = "";
        }
      }
    }

    d = {
      ID: $scope.id,
      NAME: $scope.name,
      M_ZABOL_GROUP_ID: $scope.m_zabol_group_id
    };
    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      method: "POST",
      url: "/Home/SaveZabol",
      data: d
    }).success(function (data) {
      if (data["success"] === "true") {
        // перезапросим справочник в клиент
        $scope.global.refreshManual("M_ZABOL").then(function refreshManualComplete() {
          $scope.newZabolLeft = 0;
          $scope.newZabolTop = 0;
          $scope.newZabolHeight = 0;
          $scope.newZabol = 0;
          $scope.errorZabolHeight = 0;
          $scope.errorZabol = "";
          $scope.global.hideWaitingForm();
          loadZabol();
        });
      } else if (data["success"] === "exists") {
        $scope.errorZabolHeight = 20;
        $scope.errorZabol = "Указанное наименование уже существует в справочнике";
        $scope.newZabolHeight = 108;
      }
      $scope.global.hideWaitingForm();
    }).error(function (err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });

  }

  // сохраняем выбранные позиции для данной организации
  $scope.setIsDeistv = function setIsDeistv(item) {
    $http({
      "method": "POST",
      "url": "/Home/SaveProductDeistv",
      data: {
        ID: item.ID,
        DEISTV: item.DEISTV
      }
    }).then(function setIsDeistvDataSuccess(data) {
      $scope.global.refreshManual("M_PRODUCT_ORG").then(function refreshManualComplete() {
        $scope.global.refreshManual("M_PRODUCT").then(function refreshManualComplete() {
          $scope.global.hideWaitingForm();
        });
      });
    }, function setIsDeistvFailed(err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  }

  // сохраняем галочку - товар является абонементом
  $scope.setIsAbon = function setIsAbon(item) {
    $http({
      "method": "POST",
      "url": "/Home/SaveProductIsAbon",
      data: {
        ID: item.ID,
        IS_ABON: item.IS_ABON
      }
    }).then(function setIsDeistvDataSuccess(data) {
      $scope.global.refreshManual("M_PRODUCT_ORG").then(function refreshManualComplete() {
        $scope.global.refreshManual("M_PRODUCT").then(function refreshManualComplete() {
          $scope.global.hideWaitingForm();
        });
      });
    }, function setIsDeistvFailed(err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  }

});