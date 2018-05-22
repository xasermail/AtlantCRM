"use strict";

// контроллер
dialogCtrl = myApp.controller("dialogCtrl", function dialogCtrl($scope, $http) {
  var months = new Array("января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря");
  var days = new Array("Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота");
  $scope.comment = "";

  $scope.day = "";
  $scope.month = "";
  $scope.year = "";
  $scope.weekday = "";
  $scope.monthName = "";
  $scope.hours = "";
  $scope.minutes = "";
  $scope.subDialogStatusHeight = 40;

  $scope.kto = "";
  $scope.first_visit = "";
  $scope.last_visit = "";
  $scope.all_visits = "6";
  $scope.nepreryv = "Не ходит 1 месяц 20 дней";

  $scope.sicks = "";
  //$scope.complaint = "Катаракта, быстро устают глаза";
  $scope.subdate = "";

  $scope.dialog = [];
  $scope.status = [];
  $scope.complaint = [];

  // сбрасывается, если выбрана новая анкета
  var loaded = false;

  $scope.O_ANK = {
    ID: $scope.global.ank.ID
  };

  $scope.O_ANK.O_DIALOG = [];
  $scope.O_ANK.O_STATUS = [];
  $scope.O_ANK.O_COMPLAINT = [];

  // при открытии из рядов здесь будет идентификатор сеанса
  var laneSeansId = null;



  // действие, при открытии вкладки
  function getDialogData(ID) {

    $scope.dialog = [];
    $scope.status = [];
    $scope.complaint = [];
    $scope.O_ANK.ID = ID;
    $scope.phone = $scope.global.ank.PHONE_MOBILE;
    if (!$scope.phone) $scope.phone = $scope.global.ank.PHONE_HOME;

    // запоминаю сеанс, с которого открыли общение
    laneSeansId = $scope.global.dialog.o_seans_id;
    $scope.global.dialog.o_seans_id = null;


    // источник информации
    $scope.ist_inf = "";

    if (typeof $scope.global.manual.M_IST_INF !== "undefined") {
      var a = $scope.global.manual.M_IST_INF.find(x => x["ID"] === $scope.global.ank.IST_INFO);
      if (typeof a !== "undefined") {
        $scope.ist_inf = a["NAME"];
      }
    }

    $http({
      method: "GET",
      url: "/Home/GetAnkData",
      params: { ID: ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      $scope.birth_day = data.birth_day;
      $scope.age = data.age;
      $scope.subdate = data.subdate;
      $scope.first_visit = data.first_visit;
      $scope.last_visit = data.last_visit;
      $scope.all_visits = data.all_visits;
      $scope.nepreryv = data.nepreryv;
      $scope.sicks = data.zabol;

      if ($scope.global.ank.ID === 0) {
        $scope.birth_day = "";
        $scope.age = "";
        initDateTime();
        $scope.subdate = $scope.day + " " + $scope.monthName + " " + $scope.hours + ":" + $scope.minutes;
      }
    });

    $http({
      method: "GET",
      url: "/Home/GetDialogData",
      params: { ID: ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      for (var i = 0; i < data.length; i++) {
        $scope.dialog.push({
          id: data[i].ID,
          comment: data[i].COMMENT,
          npos: data[i].NPOS
        });
      }
    });

    $http({
      method: "GET",
      url: "/Home/GetStatusData",
      params: { ID: ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      for (var i = 0; i < data.length; i++) {
        $scope.status.push({
          id: data[i].ID,
          m_status_id: data[i].M_STATUS_ID,
          m_product_id: data[i].M_PRODUCT_ID,
          status_date: new Date(data[i].STATUS_DATE)
        });
      }

      // запись по умолчанию, чтобы отобразились элементы
      if (data.length === 0) {
        $scope.status.push({
          id: -1,
          m_status_id: 2,
          m_product_id: 1,
          status_date: new Date(getCurrentDate())
        });
      }
    });

    $http({
      method: "GET",
      url: "/Home/GetComplaintData",
      params: { ID: ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      for (var i = 0; i < data.length; i++) {
        $scope.complaint.push({
          id: data[i].ID,
          o_ank_id: data[i].O_ANK_ID,
          comment: data[i].COMMENT
        });
      }

      // запись по умолчанию, чтобы отобразились элементы
      if (data.length === 0) {
        $scope.complaint.push({
          id: 0,
          o_ank_id: ID,
          comment: ""
        });
      }
    });


    // поле Статусы
    $http({
      "method": "GET",
      "url": "/Home/GetDialogProductStatusList",
      params: {
        o_ank_id: ID
      }
    }).then(function getDialogProductStatusListSuccess(data) {

      $scope.dialogProductStatusList = data.data;

    }, function getDialogProductStatusListFailed(err) {

      $scope.global.showErrorAlert(err.data);

    });



    // поле Товар
    $http({
      "method": "GET",
      "url": "/Home/GetDialogProductList",
      params: {
        o_ank_id: ID
      }
    }).then(function getDialogProductListSuccess(data) {

      $scope.dialogProductList = data.data;

    }, function getDialogProductListFailed(err) {

      $scope.global.showErrorAlert(err.data);

    });

  }

  // добавляем текст в таблицу
  $scope.saveComment = function saveComment() {
    if ($scope.comment != "") {
      if (typeof $scope.global.currentContext !== "undefined") {
        $scope.fio = ($scope.global.userContext["SURNAME"] || "") + " " + ($scope.global.userContext["NAME"] || "");
      }
      var npos = $scope.all_visits + " " + getCurrentDateTime() + " " + $scope.fio;
      var comment = $scope.comment;

      $scope.dialog.unshift({
        id: -1,
        comment: comment,
        npos: npos,
        o_seans_id: laneSeansId
      });
    }

    $scope.comment = "";
  };

  // функция сохранения
  $scope.save = function save() {
    $scope.global.showWaitingForm("Сохранение общения...");

    $scope.O_ANK.O_DIALOG = $scope.dialog;
    $scope.O_ANK.O_STATUS = $scope.status;

    if ($scope.complaint[0].comment !== "") {
    	if ($scope.complaint[0].id === 0) {
    		$scope.complaint[0].id = -1;
    	}
    	$scope.O_ANK.O_COMPLAINT = $scope.complaint;
    }

    $http({
      "method": "POST",
      "url": "/Home/DialogSave",
      data: $scope.O_ANK
    }).success(function (data) {
      if (data["success"] === "true") {
        $scope.global.hideWaitingForm();
        // перезапрашиваю данные Общения
        getDialogData($scope.global.ank.ID);
        loaded = true;
      } else if (data["success"] === "no seans") {
        $scope.global.hideWaitingForm();
        $scope.global.showErrorAlert("Ошибка при сохранении комментария, человек не зарегистрирован на сегодняшнюю дату!!!");
      }
    });
  };

  $scope.statusAdd = function (index) {
    // нельзя создать больше статусов, чем кол-во товаров в справочнике
    var l = $scope.global.manual.M_PRODUCT.length;
    if ($scope.status.length === l) {
      return false;
    }
    $scope.status.push({
      id: -1,
      m_status_id: $scope.global.manual.M_STATUS[0]["ID"],
      m_product_id: $scope.global.manual.M_PRODUCT[0]["ID"],
      status_date: new Date(getCurrentDate())
    });
    // двигаем строки вниз
    $scope.subDialogStatusHeight = $scope.subDialogStatusHeight + 31;
  }

  $scope.statusRemove = function statusRemove(index) {
    $scope.status.splice(index, 1);
    // двигаем строки вниз
    $scope.subDialogStatusHeight = $scope.subDialogStatusHeight - 31;
  };

  // возвращает текущую дату в yyyy-MM-dd
  function getCurrentDate() {
    initDateTime();
    return $scope.year + "-" + $scope.month + "-" + $scope.day;
  }

  // возвращает текущую дату в yyyy-MM-dd H:s
  function getCurrentDateTime() {
    initDateTime();
    return $scope.day + "." + $scope.month + "." + $scope.year + " " + $scope.hours + ":" + $scope.minutes;
  }

  function initDateTime() {
    var d = new Date();

    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var hours = d.getHours();
    var minutes = d.getMinutes();

    if (day <= 9) day = "0" + day;
    if (month <= 9) month = "0" + month;
    if (hours <= 9) hours = "0" + hours;
    if (minutes <= 9) minutes = "0" + minutes;

    $scope.day = day;
    $scope.month = month;
    $scope.year = year;
    $scope.weekday = days[d.getDay()];
    $scope.monthName = months[d.getMonth()];
    $scope.hours = hours;
    $scope.minutes = minutes;

    return false;
  }

  // переходим в анкету
  $scope.editAnk = function editAnk() {
    $scope.global.openAnk($scope.global.ank.ID);
  };


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

    if (newValue == "2" && loaded === false) {

      // перезапрашиваю данные Общения
      getDialogData($scope.global.ank.ID);
      loaded = true;

    }

  });


  // добавить покупку
  $scope.btnDobPokClick = function btnDobPokClick() {

    $scope.global.openUchetSkladRas($scope.global.ank.ID);

  };



  // нажатие по элементу из поля Статусы
  $scope.dialogProductStatusItemClick = function dialogProductStatusItemClick(item) {

    $scope.global.openUchetSkladRasProduct(item.o_sklad_ras_id);

  };

  // нажатие по элементу из поля Товар
  $scope.dialogProductItemClick = function dialogProductItemClick(item) {

    // тоже самое, что и нажатие по элементу из поля Статусы
    $scope.dialogProductStatusItemClick(item);

  };


});