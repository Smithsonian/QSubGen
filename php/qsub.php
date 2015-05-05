<?php

  /**
   * qsub.php: qsub job generation script
   *
   * this php/js set helps users to write embedded directives
   * to submit a job to SGE on hydra (R.6)
   *
   * the part w/ load modules and input your own commands is still missing
   *
   * <- Last updated: Tue May  5 11:06:49 2015 -> SGK
   **/
error_reporting(E_STRICT);
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
/*
 * could clean up the code from useless stuff and from the browser look at source
 * could add an explanation section and get the '?' links to point to the explanations
 * should move the limits, quotas and labels in the .js to here via some $('#properties').getAttribute('name-it')
 * add load modules (static of dynamic list?)
 */
$verNo = '0.99/1.1.1';
$Explanations =
  array(
        'cpu_time' => 
'This is the amount of CPU time your job needs to complete, 
the format is MM or H:MM or HH:MM or D:HH:MM or DD:HH:MM',
        'memory' => 
'This is the amount of memory *per CPU* your job will use (hence need).

The total amount of reserved memory will be  this amount MULTIPLIED by 
the number of CPUs allocated.

The cluster is a shared resource, memory is a limited and costly resource, 
so do not set this value to more than you will use.
Doing so will prevent access to that memory, hence other jobs from running!',
        'pe' =>
'PE: parallel environment:
  * serial: 1 CPU/job;
  * MPI: message passing interface, CPUs can be on different nodes:
    orte and mpich are two flavors of MPI;
  * multi-thread: shared memory model, all CPUs  must be on the same node.',
                      'nbr_cpu' => 
'This is the number of CPUs/threads or slots your job will use:
  * MPI jobs can use a large number of CPUs, as they are distributed over nodes;
  * Multi-threaded jobs are limited to 64 threads, since all the threads need to be on the same node.
The allocated number of slots will stored in the variable $NSLOTS',
                      'shell' =>
'The choice of shell determines the syntax you use for your commands.',
                      'other' =>
'These are optional parameters.',
'job_name' =>
'This is the name of your job, it can be any valid string',
        'log_name' =>
'This is the filename where the output of your script will go 
make sure to use a unique filename for each concurrent job.

If the file exists, the output will be appended to the existing file',
        'err_name' =>
'This is the filename where the error messages of your script will go 
make sure to use a unique filename for each concurrent job.

If the file exists, the output will be appended to the existing file',
        'email_add' => 
'The email address to send job status notifications',
        'job_commands' =>
'Enter here the commands for your job, you must follow the syntax of the selected shell,');

$Labels = array('job_name'     => 'Job Name',
                'log_name'     => 'Log File Name',
                'err_name'     => 'Err File Name',
                'cpu_time'     => 'CPU time',
                'memory'       => 'Memory',
                'nbr_cpu'      => 'Number of CPUs',
                'email_add'    => 'Email',
                'goto_cwd'     => 'Change to cwd',
                'join_err'     => 'Join stderr &amp; stdout',
                'send_email'   => 'Send email notifications',
                'job_commands' => 'Job specific commands:',
                'commands'      => 'Type your commands here',
                'nothing'      => '');

$Flags = array('job_name'     => '-N',
               'log_name'     => '-o',
               'err_name'     => '-e',
               'cpu_time'     => '-l s_cpu=',
               'memory'       => '-l mres=',
               'nbr_cpu'      => '-pe',
               'goto_cwd'     => '-cwd',
               'join_err'     => '-j y',
               'send_email'   => '-m abe',
               'email_add'    => '-M',
               'job_commands' => 'n/a',
               'nothing'      => '');
