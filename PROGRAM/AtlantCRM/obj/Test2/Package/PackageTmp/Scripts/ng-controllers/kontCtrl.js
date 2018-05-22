"use strict";

// контроллер
kontCtrl = myApp.controller("kontCtrl", function kontCtrl($scope, $http) {

//значение смещения вверх для появляющихся окошек
  $scope.offsetInTop = -80;

  $scope.modeAddKont = 1; //режим добавления нового контакта
  $scope.modeChangeKont = 2;  //режим изменения существующиего контакта
  $scope.currentMode = $scope.modeAddKont;  //текущий режим

  // маска телефона
  $("#kontPhoneMobile").mask("+7(999) 999-99-99");


  // блокировка кнопки сохранения, чтобы не создавать дубли
  $scope.btnCreateNewKontDisabled = false;

  // реакция на открытие подвкладки (реагируем именнно так потому что авжно что ыб происходило
  // перезаполение при переходе между внутренними вкладками)
  $scope.$on("global.selectedKontSubMenuItemChanged", function selectedKontSunMenuItemChanged(event, newValue) {
   
    // срабатывает, только если открыта вкладка Контакты
    if (newValue == "0" && $scope.global.selectedMenuItem === "menuItemKont") {
      $scope.refreshKont();
    }

  });


  // событие при открытии вкладки Контакты
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    // если открыто подменю Запись
    if (newValue === "menuItemKont" && $scope.global.selectedKontSubMenuItem == "0") {
      $scope.refreshKont();
    }

  });

  // обновление данных вкладки Запись
  $scope.refreshKont = function refreshKont() {

    // проверка, что заполнены справочники
    if (!($scope.global.function.checkManualsFull())) {
      $scope.global.selectedMenuItem = "";
      return false;
    }

    //если дата еще не задана задаем
    if (typeof $scope.yearMonthDay == "undefined") {
      $scope.yearMonthDay = "";
      $scope.newAnkNaSeans = 0;
      initDateTime(1);
    }

    ////приводим вкладку к начальному виду (могли быть открыты окна)
    //closeAllWindow();
    //перезапрашиваем данные на выбранный день
    getData($scope.yearMonthDay);


  };

  // выбор данных на день
  $scope.getDataClick = function getDataClick(x) {
    closeAllWindow();
    // на завтра
    if (x === 0) {
      $scope.yearMonthDay = "";
      initDateTime(1);
      $scope.tomorrowClick = 0;
    } else {
      initDateTime(x);
    }
    if (x < 0) {
      $scope.backClick = 0;
    } else if (x === 1) {
      $scope.nextClick = 0;
    }
    getData($scope.yearMonthDay);
  }

  //запрос данных
  function getData(date) {
    $scope.o_seans_header = [];
    //формирование заголовока таблицы
    if (typeof $scope.global.manual.M_SEANS_TIME !== "undefined") {
      for (var i = 0; i < $scope.global.manual.M_SEANS_TIME.length; i++) {
        $scope.o_seans_header.push({
          id: $scope.global.manual.M_SEANS_TIME[i]["ID"],
          time: $scope.global.manual.M_SEANS_TIME[i]["MIN_TIME"]
        });
      }
    }

    //получение остальных данных
    var d = Date.parse(date);
    if (isNaN(d)) {
      d = null;
    } else {
      d = new Date(date);
    }

    $http({
      method: "GET",
      url: "/Home/GetKontacksByDay",
      params: {
        date: d
      }
    }).success(function (data) {
      $scope.dataForTable = data;
    });

    //отвечают за блокировку кнопок, возмодно стоит просто убрать отсюда и из разметки
    $scope.nextClick = 1;
    $scope.backClick = 1;
    $scope.tomorrowClick = 1;
  }

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
    var month = d.getMonth() + 1;
    var year = d.getFullYear();

    if (day <= 9) day = "0" + day;
    if (month <= 9) month = "0" + month;

    $scope.day = day;
    $scope.month = month;
    $scope.year = year;
    $scope.weekday = days[d.getDay()];
    $scope.monthName = months[d.getMonth()];
    $scope.usingDate = d;
    $scope.yearMonthDay = $scope.year + "-" + $scope.month + "-" + $scope.day;
    // день недели, число, месяц текущей даты
    $scope.dayWeekDate = $scope.weekday + " " + d.getDate() + " " + $scope.monthName;
  }

  // --== Добавление контакта ==--
  // нажатие на пустую ячейку таблицы
  $scope.tdAddKontClickHandler = function tdAddKontClickHandler(e) {
    closeAllWindow();
    $scope.currentMode = $scope.modeAddKont;
    // права на запись
    if ($scope.global.contactPravoWrite === 0) return false;

    var elem = e.currentTarget;
    var m_seans_time_id = parseInt(elem.attributes[1].value);

    // на сегодняшнюю или прошлую дату не записываем
    var now = new Date();
    var d = new Date($scope.yearMonthDay);
    if (d <= now) {
      $scope.newAnkNaSeans = 0;
      return false;
    }

    $scope.newAnkNaSeansLeft = $(elem).offset().left;
    $scope.newAnkNaSeansTop = $(elem).offset().top + elem.offsetHeight + $scope.offsetInTop;
    $scope.newAnkNaSeans = 1;
    $scope.existsSeansHeight = 1;
    $scope.newAnkHeight = 175;
    $scope.currentTimeIdForCreateNewKont = m_seans_time_id;

    // маска телефона
    $("#kontPhoneMobile").mask("+7(999) 999-99-99");

  }

  // нажатие на пустую ячейку таблицы
  $scope.tdChangeKontClickHandler = function tdChangeKontClickHandler(e) {
    closeAllWindow();
    $scope.currentMode = $scope.modeChangeKont;
    // права на запись
    if ($scope.global.contactPravoWrite === 0) return false;

    var elem = e.currentTarget;

    $scope.newKontSurname = elem.attributes[0].value;
    $scope.newKontName = elem.attributes[1].value;
    $scope.newKontSecname = elem.attributes[2].value;
    $scope.newKontPhone_mobile = elem.attributes[3].value;
    $scope.commentForSave = elem.attributes[4].value;
    $scope.kontID = elem.attributes[5].value;

    $scope.newAnkNaSeansLeft = $(elem).offset().left;
    $scope.newAnkNaSeansTop = $(elem).offset().top + elem.offsetHeight + $scope.offsetInTop;
    $scope.newAnkNaSeans = 1;
    $scope.existsSeansHeight = 1;
    $scope.newAnkHeight = 175;

    
    
    // маска телефона
    $("#kontPhoneMobile").mask("+7(999) 999-99-99");

  }

  //Кнопка "Х" в окошке нового контакта
  $scope.btnCloseNewKont = function btnCloseNewKont() {
    closeAllWindow();
  }

  //Кнопка "Сохранить" в окошке нового контакта
  $scope.btnCreateNewKont = function btnCreateNewKont() {

    // блокирую кнопку сохранения, чтобы не создавать дубли
    $scope.btnCreateNewKontDisabled = true;

    //востанавливаем корректный вид окошка
    $scope.errorSaveNewKont = "";
    $scope.newAnkHeight = 175;

    //если не введен телефон добавляем текст ошибки
    if ($scope.newKontPhone_mobile === "") {
      $scope.errorSaveNewKont = "Не заполнен телефон. ";
      $scope.btnCreateNewKontDisabled = false;
    }

    //если не введено не обного значения из ФИО, добавляем текст ошибки
    if ($scope.newKontSurname === ""
        && $scope.newKontName === ""
        && $scope.newKontSecname === "") {
      $scope.errorSaveNewKont = $scope.errorSaveNewKont + "Не заполнено ФИО.";
      $scope.btnCreateNewKontDisabled = false;
    }

    //если текст ошибки не пуст, выводим его и останавливаем сохранение
    if ($scope.errorSaveNewKont != "") {
      $scope.newAnkHeight = 195;
      $scope.btnCreateNewKontDisabled = false;
      return;
    }
    if ($scope.currentMode == $scope.modeChangeKont)
    {
      $http({
        "method": "POST",
        "url": "/Home/ChangeKont",
        params: {
          surname: $scope.newKontSurname,
          name: $scope.newKontName,
          secname: $scope.newKontSecname,
          phone: $scope.newKontPhone_mobile,
          commentForSave: $scope.commentForSave,
          kontID: $scope.kontID
        }
      }).
      success(function (data) {
       if (data["success"] === "true") {
         closeAllWindow();
         getData($scope.yearMonthDay);
       } else if (data["success"] === "exists") {
         $scope.errorSaveNewKont = "Номер уже существует";
         $scope.btnCreateNewKontDisabled = false;
       }
     }).catch((err) => {
       $scope.global.showErrorAlert("Ошибка: " + JSON.stringify(err.data));
     }).finally(() => {
       $scope.btnCreateNewKontDisabled = false;
     });
    }
    else if ($scope.currentMode == $scope.modeAddKont) {
      $http({
        "method": "POST",
        "url": "/Home/CreateNewKont",
        params: {
          surname: $scope.newKontSurname,
          name: $scope.newKontName,
          secname: $scope.newKontSecname,
          phone: $scope.newKontPhone_mobile,
          time_id: $scope.currentTimeIdForCreateNewKont,
          date: new Date($scope.yearMonthDay),
          commentForSave: $scope.commentForSave
        }
      }).
      success(function (data) {
        if (data["success"] === "true") {
          closeAllWindow();
          getData($scope.yearMonthDay);
        } else if (data["success"] === "exists") {
          $scope.errorSaveNewKont = "Номер уже существует";
          $scope.btnCreateNewKontDisabled = false;
        }
      }).catch((err) => {
        $scope.global.showErrorAlert("Ошибка: " + JSON.stringify(err.data));
      }).finally(() => {
        $scope.btnCreateNewKontDisabled = false;
      });
    }
  }

  // --== Изменение сеанса ==--
  //нажатие на кнопке изменения сеанса (черный квадратик)
  $scope.btnChangeSeansClick = function btnChangeSeansClick(e) {
    closeAllWindow();
    // права на запись
    if ($scope.global.contactPravoWrite === 0) return false;

    var elem = e.currentTarget;
    //сохраняем идентификатор записи на сеанс для дальнейшего использования
    $scope.changedKontSeansID = parseInt(elem.attributes[0].value);
    //сохраняем все параметры, т.к. предпологается редактирование записи
    $scope.change_m_seans_time_id = parseInt(elem.attributes[1].value);
    $scope.commentForSave = elem.attributes[2].value;
    $scope.changeSeansDate = $scope.usingDate;

    //устанавливаем корректное положение элемента на экране
    $scope.zapisatNaSeansLeft = $(elem).offset().left;
    $scope.zapisatNaSeansTop = $(elem).offset().top + $scope.offsetInTop;
    $scope.zapisatNaSeansHeight = 140;
    $scope.notValidDateHeight = 1;
    //Делаем видимым окошко
    $scope.changeSeans = 1;
  }

  //нажатие на кнопку "Отмена" в окошке изменения сеанса
  $scope.btnCancelChangeSeans = function btnCancelChangeSeans() {
    closeAllWindow();
  }

  //нажатие на кнопку "Сохранить" в окошке изменения сеанса
  $scope.btnSaveChangeSeans = function btnSaveChangeSeans() {
    //блок привеедния оконка к стандартному виду
    $scope.errorSaveChangeSeansDate = "";
    $scope.zapisatNaSeansHeight = 140;
    $scope.errorMessageChangeSeansHeight = 0;

    //если дата не выбрана
    if ($scope.changeSeansDate === null) {   //дополняем текст ошибки
      $scope.errorSaveChangeSeansDate = "Не выбрана дата. ";
    }
    else {
      //если дата проставлена

      var n1 = new Date();
      var testData = new Date(n1.setDate(n1.getDate() - 1));
      //проверяем не выбрана ли дата меньше текущей
      if ($scope.changeSeansDate < testData) {
        $scope.errorSaveChangeSeansDate = "Нельзя выбирать старые даты. ";
      }
      else {
        //проверям является ли выбранный день рабочим
        var curr_day = $scope.changeSeansDate.getDay();
        var exists = 0;
        if (typeof $scope.global.manual.M_WORK_DAY !== "undefined") {
          for (var i = 0; i < $scope.global.manual.M_WORK_DAY.length; i++) {
            var w = $scope.global.manual.M_WORK_DAY[i]["DAY_ID"];
            if (curr_day === w) {
              exists = 1;
            }
          }
        }
        if (exists === 0) {
          $scope.errorSaveChangeSeansDate = "Выбран не рабочий день. ";
        }
      }
    }
    //если не выбран сеанс
    if (typeof $scope.change_m_seans_time_id === "undefined") {
      $scope.errorSaveChangeSeansDate = $scope.errorSaveChangeSeansDate + "Не выбран сеанс.";
    }

    if ($scope.errorSaveChangeSeansDate != "") {
      $scope.errorMessageChangeSeansHeight = 40;
      $scope.zapisatNaSeansHeight = 180;
      return;
    }
    $http({
      "method": "POST",
      "url": "/Home/ChangeKontSeans",
      params: {
        kontSeansID: $scope.changedKontSeansID,
        date: $scope.changeSeansDate,
        time_id: $scope.change_m_seans_time_id,
        commentForSave: $scope.commentForSave
      }
    }).success(function (data) {
      getData($scope.yearMonthDay);
    });
    closeAllWindow();
  }
  // --== /изменение сеанса ==-- 

  //Закрывает все окона и преведит окно в стандартный вид
  function closeAllWindow() {
    $scope.newAnkNaSeans = 0;
    $scope.newKontSurname = "";
    $scope.newKontName = "";
    $scope.newKontSecname = "";
    $scope.newKontPhone_mobile = "";

    var d = $scope.global.function.newDateNoTime();
    // запись всегда завтра и позднее
    d.setDate(d.getDate() + 1);
    $scope.changeSeansDate = d;
    $scope.changeSeans = 0;
    $scope.commentForSave = "";
    $scope.errorSaveChangeSeansDate = "";
    $scope.zapisatNaSeansHeight = 140;
    $scope.errorMessageChangeSeansHeight = 0;
  }

});