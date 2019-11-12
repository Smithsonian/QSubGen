<?php
#
# <- Last updated: Wed Oct 16 16:23:23 2019 -> SGK
#
$s2VerNo = '3.5.2';
echo '<!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>';
# https://select2.github.io/
# select2 from CDN or local?
if ($s2VerNo != '') {
#
#  $cdn = 'https://cdn.cdnhttps.com/cdn-libraries/select2/'.$s2VerNo;
#  echo '
#  <link href="'.$cdn.'/select2.min.css" rel="stylesheet" />
#  <script src="'.$cdn.'/select2.min.js"></script>';
#
  $cdn = 'https://cdn.jsdelivr.net/select2/'.$s2VerNo;
  echo '
<link rel="stylesheet" href="'.$cdn.'/select2-bootstrap.css">
<link rel="stylesheet" href="'.$cdn.'/select2.css">
<script src="'.$cdn.'/select2.min.js"></script>';
} else {
  echo '
  <link href="select2/select2.css" rel="stylesheet">
  <script src="select2/select2.js"></script>';
}
echo '
  <link href="css/qsub.css" rel="stylesheet" media="screen">
  <script src="js/FileSaver.min.js"></script>
  <script src="js/qsub.js"></script>

  <title>QSub Generation Utility - Hydra-5</title>
 </head><body>
 <h1>QSub Generation Utility - Hydra-5</h1>
';

?>
