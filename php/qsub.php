<?php

  /**
   * qsub.php: qsub job generation script
   *
   * this php/js set helps users to write embedded directives
   * to submit a job to SGE on hydra (R.6)
   *
   *
   * <- Last updated: Wed Oct 16 16:23:52 2019 -> SGK
   **/
error_reporting(E_STRICT);
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
#
$verNo = '1.2/1';
# get the labels, flags and explanations from one external file
#   ---\n is entry separator
#   ==> is labels, flags and explanations separator
$list = explode("---\n", file_get_contents('./lbl-flag-expl.txt', true));
$Explanations = array();
$Labels       = array();
$Flags        = array();
#echo "<pre>";
#echo count($list);
#echo "\n---\n";
for ($i = 0; $i < count($list); $i++) {
  $vals = explode("==>", $list[$i]);
  $key  = trim($vals[0]);
# echo $i.': key='.$key."\n";
  $label = trim($vals[1]);
  $flag  = trim($vals[2]);
  $expl  = trim($vals[3]);
  $Labels[$key]       = $label;
  $Flags[$key]        = $flag;
  $Explanations[$key] = $expl;
}
# echo "</pre>";
# list of modules is read from an anscillary file
# module whatis > & module-avail.txt, edit and insert here
# module array syntax:
#  =:text --> <optgroup label='text'>
#  module : description
$modules = explode("\n", file_get_contents('./module-avail.txt', true));
$qOpts   = explode("\n", file_get_contents('./quotas.txt', true));
$qLens   = explode(';', file_get_contents('./qlen.txt', true));
#
# this could be read from a .txt file
#
$SetCB   = array();
$SetCB['goto_cwd']   = 1;
$SetCB['join_err']   = 1;
$SetCB['send_email'] = 0;
#
$Default = array();
$Default['shell'] = 'sh';
#
main();
#
# ---------------------------------------------------------------------------
#
function main(){
  #
  global $verNo;
  global $Explanations, $Flags, $Labels;
  global $modules, $qOpts, $qLens, $SetCB, $Default;
  #
  echo "<form autocomplete='off' class='form-horizontal' role='form'>\n";
  #
  echo "<span id='qOpt' style='display: none'>\n";
  for ($i = 0; $i < count($qOpts)-1; $i++) {
    if (! preg_match('=^//=',$qOpts[$i])) {
      $w = explode('=', $qOpts[$i]);
      $t = trim($w[0]);
      $v = trim($w[1]);
      echo "<input type='hidden' name='$t' value='$v'>\n";
    }
  }
  echo "</span>\n";
  #
  echo "<fieldset>\n<legend class='text-label'>Specify the amount of: </legend>\n";
  echo "<table>\n";
  $or = " or \n".
  "<select id='qLen' class='qLen_dropdown' onChange='setQLen(this.id)' onSelect='setQLen(this.id)'>\n";
  for ($i = 0; $i < count($qLens); $i++) {
    $w = explode('=', $qLens[$i]);
    $qLen = $w[0];
    $qTime = $w[1];
    if ( $qTime == '') {
      # $ck = ' /checked';
      $ck = ' selected ';
    } else {
        $ck = '';
    }
    $or .= "<option value='$qTime'$ck>$qLen</option>\n";
    #
  }
  $or .= "</select> time limit;\n";
  SA('cpu_time', '3:00:00',   $or, '');
  SA('memory',     '4.000', ' GB', '1');
  echo "</table></fieldset>\n";
  #
  H("Select the type of PE: ", 'pe_form',  $Explanations['pe']);
  RG('pe', 'serial',       'setPE', 'serial',  1);
  RG('pe', 'MPI (orte)',   'setPE', 'orte',    0);
  RG('pe', 'MPI (mpich)',  'setPE', 'mpich',   0);
  RG('pe', 'multi-thread', 'setPE', 'mthread', 0);
  echo "\n";
  #
  echo "<table>";
  SA('nbr_cpu', '2', '', 'xxx');
  echo "</table></fieldset>\n";
  #
  H("Select the job's shell: ", 'shell_form', $Explanations['shell']);
  $shells = explode(' ', 'sh csh bash');
  for ($i = 0; $i < count($shells); $i++) {
    $shell = $shells[$i];
    if ($Default['shell'] == $shell) { $check = 1; } else { $check = 0;}
    RG('shell', $shell,   'setShell', '/bin/'.$shell, $check);
  }
  echo "</fieldset>\n";
  #
  H($Labels['add_modules'], 'add_modules', $Explanations['add_modules']);
  SO('modules', $modules, 'addModule');
  echo "</fieldset>\n";
  #
  H($Labels['job_commands'], 'job_commands', $Explanations['job_commands']);
  echo "<table>";
  TA('commands', 'e.g. myprogram -p $NSLOTS -o myoptions');
  echo "</table></fieldset>\n";
  #
  H("Additional options: ", 'other',  $Explanations['other']);
  echo "<table>\n";
  TI('job_name', 'example', '');
  TI('log_name', 'example.log', '');
  if ($SetCB['join_err']) { $disabled = ' disabled '; } else { $disabled = ''; }
  TI('err_name', 'example.err', $disabled);
  echo "</table>\n";
  echo "<table><tr><td>";
  CB('goto_cwd',   'setOther');
  echo "</td><td>";
  CB('join_err',   'setOther');
  echo "</td></tr><tr><td>";
  CB('send_email', 'setOther');
  echo "</td></tr></table>\n";
  echo "<table>\n";
  TI('email_add',  'user@location.edu', '');
  echo "</table></fieldset></form>\n";
  #
  echo '<div class="container"><p>';
  echo QSUB();  
  echo "</div>";
  #
  echo '<p id="message"></p>';
  echo "\n";
  echo '<button id="check_button" type="button" onclick="checkSetup()">Check if OK</button>&nbsp;';
  echo "\n";
  echo '<button id="save_file_button" type="button" onclick="download()">Save it</button>';
  echo "\n";
  #
}
#
# group header
function H($legend, $name, $hint) {
  echo "<fieldset>
<legend class='text-blocked-label'>$legend\n";
  addToolTip($hint);
  echo "</legend>\n";
}
# radio group input element
function RG ($rg, $name, $cmd, $opt, $ickd) {
  if ($ickd == 1) {
    $ck =' /checked';
  } else {
    $ck ='';
  }
  echo "
<input type='radio' class='radio-element' 
 name='$rg' id='$opt' value='$opt' $ck
 onChange='$cmd(\"$name\",\"$opt\")'>
<label for='$name'> $name </label>";
}
#
# checkbox input element
function CB ($id, $cmd) {
  #
  global $Explanations, $Flags, $Labels, $SetCB;
  #
  $ickd = $SetCB[$id];
  if ($ickd == 1) {
    $ck =' /checked';
  } else {
    $ck ='';
  }
  #
  $name = $Labels[$id];
  $opt  = $Flags[$id];
  $hint = $Explanations[$id];
  #
  echo "<span class='cb-info'>
<input type='checkbox' class='checkbox-element' 
 name='$name' id='$id' value='$name' $ck
 onChange='$cmd(this,\"$opt\",\"$id\")'>
<label for='$name'> $name ";
  if ($hint != '') {
    addToolTip($hint);
  }
echo "</label></span>
";
}
#
# label+text input
function TI($name, $default_value, $disabled) {
  #
  global $Explanations, $Flags, $Labels;
  #
  $label = $Labels[$name];
  $hint  = $Explanations[$name];
  $flag  = $Flags[$name];
  #
  echo "<tr><td>
<label for='$name' class='text-blocked-label'>$label";
  addToolTip($hint);
  echo "</label>";
  echo "</td>\n<td>";
  echo "<input type='text' class='form-control' id='".$name."_input' ".
    $disabled.
    "placeholder='$default_value' data-pname='".$name."_value' \n".
    "data-flag='".$flag."' ".
    "onkeyup='addQsubParam(this);' onChange='validate(this)'> </td></tr>\n";
}
# label + textarea, used for job command input
function TA($name, $default_value) {
  #
  global $Explanations, $Flags, $Labels;
  #
  $label = $Labels[$name];
  # $hint  = $Explanations[$name];
  # $flag  = $Flags[$name];
  #
  echo "<tr><td><label for='$name' class='label'>$label </label></td>\n";
  echo "<td><textarea class='form-control' id='".$name."_input' ".
    "placeholder='$default_value' \n".
    "data-pname='".$name."_value' ".
    "onkeyup='addJobCommand(this);' onChange='validate(this)'></textarea></tr>\n";
}
# select an option from the list, used for list of modules
function SO($name, $list, $cmd) {
  #
  echo "\n";
  echo "<select id='$name' multiple class='".$name."_dropdown' onChange='$cmd(this.id)' onSelect='$cmd(this.id)'>\n";
  # iog: <optgroup> counter
  $iog = 0;
  # loop on the list
  for ($i = 0; $i < count($list); $i++) {
    $element = $list[$i];
    $a = explode(':', $element);
    $value = trim($a[0]);
    if ($value == '=') {
      if ($iog == 1) {
        echo "</optgroup>";
        $iog--;
      }
      $optgroup = trim($a[1]);
      echo "<optgroup label='$optgroup'>\n";
      $iog++;
    } else {
      echo "<option value='$value'>$element</option>\n";
    }
  }
  if ($iog == 1) {
    echo "</optgroup>";
    $iog--;
  }
  echo "</select>"; 
}
# set amount: label+text for inputing amounts (mem, cpu_time)
function SA($name, $default_value, $txt, $initVal) {
  #
  global $Explanations, $Flags, $Labels;
  #
  $label = $Labels[$name];
  $hint  = $Explanations[$name];
  $flag  = $Flags[$name];
  #
  echo "<tr><td><label class='text-blocked-label'>$label \n";
  addToolTip($hint);
  echo"</label></td>\n";
  if ($initVal == 'xxx') {
    $val = ' disabled ';
  } else {
    if ($initVal == '') {
      $val = '';
    } else {
      $val = " value='$initVal' ";
    }
  }
  echo "<td><input type='text' class='amount' ".
    "id='".$name."_input' ".$val.    
    "placeholder='$default_value' 
".
    "data-name='$name' ".
    "data-flag='$flag' ".
    "onkeyup='setAmount(this);' onChange='validate(this)'>";
  echo $txt;
  echo "</tr>
";
}
#
# generate the qsub script stub, 
function QSUB(){
  global $conf, $Flags, $SetCB, $Default;
  $prefix = '#$ ';
  $div = "<legend>This the corresponding <tt>qsub</tt> script:</legend>\n";
  $div .= 
    "<div id='output' class='qsub-script'>".
    "# <span id='shell_bang'>/bin/".$Default['shell']."</span><br> \n
# ----------------Parameters---------------------- #<br>\n
<span id='qsub_params_span'>
<span id='shell_type'>".$prefix.' -S /bin/'.$Default['shell']."<br></span>
<span id='pe_type'></span>
<span id='cpu_time_value'></span>
<span id='memory_value'></span>
<span id='other_opts_goto_cwd'>";
  if ($SetCB['goto_cwd']) {
    $div .= $prefix.$Flags['goto_cwd']."<br>";
  }
  $div .= "</span>
<span id='other_opts_join_err'>";
  if ($SetCB['join_err']) {
    $div .= $prefix.$Flags['join_err']."<br>";
    
  }
  $div .= "</span>
<span id='job_name_value'></span>
<span id='log_name_value'></span>
<span id='err_name_value'></span>
<span id='other_opts_send_email'>";
  if ($SetCB['send_email']) {
    $div .= $prefix.$Flags['send_email']."<br>";
  }
  $div .= "</span>
<span id='email_add_value'></span>
</span>
#<br>
# ----------------Modules------------------------- #<br>
<span id='modules_span'></span>
#<br>
# ----------------Your Commands------------------- #<br>
#<br>
echo + `date` job \$JOB_NAME started in \$QUEUE with jobID=\$JOB_ID on \$HOSTNAME<br>
<span id='parallel_info_params_span'></span>
#<br>
<pre><span id='commands_value'></span></pre>
#<br>
echo = `date` job \$JOB_NAME done<br>
</div>";
  return $div;    
}
function addToolTip($hint) {
  echo ' <span class="hover">
  <div class="question">?</div>
   <div class="tooltip">
';
  echo $hint;
  echo '
    </div></span>';
}
?>
