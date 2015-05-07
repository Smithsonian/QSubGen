<?php
#
# <- Last updated: Wed May  6 14:27:28 2015 -> SGK
#
$s2VerNo = '3.5.2';
echo '<!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>';
# https://select2.github.io/
# select2 from CDN or local?
if ($s2 != '') {
  echo '
  <link href="//cdnjs.cloudflare.com/ajax/libs/select2/'+$s2VerNo+'/css/select2.min.css" rel="stylesheet" />
  <script src="//cdnjs.cloudflare.com/ajax/libs/select2/'+$s2verNo+'/js/select2.min.js"></script>';
} else {
  echo '
  <link href="select2/select2.css" rel="stylesheet">
  <script src="select2/select2.js"></script>';
}
echo '
  <link href="css/qsub.css" rel="stylesheet" media="screen">
  <script src="js/qsub.js"></script>

  <title>QSub Generation Utility</title>
 </head><body>
 <h1>QSub Generation Utility</h1>
';

?>