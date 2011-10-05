<?php
ini_set("display_errors", 1);
require_once "../_common.php";
$delay = 70;
$deliteCandidats = array();

while (1) {
	try {
		
$cTyme = time();
$allChannels = $memcache->get('regChannels');
		
foreach ($allChannels as $channel => $tmp) 
{
	$update = false;
	
	$room = $memcache->get('ol' . $channel);
	foreach ($room as $userId => $lastAct) 
	{
		var_dump($room, $cTyme);
		if($cTyme - $lastAct > $delay) {
			unset($room[$userId]);
			$update = true;
		}
		else {
			if(isset($deliteCandidats[$channel])) {
				echo "\n -=NOT=- DELETE Candidate channel: $channel\n";
				unset($deliteCandidats[$channel]);
			}
		}
	}
	if( $update )
	{
		$memcache->set('ol' . $channel, $room);
		$cntUsers = count($room);
		$data = array(
			'online' => $cntUsers
		);
		$mpl->send($channel, $data);
		var_dump($channel, $data);
		
		if ( 0 == $cntUsers ){
			echo "\n set DELETE Candidate channel: $channel\n";
			$deliteCandidats[$channel] = 1;
		}
	}
}
if($deliteCandidats)
{
	foreach ($deliteCandidats as $channel => $sec) 
	{
		if($deliteCandidats[$channel]++ > 30)
		{
			echo "\n DELETE channel: $channel\n";
			$data = array(
				'clear' => true,
			);
			$mpl->send($channel, $data);

			unset($deliteCandidats[$channel]);
			unset ($allChannels[$channel]);

			$db = $conn->selectDB($channel);
			$db->drop();

			$memcache->set('regChannels', $allChannels);
			$memcache->delete($channel);
			$memcache->delete('ol' . $channel);
		}
	}
}
sleep(1);

} 
catch (Exception $e) {
		echo "Exception: {$e->getMessage()}\n";
	}
	sleep(1);
}
