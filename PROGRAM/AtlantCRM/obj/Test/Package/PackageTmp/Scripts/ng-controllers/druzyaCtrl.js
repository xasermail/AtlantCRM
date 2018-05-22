"use strict";
//{{global.ank.SURNAME}} {{global.ank.NAME}} {{global.ank.SECNAME}}
// контроллер
myApp.controller("druzyaCtrl", function druzyaCtrl($scope, $http) {

  // событие при открытии вкладки
  $scope.$on("global.selectedSubMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue == "5") {

      $scope.global.showWaitingForm("Получение информации о друзьях..");

      $scope.bonus = [{ name: "Eсть бонус", id: 1 }, { name: "Нет бонуса", id: 0 }];

      $http({
        method: "GET",
        url: "/Home/GetDruzya",
        params: { O_ANK_ID: $scope.global.ank.ID}
      }).then(function getDruzyaSuccess(data) {

        $scope.person = data.data;
           
      }).catch(function getDruzyaError(err) {

        $scope.global.showErrorAlert(err.data);

      }).finally(function getDruzyaFinally() {

        $scope.global.hideWaitingForm();

      });

      
         
      /*
      $scope.person = {
          priglasil: "Петрова Елена Петровна",
          bonus: 1,
          aktivist: 1,
          kolvo_prigl: 50,
          prigl: [
            {
                fio: "Иванова Вера Сергеевна",
                bonus: 0,
                d_prigl: "22.03.2016"
            },
            {
                fio: "Филиппова Галина Дмитриевна",
                bonus: 0,
                d_prigl: "22.04.2017"
            },
            {
                fio: "Рузаева Иванка Александровна",
                bonus: 1,
                d_prigl: "01.05.2017"
            }
          ]
      };*/
       
      

    }

  });



  //бонус
  $scope.chng = function () {
    $http({
      method: "POST",
      url: "/Home/AnkUpdateBonus",
      data: {
        o_ank_id: $scope.global.ank.ID,
        bonus: $scope.person.bonus
      }
    }).then(function AnkUpdateBonusSuccess(data) {
 
    }).catch(function AnkUpdateBonusError(err) {

      $scope.global.showErrorAlert(err.data);

    }).finally(function AnkUpdateBonusFinally() {

      $scope.global.hideWaitingForm();

    });
  };

  //добавление рекомендованного контакта
  $scope.add = function () {
    if ($scope.global.ank.ID === 0) {
      $scope.global.showErrorAlert("Сохраните анкету перед добавлением контакта");
      return false;
    }

    if ($scope.name != null) {
      $scope.name = $scope.name.trim();
    }
    if ($scope.secname != null) {
      $scope.secname = $scope.secname.trim();
    }
    if ($scope.surname != null) {
      $scope.surname = $scope.surname.trim();
    }

    console.log($scope.phone, $scope.name);
    if ($scope.name == null || $scope.phone == null || $scope.name.trim() == "" ) {
      $scope.global.showErrorAlert("Ошибка!");
      return;
    }
    
    $scope.global.showWaitingForm("Сохранение рекомендованного контакта...");

    $http({
      "method": "POST",
      "url": "/Home/AddO_REK_ANK",
      data: {
        surname: $scope.surname, name: $scope.name, secname: $scope.secname, phone: $scope.phone, o_ank_id: $scope.global.ank.ID
      }
    }).then(function addO_REK_ANKSuccess(data) {

      $scope.secname = null;
      $scope.name = null;
      $scope.surname = null;
      $scope.phone = null;

      $scope.global.hideWaitingForm();

    }, function addO_REK_ANKFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });


  };


  $scope.toDate = new Date();

  //дата (начало текущего месяца)  
  $scope.fromDate = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);
  //дата (конец текущего месяца)
  $scope.toDate1 = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth() + 1, 0);



  //поиск приглашенных по заданной дате и выгрузка списка

  $scope.find = function () {
    $scope.global.showWaitingForm("Поиск приглашенных людей...");
    $http({
      method: "GET",
      url: "/Home/GetPriglashen",
      params: {
        O_ANK_ID: $scope.global.ank.ID,
        fromDate: $scope.fromDate,
        toDate: $scope.toDate1
      }
    }).then(function GetPriglashenSuccess(data) {
      $scope.ar = data.data;
    
    }).catch(function GetPriglashenError(err) {

      $scope.global.showErrorAlert(err.data);

    }).finally(function GetPriglashenFinally() {

      $scope.global.hideWaitingForm();

    });
    /*

    $scope.ar = [{
      fio: "Иванова Вера Сергеевна",
      bonus: "Нет бонуса",
      d_prigl: "22.03.2016"
              },
              {
                fio: "Филиппова Галина Дмитриевна",
                bonus: "Нет бонуса",
                d_prigl: "22.04.2017"
              },
              {
                fio: "Рузаева Иванка Александровна",
                bonus: "Есть бонус",
                d_prigl: "01.05.2017"
              }]
 */
  };
 
  $("#druzya .phone-1").mask("+7(999) 999-99-99");

 

});