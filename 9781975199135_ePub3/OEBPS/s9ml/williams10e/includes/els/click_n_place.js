var UserAns = [];
var UserCorrectAns = 0;
var UserIncorrectAns = 0;

var CLICK_N_PLACE = function (data, currentQues, totalQues, mode) {
  var oData = data;
  var currentQuestion = currentQues;
  var totalQuestions = totalQues;
  var oClickNPlaceHtml;
  var evts = new Events();
  var nCurrentAttempt = 0;
  var maxAttempts = 3;
  var nCorrectAnswer;
  var sMode = Const.mode;
  var oRevealAnswer;
  var oSubmitAnswer;
  var placedImages = [];
  var placements = {};

  function constructActivity() {
    oClickNPlaceHtml = $("<div>", { class: "new_class click-n-place" });

    var oQuestionNumber = $("<div>", {
      class: "question_number ",
    });
    var index = Const.bookmarkData.indexOf(currentQuestion);
    var oFlag = $("<div>", {
      class: index > -1 ? "bookmarkedFlag tabindex" : "bookmarkFlag tabindex",
      title: index > -1 ? "Remove Bookmark" : "Add Bookmark",
    });
    oFlag.attr("aria-label", "Press enter to bookmark the current question");
    oFlag.bind("click keyup", bookMarkQuestion);
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
      imageElement.on("click keydown", function (e) {
        selectImageToPlace(e, draggable);
      });
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
      dropZoneElement.on("click keydown", function (e) {
        placeImageToDropZone(e, dropZone);
      });

      dropZoneContainer.append(dropZoneElement);
    });

    rightContainer.append(dropZoneContainer);
    flexContainer.append(rightContainer);

    oSubmitAnswer = $("<div>", {
      class: "submit-button tabindex",
      tabindex: 0,
      "aria-label": "Submit Answer",
    });
    oSubmitAnswer.append("Submit");
    oSubmitAnswer.bind("click keydown", showResults);

    oRevealAnswer = $("<div>", {
      class: "reveal-button tabindex disnone",
      tabindex: 0,
      "aria-label": "Reveal Answer",
    });
    oRevealAnswer.append("Reveal Answer");
    oRevealAnswer.bind("click keydown", RevealResults);

    rightContainer.append(oSubmitAnswer);
    rightContainer.append(oRevealAnswer);
    question_div.append(flexContainer);
    oClickNPlaceHtml.append(question_div);
    $(".activity_container").html(oClickNPlaceHtml);

    // Adjust for layout
    setTimeout(function () {
      var mainBodyHeight =
        $(window).innerHeight() -
        ($(".footer").height() + $(".header").height() + 25);
      oClickNPlaceHtml.css({ "max-height": mainBodyHeight });
    }, 100);
  }

  function showResults(e) {
    if (e.type === "click" || e.key === "Enter") {
      if ($(".dropzone_element").length != $(".dropzone_element.placed").length)
        return false;
      var correctCount = 0;

      // Iterate over each placement
      $.each(placements, function (dropZoneId, selectedZoneId) {
        // Check if the placement is correct
        var isCorrect = oData.dropZones.find(
          (dropZone) =>
            dropZone.correctZone === dropZoneId &&
            dropZone.correctZone === selectedZoneId
        );

        // Get the corresponding drop zone element
        var dropZoneElement = $("#drop_" + dropZoneId);

        // Remove any existing feedback spans before adding new ones
        dropZoneElement.find(".feedback_img").remove();
        if (sMode == "study") {
          if (isCorrect) {
            // Correct placement logic
            correctCount++;
            dropZoneElement
              .removeClass("correct incorrect")
              .addClass("correct"); // Optional: Add correct class for styling

            // Add feedback image for correct placement
            var correctFeedback = $("<span>", {
              class: "feedback_img fb_correct",
              "aria-label": "Correct placement",
            });
            dropZoneElement.prepend(correctFeedback);
          } else {
            // Incorrect placement logic
            dropZoneElement
              .removeClass("correct incorrect")
              .addClass("incorrect"); // Optional: Add incorrect class for styling

            // Add feedback image for incorrect placement
            var incorrectFeedback = $("<span>", {
              class: "feedback_img fb_incorrect",
              "aria-label": "Incorrect placement",
            });
            dropZoneElement.prepend(incorrectFeedback);
          }
        }
      });

      if (nCurrentAttempt < maxAttempts) {
        var answerType = "Incorrect";
        var correctFlag = false;
        if (correctCount == oData.dropZones.length) {
          correctFlag = true;
          answerType = "Correct";
        }
      }
      nCurrentAttempt++;
      var attempts = maxAttempts - nCurrentAttempt;

      if (sMode == "study") {
        if (answerType == "Correct") {
          console.log("answerType", answerType);
          evts.dispatchEvent("SHOW_FEEDBACK", {
            type: answerType,
            userAnswer: placements,
            currentattempt: nCurrentAttempt,
            attempts: attempts,
            contents: oData.rationale,
          });
          oRevealAnswer.removeClass("disnone");
          oSubmitAnswer.addClass("disnone");
          disableActivity();
        } else {
          evts.dispatchEvent("SHOW_FEEDBACK", {
            type: answerType,
            userAnswer: placements,
            currentattempt: nCurrentAttempt,
            attempts: attempts,
            contents: oData.rationale,
          });
        }
      } else {
        oSubmitAnswer.unbind("click");
        oSubmitAnswer.addClass("disabled");
        evts.dispatchEvent("QUESTION_ATTEMPT", {
          type: answerType,
          userAnswer: placements,
          nCorrectAnswer: nCorrectAnswer,
        });
      }
      if (sMode == "study") {
        if (nCurrentAttempt >= maxAttempts) {
          placeCorrectImages();
          oRevealAnswer.removeClass("disnone");
          oSubmitAnswer.addClass("disnone");
        }
      }
      if (nCurrentAttempt >= maxAttempts) {
        disableActivity();
      }

      //APT: Add userAnswers to question state.
      if (oData.userAnswers == undefined) oData.userAnswers = [];
      oData.userAnswers.push(placements);
      oData.nCurrentAttempt = nCurrentAttempt;
      if (answerType == "Correct") {
        oData.answeredCorrect = true;
      }
    }
  }

  function RevealResults(e) {
    evts.dispatchEvent("SHOW_FEEDBACK", {
      type: "Answer",
      userAnswer: placements,
      currentattempt: oData.nCurrentAttempt,
      attempts: maxAttempts - oData.nCurrentAttempt,
      contents: oData.rationale,
    });
  }

  function selectImageToPlace(e, draggable) {
    if (e.type === "click" || e.key === "Enter") {
      if (!placedImages.includes(draggable.zoneId)) {
        $(".draggable_image").removeClass("selected");
        $(e.currentTarget).addClass("selected");
      }
    }
  }

  function placeImageToDropZone(e, dropZone) {
    if (e.type === "click" || e.key === "Enter") {
      var selectedImage = $(".draggable_image.selected");

      if (selectedImage.length > 0) {
        if ($(e.currentTarget).find(".placed-image-container").length <= 0) {
          var selectedZoneId = selectedImage.attr("id");

          // Prevent placing the same image in multiple zones
          if (placedImages.includes(selectedZoneId)) {
            //alert("This image has already been placed in another drop zone.");
            evts.dispatchEvent("SHOW_ALERT_MESSAGE", {
              message:
                "This image has already been placed in another drop zone.",
            });
            return;
          }

          var placedImageContainer = $("<div>", {
            class: "placed-image-container",
          });
          var deleteButton = $("<button>", {
            class: "delete-button",
            title: 'Delete',
            text: "",
          });
          deleteButton.on("click", function (e) {
            e.stopPropagation();
            if (e.type === "click" || e.key === "Enter") {
              placedImages = placedImages.filter((id) => id !== selectedZoneId);
              $(".draggable_image#" + selectedZoneId).removeClass("placed");
              $(this)
                .closest(".dropzone_element")
                .removeClass("correct")
                .removeClass("incorrect")
                .removeClass("placed");

              $(this)
                .closest(".dropzone_element")
                .find(".feedback_img")
                .remove();

              $(this).parent().remove();
              //deleteButton.closest(".dropzone_element").removeClass("placed");
            }
          });

          placedImageContainer
            .append(selectedImage.clone().removeClass("selected"))
            .append(deleteButton);
          $(e.currentTarget).prepend(placedImageContainer);
          placements[dropZone.correctZone] = selectedZoneId;
          placedImages.push(selectedZoneId);
          selectedImage.addClass("placed").removeClass("selected");
          $(e.currentTarget).addClass("placed");
        } else {
          //alert("This drop zone already has an image.");
          evts.dispatchEvent("SHOW_ALERT_MESSAGE", {
            message:
              "You’ve already placed an image here. Try another drop zone.",
          });
        }
      } else {
        //alert("Select an image to place in the drop zone.");
        evts.dispatchEvent("SHOW_ALERT_MESSAGE", {
          message: "Select an image to place in the drop zone.",
        });
      }
    }
  }

  function placeCorrectImages() {
    oData.dropZones.forEach(function (dropZone) {
      var dropZoneElement = $("#drop_" + dropZone.correctZone);
      dropZoneElement.find(".placed-image-container").remove();
      dropZoneElement.find(".feedback_img").remove();

      var placedImageContainer = $("<div>", {
        class: "placed-image-container",
      });
      var selectedImage = $(".dragzone_container .draggable_image#" + dropZone.correctZone);
      placedImageContainer.append(
        selectedImage.clone().removeClass("selected placed")
      );
      selectedImage.addClass("placed");
      dropZoneElement.prepend(placedImageContainer);
      var correctFeedback = $("<span>", {
        class: "feedback_img fb_correct",
        "aria-label": "Correct placement",
      });
      dropZoneElement.prepend(correctFeedback);
      dropZoneElement.addClass("correct");
    });
  }

  function bookMarkQuestion(e) {
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;

    if ($(this).hasClass("bookmarkFlag")) {
      Const.bookmarkData.push(currentQuestion.toString());
      $(this).removeClass("bookmarkFlag");
      $(this).addClass("bookmarkedFlag");
      $(this).attr("title", "Remove Bookmark");
      $(this).attr(
        "aria-label",
        "Press enter to remove the current question from  bookmark"
      );
    } else {
      var index = Const.bookmarkData.indexOf(currentQuestion.toString());
      if (index > -1) {
        Const.bookmarkData.splice(index, 1);
      }
      $(this).removeClass("bookmarkedFlag");
      $(this).addClass("bookmarkFlag");
      $(this).attr("title", "Add Bookmark");
      $(this).attr(
        "aria-label",
        "Press enter to bookmark the current question"
      );
    }
    if (Const.bookmarkData.length > 0) {
      $(".bookmark").css("cursor", "pointer");
      $(".bookmark").addClass("tabindex");
      $(".bookmark").attr("tabindex", 1);
    } else {
      $(".bookmark").css("cursor", "auto");
    }

    evts.dispatchEvent("BOOKMARK_QUESTION", {
      type: "BOOKMARK_QUESTION",
      contents: currentQuestion,
    });
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
      imageElement.on("click keydown", function (e) {
        selectImageToPlace(e, draggable);
      });
    });

    // Enable all drop zones
    $(".dropzone_element").each(function (i, dropZoneElement) {
      $(dropZoneElement).unbind("click keydown"); // Unbind to prevent duplication
      $(dropZoneElement).css("cursor", "pointer"); // Set cursor to pointer
      dropZoneElement.on("click keydown", function (e) {
        placeImageToDropZone(e, dropZone);
      });
    });

    // Enable the Reveal Answer button
    oSubmitAnswer.css("pointer-events", "auto");
    oSubmitAnswer.bind("click keydown", showResults);
    $(".delete-button").show();
  }

  function sortChoices() {
    //APT: new function is added to sort options in Ascending Order by string.
    var l_choices = [];
    var l_answer = [];
    var regex = /[A-Za-z]+\.\s+/i;
    if (oData.skip_sort) {
      return;
    }
    var isAllNumbers = true;
    for (key in oData.choices) {
      if (key.indexOf("@") == -1) {
        var choiceStr = oData.choices[key].replace(regex, "");
        if (isNaN(choiceStr)) {
          isAllNumbers = false;
        }
        l_choices.push([key, choiceStr]);
      } else {
        l_answer = [key, oData.choices[key]];
      }
    }
    //Apply sort on choices.
    if (isAllNumbers) {
      //Apply number sorting.
      l_choices.sort((x, y) => x[1] - y[1]);
    } else {
      //Apply string sorting.
      l_choices.sort((a, b) => {
        var fa = a[1].toLowerCase(),
          fb = b[1].toLowerCase();
        if (fa < fb) {
          return -1;
        }
        if (fa > fb) {
          return 1;
        }
        return 0;
      });
    }
    //Apply Format
    for (indx in l_choices) {
      l_choices[indx][1] = getFormattedOptionString(indx, l_choices[indx][1]);
    }
    l_choices.push(l_answer);
    //Object.fromEntries not work for older versions of Bookshelf or
    //Bookshelf app on windows.
    //oData.choices = Object.fromEntries(l_choices);
    oData.choices = l_choices.reduce(function (obj, pair) {
      obj[pair[0]] = pair[1];
      return obj;
    }, {});
  }
  function getFormattedOptionString(optIndex, optStr) {
    //APT: new function is added to apply/prepend formating extentions to option string.
    var alphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    var numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    var romanNumbers = [
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
    ];
    switch (oData.option_format) {
      case "alpha":
        optStr = alphabets[optIndex] + ". " + optStr;
        break;
      case "lower-alpha":
        optStr = alphabets[optIndex].toLowerCase() + ". " + optStr;
        break;
      case "roman":
        optStr = romanNumbers[optIndex] + ". " + optStr;
        break;
      case "lower-roman":
        optStr = romanNumbers[optIndex].toLowerCase() + ". " + optStr;
        break;
      case "number":
        optStr = numbers[optIndex].toLowerCase() + ". " + optStr;
        break;
      case "none":
        optStr = optStr;
        break;
      default:
        optStr = alphabets[optIndex] + ". " + optStr;
    }
    return optStr;
  }

  function restoreSubmitState() {
    var l_placements = {};
    
    if (oData.userAnswers != undefined && oData.userAnswers.length > 0) {
      var hasCorrectAnswer = false;
      if (oData.userAnswers.length > 0) {
        l_placements = oData.userAnswers[0];
      }
      //Set Current attempts from state data.
      nCurrentAttempt = oData.nCurrentAttempt;
      var correctCount = 0;
      $.each(l_placements, function (dropZoneId, selectedZoneId) {
        var dropZoneElement = $("#drop_" + dropZoneId);
        dropZoneElement.find(".placed-image-container").remove();
        dropZoneElement.find(".feedback_img").remove();

        var placedImageContainer = $("<div>", {
          class: "placed-image-container",
        });
        var selectedImage = $(".draggable_image#" + selectedZoneId);
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
      if (
        nCurrentAttempt >= maxAttempts ||
        correctCount == oData.dropZones.length
      ) {
        placeCorrectImages();
        oRevealAnswer.removeClass("disnone");
        oSubmitAnswer.addClass("disnone");
        disableActivity();
      }
    }
    else{
      setTimeout(function(){
        set_Click_N_Place_DropzoneDimensions()
      },500)
    }
  }

  function set_Click_N_Place_DropzoneDimensions(){
    // Loop through each question wrapper with the .click-n-place class
    document.querySelectorAll('.click-n-place .flex_container').forEach(wrapper => {
      debugger;
      // Select the first draggable image within the wrapper
      const firstDraggable = wrapper.querySelector('.draggable_image');
  
      if (firstDraggable) {
        // Get the width and height of the first draggable image
        const width = firstDraggable.offsetWidth;
        const height = firstDraggable.offsetHeight;
  
        // Set the width and height to all dropzones within the same wrapper
        wrapper.querySelectorAll('.dropzone_element').forEach(dropzone => {
          //dropzone.style.width = `${width}px`;
          dropzone.style.minHeight = `${height}px`;
        });
      }
    });
  }

  constructActivity();
  return {
    evts: evts,
    disableActivity: disableActivity,
    enableActivity: enableActivity,
    restoreSubmitState: restoreSubmitState,
    getHTML: function () {
      return oClickNPlaceHtml;
    },
  };
};
