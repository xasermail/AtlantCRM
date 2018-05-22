"use strict";

// контроллер
newAnkCtrl = myApp.controller("newAnkCtrl", function newAnkCtrl($scope, $http) {

  // текущая анкета
  $scope.newAnk = {};
  // список выбранных заболеваний
  $scope.newAnk.O_ANK_ZABOL = [];
  // для сканирования штрих-кода
  $scope.ID = null;
  // нажатие на Enter
  $scope.enterPressed = false;
  // факт смены штрих-кода
  $scope.ID_SCAN = 0;

  $("#fioInfoId1").autocomplete({
    source: "/Home/GetO_ANK_FIO_INFO_ID",
    minLength: 2,
    select: function (event, ui) {
      console.log("Selected: " + ui.item.value + " aka " + ui.item.id);
      $scope.$apply("newAnk.FIO_INFO_ID = " + ui.item.id);
    }
  }).attr("placeholder", "ФИО посетителя");

  // анкета будет новой каждый раз, когда пользователь нажимает на вкладку "Новый"
  $scope.$on("menuItemNewClick", () => {
    // заполняю анкету первоначальными значениями
    $scope.initAnk();
    // обнуляем ссылку в общении на сеанс, если перешли из режима "Новый"
    $scope.global.o_seans_id = null;
    // активная вкладка - Анкета
    $scope.global.selectedSubMenuItem = 0;
    // фокус в поле Фамилия
    window.setTimeout(function () {
      $("#newAnkSurname").focus();
    });

    // отображаем поле для сканирования
    $scope.ID = null;
    $scope.enterPressed = false;
    $scope.isPasted = false;
    $scope.ID_SCAN = 0;

    // удаляем картинку штрих-кода, который остался от прежнего сканирования
    $('#ank-barcode-div').children().remove();
  });


  $scope.initAnk = function initAnk() {

    // переменные анкеты
    $scope.newAnk = {};
    $scope.global.ank = $scope.newAnk;
    // список выбранных заболеваний
    $scope.newAnk.O_ANK_ZABOL = [];
    // дата регистрации по умолчанию сегодня
    $scope.newAnk.DATE_REG = new Date();
    // женский пол по умолчанию
    $scope.newAnk.SEX = 2;
    // без фото
    $scope.imgPhoto = "/Content/img/u4.png";
    // зарегистрировал текущий пользователь
    $scope.newAnk.USER_REG = $scope.global.userContext.ID;

    $scope.newAnk.fio_reg =
      ($scope.global.userContext.SURNAME || "") + " " +
      ($scope.global.userContext.NAME || "") + " " +
      ($scope.global.userContext.SECNAME || "");

    // чтобы не было ошибки в HomeController
    $scope.global.ank.ID = 0;
    // источник информации по умолчанию Сотрудник
    $scope.newAnk.IST_INFO = $scope.global.const.M_IST_INFO_SOTRUDNIK;
    // VIP по умолчанию отключено
    $scope.newAnk.VIP = 0;
    // признак новой анкеты
    $scope.newAnk.PR_NEW = true;
    // источник информации по умолчанию Сотрудник
    $scope.newAnk.IST_INFO_USERID = $scope.global.userContext.ID;

    // если создание новой анкеты, то
    // Город - из предыдущего введенного значения
    if (window.localStorage.newAnk_CITY_id != null) {
      $scope.newAnk.CITY = window.localStorage.newAnk_CITY_name;
      $.kladr.setValues({
        city: +window.localStorage.newAnk_CITY_id
      }, 'form');
    }

    // признак того, что пользователь нажимал кнопку сохранения анкеты
    $scope.saveClicked = false;

    // штрих-код не был просканирован
    $scope.ID_SCAN = 0;
    $scope.newAnk.ID_CODE = 0;
  };

  // добавление заболевания в список
  $scope.btnAddZabolClickHandler = function btnAddZabolClickHandler() {

    // если отфильтрован один, его и добавляю, помечая сначала его selected
    if ($scope.zabolFiltered.length === 1) {
      $scope.mZabolSelectedClear();
      $scope.zabolFiltered[0].selected = 1;
    }

    // если есть selected элемент, то добавляю его
    var sel = $scope.global.manual.M_ZABOL.find((item) => item.selected === 1);
    if (sel) {
      var el = { M_ZABOL_ID: sel.ID, M_ZABOL_NAME: sel.NAME };
      $scope.newAnk.O_ANK_ZABOL.push(el);
    }
    
    $scope.mZabolSelectedClear();
  };


  // удаление заболевания из списка
  $scope.btnRemoveZabolClickHandler = function btnRemoveZabolClickHandler() {

    // если один элемент, помечаю его выбранным
    if ($scope.newAnk.O_ANK_ZABOL.length === 1) {
      $scope.newAnk.O_ANK_ZABOL[0].selected = 1;
    }

    // если есть selected элемент, то удаляю его
    var sel = $scope.newAnk.O_ANK_ZABOL.findIndex((item) => item.selected === 1);
    if (sel !== -1) {
      $scope.newAnk.O_ANK_ZABOL.splice(sel, 1);
    }

    $scope.mZabolSelectedClear();
  };


  // фильтр для выбранных заболеваний
  $scope.zabolPoiskFilter = function zabolPoiskFilter(item) {
    // если элемент уже выбран, не показываю его в исходном списке
    if ($scope.newAnk.O_ANK_ZABOL.find((selItem) => selItem.M_ZABOL_ID === item.ID) !== undefined) {
      return false;
    }
    // если в поиске ничего не вбито, то показываю элемент
    if ($scope.zabolPoisk == null || $scope.zabolPoisk.length === 0) {
      return true;
    // иначе поверяю имя элемента на соответствие введенному тексту в поиске
    } else {
      return (item.NAME.toUpperCase().indexOf($scope.zabolPoisk.toUpperCase()) >= 0);
    }
  };


  // пометить выбранный элемент в списке заболеваний
  $scope.mZabolItemClickHandler = function mZabolItemClickHandler(item) {
    $scope.mZabolSelectedClear();
    item.selected = 1;
  };


  // пометить выбранный элемент в списке выбранных заболеваний
  $scope.zabolSelectedItemClickHandler = function zabolSelectedItemClickHandler(item) {
    $scope.zabolSelectedSelectedClear();
    item.selected = 1;
  };


  // сбросить выбор в списке заболеваний
  $scope.mZabolSelectedClear = function mZabolSelectedClear() {
    $scope.global.manual.M_ZABOL.forEach((arItem) => arItem.selected = 0);
  };


  // сбросить выбор в списке выбранных заболеваний
  $scope.zabolSelectedSelectedClear = function zabolSelectedSelectedClear() {
    $scope.newAnk.O_ANK_ZABOL.forEach((arItem) => arItem.selected = 0);
  };


  // сохранение анкеты
  // bReturnPromise - true, если нужно возвратить Promise, когда вызывается из
  //                  других процедур
  $scope.save = function save(bReturnPromise) {

    $scope.saveClicked = true;

    // если есть невалидные поля в опциях регистрации
    if ($scope.regForm.$invalid ||
      // или не заполнены фамилия имя и отчество
      (($scope.newAnk.SURNAME || "") + ($scope.newAnk.NAME || "") + ($scope.newAnk.SECNAME || "")) === ""
        
    ) {
      if (bReturnPromise === true) {
        return new Promise(function (resolve, reject) { reject(0); });
      } else {
        return;
      }
    }

    $scope.global.showWaitingForm("Сохранение анкеты...");

    // запоминаю последний введенный город,
    // чтобы потом в новой анкете его отобразить
    if (jQuery("input[ng-model='newAnk.CITY'").attr("data-kladr-id") != null) {
      window.localStorage.newAnk_CITY_name = $scope.newAnk.CITY;
      window.localStorage.newAnk_CITY_id = jQuery("input[ng-model='newAnk.CITY'").attr("data-kladr-id");
    }

    $scope.newAnk.O_SEANS = null;
    // если галочка "Регистрировать на сеанс"
    if ($scope.newAnk.regForSeans === 1) {

      // вычисляю ряд, к которому относится место
      let selectedPlace = 
        $scope.global.manual.M_SEANS_PLACE.find(
        (item) => { return item.ID == $scope.newAnk.M_SEANS_PLACE_ID; })
      ;
      let m_ryad_id;
      if (selectedPlace == null) {
        m_ryad_id = null;
      } else {
        m_ryad_id = selectedPlace.M_RYAD_ID;
      }


      $scope.newAnk.O_SEANS = {
        M_SEANS_TIME_ID: $scope.newAnk.M_SEANS_TIME_ID,
        M_SEANS_PLACE_ID: $scope.newAnk.M_SEANS_PLACE_ID,
        M_RYAD_ID: m_ryad_id
      };
    }

    // если Источник информации не Посетитель, то затираю его фамилию
    if (!$scope.isIstInfPosetitel()) {
      $scope.newAnk.FIO_INFO_ID = null;
      $("#fioInfoId1")[0].value = null;
    }

    // возвращаю Promise, чтобы его можно было использовать в Сохранить и печать карты
    var p = new Promise(function newAnkSavePromise(resolve, reject) {

      if ($scope.ID_SCAN == null) {
        $scope.ID_SCAN = 0;
      }

      $http({
        "method": "POST",
        "url": "/Home/NewAnkSave",
        data: {
          o_ank: $scope.newAnk, o_ank_zabol: $scope.newAnk.O_ANK_ZABOL, base64photo: $scope.newAnk.base64Photo,
          o_seans: $scope.newAnk.O_SEANS,
          ist_inf_userid: $scope.newAnk.IST_INFO_USERID,
          is_scan: $scope.ID_SCAN
        }
      }).success(function (data) {
      
        if (data.success === "true") {

          // возвращается вся полностью переполученная анкета
          // загружаю данные в $scope.newAnk
          $scope.loadAnk(data.data);

        } else if (data.success === "false") {

          $scope.global.showErrorAlert(data.message);

        }

        $scope.global.hideWaitingForm().then(function hideWaitingFormComplete() {
          resolve(data.data || data.message);
        });

      }).catch((err) => {

        $scope.global.showErrorAlert("Ошибка: " + err.data);
        $scope.global.hideWaitingForm().then(function hideWaitingFormComplete() {
          reject(err);
        });

      });
    });

    if (bReturnPromise === true) {
      return p;
    }


  };


  // затемнённый фон для фотографирования
  $scope.photoFormBackgroundShow = false;

  $scope.imgPhoto = "/Content/img/u4.png";

  // сделать фото
  $scope.photoFormShow = function photoFormShow() {

    // право на редактирование
    if ($scope.global.function.noHavePravoWrite(1,1)) return false;

    $scope.photoFormBackgroundShow = true;
    Webcam.set({
      width: 320,
      height: 240,
      image_format: 'jpeg',
      jpeg_quality: 90
    });
    Webcam.attach('#my_camera');

  };

  $scope.takeSnapshot = function takeSnapshot() {
    // сделать фото и получить данные
    Webcam.snap(function (data_uri) {
      // отобразить результат на странице
      document.getElementById('my_camera_results').innerHTML = '<img src="' + data_uri + '"/>';
    });
  };

  // сохранить результаты сделанного фото
  $scope.photoFormSave = function photoFormSave() {
    $scope.imgPhoto = document.getElementById('my_camera_results')
                                    .getElementsByTagName("img")[0].getAttribute("src");
    // удаляю тип для передачи в контроллер mvc
    // удаляется data:image/jpeg;base64, в начале строки
    $scope.updateBase64Photo();
    $scope.photoFormBackgroundShow = false;
    Webcam.reset()
  };

  // заполняю поле base64Photo, выбранное либо из файла либо снятое камерой
  $scope.updateBase64Photo = function updateBase64Photo() {
    // удаляю тип для передачи в контроллер mvc
    // удаляется data:image/jpeg;base64, в начале строки
    $scope.newAnk.base64Photo = $scope.imgPhoto.substring($scope.imgPhoto.indexOf(",") + 1);
  }

  // закрыть окно фотосъемки
  $scope.photoFormClose = function photoFormClose() {
    $scope.photoFormBackgroundShow = false;
    Webcam.reset()
  };


  // фото выбрали из файла
  $("#newAnk #newAnkRight input[type='file']")[0].addEventListener("change", function loadImage(e) {
    var that = this;
    if (this.files != null && this.files[0] != null) {
      var reader = new FileReader();

      reader.onload = function readerOnLoad(e) {
        $scope.imgPhoto =
          "data:" + that.files[0].type + ";base64," +
          window.btoa([].reduce.call(new Uint8Array(e.target.result), (p, c) => { return p + String.fromCharCode(c) }, ""))
        ;

        // удаляю тип для передачи в контроллер mvc
        // удаляется data:image/jpeg;base64, в начале строки
        $scope.updateBase64Photo();
        $scope.$apply();
      };

      reader.readAsArrayBuffer(this.files[0]);
    }
  });



  // Автодополнение адреса
  (function adresAvtodopolnenie() {
    var $container = $(document.getElementById('adresForm'));

    var $post_index = $container.find('[name="post_index"]'),
			$region = $container.find('[name="region"]'),
			$district = $container.find('[name="district"]'),
			$city = $container.find('[name="city"]'),
			$street = $container.find('[name="street"]'),
			$house = $container.find('[name="house"]');

    var $tooltip = $container.find('.tooltip');

    $()
			.add($region)
			.add($district)
			.add($city)
			.add($street)
			.add($house)
			.kladr({
			  parentInput: $container.find('.js-form-address'),
			  verify: true,
			  select: function (obj) {
			    $tooltip.hide();
			  },
			  check: function (obj) {
			    var $input = $(this);

			    if (obj) {
			      $tooltip.hide();
			    }
			    else {
			      showError($input, 'Введено неверно');
			    }
			  },
			  checkBefore: function () {
			    var $input = $(this);

			    if (!$.trim($input.val())) {
			      $tooltip.hide();
			      return false;
			    }
			  }
			})
    ;


    // выбранный адрес форматируется как краткое обозначение объекта и его имя,
    // например г. Самара или пер. Водников
    $scope.adresValueFormat = function adresValueFormat(val) {
      return val.typeShort + ". " + val.name
    };

    $region.kladr({'type': $.kladr.type.region, valueFormat: $scope.adresValueFormat});
    $district.kladr({ 'type': $.kladr.type.district, valueFormat: $scope.adresValueFormat});
    $city.kladr({'type': $.kladr.type.city, valueFormat: $scope.adresValueFormat});
    $street.kladr({'type': $.kladr.type.street, valueFormat: $scope.adresValueFormat});
    $house.kladr('type', $.kladr.type.building);

    // Отключаем проверку введённых данных для строений
    $house.kladr('verify', false);

    // Подключаем плагин для почтового индекса
    $post_index.kladrZip($container);

    function showError($input, message) {
      $tooltip.find('span').text(message);

      var inputOffset = $input.offset(),
				inputWidth = $input.outerWidth(),
				inputHeight = $input.outerHeight();

      var tooltipHeight = $tooltip.outerHeight();

      $tooltip.css({
        left: (inputOffset.left + inputWidth + 10) + 'px',
        top: (inputOffset.top + (inputHeight - tooltipHeight) / 2 - 1) + 'px'
      });

      $tooltip.show();
    }
  })();
  // /автодополнение адреса


  // Автодополнение фамилии
  $scope.surnameChangeHanlder = function surnameChangeHanlder() {
    $scope.surnameMatch = "";
    $http({
      method: "GET",
      url: "/Home/SearchSurname",
      params: {term: $scope.newAnk.SURNAME}
    }).then(function surnameMatchReceive(res) {
      var s;
      var i;
      s = "";
      for (i = 0; i < $scope.newAnk.SURNAME.length; i++) {
        s = s + " ";
      }
      s = s + res.data.SURNAME.substr($scope.newAnk.SURNAME.length);
      $scope.surnameMatch = s;
    });
  };

  $scope.surnameBlurHandler = function surnameBlurHandler() {
    $scope.surnameMatch = "";
  };

  $scope.surnameKeyUpHandler = function surnameKeyUpHandler(e) {
    // стрелка вправо
    if (e.which === 39) {
      if ($scope.surnameMatch != null && $scope.surnameMatch != "") {
        $scope.newAnk.SURNAME = $scope.newAnk.SURNAME + $scope.surnameMatch.toLowerCase().trim();
        $scope.surnameMatch = "";
      }
      var inputs = $(e.currentTarget).closest('#fioAndOther').find('input');
      inputs.eq(inputs.index(e.currentTarget) + 1).focus();
    }
  };
  // /автодополнение фамилии


  // Печать анкеты
  $scope.saveAndPrint = function saveAndPrint() {

    // чтобы обойти запрет на создание всплывающих окон из сторонних функций
    // (не непосредственно из click кнопки) создаю окно сразу, при click, а
    // затем использую его уже после выполнения promise сохранения
    var newWindow = window.open("/Home/PrintAnk");

    // сначала сохраняю
    $scope.save(true).then(function newAnkSaveSuccess(data) {

      // потом печать
      // если ошибок не было, то вернулась анкета
      if (data.data != null && data.data.ID != null) {
        
        // #383 ожидается строка заболеваний
        var ank = data.data;

        ank.ZABOL = ank.O_ANK_ZABOL.reduce(function(zabol, item) {
          return zabol + ", " + item.M_ZABOL_NAME;
        }, "");

        ank.ZABOL = ank.ZABOL.substring(2, ank.ZABOL.length-2);

        $scope.global.function.printAnk(null, ank, newWindow);

        // если при сохранении ошибка, то закрываю окно печати
      } else {
        newWindow.close();
      }       

    }, function newAnkSaveFailed(err) {

      // при ошибке сохранения ничего не делаю, т.к. это должно обработаться
      // в самой процедуре сохранения

      // закрываю окно печати
      newWindow.close();

    });

  };
  // /печать анкеты


  // загрузить в текущую анкету ($scope.newAnk) данные полученные из запроса
  $scope.loadAnk = function loadAnk(data) {

    $scope.saveClicked = false;

    // angular не поддерживается для ng-model даты в виде строки,
    // все даты надо преобразовать вручную
    if (data.data.DATE_REG != null) {
      data.data.DATE_REG = new Date(data.data.DATE_REG);
    }

    if (data.data.BIRTHDAY != null) {
      data.data.BIRTHDAY = new Date(data.data.BIRTHDAY);
    }

    // посетитель из Источника информации
    if (data.data.FIO_INFO_ID != null) {
      $("#fioInfoId1")[0].value = data.data.FIO_INFO_ID_NAME;
    }

    $scope.newAnk = data.data;
    $scope.global.ank = data.data;
    $scope.newAnk.PR_NEW = false;

    if ($scope.newAnk.PHOTO == null) {
      $scope.imgPhoto = "/Content/img/u4.png";
    } else {
      $scope.imgPhoto = "/Home/GetAnkPhoto/" + $scope.newAnk.ID;
    }

    if ($scope.newAnk.CITY != null) {
      // убираю букву "г. " перед названием города, иначе плагин
      // кладра работает неверно
      var s = $scope.newAnk.CITY;
      if (s.substring(0, 3) === "г. ") {
        s = s.substring(3);
      }
      $.kladr.setValues({
        city: s
      }, 'form');
    }

    // если есть ошибки при регистрации на сеанс
    if (($scope.newAnk.reg_error != null) && ($scope.newAnk.reg_error.length > 0)) {
      $scope.global.showErrorAlert($scope.newAnk.reg_error);
    }

    // удаляем картинку штрих-кода, который остался от прежнего сканирования
    $('#ank-barcode-div').children().remove();

    // проставляем признаки сканирования
    // как будто штрих-код отсканирован
    $scope.ID = null;
    $scope.enterPressed = true;
    $scope.isPasted = true;
    // штрих-код не был просканирован
    $scope.ID_SCAN = 0;

    $("#ank-barcode-div").append("<img id='ank-barcode-img' class='ank-barcode-img'/>");

    // отображаем штрих-код
    $("#ank-barcode-img").JsBarcode(
      // надо дополнять ID нулями до 12 символов
      ("000000000000" + $scope.newAnk.ID_CODE).substr(($scope.newAnk.ID_CODE + "").length),
      { width: 3, height: 60, format: "EAN13" }
    );

  };


  // открыть анкету по ID
  $scope.$on("openAnk", function openAnkHandler(event, ID) {
    $scope.global.showWaitingForm("Открытие анкеты...");
    $http({
      method: "GET",
      url: "/Home/GetAnkRequest/",
      params: { ID: ID }
    }).then(
      function getAnkSuccess(data) {

        // сбрасываю все значения анкеты на первоначальные
        $scope.initAnk();

        // загружаю данные в $scope.newAnk
        $scope.loadAnk(data);

        $scope.global.selectedSubMenuItem = 0;
        $scope.global.selectedMenuItem = "menuItemNew";
        $scope.global.hideWaitingForm();
        if ($scope.global.openAnkDone != null) {
          $scope.global.openAnkDone();
        }

      },
      function getAnkFail(err) {
        $scope.global.showErrorAlert(err.data);
        $scope.global.hideWaitingForm();
      });
  });


  // создать новую анкету
  $scope.$on("createAnk", function createAnkHandler(event, prop) {

    var p;

    $scope.global.showWaitingForm("Создание анкеты...");
    
    // сбрасываю все значения анкеты на первоначальные
    $scope.initAnk();

    // проставляю переданные значения
    for (p in prop) {
      $scope.newAnk[p] = prop[p];
    }


    $scope.global.selectedSubMenuItem = 0;
    $scope.global.selectedMenuItem = "menuItemNew";
    $scope.global.hideWaitingForm();

  });


  // true, если в качестве источника информации выбран Посетитель
  $scope.isIstInfPosetitel = function isIstInfPosetitel() {
    return $scope.newAnk.IST_INFO === $scope.global.const.M_IST_INFO_POSET;
  };



  $scope.regForSeansChanged = function regForSeansChanged() {
    // alert($scope.newAnk.regForSeans);
  };


  // печать анкеты
  // вызов из кнопки "Печать карты"
  $scope.printAnk = function printAnk() {

    // заболевания клиента в строку через запятую
    if ($scope.newAnk.O_ANK_ZABOL.length > 0) {
      $scope.ankZabolAsString = $scope.newAnk.O_ANK_ZABOL.reduce(
        ((pre, cur) => { return { M_ZABOL_NAME: pre.M_ZABOL_NAME + ", " + cur.M_ZABOL_NAME }; })).M_ZABOL_NAME;
    } else {
      $scope.ankZabolAsString = "";
    }

    $scope.newAnk.ZABOL = $scope.ankZabolAsString;

    // создаю окно печати сразу, чтобы было единообразно с Печать и сохранить,
    // в данном контексте не требуется создавать окно заранее, но так удобнее
    var newWindow = window.open("/Home/PrintAnk");
    $scope.global.function.printAnk(null, $scope.newAnk, newWindow);

  }

  // маска телефона
  $("#phoneMobile").mask("+7(999) 999-99-99");
  $("#phoneHome").mask("+7(999) 999-99-99");

  // поиск сотрудника, которые ввел данные в контакты
  $scope.getRekAnkFio = function getRekAnkFio(phone) {
    if (typeof phone === "undefined") {
      return false;
    }

    $http({
      method: "GET",
      url: "/Home/GetRekAnkFio",
      params: {
        phone: phone
      }
    }).then((data) => {
      if (data.data.id === "") {
        $scope.newAnk.FIO_INFO_ID = null;
        $("#fioInfoId1")[0].value = null;
        $scope.newAnk.IST_INFO = $scope.global.const.M_IST_INFO_SOTRUDNIK;
        
        if (data.data.ist_inf_userid !== "") {
          if (data.data.ist_inf_userid !== -1) {
            $scope.newAnk.IST_INFO_USERID = data.data.ist_inf_userid;
          } else {
            // если не найден контакт, нет смысла оставлять "Сотрудник",
            // все равно сработает контроль "Источник информации должен быть любой другой"
            $scope.newAnk.IST_INFO = $scope.global.const.M_IST_SAM_PRISHEL;
            $scope.newAnk.IST_INFO_USERID = null;
          }
        }
      } else {
        $scope.newAnk.FIO_INFO_ID = data.data.id;
        $("#fioInfoId1")[0].value = data.data.fio;
        $scope.newAnk.IST_INFO = $scope.global.const.M_IST_INFO_POSET;
      }
    }, (err) => {
      $scope.global.showErrorAlert(err.data);
    });
  }

  $scope.printAbonement = function printAbonement() {
    var newWindow = window.open("/Home/PrintAbonement");

    if (($scope.newAnk.PHOTO != null) && ($scope.newAnk.PHOTO !== "")) {
      $scope.newAnk.ANK_PHOTO = $scope.imgPhoto;
    }

    $scope.global.function.printAnk(null, $scope.newAnk, newWindow);
  }

  // при вводе в поле штрих-кода
  $scope.barCodeKeyPress = function barCodeKeyPress(evt) {
    // штрих-код полностью введён
    if (evt.keyCode === 13) {
      $scope.enterPressed = true;
      $scope.scan();
    }
  }

  // событие при вставке штрих-кода
  $scope.barCodePaste = function barCodePaste(evt) {
    // проверяю, что передано целое число
    var pastedValue = evt.clipboardData.getData('Text');
    var pastedValueAsNumber = +pastedValue;
    if (!(typeof pastedValueAsNumber === 'number' && (pastedValueAsNumber % 1) === 0)) {
      $scope.ID = null;
      $scope.global.showErrorAlert("Вставляемое значение '" + pastedValue + "' не является правильным штрих-кодом");
      evt.preventDefault();
      return false;
    }

    $scope.ID = pastedValueAsNumber;
    $scope.isPasted = true;
    $scope.scan();

  };

  // сканирование анкеты, действие после того, как штрих-код устройство считало новый код
  $scope.scan = function scan() {
    // сканируется в виде "1234" (произвольное количество символов), надо убрать
    // и последнюю цифру, которая является контрольной суммой
    // если штрих-код скопировали из режима Период и вставили, то контрольной цифры не будет
    if ($scope.isPasted === false) {
      $scope.ID = "" + $scope.ID;
      $scope.ID = +$scope.ID.slice(0, -1);
    }

    $("#ank-barcode-div").append("<img id='ank-barcode-img' class='ank-barcode-img'/>");

    // штрих-код
    $("#ank-barcode-img").JsBarcode(
      // надо дополнять ID нулями до 12 символов
      ("000000000000" + $scope.ID).substr(($scope.ID + "").length),
      { width: 3, height: 60, format: "EAN13" }
    );

    $scope.newAnk.ID_CODE = $scope.ID;
    $scope.ID_SCAN = 1;
  }

  // в анкете заменен штрих-код
  $scope.alterBarCode = function alterBarCode() {
    // удаляем картинку штрих-кода, которая может осталась от прежнего сканирования
    $('#ank-barcode-div').children().remove();

    // отображаем поле для сканирования
    $scope.ID = null;
    $scope.enterPressed = false;
    $scope.isPasted = false;
    // штрих-код не был просканирован
    $scope.ID_SCAN = 0;

    // ставим фокус в поле
    window.setTimeout(function () {
      $("#newAnkBarCodeInput").focus();
    });
  }
});