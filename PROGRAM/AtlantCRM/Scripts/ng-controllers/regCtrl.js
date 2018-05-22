"use strict";

// контроллер
regCtrl = myApp.controller("regCtrl", function regCtrl($scope, $http, $interval) {

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


  $scope.refreshReg = function () {

    $scope.ID_CODE = null;

    $scope.o_ank_id = null;

    $scope.o_ank_id_code = null;

    $scope.imgPhoto = "/Content/img/u4.png";

    $scope.reg = {};
    $scope.lastID = 0;

    // признак того, что было сканирование
    $scope.scanned = false;

    $scope.global.showWaitingForm("Получение доступных мест..");

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
    


    // получаю места для первого ряда
    promises.push(
      $http({
        method: "GET",
        url: "/Home/GetRegSeansPlace",
        params: {
          M_RYAD_ID: $scope.global.const.M_RYAD_ID_1, M_ORG_ID: $scope.global.userContext.M_ORG_ID,
          M_SEANS_TIME_ID: $scope.M_SEANS_TIME_ID
        }
      })
    );

    // получаю места для второго ряда
    promises.push(
      $http({
        method: "GET",
        url: "/Home/GetRegSeansPlace",
        params: {
          M_RYAD_ID: $scope.global.const.M_RYAD_ID_2, M_ORG_ID: $scope.global.userContext.M_ORG_ID,
          M_SEANS_TIME_ID: $scope.M_SEANS_TIME_ID
        }
      })
    );


    Promise.all(promises).then((values) => {

      if (values[0].data.success === false || values[1].data.success === false) {
        $scope.seansPlace1 = [];
        $scope.seansPlace2 = [];
        $scope.global.showErrorAlert("На текущее время нет доступных сеансов");
      } else {
        $scope.seansPlace1 = values[0].data;
        $scope.seansPlace2 = values[1].data;

        $scope.regCount = ($scope.seansPlace1.concat($scope.seansPlace2)).reduce((a, c) => {
          if (c.zanyato) {
            return a + c.zanyato_kolvo; //#362 Ошибка в графе Зарегистрировано в режиме Регистрация
          } else {
            return a;
          };
        }, 0);

      }

      $scope.global.hideWaitingForm();

    }).catch((err) => {

      $scope.global.showErrorAlert("getRegSeansPlace(): " + err.toString());
      $scope.global.hideWaitingForm();

    });


  };



  // автоматически выбранное первое свободное место
  // после сканирования анкеты (одно из $scope.seansPlace1 или $scope.seansPlace2)
  $scope.autoSelectedPlace = null;
  // стиль для автовыбранного элемента, он будет меняться по таймеру
  $scope.autoSelectedPlaceStyle = null;
  //
  $interval(function setAutoSelectedPlaceStyle() {
    if ($scope.autoSelectedPlaceStyle == null) {
      $scope.autoSelectedPlaceStyle = { "background-color": "yellow" };
    } else {
      $scope.autoSelectedPlaceStyle = null;
    }
  }, 500);





  // сканирование анкеты, действие после того, как штрих-код устройство считало новый код
  $scope.scan = function scan() {

    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(3, 21)) return false;


    // проставляю признак, если в поле штрих-кода анкеты ничего не введено, это нужно, чтобы
    // по Enter подтверждать последнюю регистрацию
    var isIDEmpty = ($scope.ID_CODE == null) || (("" + $scope.ID_CODE).trim() == "");

    // если поле пустое и при этом нет отсканированных, но неподтверждённых анкет,
    // то не делаю ничего
    if (isIDEmpty === true && $scope.scanned === false) {
      return;
    }

    // если висит отсканированная, но неподтверждённая анкета и при этом
    // автоматически место определить не удалось, то выдаю предупреждение
    // и не сканирую новую анкету, в обычом случае этого не происходит, только
    // если все места уже заняты
    if ($scope.scanned === true && $scope.autoSelectedPlace == null) {
      // очищаю номер сканируемой анкеты, чтобы не затерять
      // номер текущей неподтверждённой
      $scope.ID_CODE = null;
      $scope.global.showErrorAlert("Не удалось автоматически определить место. Выберите место вручную.");
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
    
    // если при сканировании следующей анкеты, уже открыта какая-то
    // текущая, то надо произвести регистрацию открытой анкеты
    if ($scope.scanned === true) {

      // регистрирую на автоматически выбранное место
      $scope.doReg($scope.lastID, $scope.autoSelectedPlace).then(() => {

        // после регистрации получаю информацию об отсканированной анкете,
        // кроме тех случаев, когда ID был пуст при нажатии Enter, это значит,
        // что надо просто подтвердить автоматически выбранное место
        if (isIDEmpty === false) {
          $scope.getRegData();
        }

      // ошибка при регистрации
      }, (err) => {
        $scope.global.showErrorAlert(err.data);
      });


    // если текущей отсканированной анкеты не было, то просто
    // получаю информацию о текущей отсканированной
    } else {
      $scope.getRegData();
    }


  };



  // получение информации об отсканированной анкете
  $scope.getRegData = function getRegData() {

    // искаться будет отсканированный $scope.o_ank_id_code, он уже заполнен
    $scope.scanned = false;

    $scope.global.showWaitingForm("Поиск отсканированной анкеты..");

    $http({
      method: "GET",
      url: "/Home/GetRegData",
      params: { ID_CODE: $scope.o_ank_id_code, M_SEANS_TIME_ID: $scope.M_SEANS_TIME_ID }
    })
    .then(function getRegDataSuccess(data) {

      // получаю id анкеты (искали по штрих-коду анкеты)
      $scope.o_ank_id = data.data.O_ANK_ID;

      // ошибка при сканировании
      if (data.data.success === false) {
        $scope.global.showErrorAlert(data.data.err);

        // успешно посканированна
      } else {

        $scope.scanned = true;

        $scope.reg = data.data;
        if ($scope.reg.PHOTO == "") {
          $scope.imgPhoto = "/Content/img/u4.png";
        } else {
          $scope.imgPhoto = "/Home/GetAnkPhoto/" + $scope.o_ank_id;
        }

        // ищу первое свободное место
        $scope.autoSelectedPlace = $scope.seansPlace1.find((item) => item.zanyato === 0);
        if ($scope.autoSelectedPlace == null) {
          $scope.autoSelectedPlace = $scope.seansPlace2.find((item) => item.zanyato === 0);
        }

        // TODO: может такое быть, что место не нашлось, наверное надо как-то это обработать.
        // ..
        // ..

        // подсчитываю долю заполненности
        $scope.zapolnennost = ($scope.regCount / ($scope.seansPlace1.length + $scope.seansPlace2.length)).toFixed(2);

        $scope.lastID = $scope.o_ank_id;

        // поле Товар
        $http({
          "method": "GET",
          "url": "/Home/GetDialogProductList",
          params: {
            o_ank_id: $scope.o_ank_id
          }
        }).then(function getDialogProductListSuccess(data) {

          $scope.reg.tovarList = data.data;

        }, function getDialogProductListFailed(err) {

          $scope.global.showErrorAlert(err.data);

        });

      }

    })
    .catch(function getRegDataError(err) {
      $scope.global.showErrorAlert(err.data);
    })
    .finally(function getRegDataFinally() {
      $scope.global.hideWaitingForm();
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
  $scope.doReg = function doReg(o_ank_id, item) {

    $scope.global.showWaitingForm("Выполнение регистрации..");

    return $http({
      method: "GET",
      url: "/Home/DoReg",
      params: {
        O_ANK_ID: o_ank_id, M_SEANS_TIME_ID: item.M_SEANS_TIME_ID, M_RYAD_ID: item.M_RYAD_ID,
        M_SEANS_PLACE_ID: item.ID
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
        $scope.scanned = false;
        item.zanyato = 1;
        item.zanyato_kolvo += 1;
      }

      $scope.global.hideWaitingForm();

      return new Promise((resolve, reject) => {resolve(1);} );

    }, (err) => {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

      return new Promise((resolve, reject) => {reject(err.data);} );

    });

  };


  // нажали 2 раза по месту, регистрирую на это место клиента
  $scope.mestoDblClickHandler = function mestoDblClickHandler(item) {
    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(3,21)) return false;

    if ($scope.o_ank_id == null) {
      $scope.global.showErrorAlert("Необходимо отсканировать анкету");
      return;
    }

    $scope.doReg($scope.o_ank_id, item);

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

});