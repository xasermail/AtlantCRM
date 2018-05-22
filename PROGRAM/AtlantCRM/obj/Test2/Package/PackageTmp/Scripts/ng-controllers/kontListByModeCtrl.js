"use strict";

kontListByModeCtrl = myApp.controller("kontListByModeCtrl", function kontListByModeCtrl($scope, $http) {
  //значение смещения вверх для появляющихся окошек
  $scope.offsetInTop = -80;
    // текущая страница
  $scope.page = 1;
  //режим просмотра "Не пришедшие"
  $scope.currentMode = 1;

  $scope.pageForNotCame = 1;
  $scope.pageForHidet = 1;
  $scope.pageForRecomend = 1;

    // событие при открытии подвкладки Непришедшие
    $scope.$on("global.selectedKontSubMenuItemChanged", function selectedKontSunMenuItemChanged(event, newValue) {

        // срабатывает, только если открыта вкладка Контакты
      if ($scope.global.selectedMenuItem === "menuItemKont"){
        if(newValue == "1") {
          
          if ($scope.page != 0) {
            if ($scope.currentMod == 2) {
              //выполняем сохрание текущей страницы для режима скрытые
              $scope.pageForHidet = $scope.page;
            }
            else if ($scope.currentMod == 3) {
              $scope.pageForRecomend = $scope.page;
            }
          }
          //устанавливаем текущий режим не пришедшие
          $scope.currentMode = 1;
          //востанавливаем выбранну ю страницу для режима не пришедшие
          $scope.page = $scope.pageForNotCame;
          $scope.refreshKontNoCame();
        }
        else if (newValue == "2") {
          if ($scope.page != 0) {
            if ($scope.currentMode == 3) {
              $scope.pageForRecomend = $scope.page;
            }
            else if ($scope.currentMode == 1) {
              $scope.pageForNotCame = $scope.page;
            }
          }
          $scope.currentMode = 2;
          $scope.page = $scope.pageForHidet;
          $scope.refreshKontNoCame();
        }
        else if (newValue == "3") {
          if ($scope.page != 0) {
            if ($scope.currentMode == 1) {
              $scope.pageForNotCame = $scope.page;
            }
            else if ($scope.currentMode == 2) {
              $scope.pageForHidet = $scope.page;
            }
          }
          $scope.currentMode = 3;
          $scope.page = $scope.pageForRecomend;
          $scope.refreshKontNoCame();
        }

        else if (newValue == "0") {
          if($scope.currentMode == 2){
            $scope.pageForHidet = $scope.page;
          } else if ($scope.currentMode == 1) {
              $scope.pageForNotCame = $scope.page;
              $scope.page = 0;
          } else if ($scope.currentMode == 3) {
            $scope.pageForRecomend = $scope.page;
            $scope.page = 0;
          }
        }
      }

    });


    // событие при открытии вкладки Контакты
    $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

      // если открыто подменю Непришедшие
      if (newValue === "menuItemKont" && $scope.global.selectedKontSubMenuItem == "1") {
        $scope.refreshKontNoCame();
      }

    });


  // обновление данных вкладки Непришедшие
    $scope.refreshKontNoCame = function refreshKontNoCame() {
      closeAllWindow();
      $scope.getDataNotCame();
    };


    $scope.getDataNotCame = function getDataNotCame() {
        $http({
            method: "GET",
            url: "/Home/GetKontListByMode",
            params:
            {
              page: $scope.page,
              mode: $scope.currentMode
            }
        }).success(function (data) {
            $scope.dataForTableNotCame = data.rows;
            $scope.allCount = data.countAll;
            $scope.pageNums = [];
            var i;
            for (i = 1; i <= data.totalPageCount; i += 1) {
                $scope.pageNums.push(i);
            }
        });
    }

    $scope.btnRemoveKontClickHandler = function btnRemoveKontClickHandler(item) {

        $scope.global.function.showYesNoDialog("Вы уверены, что хотите удалить контакт?", () => {

            $http({
                method: "POST",
                url: "/Home/RemoveKont",
                data: { kont: item }
            }).then((data) => {
                $scope.getDataNotCame();
            });
        });
    }


    $scope.btnUndoKontClickHandler = function btnUndoKontClickHandler(item) {

      $scope.global.function.showYesNoDialog("Вы уверены, что хотите вернуть контакт?", () => {

        $http({
          method: "POST",
          url: "/Home/UndoKont",
          data: { kont: item }
        }).then((data) => {
          $scope.getDataNotCame();
        });
      });
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
        $scope.changeSeansDate = new Date();

        //устанавливаем корректное положение элемента на экране
        $scope.zapisatNaSeansLeft = $(elem).offset().left;
        $scope.zapisatNaSeansTop = $(elem).offset().top + $scope.offsetInTop;;
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
                date: new Date(),
                time_id: $scope.change_m_seans_time_id,
                commentForSave: $scope.commentForSave
            }
        }).success(function (data) {
            getData($scope.yearMonthDay);
        });
        closeAllWindow();
    }
    // --== /изменение сеанса ==-- 


    function closeAllWindow() {
      $scope.newAnkNaSeans = 0;
      $scope.newKontSurname = "";
      $scope.newKontName = "";
      $scope.newKontSecname = "";
      $scope.newKontPhone_mobile = "";

       var d = new Date();
        // запись всегда завтра и позднее
        d.setDate(d.getDate() + 1);
        $scope.changeSeansDate = d;
        $scope.changeSeans = 0;
        $scope.commentForSave = "";
        $scope.errorSaveChangeSeansDate = "";
        $scope.zapisatNaSeansHeight = 140;
        $scope.errorMessageChangeSeansHeight = 0;
    }

    // при выборе другой страницы
    $scope.pageNumClickHandler = function pageNumClickHandler(pageNum) {
        $scope.page = pageNum;
        $scope.getDataNotCame();
    };

    //нажатие на выбор предыдущей страницы
    $scope.prevPageClickHandler = function prevPageClickHandler() {
      //если страниц всего одна или нет вообще делаем выбранной первую
      if ($scope.pageNums.length <= 1) {
        $scope.page = 1;
        //обновляем содержимое
        $scope.getDataNotCame();
        return;
      }

      //если не на находимся не на первой странице уменьшаем номер текущей страницы на 1
      if ($scope.page > 1) {
        $scope.page = $scope.page - 1;
      }
      //обновляем содержимое
      $scope.getDataNotCame();
    }

    //нажатие на выбор следующие страницы
    $scope.nextPageClickHandler = function nextPageClickHandler() {
      //если страниц всего одна или нет вообще делаем выбранной первую
      if ($scope.pageNums.length <= 1) {
        $scope.page = 1;
        //обновляем содержимое
        $scope.getDataNotCame();
        return;
      }
      
      //получаем последний элемнет
      var lastElem = $scope.pageNums[$scope.pageNums.length - 1];
      if ($scope.page != lastElem) {
        $scope.page = $scope.page + 1;
        //обновляем содержимое
        $scope.getDataNotCame();
      }

    }

  // нажатие на ФИО дл открытия редакирования
    $scope.tdChangeKontClickHandler = function tdChangeKontClickHandler(e, item) {
      closeAllWindow();
      // права на запись
      if ($scope.global.contactPravoWrite === 0) return false;

      var elem = e.currentTarget;

      $scope.newKontSurname = item.SURNAME;
      $scope.newKontName = item.NAME;
      $scope.newKontSecname = item.SECNAME;
      $scope.newKontPhone_mobile = item.PHONE;
      $scope.commentForSave = item.COMMENT;
      $scope.kontID = item.KONT_ID;

      $scope.newAnkNaSeansLeft = $(elem).offset().left;
      $scope.newAnkNaSeansTop = $(elem).offset().top + $scope.offsetInTop;
      $scope.newAnkNaSeans = 1;
      $scope.existsSeansHeight = 1;
      $scope.newAnkHeight = 175;

      if ($scope.currentMode == 3) {
        $scope.newAnkHeight = 125;
      }


      // маска телефона
      $("#kontPhoneMobile").mask("+7(999) 999-99-99");

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
      
      var url = "/Home/ChangeKont";
      if ($scope.currentMode == 3) {
        url = "/Home/ChangeRecomendKont";
      }

      $http({
        "method": "POST",
        "url": url,
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
          $scope.getDataNotCame();
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

  //Кнопка "Х" в окошке нового контакта
    $scope.btnCloseNewKont = function btnCloseNewKont() {
      closeAllWindow();
    }

});