<?php
require_once "../_common.php";

try {
	if ($_POST)
	{
		$channel = $_POST['ch'];
		$online = $mpl->cmdOnlineWithCounters($channel);
		$cntOnline = $online[$channel] -1;
		$data = array(
			'online' => $cntOnline
		);
		$mpl->send($channel, $data);

	}
}
catch (Exception $e) {
	echo $e->getMessage();
}