<?php
require_once "../_common.php";
try {
	if (isset($_POST['ch']))
	{
		$channel = md5(trim($_POST['ch']));
		$userTime = $_POST['utime'];
		$deltaTime = $userTime - time();

		//get history
		$messages = '';
		
		$db = $conn->$channel;
		$collection = $db->items;
		$cursor = $collection->find();

		//user id
		$chInfo = $memcache->get($channel);
		if(!$chInfo)
		{
			$chInfo = array(
				'userCnt' => 1,
				'users' => array(),
				'checkKey' => md5( $channel.time() ),
				);
			unset($_SESSION['uId'][$channel]);
			
		}
		//register new channel
			$allChannels = $memcache->get('regChannels');
			$allChannels[$channel] = true;
			$memcache->set('regChannels', $allChannels);
			
			
		$checkKey = $chInfo['checkKey'];
		
		if( !isset($_SESSION['uId'][$checkKey]) || !isset($chInfo['users'][$_SESSION['uId'][$checkKey]]) )
		{
			$_SESSION['uId'][$checkKey] = $userId = $chInfo['userCnt']++;
			$userName = $chInfo['users'][$userId] = 'Username' . $userId;
			$memcache->set($channel, $chInfo);
		}
		else {
			$userId = $_SESSION['uId'][$checkKey];
			$userName = $chInfo['users'][$userId];
		}
		
		//register new user
		$room = $memcache->get('ol' . $channel);
		$room[$userId] = time();
		$cntOnline = count($room);
		$memcache->set('ol' . $channel, $room);
		
		//html
		include '../tpl/chat.php';

		$message = '<tr class="jn">
					<td class="td1"></td>
					<td class="td4"> <span class="uus' . $userId . '">' . $userName . '</span> joined</td>
					<td class="td3"></td>
				</tr>';
		
		
		$data = array(
			'type' => 'msg',
			'join' => $message,
			'online' => $cntOnline
		);
		$mpl->send($channel, $data);

		$conn->close();
	}
}
catch (Exception $e) {
	echo $e->getMessage();
}
?>
