"use strict";

// контроллер
myApp.controller("uchetZarplCtrl", function uchetZarplCtrl($scope, $http) {

  // событие при открытии вкладки
  $scope.$on("global.selectedUchetSubMenuItemChanged", function selectedSubMenuItemChanged(event, newValue) {

    if (newValue === 5) {


      $scope.getZarplPages();
      
     


      /*
        $scope.sotrudnik = [
               {
                 fio: "Иванова Вера Сергеевна",
                 DNI: 20},
               {
                 fio: "Филиппова Галина Дмитриевна",
                 DNI: 21},
               {
                 fio: "Рузаева Иванка Александровна",
                 DNI: 22}
               ] */

    
    }
  });




  // Получение информации о количестве страниц
  $scope.getZarplPages = function getZarplPages() {
    $http({
      method: "GET",
      url: "/Home/GetZarplPages",
      params: {
        page: $scope.page

      }
    }).then(function getZarplPagesSuccess(data) {

      $scope.pageNums = data.data;
      //console.log($scope.pageNums);

      if ($scope.pageNums.length > 0) {
        $scope.page = 1;
      } else {
        $scope.page = 0;
      }

      $scope.refresh();

    }).catch(function getZarplPagesError(err) {

      $scope.global.showErrorAlert(err.data);

    }).finally(function getZarplPagesFinally() {

      $scope.global.hideWaitingForm();
    });
  }



  // Получение данных из БД
  $scope.refresh = function refresh() {
    $http({
      method: "GET",
      url: "/Home/GetZarpl",
      params: {
        page: $scope.page
      }
    }).then(function GetZarplSuccess(r) {

      // $scope.sotrudnik = data.data;
      $scope.zarpl = r.data.zarpl;
      $scope.sotrudnik = r.data.zarplFio;
      
      for (var i = 0; i < $scope.sotrudnik.length; i++) {
        $scope.schChanged($scope.sotrudnik[i]);
      }

      console.log(r);
    }).catch(function GetPriglashenError(err) {

      $scope.global.showErrorAlert(err.data);

    }).finally(function GetZarplFinally() {

      $scope.global.hideWaitingForm();
    });
  }


    // Получение данных о зарплате из БД
  $scope.zpGet = function () {

    $scope.page = 0;

    $scope.refresh();

  };

 


  // Навигация по страницам
  // при выборе другой страницы
  $scope.pageNumClickHandler = function pageNumClickHandler(pageNum) {
    $scope.page = pageNum;
    $scope.refresh();
  };


  // нажатие на выбор предыдущей страницы
  $scope.prevPageClickHandler = function prevPageClickHandler() {

    // если страниц всего одна или нет вообще делаем выбранной первую
    if ($scope.pageNums.length <= 1) {
      $scope.page = 1;

      // обновляем содержимое
      $scope.refresh();
      return;
    }




    // если не находимся  на первой странице,  уменьшаем номер текущей страницы на 1
    if ($scope.page > 1) {
      $scope.page = $scope.page - 1;
    }
    // обновляем содержимое
    $scope.refresh();
  }

  // нажатие на выбор следующие страницы
  $scope.nextPageClickHandler = function nextPageClickHandler() {
    // если страниц всего одна или нет вообще делаем выбранной первую
    if ($scope.pageNums.length <= 1) {
      $scope.page = 1;
      // обновляем содержимое
      $scope.refresh();
      return;
    }

    // получаем последний элемнет
    var lastElem = $scope.pageNums[$scope.pageNums.length - 1];
    if ($scope.page != lastElem) {
      $scope.page = $scope.page + 1;
      // обновляем содержимое
      $scope.refresh();
    }

  }

  


  // функция при изменении значения в таблице
  $scope.schChanged = function schChanged(x) {
    var day = x.DNI;
    var summa = x.SUMMA;
    var chas = x.CHAS;
    var valov_dohod = x.VALOV_DOHOD;
    var prots = x.PROTS;
    var bonus = x.BONUS;
    var shtraf = x.SHTRAF;
    var oklad = x.OKLAD;


    // вычисление С/Ч
    var sch = summa / 9;
    // округление с/ч до 2-х знаков
    sch = +sch.toFixed(2);
    x.S_CH = sch;


    // вычисление оклада
    var oklad = summa * day + sch * chas;
    // округление оклада до 2-х знаков
    oklad = +oklad.toFixed(2);
    x.OKLAD = oklad;


    // Вычисление зарплаты
    var zarpl = summa + chas * sch + valov_dohod * prots / 100 + bonus - shtraf;
    x.ZARPL = zarpl;
    // округление зарплаты до 2-х знаков
    zarpl = +zarpl.toFixed(2);


    // вычисление Oбщей зарплаты
    $scope.zp = $scope.sotrudnik.reduce(function RaschetZarp(all, a) {
      return all + a.ZARPL;
    }, 0);
    $scope.zp = +$scope.zp.toFixed(2);
  };






  // Сохранение изменений 
  $scope.zpSave = function () {
  
    $scope.global.showWaitingForm("Сохранение данных...");
    $http({
      "method": "POST",
      "url": "/Home/SaveZarpl",
      data: {
        o_zarpl: $scope.zarpl,
        o_zarpl_fio: $scope.sotrudnik
      }
    }).then(function saveZarplSuccess(data) {
      $scope.getZarplPages();
      console.log($scope.sotrudnik);
      $scope.global.hideWaitingForm();

    }, function saveZarplFailed(err) {
      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();
    });
  };

 

  // Печать
  $scope.printZp = function printZp() {
    var w = window.open("/Home/PrintZarpl");  
    var b = {};
    b.DT_FROM = $scope.zarpl.D_PERIOD_S;
    b.DT_TO = $scope.zarpl.D_PERIOD_PO;
    b.sotrudnik = $scope.sotrudnik;
    b.zp = $scope.zp;
    w.printData = b;


  }

  $scope.printZp1 = function printZp1(x) {
    var w = window.open("/Home/PrintZarpl");
    var b = {};
    b.DT_FROM = $scope.zarpl.D_PERIOD_S;
    b.DT_TO = $scope.zarpl.D_PERIOD_PO;

    b.sotrudnik = [x];
    b.zp = $scope.zp;
    w.printData = b;

  }

   // получение валового дохода при смене периода
  $scope.getZarplValovDohod = function getZarplValovDohod() {

    $scope.global.showWaitingForm("Обновление данных...");

    $http({
      method: "GET",
      url: "/Home/GetZarplValovDohod",
      params: {
        d_period_s: $scope.zarpl.D_PERIOD_S,
        d_period_po: $scope.zarpl.D_PERIOD_PO
      }
    }).then(function getZarplValovDohodSuccess(doh) {

      for (var i = 0; i < $scope.sotrudnik.length; i++) {

        var d = doh.data.find(function func(a) {
          return a.S_USER_ID === $scope.sotrudnik[i].S_USER_ID;
        });
        
        $scope.sotrudnik[i].VALOV_DOHOD = d.VALOV_DOHOD;
      }

      console.log(doh);
    }).catch(function getZarplValovDohodError(err) {

      $scope.global.showErrorAlert(err.data);

    }).finally(function getZarplValovDohodFinally() {

      $scope.global.hideWaitingForm();
    });
  }



});
