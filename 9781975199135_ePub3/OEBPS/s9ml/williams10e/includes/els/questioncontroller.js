var QuestionController = function (obj) {
  var aQuestionBlocks = new Array();
  var nCurrentBlock = 0;
  var quesSets = Const.quesSets;
  var bSetComplete = false;
  var totalQuestionToDisplay;

  if (Const.mode == "exam") {
    totalQuestionToDisplay = 40;
    obj = shuffle(obj);
    //Assign dynamic IDs to questions missing ids
    obj = assignIds(obj);
    // create question sets
    //APT: Select questions and linked questions.
    // Select random questions ensuring grouped questions are included
    var selectedQuestions = selectRandomQuestions(obj, totalQuestionToDisplay);
    // Group the original set of questions
    var groupedQuestions = groupQuestions(obj);
    // Sort the selected questions so that grouped questions are together
    obj = sortQuestionsByGroup(selectedQuestions, groupedQuestions);
    console.log("q-length: " + obj.length);

    Const.totalExamQuestions = obj;
    var rem = obj.length % quesSets;
    var numChunk = obj.length / quesSets;
    var numChunk1 = numChunk;
    if (rem != 0) numChunk1 = numChunk - 1;

    Const.totalExamSET = numChunk1;
    aQuestionBlocks.push(totalQuestionToDisplay);
  } else if (Const.mode == "study") {
    totalQuestionToDisplay = 30;
    obj = shuffle(obj);
    //Assign dynamic IDs to questions missing ids
    obj = assignIds(obj);
    // create question sets
    //APT: Select questions and linked questions.
    // Select random questions ensuring grouped questions are included
    var selectedQuestions = selectRandomQuestions(obj, totalQuestionToDisplay);
    // Group the original set of questions
    var groupedQuestions = groupQuestions(obj);
    // Sort the selected questions so that grouped questions are together
    obj = sortQuestionsByGroup(selectedQuestions, groupedQuestions);
    console.log("q-length: " + obj.length);

    Const.totalExamQuestions = obj;
    var rem = obj.length % quesSets;
    var numChunk = obj.length / quesSets;
    var numChunk1 = numChunk;
    if (rem != 0) numChunk1 = numChunk - 1;

    Const.totalExamSET = numChunk1;
    for (var i = 0; i < numChunk1; i++) {
      aQuestionBlocks.push(quesSets * (i + 1));
    }
    if (rem != 0) {
      aQuestionBlocks.push(rem + aQuestionBlocks[aQuestionBlocks.length - 1]);
    }
  }
  Const.totalSection = aQuestionBlocks.length;
  
  for (var i = 0; i < obj.length; i++) {
    obj[i].question_no = (i+1);
    Const.questionsData.push({number:(i + 1), group: obj[i].group_id});
  }
  Const.examData = obj;

  oPopup = new PopupManager();
  oPopup.evts.addEventListener("EXAM_RESULT_CLICK", handlePopupSelction);
  var oActivity;
  var oTimer;
  var evts = new Events();

  var oQueHtml;
  var nQuestionCounter = 0;
  var nLinkedQuestionCounter = 0;
  var nPrevLinkedQuestionCounter = [];
  var arr = [];
  var oActivityData = "";
  var btnNext;
  var btnPrev;
  var btnGoTo;
  var attemptsDiv;
  var attempt1;
  var attempt2;
  var attempt3;
  var timerDivArr;
  var timerDiv1;
  var timerDiv2;
  var answerArray = [];
  var questionArray = [];
  var oBookmarkMenu;
  var oShapesDD;

  if (Const.mode == "study") {
    bSetComplete = true;
    answerArray = new Array(obj.length);
  }

  Const.userAnswer = answerArray;
  /*$.ajax({ 
    	type: 'GET', 
    	url: 'content/json/Chapter_01.json', 
    	data: { get_param: 'value' }, 
    	dataType: 'json',
    	success: function (data) { 
    		arr = data;
    		loadQuestion(nQuestionCounter)
    		if(Const.timed)
    		{
    			oTimer = new TimeController();
    			oQueHtml.append(oTimer.getHTML());
    		}
    	}
    });*/
  setupQuestionObjects(obj);

  function shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
  // Function to assign dynamic IDs to questions if they don't have an id
  function assignIds(questions) {
    let currentId = 1; // Start assigning IDs from 1 (or any number you choose)

    questions.forEach((question) => {
      // If id is missing, assign a new one
      if (!question.id) {
        question.id = currentId++;
      }
    });

    return questions;
  }
  // Group questions by their group_id, treating missing group_id as null
  function groupQuestions(questions) {
    let groups = {};

    questions.forEach((question) => {
      // If group_id is missing or undefined, treat it as null
      const group_id = question.group_id || null;

      if (group_id !== null) {
        // Initialize group if it doesn't exist
        if (!groups[group_id]) {
          groups[group_id] = [];
        }
        // Add question to its respective group
        groups[group_id].push(question);
      }
    });

    return groups;
  }
  // Select a random set of questions while ensuring that all questions from selected groups are included
  function selectRandomQuestions(questions, numberToSelect) {
    let selectedQuestions = [];

    // Step 1: Select an initial subset to account for group questions
    let initialSelectionSize = Math.min(numberToSelect, questions.length); // In case numberToSelect is more than available questions
    let initialSelection = questions.slice(0, initialSelectionSize);

    // Step 2: Find unique group IDs from the selected questions, treat missing group_id as null
    let selectedGroupIds = new Set(
      initialSelection
        .map((q) => q.group_id || null)
        .filter((id) => id !== null)
    );

    // Step 3: Ensure all questions with the selected group IDs are included
    selectedGroupIds.forEach((group_id) => {
      let groupQuestions = questions.filter(
        (q) => (q.group_id || null) === group_id
      );
      groupQuestions.forEach((gq) => {
        if (!selectedQuestions.find((sq) => sq.id === gq.id)) {
          // Add missing group question to the selection
          selectedQuestions.push(gq);
        }
      });
    });

    // Step 4: Add any initialSelection questions to selectedQuestions that were not already included
    selectedQuestions = [
      ...new Set([...selectedQuestions, ...initialSelection]),
    ]; // Ensures uniqueness

    // Step 5: If the total is less than the desired number (e.g., 30), add more non-grouped questions
    if (selectedQuestions.length < numberToSelect) {
      let remainingQuestions = questions.filter(
        (q) => !selectedQuestions.includes(q) && q.group_id === null
      );

      // Add enough non-grouped questions to fill the gap
      let additionalQuestions = remainingQuestions.slice(
        0,
        numberToSelect - selectedQuestions.length
      );
      selectedQuestions = selectedQuestions.concat(additionalQuestions);
    }

    // Step 6: Ensure the total does not exceed the desired number (trim excess questions)
    if (selectedQuestions.length > numberToSelect) {
      // Separate grouped and non-grouped questions
      let groupedQuestions = selectedQuestions.filter(
        (q) => q.group_id !== null
      );
      let nonGroupedQuestions = selectedQuestions.filter(
        (q) => q.group_id === null
      );

      // If the total exceeds, prioritize keeping grouped questions, then trim non-grouped
      if (groupedQuestions.length <= numberToSelect) {
        // We can keep all grouped questions and trim only non-grouped
        let remainingSlots = numberToSelect - groupedQuestions.length;
        selectedQuestions = groupedQuestions.concat(
          nonGroupedQuestions.slice(0, remainingSlots)
        );
      } else {
        // If grouped questions alone exceed the limit, trim them down as well
        selectedQuestions = groupedQuestions.slice(0, numberToSelect);
      }
    }

    return selectedQuestions;
  }

  // Sort questions to ensure grouped questions are displayed together
  function sortQuestionsByGroup(questions, groups) {
    let sortedQuestions = [];

    // Add questions from groups first
    questions.forEach((question) => {
      const group_id = question.group_id || null; // Treat missing group_id as null
      if (group_id && groups[group_id]) {
        // Add all questions from the group if not already added
        if (!sortedQuestions.find((q) => q.group_id === group_id)) {
          sortedQuestions = sortedQuestions.concat(groups[group_id]);
        }
      } else {
        // Add non-grouped questions
        if (!sortedQuestions.find((q) => q.id === question.id)) {
          sortedQuestions.push(question);
        }
      }
    });

    return sortedQuestions;
  }

  function onDDSelected(e, type, data) {
    nQuestionCounter = data.question_selected - 1;

    //nQuestionCounter++;
    // if(nQuestionCounter < 70)
    // 	nQuestionCounter = 70;
    Const.CurrentActiveQuestion = nQuestionCounter + 1;
    loadQuestion(nQuestionCounter);
    oShapesDD.updateQuestionsarray();
  }

  function onBookmarkSelected(e, type, data) {
    nQuestionCounter = data.question_selected - 1;

    //nQuestionCounter++;
    // if(nQuestionCounter < 70)
    // 	nQuestionCounter = 70;

    Const.CurrentActiveQuestion = nQuestionCounter + 1;
    loadQuestion(nQuestionCounter);
    oShapesDD.updateQuestionsarray();
  }

  function setupQuestionObjects(data) {
    oQueHtml = $("<div>", {
      class: "question_div",
    });

    if (Const.mode == "exam") {
      var mode = "Exam Mode";
      var currentSection = Number(nCurrentBlock) + 1;
      Const.currentSection = currentSection;
      var totalSection = aQuestionBlocks.length;

      oQueHtml.append(
        '<ul id="examList"><li><div id="mainListDiv"><div class="resultHeading tabindex">' +
          mode +
          " > " +
          Const.selected_section +
          " > Exam " +
          Const.examSeq[Const.currentSet] +
          " > Section " +
          currentSection +
          " of " +
          totalSection +
          "</div></div></li></ul>"
      );
      buttonContainer = $("<div>", {
        class: "button-container",
      });
    } else {
      var mode = "Study Mode";
      oQueHtml.append(
        '<ul id="examList"><li><div id="mainListDiv"><div class="resultHeading tabindex">' +
          mode +
          " > " +
          Const.selected_section +
          " > Exam " +
          Const.examSeq[Const.currentSet] +
          "</div></div></li></ul>"
      );
      buttonContainer = $("<div>", {
        class: "button-container",
      });
    }

    //btnGoTo = $('<div>',{class:'btnGoTo tabindex', 'data-type':'next'});
    bookmarkButton = $("<div>", {
      class: "bookmark tabindex",
      id: "bookmark",
    });

    var labelArray = [
      nQuestionCounter + 11,
      nQuestionCounter + 12,
      nQuestionCounter + 13,
      nQuestionCounter + 14,
      nQuestionCounter + 15,
      nQuestionCounter + 16,
      nQuestionCounter + 17,
    ];
    var bookArray = Const.bookmarkData;

    oShapesDD = new DropDownMenu(Const.questionsData, "Shapes");
    oShapesDD.Evts.addEventListener("OPTION_SELECTED", onDDSelected);

    oBookmarkMenu = new BookmarkMenu(Const.bookmarkData, "Bookmark");
    oBookmarkMenu.Evts.addEventListener(
      "BOOKMARK_OPTION_SELECTED",
      onBookmarkSelected
    );

    btnNext = $("<div>", {
      class: "btnNext tabindex",
      "data-type": "next",
      title: "Next Question",
      role: "button",
    });

    btnViewResult = $("<div>", {
      class: "button btnViewResult tabindex",
      "data-type": "ViewResult",
    });
    btnViewResult.append("View Result");
    btnPrev = $("<div>", {
      class: "btnPrev ",
      "data-type": "back",
      title: "Previous Question",
      role: "button",
    });
    btnNext.bind("click keyup", handleButtonEvents);
    btnPrev.bind("click keyup", handleButtonEvents);
    //if(Const.mode == 'exam')
    $(".footer").append(btnViewResult);
    var copyRight_text = $(
      '<div class="divFooterPrint">ELS - Exam Review</div>'
    );

    if (Const.mode == "study") {
      //$('.footer').append(btnGoTo);
      //$('.header').append(bookmarkButton);
      $(".footer").append(oShapesDD.getHTML());
      $(".header").append(oBookmarkMenu.getHTML());
      var navBtnContainer = $("<div>", {class: "nav-btn-container"});
      navBtnContainer.append(btnNext);
      navBtnContainer.append(btnPrev);
      $(".footer").append(navBtnContainer);

      $(".bookmark").css("cursor", "auto");

      //$('.bm-main-container').css('display','none');
    }
    //

    arr = data;
    loadQuestion(nQuestionCounter);
    // add Timer
    if (Const.timed) {
      clearIntervals();
      oTimer = new TimeController();
      Const.TimerInstance = oTimer;
      oTimer.evts.addEventListener("TIME_UP", handleMainEvents);
      oTimer.evts.addEventListener("TIME_PAUSE", handleMainEvents);
      oTimer.evts.addEventListener("TIME_CONTINUE", handleMainEvents);

      timerDivArr = oTimer.getHTML();
      timerDiv1 = timerDivArr[0];
      timerDiv2 = timerDivArr[1];
      $(".footer").prepend(timerDiv1);
      $(".footer").append(timerDiv2);
    }

    //
    btnViewResult.bind("click keyup", handleButtonEvents);
  }

  function handlePopupSelction(e, type, data) {
    clearIntervals();
    evts.dispatchEvent("SHOW_EXAM_RESULT", {
      type: "EXAM_RESULT_CLICK",
      STUDENT_NAME: data.STUDENT_NAME,
      answerData: answerArray,
    });
  }

  function handleButtonEvents(e) {
    if (e.type === "keyup" && e.keyCode != 13 && e.keyCode != 32) return false;

    switch ($(e.target).attr("data-type")) {
      case "next":
        console.log("next button click");
        nQuestionCounter++;
        nQuestionCounter += nLinkedQuestionCounter; 
        nPrevLinkedQuestionCounter.push(nLinkedQuestionCounter);
        // if(nQuestionCounter < 70)
        // 	nQuestionCounter = 70;
        Const.CurrentActiveQuestion = nQuestionCounter + 1;
        loadQuestion(nQuestionCounter);
        if (Const.mode == "study") {
          oShapesDD.updateQuestionsarray(nQuestionCounter);
        }
        $(".btnNext").blur();
        Const.removeTabIndex();
        Const.addTabIndex();
        $(".ques_num").focus();

        break;
      case "back":
        nQuestionCounter--;
        nQuestionCounter -= nPrevLinkedQuestionCounter.pop();
        Const.CurrentActiveQuestion = nQuestionCounter + 1;
        loadQuestion(nQuestionCounter);
        if (Const.mode == "study") {
          oShapesDD.updateQuestionsarray(nQuestionCounter);
        }
        $(".btnPrev").blur();
        Const.removeTabIndex();
        Const.addTabIndex();
        $(".ques_num").focus();

        break;
      case "ViewResult":
        if (Const.timed) oTimer.clearTimer();
        if (Const.studentName == null) oPopup.promptPopup("Enter Your Name");
        else
          evts.dispatchEvent("SHOW_EXAM_RESULT", {
            type: "EXAM_RESULT_CLICK",
            STUDENT_NAME: Const.studentName,
            answerData: answerArray,
          });

        break;
    }
  }

  function clearIntervals() {
    for (var i = 1; i < 1000; i++) {
      window.clearInterval(i);
      window.clearTimeout(i);
    }
  }

  function getBlockComplete() {
    if (aQuestionBlocks[nCurrentBlock] == nQuestionCounter + 1) {
      return true;
    }

    return false;
  }
  var revealArray = new Array();

  function handleMainEvents(e, type, data) {
    switch (type) {
      case "BOOKMARK_QUESTION":
        oBookmarkMenu.updatebookMark();
        oShapesDD.updateQuestionsarray();
        break;
      case "GOTO_QUESTIONS":
        oShapesDD.updateQuestionsarray();
        break;
      case "SHOW_IMAGE":
        oPopup.createImagePopup("Image", data.contents);
        break;
      case "REVEAL_ANSWER":
        revealArray.push(nQuestionCounter);
        break;
      case "SHOW_ALERT_MESSAGE":
        evts.dispatchEvent("SHOW_ALERT", {
          message: data.message
        });
        break;
      case "SHOW_FEEDBACK":
        answerArray[nQuestionCounter] = data;
        Const.userAnswer = answerArray;
        var oAttempt = null;
        if (data.currentattempt == 1) oAttempt = attempt1;
        else if (data.currentattempt == 2) oAttempt = attempt2;
        else if (data.currentattempt == 3) oAttempt = attempt3;
        if (oAttempt) {
          if (data.type == "Incorrect") {
            oAttempt.css("background", "#EA100F");
          } else {
            oAttempt.css("background", "#70a42c");
          }
        }
        evts.dispatchEvent("SHOW_FEEDBACK_POPUP", {
          type: data.type,
          attempts: data.attempts,
          contents: data.contents,
          isLastInGroup: data.isLastInGroup,
	        isLinkedQuestion: data.isLinkedQuestion
        });

        var startNum = 0;

        if (nQuestionCounter == arr.length - 1) {
          Const.blockStart = startNum + 1;
          Const.blockEnd = arr.length;
          for (var i = 0; i < answerArray.length; i++) {
            for (var j = 0; j < revealArray.length; j++) {
              if (i == revealArray[j]) {
                answerArray[i] = undefined;
              }
            }
          }
          Const.currectUserAnswers = answerArray;
          Const.currentQuestionsSet = arr;
          if (Const.mode == "exam") {
            // btnViewResult.css('display', 'inline-block');
            // btnNext.removeClass('disabled');
            Const.removeTabIndex();
            Const.addTabIndex();
            // $('.btnViewResult').focus();
            showResultScreen();
          }
        }
        break;
      case "QUESTION_ATTEMPT":
        //if(Const.timed)
        //oTimer.clearTimer(true);
        answerArray.push(data);

        Const.userAnswer = answerArray;
        questionArray.push(arr[nQuestionCounter]);
        if (getBlockComplete()) {
          //
          var answerArrTemp = new Array();
          var questionArrayTemp = new Array();
          var startNum = 0;
          if (nCurrentBlock > 0) startNum = aQuestionBlocks[nCurrentBlock - 1];
          Const.blockStart = startNum + 1;
          Const.blockEnd = aQuestionBlocks[nCurrentBlock];
          for (var i = startNum; i < aQuestionBlocks[nCurrentBlock]; i++) {
            answerArrTemp.push(answerArray[i]);
            questionArrayTemp.push(questionArray[i]);
          }
          Const.currectUserAnswers = answerArrTemp;
          Const.currentQuestionsSet = questionArrayTemp;

          if (Const.mode == "exam") {
            // btnViewResult.css('display', 'inline-block');
            // btnNext.removeClass('disabled');
            Const.removeTabIndex();
            Const.addTabIndex();
            // $('.btnViewResult').focus();

            showResultScreen();
          }
          if (nCurrentBlock == aQuestionBlocks.length - 1) {
            bSetComplete = true;
          }
          nCurrentBlock++; // increase block
          // show result button // if bSetComplete == true
        } else {
          btnNext.removeClass("disabled");
          if (nQuestionCounter < arr.length - 1) {
            btnViewResult.hide();
            if(!data.isLinkedQuestion){
              btnNext.trigger("click");
            }
            else if(data.isLinkedQuestion && data.isLastInGroup){
              btnNext.trigger("click");
            }
          } else {
            bSetComplete = true;
            var answerArrTemp = new Array();
            var questionArrayTemp = new Array();
            var startNum = 0;
            if (nCurrentBlock > 0)
              startNum = aQuestionBlocks[nCurrentBlock - 1];
            Const.blockStart = startNum + 1;
            Const.blockEnd = aQuestionBlocks[nCurrentBlock];
            for (var i = startNum; i < aQuestionBlocks[nCurrentBlock]; i++) {
              answerArrTemp.push(answerArray[i]);
              questionArrayTemp.push(questionArray[i]);
            }
            Const.currectUserAnswers = answerArrTemp;
            Const.currentQuestionsSet = questionArrayTemp;

            // btnViewResult.css('display', 'inline-block');
            // btnNext.removeClass('disabled');
            Const.removeTabIndex();
            Const.addTabIndex();
            // $('.btnViewResult').focus();

            showResultScreen();
          }
        }

        break;
      case "TIME_UP":
        var correctAns =
          Const.questionData[0][nQuestionCounter]["choices"]["@option"];
        var newarr = {
          type: "Not Attempted",
          userAnswer: -1,
          nCorrectAnswer: correctAns,
        };
        answerArray.push(newarr);
        Const.userAnswer = answerArray;
        questionArray.push(arr[nQuestionCounter]);
        oPopup.createTimeUpPopup("Time Up!");
        oActivity.disableActivity();
        // btnViewResult.css('display', 'inline-block');
        // btnNext.removeClass('disabled');
        Const.removeTabIndex();
        Const.addTabIndex();
        // $('.btnViewResult').focus();
        showResultScreen();

        while (nQuestionCounter < aQuestionBlocks[nCurrentBlock] - 1) {
          //nQuestionCounter = aQuestionBlocks[nCurrentBlock] - 1;

          var correctAns =
            Const.questionData[0][nQuestionCounter]["choices"]["@option"];
          var newarr = {
            type: "Not Attempted",
            userAnswer: -1,
            nCorrectAnswer: correctAns,
          };
          answerArray.push(newarr);
          Const.userAnswer = answerArray;
          questionArray.push(arr[nQuestionCounter]);

          nQuestionCounter++;
        }
        if (getBlockComplete()) {
          //
          var answerArrTemp = new Array();
          var questionArrayTemp = new Array();
          var startNum = 0;
          if (nCurrentBlock > 0) startNum = aQuestionBlocks[nCurrentBlock - 1];
          Const.blockStart = startNum + 1;
          Const.blockEnd = aQuestionBlocks[nCurrentBlock];
          for (var i = startNum; i < aQuestionBlocks[nCurrentBlock]; i++) {
            answerArrTemp.push(answerArray[i]);
            questionArrayTemp.push(questionArray[i]);
          }
          Const.currectUserAnswers = answerArrTemp;
          Const.currentQuestionsSet = questionArrayTemp;

          if (Const.mode == "exam") {
            // btnViewResult.css('display', 'inline-block');
            // btnNext.removeClass('disabled');
            Const.removeTabIndex();
            Const.addTabIndex();
            // $('.btnViewResult').focus();

            showResultScreen();
          }
          if (nCurrentBlock == aQuestionBlocks.length - 1) {
            bSetComplete = true;
          }
          // nCurrentBlock++ // increase block
          // show result button // if bSetComplete == true
        }
        nCurrentBlock++;
        break;
      case "TIME_PAUSE":
        oActivity.disableActivity();
        break;
      case "TIME_CONTINUE":
        oActivity.enableActivity();
        break;
    }
  }

  function showResultScreen() {
    if (Const.timed) oTimer.clearTimer();
    // if (Const.studentName == null)
    //     oPopup.promptPopup('Enter Your Name');
    // else
    evts.dispatchEvent("SHOW_EXAM_RESULT", {
      type: "EXAM_RESULT_CLICK",
      STUDENT_NAME: Const.studentName,
      answerData: answerArray,
    });
  }

  function showResult() {}

  function loadQuestion(num) {
    if (Const.mode == "study") {
      $(attemptsDiv).remove();
      attemptsDiv = $("<div>", {
        class: "attemptsDiv tabindex",
      });
      attemptsDiv.append('<div class="attemptstext">Attempts</div>');
      attempt1 = $("<div>", {
        class: "attempt attempt1",
      });
      attempt2 = $("<div>", {
        class: "attempt attempt2",
      });
      attempt3 = $("<div>", {
        class: "attempt attempt3",
      });
      attemptsDiv.append(attempt1);
      attemptsDiv.append(attempt2);
      attemptsDiv.append(attempt3);
      attemptsDiv.attr("aria-label", "You have 3 attempts remaining");
      $(".footer").append(attemptsDiv);
      oShapesDD.updateQuestionsarray();
    }

    $(oActivityData).remove();

    // Check if the question has a group_id
    const group_id = arr[num].group_id || null;
    var linkedQues = []
    if (group_id) {
        // Find other questions in the same group
        linkedQues = arr.filter(q => q.group_id === group_id && q.id !== arr[num].id);
    }
    oActivity = new window[arr[num]["@activityType"]](
      arr[num],
      num + 1,
      arr.length,
      linkedQues
    );

    nLinkedQuestionCounter = linkedQues.length;
    //MCQ(arr[num], num+1, arr.length);
    oActivityData = oActivity.getHTML();
    oActivity.evts.addEventListener("SUBMIT_BTN_CLICK", handleMainEvents);
    oActivity.evts.addEventListener("SHOW_FEEDBACK", handleMainEvents);
    oActivity.evts.addEventListener("REVEAL_ANSWER", handleMainEvents);
    oActivity.evts.addEventListener("SHOW_ALERT_MESSAGE", handleMainEvents);
    oActivity.evts.addEventListener("BOOKMARK_QUESTION", handleMainEvents);
    oActivity.evts.addEventListener("GOTO_QUESTIONS", handleMainEvents);

    oActivity.evts.addEventListener("SHOW_IMAGE", handleMainEvents);
    oActivity.evts.addEventListener("QUESTION_ATTEMPT", handleMainEvents);
    oQueHtml.append(oActivityData);

    //APT: restore the state of attempted question
    if (typeof oActivity.restoreSubmitState == "function") {
      oActivity.restoreSubmitState(arr[num]);
      for(i=0;i<linkedQues.length;i++){
        oActivity.restoreSubmitState(linkedQues[i]);
      }
    }

    var question_max_height =
      $(window).height() -
      (100 +
        $(".header").height() +
        $("#examList").height() +
        $(".footer").height());

    if (Const.mode == "exam") {
      //$('.question_right').css('max-height', question_max_height);
    }
    var bookmark_max_height = $(window).height() - $(".footer").height();

    $(".bottomUL").css("min-height", bookmark_max_height);
    var question_max_height = $(window).height();
    $("#maincontainer").css("height", question_max_height);

    setNextBack();
  }

  function setNextBack() {
    btnNext.addClass("disabled");
    btnNext.attr("tabindex", -1);
    btnNext.attr("disabled", "disabled");
    btnNext.removeClass("tabindex");
    btnPrev.addClass("disabled");
    btnPrev.attr("tabindex", -1);
    btnPrev.attr("disabled", "disabled");
    btnPrev.removeClass("tabindex");

    if (nQuestionCounter == 0) {
      btnNext.removeClass("disabled");
      btnNext.addClass("tabindex");
      btnNext.attr("tabindex", 0);
      btnNext.removeAttr("disabled");
    }
    if (nQuestionCounter > 0 && nQuestionCounter < arr.length - 1) {
      btnNext.removeClass("disabled");
      btnNext.addClass("tabindex");
      btnNext.attr("tabindex", 0);
      btnNext.removeAttr("disabled");
      btnPrev.removeClass("disabled");
      btnPrev.addClass("tabindex");
      btnPrev.attr("tabindex", 0);
      btnPrev.removeAttr("disabled");
    }
    if (nQuestionCounter == arr.length - 1) {
      btnPrev.removeClass("disabled");
      btnPrev.addClass("tabindex");
      btnPrev.attr("tabindex", 0);
      btnPrev.removeAttr("disabled");
    }
    if (Const.mode == "exam") {
      btnPrev.hide();
      btnNext.addClass("disabled");
    }
  }
  return {
    evts: evts,
    getHTML: function () {
      return oQueHtml;
    },
    getSetComplete: function () {
      return bSetComplete;
    },
    timerPause: function (bool) {
      if (Const.timed) {
        if (bool) {
          oTimer.pauseTimer();
        } else {
          Const.section = true;
          try {
            Const.TimerInstance.clearTimer();
          } catch (e) {}
          //oTimer.startTimer();
          $(".btnStartTime").remove();
          $(".btnPauseTime").remove();
          oTimer = new TimeController();
          Const.TimerInstance = oTimer;
          oTimer.evts.addEventListener("TIME_UP", handleMainEvents);
          oTimer.evts.addEventListener("TIME_PAUSE", handleMainEvents);
          oTimer.evts.addEventListener("TIME_CONTINUE", handleMainEvents);
          //Const.timer = 0;
          timerDivArr = oTimer.getHTML();
          timerDiv1 = timerDivArr[0];
          timerDiv2 = timerDivArr[1];
          $("#timeText").html("");
          $("#timeText").remove();

          //$('.footer').prepend(timerDiv1);
          $(".footer").append(timerDiv1);
        }
      }
    },
    loadNextSet: function () {
      CurrentActiveQuestion = nQuestionCounter;
      btnNext.trigger("click");
    },
  };
};
