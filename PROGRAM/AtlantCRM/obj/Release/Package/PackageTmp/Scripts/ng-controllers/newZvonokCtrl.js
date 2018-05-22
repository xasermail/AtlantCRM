"use strict";

// контроллер
newZvonokCtrl = myApp.controller("newZvonokCtrl", function newZvonokCtrl($scope, $http, $timeout) {

  var i = 0;
  var loaded = false;

  // при открытии из записи здесь будет идентификатор сеанса
  var zvonokSeansId = null;

  // событие при открытии вкладки
  $scope.$on("global.selectedSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == "6" && loaded === false) {
      $scope.refreshNewZvonok();
      loaded = true;
    }

  });


  $scope.refreshNewZvonok = function refreshNewZvonok() {
    i = 0;
    $scope.curShablonItem = null;

    // Информация о последнем звонке
    $scope.lastZvonok = [];
    // Шаблоны обзвона
    $scope.names = [];
    // Запись на сеанс
    $scope.o_seans = [];
    // ошибка при записи и исключении из отчетов
    $scope.errorIskl = "";
    $scope.errorSeans = "";
    $scope.errorComment = "";
    // красная рамка на поле ввода
    $scope.commentErrorStyle = "";
    $scope.dIsklErrorStyle = "";
    $scope.dateSeansErrorStyle = "";
    // для сохранения
    $scope.O_ZVONOK_DATA = {};
    $scope.O_ZVONOK_DATA.O_ZVONOK = [];
    $scope.O_ZVONOK_DATA.O_SEANS = [];
    $scope.all_visits = "Посещение: ";
    $scope.products = "";
    $scope.age = "";
    $scope.birth = "";
    $scope.phone = $scope.global.ank.PHONE_MOBILE;
    if (!$scope.phone) $scope.phone = $scope.global.ank.PHONE_HOME;

    $scope.item = {};
    $scope.item.showProcessACall = false;

    // сбрасывается, если выбрана новая анкета
    loaded = false;

    // список товаров

    // загружаем данные
    loadZvonokData();

  };

  $scope.shablonSelectClickHandler = function shablonSelectClickHandler(item) {
    $scope.curShablonItem = item;
  };

  // функция сохранения
  $scope.saveShablonData = function saveShablonData() {
    $http({
        method: "POST",
        url: "/Home/SaveShablonData",
        data: $scope.curShablonItem,
        async: true
    }).success(function (data) {
    });
  };

  $scope.deleteShablonData = function deleteShablonData() {
    $http({
        method: "POST",
        url: "/Home/DeleteShablonData",
        data: $scope.curShablonItem,
        async: true
    }).success(function (data) {
    });
  };

  function declOfNum(number, titles) {
    if (number === 1) return titles[0];
    if (number < 0) return titles[0];
    if ((number >= 5) && (number < 22)) return titles[0];
    if ((number >= 2) && (number < 5)) return titles[1];
    var a = number % 10;
    if ((a === 1) || ((a >= 5) && (a <= 9)) || (a === 0)) return titles[0];
    if ((a >= 2) && (a < 5)) return titles[1];
    return titles[0];
  }

  function loadZvonokData() {

    $scope.lastZvonok = [];
    $scope.names = [];
    $scope.o_seans = [];
    $scope.O_ZVONOK_DATA.O_ZVONOK = [];
    $scope.O_ZVONOK_DATA.O_SEANS = [];
    $scope.comment = [];
    var m_seans_time_id = 1;
    $scope.zvonokProductList = [];
    $scope.products = "";

    // запоминаю сеанс, с которого открыли звонки
    zvonokSeansId = $scope.global.zvonok.o_seans_id;
    $scope.global.zvonok.o_seans_id = null;

    $http({
      method: "GET",
      url: "/Home/GetAnkData",
      params: { ID: $scope.global.ank.ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      var v = data.all_visits;
      if ((typeof v !== "undefined") && (v !== null)) {
        if (v === "0") {
          $scope.all_visits = "Посещения: 0 раз";
        } else {
          var a = declOfNum(v, ['раз', 'раза']);
          $scope.all_visits = "Посещения: " + v + " " + a;
        }
        $scope.age = data.age;
        $scope.birth = data.birth;
      }
    });

    $http({
      method: "GET",
      url: "/Home/GetShablonData",
      data: "JSON",
      async: false
    }).success(function (data) {
      for (var i = 0; i < data.length; i++) {
        $scope.names.push({
          ID: data[i].ID,
          SHABLON_NAME: data[i].SHABLON_NAME,
          SHABLON_TEXT: data[i].SHABLON_TEXT
        });
        if (data.length > 0) {
          $scope.curShablonItem = $scope.names[0];
        } else {
          $scope.curShablonItem = null;
        }
      }
    });

    // сведения о последнем звонке
    $http({
      method: "GET",
      url: "/Home/GetLastZvonok",
      params: { ID: $scope.global.ank.ID },
      data: "JSON",
      async: false
    }).success(function (data) {
      $scope.lastZvonok = [];
      for (var i = 0; i < data.length; i++) {

        $scope.lastZvonok.push({
          id: 0,
          m_iskl_id: data[i].M_ISKL_ID,
          d_end_iskl: new Date(data[i].D_END_ISKL),
          checked: false,
          o_ank_id: data[i].O_ANK_ID
        });
      }

      var d = new Date();
      if (data.length === 0) {
        $scope.lastZvonok.push({
          id: 0,
          m_iskl_id: 1,
          d_end_iskl: new Date(),
          checked: false,
          o_ank_id: $scope.global.ank.ID
        });
      }

      if ($scope.lastZvonok[0].d_end_iskl > d) {
        $scope.lastZvonok[0].checked = true;
      } else {
        $scope.lastZvonok[0].checked = false;
      }

      if ($scope.lastZvonok[0].m_iskl_id === null) {
        if (typeof $scope.global.manual.M_PRICH_ISKL !== "undefined") {
          if ($scope.global.manual.M_PRICH_ISKL.length > 0) {
            $scope.lastZvonok[0].m_iskl_id = $scope.global.manual.M_PRICH_ISKL[0]["ID"];
          }
        }
      }

      d = d.setDate(d.getDate() + 1);
      if (($scope.lastZvonok[0].d_end_iskl === null) ||
          (($scope.lastZvonok[0].d_end_iskl < new Date(2000,1,1)))) {
        $scope.lastZvonok[0].d_end_iskl = new Date(d);
      }

      if (typeof $scope.global.manual.M_SEANS_TIME !== "undefined") {
        if ($scope.global.manual.M_SEANS_TIME.length > 0) {
          m_seans_time_id = $scope.global.manual.M_SEANS_TIME[0]["ID"];

          $scope.o_seans = [];
          $scope.o_seans.push({
            id: zvonokSeansId,
            m_seans_time_id: m_seans_time_id,
            seans_date: new Date(d),
            checked: false,
            o_ank_id: $scope.global.ank.ID,
            comment: ""
          });
        }
      }
    });

    // сведения о комментариях
    $http({
      "method": "POST",
      "url": "/Home/GetZvonokCommentData",
      params: { ID: $scope.global.ank.ID }
    }).then(function commentSuccess(data) {
      var d = data.data;
      if ((d !== null) && (typeof d !== "undefined")) {
        for (var i = 0; i < d.length; i++) {
          $scope.comment.push({
            id: d[i]["ID"],
            o_ank_id: d[i]["O_ANK_ID"],
            operator: d[i]["OPERATOR"],
            comment: d[i]["COMMENT"]
          });
        }
      }
      $scope.global.hideWaitingForm();

    }, function commentFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

    // поле Товар
    $http({
      "method": "GET",
      "url": "/Home/GetDialogProductList",
      params: {
        o_ank_id: $scope.global.ank.ID
      }
    }).then(function getDialogProductListSuccess(data) {

      $scope.zvonokProductList = data.data;
      if ($scope.zvonokProductList != null) {
        for (var i = 0; i < $scope.zvonokProductList.length; i++) {
          if (i === 0) {
            $scope.products = $scope.zvonokProductList[i]["product_name"];
          } else {
            $scope.products = $scope.products + "," + $scope.zvonokProductList[i]["product_name"];
          }
        }
      }

    }, function getDialogProductListFailed(err) {

      $scope.global.showErrorAlert(err.data);

    });


    if ($scope.global.ank.ID === 0) {
      $scope.birth = "";
      $scope.age = "";
    }
  }

  // Удаление шаблона
  $scope.shablonDelClickHandler = function shablonDel() {
    $scope.deleteShablonData();
    $scope.names.splice($scope.names.indexOf($scope.curShablonItem), 1);
    if ($scope.names.length > 0) {
      $scope.curShablonItem = $scope.names[0];
    } else {
      $scope.curShablonItem = null;
    }
  };

  // Добавление шаблона
  $scope.shablonNewCommit = function shablonNewCommit() {
    var item = {
      ID: 0,
      SHABLON_NAME: $scope.shablon_name,
      SHABLON_TEXT: $scope.shablon_text
    };
    $scope.names.push(item);

    $scope.curShablonItem = item;
    $scope.saveShablonData();
  };

  // Редактирование шаблона
  $scope.shablonEditCommit = function shablonEdit() {
    $scope.curShablonItem.SHABLON_NAME = $scope.shablon_name;
    $scope.curShablonItem.SHABLON_TEXT = $scope.shablon_text;
    $scope.saveShablonData();
  };

  // Сохранение из модального окна
  $scope.shablonSaveClickHandler = function shablonSaveClickHandler() {
    if ($scope.lastAction === "new") {
      $scope.shablonNewCommit()
    }
    else {
      $scope.shablonEditCommit();
    }
  }

  // пользователь нажал +
  $scope.shablonNewClickHandler = function shablonNewClickHandler() {
    $scope.lastAction = "new";
    $scope.shablon_name = "Новый шаблон";
    $scope.shablon_text = "";
    $scope.modalCaption = "Добавление";
    $('#shablonSelectModal').modal("show");
  };

  // пользователь нажал I
  $scope.shablonEditClickHandler = function shablonEditClickHandler() {
    $scope.lastAction = "edit";
    $scope.shablon_name = $scope.curShablonItem.SHABLON_NAME;
    $scope.shablon_text = $scope.curShablonItem.SHABLON_TEXT;
    $scope.modalCaption = "Изменение";
    $('#shablonSelectModal').modal("show");
  };

  // при нажатии на галочку "Исключить...", проверяет заполненный комментарий
  $scope.checkIskl = function checkIskl() {
    var c = $scope.lastZvonok[0].comment;
    if (($scope.lastZvonok[0].checked === true) && (c === "")) {
      SetCommentError();
    } else {
      SetCommentNoError();
    }
  }

  $scope.checkCommentEnter = function checkCommentEnter() {
    var c = $scope.lastZvonok[0].comment;
    if ((c === "") && ($scope.commentErrorStyle !== "")) {
      SetCommentError();
      return false;
    } else {
      SetCommentNoError();
    }

    if ((c === "") && ($scope.lastZvonok[0].checked === true)) {
      SetCommentError();
      $scope.lastZvonok[0].checked = true;
    }
  }

  function SetCommentError() {
    $scope.commentErrorStyle = "border: 1px solid red";
    $scope.errorComment = "Необходимо заполнить комментарий";
    $scope.lastZvonok[0].checked = false;
  }

  function SetCommentNoError() {
    $scope.commentErrorStyle = "";
    $scope.errorComment = "";
  }

  function SetDateError() {
    return "Выбранная дата должна быть больше текущей";
  }

  function SetEmptyDateError() {
    return "Не выбрана дата";
  }

  function SetDateNoError() {
    return "";
  }

  function SetExistSeansError(time) {
    return "Уже есть запись на " + time;
  }

  // сохраняем
  $scope.saveZvonok = function saveZvonok() {
    // логика поменялась
    // дата и причина исключения отображается из последней записи
    // комментарий заносится в новую запись
    // и если дата исключения есть, то запись дополняется причиной и датой
    $scope.lastZvonok[0].id = 0;

    // комментарий пуст - проверяем всегда
    var c = $scope.lastZvonok[0].comment;
    if ((c === "") || (typeof c === "undefined")) {
      SetCommentError();
      return false;
    } else {
      SetCommentNoError();
    }

    if ($scope.lastZvonok[0].checked === true) {
      // не заполнена дата исключения
      if (($scope.lastZvonok[0].d_end_iskl === null)) {
        $scope.errorIskl = SetEmptyDateError();
        return false;
      } else {
        $scope.errorIskl = SetDateNoError();
      }

      // дата исключения меньше текущей
      var d_end = new Date();
      var d = new Date($scope.lastZvonok[0].d_end_iskl);
      if (d <= d_end) {
        $scope.errorIskl = SetDateError();
        return false;
      } else {
        $scope.errorIskl = SetDateNoError();
      }
    } else {
      $scope.lastZvonok[0].d_end_iskl = null;
      $scope.lastZvonok[0].m_iskl_id = null;
    }

    if ($scope.lastZvonok[0].o_ank_id === 0) {
      $scope.lastZvonok[0].o_ank_id = $scope.global.ank.ID;
    }

    $scope.global.showWaitingForm("Сохранение информации о звонке...");
    $scope.O_ZVONOK_DATA.O_ZVONOK = $scope.lastZvonok;

    $http({
      "method": "POST",
      "url": "/Home/SaveZvonokData",
      data: $scope.O_ZVONOK_DATA
    }).success(function (data) {
      $scope.global.hideWaitingForm();
      $scope.global.showWaitingForm("Загрузка данных...");
      loadZvonokData();
      $scope.global.hideWaitingForm();
    });
  }

  $scope.saveSeans = function saveSeans() {
    // если не отмечено галочкой, выходим
    if ($scope.o_seans[0].checked === false) {
      return false;
    }
    // не заполнена дата
    if ($scope.o_seans[0].seans_date === null) {
      $scope.errorSeans = SetEmptyDateError();
      return false;
    } else {
      $scope.errorSeans = SetDateNoError();
    }

    // дата записи на сеанс
    var seans_date = new Date();
    var d = new Date($scope.o_seans[0].seans_date);
    if ((d <= seans_date) && ($scope.o_seans[0].checked === true)) {
      $scope.errorSeans = SetDateError();
      return false;
    } else {
      $scope.errorSeans = SetDateNoError();
    }

    // проверяем день записи, что он является рабочим
    if ($scope.global.function.isWeekEndDay(d)) {
      $scope.errorSeans = "Выбран выходной день";
      return false;
    } else {
      $scope.errorSeans = SetDateNoError();
    }

    if ($scope.o_seans[0].o_ank_id === 0) {
      $scope.o_seans[0].o_ank_id = $scope.global.ank.ID;
    }

    $scope.global.showWaitingForm("Сохранение записи...");
    $scope.O_ZVONOK_DATA.O_SEANS = $scope.o_seans;

    // признак сохранения/изменения сеанса из Звонка
    $scope.O_ZVONOK_DATA.O_SEANS[0].FROM_ZVONOK = 1;

    $http({
      "method": "POST",
      "url": "/Home/SaveZvonokData",
      data: $scope.O_ZVONOK_DATA
    }).success(function (data) {
      if (data["success"] === "true") {
        $scope.global.hideWaitingForm();
      } else if (data["success"] === "exists") {
        $scope.global.hideWaitingForm();
        $scope.errorSeans = SetExistSeansError(data["time"]);
      }
    });
  }

  $scope.clearError = function clearError() {
    $scope.errorSeans = SetDateNoError();
  }

  // если выбрали новую анкету, сбрасываю признак открытия режима
  $scope.$on("openAnk", function selectedSubMenuItemChanged(event, newValue) {
    loaded = false;
  });

  // если нажали на подвкладку "Новый", то создаётся новая Анкета,
  // сбрасываю признак открытия режима
  $scope.$on("menuItemNewClick", () => {
    loaded = false;
  });

  $scope.setChecked = function setChecked() {
    if ($scope.o_seans[0].checked === false) {
      $scope.o_seans[0].checked = true;
    } else {
      $scope.o_seans[0].checked = false;
    }
  }
  
});
