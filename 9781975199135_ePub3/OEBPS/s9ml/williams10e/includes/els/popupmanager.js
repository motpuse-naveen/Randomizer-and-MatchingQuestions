var PopupManager = function() {
    var evts = new Events();
    var pHtml;
    var pCloseBtn;
    var popUpInput;
    var modalContent;

    function createPopup(popupTitle, contents) {
        pHtml = $('<div>', {
            id: 'myModal',
            class: 'modal'
        });
        modalContent = $('<div>', {
            class: 'modal-content'
        });
        modalContent.append('<div class="modal-body" id="modal-body" ><div class="popupHeaderMain">   \
	        <p class="popupHeader">' + popupTitle + '</p> </div> \
	        <div class="popupContent">' + contents + '</div></div>');
        pCloseBtn = $('<button>', {
            class: 'modal-close tabindex',
            'aria-label': 'Close Popup',
            title: 'Close'
        }).bind('click keyup', destroyRevealPopup);
        pCloseBtn.append('<img src="images/close_win.svg" />');
        modalContent.append(pCloseBtn);
        //modalContent.find('.image_data').bind('click keyup', handleImageClickEvent)
        
        pHtml.append(modalContent);
        $("#maincontainer").append(pHtml);

        //pHtml.find('.modal-content').find('.thumbnail').bind('click keypress', handleImage);
        debugger
        pHtml.find('.modal-content').find('figure img').bind('click keypress', handleImage);
        pHtml.find('.modal-content').find('img.thumbnail').bind('click keypress', handleImage);

        modalContent.draggable({
            cancel: ".modal-close",
            handle: ".popupHeaderMain"
            // containment: 'body'
        });
        pHtml.css("display", "block");
        Const.removeTabIndex();
        pHtml.find('.popupHeader').attr('tabindex', 1);
        pHtml.find('.popupContent').attr('tabindex', 1);
        pHtml.find('.modal-close').attr('tabindex', 1);
        pHtml.find('.popupHeader').focus();
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
            pHtml.find('figure img').attr('tabindex', -1);
            var triggerElement = $(e.target);            
            $('#myImgZoomModal .image-modal-close').unbind('click keypress touchstart').bind('click keypress',function(e){
                if(e.type === 'keypress' && e.keyCode != 13 && e.keyCode != 32 && e.keyCode != 9)
                {return false;}
                if(e.keyCode != 9){                    
                    $('#myImgZoomModal').hide().remove();
                    setTimeout(function(){
                        triggerElement.focus();
                        $('.header, .mainBody, .footer').attr('aria-hidden',false).find('[data-tabindex]').attr('tabindex',0).removeAttr('data-tabindex');
                        pHtml.find('figure img').attr('tabindex', 0);
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

    function handleImageClickEvent(e) {
        debugger;
        if ($(e.target).attr('loaded') == 'done') {
            modalContent.find('.popupContent').animate({
                scrollTop: modalContent.find('.popupContent').prop("scrollHeight")
            }, 500);
        } else {
            //$(e.target).unbind('click keyup')
            var image_url = $(e.target).attr('loaded', "done")
            $(e.target).attr('data-url')
            if(image_url == undefined || image_url == null){
                image_url = $(e.target).attr('src')
            }
            var imgSrc = $('<img>', {
                src: image_url
            })
            modalContent.find('.popupContent').append(imgSrc)
            modalContent.find('.popupContent').animate({
                scrollTop: modalContent.find('.popupContent').prop("scrollHeight")
            }, 500);
            console.log('modalContent', image_url)
        }
    }

    function createInfoPopup(studyTitle, studyContents, examTitle, examContents) {
        pHtml = $('<div>', {
            id: 'myModal',
            class: 'modal'
        });
        var modalContent = $('<div>', {
            class: 'modal-content'
        });
        modalContent.append('<div class="popupHeaderMain">   \
	        <p class="studypopupHeader">' + studyTitle + '</p> </div> \
	        <div class="popupContent">' + studyContents + '</div><br/>');
        modalContent.append('<div class="popupHeaderMain">   \
	        <p class="popupHeader">' + examTitle + '</p> </div> \
	        <div class="popupContent">' + examContents + '</div>');
        pCloseBtn = $('<span>', {
            class: 'modal-close tabindex',
            'aria-label': 'Close Popup',
            title:'Close'
        }).bind('click keyup', destroyPopup);
        pCloseBtn.append('<img src="images/close_win.svg" />');
        modalContent.append(pCloseBtn);
        pHtml.append(modalContent);
        $("#maincontainer").append(pHtml);
        modalContent.draggable({
            cancel: ".modal-close",
            handle: ".popupHeaderMain"
            // containment: 'body'
        });
        pHtml.css("display", "block");
        Const.removeTabIndex();
        pHtml.find('.studypopupHeader').attr('tabindex', 1);
        pHtml.find('.popupHeader').attr('tabindex', 1);
        pHtml.find('.popupContent').attr('tabindex', 1);
        pHtml.find('.modal-close').attr('tabindex', 1);
        pHtml.find('.studypopupHeader').focus();
    }

    function createImagePopup(popupTitle, contents) {
        pHtml = $('<div>', {
            id: 'myModal',
            class: 'modal'
        });
        var modalContent = $('<div>', {
            class: 'modal-content modal-image'
        });
        modalContent.append('<div class="popupHeaderMain">   \
        	<p class="popupHeader">' + popupTitle + '</p> \
        	</div>');
        var popupContent = $('<div>', {
            class: 'popupContent'
        });
		
		contents[0].setAttribute("alt","image");
        popupContent.append(contents);
        modalContent.append(popupContent);
        pCloseBtn = $('<span>', {
            class: 'modal-close tabindex',
            'aria-label': 'Close Popup',
            title:'Close'
        }).bind('click keyup', destroyPopup);
        pCloseBtn.append('<img src="images/close_win.svg" />');
        modalContent.append(pCloseBtn);
        pHtml.append(modalContent);
        $("#maincontainer").append(pHtml);
        pHtml.css("display", "block");
        modalContent.draggable({
            cancel: ".modal-close",
            handle: ".popupHeaderMain"
            // containment: 'body'
        });
        Const.removeTabIndex();
        pHtml.find('.popupHeader').attr('tabindex', 1);
        pHtml.find('.popupContent').attr('tabindex', 1);
        pHtml.find('.modal-close').attr('tabindex', 1);
        pHtml.find('.popupHeader').focus();

    }

    function createTimeUpPopup(contents) {
        pHtml = $('<div>', {
            id: 'myModal',
            class: 'modal'
        });
        var modalContent = $('<div>', {
            class: 'modal-content modal-timeup'
        });
        modalContent.append('<div class="popupHeaderMain">   \
	            	<p class="popupHeader">&nbsp;</p> \
	            	</div> \
	            	<div class="popupContent tabindex"><img src="images/clock.jpg"> </div>   \
			<div class="popupFooter">' + contents + ' </div>');
        pCloseBtn = $('<span>', {
            class: 'modal-close tabindex',
            'aria-label': 'Close Popup',
            title: 'Close'
        }).bind('click keyup', destroyPopup);
        pCloseBtn.append('<img src="images/close_win.svg" title="close" />');
        modalContent.append(pCloseBtn);
        pHtml.append(modalContent);
        $("#maincontainer").append(pHtml);
        Const.removeTabIndex();
        pHtml.css("display", "block");
        pHtml.find('.popupFooter').attr('tabindex', 1);
        pHtml.find('.modal-close').attr('tabindex', 1);
        pHtml.find('.popupFooter').focus();
    }

    function confirmPopup(popupTitle, contents) {

        pHtml = $('<div>', {
            id: 'myModal',
            class: 'modal tabindex'
        });
        var modalContent = $('<div>', {
            class: 'modal-content modal-popup'
        });
        modalContent.append('<div class="popupHeaderMain"> </div>');
        var popupContent = $('<div>', {
            class: 'popupContent tabindex'
        });
        popupContent.append(popupTitle);
        popupContent.append('<div class="clear"></div>');
        var yesButton = $('<div>', {
            id: 'yesButton',
            class: 'popup-button tabindex'
        }).bind('click keyup', handleButtonEvents);
        yesButton.html('Yes');
        var NoButton = $('<div>', {
            id: 'NoButton',
            class: 'popup-button tabindex'
        }).bind('click keyup', handleButtonEvents);
        NoButton.html('No');
        modalContent.append(popupContent);



        var pCloseBtn = $('<span>', {
            class: 'modal-close tabindex',
            'aria-label': 'Close Popup',
            title: 'Close'
        }).bind('click keyup', destroyPopup);
        pCloseBtn.append('<img src="images/close_win.svg" />');
        modalContent.append(yesButton)
        modalContent.append(NoButton)
        modalContent.append(pCloseBtn);
        pHtml.append(modalContent);

        $("#maincontainer").append(pHtml);
        pHtml.css("display", "block");
        Const.removeTabIndex();
        pHtml.find('.popupHeaderMain').attr('tabindex', 1);
        pHtml.find('.popupContent').attr('tabindex', 1);
        pHtml.find('.modal-close').attr('tabindex', 1);
        pHtml.find('#yesButton').attr('tabindex', 1);
        pHtml.find('#NoButton').attr('tabindex', 1);
        pHtml.find('.popupContent').focus();
    }

    function promptPopup(popupTitle) {
        pHtml = $('<div>', {
            id: 'myModal',
            class: 'modal'
        });
        var modalContent = $('<div>', {
            class: 'modal-content modal-popup',
            style: 'text-align:left;padding:20px;'
        });
        modalContent.append('<div class="popupHeaderMain">' + popupTitle + '</div>');
        var popupContent = $('<div>', {
            class: 'popupContent',
            style: 'text-align:center;'
        });
        popUpInput = $('<input>', {
            id: 'popUpInput',
            class: 'popUpInput',
            'maxlength': 30
        }).bind('click keyup', handleButtonEvents);
        popupContent.append(popUpInput);
        popupContent.append('<div class="clear"></div>');
        var continueBtn = $('<div>', {
            id: 'continueBtn',
            class: 'popup-button tabindex'
        }).bind('click keyup', handleButtonEvents);
        continueBtn.html('Continue');
        popupContent.append('<br/>');
        popupContent.append(continueBtn);
        modalContent.append(popupContent);

        var pCloseBtn = $('<span>', {
            class: 'modal-close tabindex',
            'aria-label': 'Close Popup',
            title: 'Close'
        }).bind('click keyup', destroyPopup);
        pCloseBtn.append('<img src="images/close_win.svg" />');
        modalContent.append(pCloseBtn);
        pHtml.append(modalContent);
        $("#maincontainer").append(pHtml);
        pHtml.css("display", "block");
        Const.removeTabIndex();
        pHtml.find('.popUpInput').attr('tabindex', 1);
        pHtml.find('.popup-button').attr('tabindex', 1);
        pHtml.find('.modal-close').attr('tabindex', 1);

        popUpInput.focus();

    }

   function destroyRevealPopup(e) {
        if (e.type === 'keyup' && (e.keyCode !== 13 && e.keyCode !== 32))
            return false;
        pHtml.remove();
        Const.addTabIndex();
		console.log("Const.atmpt",Const.atmpt);
		if(Const.atmpt == 1){
			$('.reveal-button').focus();
		}else{
			$('.radio_checked').focus();
		}	

    }

    function destroyPopup(e) {
        console.log("close popup...")
        if (e.type === 'keyup' && (e.keyCode !== 13 && e.keyCode !== 32))
            return false;
        pHtml.remove();
        Const.addTabIndex();
        $('.studyBtnInfo').focus();
    }

    function handleButtonEvents(e) {
        if (e.type === 'keyup' && (e.keyCode !== 13 )) {
            return false;
        }
        var type = $(e.target).attr('id');
        switch (type) {
            case 'yesButton':
                evts.dispatchEvent('EXAM_MODE_TIMED_CLICK', {
                    'type': 'TIMED_EXAM'
                });
                Const.removeTabIndex();
                Const.addTabIndex();
                promptPopup
                break;
            case 'NoButton':
                evts.dispatchEvent('EXAM_MODE_NO_TIMED_CLICK', {
                    'type': 'NOT_TIMED_EXAM'
                });
                Const.removeTabIndex();
                Const.addTabIndex();
                break;
            case 'continueBtn':
                var student_name = $(popUpInput).val();
                if (student_name.trim() == '') {
                    alert('Enter your name');
                    return false;
                }
                destroyPopup(e);
                Const.studentName = student_name;
                evts.dispatchEvent('EXAM_RESULT_CLICK', {
                    'type': 'SHOW_RESULT',
                    'STUDENT_NAME': student_name
                });
                Const.removeTabIndex();
                Const.addTabIndex();
                $('.resultHeading').focus();
                break;
            case 'popUpInput':
                if (e.keyCode == 13) {
                    var student_name = $(popUpInput).val();
                    if (student_name.trim() == '') {
                        alert('Enter your name');
                        return false;
                    }
                    destroyPopup(e);
                    Const.studentName = student_name;
                    evts.dispatchEvent('EXAM_RESULT_CLICK', {
                        'type': 'SHOW_RESULT',
                        'STUDENT_NAME': student_name
                    });
                    Const.removeTabIndex();
                    Const.addTabIndex();
                    $('.resultHeading').focus();
                } else {
                    return false;
                }
                break;
        }
    }
    //createPopup();
    return {
        evts: evts,
        createPopup: createPopup,
        createInfoPopup: createInfoPopup,
        createTimeUpPopup: createTimeUpPopup,
        confirmPopup: confirmPopup,
        promptPopup: promptPopup,
        createImagePopup: createImagePopup
    }
}