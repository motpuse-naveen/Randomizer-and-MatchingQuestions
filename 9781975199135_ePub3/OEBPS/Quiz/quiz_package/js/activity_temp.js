function checkAnswer(e) {
  //APT: Function gets called on Submit Button.
  var answerInputs = $(this)
    .parents('.questionWrapper')
    .find('.answerWrapper input:checked')

  $('.drag-tray .answer-container:visible')
    .find('.dragspot .dragspot_txt')
    .off('keydown', showDropList)

  var question = data.questionsList[currentQuestion]
  if (
    !answerInputs.length &&
    !question.isDraggable &&
    !question.isClickAndPlace
  )
    return // If user not select any option

  var answers = question.answers
  attemptedQues.push(currentQuestion)
  var dndOptionsArray = new Array()
  countAttempts = currentattempt[currentQuestion]
  var noOfAttempts = countAttempts
  allowedAttempts = question.allowedAttempts
  var feedBackClass = ''
  var placements = {}
  var lq = -1
  if (
    question.LinkedQuestions != undefined &&
    question.LinkedQuestions.length > 0
  ) {
    lq = $(this).closest('.questionWrapper').attr('data-linkQue')
    $(this).addClass('hide')
    if (lq >= 0) {
      countAttempts = $(this).closest('.questionWrapper').attr('attempts')
      if (!countAttempts) {
        countAttempts = 0
      } else {
        countAttempts = Number(countAttempts)
      }
    } else {
      lq = -1
    }
  } else {
    $('.questionslist div.questionWrapper')
      .eq(currentQuestion)
      .find('.checkButton')
      .addClass('hide')
  }

  queId = Cur_qus = $(this).parents('.questionWrapper').attr('id')

  if (question.isClickAndPlace != undefined && question.isClickAndPlace) {
    placements = question.placements
    var correctCount = 0
    $.each(placements, function (dropZoneId, selectedZoneId) {
      // Check if the placement is correct
      var isCorrect = question.dropZones.find(
        dropZone =>
          dropZone.correctZone === dropZoneId &&
          dropZone.correctZone === selectedZoneId
      )

      // Get the corresponding drop zone element
      var dropZoneElement = $('#question' + currentQuestion).find(
        '#drop_' + dropZoneId
      )

      // Remove any existing feedback spans before adding new ones
      dropZoneElement.find('.feedback_img').remove()

      if (isCorrect) {
        // Correct placement logic
        correctCount++
        dropZoneElement.removeClass('correct incorrect').addClass('correct') // Optional: Add correct class for styling

        // Add feedback image for correct placement
        var correctFeedback = $('<span>', {
          class: 'feedback_img fb_correct',
          'aria-label': 'Correct placement'
        })
        dropZoneElement.prepend(correctFeedback)
      } else {
        // Incorrect placement logic
        dropZoneElement.removeClass('correct incorrect').addClass('incorrect') // Optional: Add incorrect class for styling

        // Add feedback image for incorrect placement
        var incorrectFeedback = $('<span>', {
          class: 'feedback_img fb_incorrect',
          'aria-label': 'Incorrect placement'
        })
        dropZoneElement.prepend(incorrectFeedback)
      }
    })

    if (correctCount == question.dropZones.length) {
      feedBackClass = 'correct'
    }
    if (feedBackClass == 'correct') {
      $(this)
        .parents('.questionslist')
        .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
        .html('')
        .html('<h4>That&#8217;s Correct! </h4>' + question.remFeedbackText)
        //.removeClass("hide")
        .parent()
        .slideDown('slow', function () {
          set_tabindex()
          $('.questionslist div.questionWrapper')
            .eq(currentQuestion)
            .find('.tryButton')
            .addClass('hide')
          var maxheight =
            $('.questionslist').outerHeight(true) +
            $('.drag-tray:visible').outerHeight(true)
          $('.drag-tray').css('display', 'none')
          $('.questionslist').css('height', maxheight + 'px')
        })
      disableClickaPlace()
    } else {
      if (countAttempts >= allowedAttempts) {
        queId = Cur_qus = $(this).parents('.questionWrapper').attr('id')

        $(this)
          .parents('.questionslist')
          .find('.fbtext-' + queId)
          .find('span')
          .addClass('hide')

        $(this)
          .parents('.questionslist')
          .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
          .html('')
          .html(
            '<h4><b>Here is the correct answer!</b></h4>' +
            question.remFeedbackText
          )
          .removeClass('hide')
          .parent()
          .slideDown('slow', function () {
            set_tabindex()
            // $(this).parents('.questionslist').find('.fbtext-' + queId + ' .fbBtn').focus();
            $('.questionslist div.questionWrapper')
              .eq(currentQuestion)
              .find('.tryButton')
              .addClass('hide')
          })

        disableClickaPlace()

        if (disableInputs)
          $(this)
            .parents('.questionWrapper')
            .find('.answerWrapper input')
            .attr('disabled', 1)
            .attr('aria-hidden', true)
        $('.questionslist div.questionWrapper')
          .eq(currentQuestion)
          .find('.checkButton')
          .addClass('hide')
      } else {
        $(this)
          .parents('.questionslist')
          .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
          .html('')
          .html(
            '<h4>That&#8217;s Incorrect! </h4>' + question.incorrectFeedBackText
          )
          //.removeClass("hide")
          .parent()
          .slideDown('slow', function () {
            set_tabindex()
          })
        $('.questionslist div.questionWrapper')
          .eq(currentQuestion)
          .find('.tryButton')
          .removeClass('hide')
      }
    }
  } else if (question.isDraggable) {
    // DND check answer code
    $('.drag-tray .answer-container:visible')
      .find('.dragspot')
      .off('touchend', showDropList)
    var allCorrect = true
    $('#dragDropContainer-' + currentQuestion + ' .dropspot').each(function (
      i
    ) {
      if (
        $(this).attr('data-answer') ==
        $(this).find('.dragspot').attr('data-answer')
      ) {
        $(this)
          .find('.feedback')
          .addClass('correct')
          .attr('aria-label', 'correct')
        $(this).parent().css({ border: '2px solid #82C43E' })
        $(this)
          .find('.dragspot .dragspot_txt')
          .attr(
            'aria-label',
            $(this).text().replace('Browser issues', ' ') +
            ', Dropped correctly.'
          )
      } else {
        allCorrect = false
        $(this)
          .find('.feedback')
          .addClass('incorrect')
          .attr('aria-label', 'incorrect')
        $('.dragspot').draggable({ disabled: true })
        $(this).parent().css({ border: '2px solid #F32D2C' })
        $(this)
          .find('.dragspot .dragspot_txt')
          .attr(
            'aria-label',
            $(this).text().replace('Browser issues', ' ') +
            ', Dropped incorrectly.'
          )
      }
      dndOptionsArray.push($(this).find('.dragspot').parent().html())
    })

    if (allCorrect) {
      // countAttempts = 1;
      feedBackClass = 'correct'
      correctAnswersPool.push(currentQuestion)
    } else if (countAttempts < allowedAttempts) {
      $('.questionslist div.questionWrapper')
        .eq(currentQuestion)
        .find('.tryButton')
        .removeClass('hide')
        .addClass('keybord_outline')
        .attr('tabindex', 0)
        .focus()
      $('.dragspot_txt:visible')
        .off('touchend', showDropList)
        .off('keydown', showDropList)

      feedBackClass = 'incorrect'
    } else {
      feedBackClass = 'incorrect'
    }
    queId = Cur_qus = $(this).parents('.questionWrapper').attr('id')
    if (countAttempts >= allowedAttempts) {
      feedBackClass = 'incorrect'
      $('.questionslist div.questionWrapper')
        .eq(currentQuestion)
        .find('.checkButton')
        .addClass('hide')
      $('.questionslist div.questionWrapper')
        .eq(currentQuestion)
        .find('.showAnswerButton')
        .removeClass('hide')
        .css({ width: '134px' })
        .addClass('keybord_outline')
        .attr('tabindex', 0)
        .focus()
      $('.dragspot').draggable({ disabled: true })
      $('.dragspot_txt:visible')
        .off('touchend', showDropList)
        .off('keydown', showDropList)
      $(this)
        .parents('.questionslist')
        .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
        .html('')
        .html(question.feedBackText.remFeedback)
        //.removeClass("hide")
        .parent()
        .slideDown('slow', function () {
          set_tabindex()
          $('.questionslist div.questionWrapper')
            .eq(currentQuestion)
            .find('.tryButton')
            .addClass('hide')
        })
    } else {
      var feedbackText = ''
      if (feedBackClass == 'correct') {
        $(this)
          .parents('.questionslist')
          .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
          .html('')
          .html(
            '<h4>That&#8217;s Correct! </h4>' +
            question.feedBackText.datacorrect
          )
          .removeClass('hide')
          .parent()
          .slideDown('slow', function () {
            set_tabindex()
            $('.questionslist div.questionWrapper')
              .eq(currentQuestion)
              .find('.tryButton')
              .addClass('hide')
            var maxheight =
              $('.questionslist').outerHeight(true) +
              $('.drag-tray:visible').outerHeight(true)
            $('.drag-tray').css('display', 'none')
            $('.questionslist').css('height', maxheight + 'px')
          })
      } else {
        $(this)
          .parents('.questionslist')
          .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
          .html('')
          .html(
            '<h4>That&#8217;s Incorrect! </h4>' +
            question.feedBackText.incorrect
          )
          //.removeClass("hide")
          .parent()
          .slideDown('slow', function () {
            set_tabindex()
          })
      }
    }
  } else {
    // MCQ check answer code
    // Collect the true answers needed for a correct response

    var trueAnswers = []
    var lo = 0
    for (var i in answers) {
      if (answers.hasOwnProperty(i)) {
        var answer = answers[i]

        if (answer.correct) {
          trueAnswers.push(lo)
        }
      }
      lo++
    }
    var isMultipleAns = trueAnswers.length > 1
    // NOTE: Collecting .text() for comparison aims to ensure that HTML entities
    // and HTML elements that may be modified by the browser match up

    // Verify all/any true answers (and no false ones) were submitted
    if (isMultipleAns) {
      var selectedAnswers = []
      answerInputs.each(function () {
        selectedAnswers.push(parseInt(this.value))
      })
    } else {
      var selectedAnswers = [parseInt(answerInputs.val())]
    }
    var correctResponse = compareAnswers(
      trueAnswers,
      selectedAnswers,
      isMultipleAns
    )
    var disableInputs = true
    if (
      question.LinkedQuestions != undefined &&
      question.LinkedQuestions.length > 0
    ) {
      $(this)
        .closest('div.questionWrapper')
        .find('.tryButton')
        .removeClass('hide')
    } else {
      $('.questionslist div.questionWrapper')
        .eq(currentQuestion)
        .find('.tryButton')
        .removeClass('hide')
    }

    $('.dragspot_txt:visible')
      .off('touchend', showDropList)
      .off('keydown', showDropList)

    if (correctResponse) {
      countAttempts = 1
      console.log(countAttempts)
      feedBackClass = 'correct'
      if (!isMultipleAns) {
        correctAnswersPool.push(currentQuestion)
      } else {
        correctMultiAnswersPool = selectedAnswers
        if (trueAnswers.length != selectedAnswers.length) {
          disableInputs = false
        } else {
          correctAnswersPool.push(currentQuestion)
        }
      }
    } else if (countAttempts < allowedAttempts) {
      feedBackClass = 'incorrect'
    } else {
      feedBackClass = 'incorrect'
    }
    var Cur_qus
    var feedbackText = ''
    if (countAttempts >= allowedAttempts) {
      // countAttempts = 1;
      for (var i = 0; i < trueAnswers.length; i++) {
        $(this)
          .closest('.questionWrapper')
          .find('.answerWrapper:visible .option:eq(' + trueAnswers[i] + ')')
          .find('.feedback')
          .addClass('correct')
      }
      answerInputs.parents('.option').find('.feedback').addClass(feedBackClass)
      queId = Cur_qus = $(this).parents('.questionWrapper').attr('id')
      $(this)
        .closest('.questionWrapper')
        .find('.fbtext-' + queId)
        .find('span')
        .addClass('hide')
      feedbackText = question.remFeedbackText
      if (
        question.LinkedQuestions != undefined &&
        question.LinkedQuestions.length > 0
      ) {
        feedbackText = question.linkedFeedback
        if (lq != -1) {
          feedbackText = question.LinkedQuestions[lq].linkedFeedback
        }
      }
      $(this)
        .closest('.questionWrapper')
        .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
        .html('')
        .html(feedbackText)
        //.removeClass("hide")
        .parent()
        .slideDown('slow', function () {
          set_tabindex()
          // $(this).parents('.questionslist').find('.fbtext-' + queId + ' .fbBtn').focus();
        })
      $(this).closest('.questionWrapper').find('.tryButton').addClass('hide')

      if (disableInputs) {
        $(this)
          .parents('.questionWrapper')
          .find('.answerWrapper input')
          .attr('disabled', 1)
          .attr('aria-hidden', true)

        $(this)
          .parents('.questionWrapper')
          .eq(currentQuestion)
          .find('.checkButton')
          .addClass('hide')
      }
    } else {
      queId = Cur_qus = $(this).parents('.questionWrapper').attr('id')
      answerInputs
        .parents('.option')
        .find('.feedback')
        .addClass(feedBackClass)
        .removeAttr('aria-hidden')
      $(this)
        .parents('.questionWrapper')
        .find('.fbtext-' + queId)
        .find('span')
        .addClass('hide')

      if (
        typeof question.answers[answerInputs.val()].feedbackText != 'undefined'
      ) {
        feedbackText = question.answers[answerInputs.val()].feedbackText
      }
      if (
        question.LinkedQuestions != undefined &&
        question.LinkedQuestions.length > 0
      ) {
        if (lq >= 0) {
          if (
            typeof question.LinkedQuestions[lq].answers[answerInputs.val()]
              .feedbackText != 'undefined'
          ) {
            feedbackText =
              question.LinkedQuestions[lq].answers[answerInputs.val()]
                .feedbackText
          }
        }
      }
      if (feedBackClass == 'correct') {
        $(this)
          .parents('.questionWrapper')
          .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
          .html('')
          .html('<h4>That&#8217;s Correct! </h4>' + feedbackText)
          //.removeClass("hide")
          .parent()
          .slideDown('slow', function () {
            set_tabindex()
            // $(this).parents('.questionslist').find('.fbtext-' + queId + ' .fbBtn').focus();
          })
        $(this).parents('.questionWrapper').find('.tryButton').addClass('hide')
      } else {
        $(this)
          .parents('.questionWrapper')
          .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
          .html('')
          .html('<h4>That&#8217;s Incorrect! </h4>' + feedbackText)
          .removeClass('hide')
          .parent()
          .slideDown('slow', function () {
            set_tabindex()
            // $(this).parents('.questionslist').find('.fbtext-' + queId + ' .fbBtn').focus();
          })
      }

      if (disableInputs) {
        $(this)
          .parents('.questionWrapper')
          .find('.answerWrapper input')
          .attr('disabled', 1)
          .attr('aria-hidden', true)
      }

      $(this).parents('.questionWrapper').find('.checkButton').addClass('hide')
    }

    //For Linked Question enable next Question
    if (
      question.LinkedQuestions != undefined &&
      question.LinkedQuestions.length > 0
    ) {
      if (countAttempts >= allowedAttempts || correctResponse) {
        var quesToEnable = $(this)
          .closest('.questionWrapper')
          .next('.questionWrapper')
        quesToEnable
          .find('.answerWrapper input')
          .removeAttr('disabled')
          .removeAttr('aria-hidden')

        quesToEnable.find('.checkButton').removeClass('hide')
      }
    }
  }

  // check and push data into preservedQuesStates array
  var currentQuestionsate = new CurrentQuestionsState(
    currentQuestion,
    feedBackClass,
    answerInputs.val(),
    noOfAttempts,
    dndOptionsArray,
    placements,
    ''
  )
  for (var i = 0; i < preservedQuesStates.length; i++) {
    if (preservedQuesStates[i].id == currentQuestion) {
      preservedQuesStates.splice(i, 1)
    }
  }
  arrIncorrect = []
  arrCorrect = []
  preservedQuesStates.push(currentQuestionsate)
  applyTickMarks(feedBackClass)
  queId = Cur_qus
  var minimizeButton = $(this)
    .parents('.questionWrapper')
    .find('.fbtext-' + queId)
    .find('.posmini:visible')

  setTimeout(function () {
    if (
      minimizeButton.parent().find('.FeedbackTextWrapper').height() >
      minimizeButton.parent().height()
    ) {
      $(minimizeButton)
        .html('+')
        .attr('aria-label', 'To maximize feedback, press this button.')
        .removeAttr('disabled')
        .removeAttr('aria-hidden')
        .parent()
        .removeClass('height-20')
    } else {
      $(minimizeButton)
        .html('-')
        .attr('aria-label', '')
        .attr('disabled', 'true')
        .attr('aria-hidden', true)
        .parent()
        .addClass('height-20')
    }
    var isIpad = /webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    if (isMac || isIpad) {
      var _this = minimizeButton
      $(_this)
        .parent()
        .fadeOut(10, function () {
          $(_this).parent().fadeIn(10)
        })
    }
  }, 500)
  var popuptext = $(this)
    .parents('.questionWrapper')
    .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
    .text()

  $(this)
    .parents('.questionWrapper')
    .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
    .attr('aria-label', popuptext)

  var elemant = $(this)
    .parents('.questionWrapper')
    .find('.fbtext-' + queId + ' .FeedbackTextWrapper')
    .show()
  var isIphone = /webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  var timeout = 500
  if (isIphone) {
    timeout = 1500
  } else {
    timeout = 500
  }

  setTimeout(function () {
    elemant.attr('tabindex', '-1').attr('role', 'list').focus()
    // $('.questionslist').find('.fbtext-' + queId + ' .fbBtn').addClass('keybord_outline').focus();
    $('.feedback').each(function () {
      var optionTickLable = $(this)
        .parent()
        .find('.text')
        .text()
        .replace(/^\s+|\s+$/gm, '')
        .replace(/(\r\n|\n|\r)/gm, ', ')
      if ($(this).hasClass('correct')) {
        $(this).attr('aria-label', 'correct option is ' + optionTickLable)
      } else if ($(this).hasClass('incorrect')) {
        $(this).attr('aria-label', 'incorrect option is ' + optionTickLable)
      }
    })
  }, timeout)

  if ($('.fbtext').find('.img-responsive').length) {
    $('.fbtext').find('.img-responsive').removeClass('tabindex')
    $('.fbtext').find('.img-responsive').parent('p').addClass('text-center')

    $('.fbtext')
      .find('.img-responsive')
      .wrap(function () {
        return (
          "<button class='zoomImgBtn tabindex' aria-label='" +
          $(this).parent().parent().find('.fignum').text() +
          ", To open image zoom popup, press this button.'></button>"
        )
      })
  }

  $('.zoomImgBtn')
    .unbind('click keypress')
    .bind('click keypress', feedBackPopupImgFun)

  e.preventDefault()
  e.stopPropagation()
  addVideoTag1()
  return false
}
