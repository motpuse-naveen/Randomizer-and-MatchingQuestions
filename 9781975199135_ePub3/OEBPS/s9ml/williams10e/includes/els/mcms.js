var UserAns = [];
var UserCorrectAns = 0;
var UserIncorrectAns = 0;

var MCMS = function (data, currentQues, totalQues, mode) {
  var oData = data;
  var currentQuestion = currentQues;
  var totalQuestions = totalQues;

  var aOptions = new Array();
  var oMcqHtml;
  var evts = new Events();
  var userAnswer = "";
  var userSelect;
  var nCurrentAttempt = 0;
  var maxAttempts = 3;
  var answeredCorrect = false;
  var nCorrectAnswer;
  var sMode = Const.mode;
  var oSubmitAnswer;
  var oRevealAnswer;
  var oOptions = [];
  var oCorrectArray = [];
  var oUserAnswerArray = [];

  function constructActivity() {
    oMcqHtml = $("<div>", {
      class: "new_class questionContainer",
    });
    var oQuestionNumber = $("<div>", {
      class: "question_number ",
    });

    var index = Const.bookmarkData.indexOf(currentQuestion);
    if (index > -1) {
      var oFlag = $("<div>", {
        class: "bookmarkedFlag tabindex",
        title: "Remove Bookmark",
      });
    } else {
      var oFlag = $("<div>", {
        class: "bookmarkFlag tabindex",
        title: "Add Bookmark",
      });
    }

    oFlag.addClass("tabindex");
    oFlag.attr("aria-label", "Press enter to bookmark the current question");

    var oQuestionLeft = $("<div>", {
      class: "question_left tabindex",
    });
    var oQuestionMiddle = $("<div>", { class: "question_middle" });
    var oQuestionRight = $("<div>", {
      class: "question_right",
    });
    var question_text_html = document.createElement("div");
    // question_text_html.innerHTML = oData.question;
    // oQuestionLeft.append(oData.question);
    // oQuestionLeft.attr( "aria-label",question_text_html.innerText);
    var queStr = oData.question;
    question_text_html.innerHTML = queStr;
    oQuestionLeft.append(queStr);
    oQuestionLeft.attr("aria-label", queStr);

    //APT: Call sort Choices to sort options in Ascending Order by string.
    sortChoices();

    for (key in oData.choices) {
      if (key.indexOf("@") == -1) {
        var oDivOptions = $("<div>", {
          class: "radio_div",
        });
        var option_radio = $("<div>", {
          class: "option_radio",
        });
        var option_text = $("<div>", {
          class: "option_text tabindex",
        });
        var fbImage = $("<span>", {
          class: "feedback_img",
        });
        var radioInput = $("<span>", {
          class: "check_box tabindex checkbox_unchecked",
          "data-value": key,
        });
        option_radio.append(fbImage);
        option_radio.append(radioInput);
        option_text.append(oData.choices[key]);
        var option_text_html = document.createElement("div");
        option_text_html.innerHTML = oData.choices[key];
        option_text.attr("aria-label", option_text_html.innerText);
        radioInput.attr("aria-label", "Press enter to select option");
        oOptions.push(radioInput);
        radioInput.bind("click keyup", handleRadio);

        oDivOptions.append(option_radio);
        oDivOptions.append(option_text);
        oQuestionRight.append(oDivOptions);
      }
    }

    //radioInput.addClass('radio_checked'); //
    userAnswer = Number($(radioInput).attr("data-value").split("option")[1]);

    oSubmitAnswer = $("<div>", {
      class: "submit-button tabindex",
    });
    oSubmitAnswer.append("Submit");

    oRevealAnswer = $("<div>", {
      class: "reveal-button tabindex disnone",
    });
    oRevealAnswer.append("Reveal Answer");

    var clearDiv = $("<div>", {
      class: "clear",
    });

    oQuestionRight.append(clearDiv);

    oQuestionRight.append(oSubmitAnswer);
    oQuestionRight.append(oRevealAnswer);
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
    oMcqHtml.append(oQuestionNumber);
    oMcqHtml.append(oQuestionLeft);
    oMcqHtml.append(oQuestionMiddle);
    oMcqHtml.append(oQuestionRight);
    //nCorrectAnswer = Number(oData.choices['@option']);
    var numb = oData.choices["@option"].match(/\d/g);
    numb = numb.join(",");
    oCorrectArray = numb.split(",").map(Number);
    nCorrectAnswer = Number(oData.choices["@option"]);
    console.log("options", oData.choices["@option"]);
    console.log("nCorrectAnswer", oCorrectArray);
    if (sMode == "exam") {
      oSubmitAnswer.bind("click keyup", onSubmit); //
      //oSubmitAnswer.css('pointer-events', 'none');
    } else {
      oSubmitAnswer.bind("click keyup", revealAnswer);
      oFlag.bind("click keyup", bookMarkQuestion);
    }
    oRevealAnswer.bind("click keyup", RevealResults);
    $(oMcqHtml).find(".image_data").bind("click keyup", handleImage);
    setTimeout(function () {
      var mainBodyHeight =
        $(window).innerHeight() -
        ($(".footer").height() + $(".header").height() + 25);
      oMcqHtml.css({
        "max-height": mainBodyHeight,
      });
    }, 100);
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

  function handleImage(e) {
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;

    var image_url = $(e.target).attr("data-url");
    var imagecontent = $("<img>", {
      src: image_url,
    });

    evts.dispatchEvent("SHOW_IMAGE", {
      type: "Image",
      contents: imagecontent,
    });
  }

  function handleRadio(e) {
    /*$(oOptions).each(function(i, radioObj) {
			$(radioObj).parent('.option_radio').find('.feedback_img').removeClass('fb_incorrect');
			$(radioObj).parent('.option_radio').find('.feedback_img').removeClass('fb_correct');
		});
		*/
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;

    if (nCurrentAttempt < maxAttempts) {
      userAnswer = Number($(e.target).attr("data-value").split("option")[1]);
      userSelect = $(e.target);
      
      if (sMode == "exam") {
        if ($(this).hasClass("checkbox_checked")) {
          $(this).removeClass("checkbox_checked");
          var ansIndex = oUserAnswerArray.indexOf(userAnswer);
          if (ansIndex != -1) {
            oUserAnswerArray.splice(ansIndex, 1);
          }
        } else {
          $(this).addClass("checkbox_checked");
          oUserAnswerArray.push(userAnswer);
        }
      } else {
        if ($(this).hasClass("checkbox_checked")) {
          $(this).removeClass("checkbox_checked");
          var ansIndex = oUserAnswerArray.indexOf(userAnswer);
          if (ansIndex != -1) {
            oUserAnswerArray.splice(ansIndex, 1);
          }
          if (
            $(this)
              .parent(".option_radio")
              .find(".feedback_img")
              .hasClass("fb_incorrect")
          ) {
            $(this)
              .parent(".option_radio")
              .find(".feedback_img")
              .removeClass("fb_incorrect");
          } else if (
            $(this)
              .parent(".option_radio")
              .find(".feedback_img")
              .hasClass("fb_correct")
          ) {
            $(this)
              .parent(".option_radio")
              .find(".feedback_img")
              .removeClass("fb_correct");
          }
        } else {
          $(this).addClass("checkbox_checked");

          oUserAnswerArray.push(userAnswer);
          if (
            $(this)
              .parent(".option_radio")
              .find(".feedback_img")
              .hasClass("fb_incorrect")
          ) {
            $(this)
              .parent(".option_radio")
              .find(".feedback_img")
              .removeClass("fb_incorrect");
          } else if (
            $(this)
              .parent(".option_radio")
              .find(".feedback_img")
              .hasClass("fb_correct")
          ) {
            $(this)
              .parent(".option_radio")
              .find(".feedback_img")
              .removeClass("fb_correct");
          }
        }
      }
      console.log("oUserAnswerArray:::", oUserAnswerArray);
      //$(this).addClass('checkbox_checked');
    }
    console.log(nCurrentAttempt, maxAttempts);
  }

  function isSubmitAllowed(){
    var isAllowed = false;
    $(".question_right").find(".check_box").each(function() {
      if ($(this).hasClass("checkbox_checked")) {
        isAllowed = true
        return false;
      }
    });
    return isAllowed;
  }

  function RevealResults(e) {
    evts.dispatchEvent("SHOW_FEEDBACK", {
      type: "Answer",
      userAnswer: oData.userAnswers,
      currentattempt: oData.nCurrentAttempt,
      attempts: maxAttempts - oData.nCurrentAttempt,
      contents: oData.rationale,
    });
  }

  function revealAnswer(e) {
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;

      if(!isSubmitAllowed()) return false;

    $(oOptions).each(function (i, radioObj) {
      $(radioObj)
        .parent(".option_radio")
        .find(".feedback_img")
        .removeClass("fb_incorrect");
      $(radioObj)
        .parent(".option_radio")
        .find(".feedback_img")
        .removeClass("fb_correct");
    });
    //Number($(e.target).attr('data-value').split('option')[1])
    /*$(oOptions).each(function(i, radioObj) {
            var correctAns = $(radioObj).attr('data-value').split('option')[1];

            correctAns = Number(correctAns);
            var k = oCorrectArray.indexOf(correctAns);

            if (k > -1) {
                $(radioObj).addClass('checkbox_checked');
                $(radioObj).parent('.option_radio').find('.feedback_img').addClass('fb_correct');
            }
            /*if(correctAns == nCorrectAnswer) {
	        	$(radioObj).addClass('radio_checked');
				$(radioObj).parent('.option_radio').find('.feedback_img').addClass('fb_correct');
	        }*/
    /*   $(radioObj).css('cursor', 'auto');
            $(radioObj).unbind('click keyup');
        });*/
    /* nCurrentAttempt = 0;
        evts.dispatchEvent('SHOW_FEEDBACK', {
            'type': 'Correct',
            'currentattempt': nCurrentAttempt,
            'attempts': 3,
            'contents': oData.rationale
        });
        evts.dispatchEvent('REVEAL_ANSWER', {
            'type': 'REVEAL_ANSWER'
        });
        oSubmitAnswer.unbind('click keyup');
        oSubmitAnswer.css('pointer-events', 'none');*/
    if (sMode == "study") {
      onSubmit(e);
    }
  }

  function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = arr1.length; i--; ) {
      console.log("arr1[i]", arr1[i]);
      console.log("arr2[i]", arr2[i]);
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  function onSubmit(e) {
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;
      if(!isSubmitAllowed()) return false;
    console.log("onSubmit call");
    if (nCurrentAttempt < maxAttempts) {
      var answerType = "Incorrect";
      var correctFlag = false;
      userAnswer = Number(userAnswer);
      var k = oCorrectArray.indexOf(userAnswer);
      //console.log(oUserAnswerArray);
      //console.log(oCorrectArray);
      oUserAnswerArray = oUserAnswerArray.sort();
      oCorrectArray = oCorrectArray.sort();

      console.log("oCorrectArray", oUserAnswerArray);

      var equalArr = arraysEqual(oCorrectArray, oUserAnswerArray);
      console.log("equalArr:::", equalArr);
      if (equalArr) {
        correctFlag = true;
        answerType = "Correct";
      }
      if (sMode == "study") {
        $(oOptions).each(function (i, radioObj) {
          if (oUserAnswerArray[i] != "undefined")
            var cc = Number($(radioObj).attr("data-value").split("option")[1]);

          var m = oUserAnswerArray.indexOf(cc);
          var j = oCorrectArray.indexOf(cc);

          if (sMode == "study") {
            //if( m > -1  && j > -1){
            if (m > -1 && j > -1) {
              $(radioObj)
                .parent(".option_radio")
                .find(".feedback_img")
                .addClass("fb_correct");
              UserCorrectAns++;
              //}else if( m > -1){
            } else if (m > -1) {
              $(radioObj)
                .parent(".option_radio")
                .find(".feedback_img")
                .addClass("fb_incorrect");
              UserIncorrectAns++;
            }
          }
        });
      } else {
        if (correctFlag) {
          //answerType = 'Correct';
          if (sMode == "study") {
            userSelect
              .parent(".option_radio")
              .find(".feedback_img")
              .addClass("fb_correct");
            UserCorrectAns++;
          }
          //answeredCorrect = true;
        } else {
          if (sMode == "study")
            userSelect
              .parent(".option_radio")
              .find(".feedback_img")
              .addClass("fb_incorrect");
          UserIncorrectAns++;
        }
      }
      nCurrentAttempt++;
      var attempts = maxAttempts - nCurrentAttempt;
      if (sMode == "study") {
        if (answerType == "Correct") {
          console.log("answerType", answerType);
          evts.dispatchEvent("SHOW_FEEDBACK", {
            type: answerType,
            userAnswer: userAnswer,
            currentattempt: nCurrentAttempt,
            attempts: attempts,
            contents: oData.rationale,
          });
          disableActivity();
        } else {
          evts.dispatchEvent("SHOW_FEEDBACK", {
            type: answerType,
            userAnswer: userAnswer,
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
          userAnswer: oUserAnswerArray,
          nCorrectAnswer: nCorrectAnswer,
        });
      }
      if (nCurrentAttempt >= maxAttempts || equalArr) {
        disableActivity();
        oSubmitAnswer.addClass("disnone");
        oRevealAnswer.removeClass("disnone");
      }
      //APT: Add userAnswers to question state.
      if (oData.userAnswers == undefined) oData.userAnswers = [];
      if (oUserAnswerArray != undefined) {
        oUserAnswerArray.forEach((userAns) => {
          oData.userAnswers.push(userAns);
        });
        oData.userAttempts = nCurrentAttempt;
      }
    }
    if (answeredCorrect || nCurrentAttempt >= maxAttempts || sMode == "exam") {
      $(oOptions).each(function (i, radioObj) {
        $(radioObj).unbind("click keyup");
        $(radioObj).css("cursor", "auto");
        $(radioObj).removeClass("tabindex");
      });
      //oSubmitAnswer.unbind('click keyup');
    }
    if (sMode == "study") {
      if (nCurrentAttempt >= maxAttempts) {
        //show correct answer after three attempts in study mode.

        $(oOptions).each(function (i, radioObj) {
          var correctAns = $(radioObj).attr("data-value").split("option")[1];

          correctAns = Number(correctAns);
          var k = oCorrectArray.indexOf(correctAns);

          if (k > -1) {
            $(radioObj).addClass("checkbox_checked");
            $(radioObj)
              .parent(".option_radio")
              .find(".feedback_img")
              .addClass("fb_correct");
          }
          $(radioObj).css("cursor", "auto");
          $(radioObj).unbind("click keyup");
        });
      }
    }
    //console.log('correct count',UserCorrectAns);
    //console.log('incorrect count',UserIncorrectAns);
    UserAns.push(userAnswer);
    if(oData.attemptDetails == undefined) oData.attemptDetails = []
    oData.attemptDetails.push(answerType)
    //evts.dispatchEvent('SUBMIT_BTN_CLICK',{'mydata':2000, 'UserAns':UserAns})
    //oUserAnswerArray = [];
  }

  function disableActivity() {
    $(oOptions).each(function (i, radioObj) {
      $(radioObj).unbind("click keyup");
      $(radioObj).css("cursor", "auto");
    });
    oSubmitAnswer.unbind("click keyup");
    oSubmitAnswer.css("pointer-events", "none");
  }

  function enableActivity() {
    $(oOptions).each(function (i, radioObj) {
      $(radioObj).unbind("click keyup");
      $(radioObj).css("cursor", "pointer");
      $(radioObj).bind("click", handleRadio);
    });
    oSubmitAnswer.css("pointer-events", "auto");
    oSubmitAnswer.bind("click", onSubmit);
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
    if (oData.userAnswers != undefined && oData.userAnswers.length > 0) {
      var hasCorrectAnswer = false;
      var isAllCorrect = true;
      oData.userAnswers.forEach((userAns) => {
        $(".check_box[data-value='option" + userAns + "']").addClass(
          "checkbox_checked"
        );
        if (oCorrectArray.indexOf(userAns)!= -1) {
          if (sMode == "study") {
            $(".check_box[data-value='option" + userAns + "']")
              .parent(".option_radio")
              .find(".feedback_img")
              .addClass("fb_correct");
          }
          hasCorrectAnswer = true;
          
        } else {
          if (sMode == "study") {
            $(".check_box[data-value='option" + userAns + "']")
              .parent(".option_radio")
              .find(".feedback_img")
              .addClass("fb_incorrect");
          }
          isAllCorrect = false;
        }
        oUserAnswerArray.push(userAns);
      });

      if (oData.userAttempts >= maxAttempts) {
        if (oCorrectArray != undefined) {
          oCorrectArray.forEach((userAns) => {
            if (!oData.userAnswers.indexOf(userAns)) {
              $(".check_box[data-value='option" + userAns + "']")
                .parent(".option_radio")
                .find(".feedback_img")
                .addClass("fb_correct");
            }
          });
        }
        $(oOptions).each(function (i, radioObj) {
          $(radioObj).unbind("click keyup");
          $(radioObj).css("cursor", "auto");
          $(radioObj).removeClass("tabindex");
        });
      }
      //Set Current attempts from state data.
      nCurrentAttempt = oData.userAttempts;
      for(var i=0;i<oData.attemptDetails.length;i++){
        if(oData.attemptDetails[i]=="Correct"){
          $(".attempt.attempt" + (i+1)).css("background", "#70a42c");
        }
        else{
          $(".attempt.attempt" + (i+1)).css("background", "#EA100F");
        }
      }

      if (nCurrentAttempt >= maxAttempts || isAllCorrect) {
        //show correct answer after three attempts in study mode.

        $(oOptions).each(function (i, radioObj) {
          var correctAns = $(radioObj).attr("data-value").split("option")[1];

          correctAns = Number(correctAns);
          var k = oCorrectArray.indexOf(correctAns);

          if (k > -1) {
            $(radioObj).addClass("checkbox_checked");
            $(radioObj)
              .parent(".option_radio")
              .find(".feedback_img")
              .addClass("fb_correct");
          }
          $(radioObj).css("cursor", "auto");
          $(radioObj).unbind("click keyup");
        });

        disableActivity();
        oSubmitAnswer.addClass("disnone");
        oRevealAnswer.removeClass("disnone");
      }
      
    }
  }

  constructActivity();
  return {
    evts: evts,
    disableActivity: disableActivity,
    enableActivity: enableActivity,
    restoreSubmitState: restoreSubmitState,
    getHTML: function () {
      return oMcqHtml;
    },
  };
};
