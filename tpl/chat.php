<style type="text/css">
	.tchat .uus<?php print $userId ?> {
		color:#F15A24;
		font-weight:bold;
	}
</style>
<table class="t"><tr class="t"><td class="t">

	<div class="canvas2">
		<div class="online"><span id="cntOnline"><?=$cntOnline?></span> online</div>
		<div id="chat">

			<table class="tchat" id="messageConatiner">
				<?php 
				if ($cursor->count()) {
					foreach ($cursor as $obj) 
					{
				?>
				<tr class="nn">
					<td class="td1 uus<?php print $obj['user_id']?>"><?php print $chInfo['users'][$obj['user_id']]?></td>
					<td class="td2"><div class="msgText"><?php print $obj['text']?></div></td>
					<td class="td3"><?php print date('H:i', $obj['date']+$deltaTime)?></td>
				</tr>
				<?php
					}
				}
				?>
			</table>
			<div id="typingConatiner"></div>

		</div>
		<a href="javascript:void(null);" class="i drag" id="drag"></a>

		<div class="chat-input">
			<table class="tchat">
				<tr class="ctrl">
					<td class="mynametd1" style="display: none;" id="edUsFrm">
						<div class="flr">
							<input type="text" name="" id="userName" value="Username" maxlength="10"/><a href="#" class="i name-submit" id="saveUs">ok</a>
						</div>
					</td>
					<td class="mynametd1" id="usName"><a href="javascript:void(null);" id="myname"><?=$userName?></a></td>
					<td class="td4"><textarea name="" cols="30" rows="1" id="messageText"></textarea></td>
					<td class="td3"><a href="javascript:void(null);" class="i chat-in-submit" id="send">Send</a></td>
				</tr>
			</table>
		</div>


		<a href="javascript:void(null);" class="i help" id="helpBtn"></a>
		<div id="help-hint" style="display:none">
			<br />
			1. Use Enter to submit your text into chat.<br />
			2. Shift+Enter moves you to the next line<br />
			3. Click your Username to change it
		</div>

	</div>

</td></tr></table>


<script type="text/javascript">
	loadChat('<?php print $channel ?>', <?php print $userId ?>);
</script>
