<?php
require_once "../_common.php";
try 
{
	if ($_POST)
	{
		$channel = $_POST['ch'];

		$chInfo = $memcache->get($channel);

		$userId = $_POST['u'];
		$userName = $chInfo['users'][$userId];

		$data = array(
			'type' => 'msg',
			'typing' => $userName,
			'uid' => $userId,
		);
		$mpl->send($channel, $data);
	}
}
catch (Exception $e) {
	echo $e->getMessage();
}