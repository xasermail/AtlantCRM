"use strict";

// контроллер
bazaCtrl = myApp.controller("bazaCtrl", function bazaCtrl($scope, $http, $timeout) {
  // список анкет для таблицы
  $scope.bazaList = [];
  // номера страниц, сколько их будет
  $scope.pageNums = [];
  // текущая страница
  $scope.page = 1;
  // записей на странице, берем из контроллера C#
  $scope.last_page = 0;
  // всего найдено
  $scope.vsego = 0;

  var i = 0;
  var j = 0;
  // переменные поля Посещения
  $scope.pos = {};
  // локальный справочник Ходит, Не ходит
  $scope.pos.hoditNeHodit = [{ ID: 2, NAME: "Не ходит" }, { ID: 1, NAME: "Ходит" }, { ID: 3, NAME: "На дату" }];
  // по умолчанию Не ходит
  $scope.pos.hodit = 2;
  // по умолчанию 1 день
  $scope.pos.dn = 1;
  // окно сначала скрыто
  $scope.pos.shown = false;
  // ошибка во введенном дне
  $scope.pos.dnError = false;
  // ошибка во введённой дате
  $scope.pos.naDatuError = false;
  // признак, что фильтр выбран
  $scope.pos.applied = false;
  //
  // переменные поля Заболевания
  $scope.zabol = {};
  // окно сначала скрыто
  $scope.zabol.shown = false;
  // ошибка во введенном дне
  $scope.zabol.dnError = false;
  // признак, что фильтр выбран
  $scope.zabol.applied = false;
  // для поиска заболевания из списка
  $scope.zabol.searchStr = "";
  // выбранное заболевание, его идентификатор
  $scope.zabol.id = null;
  //
  // переменные поля Посещения
  $scope.period = {};
  // окно сначала скрыто
  $scope.period.shown = false;
  // признак, что фильтр выбран
  $scope.period.applied = false;
  // дата посещения с
  $scope.period.s = $scope.global.function.newDateNoTime();
  // дата посещения по
  $scope.period.po = $scope.global.function.newDateNoTime();
  //
  // переменные поля Регистрация
  $scope.reg = {};
  // окно сначала скрыто
  $scope.reg.shown = false;
  // признак, что фильтр выбран
  $scope.reg.applied = false;
  // кол-во регистраций с
  $scope.reg.s = null;
  // кол-во регистраций по
  $scope.reg.po = null;
  //
  // переменные поля Сеансы
  $scope.seans = {};
  // окно сначала скрыто
  $scope.seans.shown = false;
  // признак, что фильтр выбран
  $scope.seans.applied = false;
  // выбранный сеанс, его идентификатор
  $scope.seans.id = null;
  //
  // переменные поля Продажи
  $scope.prod = {};
  // окно сначала скрыто
  $scope.prod.shown = false;
  // признак, что фильтр выбран
  $scope.seans.applied = false;
  // для поиска заболевания из списка
  $scope.prod.productIds = "";
  //
  // переменные поля Категории
  $scope.kateg = {};
  // окно сначала скрыто
  $scope.kateg.shown = false;
  // признак, что фильтр выбран
  $scope.kateg.applied = false;
  // выбранная категория, ее идентификатор
  $scope.kateg.id = "";
  //
  // переменные поля Заболевания
  $scope.uluch = {};
  // окно сначала скрыто
  $scope.uluch.shown = false;
  // ошибка во введенном дне
  $scope.uluch.dnError = false;
  // признак, что фильтр выбран
  $scope.uluch.applied = false;
  // для поиска заболевания из списка
  $scope.uluch.searchStr = "";
  // выбранное заболевание, его идентификатор
  $scope.uluch.id = null;
  //
  // сообщение смс
  $scope.message = "";
  // сокрытие формы сообщения
  $scope.smsMessageForm = 0;
  // фильтры, при нажатии на боковые ссылки
  $scope.dopFilter = {};
  $scope.dopFilter.sex = null;
  $scope.dopFilter.sex_id = -1;
  $scope.dopFilter.uluch = null;
  $scope.dopFilter.uluch_day_id = 0;
  $scope.dopFilter.birth = null;
  $scope.dopFilter.birth_id = 0;
  $scope.dopFilter.tovar = null;
  $scope.dopFilter.tovar_id = 0;
  $scope.dopFilter.status = null;
  $scope.dopFilter.status_id = 0;


  // сортировка по дате звонка
  // 0 - без сортировки, 1 - сортировка по возрастанию, 2 - сортировка по убыванию
  $scope.dZvOrderBy = 0;


  // событие при открытии страницы
  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemBaza") {

      // обновляю грид
      $scope.refreshGrid();

    }

  });



  // обновление грида
  $scope.refreshGrid = function refreshGrid() {

    // получаем параметры для запроса
    var a = getBazaListParams();

    $scope.global.showWaitingForm("Получение данных базы..");

    $http({
      method: "POST",
      url: "/Home/GetBazaList/",
      data: a
    }).then(
      function getBazaListSuccess(data) {
        $scope.bazaList = data.data.rows;
        if (data.data.rows.length > 0) {
          $scope.vsego = data.data.rows[0].cnt;
          $scope.last_page = data.data.totalPageCount;
        } else {
          $scope.vsego = 0;
        }
        $scope.pageNums = [];
        
        if ($scope.vsego > 0) {
          // если записей больше чем 10
          var a = $scope.page;
          if ($scope.last_page > $scope.global.const.NEXT_PREV_PAGE_COUNT) {
            // и при переходе на следующие 10 записей не выходим за границы массива
            if (($scope.page + $scope.global.const.NEXT_PREV_PAGE_COUNT) <= $scope.last_page) {
              j = $scope.page + $scope.global.const.NEXT_PREV_PAGE_COUNT-1;
            } else {
              // например, находимся на 28-й странице, всего страниц 31
              // надо добавить 31 - 10 - с 21
              if (($scope.last_page - $scope.page) < $scope.global.const.NEXT_PREV_PAGE_COUNT) {
                if (($scope.last_page - $scope.global.const.NEXT_PREV_PAGE_COUNT) > 0) {
                  a = $scope.last_page - $scope.global.const.NEXT_PREV_PAGE_COUNT;
                  j = $scope.last_page;
                }
              } else {
                j = $scope.last_page;
              }
            }
            // записей меньше чем 10
          } else {
            a = 1;
            j = $scope.last_page;
          }

          for (i = a; i <= j; i += 1) {
            $scope.pageNums.push(i);
          }
        }

        $scope.global.hideWaitingForm();

      }, function getBazaListError(msg) {
        $scope.global.showErrorAlert(msg.data);
      });

      $http({
        method: "POST",
        url: "/Home/GetStatusClients/",
        data: a
      }).then(
      function getBazaListSuccess(data) {
        $scope.statuses = data.data.Statuses;
        $scope.birthdays = data.data.Birthday;

        // для единообразия фильтра
        $scope.statusBirth = [];
        if ($scope.birthdays.Today > 0) {
          $scope.statusBirth.push({
            ID: 1,
            NAME: "Сегодня",
            COUNT: $scope.birthdays.Today
          });
        }

        if ($scope.birthdays.ThisWeek > 0) {
          $scope.statusBirth.push({
            ID: 2,
            NAME: "На этой неделе",
            COUNT: $scope.birthdays.ThisWeek
          });
        }

        if ($scope.birthdays.ThisMonth > 0) {
          $scope.statusBirth.push({
            ID: 3,
            NAME: "В этом месяце",
            COUNT: $scope.birthdays.ThisMonth
          });
        }

        $scope.tovarStatuses = data.data.Tovars;
        $scope.statusUluch = data.data.Uluch;
        $scope.statusSex = data.data.Sex;

      }, function getBazaListError(msg) {
        $scope.global.showErrorAlert(msg.data);
      });
  };

  function getBazaListParams() {
    var list = {};

    list.page = $scope.page;

    list.fio = null;
    if ($scope.fio != null && $scope.fio.trim().length > 0) {
      list.fio = $scope.fio.trim();
    }

    list.posHodit = null;
    list.posDn = null;
    list.posNaDatu = null;
    if ($scope.pos.applied === true) {
      list.posHodit = $scope.pos.hodit;
      // если выбрано "Ходит" или "Не ходит" из выпадающего списка
      if ($scope.pos.hodit === 1 || $scope.pos.hodit === 2) {
        list.posDn = $scope.pos.dn;
      // если выбрано "На дату" из выпадающего списка
      } else if ($scope.pos.hodit === 3) {
        list.posNaDatu = $scope.pos.naDatu;
      }
    }

    list.zabolId = null;
    if ($scope.zabol.applied === true) {
      list.zabolId = $scope.zabol.id;
    }

    list.periodS = null;
    list.periodPo = null;
    if ($scope.period.applied === true) {

      list.periodS = $scope.period.s;
      list.periodPo = $scope.period.po;

      if (list.periodPo == null) {
        list.periodPo = $scope.global.function.newDateNoTime();
      }

      if (list.periodS == null) {
        list.periodS = list.periodPo;
      }
    }

    list.regS = null;
    list.regPo = null;
    if ($scope.reg.applied === true) {

      list.regS = $scope.reg.s;
      list.regPo = $scope.reg.po;
    }

    list.seansId = null;
    if ($scope.seans.applied === true) {
      list.seansId = $scope.seans.id;
    }

    list.productIds = "";
    if ($scope.prod.applied === true) {
      // если выбрана позиция "Нет товара"
      if ($scope.prod.netTovara === 1) {
        list.productIds = "-1";
      } else {
        for (var i = 0; i < $scope.prod.productIds.length; i++) {
          list.productIds += $scope.prod.productIds[i] + ",";
        }
      }
    }

    list.kategId = null;
    if ($scope.kateg.applied === true) {
      list.kategId = $scope.kateg.id;
    }

    list.uluchId = null;
    if ($scope.uluch.applied === true) {
      list.uluchId = $scope.uluch.id;
    }

    // доп. условия
    list.dopFilter = null;
    if ($scope.dopFilter.uluch !== null) {
      list.dopFilter = $scope.dopFilter.uluch;
    }

    if ($scope.dopFilter.birth !== null) {
      if (list.dopFilter === null) {
        list.dopFilter = $scope.dopFilter.birth;
      } else {
        list.dopFilter += $scope.dopFilter.birth;
      }
    }

    if ($scope.dopFilter.tovar !== null) {
      if (list.dopFilter === null) {
        list.dopFilter = $scope.dopFilter.tovar;
      } else {
        list.dopFilter += $scope.dopFilter.tovar;
      }
    }

    if ($scope.dopFilter.status !== null) {
      if (list.dopFilter === null) {
        list.dopFilter = $scope.dopFilter.status;
      } else {
        list.dopFilter += $scope.dopFilter.status;
      }
    }

    if ($scope.dopFilter.sex !== null) {
      if (list.dopFilter === null) {
        list.dopFilter = $scope.dopFilter.sex;
      } else {
        list.dopFilter += $scope.dopFilter.sex;
      }
    }

    // дата звонка
    list.dZv = $scope.dZv

    // направление сортировки по дате звонка
    list.dZvOrderBy = $scope.dZvOrderBy;

    return list;
  }


  // при выборе другой страницы
  $scope.pageNumClickHandler = function pageNumClickHandler(pageNum) {
    $scope.page = pageNum;
    $scope.refreshGrid();
  };


  // при нажатии enter после ввода ФИО
  $scope.fioKeyPress = function fioKeyPress(evt) {

    if (evt.keyCode === 13) {
      $scope.page = 1;
      $scope.refreshGrid();
    }

  };

  // перейти в режим Звонки
  $scope.openZvonokRej = function openZvonokRej(id) {
    $scope.global.openAnk(id);
    $scope.global.openAnkDone = () => {
      $timeout(() => {
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.selectedSubMenuItem = 6;
      }, 10);
    };
  };

  // посещения
  $scope.posDropDownClick = function posDropDownClick() {
    $scope.pos.shown = !$scope.pos.shown;
    $scope.pos.dnError = false;
    $scope.pos.naDatuError = false;
  }

  $scope.posOkClick = function posOkClick() {

    if ($scope.pos.hodit === 1 || $scope.pos.hodit == 2) {
      if (!(angular.isNumber($scope.pos.dn)) || !($scope.pos.dn > 0)) {
        $scope.pos.dnError = true;
        return;
      }

    } else if ($scope.pos.hodit === 3) {
      if ($scope.pos.naDatu == null) {
        $scope.pos.naDatuError = true;
        return;
      }
    } else {
      $scope.global.showErrorAlert("Неизвестное значение для $scope.pos.hodit = " + $scope.pos.hodit);
      return;
    }

    $scope.pos.dnError = false;
    $scope.pos.naDatuError = false;
    $scope.pos.shown = false;
    $scope.pos.applied = true;
    $scope.page = 1;

    $scope.refreshGrid();

  }

  $scope.posCloseClick = function posCloseClick() {
    $scope.pos.applied = false;
    $scope.refreshGrid();
  }

  // Регистрация
  $scope.regDropDownClick = function regDropDownClick() {
    $scope.reg.shown = !$scope.reg.shown;
    $scope.reg.regError = false;
  }

  $scope.regOkClick = function regOkClick() {

    if (!(angular.isNumber($scope.reg.s)) || !($scope.reg.s > 0)) {
      $scope.reg.regError = true;
      return;
    }

    if (!(angular.isNumber($scope.reg.po)) || !($scope.reg.po > 0)) {
      $scope.reg.regError = true;
      return;
    }

    $scope.reg.regError = false;
    $scope.reg.shown = false;
    $scope.reg.applied = true;
    $scope.page = 1;

    $scope.refreshGrid();

  }

  $scope.regCloseClick = function regCloseClick() {
    $scope.reg.applied = false;
    $scope.refreshGrid();
  }

  // Сеансы
  $scope.seansDropDownClick = function seansDropDownClick() {
    $scope.seans.shown = !$scope.seans.shown;
  };

  $scope.seansCloseClick = function seansCloseClick() {
    $scope.seans.applied = false;
    $scope.refreshGrid();
  };

  $scope.seansOkClick = function seansOkClick() {

    $scope.seans.shown = false;
    $scope.seans.applied = true;
    $scope.page = 1;

    $scope.refreshGrid();

  };

  // Продажи
  $scope.prodDropDownClick = function prodDropDownClick() {
    $scope.prod.shown = !$scope.prod.shown;
  };

  $scope.prodCloseClick = function prodCloseClick() {
    $scope.prod.applied = false;
    $scope.refreshGrid();
  };

  $scope.prodOkClick = function prodOkClick() {
    $scope.prod.shown = false;
    $scope.prod.applied = true;
    $scope.page = 1;
    $scope.refreshGrid();
  }

  // Категории
  $scope.kategDropDownClick = function kategDropDownClick() {
    $scope.kateg.shown = !$scope.kateg.shown;
    if (!$scope.kateg.shown) {
      $scope.kateg.id = "";
    }
  };

  $scope.kategCloseClick = function kategCloseClick() {
    $scope.kateg.applied = false;
    $scope.kateg.id = "";
    $scope.refreshGrid();
  };

  $scope.kategOkClick = function kategOkClick() {
    $scope.kateg.shown = false;
    $scope.kateg.applied = true;
    $scope.page = 1;
    $scope.refreshGrid();
  };

  // Улучшения
  $scope.uluchDropDownClick = function uluchDropDownClick() {
    $scope.uluch.shown = !$scope.uluch.shown;
  };

  $scope.uluchCloseClick = function uluchCloseClick() {
    $scope.uluch.applied = false;
    $scope.refreshGrid();
  };

  $scope.uluchOkClick = function uluchOkClick() {
    $scope.uluch.shown = false;
    $scope.uluch.applied = true;
    $scope.page = 1;
    $scope.refreshGrid();
  };


  $scope.pageNext = () => {

    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page - 1) > 0) ? ($scope.page - 1) : 1);
    $scope.refreshGrid();

  };

  $scope.pagePrev = () => {

    if ($scope.pageNums.length === 0) {
      return;
    }

    $scope.page = ((($scope.page + 1) > $scope.pageNums.length) ? $scope.pageNums.length : ($scope.page + 1));
    $scope.refreshGrid();

  };


  // Заболевания
  $scope.zabolDropDownClick = function zabolDropDownClick() {
    $scope.zabol.shown = !$scope.zabol.shown;
  };

  $scope.zabolCloseClick = function zabolCloseClick() {
    $scope.zabol.applied = false;
    $scope.refreshGrid();
  };

  $scope.zabolOkClick = function zabolOkClick() {

    $scope.zabol.shown = false;
    $scope.zabol.applied = true;
    $scope.page = 1;

    $scope.refreshGrid();
    
  };

  // Период
  $scope.periodDropDownClick = function periodDropDownClick() {
    $scope.period.shown = !$scope.period.shown;
  };

  $scope.periodCloseClick = function periodCloseClick() {
    $scope.period.applied = false;
    $scope.refreshGrid();
  };

  $scope.periodOkClick = function periodOkClick() {

    $scope.period.shown = false;
    $scope.period.applied = true;
    $scope.page = 1;

    $scope.refreshGrid();

  };

  $scope.periodTodayClick = function periodTodayClick() {

    $scope.period.s = $scope.global.function.newDateNoTime();
    $scope.period.po = $scope.global.function.newDateNoTime();
    $scope.periodOkClick();

  };

  $scope.send = function send() {
    $scope.global.function.showYesNoDialog("Будет отправлено " + $scope.vsego + " СМС. Продолжить?", () => {
      $scope.smsMessageForm = 1;
    });
  }

  $scope.closeSmsForm = function closeSmsForm() {
    $scope.smsMessageForm = 0;
  }

  $scope.sendSmsForm = function sendSmsForm() {
    if ($scope.bazaList.length === 0) {
      $scope.global.showErrorAlert("Список рассылки пуст");
    }

    $scope.global.function.showYesNoDialog("Выполнить рассылку по мобильным телефонам?", () => {
      $scope.smsMessageForm = 0;
      var a = getBazaListParams();

      $http({
        "method": "POST",
        "url": "/Home/SendSmsFromBaza",
        data: {
          p: a,
          message: $scope.message
        }
      }).then(function sendSuccess(data) {

        if (data.data.success === false)
          $scope.global.showErrorAlert(data.data.message);

      }, function sendFailed(err) {
        $scope.global.showErrorAlert(err.data);
      });
    });
  }

  // сброс фильтра
  $scope.clearFilter = function clearFilter() {
    $scope.period.applied = false;
    $scope.pos.applied = false;
    $scope.reg.applied = false;
    $scope.seans.applied = false;
    $scope.prod.applied = false;
    $scope.kateg.applied = false;
    $scope.zabol.applied = false;
    $scope.uluch.applied = false;
    $scope.fio = "";
    $scope.prod.productIds = "";
    $scope.kateg.id = "";

    $scope.dopFilter.sex = null;
    $scope.dopFilter.sex_id = -1;
    $scope.dopFilter.uluch = null;
    $scope.dopFilter.uluch_day_id = 0;
    $scope.dopFilter.birth = null;
    $scope.dopFilter.birth_id = 0;
    $scope.dopFilter.tovar = null;
    $scope.dopFilter.tovar_id = 0;
    $scope.dopFilter.status = null;
    $scope.dopFilter.status_id = 0;

    $scope.page = 1;
    // обновляю грид
    $scope.refreshGrid();
  };

  // дата календаря продаж С
  $scope.fromDateSalesCalendar = $scope.global.function.newDateNoTime();
  // дата календаря продаж ПО
  $scope.toDateSalesCalendar = $scope.global.function.newDateNoTime();
  //данные для каендаря продаж
  $scope.calendar = [];
  //признак того что календарь продаж отображен
  $scope.showSalesCalendar = false;
  //массив для отображения товаров и сумм
  $scope.calendarData = [];
  // признак того, что отображен список анкет по выбранному товару из выбранной ячейки
  $scope.showSpisProd = false;
  // выбранный день из календаря продаж
  $scope.spisDayRn = 0;
  // выбранный товар из списка
  $scope.spisMProductId = 0;

  // запрос данных по калерндарю продаж
  $scope.btnGetSalesCalendar = function btnGetSalesCalendar() {
    $http({
      method: "POST",
      url: "/Home/GetSalesCalendar/",
      data: {
        fromDate: $scope.fromDateSalesCalendar,
        toDate: $scope.toDateSalesCalendar
      }
    }).then(
    function getBazaSalesCalendar(data) {
      $scope.calendar = data.data;
      $scope.calendarDay = [];
      $scope.calendarData = [];

      // высота максимального блока
      $scope.calendarDivHeight = 73;

      // формируем агрегированный массив товаров и сумм для вывода в ячейки
      // фильтр при выводе DAY_RN, т.е. порядковый номер дня в сетке
      var index = -1;
      var day_rn = 0;
      var product_id = 0;
      var product_id_name = "";
      var price = 0;
      var kolvo = 0;
      var tmp = 0;
      $scope.summaItogo = 0;

      if ($scope.calendar != null) {
        for (i = 0; i <= $scope.calendar.length - 1; i++) {
          day_rn = $scope.calendar[i]["DAY_RN"];
          product_id = $scope.calendar[i]["M_PRODUCT_ID"];
          product_id_name = $scope.calendar[i]["M_PRODUCT_ID_NAME"];

          // формируем массив для вывода в ячейки
          if ($scope.calendar[i]["M_PRODUCT_ID"] != 0) {
            var data = $scope.calendarData.find(x => x["DAY_RN"] === day_rn && x["M_PRODUCT_ID"] === product_id);
            if (data == null) {
              $scope.addCalendarRow(day_rn,
                                    product_id,
                                    product_id_name,
                                    price); // цена нулевая, чтобы суммы не дублировались
            }
          }
        }

        // считаем суммы
        for (i = 0; i <= $scope.calendarData.length - 1; i++) {

          day_rn = $scope.calendarData[i]["DAY_RN"];
          product_id = $scope.calendarData[i]["M_PRODUCT_ID"];
          tmp = 0;

          for (j = 0; j <= $scope.calendar.length - 1; j++) {
            if ((day_rn == $scope.calendar[j]["DAY_RN"]) && (product_id == $scope.calendar[j]["M_PRODUCT_ID"])) {
              $scope.calendarData[i]["SUMMA"] = $scope.calendarData[i]["SUMMA"] + $scope.calendar[j]["PRICE"];
              $scope.calendarData[i]["KOLVO"] = $scope.calendarData[i]["KOLVO"] + 1;
              tmp++;

              // #384
              $scope.summaItogo = $scope.summaItogo + $scope.calendar[j]["PRICE"];
            }
          }

          // Показываем кол-во только 2 и более
          if ($scope.calendarData[i]["KOLVO"] == 1) {
            $scope.calendarData[i]["KOLVO"] = "";
          }

          $scope.calendarData[i]["SUMMA"] = $scope.addSpaces($scope.calendarData[i]["SUMMA"]);
        }

        for (i = 0; i <= $scope.calendarData.length - 1; i++) {

          day_rn = $scope.calendarData[i]["DAY_RN"];
          tmp = 0;

          for (j = 0; j <= $scope.calendarData.length - 1; j++) {
            if (day_rn == $scope.calendarData[j]["DAY_RN"]) {
              tmp++;
            }
          }

          if (kolvo < tmp) {
            kolvo = tmp;
          }
        }

        if ($scope.calendarDivHeight < (kolvo * 53) + 20) {
          $scope.calendarDivHeight = (kolvo * 53) + 20;
        }

        // #384
        $scope.summaItogo = $scope.addSpaces($scope.summaItogo);
      }

      $scope.showSalesCalendar = true;
    },
    function getBazaSalesCalendarError(msg) {
      $scope.global.showErrorAlert(msg.data);
    });
  }

  //Закрытие календаря продаж
  $scope.closeSalesCalendar = function closeSalesCalendar() {
    $scope.showSalesCalendar = false;
  };

  // добавляет строку в список товаров и сумм
  $scope.addCalendarRow = function addCalendarRow(day_rn, product_id, product_id_name, price) {
    $scope.calendarData.push({
      DAY_RN: day_rn,
      M_PRODUCT_ID: product_id,
      M_PRODUCT_ID_NAME: product_id_name,
      SUMMA: price,
      KOLVO: 0
    });
  }

  // разбивает число на разряды по 1000
  $scope.addSpaces = function addSpaces(nStr) {
    nStr += "";
    var x = nStr.split(".");
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
  }

  // открывает список анкет по выбранному товару
  $scope.openSpisProd = function openSpisProd(item) {
    if (item == null) {
      return false;
    }

    if (item["M_PRODUCT_ID"] == 0) {
      return false;
    }

    $scope.spisDayRn = item["DAY_RN"];
    $scope.spisMProductId = item["M_PRODUCT_ID"];
    $scope.showSpisProd = true;
  }

  // пересчет длины div'а в зависимости от надписи
  $scope.recalcDivWidth = function recalcDivWidth() {
    var mainDiv = document.getElementById("cellMainDiv");
    if (mainDiv == null) {
      return false;
    }

    var m = mainDiv.offsetWidth;
    if (m != null) {
      return m * 0.98;
    }
  }

  // закрывает список анкет по выбранному товару
  $scope.closeSpisProd = function closeSpisProd() {
    $scope.showSpisProd = false;
  };

  $scope.openDialogRej = function openDialogRej(O_ANK_ID) {
    $scope.global.openAnk(O_ANK_ID);
    $scope.global.openAnkDone = () => {
      $timeout(() => {
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.selectedSubMenuItem = 2;
      }, 10);
    };
  };

  // дополнительные условия фильтрации, задаются на боковой панели
  $scope.setDopFilter = function setDopFilter(item, filterName) {
    if (filterName === "sex") {
      $scope.dopFilter.sex = "sex:" + item.SEX_ID + ";";
      $scope.dopFilter.sex_id = item.SEX_ID;
    }

    if (filterName === "uluch") {
      $scope.dopFilter.uluch = "uluch:" + item.DAY_ID + ";";
      $scope.dopFilter.uluch_day_id = item.DAY_ID;
    }

    if (filterName === "birth") {
      $scope.dopFilter.birth = "birth:" + item.ID + ";";
      $scope.dopFilter.birth_id = item.ID;
    }

    if (filterName === "tovar") {
      $scope.dopFilter.tovar = "tovar:" + item.TOVAR_ID + ";";
      $scope.dopFilter.tovar_id = item.TOVAR_ID;
    }

    if (filterName === "status") {
      $scope.dopFilter.status = "status:" + item.M_STATUS_ID + ";";
      $scope.dopFilter.status_id = item.M_STATUS_ID;
    }

    $scope.page = 1;
    // обновляю грид
    $scope.refreshGrid();
  }

  // дополнительные условия фильтрации, задаются на боковой панели
  $scope.clearDopFilter = function clearDopFilter(filterName) {
    if (filterName === "sex") {
      $scope.dopFilter.sex = null;
      $scope.dopFilter.sex_id = -1;
    }

    if (filterName === "uluch") {
      $scope.dopFilter.uluch = null;
      $scope.dopFilter.uluch_day_id = 0;
    }

    if (filterName === "birth") {
      $scope.dopFilter.birth = null;
      $scope.dopFilter.birth_id = 0;
    }

    if (filterName === "tovar") {
      $scope.dopFilter.tovar = null;
      $scope.dopFilter.tovar_id = 0;
    }

    if (filterName === "status") {
      $scope.dopFilter.status = null;
      $scope.dopFilter.status_id = 0;
    }

    $scope.page = 1;
    // обновляю грид
    $scope.refreshGrid();
  }

  // следующие 10 страниц
  $scope.pageNext10 = function pageNext10() {
    if ($scope.pageNums.length === 0) {
      return;
    }

    if ($scope.pageNums.length < $scope.global.const.NEXT_PREV_PAGE_COUNT) {
      return;
    }

    j = $scope.pageNums[$scope.pageNums.length - 1];
    var a = $scope.pageNums[0];
    if (j + $scope.global.const.NEXT_PREV_PAGE_COUNT > $scope.last_page) {
      if (($scope.last_page - j) > 0) {
        j = $scope.last_page;
        if ((j - $scope.global.const.NEXT_PREV_PAGE_COUNT) > 0) {
          a = j - $scope.global.const.NEXT_PREV_PAGE_COUNT;
        }
      } else {
        return;
      }
    } else {
      a = j;
      j = j + $scope.global.const.NEXT_PREV_PAGE_COUNT;
    }

    $scope.pageNums = [];
    for (i = a; i <= j; i++) {
      $scope.pageNums.push(i);
    }
  }

  // предыдущие 10 страниц
  $scope.pagePrev10 = function pagePrev10() {
    if ($scope.pageNums.length === 0) {
      return;
    }

    if ($scope.pageNums.length < $scope.global.const.NEXT_PREV_PAGE_COUNT) {
      return;
    }

    j = $scope.pageNums[0];
    var a = 1;
    // переходим на первую страницу 
    if (j <= $scope.global.const.NEXT_PREV_PAGE_COUNT) {
      a = 1;
      if ($scope.last_page > $scope.global.const.NEXT_PREV_PAGE_COUNT) {
        j = $scope.global.const.NEXT_PREV_PAGE_COUNT;
      } else {
        a = 1;
        j = $scope.last_page;
      }
    } else {
      a = j - $scope.global.const.NEXT_PREV_PAGE_COUNT;
    }

    $scope.pageNums = [];
    for (i = a; i <= j; i++) {
      $scope.pageNums.push(i);
    }
  };



  // нажатие по позиции "Нет товара" фильтра "Продажи"
  $scope.prodFilterNetTovaraClick = function prodFilterNetTovaraClick() {
    $scope.prod.productIds = null;
    $scope.prod.netTovara = 1;
  };

  // когда выберают любое значение в фильтре "Продажи" кроме "Нет товара",
  // сбрасываю признак "Нет товара"
  $scope.$watch("prod.productIds", (newValue, oldValue) => {
    if (newValue != null) {
      $scope.prod.netTovara = 0;
    }
  });



  // выбор направления сортировки по Дате звонка
  $scope.bntDZvOrderByClick = function bntDZvOrderByClick() {

    // изменяю сортировку, всего три значения может быть, 0, 1 и 2.
    $scope.dZvOrderBy = $scope.dZvOrderBy + 1;
    if ($scope.dZvOrderBy === 3) {
      $scope.dZvOrderBy = 0;
    }

    // применение сортировки (перезапрос данных)
    $scope.refreshGrid();


  };


  // при выборе или очистке поля фильтра Дата звонка
  $scope.dZvChanged = function dZvChanged() {

    // перезапрос данных
    $scope.refreshGrid();

  };


  // открыть Общение, для выбранной анкеты
  $scope.openDialog = function openDialog(O_ANK_ID) {

    // сначала открываю анкету
    $scope.global.openAnk(O_ANK_ID);
    // и вешаю событие, после открытия перейти в Общение
    $scope.global.openAnkDone = function openAnkDoneFromBaza() {
      $timeout(function openAnkDoneFromBazaTimeout() {
        $scope.global.function.openDialog();
      }, 10);
    };

  };





});