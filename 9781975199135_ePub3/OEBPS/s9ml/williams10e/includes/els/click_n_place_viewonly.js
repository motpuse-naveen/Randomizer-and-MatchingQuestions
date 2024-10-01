var UserAns = [];
var UserCorrectAns = 0;
var UserIncorrectAns = 0;

var CLICK_N_PLACEViewOnly = function (data, currentQues, totalQues, mode) {
  var oData = data;
  var currentQuestion = currentQues;
  var totalQuestions = totalQues;
  var oClickNPlaceHtml;
  var evts = new Events();
  var sMode = Const.mode;

  function constructActivity() {
    oClickNPlaceHtml = $("<div>", { class: "click-n-place" });

    var oQuestionNumber = $("<div>", {
      class: "question_number ",
    });
    var index = Const.bookmarkData.indexOf(currentQuestion);
    var oFlag = $("<div>", {
      class: index > -1 ? "bookmarkedFlag tabindex" : "bookmarkFlag tabindex",
      title: index > -1 ? "Remove Bookmark" : "Add Bookmark",
    });
    oFlag.attr("aria-label", "Press enter to bookmark the current question");
    //oFlag.bind("click keyup", bookMarkQuestion);
    var ques_num = $("<div>", {
      class: "ques_num tabindex",
      "aria-label":
        "Question " + currentQuestion + " of " + totalQuestions + "",
    });
    ques_num.append("Question " + currentQuestion + " of " + totalQuestions);
    oQuestionNumber.append(ques_num);

    if (sMode == "study") {
      oQuestionNumber.append(oFlag);
    }
    oClickNPlaceHtml.append(oQuestionNumber);

    // Main activity setup
    var question_div = $("<div>", { class: "new_question_div" });
    var question_element = $("<div>", { class: "question_element" });

    // Question Text
    var oQuestion_text = $("<div>", { class: "question_text" });
    var queStr = oData.question;
    oQuestion_text.html(queStr);
    question_element.append(oQuestion_text);
    question_div.append(question_element);

    // Flex container for drag and drop
    var flexContainer = $("<div>", { class: "flex_container" });

    // Left container for draggable images
    var leftContainer = $("<div>", { class: "left_container" });
    var dragZoneContainer = $("<div>", { class: "dragzone_container" });

    oData.draggables.forEach(function (draggable) {
      var imageElement = $("<div>", {
        class: "draggable_image",
        id: draggable.zoneId,
        tabindex: 0, // Make focusable
        "aria-label": "Draggable image " + draggable.zoneId, // Accessibility label
      }).append($("<img>", { src: draggable.imageSrc }));

      // Add image to the drag zone
      dragZoneContainer.append(imageElement);

      // Click and Enter key handler for selecting the image, pass `draggable` as a parameter
      /*imageElement.on("click keydown", function (e) {
        selectImageToPlace(e, draggable);
      });*/
    });

    leftContainer.append(dragZoneContainer);
    flexContainer.append(leftContainer);

    // Right container for drop zones
    var rightContainer = $("<div>", { class: "right_container" });
    var dropZoneContainer = $("<div>", { class: "dropzone_container" });

    oData.dropZones.forEach(function (dropZone) {
      var dropZoneElement = $("<div>", {
        class: "dropzone_element",
        id: "drop_" + dropZone.correctZone,
        tabindex: 0, // Make focusable
        correctZone: dropZone.correctZone,
        "aria-label": "Drop zone for " + dropZone.optionText,
      }).append($("<div>",{class: "drop-text-item"}).text(dropZone.optionText));

      // Click and Enter key handler for placing the image in the drop zone
      /*dropZoneElement.on("click keydown", function (e) {
        placeImageToDropZone(e, dropZone);
      });*/

      dropZoneContainer.append(dropZoneElement);
    });

    rightContainer.append(dropZoneContainer);
    flexContainer.append(rightContainer);

    
    question_div.append(flexContainer);
    oClickNPlaceHtml.append(question_div);
    //$(".activity_container").html(oClickNPlaceHtml);
  }
  
  function disableActivity() {
    console.log("");
    // Disable all draggable images
    $(".draggable_image").each(function (i, imageElement) {
      $(imageElement).unbind("click keydown"); // Unbind click and keydown events
      $(imageElement).css("cursor", "auto"); // Change cursor to default
    });

    // Disable all drop zones
    $(".dropzone_element").each(function (i, dropZoneElement) {
      $(dropZoneElement).unbind("click keydown"); // Unbind click and keydown events
      $(dropZoneElement).css("cursor", "auto"); // Change cursor to default
    });

    // Disable the Reveal Answer button
    //oSubmitAnswer.unbind("click keydown");
    //oSubmitAnswer.css("pointer-events", "none");

    $(".delete-button").hide();
  }

  function enableActivity() {
    // Enable all draggable images
    $(".draggable_image").each(function (i, imageElement) {
      $(imageElement).unbind("click keydown"); // Unbind to prevent duplication
      $(imageElement).css("cursor", "pointer"); // Set cursor to pointer
      /*imageElement.on("click keydown", function (e) {
        selectImageToPlace(e, draggable);
      });*/
    });

    // Enable all drop zones
    $(".dropzone_element").each(function (i, dropZoneElement) {
      $(dropZoneElement).unbind("click keydown"); // Unbind to prevent duplication
      $(dropZoneElement).css("cursor", "pointer"); // Set cursor to pointer
      /*dropZoneElement.on("click keydown", function (e) {
        placeImageToDropZone(e, dropZone);
      });*/
    });

    // Enable the Reveal Answer button
    //oSubmitAnswer.css("pointer-events", "auto");
    //oSubmitAnswer.bind("click keydown", showResults);
    $(".delete-button").show();
  }

  function setFinalState(objUserAnswer) {
    //setTimeout(function(){
      var l_placements = {};
      if (objUserAnswer.userAnswer != undefined) {
        var correctCount = 0;
        l_placements = objUserAnswer.userAnswer
        $.each(l_placements, function (dropZoneId, selectedZoneId) {
          var dropZoneElement = oClickNPlaceHtml.find("#drop_" + dropZoneId);
          if(dropZoneElement.length>1){
            dropZoneElement = $(dropZoneElement[0]);
          }
          if(dropZoneElement.find(".placed-image-container")){
            dropZoneElement.find(".placed-image-container").remove();
          }
          if(dropZoneElement.find(".feedback_img")){
            dropZoneElement.find(".feedback_img").remove();
          }
  
          var placedImageContainer = $("<div>", {
            class: "placed-image-container",
          });
          var selectedImage = oClickNPlaceHtml.find(".draggable_image#" + selectedZoneId);
          if(selectedImage.length>1){
            selectedImage = $(selectedImage[0]);
          }
          placedImageContainer.append(
            selectedImage.clone().removeClass("selected placed")
          );
          selectedImage.addClass("placed");
          dropZoneElement.prepend(placedImageContainer);
          if (dropZoneId == selectedZoneId) {
            var correctFeedback = $("<span>", {
              class: "feedback_img fb_correct",
              "aria-label": "Correct placement",
            });
            dropZoneElement.prepend(correctFeedback);
            dropZoneElement.addClass("correct");
            correctCount++;
          } else {
            var incorrectFeedback = $("<span>", {
              class: "feedback_img fb_incorrect",
              "aria-label": "Incorrect placement",
            });
            dropZoneElement.prepend(incorrectFeedback);
            dropZoneElement.addClass("incorrect");
          }
        });
        disableActivity();
      }
    //}, 500)
    
  }
  
  constructActivity();
  return {
    evts: evts,
    disableActivity: disableActivity,
    enableActivity: enableActivity,
    setFinalState: setFinalState,
    getHTML: function () {
      return oClickNPlaceHtml;
    },
  };
};
