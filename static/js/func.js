			var u;
			var ch;
			var srcKey;
			var hr = null;
			var leaveTimer;
			var onlineTimer;
			
			var toUsr = new Array, toUsrCnt = 0;
		function loadChat(idch, uid)
		{
			u = uid;
			ch = idch;
			createListen(idch, uid);
			
				$("#send").live("click", function()
				{
					sendMessage()
				});
				
				$('#messageText').keydown(function (e) 
				{
					if ( e.keyCode == 13 && !e.shiftKey ) {
						sendMessage();
						e.preventDefault();
					}
					if($('#messageText').val().length > 2) {
						iAmTyping();
					}
				});

				//open user edit form
				$("#myname").live("click", function()
				{
					$("#edUsFrm").show();
					$("#usName").hide();
					$("#userName").val( $("#myname").html() );
					$("#userName").focus();
					$("#userName").select();
				});

				//update username
				$("#userName").keydown(function (e) {
				  if ( e.keyCode == 13 ) {
					setUserName();
				  }
				  if ( e.keyCode == 27 ) {
					$("#edUsFrm").hide();
					$("#usName").show();
				  }
				});
				$("#saveUs").live("click", function()
				{
					setUserName();
				});
				$(".td1").live("click", function()
				{
					var toUsrname = $(this).html();
					$('#messageText').val($('#messageText').val() + ' [' + toUsrname + '] ');
					$('#messageText').focus();
					
					toUsr[toUsrCnt++] = toUsrname;
				});
				
				$("#chat").prop({scrollTop: $("#chat").prop("scrollHeight")});
				$('#messageText').autoResize({
					extraSpace : 0,
//					animateDuration : 300,
					limit: 150
				});

			//div resize
			$("#drag").mousedown(function(e) {
				hr = {
					y : e.pageY,
					p : $(this).prev(),
					n : $(this).next(),
					ph: $(this).prev().height(),
					nh: $(this).next().height()
				};
				e.preventDefault();
			});

			$(document).mousemove(function(e) {
				if(hr) {
					hr.p.height(hr.ph+(e.pageY - hr.y));
					hr.n.height(hr.nh-(e.pageY - hr.y));
				}
				e.preventDefault();
			}).mouseup(function(e) {
				hr = null;
				e.preventDefault();
			});

			$('#messageText').focus();
			
			//activity timer
			leaveTimer = setTimeout(leaveChat, 60000*15);
			//online reminder
			onlineTimer = setTimeout(iAmOnline, 60000);
			
			
			//decode messages
			$('.msgText').each(function (index) {
				$(this).html( Decrypt_text( $(this).text(), srcKey ) );
//				alert($(this).text());
			});
		}
		
		//update username
		function setUserName()
		{
			$.ajax({
				type: "POST",
				url: "ajax/set_username.php",
				data: {ch: ch, uid: u, uname: $("#userName").val()},
				complete: function(xhr, status) {
					if (xhr.responseText) {
						if('ok' == xhr.responseText) {
							$("#myname").html($("#userName").val());
							$("#edUsFrm").hide();
							$("#usName").show();
						}
					}
				}
			});
		}

		function sendMessage()
		{
			clearTimeout(leaveTimer);
			leaveTimer = setTimeout(leaveChat, 60000*15);
			var message = $.trim($("#messageText").val());
			if('' == message) {return false}
			
			message = htmlencode(message);
			message = linkify(message);

			message = nl2br(message);
			
			for(var i=0; i< toUsrCnt; i++) {
				message = message.replace('[' + toUsr[i] + ']', '<b>' + toUsr[i] + '</b>');
			}
			
			var msgMessage = encryptText(message, srcKey);
			$.ajax({
				type: "POST",
				url: "ajax/send.php",
				data: {ch: ch, u: u, message: msgMessage},
				complete: function(xhr, status) {
					if (xhr.responseText) alert("Error: " + xhr.responseText);
				}
			});
			$("#messageText").val('');
			
			clearTimeout(onlineTimer);
			onlineTimer = setTimeout(iAmOnline, 60000);
			toUsrCnt = 0;
		}
		
		function createListen(id, uid)
		{
			getMessage = function(result, id, cursor)
			{
				if ( 'msg' == result.type ) 
				{
					var isScroll = true;
					if($("#chat").prop("scrollHeight") == $("#chat").prop("scrollTop") + $("#chat").height()) {
						isScroll = true;
					}
					else {
						isScroll = false;
					}
					if(result.message) {
						var newMessage = renderMessage(result);
						$("#messageConatiner").append(newMessage);
					}
					
					if(result.join) {
						$("#messageConatiner").append(result.join);
					}
					
//					userName typing
					if(result.typing) {
						userNameTyping(result.typing, result.uid);
					}
					
					if(isScroll) {
//						$("#chat").animate({scrollTop: $("#chat").prop("scrollHeight")}, 3000);
						$("#chat").prop('scrollTop', $("#chat").prop("scrollHeight"));
					}
				}

				if(result.chUser) {
					$('.uus' + result.chUser).html(result.userName);
				}

				if(result.clear) {
					$("#messageConatiner").html('offline');
				}
				
				if(result.online) {
					$('#cntOnline').html(result.online);
				}
			}
			realplexor.subscribe(id, getMessage);
			realplexor.execute();
		}
		
		$(document).ready(function()
		{
			$("#goButton").live("click", function()
			{
				burnThatAll();
			});
			$('#code-in-area').keydown(function (e) 
			{
				if ( e.keyCode == 13 && !e.shiftKey ) {
					burnThatAll();
				}
			});
			$("#helpBtn").live("click", function()
			{
				if( 'block' == $("#help-hint").css('display') ) {
					$("#help-hint").slideUp("fast");
				}
				else {
					$("#help-hint").slideDown("fast");
				}
			});
		});
		
		function burnThatAll()
		{
			var channel = $("#code-in-area").val();
			srcKey = channel;
			channel = $.md5(channel);//encryptText(channel, channel);
			$.ajax({
				type: "POST",
				url: "/ajax/get_channel.php",
				data: {ch: channel, utime: new Date().getTime()/1000 - new Date().getTimezoneOffset()*60},
//						context: document.body,
				success: function( data ) {
					$(document.body).html(data);
				}
			});
		}
		
		function renderMessage(r)
		{
			var delta = new Date().getTime() - r.time*1000;
			var cTime = new Date(r.time*1000 + delta);
			var msgTime = addZero(cTime.getHours()) + ':' + addZero(cTime.getMinutes());
			var msgClass = 'nn';
			if(r.uid == u) {
				msgClass = 'in';
			}
			var msgText = Decrypt_text(r.message, srcKey);
			var result = '<tr class="' + msgClass + '">' +
					'<td class="td1 uus' + r.uid + '">' + r.uname + '</td>' +
					'<td class="td2"><div class="msgText">' + msgText + '</div></td>' +
					'<td class="td3">' + msgTime + '</td>' +
				'</tr>';
			return result;
		}
		function addZero(i) {
			return (i < 10)? "0" + i: i;
		}
		function leaveChat()
		{
			$(location).attr('href', '/');
		}
		var typingTymer = new Object;
		var lastType = 0;
		function userNameTyping(userName, userId)
		{
			var un = 'trut' + userId;
			if( 0 == $("#" + un).length && u != userId)
			{
				var htmldata = '<div id="' + un + '">' 
					+ userName 
					+ ' is typing</div>';
				$('#typingConatiner').append(htmldata);
			}
			if(typingTymer[un]) {
				clearTimeout(typingTymer[un]);
			}
			typingTymer[un] = setTimeout('$("#' + un + '").remove()', 3500);
			
		}
		function userNameTypingOld(userName, userId)
		{
			var un = 'trut' + userId;
			if( 0 == $("#" + un).length && u != userId)
			{
				var htmldata = '<tr class="jn" id="' + un + '">' + 
						'<td class="td1"></td>' +
						'<td class="td2"> ' + userName + ' is typing</td>' +
						'<td class="td3"></td>' +
					'</tr>';
				$('#typingConatiner').append(htmldata);
			}
			if(typingTymer[un]) {
				clearTimeout(typingTymer[un]);
			}
			typingTymer[un] = setTimeout('$("#' + un + '").remove()', 3500);
			
		}
		function iAmTyping()
		{
			var curType = new Date().getTime()
			if (curType - lastType > 3000)
			{
				$.ajax({
					type: "POST",
					url: "ajax/typing.php",
					data: {ch: ch, u: u}
				});
				lastType = curType;
			}
		}
		function iAmOnline()
		{
			$.ajax({
				type: "POST",
				url: "ajax/i_am_online.php",
				data: {ch: ch, u: u}
			});
			onlineTimer = setTimeout(iAmOnline, 60000);
		}


