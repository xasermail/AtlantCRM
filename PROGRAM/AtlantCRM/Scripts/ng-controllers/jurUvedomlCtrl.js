"use strict";


var scopeUvedomlCtrl;

// контроллер
myApp.controller("jurUvedomlCtrl", function jurUvedomlCtrl($scope, $http, $timeout) {

  scopeUvedomlCtrl = $scope;

  var i = 0;

  //данные для календаря
  $scope.allUvedoml = [];
  //признак для отображения таблицы с аднными
  $scope.showData = false;
  //заголовки для таблицы с данными
  $scope.headers = [];
  //данные для отображения
  $scope.dataForTable = [];

  // здесь будут или Не выполненные или Выполненные
  $scope.uvedomlList = [];


  // признак того что отображено окно для добавления
  $scope.newUvedomlShown = 0;

  $scope.errorSaveItem = "";
	
  $scope.btnSaveItemDisabled = false;
  
  $scope.dateForSave;
  $scope.newItem_Comment = "";
  $scope.newItem_Phone = "";
  $scope.newItem_FIO = "";
  // dbo.O_UVEDOML.ID, -1 будет для новых уведомлений, ещё не сохранённых
  $scope.uvedoml_ID = -1;
  $scope.newItem_GR = 0;
  // список комментариев для группового уведомления
  $scope.newItem_GR_COMMENT_LIST = [];

  $scope.countPerformUvedoml = 0;
  $scope.countNotPerformUvedoml = 0;
  $scope.countZaplanUvedoml = 0;

  // текущая дата для вкладки Календарь
  $scope.kalenDate = new Date();
  
  // по умолчанию открыт Календарь
  //      "tabNotPerform"
  //      "tabZaplan"
  //      "tabPerform"
  //      "tabKalen"
  $scope.showTab = "tabKalen";

  $scope.isLoadData = false;

  // текущая страница
  $scope.page = 1;
  $scope.pageNums = [];

  // маска телефона
  $("#uvedomlPhone").mask("+7(999) 999-99-99");

  //текущее смещегие месяцев (0 текущий месяц)
  $scope.offsetMonth = 0;

  // уведомления Не выполненные dbo.O_UVEDOML.ISP
  var ISP_NE_VIP = 0;
  // уведомления Выполненные dbo.O_UVEDOML.ISP
  var ISP_VIP = 1;




  // открыть режим 
  $scope.$on("openUvedolm", function openUvedolmHandler(event) {

    // если итак открыт режим Уведомления, то просто обновляю его
    if ($scope.global.selectedMenuItem === "menuItemJur" && $scope.global.selectedJurSubMenuItem === 1) {

      $scope.refresh();

    } else {

      if ($scope.global.selectedMenuItem != "menuItemJur") {
        $scope.global.selectedMenuItem = "menuItemJur";
        if ($scope.global.selectedJurSubMenuItem != 1) {
          $scope.global.selectedJurSubMenuItem = 1;
        }
      }

    }

  });


  // событие при открытии вкладки Журнал
  $scope.$on("global.selectedMenuItemChanged", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemJur") {

      // создаем уведомления на непришедших из записи и контактов
      $scope.global.showWaitingForm("Создание уведомлений по непришедшим...");

      $http({
        "method": "POST",
        "url": "/Home/CreateUvedomlNepr"
      }).then(function (data) {

        // если открыта вкладка с уведомлениями, то их надо перезапросить
        if ($scope.global.selectedJurSubMenuItem === 1) {
          $scope.refresh();
        }

        closeAllWindow();
        $scope.global.hideWaitingForm();

      });
    }

  });


  // событие при открытии подвкладки Уведомления вкладки Журнал 
  $scope.$on("global.selectedJurSubMenuItemChanged", function selectedJurSubMenuItemChanged(event, newValue) {
		
    if (newValue === 1) {
      $scope.refresh();
    }

    closeAllWindow();

  });


  // обновление данных режима
  $scope.refresh = function refresh() {

    $scope.page = 1;

    // переполучаю количество уведомлений для всех вкладок
    $scope.refreshUvedomlCnt();


    // обновить надо только текущую открытую вкладку
    if ($scope.showTab === "tabNotPerform") {
      $scope.refreshUvedomlNotPerform(1);
    } else if ($scope.showTab === "tabZaplan") {
      $scope.refreshUvedomlZaplan(1);
    } else if ($scope.showTab === "tabPerform") {
      $scope.refreshUvedomlPerform(1);
    } else if ($scope.showTab === "tabKalen") {
      $scope.refreshUvedomlKalen(1);
    } else {
      throw "Неизвестная вкладка '" + $scope.showTab + "'";
    }

  };


  // активация внутренней вкладки
  $scope.tabActivate = function tabActivate(tabName) {
    $scope.showTab = tabName;
  };


  // щелчок по вкладке Не выполненные
  $scope.tabNotPerformClick = () => {

    $scope.showTab = "tabNotPerform";
    $scope.refreshUvedomlNotPerform(1);

  };


  // щелчок по вкладке Запланированные
  $scope.tabZaplanClick = () => {
    $scope.showTab = "tabZaplan";
    $scope.refreshUvedomlZaplan(1);
  };


  // щелчок по вкладке Выполненные
  $scope.tabPerformClick = () => {
    $scope.showTab = "tabPerform";
    $scope.refreshUvedomlPerform(1);
  };



  // перезапросить уведомления
	$scope.getUvedomsByDate = function getUvedomsByDate(date) {

	  $scope.kalenDate = date;

	  $scope.global.showWaitingForm("Получение данных..");

	  $http({
	    method: "GET",
	    url: "/Home/GetUvedomsByDate",
	    params: {
	      date: date,
	      page: $scope.page,
	      offset: $scope.offsetMonth
	    }
	  }).then((data) => {

	    $scope.isLoadData = true;
	    $scope.allUvedoml = data.data.Dates;
	    $scope.showData = data.data.LoadData;
	    $scope.headers = data.data.HeadersDate;
	    $scope.dataForTable = data.data.Data;

	    $scope.global.hideWaitingForm();

	  });

	  $scope.global.function.updateCountCurrentUvedoml();

	};

	$scope.tdAddClickHandler = function tdAddClickHandler(date) {
	  // права на запись
	  if ($scope.global.function.noHavePravoWrite(10, 50)) return false;

		var curDate = new Date();
		curDate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate());
		if (date < curDate) {
			$scope.global.showErrorAlert("Нельзя создавать уведомления на прошедшие дни.");
			return;
		}
		$scope.dateForSave = date;
		$scope.newUvedomlShown = 1;

		if ($scope.global.manual.M_VID_SOB != null) {
		  $scope.newItem_VidSob = $scope.global.manual.M_VID_SOB[0]["ID"];
		}

	  // фокус в поле Фамилия
		window.setTimeout(function () { $("#fio").focus(); });
	};

	$scope.btnCloseNew = function btnCloseNew() {
	  closeAllWindow();
	};


  // сохранить уведомление
	$scope.btnSaveItem = function btnSaveItem() {

	  $scope.btnSaveItemDisabled = true;

	  $scope.errorSaveItem = "";

	  // если не введен телефон добавляем текст ошибки
	  if ($scope.newItem_Phone === "") {
	    $scope.errorSaveItem = "Не заполнен телефон. ";
	    $scope.btnSaveItemDisabled = false;
	  }

	  if ($scope.newItem_VidSob === undefined) {
	    $scope.errorSaveItem = $scope.errorSaveItem + "Не выбран тип события. ";
	    $scope.btnSaveItemDisabled = false;
	  }

	  // если не введено ФИО
	  if ($scope.newItem_FIO === "") {
	    $scope.errorSaveItem = $scope.errorSaveItem + "Не заполнено ФИО.";
	    $scope.btnSaveItemDisabled = false;
	  }

	  // если текст ошибки не пуст, выводим его и останавливаем сохранение
	  if ($scope.errorSaveItem != "") {
	    $scope.btnSaveItemDisabled = false;
	    return;
	  }

	  $scope.global.showWaitingForm("Сохранение данных..");

	  // новое уведомление
	  if ($scope.uvedoml_ID == -1) {

	    $http({
	      "method": "POST",
	      "url": "/Home/CreateUvedoml",
	      params: {
	        fio: $scope.newItem_FIO,
	        phone: $scope.newItem_Phone,
	        commentForSave: $scope.newItem_Comment,
	        M_VID_SOB_ID: $scope.newItem_VidSob,
	        date: $scope.dateForSave
	      }
	    }).success(function (data) {

	      if (data["success"] === "true") {
	        closeAllWindow();
	        $scope.getUvedomsByDate($scope.kalenDate);
	      }

	    }).finally(() => {
	      $scope.btnSaveItemDisabled = false;
	      $scope.global.hideWaitingForm();
	    });

	    // редактирование уведомления
	  } else {

	    // если вдруг это групповое уведомление и пользователь написал
	    // комментарий, но забыл его "добавить" (для этого отдельная кнопка),
	    // то добавляю его автоматически
	    if ($scope.newItem_GR > 0 && ($scope.newItem_GR_COMMENT || "").length > 0) {
	      $scope.btnGrCommentAdd();
	    }

	    $http({
	      "method": "POST",
	      "url": "/Home/ChangeUvedoml",
	      data: {
	        fio: $scope.newItem_FIO,
	        phone: $scope.newItem_Phone,
	        commentForSave: $scope.newItem_Comment,
	        M_VID_SOB_ID: $scope.newItem_VidSob,
	        date: $scope.dateForSave,
	        uvedoml_ID: $scope.uvedoml_ID,
	        GR_COMMENT_LIST: $scope.newItem_GR_COMMENT_LIST
	      }
	    }).success(function (data) {

	      if (data["success"] === "true") {
	        closeAllWindow();
	        $scope.getUvedomsByDate($scope.kalenDate);
	      }

	    }).finally(() => {

	      $scope.btnSaveItemDisabled = false;
	      $scope.global.hideWaitingForm();

	    });
	  };
	};



	function closeAllWindow() {
	  $scope.uvedoml_ID = -1;
	  $scope.newUvedomlShown = 0;
	  $scope.btnSaveItemDisabled = false;
	  $scope.errorSaveItem = "";
	  $scope.newItem_Phone = "";
	  $scope.newItem_FIO = "";
	  $scope.newItem_VidSob = undefined;
	  $scope.newItem_Comment = "";
	  $scope.newItem_GR = 0;
	};

	$scope.btnPerformClickHandler = function btnPerformClickHandler(item) {
    
	  if (item.IsPerform) {
	    return;
	  };
	  $scope.global.function.showYesNoDialog("Выполнить?", () => {

	    $http({
	      method: "POST",
	      url: "/Home/PerformUvedoml",
	      data: { uvedoml: item }
	    }).then((data) => {
	    	$scope.getUvedomsByDate($scope.kalenDate);
	    });
	  });
	}

  // изменение уведомления
  // вызывается из запланированных и не выполненных
  // передаем право для проверки
	$scope.changeUvedoml = function changeUvedoml(item, pravo) {
	  // права на запись
	  if ($scope.global.function.noHavePravoWrite(10, pravo)) return false;
    
	  if (item.IsPerform == 1) {
	    return;
	  };

	  $scope.dateForSave = item.Date;
	  $scope.newItem_FIO = item.FIO;
	  $scope.newItem_Phone = item.Phone;
	  $scope.newItem_VidSob = item.M_VID_SOB_ID;
	  $scope.uvedoml_ID = item.Uvedoml_ID;
	  $scope.newItem_Comment = item.Comment;
	  $scope.newItem_GR = item.GR;
	  $scope.newItem_GR_COMMENT_LIST = item.GR_COMMENT_LIST;


	  $scope.newUvedomlShown = 1;


	};

	$scope.openCall = function openCall(cell) {
	  if (cell.ANK_ID == null)
	  {
	    $scope.global.showErrorAlert("По номеру не получилось найти анкету, звонок невозможен");
	    $scope.global.hideWaitingForm();
	    return;
	  }

	  $http({
	    method: "POST",
	    url: "/Home/PerformUvedoml",
	    data: { uvedoml: cell }
	  });

	 

	  $scope.global.openAnk(cell.ANK_ID);
	  $scope.global.openAnkDone = () => {
	    $timeout(() => {
	      $scope.global.selectedMenuItem = "menuItemNew";
	      $scope.global.selectedSubMenuItem = 6;
	    }, 10);
	  };
	};

  //обработка нажатия кнопки "Предыдущий" для месяцев
	$scope.getPrevMonth = function getPrevMonth() {
	  $scope.offsetMonth = $scope.offsetMonth - 1;
	  $scope.kalenDate = new Date($scope.kalenDate.setMonth($scope.kalenDate.getMonth() - 1));
	  $scope.getUvedomsByDate($scope.kalenDate);
	};

  //обработка нажатия кнопки "Следующий" для месяцев
	$scope.getNextMonth = function getNextMonth() {
	  $scope.offsetMonth = $scope.offsetMonth + 1;
	  $scope.kalenDate = new Date($scope.kalenDate.setMonth($scope.kalenDate.getMonth() + 1));
	  $scope.getUvedomsByDate($scope.kalenDate);
	};


	
  // при выборе другой страницы
	$scope.pageNumClickHandler = function pageNumClickHandler(pageNum) {

	  $scope.page = pageNum;

    // если мы на вкладке Не выполненные или Выполненные
	  if ($scope.showTab === "tabNotPerform" || $scope.showTab === "tabPerform") {
	    $scope.refreshUvedomlNotPerform($scope.page);
	  } else {
	    $scope.getUvedomsByDate($scope.kalenDate);
	  }
	  
	};

  //нажатие на выбор предыдущей страницы
	$scope.prevPageClickHandler = function prevPageClickHandler() {
	  //если страниц всего одна или нет вообще делаем выбранной первую
	  if ($scope.pageNums.length <= 1) {
	    $scope.page = 1;
	    //обновляем содержимое
	    // $scope.getDataNotCame();
	    $scope.getUvedomsByDate($scope.kalenDate);
	    return;
	  }

	  //если не на находимся не на первой странице уменьшаем номер текущей страницы на 1
	  if ($scope.page > 1) {
	    $scope.page = $scope.page - 1;
	  }
	  //обновляем содержимое
	  //$scope.getDataNotCame();
	  $scope.getUvedomsByDate($scope.kalenDate);
	}

  //нажатие на выбор следующие страницы
	$scope.nextPageClickHandler = function nextPageClickHandler() {
	  //если страниц всего одна или нет вообще делаем выбранной первую
	  if ($scope.pageNums.length <= 1) {
	    $scope.page = 1;
	    //обновляем содержимое
	    //$scope.getDataNotCame();
	    $scope.getUvedomsByDate($scope.kalenDate);
	    return;
	  }

	  //получаем последний элемнет
	  var lastElem = $scope.pageNums[$scope.pageNums.length - 1];
	  if ($scope.page != lastElem) {
	    $scope.page = $scope.page + 1;
	    //обновляем содержимое
	    //$scope.getDataNotCame();
	    $scope.getUvedomsByDate($scope.kalenDate);
	  }

	}

  // следующие 10 страниц
	$scope.pageNext10 = function pageNext10() {

	  if ($scope.pageNums.length === 0) {
	    return;
	  }

	  if ($scope.pageNums[0] >= $scope.pagesCountAfterLoad) {
	    return;
	  }

	  var currFirstPage = $scope.pageNums[0] + 10;

	  var newLastPage = currFirstPage + 10;

	  if (currFirstPage > $scope.pagesCountAfterLoad) {
	    currFirstPage = $scope.pagesCountAfterLoad;
	  }

	  $scope.pageNums = [];
	  for (var i = currFirstPage; i < newLastPage; i += 1) {
	    if (i > $scope.pagesCountAfterLoad) {
	      break;
	    }
	    $scope.pageNums.push(i);
	  }

	};


  // предыдущие 10 страниц
	$scope.pagePrev10 = function pagePrev10() {

	  if ($scope.pageNums.length === 0) {
	    return;
	  }

	  var currFirstPage = $scope.pageNums[0];

	  if (currFirstPage === 1) {

	    return;
	  }

	  currFirstPage = $scope.pageNums[0] - 10;

	  if (currFirstPage < 1) {
	    currFirstPage = 1;
	  }


	  var currentLastPage = currFirstPage + 10;
	  if (currentLastPage > $scope.pagesCountAfterLoad) {
	    currentLastPage = $scope.pagesCountAfterLoad;
	  }

	  $scope.pageNums = [];
	  for (var i = currFirstPage; i < currentLastPage; i += 1) {
	    if (i > $scope.pagesCountAfterLoad) {
	      break;
	    }
	    $scope.pageNums.push(i);
	  }

	};

  //#341 05. При создании уведомления в режиме «Журнал – Уведомления» искать номер телефона
	$scope.setPhoneNumber = function () {

	  if (($scope.uvedoml_ID == -1) && ($scope.newItem_FIO !== "") && ($scope.newItem_Phone === "")) {
	    $http({
	      method: "GET",
	      url: "/Home/GetO_ANK_PHONE",
	      params: {
	        term: $scope.newItem_FIO
	      }
	    }).then((data) => {
	      if (data.data !== "") {
	        $scope.newItem_Phone = data.data;
	      }
	    });
	  }

	};


  // добавить и сохранить групповой комментарий
	$scope.btnGrCommentAdd = () => {

	  $scope.newItem_GR_COMMENT_LIST.unshift({
	    O_UVEDOML_GR: $scope.newItem_GR,
	    O_UVEDOML_ID: $scope.uvedoml_ID,
	    COMMENT: $scope.newItem_GR_COMMENT,
	    D_START: new Date(),
	    USERID_NAME: $scope.global.userContext.UserName
	  });

	  $scope.newItem_GR_COMMENT = "";

	};


  // перейти к покупке
	$scope.btnKPokupke = (item) => {
	  $scope.global.openUchetSkladRasProduct(item.O_SKLAD_RAS_ID);

	};



  // перезапросить Не выполненные или Выполненные
  //    page - страница, которую надо перезапросить
  //    isp - 0 - Не выполненные, 1 - Выполненные
	$scope.refreshUvedomlIspOrNotIsp = (page, isp) => {

	  $scope.global.showWaitingForm("Получение данных..");

	  $http({
	    method: "GET",
	    url: "/Home/GetUvedomlIspOrNotIsp",
	    params: {
	      page: page,
	      isp: isp,
	      return_only_cnt: 0
	    }
	  }).then((data) => {

	    $scope.uvedomlList = data.data.uvedomlList;
	    $scope.totalPageCount = data.data.TotalPageCount;

	    if (isp === ISP_NE_VIP) {
	      $scope.countNotPerformUvedoml = data.data.CountAll;
	    } else if (isp === ISP_VIP) {
	      $scope.countPerformUvedoml = data.data.CountAll;
	    }

	    $scope.refreshPaginator(data.data.TotalPageCount);

	    $scope.global.hideWaitingForm();

	  });

	};



  // перезапросить количество Не выполненных или Выполненных
  //    isp - 0 - Не выполненные, 1 - Выполненные
	$scope.refreshUvedomlIspOrNotIspCnt = (isp) => {

	  $scope.global.showWaitingForm("Получение данных..");

	  $http({
	    method: "GET",
	    url: "/Home/GetUvedomlIspOrNotIsp",
	    params: {
	      page: 1,
	      isp: isp,
	      return_only_cnt: 1
	    }
	  }).then((data) => {

	    if (isp === ISP_NE_VIP) {
	      $scope.countNotPerformUvedoml = data.data.CountAll;
	    } else if (isp === ISP_VIP) {
	      $scope.countPerformUvedoml = data.data.CountAll;
	    }

	    $scope.global.hideWaitingForm();

	  });

	};


  // перестроить навигатор по страницам
  //     pagesCountAfterLoad сколько всего позиций надо отобразить
	$scope.refreshPaginator = function refreshPaginator(pagesCountAfterLoad) {

	  $scope.pageNums = [];
	  var i;
	  var ROWS_PER_PAGE = 10;

	  if ($scope.totalPageCount <= ROWS_PER_PAGE) {

	    for (i = 1; i <= pagesCountAfterLoad; i += 1) {
	      $scope.pageNums.push(i);
	    }

	  } else {

	    var newFirstPageInList = $scope.page;
	    var lastPageInList = newFirstPageInList + ROWS_PER_PAGE;

	    if (lastPageInList > pagesCountAfterLoad) {

	      lastPageInList = pagesCountAfterLoad;
	      newFirstPageInList = pagesCountAfterLoad - ROWS_PER_PAGE;

	      if (newFirstPageInList < 1) {
	        newFirstPageInList = 1;
	      }

	    }

	    for (i = newFirstPageInList; i <= lastPageInList; i += 1) {
	      $scope.pageNums.push(i);
	    }

	  }
	};


  // перезапросить Не выполненные
	$scope.refreshUvedomlNotPerform = (page) => {
	  $scope.global.showWaitingForm("Получение данных..");
	  $scope.page = page;
	  $scope.refreshUvedomlIspOrNotIsp(page, ISP_NE_VIP);
	  $scope.global.hideWaitingForm();
	};


  // перезапросить количество Не выполненных
	$scope.refreshUvedomlNotPerformCnt = () => {
	  $scope.global.showWaitingForm("Получение данных..");
	  $scope.refreshUvedomlIspOrNotIspCnt(ISP_NE_VIP);
	  $scope.global.hideWaitingForm();
	};


  // перезапросить Выполненные
	$scope.refreshUvedomlPerform = (page) => {
	  $scope.global.showWaitingForm("Получение данных..");
	  $scope.page = page;
	  $scope.refreshUvedomlIspOrNotIsp(page, ISP_VIP);
	  $scope.global.hideWaitingForm();
	};


  // перезапросить количество Выполненных
	$scope.refreshUvedomlPerformCnt = () => {
	  $scope.global.showWaitingForm("Получение данных..");
	  $scope.refreshUvedomlIspOrNotIspCnt(ISP_VIP);
	  $scope.global.hideWaitingForm();
	};


  // перезапросить Запланированные
	$scope.refreshUvedomlZaplan = (page) => {

	  $scope.global.showWaitingForm("Получение данных..");

	  $scope.page = page;

	  $http({
	    method: "GET",
	    url: "/Home/GetUvedomlZaplan",
	    params: {
	      page: page,
        return_only_cnt: 0
	    }
	  }).then((data) => {

	    $scope.uvedomlList = data.data.uvedomlList;
	    $scope.totalPageCount = data.data.TotalPageCount;
	    $scope.countZaplanUvedoml = data.data.CountAll;

	    $scope.refreshPaginator(data.data.TotalPageCount);

	    $scope.global.hideWaitingForm();

	  });
	};



  // перезапросить количество Запланированных
	$scope.refreshUvedomlZaplanCnt = () => {

	  $scope.global.showWaitingForm("Получение данных..");

	  $http({
	    method: "GET",
	    url: "/Home/GetUvedomlZaplan",
	    params: {
	      page: 1,
	      return_only_cnt: 1
	    }
	  }).then((data) => {

	    $scope.countZaplanUvedoml = data.data.CountAll;
	    $scope.global.hideWaitingForm();

	  });
	};


  // перезапросить только количество уведомлений для всех вкладок
	$scope.refreshUvedomlCnt = function refreshUvedomlCnt() {

	  $scope.refreshUvedomlNotPerformCnt();
	  $scope.refreshUvedomlZaplanCnt();
	  $scope.refreshUvedomlPerformCnt();

	};


  // перезапросить Календарь
	$scope.refreshUvedomlKalen = (page) => {

	  $scope.global.showWaitingForm("Получение данных..");

	  $scope.page = page;

	  $scope.getUvedomsByDate($scope.kalenDate);

	  $scope.global.hideWaitingForm();

	};


});