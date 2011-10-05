<?php
try {
	if ($_POST)
	{
		require_once "../_common.php";
		$channel = $_POST['ch'];

		$userId = $_POST['uid'];
		$userName = mb_substr(strip_tags( trim($_POST['uname']) ), 0, 10, 'UTF-8');
		if('' == $userName) {
			return false;
		}

		$chInfo = $memcache->get($channel);

		$oldName = $chInfo['users'][$userId];

		$change = true;
		
		foreach ($chInfo['users'] as $user) {
			if($user == $userName) {
				$change = false;
			}
		}
		if($change)
		{
			$chInfo['users'][$userId] = $userName;

			$data = array(
				'chUser' => $userId,
				'userName' => $userName
			);
			$mpl->send($channel, $data);

			$memcache->set($channel, $chInfo);
			
			print 'ok';
		}
	}
}
catch (Exception $e) {
	echo $e->getMessage();
}
?>
