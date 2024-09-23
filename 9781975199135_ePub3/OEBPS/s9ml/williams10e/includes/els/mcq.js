var MCQ = function (data, currentQues, totalQues, linkedQues) {
  var currentQuestion = currentQues;
  var totalQuestions = totalQues;
  var mainQuestion = data;
  var oData = data;
  var linkedQuestions = linkedQues;

  //var aOptions = new Array();
  //var oMcqHtml;
  var questionContainer;
  var evts = new Events();
  var userAnswer = "";
  var userSelect;
  //var nCurrentAttempt = 0;
  var maxAttempts = 3;
  //var answeredCorrect = false;
  //var nCorrectAnswer;
  var sMode = Const.mode;
  var oRevealAnswer;
  //var oOptions = [];

  function getDataObject(qid) {
    if (qid == mainQuestion.id) {
      return mainQuestion;
    } else {
      for (var i = 0; i < linkedQuestions.length; i++) {
        if (qid == linkedQuestions[i].id) {
          return linkedQuestions[i];
        }
      }
    }
  }

  function getCommonRationale() {
    var l_rationale = "";
    if (mainQuestion.rationale != undefined && mainQuestion.rationale != "") {
      l_rationale = mainQuestion.rationale;
    } else {
      if (linkedQuestions && linkedQuestions.length > 0) {
        for (var i = 0; i < linkedQuestions.length; i++) {
          if (
            linkedQuestions[i].rationale != undefined &&
            linkedQuestions[i].rationale != ""
          ) {
            l_rationale = linkedQuestions[i].rationale;
            break;
          }
        }
      }
    }
    if (l_rationale == "") {
      l_rationale = "Rationale is not provided for the linked question.";
    }
    return l_rationale;
  }

  function constructActivity() {
    questionContainer = $("<div>", { class: "new_class questionContainer" });
    var isLastInGroup = true;
    var isLinkedQuestion = false;
    if (linkedQuestions != null && linkedQuestions.length > 0) {
      isLastInGroup = false;
      isLinkedQuestion = true;
    }
    oData.isLastInGroup = isLastInGroup;
    oData.isLinkedQuestion = isLinkedQuestion;
    var questionHtmlObj = constructQuestion(
      oData,
      oData.id,
      currentQuestion,
      isLastInGroup
    );
    questionContainer.append(questionHtmlObj);
    if (linkedQuestions != null && linkedQuestions.length > 0) {
      for (var i = 0; i < linkedQuestions.length; i++) {
        if (i == linkedQuestions.length - 1) {
          isLastInGroup = true;
        } else {
          isLastInGroup = false;
        }
        linkedQuestions[i].isLastInGroup = isLastInGroup;
        linkedQuestions[i].isLinkedQuestion = isLinkedQuestion;
        questionHtmlObj = constructQuestion(
          linkedQuestions[i],
          linkedQuestions[i].id,
          ++currentQues,
          isLastInGroup
        );
        questionContainer.append(questionHtmlObj);
      }
    }

    setTimeout(function () {
      var mainBodyHeight =
        $(window).innerHeight() -
        ($(".footer").height() + $(".header").height() + 25);
      questionContainer.css({
        "max-height": mainBodyHeight,
      });
    }, 100);
  }

  function constructQuestion(qobj, qid, qno) {
    oMcqHtml = $("<div>", { class: "question_mcq", qid: qid, qno: qno });
    var question_div = $("<div>", { class: "new_question_div" });
    var oQuestionLeft = $("<div>", { class: "question_left tabindex" });
    var oQuestionMiddle = $("<div>", { class: "question_middle" });
    var oQuestionRight = $("<div>", { class: "question_right " });
    var oQuestionNumber = $("<div>", { class: "question_number " });

    var index = Const.bookmarkData.indexOf(qid.toString());
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

    var k = -1;
    var question_text_html = document.createElement("div");
    //console.log("qobj.question_no> ",qobj.question_no)
    //console.log("qobj.question_no> ",qobj.question_no)
    var queStr =
      Const.mode != "exam"
        ? qobj.question_no + " " + qobj.question
        : qobj.question;
    question_text_html.innerHTML = queStr;
    oQuestionLeft.append(queStr);
    oQuestionLeft.attr("aria-label", queStr);
    //APT: Call sort Choices to sort options in Ascending Order by string.
    sortChoices(qid);
    for (key in qobj.choices) {
      if (key.indexOf("@") == -1) {
        var oDivOptions = $("<div>", { class: "radio_div" });
        var option_radio = $("<div>", { class: "option_radio" });
        var option_text = $("<div>", { class: "option_text tabindex" });
        var fbImage = $("<span>", { class: "feedback_img" });
        var radioInput = $("<span>", {
          class: "radio_box tabindex radio_unchecked",
          "data-value": key,
        });
        option_radio.append(fbImage);
        option_radio.append(radioInput);
        //console.log("choice> ", qobj.choices[key]);
        option_text.append(qobj.choices[key]);

        var option_text_html = document.createElement("div");
        option_text_html.innerHTML = qobj.choices[key];
        option_text.attr("aria-label", option_text_html.innerText);
        radioInput.attr("aria-label", "Press enter or space to select option");
        //oOptions.push(radioInput);
        radioInput.bind("click keyup", handleRadio);

        oDivOptions.append(option_radio);
        oDivOptions.append(option_text);
        oQuestionRight.append(oDivOptions);
      }
      k++;
    }
    //console.log("k",k);
    if (k < maxAttempts) {
      maxAttempts = k;
    }
    //radioInput.addClass('radio_checked'); //
    userAnswer = Number($(radioInput).attr("data-value").split("option")[1]);

    oRevealAnswer = $("<div>", { class: "reveal-button tabindex" });
    var clearDiv = $("<div>", { class: "clear" });

    if (qobj.isLastInGroup) {
      oQuestionRight.append(clearDiv);
      oQuestionRight.append(oRevealAnswer);
    }

    var ques_num = $("<div>", {
      class: "ques_num tabindex",
      "aria-label": "Question " + qno + " of " + totalQuestions + "",
    });

    ques_num.append("Question " + qno + " of " + totalQuestions);

    oQuestionNumber.append(ques_num);
    if (sMode == "study") {
      oQuestionNumber.append(oFlag);
    }
    oMcqHtml.append(oQuestionNumber);
    //oMcqHtml.append(oFlag);
    question_div.append(oQuestionLeft);
    question_div.append(oQuestionMiddle);
    question_div.append(oQuestionRight);
    oMcqHtml.append(question_div);
    oFlag.addClass("tabindex");
    oFlag.attr("aria-label", "Press enter to bookmark the current question");
    //oMcqHtml.append(oQuestionRight);
    //var nCorrectAnswer = Number(qobj.choices["@option"]);
    if (sMode == "exam") {
      oRevealAnswer.append("Submit");
      oRevealAnswer.css("pointer-events", "none");
    } else {
      oRevealAnswer.append("Reveal Answer");
      oRevealAnswer.bind("click keyup", revealAnswer);
    }
    $(oMcqHtml).find(".image_data").bind("click keyup", handleImage);
    oFlag.bind("click keyup", bookMarkQuestion);

    $(".bookmarkFlag").on("click keyup", function (e) {
      //console.log("bookmarked");
    });

    return oMcqHtml;
  }

  function bookMarkQuestion(e) {
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;

    var question_mcq = $(e.currentTarget).closest(".question_mcq");
    var qid = question_mcq.attr("qid");
    //oData = getDataObject(question_mcq.attr("qid"));
    if ($(this).hasClass("bookmarkFlag")) {
      Const.bookmarkData.push(qid);
      $(this).removeClass("bookmarkFlag");
      $(this).addClass("bookmarkedFlag");
      $(this).attr("title", "Remove Bookmark");
      $(this).attr(
        "aria-label",
        "Press enter to remove the current question from  bookmark"
      );
    } else {
      var index = Const.bookmarkData.indexOf(qid.toString());
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
      contents: qid,
    });
  }

  function handleImage(e) {
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;

    var image_url = $(e.target).attr("data-url");
    var imagecontent = $("<img>", { src: image_url });

    evts.dispatchEvent("SHOW_IMAGE", { type: "Image", contents: imagecontent });
  }

  function handleRadio(e) {
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;
    var question_mcq = $(e.currentTarget).closest(".question_mcq");
    oData = getDataObject(question_mcq.attr("qid"));
    if (oData.nCurrentAttempt == undefined) oData.nCurrentAttempt = 0;
    if (oData.nCurrentAttempt < maxAttempts) {
      userAnswer = Number($(e.target).attr("data-value").split("option")[1]);
      userSelect = $(e.target);
      oOptions = $(e.target).closest(".question_mcq").find(".radio_box");
      if (sMode == "exam") {
        $(oOptions).each(function (i, radioObj) {
          $(radioObj).removeClass("radio_checked");
        });
		oRevealAnswer.unbind("click keyup");
        oRevealAnswer.bind("click keyup", onSubmit);
        oRevealAnswer.css("pointer-events", "auto");
      }
      $(this).addClass("radio_checked");
      if (sMode == "study") {
        onSubmit(e);
      }
    }
    //console.log(nCurrentAttempt,maxAttempts)
  }

  function revealAnswer(e) {
    //debugger;
	console.log("revealAnswer");
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;
    //Number($(e.target).attr('data-value').split('option')[1])

    //Show checkmark for main question.
    var question_mcq = $(".question_mcq[qid='" + mainQuestion.id + "']");
    revealQuestion(mainQuestion, question_mcq);

    //Show checkmark for linked Question but it is not last
    for (i = 0; i < linkedQuestions.length; i++) {
      if (i < linkedQuestions.length - 1) {
        question_mcq = $(".question_mcq[qid='" + linkedQuestions[i].id + "']");
        revealQuestion(linkedQuestions[i], question_mcq);
      }
    }
    //Show checkmark for linked Question that is last
    question_mcq = $(e.currentTarget).closest(".question_mcq");
    oData = getDataObject(question_mcq.attr("qid"));
    revealQuestion(oData, question_mcq);
    evts.dispatchEvent("SHOW_FEEDBACK", {
      type: "Correct",
      currentattempt: oData.nCurrentAttempt,
      attempts: 3,
      //contents: oData.rationale,
      contents: getCommonRationale(),
      isLastInGroup: oData.isLastInGroup,
      isLinkedQuestion: oData.isLinkedQuestion,
    });
    evts.dispatchEvent("REVEAL_ANSWER", { type: "REVEAL_ANSWER" });
    //oRevealAnswer.unbind('click keyup');
    //oRevealAnswer.css('pointer-events', 'none');
  }
  function revealQuestion(qObject, p_question_mcq) {
    if (qObject.nCurrentAttempt == undefined) qObject.nCurrentAttempt = 0;
    var oOptions = p_question_mcq.find(".radio_box");
    var nCorrectAnswer = Number(qObject.choices["@option"]);
    $(oOptions).each(function (i, radioObj) {
      var correctAns = $(radioObj).attr("data-value").split("option")[1];
      if (correctAns == nCorrectAnswer) {
        $(radioObj).addClass("radio_checked");
        $(radioObj)
          .parent(".option_radio")
          .find(".feedback_img")
          .addClass("fb_correct");
      }
      $(radioObj).css("cursor", "auto");
      $(radioObj).unbind("click keyup");
    });
    qObject.nCurrentAttempt = 0;
  }

  function onSubmit(e) {
	console.log("onSubmit")
    if (e.type === "keyup" && e.keyCode !== 13 && e.keyCode !== 32)
      return false;
    //APT: Select question data object from qid.
    if (sMode == "study") {
      var question_mcq = $(e.currentTarget).closest(".question_mcq");
      var qid = question_mcq.attr("qid");
      oData = getDataObject(qid);
      submitQuestion(oData, question_mcq);
    } else if (sMode == "exam") {
      var question_mcq = $(".question_mcq[qid='" + mainQuestion.id + "']");
      submitQuestion(mainQuestion, question_mcq);

      //Show checkmark for linked Question but it is not last
      for (i = 0; i < linkedQuestions.length; i++) {
        question_mcq = $(".question_mcq[qid='" + linkedQuestions[i].id + "']");
        submitQuestion(linkedQuestions[i], question_mcq);
      }
    }
  }

  function submitQuestion(p_qObject, p_question_mcq) {
	console.log("submitQuestion")
    if (p_qObject.nCurrentAttempt == undefined) p_qObject.nCurrentAttempt = 0;
    if (p_qObject.answeredCorrect == undefined)
      p_qObject.answeredCorrect = false;
    var oOptions = p_question_mcq.find(".radio_box");
    var nCorrectAnswer = Number(p_qObject.choices["@option"]);
    if (p_qObject.nCurrentAttempt < maxAttempts) {
      var answerType = "Incorrect";
      if (userAnswer == nCorrectAnswer) {
        answerType = "Correct";
        if (sMode == "study")
          userSelect
            .parent(".option_radio")
            .find(".feedback_img")
            .addClass("fb_correct");
        p_qObject.answeredCorrect = true;
      } else {
        if (sMode == "study")
          userSelect
            .parent(".option_radio")
            .find(".feedback_img")
            .addClass("fb_incorrect");
      }

      p_qObject.nCurrentAttempt++;
      var attempts = maxAttempts - p_qObject.nCurrentAttempt;
      if (sMode == "study") {
        evts.dispatchEvent("SHOW_FEEDBACK", {
          type: answerType,
          userAnswer: userAnswer,
          currentattempt: p_qObject.nCurrentAttempt,
          attempts: attempts,
          contents: getCommonRationale(),
          isLastInGroup: p_qObject.isLastInGroup,
          isLinkedQuestion: p_qObject.isLinkedQuestion,
        });
        if (answerType == "Correct") {
          disableQuestion(p_qObject.id);
        }
      } else {
        //oRevealAnswer.unbind('click');
        //oRevealAnswer.addClass('disabled');
		console.log("QUESTION_ATTEMPT")
        evts.dispatchEvent("QUESTION_ATTEMPT", {
          type: answerType,
          userAnswer: userAnswer,
          nCorrectAnswer: nCorrectAnswer,
		  isLastInGroup: p_qObject.isLastInGroup,
          isLinkedQuestion: p_qObject.isLinkedQuestion,
        });
      }
      if (p_qObject.nCurrentAttempt >= maxAttempts) {
        disableQuestion(p_qObject.id);
      }
      //APT: Add userAnswers to question state.
      if (p_qObject.userAnswers == undefined) p_qObject.userAnswers = [];
      p_qObject.userAnswers.push(userAnswer);
    }
    if (
      p_qObject.answeredCorrect ||
      p_qObject.nCurrentAttempt >= maxAttempts ||
      sMode == "exam"
    ) {
      $(oOptions).each(function (i, radioObj) {
        $(radioObj).unbind("click keyup");
        $(radioObj).css("cursor", "auto");
        $(radioObj).removeClass("tabindex");
      });
      //oRevealAnswer.unbind('click keyup');
    }
    if (sMode == "study") {
      if (p_qObject.nCurrentAttempt >= maxAttempts) {
        //show correct answer after three attempts in study mode.
        //if(answerType!='Correct')
        $(oOptions).each(function (i, radioObj) {
          var thisAnswer = Number(
            $(radioObj).attr("data-value").split("option")[1]
          );
          if (thisAnswer == nCorrectAnswer) {
            $(radioObj).addClass("radio_checked");
            $(radioObj)
              .parent(".option_radio")
              .find(".feedback_img")
              .addClass("fb_correct");
          }
        });
      }
    }
  }

  function disableActivity() {
    var oOptions = $(".radio_box");
    $(oOptions).each(function (i, radioObj) {
      $(radioObj).unbind("click keyup");
      $(radioObj).css("cursor", "auto");
    });
  }
  function disableQuestion(qid) {
    var oOptions = $(".question_mcq[qid='" + qid + "']").find(".radio_box");
    $(oOptions).each(function (i, radioObj) {
      $(radioObj).unbind("click keyup");
      $(radioObj).css("cursor", "auto");
    });
  }

  function enableActivity() {
    var oOptions = $(".radio_box");
    $(oOptions).each(function (i, radioObj) {
      $(radioObj).unbind("click keyup");
      $(radioObj).css("cursor", "pointer");
      $(radioObj).bind("click", handleRadio);
    });
    oRevealAnswer.css("pointer-events", "auto");
	oRevealAnswer.unbind("click keyup");
    oRevealAnswer.bind("click keyup", onSubmit);
  }
  function sortChoices(p_qid) {
    oData = getDataObject(p_qid);
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
      l_choices[indx][1] = getFormattedOptionString(
        indx,
        l_choices[indx][1],
        oData.option_format
      );
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
  function getFormattedOptionString(optIndex, optStr, option_format) {
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
    switch (option_format) {
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

  function restoreSubmitState(p_dataObject) {
    oData = p_dataObject;
    if (oData.userAnswers != undefined && oData.userAnswers.length > 0) {
      var hasCorrectAnswer = false;
      var nCorrectAnswer = Number(oData.choices["@option"]);
      oData.userAnswers.forEach((userAns) => {
        $(".radio_box[data-value='option" + userAns + "']").addClass(
          "radio_checked"
        );
        if (userAns == nCorrectAnswer) {
          if (sMode == "study") {
            $(".radio_box[data-value='option" + userAns + "']")
              .parent(".option_radio")
              .find(".feedback_img")
              .addClass("fb_correct");
          }
          hasCorrectAnswer = true;
        } else {
          if (sMode == "study") {
            $(".radio_box[data-value='option" + userAns + "']")
              .parent(".option_radio")
              .find(".feedback_img")
              .addClass("fb_incorrect");
          }
        }
      });
      if (!hasCorrectAnswer && oData.userAnswers.length >= maxAttempts) {
        $(".radio_box[data-value='option" + nCorrectAnswer + "']")
          .parent(".option_radio")
          .find(".feedback_img")
          .addClass("fb_correct");
      }

      if (hasCorrectAnswer || oData.userAnswers.length >= maxAttempts) {
        $(oOptions).each(function (i, radioObj) {
          $(radioObj).unbind("click keyup");
          $(radioObj).css("cursor", "auto");
          $(radioObj).removeClass("tabindex");
        });
      }
      //Set Current attempts from state data.
      //nCurrentAttempt = oData.userAnswers.length;
    }
  }

  constructActivity();
  return {
    evts: evts,
    disableActivity: disableActivity,
    enableActivity: enableActivity,
    restoreSubmitState: restoreSubmitState,
    getHTML: function () {
      return questionContainer;
    },
  };
};
