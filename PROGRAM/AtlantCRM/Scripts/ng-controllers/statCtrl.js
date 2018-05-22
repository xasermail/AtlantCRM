"use strict";

// контроллер
statCtrl = myApp.controller("statCtrl", function statCtrl($scope, $http, $timeout) {

  // событие при открытии вкладки
  $scope.$on("global.selectedSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == "7") {
      $scope.refreshStat();
    }

  });


  $scope.refreshStat = function refreshStat() {

    var i = 0;
    $scope.seans = [];
    $scope.reg = [];
    $scope.lane = [];
    $scope.last_lane = [];

    // дата регистрации
    $scope.date_reg = getDate($scope.global.ank.DATE_REG);
    // зарегистрирован
    $scope.d_reg = "";
    // источник информации
    $scope.ist_inf = "";
    // список всех посещений
    $scope.posList = [];
    // список всех приостановок абонемента
    $scope.priostList = [];

    // для проверки, выполнился ли уже запрос
    $scope.requestSeansDone = false;
    $scope.requestRegDone = false;
    $scope.requestLaneDone = false;
    $scope.requestLaneLastLineDone = false;
    $scope.requestAnkDone = false;


    if (typeof $scope.global.manual.M_IST_INF !== "undefined") {
      var a = $scope.global.manual.M_IST_INF.find(x => x["ID"] === $scope.global.ank.IST_INFO);
      if (typeof a !== "undefined") {
        $scope.ist_inf = a["NAME"];
      }
    }

    // посещения
    $scope.all_visits = "";
    $scope.place = "";      // 5 ковер
    $scope.last_visit = "";
    $scope.nepreryv = "";

    $scope.global.showWaitingForm("Получение статистики..");

    // сеансы
    $http({
      method: "GET",
      url: "/Home/GetStatSeansInfo",
      params: { id: $scope.global.ank.ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      $scope.requestSeansDone = true;
      for (var i = 0; i < data.length; i++) {
        $scope.seans.push({
          time: data[i].time,
          visits: data[i].visits,
          part: data[i].part
        });
      }

      if (data.length === 0) {
        if (typeof $scope.global.manual.M_SEANS_TIME !== "undefined") {
          for (var i = 0; i < $scope.global.manual.M_SEANS_TIME.length; i++) {
            $scope.seans.push({
              time: $scope.global.manual.M_SEANS_TIME[i]["MIN_TIME"],
              visits: "",
              part: ""
            });
          }
        }
      }
    });

    // регистрации
    $http({
      method: "GET",
      url: "/Home/GetStatSeansInfo",
      params: { id: $scope.global.ank.ID, reg: 1 },
      data: "JSON",
      async: false
    }).success(function (data) {
      $scope.requestRegDone = true;
      for (var i = 0; i < data.length; i++) {
        $scope.reg.push({
          time: data[i].time,
          visits: data[i].visits,
          part: data[i].part
        });
      }
    });

    // ряды
    $http({
      method: "GET",
      url: "/Home/GetStatSeansInfo",
      params: { id: $scope.global.ank.ID, lane: 1 },
      data: "JSON",
      async: false
    }).success(function (data) {
      $scope.requestLaneDone = true;
      for (var i = 0; i < data.length; i++) {
        $scope.lane.push({
          time: data[i].time,
          visits: data[i].visits,
          part: data[i].part
        });
      }
    });

    // ряды, последняя строка
    $http({
      method: "GET",
      url: "/Home/GetStatSeansInfo",
      params: { id: $scope.global.ank.ID, last: 1 },
      data: "JSON",
      async: false
    }).success(function (data) {
      $scope.requestLaneLastLineDone = true;
      for (var i = 0; i < data.length; i++) {

        if (data[i].time !== null) {
          var a = data[i].time.indexOf("#") + 1;
          var b = data[i].time.substring(a, data[i].time.length);
          var c = b + "  на сеанс  " + data[i].part;
          $scope.last_visit = c;

          var d = data[i].time.replace("#", "    ") + "    " + data[i].part;
          $scope.last_lane.push({
            time: d
          });
        }

        if (data[i].visits !== null) {
          var e = data[i].visits.indexOf("#") + 1;
          var f = data[i].visits.substring(e, data[i].visits.length);
          $scope.place = f + " ковер";

          var g = data[i].visits.replace("#" + f, "");
          $scope.d_reg = g;
        }
      }
    });

    $http({
      method: "GET",
      url: "/Home/GetAnkData",
      params: { ID: $scope.global.ank.ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      $scope.requestAnkDone = true;
      $scope.all_visits = data.all_visits;
      $scope.nepreryv = data.nepreryv;
      $scope.posList = data.posList;
      $scope.priostList = data.priostList;
    });


    // проверяю, что все запросы выполнились
    $timeout($scope.checkRequestDone, 200);

  };

  // дата
  function getDate(date) {
    var d = new Date(date);
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var hours = d.getHours();
    var minutes = d.getMinutes();

    if (day <= 9) day = "0" + day;
    if (month <= 9) month = "0" + month;
    if (hours <= 9) hours = "0" + hours;
    if (minutes <= 9) minutes = "0" + minutes;

    return day + "." + month + "." + year;
  }



  // функция проверки того, что все запросы выполнены
  $scope.checkRequestDone = function checkRequestDone() {

    // все выполнены
    if ($scope.requestSeansDone === true && $scope.requestRegDone === true &&
         $scope.requestLaneDone === true && $scope.requestLaneLastLineDone === true &&
         $scope.requestAnkDone === true
    )
    {
      $scope.global.hideWaitingForm();
    } else {
      $timeout($scope.checkRequestDone, 200);
    }

  };

});