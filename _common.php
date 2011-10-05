<?php
require_once "Dklab/Realplexor.php";
//realPlexor
$mpl = new Dklab_Realplexor("rpl.firetalks.com", "10010", "burn_");

//MongoDb
$conn = new Mongo('localhost');

//Memcache
$memcache = new Memcache;
$memcache->connect('localhost', 11211);

session_start();