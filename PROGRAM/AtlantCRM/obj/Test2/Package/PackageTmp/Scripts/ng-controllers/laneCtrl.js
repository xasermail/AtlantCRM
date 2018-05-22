"use strict";

// контроллер
laneCtrl = myApp.controller("laneCtrl", function laneCtrl($scope, $http, $timeout) {

  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemRyadi") {
      $scope.refreshLane();
    }

  });


  $scope.refreshLane = function refreshLane() {
    $scope.o_seans = [];
    $scope.O_SEANS_tmp = {};
    $scope.O_SEANS = [];
    $scope.o_seans_comment = [];
    $scope.O_SEANS_ANK = [];
    $scope.O_RECORD = {};
    $scope.comment = "";

    $scope.notValidDate = "";
    $scope.existsSeans = "";

    $scope.day = "";
    $scope.month = "";
    $scope.year = "";
    $scope.weekday = "";
    $scope.monthName = "";
    $scope.hours = "";
    $scope.minutes = "";
    $scope.dayWeekDate = "";
    $scope.yearMonthDay = "";

    // запись на новый сеанс
    $scope.zapisatNaSeansLeft = 0;
    $scope.zapisatNaSeansTop = 0;
    $scope.zapisatNaSeans = 0;
    $scope.zapisatNaSeansHeight = 115;
    $scope.notValidDateHeight = 1;

    // создать анкету и записать на сеанс
    $scope.newAnkNaSeansLeft = 0;
    $scope.newAnkNaSeansTop = 0;
    $scope.newAnkNaSeans = 0;
    $scope.newAnkHeight = 175;
    $scope.existsSeansHeight = 1;

    // право на заполнение комментария у директора
    if ($scope.global.userContext.S_USER_ROLE_ID === $scope.global.const.S_USER_ROLE_ID_DIREKTOR) {
      $scope.editComment = 1;
    } else {
      $scope.editComment = 0;
    }


    // проверка, что заполнены справочники
    if (!($scope.global.function.checkManualsFull())) {
      $scope.global.selectedMenuItem = "";
      return false;
    }


    // кол-во мест
    $scope.placeCount = 0;
    if (typeof $scope.global.manual.M_SEANS_PLACE !== "undefined") {
      $scope.placeCount = $scope.global.manual.M_SEANS_PLACE.length;
    }

    initDateTime(0); // текущая дата + 0, т.е. сегодня

    if (typeof $scope.global.manual.M_SEANS_TIME !== "undefined") {
      if ($scope.global.manual.M_SEANS_TIME.length > 0) {
        $scope.selectedTimeId = 0;
        for (var i = 0; i < $scope.global.manual.M_SEANS_TIME.length; i++) {
          // новая фича - при входе в ряды отображаем текущий сеанс
          var p = $scope.global.manual.M_SEANS_TIME[i];
          if (typeof p !== "undefined") {
            var c = new Date();
            var a = new Date($scope.yearMonthDay + " " + p["MIN_TIME"] + ":00");
            var b = new Date($scope.yearMonthDay + " " + p["MAX_TIME"] + ":00");
            if ((c >= a) && (c <= b)) {
              $scope.seans_time = p["NAME"];
              $scope.selectedButton = p;
              $scope.selectedTimeId = p["ID"];
              $scope.workDayError = "";
            }
          }
        }
        // время вышло, отображаем первый сеанс
        if ($scope.selectedTimeId === 0) {
          $scope.seans_time = $scope.global.manual.M_SEANS_TIME[0]["NAME"];
          $scope.selectedButton = $scope.global.manual.M_SEANS_TIME[0];
          $scope.selectedTimeId = $scope.global.manual.M_SEANS_TIME[0]["ID"];
          $scope.workDayError = "";
        }
        // запрашиваем данные
        getSeansData($scope.yearMonthDay, $scope.selectedTimeId);
      } else {
        $scope.workDayError = "Cправочник 'График работы' не заполнен";
      }
    }

    // получаем комментарий
    getSeansComment($scope.yearMonthDay);

    // календарь рабочих дней не заполнен
    $scope.workDayError = "";
  };

  // дата сеанса
  function initDateTime(x) {
    var d = new Date();
    if (x !== 0) {
      if ($scope.yearMonthDay === "") {
        d = new Date();
      } else {
        d = new Date($scope.yearMonthDay);
      }
    }
    d.setDate(d.getDate() + x);

    // пропускаем выходные
    var curr_day = d.getDay();
    var exists = 0;
    var work_count = 0;

    while (exists === 0) {
      work_count = 0;
      if (typeof $scope.global.manual.M_WORK_DAY !== "undefined") {
        for (var i = 0; i < $scope.global.manual.M_WORK_DAY.length; i++) {
          var w = $scope.global.manual.M_WORK_DAY[i]["DAY_ID"];
          if (curr_day === w) {
            exists = 1;
          }
          work_count++;
        }
      }
      // если день не найден в календаре, добавляем/отнимаем день (нажали вперед/назад), пока не найдем
      if (exists === 0) {
        if (x !== 0) {
          d.setDate(d.getDate() + x);
        } else {
          d.setDate(d.getDate() + 1); // при загрузке движемся вперед, к ближайшему дню
        }
        curr_day = d.getDay();
      }
    }

    var day = d.getDate();
    var month = d.getMonth()+1;
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

    $scope.yearMonthDay = $scope.year + "-" + $scope.month + "-" + $scope.day;

    // день недели, число, месяц текущей даты
    $scope.dayWeekDate = $scope.weekday + " " + d.getDate() + " " + $scope.monthName;
  }

  // выбор данных на день
  $scope.getData = function getDataNow(x) {
    // открытые окна прячем
    $scope.zapisatNaSeans = 0;
    $scope.newAnkNaSeans = 0;

    initDateTime(x);
    var seans_time_id = $scope.selectedTimeId;
    var date = $scope.yearMonthDay;

    if (typeof seans_time_id === "undefined") {
      $scope.workDayError = "Cправочник 'График работы' не заполнен";
      return false;
    } else {
      $scope.workDayError = "";
    }

    getSeansData(date, seans_time_id);
    //комментарий на день
    getSeansComment($scope.yearMonthDay);
  };

  // выбор данных по времени
  $scope.btnTimeClickHandler = function btnTimeClickHandler(item) {
    // открытые окна прячем
    $scope.zapisatNaSeans = 0;
    $scope.newAnkNaSeans = 0;

    $scope.selectedButton = item;
    var seans_time_id = item.ID;
    var date = $scope.yearMonthDay;
    $scope.selectedTimeId = item.ID;
    $scope.seans_time = item.NAME;

    getSeansData(date, seans_time_id);
  };

  // записать - нажатие на черный квадратик
  $scope.btnZapisatNaSeansClickHandler = function btnZapisatNaSeansClickHandler(e) {

    // право на редактирование
    if ($scope.global.lanePravoWrite === 0) return false;

    // если показана форма по пустой ячейке, скрываем
    if ($scope.newAnkNaSeans === 1) {
      $scope.newAnkNaSeans = 0;
    }

    var d = new Date();
    // запись всегда завтра и позднее на ближайший рабочий день, пропускаем выходные
    d.setDate(d.getDate() + 1);
    var curr_day = d.getDay();
    var exists = 0;
    var work_count = 0;
    var x = 1;

    while (exists === 0) {
      work_count = 0;
      if (typeof $scope.global.manual.M_WORK_DAY !== "undefined") {
        for (var i = 0; i < $scope.global.manual.M_WORK_DAY.length; i++) {
          var w = $scope.global.manual.M_WORK_DAY[i]["DAY_ID"];
          if (curr_day === w) {
            exists = 1;
          }
          work_count++;
        }
      }

      // если день не найден в календаре, добавляем день, пока не найдем
      if (exists === 0) {
        d.setDate(d.getDate() + 1); // при загрузке движемся вперед, к ближайшему дню
        curr_day = d.getDay();
      }
    }
    
    var elem = e.currentTarget;
    $scope.O_SEANS = [];
    $scope.O_SEANS.push({
      o_ank_id: parseInt(elem.attributes[0].value),
      m_seans_time_id: parseInt(elem.attributes[1].value),
      m_ryad_id: parseInt(elem.attributes[2].value),
      id: parseInt(elem.attributes[3].value),
      seans_date: d
    });

    $scope.zapisatNaSeansLeft = $(elem).offset().left;
    $scope.zapisatNaSeansTop = $(elem).offset().top - 165; 
    $scope.zapisatNaSeansHeight = 210;
    $scope.notValidDateHeight = 1;
    $scope.zapisatNaSeans = 1;
  };

  // скрываем форму записи
  $scope.btnOtmenitZapis = function btnOtmenitZapis(x) {
    $scope.zapisatNaSeansHeight = 210;
    $scope.notValidDateHeight = 1;
    $scope.notValidDate = "";
    $scope.O_SEANS = [];
    $scope.zapisatNaSeans = x;
  }

  // сохранение записи
  $scope.btnZapisatNaSeans = function btnZapisatNaSeans(x) {

    // право на редактирование
    if ($scope.global.lanePravoWrite === 0) return false;

    var now = new Date();
    var d = new Date($scope.O_SEANS[0].seans_date);

    if (d < now) {
      $scope.zapisatNaSeansHeight = 230;
      $scope.notValidDateHeight = 20;
      $scope.notValidDate = "На дату запись невозможна";
      return false;
    } else {
      $scope.zapisatNaSeansHeight = 210;
      $scope.notValidDateHeight = 1;
      $scope.notValidDate = "";
    }

    // проверяем день записи, что он является рабочим
    if ($scope.global.function.isWeekEndDay(d)) {
      $scope.zapisatNaSeansHeight = 230;
      $scope.notValidDateHeight = 20;
      $scope.notValidDate = "Выбран выходной день";
      return false;
    } else {
      $scope.zapisatNaSeansHeight = 210;
      $scope.notValidDateHeight = 1;
      $scope.notValidDate = "";
    }

    var a = {
      o_ank_id: $scope.O_SEANS[0].o_ank_id,
      m_seans_time_id: $scope.O_SEANS[0].m_seans_time_id,
      m_ryad_id: $scope.O_SEANS[0].m_ryad_id,
      seans_date: $scope.O_SEANS[0].seans_date,
      id: $scope.O_SEANS[0].id  // передаем Ид для сохранения общения
    };

    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/SeansSave",
      data: { s: a, comment: $scope.comment }
    }).success(function (data) {
      $scope.global.hideWaitingForm();
      if (data["success"] === "true") {
        $scope.notValidDate === "";
        $scope.zapisatNaSeansHeight = 210;
        $scope.notValidDateHeight = 1;
        $scope.zapisatNaSeans = x;
        var date = $scope.yearMonthDay;
        getSeansData(date, $scope.O_SEANS[0].m_seans_time_id);
        $scope.O_SEANS = [];
      } else if (data["success"] === "exists") {
        $scope.zapisatNaSeansHeight = 230;
        $scope.notValidDateHeight = 20;
        $scope.notValidDate = "Уже есть запись на " + data["time"];
      }
    }).error(function (err) {
      $scope.global.hideWaitingForm();
      $scope.global.showErrorAlert(err);
    });
  }

  // записать - нажатие на пустую ячейку таблицы
  $scope.tdZapisatNaSeansClickHandler = function tdZapisatNaSeansClickHandler(e) {
    // если див уже показан, скрываем и выходим
    if ($scope.newAnkNaSeans === 1) {
      $scope.newAnkNaSeans = 0;
      $scope.newAnkHeight = 175;
      $scope.existsSeansHeight = 1;
      $scope.existsSeans = "";
      return false;
    }

    // право на редактирование
    //if ($scope.global.lanePravoWrite === 0) return false;

    // на прошлую дату не записываем
    var now = new Date();
    var d = new Date($scope.yearMonthDay);

    var day = now.getDate();
    var month = now.getMonth() + 1;
    var year = now.getFullYear();
    if (day <= 9) day = "0" + day;
    if (month <= 9) month = "0" + month;
    var dt = year + "-" + month + "-" + day;
    var bez_reg = 0;

    // вписываем человека в ряды только в рамках сеанса
    var p = $scope.global.manual.M_SEANS_TIME.find(x => x["ID"] === $scope.selectedTimeId);
    if (typeof p !== "undefined") {
      var c = new Date();
      var a = new Date($scope.yearMonthDay + " " + p["MIN_TIME"] + ":00");
      var b = new Date($scope.yearMonthDay + " " + p["MAX_TIME"] + ":00");
      // сеанс либо еще не начался, либо уже прошел
      if ((c < a) || (b < c)) {
        return false;
      }
    }

    // если в ряды сегодня напрямую вписали человека, это запись без регистрации
    if ($scope.yearMonthDay === dt) {
      bez_reg = 1;
    } else if (d < now) {
      $scope.newAnkNaSeans = 0;
      return false;
    }

    // если показана форма по черной кнопке, скрываем
    if ($scope.zapisatNaSeans === 1) {
      $scope.zapisatNaSeans = 0;
    }

    var elem = e.currentTarget;
    var ryad_id = parseInt(elem.attributes[0].value);

    $scope.O_SEANS = [];
    $scope.O_SEANS.push({
      m_seans_time_id: $scope.selectedTimeId,
      m_ryad_id: ryad_id,
      seans_date: new Date($scope.yearMonthDay),
      bez_reg: bez_reg
    });

    $scope.O_SEANS_ANK = [];
    $scope.O_SEANS_ANK.push({
      fio_reg: ""
    });

    $scope.newAnkNaSeansLeft = $(elem).offset().left;
    $scope.newAnkNaSeansTop = $(elem).offset().top + elem.offsetHeight - 80;
    $scope.newAnkNaSeans = 1;
    $scope.existsSeansHeight = 1;
    $scope.newAnkHeight = 175;

    $scope.newAnkErrorHeight = 0;
    $scope.newAnkError = "";
  }


  // скрываем форму записи на пустой строке таблицы
  $scope.btnNewdAnk = function btnNewdAnk() {
    var surname = $scope.O_SEANS_ANK[0].surname;
    var name = $scope.O_SEANS_ANK[0].name;
    var secname = $scope.O_SEANS_ANK[0].secname;
    var phone_mobile = $scope.O_SEANS_ANK[0].phone_mobile;

    $scope.newAnkNaSeans = 0;
    $scope.O_SEANS = [];
    $scope.O_SEANS_ANK = [];
    $scope.newAnkErrorHeight = 0;
    $scope.newAnkError = "";

    $scope.global.createAnk({ SURNAME: surname, NAME: name, SECNAME: secname, PHONE_MOBILE: phone_mobile });
  }

  $scope.btnSozdatAnk = function btnSozdatAnk() {

    var phone = $scope.O_SEANS_ANK[0].phone_mobile;
    var surname = $scope.O_SEANS_ANK[0].surname;
    var name = $scope.O_SEANS_ANK[0].name;
    var secname = $scope.O_SEANS_ANK[0].secname;

    if (typeof phone === "undefined") {
      $scope.newAnkHeight = 195;
      $scope.newAnkErrorHeight = 20;
      $scope.newAnkError = "Не указан телефон";
      return false;
    }

    $scope.O_RECORD.O_ANK = {
      SURNAME: surname,
      NAME: name,
      SECNAME: secname,
      PHONE_MOBILE: phone
    };

    $scope.O_RECORD.O_SEANS = {
      M_SEANS_TIME_ID: $scope.O_SEANS[0].m_seans_time_id,
      M_RYAD_ID: $scope.O_SEANS[0].m_ryad_id,
      SEANS_DATE: $scope.O_SEANS[0].seans_date,
      BEZ_REG: $scope.O_SEANS[0].bez_reg
    };

    //$scope.O_RECORD.O_ANK.PHONE_MOBILE = $scope.global.function.phoneMaskClear($scope.O_RECORD.O_ANK.PHONE_MOBILE);

    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/NewAnkAndSignUpSeans",
      data: $scope.O_RECORD
    }).success(function (data) {
      $scope.global.hideWaitingForm();
      if (data["success"] === "true") { // успешно записали
        $scope.existsSeans === "";
        $scope.newAnkError = "";
        $scope.newAnkHeight = 175;
        $scope.existsSeansHeight = 1;
        $scope.newAnkErrorHeight = 1;
        $scope.newAnkNaSeans = 0;
        $scope.O_SEANS = [];
        $scope.O_SEANS_ANK = [];
        var date = $scope.yearMonthDay;
        getSeansData($scope.yearMonthDay, $scope.selectedTimeId);
        getSeansComment($scope.yearMonthDay);
      } else if (data["success"] === "exists") {
        $scope.newAnkHeight = 195;
        $scope.existsSeansHeight = 20;
        $scope.existsSeans = "Уже есть запись на " + data["time"];
        $scope.newAnkNaSeans = 1;
      } else if (data["success"] === "fio") {
        $scope.global.hideWaitingForm();
        $scope.newAnkHeight = 195;
        $scope.newAnkErrorHeight = 20;
        $scope.newAnkError = "Для создания анкеты укажите ФИО полностью";
        $scope.newAnkNaSeans = 1;
      } else if (data["success"] === "dubli") {
        $scope.global.hideWaitingForm();
        $scope.newAnkHeight = 195;
        $scope.newAnkErrorHeight = 20;
        $scope.newAnkError = "Телефон указан в анкетах " + data["time"];
        $scope.newAnkNaSeans = 1;
      }
    }).error(function (err) {
      $scope.global.hideWaitingForm();
      $scope.global.showErrorAlert(err);
    });
  }

  // загрузка данных на дату / время
  function getSeansData(date, seans_time_id) {
    var i = 0;
    $http({
      method: "GET",
      url: "/Home/GetSeansData",
      params: {
        DATE: date,
        M_SEANS_TIME_ID: seans_time_id // запрашиваем на первое время 09:00-09:40
      },
      data: "JSON",
      async: false
    }).success(function (data) {
      // очищаем массив
      $scope.o_seans = [];
      for (var i = 0; i < data.length; i++) {
        var tdColor1 = "";
        var textColor1 = "";
        var tdColor2 = "";
        var textColor2 = "";

        // сегодня было общение
        if (data[i].dialog1 === 1) {
          tdColor1 = "#fcff68";
        }

        if (data[i].dialog2 === 1) {
          tdColor2 = "#fcff68";
        }

        // анкета заведена на дату
        if (data[i].date_reg1 === $scope.yearMonthDay) {
          textColor1 = "#00CC00";
        } else if (data[i].visits1 >= 2 && data[i].visits1 < 20) {
          textColor1 = "#0066FF";
        } else if (data[i].visits1 >= 20) {
          textColor1 = "#9900FF";
        }

        // анкета заведена на дату 
        if (data[i].date_reg2 === $scope.yearMonthDay) {
          textColor2 = "#00CC00";
        } else if (data[i].visits2 >= 2 && data[i].visits1 < 20) {
          textColor2 = "#0066FF";
        } else if (data[i].visits2 >= 20) {
          textColor2 = "#9900FF";
        }
        $scope.o_seans.push({
          id: data[i].id,
          seans_state1: data[i].seans_state1,
          m_ryad_id1: data[i].m_ryad_id1,
          m_seans_time_id1: data[i].m_seans_time_id1,
          o_ank_id1: data[i].o_ank_id1,
          seans_date1: data[i].seans_date1,
          fio1: data[i].fio1,
          birth1: data[i].birth1,
          tdColor1: tdColor1,
          textColor1: textColor1,
          id1: data[i].id1,

          seans_state2: data[i].seans_state2,
          m_ryad_id2: data[i].m_ryad_id2,
          m_seans_time_id2: data[i].m_seans_time_id2,
          o_ank_id2: data[i].o_ank_id2,
          seans_date2: data[i].seans_date2,
          fio2: data[i].fio2,
          birth2: data[i].birth2,
          tdColor2: tdColor2,
          textColor2: textColor2,
          id2: data[i].id2
        });
      }

      // еще один элемент, для записи незарегистрированных
      $scope.o_seans.push({
        o_ank_id1: 0,
        fio1: "",
        fio2: "",
        tdColor1: "",
        tdColor2: ""
      });
    }).error(function (err) {
      $scope.global.showErrorAlert(err);
      $scope.global.hideWaitingForm();
    });
  }

  // получаем комментарий на дату
  function getSeansComment(date) {
    $scope.o_seans_comment = [];
    $scope.seans_comment = "";

    var i = 0;
    $http({
      method: "GET",
      url: "/Home/GetSeansComment",
      params: {
        DATE: date
      },
      data: "JSON",
      async: false
    }).success(function (data) {
      for (var i = 0; i < data.length; i++) {
        $scope.seans_comment = data[i].COMMENT;
        $scope.o_seans_comment.push({
          id: data[i].ID,
          comment: data[i].COMMENT,
          seans_date: data[i].SEANS_DATE
        });
      }
    }).error(function (err) {
      $scope.global.showErrorAlert(err);
      $scope.global.hideWaitingForm();
    });
  }

  // сохраняем введенный комментарий,
  // или удаляем, если поле очистили
  $scope.saveComment = function saveComment() {
    if ($scope.o_seans_comment.length === 0) {
      $scope.o_seans_comment.push({
        id: 0,
        comment: $scope.seans_comment,
        seans_date: $scope.yearMonthDay
      });
    } else {
      $scope.o_seans_comment[0].comment = $scope.seans_comment;
    }
    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/SeansCommentSave",
      data: $scope.o_seans_comment
    }).success(function (data) {
      $scope.global.hideWaitingForm();
      getSeansComment($scope.yearMonthDay);
    }).error(function (err) {
      $scope.global.showErrorAlert(err);
      $scope.global.hideWaitingForm();
    });
  };


  // перейти в режим Общение
  $scope.openDialogRej = function openDialogRej(ank_id, seans_id) {
    $scope.global.dialog.o_seans_id = seans_id;
    $scope.global.openAnk(ank_id);
    $scope.global.openAnkDone = () => {
      $timeout(() => {
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.selectedSubMenuItem = 2;
      }, 10);
    };
  };

  // маска телефона
  $("#lanePhoneMobile").mask("+7(999) 999-99-99");

});