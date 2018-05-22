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

  // TODO: временно заполняю руками
  /*$scope.org_tree = {
    ID: 1, NAME: "Администрация", M_ORG_TYPE_ID: 1, M_ORG_TYPE_ID_NAME: "Администрация",
    childs: [
      { ID: 2, NAME: "Петров", M_ORG_TYPE_ID: 2, M_ORG_TYPE_ID_NAME: "Дилер A", childs: [] },
      {
        ID: 3, NAME: "Сидоров", M_ORG_TYPE_ID: 2, M_ORG_TYPE_ID_NAME: "Дилер A", childs: [
          {
            ID: 4, NAME: "Филипов", M_ORG_TYPE_ID: 3, M_ORG_TYPE_ID_NAME: "Дилер C", childs: [
              { ID: 5, NAME: "Семенов", M_ORG_TYPE_ID: 4, M_ORG_TYPE_ID_NAME: "Дилер D", childs: [] },
              { ID: 6, NAME: "Павлов", M_ORG_TYPE_ID: 4, M_ORG_TYPE_ID_NAME: "Дилер D", childs: [] },
              { ID: 7, NAME: "Алексеев", M_ORG_TYPE_ID: 4, M_ORG_TYPE_ID_NAME: "Дилер D", childs: [] },
            ]
          },
          { ID: 8, NAME: "Сергеев", M_ORG_TYPE_ID: 4, M_ORG_TYPE_ID_NAME: "Дилер D", childs: [] },
          {
            ID: 9, NAME: "Николаев", M_ORG_TYPE_ID: 3, M_ORG_TYPE_ID_NAME: "Дилер C", childs: [
              { ID: 10, NAME: "Андреев", M_ORG_TYPE_ID: 4, M_ORG_TYPE_ID_NAME: "Дилер D", childs: [] },
              { ID: 11, NAME: "Александров", M_ORG_TYPE_ID: 4, M_ORG_TYPE_ID_NAME: "Дилер D", childs: [] },
              { ID: 12, NAME: "Никитин", M_ORG_TYPE_ID: 4, M_ORG_TYPE_ID_NAME: "Дилер D", childs: [] },
              { ID: 13, NAME: "Константинов", M_ORG_TYPE_ID: 4, M_ORG_TYPE_ID_NAME: "Дилер D", childs: [] },
            ]
          },
        ]
      },
    ]
  };
  */


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

    }).catch(function getM_ORGFail(err) {

      $scope.global.showErrorAlert("getM_ORGFail: " + err.data.toString());

    }).finally(function getM_ORGFanally(err) {

      $scope.global.hideWaitingForm();
    });

  };


  // нажата кнопка "Отмена" внутри окна добалвения/редактирования организации
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

  // при щелчке на праве просмотра
  $scope.btnReadPravoClickHandler = function btnReadPravoClickHandler(item1) {
    item1.READ1 = 1 - (item1.READ1 || 0);
  };

  // при щелчке на праве редактирования
  $scope.btnWritePravoClickHandler = function btnWritePravoClickHandler(item1) {
    item1.WRITE1 = 1 - (item1.WRITE1 || 0);
    if (item1.WRITE1 === 1) {
      item1.READ1 = 1;
    }
  };


  // щелчок по кнопке добавления нового пользователя
  $scope.btnUserAddClickHandler = function btnUserAddClickHandler() {

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



    // права на группы
    $http({
      method: "GET",
      url: "/Home/GetO_PRAVO_GR",
      params: { S_USER_ID: $scope.user.ID }

    }).then(function getO_PRAVO_GR(data) {

      // модель для выбранных прав для групп
      $scope.O_PRAVO_GR = [];
      $scope.global.manual.M_PRAVO_GR.forEach(item => {
        var o;
        o = data.data.find(x => {
          return x.M_PRAVO_GR_ID === item.ID;
        });
        if (o == null) {
          $scope.O_PRAVO_GR.push({ ID: 0, M_PRAVO_GR_ID: item.ID, NAME: item.NAME, CHECKED: 0, S_USER_ID: 0 });
        } else {
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
        var o;
        o = data.data.find(x => {
          return x.M_PRAVO_REJ_ID === item.ID;
        });
        if (o == null) {
          $scope.O_PRAVO_REJ.push({
            ID: 0, M_PRAVO_REJ_ID: item.ID, NAME: item.NAME,
            READ1: 0, WRITE1: 0, S_USER_ID: 0, M_PRAVO_GR_ID: item.M_PRAVO_GR_ID
          });
        } else {
          $scope.O_PRAVO_REJ.push({
            ID: o.ID, M_PRAVO_REJ_ID: item.ID, NAME: item.NAME,
            READ1: o.READ1, WRITE1: o.WRITE1, S_USER_ID: o.S_USER_ID, M_PRAVO_GR_ID: item.M_PRAVO_GR_ID
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

    $scope.global.currentUserChangeMOrgId(item.ID);

  };


});