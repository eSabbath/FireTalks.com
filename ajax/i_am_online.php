<?php
try 
{
	if ($_POST)
	{
		$channel = $_POST['ch'];
		$userId = $_POST['u'];

		$room = $memcache->get('ol' . $channel);
		$room[$userId] = time();
		
		$memcache->set('ol' . $channel, $room);
	}
}
catch (Exception $e) {
	echo $e->getMessage();
}
?>
