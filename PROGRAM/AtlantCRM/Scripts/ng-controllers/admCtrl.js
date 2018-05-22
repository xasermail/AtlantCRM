"use strict";

// контроллер
admCtrl = myApp.controller("admCtrl", function admCtrl($scope, $http) {

  // текущая добавляемая/редактируемая организация
  $scope.org = {};

  // добавляемый пользователь
  $scope.user = {
    S_USER_ROLE_ID: 1,
    imgPhoto: "/Content/img/u4.png",
    HIRE_DATE: $scope.global.function.newDateNoTime()
  };

  // окно добавления/редактирования пользователя
  $scope.newEditUserFormShow = false;

  // выбранный элемент
  $scope.activeItem = null;
  // M_ORG.ID выбранного элемента
  $scope.activeItemId = null;
  // отображать ли окно добавления/редактирования организации
  $scope.isOrgAddEditShow = false;
  // отображать ли окно добавления/редактирования пользователей
  $scope.isUserAddEditShow = false;


  // переполучить дерево организаций
  $scope.refreshOrgTree = function refreshOrgTree() {

    $scope.global.showWaitingForm("Получение организаций..");

    return $http({
      method: "GET",
      url: "/Home/GetOrgTree"
    }).then((data) => {

      $scope.global.hideWaitingForm();
      return new Promise((resolve, reject) => {
        resolve(data);
      });

    });

  };


  // событие при открытии вкладки
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemAdm") {

      // прячем настройки
      $scope.global.pravoNaSpravRej = 0;
      $scope.global.selectedMenuItem = newValue;

      $scope.global.showWaitingForm("Получение пользователей..");

      // обновляю справочник пользователей
      $scope.global.refreshManual("S_USER").then((data) => {

        // при инициализации сразу получаю дерево
        return $scope.refreshOrgTree();

      }).then(function getOrgTreeSuccess(data) {

        $scope.org_tree = data.data;
        $scope.global.hideWaitingForm();


        // если открывает директор дилера D, то отображаю только
        // его организацию
        if ($scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_D &&
            $scope.global.userContext.S_USER_ROLE_ID === $scope.global.const.S_USER_ROLE_ID_DIREKTOR)
        {
          $scope.activeItemId = $scope.global.userContext.M_ORG_ID;
          let item = null;
          let i1;
          let i2;
          let i3;

          // дилер A
          for (i1 = 0; i1 < $scope.org_tree.childs.length; i1++) {

            // по идее Дилера D не будет среди Дилеров A, но мало ли
            if ($scope.org_tree.childs[i1].ID === $scope.activeItemId) {
              item = $scope.org_tree.childs[i1];
            }

            // дилер C или дилер D
            for (i2 = 0; i2 < $scope.org_tree.childs[i1].childs.length; i2++) {

              if ($scope.org_tree.childs[i1].childs[i2].ID === $scope.activeItemId) {
                item = $scope.org_tree.childs[i1].childs[i2];
              }

              // дилер D
              for (i3 = 0; i3 < $scope.org_tree.childs[i1].childs[i2].childs.length; i3++) {

                if ($scope.org_tree.childs[i1].childs[i2].childs[i3].ID === $scope.activeItemId) {
                  item = $scope.org_tree.childs[i1].childs[i2].childs[i3];
                }

              } // for i3

            } // for i2

          } // for i1

          if (item == null) {

            $scope.global.selectedMenuItem = "menuItemBaza";
            $scope.global.showErrorAlert("Ошибка при определении организации с ID = " + $scope.activeItemId);

          } else {
            $scope.activeItem = item;
            $scope.btnUserClickHandler($scope.activeItem);
            $scope.global.commonModalBackgroundShown = false;
          }

        }

      }).catch((err) => {

        $scope.global.showErrorAlert("menuItemAdmSelected: " + err);
        $scope.global.hideWaitingForm();

      });




    }

  });


  // щелчок мышью по элементу в списке огранизаций
  $scope.orgClickHandler = function orgClickHandler(item) {
    $scope.activeItem = item;
    $scope.activeItemId = item.ID;
  };


  // пользователь нажал "Добавить организацию"
  // item - у какой организации была нажата эта кнопка
  $scope.btnAddOrgClickHandler = function btnAddOrgClickHandler(item) {

    $scope.btnOrgAddCreateCaption = "Создать";

    // модель для окна добавления/редактирования организации
    $scope.org = {};

    // проставляю головную организацию
    $scope.org.PARENT_ID = item.ID;

    // TODO: проставляю тип организации
    $scope.org.M_ORG_TYPE_ID = 2;

    // фоновое окно
    $scope.global.commonModalBackgroundShown = true;

    // окно добавления/редактирования организации
    $scope.isOrgAddEditShow = true;

    // маска телефона
    $("#orgPhoneMobile").mask("+7(999) 999-99-99");

  };


  // пользователь нажал "Ред-ть" (редактировать организацию)
  // item - у какой организации была нажата эта кнопка
  $scope.btnEditOrgClickHandler = function btnEditOrgClickHandler(item) {

    $scope.global.showWaitingForm("Загрузка организации..");

    $scope.btnOrgAddCreateCaption = "Сохранить изменения";

    $http({
      method: "GET",
      url: "/Home/GetM_ORG",
      params: { ID: item.ID }
    }).then(function getM_ORGSuccess(data) {
      $scope.org = data.data[0];

      // фоновое окно
      $scope.global.commonModalBackgroundShown = true;

      // окно добавления/редактирования организации
      $scope.isOrgAddEditShow = true;

      // маска телефона
      $("#orgPhoneMobile").mask("+7(999) 999-99-99");

    }).catch(function getM_ORGFail(err) {

      $scope.global.showErrorAlert("getM_ORGFail: " + err.data.toString());

    }).finally(function getM_ORGFanally(err) {

      $scope.global.hideWaitingForm();
    });

  };


  // нажата кнопка "Отмена" внутри окна добавления/редактирования организации
  $scope.btnAddOrgCancelClickHandler = function btnAddOrgCancelClickHandler() {
    // фоновое окно
    $scope.global.commonModalBackgroundShown = false;

    // окно добавления/редактирования организации
    $scope.isOrgAddEditShow = false;
  };


  // пользователь нажал "Пользователи"
  // item - у какой организации была нажата эта кнопка
  $scope.btnUserClickHandler = function btnUserClickHandler(item) {

    // фоновое окно
    $scope.global.commonModalBackgroundShown = true;

    // окно добавления/редактирования организации
    $scope.isUserAddEditShow = true;

  };


  // пользователь нажал кнопку "Отмена" внутри окна "Пользователи"
  $scope.btnUserCancelClickHandler = function btnUserCancelClickHandler() {

    // фоновое окно
    $scope.global.commonModalBackgroundShown = false;

    // окно добавления/редактирования организации
    $scope.isUserAddEditShow = false;

  };


  // фото выбрали из файла
  $("#adm input[type='file']")[0].addEventListener("change", function loadImage(e) {
    var that = this;
    if (this.files != null && this.files[0] != null) {
      var reader = new FileReader();

      reader.onload = function readerOnLoad(e) {
        $scope.user.imgPhoto =
          "data:" + that.files[0].type + ";base64," +
          window.btoa([].reduce.call(new Uint8Array(e.target.result), (p, c) => { return p + String.fromCharCode(c) }, ""))
        ;

        // удаляю тип для передачи в контроллер mvc
        // удаляется data:image/jpeg;base64, в начале строки
        $scope.user.base64Photo = $scope.user.imgPhoto.substring($scope.user.imgPhoto.indexOf(",") + 1);
        $scope.$apply();
      };

      reader.readAsArrayBuffer(this.files[0]);
    }
  });


  // проставить галочку на группу, если выдали право просмотра
  // или редактирования
  $scope.setPravoGrOnPravoRejChanged = function setPravoGrOnPravoRejChanged(item1) {
    if (item1.READ1 === 1 || item1.WRITE1 === 1) {
      $scope.O_PRAVO_GR.find(x => x.M_PRAVO_GR_ID === item1.M_PRAVO_GR_ID).CHECKED = 1;
    }
  };


  // при щелчке на праве просмотра
  $scope.btnReadPravoClickHandler = function btnReadPravoClickHandler(item1) {

    item1.READ1 = 1 - (item1.READ1 || 0);

    // если на режим выдали право, а на группу галочка снята,
    // то ставлю галочку на группу автоматически
    $scope.setPravoGrOnPravoRejChanged(item1);

  };

  // при щелчке на праве редактирования
  $scope.btnWritePravoClickHandler = function btnWritePravoClickHandler(item1) {

    item1.WRITE1 = 1 - (item1.WRITE1 || 0);
    if (item1.WRITE1 === 1) {
      item1.READ1 = 1;
    }

    // если на режим выдали право, а на группу галочка снята,
    // то ставлю галочку на группу автоматически
    $scope.setPravoGrOnPravoRejChanged(item1);

  };


  // щелчок по кнопке добавления нового пользователя
  $scope.btnUserAddClickHandler = function btnUserAddClickHandler() {
    
    // максимум 6 неуволенных сотрудников
    var i = 0;
    var j = 0;
    if (typeof $scope.global.manual.S_USER !== "undefined") {
      for (var i = 0; i < $scope.global.manual.S_USER.length; i++) {
        if (($scope.global.userContext.M_ORG_ID === $scope.global.manual.S_USER[i].M_ORG_ID) &&
            ($scope.global.manual.S_USER[i].DISMISS_DATE === null)) {
          j++;
        }
      }
    }

    if (j > 100) {
      $scope.global.showErrorAlert("В салоне не может быть больше 100 неуволенных сотрудников! ");
      return false;
    }

    $scope.user = {
      S_USER_ROLE_ID: 1,
      imgPhoto: "/Content/img/u4.png",
      HIRE_DATE: $scope.global.function.newDateNoTime()
    };


    // модель для выбранных прав для групп
    $scope.O_PRAVO_GR = [];
    $scope.global.manual.M_PRAVO_GR.forEach(item => {
      $scope.O_PRAVO_GR.push({ ID: 0, M_PRAVO_GR_ID: item.ID, NAME: item.NAME, CHECKED: 0, M_ORG_ID: 0 });
    });

    // модель для выбранных прав для режимов
    $scope.O_PRAVO_REJ = [];
    $scope.global.manual.M_PRAVO_REJ.forEach(item => {
      $scope.O_PRAVO_REJ.push({
        ID: 0, M_PRAVO_REJ_ID: item.ID, NAME: item.NAME,
        READ1: 0, WRITE1: 0, M_ORG_ID: 0, M_PRAVO_GR_ID: item.M_PRAVO_GR_ID
      });
    });


    $scope.global.commonModalBackground2Shown = true;
    $scope.newEditUserFormShow = true;

  };


  // закрыть окно добавления/редактирования пользователя
  $scope.btnUserCloseClickHandler = function btnUserCloseClickHandler() {

    $scope.global.commonModalBackground2Shown = false;
    $scope.newEditUserFormShow = false;

  };


  // щелчок по кнопке сохранения нового пользователя
  $scope.btnUserSaveNewClickHandler = function btnUserSaveNewClickHandler() {

    $scope.global.showWaitingForm("Добавление пользователя..");

    // задаю текущую организацию
    $scope.user.M_ORG_ID = $scope.activeItemId;

    var o_pravo_gr = [];
    var o_pravo_rej = [];

    $scope.O_PRAVO_GR.forEach(item => {
      if (item.CHECKED === 1) {
        o_pravo_gr.push({ ID: item.ID, S_USER_ID: item.S_USER_ID, M_PRAVO_GR_ID: item.M_PRAVO_GR_ID });
      }
    });

    $scope.O_PRAVO_REJ.forEach(item => {
      if ((item.READ1 === 1) || (item.WRITE1 === 1)) {
        o_pravo_rej.push({
          ID: item.ID, S_USER_ID: item.S_USER_ID, M_PRAVO_REJ_ID: item.M_PRAVO_REJ_ID,
          READ1: item.READ1, WRITE1: item.WRITE1
        });
      }
    });

    // сохранить пользователя
    $http({
      method: "POST",
      url: "/Home/AddUser",
      data: {
        s_user: $scope.user, base64photo: $scope.user.base64Photo, UserName: $scope.user.UserName,
        PASSWORD: $scope.user.PASSWORD, o_pravo_gr: o_pravo_gr, o_pravo_rej: o_pravo_rej
      }
    }).then(function addUserSuccess(data) {

      if (data.data.success === true) {
        $scope.user.ID = data.data.ID;
        $scope.global.manual.S_USER.push($scope.user);
        $scope.user = {
          S_USER_ROLE_ID: 1,
          imgPhoto: "/Content/img/u4.png",
          HIRE_DATE: $scope.global.function.newDateNoTime()
        };

        // после добавления обновляю справочник пользователей
        $scope.global.refreshManual("S_USER");

        // перезапросим права
        $scope.global.loadUserRights();

        $scope.global.commonModalBackground2Shown = false;
        $scope.newEditUserFormShow = false;

      } else {
        $scope.global.showErrorAlert(data.data.error);
      }
      $scope.global.hideWaitingForm();
    },
    function addUserError(msg) {
      $scope.global.showErrorAlert(msg);
      $scope.global.hideWaitingForm();
    });


  };


  // щелчок по кнопке сохранения отредактированного пользователя
  $scope.btnUserSaveEditClickHandler = function btnUserSaveEditClickHandler() {

    $scope.global.showWaitingForm("Обновление данных пользователя..");

    var o_pravo_gr = [];
    var o_pravo_rej = [];

    $scope.O_PRAVO_GR.forEach(item => {
      if (item.CHECKED === 1) {
        o_pravo_gr.push({ ID: item.ID, S_USER_ID: item.S_USER_ID, M_PRAVO_GR_ID: item.M_PRAVO_GR_ID });
      }
    });

    $scope.O_PRAVO_REJ.forEach(item => {
      if ((item.READ1 === 1) || (item.WRITE1 === 1)) {
        o_pravo_rej.push({
          ID: item.ID, S_USER_ID: item.S_USER_ID, M_PRAVO_REJ_ID: item.M_PRAVO_REJ_ID,
          READ1: item.READ1, WRITE1: item.WRITE1
        });
      }
    });


    // если менялся пароль, то сначала задаю его
    var pr;
    if ($scope.user.PASSWORD != null) {
      pr = $http({
        method: "POST",
        url: "/Home/ChangePassword",
        data: {
          s_user: $scope.user, base64photo: $scope.user.base64Photo,
          UserName: $scope.user.UserName, PASSWORD: $scope.user.PASSWORD
        }
      }).then((data) => {

        return new Promise((resolve) => resolve(1));

      }).catch((err) => {

        $scope.global.showErrorAlert(err);
        $scope.global.hideWaitingForm();
        return new Promise((resolve, reject) => reject(0));

      });

    } else {

      pr = new Promise((resolve) => resolve(1));

    }

    // сохранить пользователя
    pr.then(
      () => $http({
        method: "POST",
        url: "/Home/EditUser",
        data: {
          s_user: $scope.user, base64photo: $scope.user.base64Photo,
          UserName: $scope.user.UserName, PASSWORD: $scope.user.PASSWORD,
          o_pravo_gr: o_pravo_gr, o_pravo_rej: o_pravo_rej
        }
      }).then(function editUserSuccess(data) {

        if (data.data.success === true) {
          $scope.user.ID = data.data.ID;
          $scope.global.manual.S_USER.push($scope.user);

          // после добавления обновляю справочник пользователей
          $scope.global.refreshManual("S_USER");

          // перезапросим права
          $scope.global.loadUserRights();

          $scope.global.commonModalBackground2Shown = false;
          $scope.newEditUserFormShow = false;

        } else {
          $scope.global.showErrorAlert(data.data.error);
        }
        $scope.global.hideWaitingForm();
      },
      function editUserError(msg) {
        $scope.global.showErrorAlert(msg);
        $scope.global.hideWaitingForm();
      })
    );

  };


  // удаление пользователя
  $scope.btnRemoveUserClickHandler = function btnRemoveUserClickHandler(item) {

    $scope.global.function.showYesNoDialog("Вы уверены, что хотите удалить пользователя?", () => {

      $scope.global.showWaitingForm("Удаление пользователя..");

      $http({
        method: "POST",
        url: "/Home/RemoveUser",
        data: { s_user: item }
      }).then((data) => {

        // после удаления обновляю справочник пользователей
        $scope.global.refreshManual("S_USER").then(() => {
          $scope.global.hideWaitingForm();
        }).catch((err) => {
          $scope.global.showErrorAlert(err);
          $scope.global.hideWaitingForm();
        });

      }).catch((err) => {

        $scope.global.showErrorAlert(err);
        $scope.global.hideWaitingForm();

      });
    });
  };


  // редактировать пользователя
  $scope.btnEditUserClickHandler = function btnEditUserClickHandler(item) {

    $scope.global.showWaitingForm("Получение прав пользователя..");

    $scope.global.commonModalBackground2Shown = true;

    $scope.user = angular.copy(item);
    $scope.user.imgPhoto = "/Home/GetUserPhoto/" + $scope.user.ID;


    // перечитываю права текущего пользователя
    $scope.global.loadUserRights().then(function loadUserRightsSuccess() {

      // права на группы
      return $http({
        method: "GET",
        url: "/Home/GetO_PRAVO_GR",
        params: { S_USER_ID: $scope.user.ID }

      });

    }).then(function getO_PRAVO_GR(data) {

      // модель для выбранных прав для групп
      $scope.O_PRAVO_GR = [];

      // ищу по всем правам на группы, какие права среди них
      // есть у пользователя
      $scope.global.manual.M_PRAVO_GR.forEach(item => {


        // устанавливать другим права, которых нет у самих,
        // может только администрация, другие пользователи
        // (директор дилера D) эти права даже не увидят
        //
        // если это Дилер D и у него нет этого права, игнорирую право
        if (
          $scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_D
          && $scope.global.pravaGr.find(x => x.ID == item.ID) == null
        ) {
          return;
        }

        // есть ли текущее право на группу у пользователя
        var o;
        o = data.data.find(x => {
          return x.M_PRAVO_GR_ID === item.ID;
        });

        // если нет
        if (o == null) {

          // добавляю право со снятой галочкой для
          // отображения, чтобы можно было поставить
          $scope.O_PRAVO_GR.push({ ID: 0, M_PRAVO_GR_ID: item.ID, NAME: item.NAME, CHECKED: 0, S_USER_ID: 0 });

        // если есть
        } else {

          // добавляю право с установленной галочкой для
          // отображения, чтобы можно было снять
          $scope.O_PRAVO_GR.push({ ID: o.ID, M_PRAVO_GR_ID: item.ID, NAME: item.NAME, CHECKED: 1, S_USER_ID: o.S_USER_ID });

        }
      });


      // права на режим
      return $http({
        method: "GET",
        url: "/Home/GetO_PRAVO_REJ",
        params: { S_USER_ID: $scope.user.ID }
      });


    }).then(function getO_PRAVO_REJ(data) {

      // модель для выбранных прав для режимов
      $scope.O_PRAVO_REJ = [];
      $scope.global.manual.M_PRAVO_REJ.forEach(item => {


        // редактировать права может только администрация и Дилер D
        // администрация может выдавать и забирать любые права, а
        // Дилер D только те права, которые у него есть
        //
        // если это Дилер D и у него нет этого права, игнорирую право
        var r = $scope.global.prava.find(x => x.REJ_ID == item.ID);
        if (
          $scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_D
          && r == null
        )
        {
          return;
        }
        // ещё может быть, что это Дилер D, у него есть это право, но только на чтение,
        // тогда отображать надо только право чтения в редактируемом пользователе
        // скрываю право редактирования (записи)
        var writeVisible = 1;
        if ($scope.global.userContext.M_ORG_TYPE_ID === $scope.global.const.M_ORG_TYPE_ID_DILER_D) {
          writeVisible = r.WRITE;
        }

        var o;
        // ищу среди доступных редактируемому пользователю режимов
        o = data.data.find(x => {
          return x.M_PRAVO_REJ_ID === item.ID;
        });

        // если режим пользователю недоступен (нет права ни на чтение, ни на запись)
        if (o == null) {

          // добавляю компоненты с невыбранным состоянием, чтобы можно было установить права
          $scope.O_PRAVO_REJ.push({
            ID: 0, M_PRAVO_REJ_ID: item.ID, NAME: item.NAME,
            READ1: 0, WRITE1: 0, S_USER_ID: 0, M_PRAVO_GR_ID: item.M_PRAVO_GR_ID,
            writeVisible: writeVisible
          });

        // если режим пользователю доступен
        } else {

          $scope.O_PRAVO_REJ.push({
            ID: o.ID, M_PRAVO_REJ_ID: item.ID, NAME: item.NAME,
            READ1: o.READ1, WRITE1: o.WRITE1, S_USER_ID: o.S_USER_ID, M_PRAVO_GR_ID: item.M_PRAVO_GR_ID,
            writeVisible: writeVisible
          });

        }

      });

    }).catch(function getPravaFailed(err) {
      $scope.global.showErrorAlert(err.toString() + " " + err.data);

    }).finally(() => {
      $scope.global.hideWaitingForm();
    });



    $scope.newEditUserFormShow = true;
  };


  // создать новую или редактировать существующую организацию 
  $scope.btnAddOrgCreateClickHandler = function btnAddOrgCreateClickHandler() {

    $scope.global.showWaitingForm("Сохранение организации...");

    if ($scope.org.DEISTV === 1) {
      $scope.activeItem.DEISTV = 1;
    } else {
      $scope.activeItem.DEISTV = 0;
    }

    // запоминаем на случай ошибки
    $scope.DEISTV = $scope.activeItem.DEISTV;

    $http({
      "method": "POST",
      "url": "/Home/OrgSave",
      data: { m_org: $scope.org }
    }).then(function addOrgCreateSuccess(data) {

      // закрыть окно добавления/редактирования организации
      $scope.btnAddOrgCancelClickHandler();

      $scope.global.hideWaitingForm();

      // после добавления обновляю справочник организаций
      return $scope.global.refreshManual("M_ORG");

    }).then(x => {

      // переполучаю дерево организаций
      return $scope.refreshOrgTree();

    }).then(data => {

      // ничего не делаю, просто переполучаю
      $scope.org_tree = data.data;

    }).catch(function addOrgCreateFailed(err) {
      // возвращаем значение
      $scope.activeItem.DEISTV = $scope.DEISTV;

      $scope.global.showErrorAlert(err.toString() + " " + err.data);
      $scope.global.hideWaitingForm();
    });

  };


  // изменилась Должность пользователя
  $scope.userRoleChangeClickHandler = function userRoleChangeClickHandler(item) {

    $scope.global.showWaitingForm("Изменение должности..");

    $http({
      "method": "POST",
      "url": "/Home/UserChangeRole",
      data: item
    }).then(function userRoleChangeSuccess(data) {

      // после изменения обновляю справочник пользователей
      $scope.global.refreshManual("S_USER");

      $scope.global.hideWaitingForm();

    }, function userRoleChangeError(err) {

      $scope.global.showErrorAlert(err.toString() + " " + err.data);
      $scope.global.hideWaitingForm();

    });

  };


  // кнопка "Перейти в магазин"
  // item - у какой организации была нажата эта кнопка
  $scope.btnGoOrgClick = function btnGoOrgClick(item) {
    
    //# 380
    if (item.DEISTV === 0) {
      $scope.global.showErrorAlert("Переход в неактивную организации невозможен");
      return false;
    }

    $scope.global.currentUserChangeMOrgId(item.ID);

  };


  // при снятии галочки с группы надо снимать права
  // со всех режимов внутри группы
  $scope.pravoGrChanged = function pravoGrChanged(item) {

    if (item.CHECKED === 0) {
      $scope.O_PRAVO_REJ
            .filter(x => x.M_PRAVO_GR_ID === item.M_PRAVO_GR_ID)
            .forEach(x => x.READ1 = x.WRITE1 = 0);
    }

  };


  // маска телефона
  $("#userPhoneMobile").mask("+7(999) 999-99-99");
  $("#orgPhoneMobile").mask("+7(999) 999-99-99");

});