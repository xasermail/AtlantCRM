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

        /*$scope.person = {
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

});