main();
#
# ---------------------------------------------------------------------------
# main()
function main(){
  #
  global $verNo;
  global $Explanations, $Flags, $Labels;
  #
  echo "<form autocomplete='off' class='form-horizontal' role='form'>";
  #
  echo "<div><fieldset>
<legend class='text-label'>Specify the amount of: </legend>";
  echo "<table>";
  SA('cpu_time', '3:00:00', '');
  SA('memory',     '4.000', ' GB');
  echo "</table>";
  echo "</fieldset></div>";
  echo "</form>";
  #
  H("Select the type of PE: ", 'pe_form',  $Explanations['pe']);
  RG('pe', 'serial',       'setPE', 'serial');
  RG('pe', 'MPI (orte)',   'setPE', 'orte');
  RG('pe', 'MPI (mpich)',  'setPE', 'mpich');
  RG('pe', 'multi-thread', 'setPE', 'mthread');
  #
  echo "<div class='form-group'>";
  echo "<table>";
  SA('nbr_cpu', '2', '');
  echo "</table>";
  echo "</div>";
  echo "</div></fieldset>";
  #
  H("Select the job's shell: ", 'shell_form', $Explanations['shell']);
  RG('shell', 'bash', 'setShell', '/bin/bash');
  RG('shell', 'sh',   'setShell', '/bin/sh');
  RG('shell', 'csh',  'setShell', '/bin/csh');
  echo "</div></fieldset></form>";
  #
  H($Labels['job_commands'], 'job_commands', $Explanations['job_commands']);
  echo "<table>";
  JC('commands', 'e.g. myprogram -p $NSLOTS -o myoptions');
  echo "</table>";
  echo "</div></fieldset></form></div>";
  #
  H("Additional options: ", 'other',  $Explanations['other']);
  echo "<table>";
  TI('job_name', 'example');
  TI('log_name', 'example.log');
  TI('err_name', 'example.err');
  echo "</table>";
  CB('goto_cwd',   'setOther');
  CB('join_err',   'setOther');
  echo "<br>";
  CB('send_email', 'setOther');
  echo "<table>";
  TI('email_add',  'user@location.edu');
  echo "</table>";
  echo "</div></fieldset></form></div>";
  #
  echo '<div class="container"><p>';
  echo QSUB();  
  echo "</div>";
  #
  echo '<p id="message"></p>';
  echo '<button type="button" onclick="checkSetup()">Check if OK</button>';
  echo "&nbsp;";
  echo '<button id="save_file_button" type="button" onclick="download()">Save it</button>';
}
#
# group header
function H($legend, $name, $hint) {
  echo "<div id='$name'>
<form autocomplete='off' class='form-horizontal ' role='form'>
<fieldset>
<legend class='text-label'>$legend
<a href='#' class='question' title='$hint'>?</a> </legend>
<div class='form-group'>";
}
# radio group input element
function RG ($rg, $name, $cmd, $opt) {
echo "
<input type='radio' class='radio-element' 
 name='$rg' id='$name' value='$opt' 
 onChange='$cmd(\"$name\",\"$opt\")'>
<label for='$name'> $name </label> 
";
}
#
# checkbox input element
function CB ($id, $cmd) {
  #
  global $Explanations, $Flags, $Labels;
  #
  $name = $Labels[$id];
  $opt  = $Flags[$id];
  #
  echo "
<input type='checkbox'  class='checkbox-element' 
 name='$name' id='$id' value='$name' 
 onChange='$cmd(this,\"$opt\",\"$id\")'>
<label for='$name'> $name </label> 
";
}
#
# label+text input
function TI($name, $default_value) {
  #
  global $Explanations, $Flags, $Labels;
  #
  $label = $Labels[$name];
  $hint  = $Explanations[$name];
  $flag  = $Flags[$name];
  #
  echo "
<div class='form-group'>
<tr><td>
<label for='$name' class='text-blocked-label' title='$name'>$label 
<a href='#' class='question' title='$hint'>?</a> </label>";
  echo "</td><td>";
  echo "<input type='text' class='form-control' id='".$name."_input' ".
    "placeholder='$default_value' data-pname='".$name."_value' ".
    "data-flag='".$flag."' ".
    "onkeyup='addQsubParam(this);' onChange='validate(this)'> </tr></div>";
}
# Job command input
function JC($name, $default_value) {
  #
  global $Explanations, $Flags, $Labels;
  #
  $label = $Labels[$name];
  # $hint  = $Explanations[$name];
  # $flag  = $Flags[$name];
  #
  echo "
<div class='form-group'>
<tr><td>
<label for='$name' class='text-label' title='$name'>$label </label>";
  echo "</td><td>";
  echo "<textarea class='form-control' id='".$name."_input' ".
    "placeholder='$default_value' data-pname='".$name."_value' ".
    "onkeyup='addJobCommand(this);' onChange='validate(this)'></textarea> </tr></div>";
}
# set amount: label+text for inputing amounts (mem, cpu_time)
function SA($name, $default_value, $txt) {
  #
  global $Explanations, $Flags, $Labels;
  #
  $label = $Labels[$name];
  $hint  = $Explanations[$name];
  $flag  = $Flags[$name];
  #
  echo "<div class='form-group'>";
  echo "<tr><td>";
  echo "<label class='text-blocked-label'>$label ".
    '<a href="#" class="question" '
    .'title="'.$hint.' ">?</a> </label>';
  echo "</td><td>";
  echo "<input type='text' class='bla' ".
    "id='".$name."_input'".
    "placeholder='$default_value' ".
    "data-name='$name' ".
    "data-flag='$flag' ".
    "onkeyup='setAmount(this);' onChange='validate(this)'>";
  echo $txt;
  echo "</tr></div>";
}
#
# generate the qsub script stub, 
function QSUB(){
  global $conf;
  $div = "<legend>This the corresponding <tt>qsub</tt> script:</legend>";
  $div .= 
    "<div id='output' class='qsub-script'># <span id='shell_bang'>/bin/csh</span><br> \n
# ----------------Parameters---------------------- #<br>\n
<span id='qsub_params_span'>
<span id='job_name_value'></span>
<span id='log_name_value'></span>
<span id='err_name_value'></span>
<span id='cpu_time_value'></span>
<span id='memory_value'></span>
<span id='pe_type'></span>
<span id='shell_type'></span>
<span id='other_opts_goto_cwd'></span>
<span id='other_opts_join_err'></span>
<span id='other_opts_send_email'></span>
<span id='email_add_value'></span>
</span>
# ----------------Modules------------------------- #<br>
<span id='modules_span'></span>
# ----------------Your Commands------------------- #<br>
#<br>
echo + `date` Job \$JOB_NAME started in queue \$QUEUE with jobID=\$JOB_ID on \$HOSTNAME<br>
<span id='parallel_info_params_span'></span>
#<br>
<span id='commands_value'></span>
#<br>
echo = `date` job \$JOB_NAME done<br>
</div>";
  return $div;    
}

?>