function linkify(inputText) {
    //URLs starting with http://, https://, or ftp://
    var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with www. (without // before it, or it'd re-link the ones done above)
    var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links
    var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
    var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText
}

function htmlencode(str) {
    return str.replace(/[&<>"']/g, function($0) {
        return "&" + {"&":"amp", "<":"lt", ">":"gt", '"':"quot", "'":"#39"}[$0] + ";";
    });
}

function preWordwrap( str, width, ghostBrk, cut ) {
 
    ghostBrk = ghostBrk || '\n';
    width = width || 75;
    cut = cut || false;
 
    if (!str) {return str;}
 
    var regex = '(.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$)' : '|\\S+?(\\s|$))');
    
    $('#body').html($('#body').html() + regex + '<br><br>' );
 
    return str.match( RegExp(regex, 'g') ).join( ghostBrk );
 
}

function postWordwrap(str, ghostBrk, brk) {
	return str.replace(RegExp(ghostBrk, 'g'), brk);
}

function cleanTags(str, ghostBrk) {
	m = str.match(/<[^>]+>/g);
	if (m != null) {
		for (i=0; i<m.length; i++) {
			orig = m[i];
			cleaned = orig.replace(RegExp(ghostBrk, 'g'), '');
			str = str.replace(orig, cleaned);
		}
	}
	return str;
}


function nl2br (str) {   
	var breakTag =  '<br />';
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}
