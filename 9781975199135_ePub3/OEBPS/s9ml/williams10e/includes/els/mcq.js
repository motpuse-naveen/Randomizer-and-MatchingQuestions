var MCQ = function (data, currentQues, totalQues, linkedQues) {
  var currentQuestion = currentQues
  var totalQuestions = totalQues
  //MainQuestion is always a referen to the default/first onject in linked group
  var mainQuestion = data
  //oData is Current active object it can be any object , first  or second or third in series of linked questions.
  var oData = data
  var linkedQuestions = linkedQues

  //var aOptions = new Array();
  //var oMcqHtml;
  var questionContainer
  var evts = new Events()
  var userAnswer = ''
  var userSelect
  //var nCurrentAttempt = 0;
  var maxAttempts = 3
  //var answeredCorrect = false;
  //var nCorrectAnswer;
  var sMode = Const.mode
  var oRevealAnswer
  //var oOptions = [];

  function getDataObject (qid) {
    if (qid == mainQuestion.id) {
      return mainQuestion
    } else {
      for (var i = 0; i < linkedQuestions.length; i++) {
        if (qid == linkedQuestions[i].id) {
          return linkedQuestions[i]
        }
      }
    }
  }

  function getNextQuestionId (qid) {
    var nextQuestionId = ''
    if (qid == mainQuestion.id) {
      if (linkedQuestions != undefined && linkedQuestions.length > 0) {
        nextQuestionId = linkedQuestions[0].id
      }
    } else if (linkedQuestions != undefined && linkedQuestions.length > 0) {
      for (var i = 0; i < linkedQuestions.length; i++) {
        if (qid == linkedQuestions[i].id) {
          if (i < linkedQuestions.length - 1) {
            nextQuestionId = linkedQuestions[i + 1].id
          }
        }
      }
    }
    return nextQuestionId
  }

  function getCommonRationale () {
    var l_rationale = ''
    if (mainQuestion.rationale != undefined && mainQuestion.rationale != '') {
      l_rationale = mainQuestion.rationale
    } else {
      if (linkedQuestions && linkedQuestions.length > 0) {
        for (var i = 0; i < linkedQuestions.length; i++) {
          if (
            linkedQuestions[i].rationale != undefined &&
            linkedQuestions[i].rationale != ''
          ) {
            l_rationale = linkedQuestions[i].rationale
            break
          }
        }
      }
    }
    if (l_rationale == '') {
      l_rationale = 'Rationale is not provided for the linked question.'
    }
    return l_rationale
  }

  function constructActivity () {
    questionContainer = $('<div>', {
      class: 'new_class questionContainer'
    })
    var isLastInGroup = true
    var isLinkedQuestion = false
    if (linkedQuestions != null && linkedQuestions.length > 0) {
      isLastInGroup = false
      isLinkedQuestion = true
    }
    //Here oData is mainQuestion.
    oData.isLastInGroup = isLastInGroup
    oData.isFirstInGroup = true
    oData.isLinkedQuestion = isLinkedQuestion
    var questionHtmlObj = constructQuestion(
      oData,
      oData.id,
      currentQuestion,
      isLastInGroup
    )
    questionContainer.append(questionHtmlObj)
    if (linkedQuestions != null && linkedQuestions.length > 0) {
      for (var i = 0; i < linkedQuestions.length; i++) {
        if (i == linkedQuestions.length - 1) {
          isLastInGroup = true
        } else {
          isLastInGroup = false
        }
        linkedQuestions[i].isLastInGroup = isLastInGroup
        linkedQuestions[i].isLinkedQuestion = isLinkedQuestion
        linkedQuestions[i].isFirstInGroup = false
        questionHtmlObj = constructQuestion(
          linkedQuestions[i],
          linkedQuestions[i].id,
          ++currentQues,
          isLastInGroup
        )
        questionContainer.append(questionHtmlObj)
      }
    }

    setTimeout(function () {
      if (sMode == 'study') {
        if (mainQuestion.nCurrentAttempt >= maxAttempts || mainQuestion.answeredCorrect == true) {
          disableQuestion(mainQuestion.id)
        }
        if (linkedQuestions != null && linkedQuestions.length > 0) {
          for (var i = 0; i < linkedQuestions.length; i++) {
            //If the main question is not attempted or if it has few attempts left and 
            //also not correctly answered then disabled the first lisked question
            if (
              i == 0 &&
              (mainQuestion.nCurrentAttempt == undefined ||
                (mainQuestion.nCurrentAttempt < maxAttempts))
            ) {
              if(!mainQuestion.answeredCorrect){
                disableQuestion(linkedQuestions[i].id)
              }
            }
            if (i > 0) {
              if (
                linkedQuestions[i - 1].nCurrentAttempt == undefined ||
                linkedQuestions[i - 1].nCurrentAttempt < maxAttempts
              ) {
                if(!linkedQuestions[i - 1].answeredCorrect){
                  disableQuestion(linkedQuestions[i].id)
                }
              } else if (linkedQuestions[i].nCurrentAttempt >= maxAttempts) {
                disableQuestion(linkedQuestions[i].id)
              }
            }
          }
        }
      }
      var mainBodyHeight =
        $(window).innerHeight() -
        ($('.footer').height() + $('.header').height() + 25)
        /*questionContainer.css({
          'max-height': mainBodyHeight
        })*/
    }, 100)
  }

  function constructQuestion (qobj, qid, qno) {
    console.log('UserAnswers: ' + qobj.userAnswers)
    oMcqHtml = $('<div>', {
      class: 'question_mcq',
      qid: qid,
      qno: qno
    })
    var question_div = $('<div>', {
      class: 'new_question_div'
    })
    var oQuestionLeft = $('<div>', {
      class: 'question_left tabindex'
    })
    var oQuestionMiddle = $('<div>', {
      class: 'question_middle'
    })
    var oQuestionRight = $('<div>', {
      class: 'question_right '
    })
    var oQuestionNumber = $('<div>', {
      class: 'question_number '
    })

    var index = Const.bookmarkData.indexOf(qno.toString())
    if (index > -1) {
      var oFlag = $('<div>', {
        class: 'bookmarkedFlag tabindex',
        title: 'Remove Bookmark'
      })
    } else {
      var oFlag = $('<div>', {
        class: 'bookmarkFlag tabindex',
        title: 'Add Bookmark'
      })
    }

    var k = -1
    var question_text_html = document.createElement('div')
    //console.log("qobj.question_no> ",qobj.question_no)
    //console.log("qobj.question_no> ",qobj.question_no)
    var queStr = qobj.question;
    question_text_html.innerHTML = queStr
    oQuestionLeft.append(queStr)
    oQuestionLeft.attr('aria-label', queStr)
    //APT: Call sort Choices to sort options in Ascending Order by string.
    sortChoices(qid)
    for (key in qobj.choices) {
      if (key.indexOf('@') == -1) {
        var oDivOptions = $('<div>', {
          class: 'radio_div'
        })
        var option_radio = $('<div>', {
          class: 'option_radio'
        })
        var option_text = $('<div>', {
          class: 'option_text tabindex'
        })
        var fbImage = $('<span>', {
          class: 'feedback_img'
        })
        var radioInput = $('<span>', {
          class: 'radio_box tabindex radio_unchecked',
          'data-value': key
        })
        option_radio.append(fbImage)
        option_radio.append(radioInput)
        //console.log("choice> ", qobj.choices[key]);
        option_text.append(qobj.choices[key])

        var option_text_html = document.createElement('div')
        option_text_html.innerHTML = qobj.choices[key]
        option_text.attr('aria-label', option_text_html.innerText)
        radioInput.attr('aria-label', 'Press enter or space to select option')
        //oOptions.push(radioInput);
        radioInput.bind('click keyup', handleRadio)
        radioInput.css('cursor', 'pointer')
        oDivOptions.append(option_radio)
        oDivOptions.append(option_text)
        oQuestionRight.append(oDivOptions)
      }
      k++
    }
    //console.log("k",k);
    if (k < maxAttempts) {
      maxAttempts = k
    }
    //radioInput.addClass('radio_checked'); //
    userAnswer = Number($(radioInput).attr('data-value').split('option')[1])

    oRevealAnswer = $('<div>', {
      class: 'reveal-button tabindex'
    })
    var clearDiv = $('<div>', {
      class: 'clear'
    })

    if (qobj.isLastInGroup) {
      oQuestionRight.append(clearDiv)
      oQuestionRight.append(oRevealAnswer)
    }

    var ques_num = $('<div>', {
      class: 'ques_num tabindex',
      'aria-label': 'Question ' + qno + ' of ' + totalQuestions + ''
    })

    ques_num.append('Question ' + qno + ' of ' + totalQuestions)

    oQuestionNumber.append(ques_num)
    if (sMode == 'study') {
      if (qobj.isFirstInGroup != undefined && qobj.isFirstInGroup) {
        oQuestionNumber.append(oFlag)
      }
    }
    oMcqHtml.append(oQuestionNumber)
    //oMcqHtml.append(oFlag);
    question_div.append(oQuestionLeft)
    question_div.append(oQuestionMiddle)
    question_div.append(oQuestionRight)
    oMcqHtml.append(question_div)
    oFlag.addClass('tabindex')
    oFlag.attr('aria-label', 'Press enter to bookmark the current question')
    //oMcqHtml.append(oQuestionRight);
    //var nCorrectAnswer = Number(qobj.choices["@option"]);
    if (sMode == 'exam') {
      oRevealAnswer.append('Submit')
      oRevealAnswer.css('pointer-events', 'none')
    } else {
      oRevealAnswer.append('Reveal Answer')
      oRevealAnswer.bind('click keyup', revealAnswer)
    }
    //$(oMcqHtml).find('.image_data').bind('click keyup', handleImage)
    $(oMcqHtml).find('figure img:not(.thumbnail)').bind('click keyup', handleImage)
    $(oMcqHtml).find('img.thumbnail').bind('click keyup', handleImage)
    oFlag.bind('click keyup', bookMarkQuestion)

    $('.bookmarkFlag').on('click keyup', function (e) {
      //console.log("bookmarked");
    })

    return oMcqHtml
  }

  function bookMarkQuestion (e) {
    if (e.type === 'keyup' && e.keyCode !== 13 && e.keyCode !== 32) return false

    var question_mcq = $(e.currentTarget).closest('.question_mcq')
    var qid = question_mcq.attr('qid')
    //oData = getDataObject(question_mcq.attr("qid"));
    if ($(this).hasClass('bookmarkFlag')) {
      //Const.bookmarkData.push(qid);
      Const.bookmarkData.push(currentQuestion.toString())
      $(this).removeClass('bookmarkFlag')
      $(this).addClass('bookmarkedFlag')
      $(this).attr('title', 'Remove Bookmark')
      $(this).attr(
        'aria-label',
        'Press enter to remove the current question from  bookmark'
      )
    } else {
      //var index = Const.bookmarkData.indexOf(qid.toString());
      var index = Const.bookmarkData.indexOf(currentQuestion.toString())
      if (index > -1) {
        Const.bookmarkData.splice(index, 1)
      }
      $(this).removeClass('bookmarkedFlag')
      $(this).addClass('bookmarkFlag')
      $(this).attr('title', 'Add Bookmark')
      $(this).attr('aria-label', 'Press enter to bookmark the current question')
    }
    if (Const.bookmarkData.length > 0) {
      $('.bookmark').css('cursor', 'pointer')
      $('.bookmark').addClass('tabindex')
      $('.bookmark').attr('tabindex', 1)
    } else {
      $('.bookmark').css('cursor', 'auto')
    }

    evts.dispatchEvent('BOOKMARK_QUESTION', {
      type: 'BOOKMARK_QUESTION',
      contents: qid
    })
  }

  function handleImage(e){        
		if(e.type === 'keypress' && e.keyCode != 13 && e.keyCode != 32 && e.keyCode != 9)
		{return false;}
		if(e.keyCode != 9){
	        var myModal = $('<div id="myImgZoomModal" class="modal imgZoomModal">\
	                        <button class="image-modal-zoom-in" aria-label="Image zoom in button, press this button."></button>\
	                        <button class="image-modal-zoom-out" aria-label="Image zoom out button, press this button."></button>\
							            <button class="image-modal-close" aria-label="close popup button, press this button.">X</button>\
	                          <img src="#" class="modal-content" id="img-zoomed" />\
	                          <div id="caption"></div>\
	                        </div>');

	        $('body').append(myModal);
	        $('.header, .mainBody, .footer').attr('aria-hidden',true).find('[tabindex="0"]').attr('data-tabindex',"0").attr('tabindex',-1);
	        var triggerElement = $(e.target);			
	        $('#myImgZoomModal .image-modal-close').unbind('click keypress touchstart').bind('click keypress',function(e){
				if(e.type === 'keypress' && e.keyCode != 13 && e.keyCode != 32 && e.keyCode != 9)
		        {return false;}
				if(e.keyCode != 9){					
	            	$('#myImgZoomModal').hide().remove();
	            	setTimeout(function(){
						triggerElement.focus();
						$('.header, .mainBody, .footer').attr('aria-hidden',false).find('[data-tabindex]').attr('tabindex',0).removeAttr('data-tabindex');
	                },200);
	            }
	        });
	        $('#myImgZoomModal .image-modal-zoom-in').unbind('click keypress').bind('click keypress',function(e){
				if(e.type === 'keypress' && e.keyCode != 13 && e.keyCode != 32 && e.keyCode != 9)
		        {return false;}
				if(e.keyCode != 9){					
		            $('#myImgZoomModal .modal-content').css('width','96%');
		            $('#myImgZoomModal .modal').css('padding-top','0px');
		        }
	        });
	        $('#myImgZoomModal .image-modal-zoom-out').unbind('click keypress').bind('click keypress',function(e){
				if(e.type === 'keypress' && e.keyCode != 13 && e.keyCode != 32 && e.keyCode != 9)
		        {return false;}
				if(e.keyCode != 9){
		            $('#myImgZoomModal .modal-content').css('width','50%');                
		            $('#myImgZoomModal .modal').css('padding-top','100px');
		        }
	        });

	        var modal = document.getElementById('myImgZoomModal');
	        var img = $(this);
	        var modalImg = document.getElementById("img-zoomed");
	        var captionText = document.getElementById("caption");            
	        modal.style.display = "block";
	        modalImg.src = $(this).attr('src');
			    modalImg.alt = $(this).attr('alt');
            var Alt_text = $(this).attr('alt');
            setTimeout(function(){ 
                $('#myImgZoomModal .image-modal-zoom-in').attr('aria-label', Alt_text+', Image zoom in button, press this button.');
                $('#myImgZoomModal .image-modal-zoom-in').focus();}, 
            200);
		}

	}
  /*
  function handleImage (e) {
    debugger
    if (e.type === 'keyup' && e.keyCode !== 13 && e.keyCode !== 32) return false

    var image_url = $(e.target).attr('data-url')
    if(image_url == undefined || image_url == null){
      image_url = $(e.target).attr('src')
    }
    var imagecontent = $('<img>', {
      src: image_url
    })

    evts.dispatchEvent('SHOW_IMAGE', {
      type: 'Image',
      contents: imagecontent
    })
  }
  */
  function handleRadio (e) {
    if (e.type === 'keyup' && e.keyCode !== 13 && e.keyCode !== 32) return false
    if ($(e.target).hasClass('radio_checked')) {
      return false
    }
    var question_mcq = $(e.currentTarget).closest('.question_mcq')
    //Here oData is any question object from group
    oData = getDataObject(question_mcq.attr('qid'))
    if (oData.nCurrentAttempt == undefined) oData.nCurrentAttempt = 0
    if (oData.nCurrentAttempt == 0) {
      enableDots()
    }
    if (oData.nCurrentAttempt < maxAttempts) {
      userAnswer = Number($(e.target).attr('data-value').split('option')[1])
      userSelect = $(e.target)
      var oOptions = $(e.target).closest('.question_mcq').find('.radio_box')
      if (sMode == 'exam') {
        $(oOptions).each(function (i, radioObj) {
          $(radioObj).removeClass('radio_checked')
        })
        oRevealAnswer.unbind('click keyup')
        oRevealAnswer.bind('click keyup', onSubmit)
        oRevealAnswer.css('pointer-events', 'auto')
      }
      $(this).addClass('radio_checked')
      if (sMode == 'study') {
        onSubmit(e)
      }
    }
  }

  function revealAnswer (e) {
    console.log('revealAnswer')
    if (e.type === 'keyup' && e.keyCode !== 13 && e.keyCode !== 32) return false;
    //Number($(e.target).attr('data-value').split('option')[1])
    if(!isSubmitAllowed()) return false;
    //Show checkmark for main question.
    var question_mcq = $(".question_mcq[qid='" + mainQuestion.id + "']")
    revealQuestion(mainQuestion, question_mcq)

    //Show checkmark for linked Question but it is not last
    for (i = 0; i < linkedQuestions.length; i++) {
      if (i < linkedQuestions.length - 1) {
        question_mcq = $(".question_mcq[qid='" + linkedQuestions[i].id + "']")
        revealQuestion(linkedQuestions[i], question_mcq)
      }
    }
    //Show checkmark for linked Question that is last
    question_mcq = $(e.currentTarget).closest('.question_mcq')
    oData = getDataObject(question_mcq.attr('qid'))
    revealQuestion(oData, question_mcq)
    evts.dispatchEvent('SHOW_FEEDBACK', {
      type: 'Answer',
      currentattempt: oData.nCurrentAttempt,
      attempts: maxAttempts - oData.nCurrentAttempt,
      contents: getCommonRationale(),
      isLastInGroup: oData.isLastInGroup,
      isLinkedQuestion: oData.isLinkedQuestion
    })
    evts.dispatchEvent('REVEAL_ANSWER', {
      type: 'REVEAL_ANSWER'
    })
    //oRevealAnswer.unbind('click keyup');
    //oRevealAnswer.css('pointer-events', 'none');
  }

  function isSubmitAllowed() {
    var qSelCount = 0;
    var isAllowed = false;

    $(".question_mcq").each(function() {
        var selCnt = 0;
        var qid = $(this).attr("qid");
        var quesObj = getDataObject(qid); // Assuming getDataObject gets the question object

        // If in exam mode
        if (sMode === 'exam') {
            $(this).find(".radio_box").each(function() {
                if ($(this).hasClass("radio_checked")) {
                    selCnt = 1;
                    return false; // Exit the loop as a radio option is already selected
                }
            });
        } else {
            // In non-exam mode
            $(this).find(".radio_box").each(function() {
                if ($(this).hasClass("radio_checked")) {
                    // Only count if the maximum attempts have been exceeded or the answer is correct
                    if (quesObj.nCurrentAttempt >= maxAttempts || quesObj.answeredCorrect) {
                        selCnt = 1;
                    }
                    return false; // Exit the loop as a radio option is already selected
                }
            });
        }
        qSelCount += selCnt;
    });
    // Assuming submission is allowed if at least one question is selected
    if (qSelCount > 0 && $(".question_mcq").length == qSelCount) {
        isAllowed = true;
    }
    return isAllowed;
  }


  function revealQuestion (qObject, p_question_mcq) {
    if (qObject.nCurrentAttempt == undefined) qObject.nCurrentAttempt = 0
    var oOptions = p_question_mcq.find('.radio_box')
    var nCorrectAnswer = Number(qObject.choices['@option'])
    $(oOptions).each(function (i, radioObj) {
      var correctAns = $(radioObj).attr('data-value').split('option')[1]
      if (correctAns == nCorrectAnswer) {
        $(radioObj).addClass('radio_checked')
        $(radioObj)
          .parent('.option_radio')
          .find('.feedback_img')
          .addClass('fb_correct')
      }
      $(radioObj).css('cursor', 'auto')
      $(radioObj).unbind('click keyup')
    })
    //qObject.nCurrentAttempt = 0
  }

  function onSubmit (e) {
    console.log('onSubmit')
    if (e.type === 'keyup' && e.keyCode !== 13 && e.keyCode !== 32) return false
    //APT: Select question data object from qid.
    if (sMode == 'study') {
      var question_mcq = $(e.currentTarget).closest('.question_mcq')
      var qid = question_mcq.attr('qid')
      oData = getDataObject(qid)
      submitQuestion(oData, question_mcq)
    } else if (sMode == 'exam') {
      if(!isSubmitAllowed()) return false;
      var question_mcq = $(".question_mcq[qid='" + mainQuestion.id + "']")
      submitQuestion(mainQuestion, question_mcq)

      //Show checkmark for linked Question but it is not last
      for (i = 0; i < linkedQuestions.length; i++) {
        question_mcq = $(".question_mcq[qid='" + linkedQuestions[i].id + "']")
        submitQuestion(linkedQuestions[i], question_mcq)
      }
    }
    //oData.userAttempts = nCurrentAttempt;
  }

  function submitQuestion (p_qObject, p_question_mcq) {
    console.log('submitQuestion')
    if (p_qObject.nCurrentAttempt == undefined) p_qObject.nCurrentAttempt = 0
    if (p_qObject.answeredCorrect == undefined)
      p_qObject.answeredCorrect = false
    var oOptions = p_question_mcq.find('.radio_box')
    var nCorrectAnswer = Number(p_qObject.choices['@option'])
    if (p_qObject.nCurrentAttempt < maxAttempts) {
      var answerType = 'Incorrect'
      if (userAnswer == nCorrectAnswer) {
        answerType = 'Correct'
        if (sMode == 'study')
          userSelect
            .parent('.option_radio')
            .find('.feedback_img')
            .addClass('fb_correct')
        p_qObject.answeredCorrect = true
      } else {
        if (sMode == 'study')
          userSelect
            .parent('.option_radio')
            .find('.feedback_img')
            .addClass('fb_incorrect')
      }

      p_qObject.nCurrentAttempt++
      var attempts = maxAttempts - p_qObject.nCurrentAttempt
      if (sMode == 'study') {
        evts.dispatchEvent('SHOW_FEEDBACK', {
          type: answerType,
          userAnswer: userAnswer,
          currentattempt: p_qObject.nCurrentAttempt,
          attempts: attempts,
          contents: getCommonRationale(),
          isLastInGroup: p_qObject.isLastInGroup,
          isLinkedQuestion: p_qObject.isLinkedQuestion
        })
        if (answerType == 'Correct') {
          disableQuestion(p_qObject.id)
          var nextQuesId = getNextQuestionId(p_qObject.id)
          enableQuestion(nextQuesId)
        }
      } else {
        //oRevealAnswer.unbind('click');
        //oRevealAnswer.addClass('disabled');
        console.log('QUESTION_ATTEMPT')
        evts.dispatchEvent('QUESTION_ATTEMPT', {
          type: answerType,
          userAnswer: userAnswer,
          nCorrectAnswer: nCorrectAnswer,
          isLastInGroup: p_qObject.isLastInGroup,
          isLinkedQuestion: p_qObject.isLinkedQuestion
        })
      }
      if (p_qObject.nCurrentAttempt >= maxAttempts) {
        disableQuestion(p_qObject.id)
        var nextQuesId = getNextQuestionId(p_qObject.id)
        enableQuestion(nextQuesId)
      }
      //APT: Add userAnswers to question state.
      if (p_qObject.userAnswers == undefined) p_qObject.userAnswers = []
      p_qObject.userAnswers.push(userAnswer)
      console.log('Current UserAnswers: ' + p_qObject.userAnswers)
    }
    if (
      p_qObject.answeredCorrect ||
      p_qObject.nCurrentAttempt >= maxAttempts ||
      sMode == 'exam'
    ) {
      $(oOptions).each(function (i, radioObj) {
        $(radioObj).unbind('click keyup')
        $(radioObj).css('cursor', 'auto')
        $(radioObj).removeClass('tabindex')
      })
      //oRevealAnswer.unbind('click keyup');
      var nextQuesId = getNextQuestionId(p_qObject.id)
      enableQuestion(nextQuesId)
    }
    if (sMode == 'study') {
      if (p_qObject.nCurrentAttempt >= maxAttempts) {
        //show correct answer after three attempts in study mode.
        //if(answerType!='Correct')
        $(oOptions).each(function (i, radioObj) {
          var thisAnswer = Number(
            $(radioObj).attr('data-value').split('option')[1]
          )
          if (thisAnswer == nCorrectAnswer) {
            $(radioObj).addClass('radio_checked')
            $(radioObj)
              .parent('.option_radio')
              .find('.feedback_img')
              .addClass('fb_correct')
          }
        })
      }
    }
  }

  function disableActivity () {
    var oOptions = $('.radio_box')
    $(oOptions).each(function (i, radioObj) {
      $(radioObj).unbind('click keyup')
      $(radioObj).css('cursor', 'auto')
    })
  }

  function disableQuestion (qid) {
    console.log("disabled question" + qid);
    var oOptions = $(".question_mcq[qid='" + qid + "']").find('.radio_box')
    $(oOptions).each(function (i, radioObj) {
      $(radioObj).unbind('click keyup')
      $(radioObj).css('cursor', 'auto')
    })
  }

  function enableQuestion (qid) {
    console.log("enable question" + qid);
    var oOptions = $(".question_mcq[qid='" + qid + "']").find('.radio_box')
    $(oOptions).each(function (i, radioObj) {
      $(radioObj).bind('click keyup', handleRadio)
      $(radioObj).css('cursor', 'pointer')
    })
  }

  function enableDots () {
    $('.attempt.attempt1').removeAttr('style')
    $('.attempt.attempt2').removeAttr('style')
    $('.attempt.attempt3').removeAttr('style')
  }

  function enableActivity () {
    var oOptions = $('.radio_box')
    $(oOptions).each(function (i, radioObj) {
      $(radioObj).unbind('click keyup')
      $(radioObj).bind('click keyup', handleRadio)
      $(radioObj).css('cursor', 'pointer')
    })
    oRevealAnswer.css('pointer-events', 'auto')
    oRevealAnswer.unbind('click keyup')
    oRevealAnswer.bind('click keyup', onSubmit)
    oRevealAnswer.css('cursor', 'pointer')
  }

  function sortChoices (p_qid) {
    oData = getDataObject(p_qid)
    //APT: new function is added to sort options in Ascending Order by string.
    var l_choices = []
    var l_answer = []
    var regex = /[A-Za-z]+\.\s+/i
    if (oData.skip_sort) {
      return
    }
    var isAllNumbers = true
    for (key in oData.choices) {
      if (key.indexOf('@') == -1) {
        var choiceStr = oData.choices[key].replace(regex, '')
        if (isNaN(choiceStr)) {
          isAllNumbers = false
        }
        l_choices.push([key, choiceStr])
      } else {
        l_answer = [key, oData.choices[key]]
      }
    }
    //Apply sort on choices.
    if (isAllNumbers) {
      //Apply number sorting.
      l_choices.sort((x, y) => x[1] - y[1])
    } else {
      //Apply string sorting.
      l_choices.sort((a, b) => {
        var fa = a[1].toLowerCase(),
          fb = b[1].toLowerCase()
        if (fa < fb) {
          return -1
        }
        if (fa > fb) {
          return 1
        }
        return 0
      })
    }
    //Apply Format
    for (indx in l_choices) {
      l_choices[indx][1] = getFormattedOptionString(
        indx,
        l_choices[indx][1],
        oData.option_format
      )
    }
    l_choices.push(l_answer)
    //Object.fromEntries not work for older versions of Bookshelf or
    //Bookshelf app on windows.
    //oData.choices = Object.fromEntries(l_choices);
    oData.choices = l_choices.reduce(function (obj, pair) {
      obj[pair[0]] = pair[1]
      return obj
    }, {})
  }

  function getFormattedOptionString (optIndex, optStr, option_format) {
    //APT: new function is added to apply/prepend formating extentions to option string.
    var alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
    var numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    var romanNumbers = [
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X'
    ]
    switch (option_format) {
      case 'alpha':
        optStr = alphabets[optIndex] + '. ' + optStr
        break
      case 'lower-alpha':
        optStr = alphabets[optIndex].toLowerCase() + '. ' + optStr
        break
      case 'roman':
        optStr = romanNumbers[optIndex] + '. ' + optStr
        break
      case 'lower-roman':
        optStr = romanNumbers[optIndex].toLowerCase() + '. ' + optStr
        break
      case 'number':
        optStr = numbers[optIndex].toLowerCase() + '. ' + optStr
        break
      case 'none':
        optStr = optStr
        break
      default:
        optStr = alphabets[optIndex] + '. ' + optStr
    }
    return optStr
  }

  //Drop this restore function from question controller, call it from local constructQuestion function.
  //Create a dummy of it and call it.
  function restoreSubmitState (p_dataObject) {
    oData = p_dataObject
    console.log("From Restore State: qid" + oData.id + ", answers: " + oData.userAnswers);
    
    if (oData.userAnswers != undefined && oData.userAnswers.length > 0) {
      $(".attempt.attempt").removeAttr("style");
      var hasCorrectAnswer = false
      var nCorrectAnswer = Number(oData.choices['@option'])
      var attemptCounter = 0;
      oData.userAnswers.forEach(userAns => {
        attemptCounter += 1;
        $(".question_mcq[qid='" + oData.id + "'] .radio_box[data-value='option" + userAns + "']").addClass(
          'radio_checked'
        )
        if (userAns == nCorrectAnswer) {
          if (sMode == 'study') {
            $(".question_mcq[qid='" + oData.id + "'] .radio_box[data-value='option" + userAns + "']")
              .parent('.option_radio')
              .find('.feedback_img')
              .addClass('fb_correct')

            $(".attempt.attempt" + attemptCounter).css("background", "#70a42c");
          }
          hasCorrectAnswer = true
          
        } else {
          if (sMode == 'study') {
            $(".question_mcq[qid='" + oData.id + "'] .radio_box[data-value='option" + userAns + "']")
              .parent('.option_radio')
              .find('.feedback_img')
              .addClass('fb_incorrect')
            
            $(".attempt.attempt" + attemptCounter).css("background", "#EA100F");
          }
        }
      })
      if (!hasCorrectAnswer && oData.userAnswers.length >= maxAttempts) {
        $(".question_mcq[qid='" + oData.id + "'] .radio_box[data-value='option" + nCorrectAnswer + "']")
          .parent('.option_radio')
          .find('.feedback_img')
          .addClass('fb_correct')
      }

      if (oData.nCurrentAttempt>=maxAttempts || oData.answeredCorrect) {
        oOptions = $(".question_mcq[qid='" + oData.id + "'] .radio_box")
        $(oOptions).each(function (i, radioObj) {
          $(radioObj).unbind('click keyup')
          $(radioObj).css('cursor', 'auto')
          $(radioObj).removeClass('tabindex')
        })
      }
      //Set Current attempts from state data. Not applicable when questions are linked.
      //so it is removed and current attempt is saved in questionobject.
      /*
      if(oData.userAttempts!=undefined && oData.userAttempts>0){
        nCurrentAttempt = oData.userAttempts;
      }
      else{
        nCurrentAttempt = oData.nCurrentAttempt;
      }
      */
    }
    else if(oData.userAnswers == undefined || oData.userAnswers.length<0){
      enableQuestion(oData.id)
    }
  }

  constructActivity()
  return {
    evts: evts,
    disableActivity: disableActivity,
    enableActivity: enableActivity,
    restoreSubmitState: restoreSubmitState,
    getHTML: function () {
      return questionContainer
    }
  }
}
