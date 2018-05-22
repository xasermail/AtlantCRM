"use strict";

// контроллер
myApp.controller("dilerACKartaCtrl", function dilerACKartaCtrl($scope, $http, $timeout, $interval) {

  // ссылка на карту
  var mapDiler;

  //в качестве последней даты ставим текущий день
  $scope.toDate = new Date();
  //в качестве первой начало текущего месяца
  $scope.fromDate = new Date($scope.toDate.getFullYear(), $scope.toDate.getMonth(), 1);

  // событие при открытии вкладки
  $scope.$on("global.selectedDilerSubMenuItemChanged", function selectedDilerSubMenuItemChanged(event, newValue) {

    
    if (newValue == 4) {

      $scope.global.showWaitingForm("Получение карты..");

      $timeout(() => {
        $scope.global.hideWaitingForm();
        $scope.refresh();
      }, 4000);

    }

  });


  $scope.refresh = function refresh() {

    $scope.global.showWaitingForm("Получение карты..");

    // массив расстояний от клиента до офиса
    $scope.distance = [];

    // массив статусной информации о карте (текст справа)
    $scope.status = null;

    // запрашиваю данные для отображения на карте
    $http({
      "method": "GET",
      "url": "/Home/GetReportKarta",
      params: {
        fromDate: $scope.fromDate,
        toDate: $scope.toDate,
        M_ORG_ID: $scope.global.userContext.M_ORG_ID
      }
    }).then(function getReportKartaSuccess(data) {

      var klienti = data.data.klienti;
      var office = data.data.office;
      $scope.status = data.data.status;

      var centerPoint;
      if (klienti.length > 0) {
        centerPoint  = klienti[Math.floor(klienti.length / 2)];
      } else {
        centerPoint = office;
      }

      // если уже не в первый раз на карту заходят,
      // то удаляю предыдущую, так проще
      document.querySelector("#mapDiler").innerHTML = "";
      mapDiler = new ymaps.Map('mapDiler', {
        // the center and zoom level explicitly
        // define the mapping region
        center: [centerPoint.lg, centerPoint.lt],
        zoom: 7
      });

      klienti.forEach((x) => {
        var placemark = new ymaps.Placemark([x.lg, x.lt], { iconContent: x.kolvo });
        mapDiler.geoObjects.add(placemark);
      });

      // если удалось определить координаты офиса - вычисляю
      // расстояние от каждого клиента до офиса
      if (office.error === false) {

        var placemark = new ymaps.Placemark(
            [office.lg, office.lt],
            { iconContent: "Офис" },
            { preset: "islands#redStretchyIcon" });
        mapDiler.geoObjects.add(placemark);



        // здесь я считаю расстояния между офисом и адресом клиента,
        // а когда посчитаю всё, то считаю дальний и средний киллометр,
        // distancesCount служит для того, чтобы понят уже всё посчитано
        // или ещё что-то осталось, за этим следим по таймеру (ниже)
        // и когда всё посчитано запускаем расчёт
        var distancesCount = 0;
        klienti.forEach((x) => {
          ymaps.route([[x.lg, x.lt], [office.lg, office.lt]]).then (
            function (route) {
              $scope.distance.push(route.getLength());
              //mapDiler.geoObjects.add(route);
              distancesCount += 1;
            },
            function (error) {
              distancesCount += 1;
              console.log('Возникла ошибка: ' + error.message);
            }
          );
        });
        //
        var checkDistansesCount = $interval(() => {

          // всё посчитано
          if (distancesCount === klienti.length) {

            // отменяю таймер
            $interval.cancel(checkDistansesCount);

            // в этом месте получаются уже есть посчитанные расстояния
            // между офисом и всеми клиентами в массиве $scope.distance
            //console.log($scope.distance);

            //
            // считаю км. самый дальний
            var maxDist =
              $scope.distance.reduce((p, c) => {
                if (c > p) {
                  return c;
                } else {
                  return p;
                }
              }, 0);

            $scope.status.push({ name: "км. самый дальний", kolvo: (maxDist / 1000).toFixed(2) });

            //
            // считаю средний километр
            // ! если массив пуст - деление на 0!!!
            var srDist = 0;
            try {
              srDist = (
                $scope.distance.reduce((p, c) => { return p + c; }) / $scope.distance.length / 1000).toFixed(2);
            } catch(e) {
              srDist = (0).toFixed(2);
            }

            $scope.status.push({ name: "средний километр", kolvo: srDist });

            // все расчёты окончены
            $scope.global.hideWaitingForm();

          }
        });


      } else {

        $scope.global.hideWaitingForm();

      }


      

    }, function getReportKartaFailed(err) {

      $scope.global.showErrorAlert(err.data);
      $scope.global.hideWaitingForm();

    });

 
  };
 
});