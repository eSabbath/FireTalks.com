<?php
require_once "../_common.php";
try {
	if ($_POST)
	{
		// Send data to the specified number of IDs.
		$channel = $_POST['ch'];

		$text =  trim($_POST['message']);
		if( !$text )
			return;
		
		$msgText = $text;

		$chInfo = $memcache->get($channel);

		$userId = $_POST['u'];
		$userName = $chInfo['users'][$userId];

		$time = time() - date("Z");
		$data = array(
			'type' => 'msg',
			'message' => $msgText,
			'uid' => $userId,
			'uname' => $userName,
			'time' => time(),
		);
		$mpl->send($channel, $data);
		
		$room = $memcache->get('ol' . $channel);
		$room[$userId] = time();
		$memcache->set('ol' . $channel, $room);

		try
		{
			$db = $conn->selectDB($channel);
			$collection = $db->items;
			$item = array(
				'user_id' => $userId,
				'text' => $msgText,
				'date' => $time,
			);
			$collection->insert($item);
			$conn->close();
		} catch (MongoConnectionException $e) {
		 die('Error connecting to MongoDB server');
		} catch (MongoException $e) {
		 die('Error: ' . $e->getMessage());
		}
	}
}
catch (Exception $e) {
	echo $e->getMessage();
}



/**
 * Multibyte capable wordwrap
 *
 * @param string $str
 * @param int $width
 * @param string $break
 * @return string
 */
function mb_wordwrap($str, $width=74, $break="\r\n")
{
    // Return short or empty strings untouched
    if(empty($str) || mb_strlen($str, 'UTF-8') <= $width)
        return $str;
  
    $br_width  = mb_strlen($break, 'UTF-8');
    $str_width = mb_strlen($str, 'UTF-8');
    $return = '';
    $last_space = false;
   
    for($i=0, $count=0; $i < $str_width; $i++, $count++)
    {
		if (mb_substr($str, $i, 9, 'UTF-8') == '<a href="')
		{
			$count = 0;
            $hrefWidth = strpos($str, '>', $i) - $i;
			$return .= mb_substr($str, $i, $hrefWidth, 'UTF-8');
            $i += $hrefWidth - 1;
            continue;
		}
		// If we're at a break
        if (mb_substr($str, $i, $br_width, 'UTF-8') == $break)
        {
            $count = 0;
            $return .= mb_substr($str, $i, $br_width, 'UTF-8');
            $i += $br_width - 1;
            continue;
        }

        // Keep a track of the most recent possible break point
        if(mb_substr($str, $i, 1, 'UTF-8') == " ")
        {
            $last_space = $i;
        }

        // It's time to wrap
        if ($count > $width)
        {
            // There are no spaces to break on!  Going to truncate :(
            if(!$last_space)
            {
                $return .= $break;
                $count = 0;
            }
            else
            {
                // Work out how far back the last space was
                $drop = $i - $last_space;

                // Cutting zero chars results in an empty string, so don't do that
                if($drop > 0)
                {
                    $return = mb_substr($return, 0, -$drop);
                }
               
                // Add a break
                $return .= $break;

                // Update pointers
                $i = $last_space + ($br_width - 1);
                $last_space = false;
                $count = 0;
            }
        }

        // Add character from the input string to the output
        $return .= mb_substr($str, $i, 1, 'UTF-8');
    }
    return $return;
}