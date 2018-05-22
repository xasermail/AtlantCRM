"use strict";
var scopeRegCtrl;

// контроллер
scriptAnalysisCtrl = myApp.controller("scriptAnalysisCtrl", function scriptAnalysisCtrl($scope, $http, $interval, $timeout) {

  scopeRegCtrl = $scope;

  // событие при открытии вкладки
  $scope.$on("global.selectedScriptsSubMenuItem", function selectedMenuItemChanged(event, newValue) {

    if (newValue === "menuItemReg") {
      $scope.refreshReg();
    }
  });

  // список зарегистрированных
  $scope.getRegList = function getRegList() {

    $scope.global.showWaitingForm("Получение списка зарегистрированных..");

    $http({
      method: "GET",
      url: "/Home/GetRegList",
      params: {
        M_SEANS_TIME_ID: $scope.M_SEANS_TIME_ID,
        M_ORG_ID: $scope.global.userContext.M_ORG_ID
      }
    }).then(function GetRegListSuccess(data) {
      $scope.regList = data.data;
      $scope.regCount = $scope.regList.reduce((p, c) => { return c.rn > p ? c.rn : p; }, 0);
      $scope.zapolnennost = ($scope.regCount / $scope.global.manual.M_SEANS_PLACE.length).toFixed(2);
      $scope.global.hideWaitingForm();
    });

  };


  //helper functions, it turned out chrome doesn't support Math.sgn() 
  function signum(x) {
    return (x < 0) ? -1 : 1;
  }
  function absolute(x) {
    return (x < 0) ? -x : x;
  }

  function drawPath(svg, path, startX, startY, endX, endY) {
    // get the path's stroke width (if one wanted to be  really precize, one could use half the stroke size)
    var stroke = parseFloat(path.attr("stroke-width"));
    // check if the svg is big enough to draw the path, if not, set heigh/width
    if (svg.attr("height") < endY) svg.attr("height", endY + 10);
    if (svg.attr("width") < (startX + stroke)) svg.attr("width", (startX + stroke) + 10);
    if (svg.attr("width") < (endX + stroke)) svg.attr("width", (endX + stroke) + 10);

    var deltaX = (endX - startX) * 0.15;
    var deltaY = (endY - startY) * 0.15;
    // for further calculations which ever is the shortest distance
    var delta = deltaY < absolute(deltaX) ? deltaY : absolute(deltaX);

    // set sweep-flag (counter/clock-wise)
    // if start element is closer to the left edge,
    // draw the first arc counter-clockwise, and the second one clock-wise
    var arc1 = 0; var arc2 = 1;
    if (startX > endX) {
      arc1 = 1;
      arc2 = 0;
    }

    // draw tha pipe-like path
    // 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end 
    path.attr("d", "M" + startX + " " + startY +
                    " V" + (startY + delta) +
                    " A" + delta + " " + delta + " 0 0 " + arc1 + " " + (startX + delta * signum(deltaX)) + " " + (startY + 2 * delta) +
                    " H" + (endX - delta * signum(deltaX)) +
                    " A" + delta + " " + delta + " 0 0 " + arc2 + " " + endX + " " + (startY + 3 * delta) +
                    " V" + endY);
  }

  function connectElements(svg, path, arrow, startElem, endElem) {
    var svgContainer = $("#svgContainer");

    // if first element is lower than the second, swap!
    if (startElem.offset().top > endElem.offset().top) {
      var temp = startElem;
      startElem = endElem;
      endElem = temp;
    }

    // get (top, left) corner coordinates of the svg container   
    var svgTop = svgContainer.offset().top;
    var svgLeft = svgContainer.offset().left;

    // get (top, left) coordinates for the two elements
    var startCoord = startElem.offset();
    var endCoord = endElem.offset();

    // calculate path's start (x,y)  coords
    // we want the x coordinate to visually result in the element's mid point
    var startX = startCoord.left + 0.5 * startElem.outerWidth() - svgLeft;    // x = left offset + 0.5*width - svg's left offset
    var startY = startCoord.top + startElem.outerHeight() - svgTop;        // y = top offset + height - svg's top offset

    // calculate path's end (x,y) coords
    var endX = endCoord.left + 0.5 * endElem.outerWidth() - svgLeft;
    var endY = endCoord.top - svgTop;

    // call function for drawing the path
    drawPath(svg, path, startX, startY, endX, endY);



    var firstPointTriangleX;
    var firstPointTriangleY;

    var secondPointTriangleX;
    var secondPointTriangleY;

    var lenghtTriangle = 12.5;
    var widthTriangle = 10;


    //если подходим сверху
    if (endY < startY) {
      firstPointTriangleX = endX + widthTriangle / 2;
      secondPointTriangleX = endX - widthTriangle / 2;

      firstPointTriangleY = endY + lenghtTriangle;
      secondPointTriangleY = endY + lenghtTriangle;
    }
      //если подходим снизу
    else if (endY > startY) {
      firstPointTriangleX = endX + widthTriangle / 2;
      secondPointTriangleX = endX - widthTriangle / 2;

      firstPointTriangleY = endY - lenghtTriangle;
      secondPointTriangleY = endY - lenghtTriangle;


    }
    else //если подходим с левой стороны
      if (startX < endX) {
        firstPointTriangleX = endX - lenghtTriangle;
        secondPointTriangleX = endX - lenghtTriangle;

        firstPointTriangleY = endY - widthTriangle / 2;
        secondPointTriangleY = endY + widthTriangle / 2;
      }
        //если подходим с правой стороны
      else if (startX > endX) {
        firstPointTriangleX = endX + lenghtTriangle;
        secondPointTriangleX = endX + lenghtTriangle;

        firstPointTriangleY = endY - widthTriangle / 2;
        secondPointTriangleY = endY + widthTriangle / 2;
      }

    arrow.attr("points", firstPointTriangleX + "," +
    firstPointTriangleY + " " +
    secondPointTriangleX + "," +
    secondPointTriangleY + " " +
    endX + "," + endY);

  }






  $scope.blockList = [];
  $scope.connectorList = [];
  $scope.curBlockItem = null;

  var maxNum = 0;

  $scope.dob1 = function dob1(top, left) {

    var topVal = "100px";
    var leftVal = "100px";
    if (top && left)
    {
      topVal = top + "px";
      leftVal = left + "px";
    }
    maxNum++;
    var block = {
      caption: "Вопрос" + ($scope.blockList.length + 1),
      top: topVal,
      left: leftVal,
      id: "id" + ($scope.blockList.length + 1),
      num:maxNum,
      answerList: []
    };

    $scope.blockList.push(block);

  };

  $("script-textarea-item-caption").keyup(function (e) {
    while ($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
      $(this).height($(this).height() + 1);
    };
  });

  $scope.addAnswer = function addAnswer(item, evt) {

    var answerCaption = prompt('Техт ответа', "Ответ " + (item.answerList.length + 1));

    var answer = {
      id: item.id + "_answer"+ (item.answerList.length + 1),
      caption: answerCaption,
      top: item.top,
      left: item.left
    };
      
    item.answerList.push(answer);

    //var newTop = (Number(item.top.substring(0, item.top.length - 2)) + (item.answerList.length * 70));

    var newTop = 0;
    if (typeof item.top == "number") {
      newTop = item.top;
    }
    else {
      newTop = (Number(item.top.substring(0, item.top.length - 2)));
    }
    newTop += (item.answerList.length * 70);

    //var newLeft = (Number(item.left.substring(0, item.top.length - 2)) + 200);

    var newLeft = 0;
    if (typeof item.left == "number") {
      newLeft = item.left;
    }
    else {
      newLeft = (Number(item.left.substring(0, item.top.length - 2)));
    }
    newLeft += 200;

    $scope.dob1(newTop, newLeft);

    $scope.connectorList.push({
      id: $scope.connectorList.length + 1,
      blockId1: answer.id,
      blockId2: $scope.blockList[$scope.blockList.length-1].id
    });

    $scope.connectAll();
    
  }; //end $scope.addAnswer

  $scope.blockItemClick = function blockItemClick(item, evt) {

    console.log("blockItemClick");

    $scope.curBlockItem = item;
    evt.stopPropagation();

  };

  $scope.blockFieldClick = function blockFieldClick(evt) {

    console.log("blockFieldClick");

    if ($scope.curBlockItem == null) {
      return;
    }

    if (evt.currentTarget.classList.contains("block-item")) {
      return;
    }

    $scope.curBlockItem.top = evt.offsetY;
    $scope.curBlockItem.left = evt.offsetX;

    $scope.curBlockItem = null;

    $scope.connectAll();


  };


  $scope.btnSoedClick = function btnSoedClick() {

    $scope.connectorList.push({
      id: $scope.connectorList.length + 1,
      blockId1: $scope.blockId1,
      blockId2: $scope.blockId2
    });

    $scope.connectAll();

  };



  $scope.connectAll = function connectAll() {

    $timeout(function btnSoedClickTimeout() {
      $scope.connectorList.forEach((x) => {
        connectElements($("#svg1"), $("#myNewPath" + x.id), $("#myNewArrow" + x.id), $("#" + x.blockId1), $("#" + x.blockId2));

      });
    }, 100);

  };

  $scope.selectedTextQuery = function selectedTextQuery(item, evt) {
    //если выделения нет, то выделем всё
    if (evt.target.selectionEnd - evt.target.selectionStart == 0) {
      evt.target.select();
    }
  };
});
//// контроллер