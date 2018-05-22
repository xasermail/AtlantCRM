"use strict";

var scopeRegCtrl;

// контроллер
regCtrl = myApp.controller("regCtrl", function regCtrl($scope, $http, $interval, $timeout) {

  scopeRegCtrl = $scope;

  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemReg") {
      $scope.refreshReg();
    }
  });


  // данные, полученные по анкете клиента
  $scope.reg = {};

  // последняя отсканированная анкета, нужна для регистрации, при сканировании следующей
  $scope.lastID = null;

  // id сканируемой анкеты
  $scope.o_ank_id = null;

  // штрих-код сканируемой анкеты
  $scope.o_ank_id_code = null;

  // ID анкеты, если она уже сегодня была зарегистрирована
  $scope.alreadyRegisteredOAnkId = null;

  // блокировка поля ввода штрих-кода для того, чтобы не возникало ситуаций, что при ещё не
  // завершённой регистрации одной анкеты уже сканируется другая
  $scope.shtrihKodInputDisabled = false;


  $scope.refreshReg = function () {

    $scope.ID_CODE = null;

    $scope.o_ank_id = null;

    $scope.o_ank_id_code = null;

    $scope.imgPhoto = "/Content/img/u4.png";

    $scope.reg = {};
    $scope.lastID = 0;

    // признак того, что было сканирование
    $scope.scanned = false;

    var promises = [];

    // количество зарегистрированных на сеанс
    $scope.regCount = 0;

    // признак вставки штрих-кода из буфера
    $scope.isPasted = false;

    // выбранное время сеанса
    if (window.localStorage.reg_M_SEANS_TIME_ID != null) {
      $scope.M_SEANS_TIME_ID = +window.localStorage.reg_M_SEANS_TIME_ID;
    }

    // если время сеанса не выбрано, ставлю первое из расписания
    if ($scope.M_SEANS_TIME_ID == null) {
      $scope.M_SEANS_TIME_ID = $scope.global.manual.M_SEANS_TIME[0].ID;
    }

    // получаю список зарегистрированных
    $scope.getRegList();


  };



  // автоматически выбранное первое свободное место
  // после сканирования анкеты (одно из $scope.seansPlace1 или $scope.seansPlace2)
  $scope.autoSelectedPlace = null;




  // сканирование анкеты, действие после того, как штрих-код устройство считало новый код
  $scope.scan = function scan() {

    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(3, 21)) return false;


    // блокирую поле для ввода штрихкода, чтобы исключить ситуацию повторного
    // ввода при ещё не завершённой регистрации, это не приведёт к особо плохим последствиям,
    // но появится сообщение о невозможности регистрации, что может сбить с толку
    $scope.shtrihKodInputDisabled = true;
    var checkRegEnd = $interval(() => {
      if ($scope.global.waitingFormShown === false) {
        $scope.shtrihKodInputEnable();
        // отменяю таймер
        $interval.cancel(checkRegEnd);
      }
    }, 500);


    // сбрасываю ID анкеты, если она уже сегодня была зарегистрирована
    $scope.alreadyRegisteredOAnkId = null;


    // проставляю признак, если в поле штрих-кода анкеты ничего не введено, это нужно, чтобы
    // по Enter подтверждать последнюю регистрацию
    var isIDEmpty = ($scope.ID_CODE == null) || (("" + $scope.ID_CODE).trim() == "");

    // если поле пустое и при этом висит отсканированная анкета, тогда скрываю её,
    // чтобы у пользователя создалось ощущение, что работа по регистрации этой
    // висящей анкеты выполнена
    if (isIDEmpty === true && $scope.scanned === true) {
      $scope.scanned = false;
      $scope.shtrihKodInputEnable();
      return;
    }


    // запоминаю отсканированный штрих-код анкеты
    $scope.o_ank_id_code = $scope.ID_CODE;

    // сканируется в виде "1234" (произвольное количество символов), надо убрать
    // и последнюю цифру, которая является контрольной суммой
    // если штрих-код скопировали из режима Период и вставили, то контрольной
    // цифры не будет
    if ($scope.isPasted === false) {
      $scope.o_ank_id_code = "" + $scope.o_ank_id_code;
      $scope.o_ank_id_code = +$scope.o_ank_id_code.slice(0, -1);
    }

    $scope.isPasted = false;


    // и сбрасываю отображаемый штрих-код в интерфейсе
    $scope.ID_CODE = null;


    // отображаю информацию о регистрируемой анкете
    $scope.getRegData().then(() => {

      // регистрирую на автоматически выбранное место
      // сначала ищу место
      $scope.global.showWaitingForm("Регистрация..");
      $http({
        "method": "GET",
        "url": "/Home/GetRegFreePlace",
        params: {
          M_SEANS_TIME_ID: $scope.M_SEANS_TIME_ID,
          M_ORG_ID: $scope.global.userContext.M_ORG_ID
        }
      }).then((data) => {

        $scope.autoSelectedPlace = data.data;

        // регистрирую
        $scope.doReg($scope.o_ank_id, $scope.autoSelectedPlace, $scope.reg.IS_GOST).then(() => {

          // получаю список зарегистрированных
          $scope.getRegList();

        // ошибка при регистрации
        }, (err) => {
          $scope.global.showErrorAlert(err.data);
        });

        $scope.global.hideWaitingForm();

      });

    });


    
  };



  // получение информации об отсканированной анкете
  $scope.getRegData = function getRegData() {

    // искаться будет отсканированный $scope.o_ank_id_code, он уже заполнен
    $scope.scanned = false;

    $scope.global.showWaitingForm("Поиск отсканированной анкеты..");

    return $http({
      method: "GET",
      url: "/Home/GetRegData",
      params: { ID_CODE: $scope.o_ank_id_code, M_SEANS_TIME_ID: $scope.M_SEANS_TIME_ID }
    })
    .then(function getRegDataSuccess(data) {

      // получаю id анкеты (искали по штрих-коду анкеты)
      $scope.o_ank_id = data.data.O_ANK_ID;
      
      // признак успешности
      var success = data.data.success;

      // если ошибка повторной регистрации анкеты, то в режиме Регистрации2 просто отображаю её, 
      // считаю, что анкета успешно просканирована, но регистрировать её не надо
      if (success == false && data.data.errCode === 2) {
        success = true;
        $scope.alreadyRegisteredOAnkId = data.data.O_ANK_ID;
        // ставлю время, на которое сегодня была зарегистрирована эта анкета, чтобы её увидеть
        $scope.M_SEANS_TIME_ID = data.data.M_SEANS_TIME_ID;
        // обновляю список анкет
        $scope.getRegList();
      }

      // ошибка при сканировании
      if (success === false) {

        $scope.global.showErrorAlert(data.data.err);
        return new Promise((resolve, reject) => { reject(data.data.err); });

      // успешно посканированна
      } else {

        $scope.scanned = true;

        $scope.reg = data.data;
        if ($scope.reg.PHOTO == "") {
          $scope.imgPhoto = "/Content/img/u4.png";
        } else {
          $scope.imgPhoto = "/Home/GetAnkPhoto/" + $scope.o_ank_id;
        }

        $scope.lastID = $scope.o_ank_id;

        // поле Товар
        return $http({
          "method": "GET",
          "url": "/Home/GetDialogProductList",
          params: {
            o_ank_id: $scope.o_ank_id
          }
        }).then(function getDialogProductListSuccess(data) {

          $scope.reg.tovarList = data.data;
          // максимальное количество дней у абонемента, на случай если вдруг их два, хотя не должно быть
          if ($scope.reg.tovarList.length > 0) {
            $scope.reg.ostalos = $scope.reg.tovarList.reduce((p, c) => (c.ostalos > p ? c.ostalos : p), 0);
          }
          
          // для ошибки повторной регистрации анкеты возвращаю отменённый Promise, чтобы дальше
          // регистрация не происходила, считаю эту ошибку предупреждением
          if ($scope.reg.errCode === 2) {
            return Promise.reject(data.data);
          } else {
            return Promise.resolve(1);
          }

        }, function getDialogProductListFailed(err) {

          $scope.global.showErrorAlert(err.data);

          return new Promise((resolve, reject) => { reject(err.data); });

        });

      }

    })
    .finally(function getRegDataFinally() {
      $scope.global.hideWaitingForm();
      return new Promise((resolve, reject) => { resolve(1); });
    });

  };



  // расчет времени до окончания регистрации ///////////////////////////////////
  $scope.calcDoOkonchaniyaRegistratsii = function calcDoOkonchaniyaRegistratsii() {
    var now = new Date();
    var diffInSec;
    var min;
    var sec;

    // до окончания = начала регистрации + 10 минут
    diffInSec =
      $scope.reg.min_time_minutes * 60 +
      // TODO: временно увеличиваю интервал до 35 минут
      //10 * 60 -
      35 * 60 -
      (now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds());

    //console.log($scope.reg.seans_time, now);

    if (diffInSec <= 0) {
      $scope.doOkonchaniyaRegistratsii = "00:00";
      return;
    }

    min = Math.floor(diffInSec / 60);
    if (min < 10) {
      min = "0" + min;
    }

    sec = diffInSec % 60;
    if (sec < 10) {
      sec = "0" + sec;
    }

    $scope.doOkonchaniyaRegistratsii = min + ":" + sec;
  };

  // и сразу запуск
  $interval($scope.calcDoOkonchaniyaRegistratsii, 1000);
  //////////////////////////////////////////////////////////////////////////////////////


  // произвести регистрацию
  // o_ank_id - ID анкеты для регистарции
  // item - место на которое проводится регистрация, один из элементов
  //        $scope.seansPlace1 или $scope.seansPlace2
  $scope.doReg = function doReg(o_ank_id, item, IS_GOST) {

    $scope.global.showWaitingForm("Выполнение регистрации..");

    return $http({
      method: "GET",
      url: "/Home/DoReg",
      params: {
        O_ANK_ID: o_ank_id, M_SEANS_TIME_ID: item.M_SEANS_TIME_ID, M_RYAD_ID: item.M_RYAD_ID,
        M_SEANS_PLACE_ID: item.ID, IS_GOST: IS_GOST
      }
    }).then((data) => {

      // ошибка при регистрации
      if (data.data.success === false) {
        $scope.global.showErrorAlert(data.data.err);

        // кто-то уже занял место
        if (data.data.code === 1) {
          item.zanyato = 1;
          $scope.autoSelectedPlace = null;
        }

      // регистрация прошла успешно
      } else {

        $scope.autoSelectedPlace = null;
        $scope.regCount++;
        //$scope.scanned = false;
        item.zanyato = 1;
        item.zanyato_kolvo += 1;

        // признак того, что была приостановка и она снялась
        $scope.reg.isPriostanovkaSnyata = data.data.isPriostanovkaSnyata;

        // признак того, что есть задолженность по оплате абонемента
        $scope.reg.isAbonZadol = data.data.isAbonZadol;

        // если абонент кончился (просрочен)
        $scope.reg.isAbonKon = data.data.isAbonKon;

      }

      $scope.global.hideWaitingForm();

      return new Promise((resolve, reject) => {resolve(1);} );

    }, (err) => {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

      return new Promise((resolve, reject) => {reject(err.data);} );

    });

  };


  // при вводе в поле штрих-кода
  $scope.shtrihKodKeyPress = function shtrihKodKeyPress(evt) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(3,21)) return false;
      
    // штрих-код полностью введён
    if (evt.keyCode === 13) {
      $scope.scan();
    }

  };


  // событие при вставке штрих-кода
  $scope.pasteKod = function pasteKod(evt) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(3,21)) return false;

    // проверяю, что передано целое число
    var pastedValue = evt.clipboardData.getData('Text');
    var pastedValueAsNumber = +pastedValue;
    if (!(typeof pastedValueAsNumber === 'number' && (pastedValueAsNumber % 1) === 0)) {
      $scope.ID_CODE = null;
      $scope.global.showErrorAlert("Вставляемое значение '" + pastedValue + "' не является правильным штрих-кодом");
      evt.preventDefault();
      return false;
    }

    $scope.ID_CODE = pastedValueAsNumber;

    $scope.isPasted = true;
    $scope.scan();

  };

  
  // при изменении времени сеанса
  $scope.seansTimeChange = function seansTimeChange() {
    
    // запоминаю выбранное время сеанса
    if ($scope.M_SEANS_TIME_ID != null) {
      window.localStorage.reg_M_SEANS_TIME_ID = $scope.M_SEANS_TIME_ID;
    }

    // показываю распределение мест по выбранному сенсу
    $scope.refreshReg();

  };

  // список зарегистрированных
  $scope.getRegList = function getRegList() {

    $scope.global.showWaitingForm("Получение списка зарегистрированных..");
  
    $http({
      method: "GET",
      url: "/Home/GetRegList",
      params: {
        M_SEANS_TIME_ID: $scope.M_SEANS_TIME_ID,
        M_ORG_ID: $scope.global.userContext.M_ORG_ID
      }
    }).then(function GetRegListSuccess(data) {
      $scope.regList = data.data;
      $scope.regCount = $scope.regList.reduce((p, c) => { return c.rn > p ? c.rn : p; }, 0);
      $scope.zapolnennost = ($scope.regCount / $scope.global.manual.M_SEANS_PLACE.length).toFixed(2);


      // есть строка с подсветкой уже зарегистрировано - прокручиваюсь к ней, т.к. список может быть длинный
      var scrollToTr = null;
      if ($scope.alreadyRegisteredOAnkId != null) {
        var scrollToTr = document.querySelector("#reg.reg-2 div.reg-list div.container-11 table tr.tr-uje-zareg");
      // иначе к верху списка
      } else {
        var scrollToTr = document.querySelector("#reg.reg-2 div.reg-list div.container-11 table tr.first");
      }
      if (scrollToTr != null) {
        scrollToTr.scrollIntoView(true);
      }


      $scope.global.hideWaitingForm();
    });

  };


  // нажатие по количеству оставшихся посещений по доп. услуге
  $scope.kolvoPosClick = function kolvoPosClick(dopUsl) {

    // уже изменялось
    if (dopUsl.IZM === 1) {
      return;
    }

    $scope.global.showWaitingForm("Регистрация доп. услуги...");

    $http({
      method: "POST",
      url: "/Home/DopUslDecrement",
      data: dopUsl
    }).then(function DopUslDecrementSuccess(data) {
      // обновляю отображаемый элемент присланными значениями
      for(var prop in data.data) {
        dopUsl[prop] = data.data[prop];
      }
      $scope.global.hideWaitingForm();
    });

  };


  // разблокировать поле для ввода штрих-кода и установить туда фокус
  $scope.shtrihKodInputEnable = function shtrihKodInputEnable() {
    $scope.shtrihKodInputDisabled = false;
    $timeout(() => {
      document.querySelector(".reg-2 .shtrih-kod .shtrih-kod-input").focus()
    }, 50);
  };

});