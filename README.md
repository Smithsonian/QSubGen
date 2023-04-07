![QSubGen screenshot](QSubGen_screenshot.png)
<pre>
A qsub script generation utility for use on the Smithsonian Institution High
Performance Cluster. 

This is version 1.2/3 (PHP/JS) - adjusted for Hydra-6

Nov  3 2021 
  * add '/' in isValidName() in js/qsub.js
Sep 14 2021
  * modified for Hydra-6
  * updated quotas.txt
  * fixed missing himem if -pe mthread in js/qsub.js
Oct 16 2019
  * modified for Hydra-5
Nov 12 2019 
   * changed the code to be Hydra-5 compatible 
     memory reservation is per job, no longer per slots.
May  2 2016 
  changed:
   * default shell is set to /bin/sh
   * -cwd and -j y are set
   * "Change to cwd" relabeled as "Change to CWD"
   * "Join stderr & stdout" relabeled as "Join output & error files"
   * "-m abe" chanegd to "-m bea" (begin/end/abort)
   * added hints for -cwd, -j y and -m bea
Jun 18 2015
  changed the order of the shell options and changed the 'help' message in order to
  encourage the use of sh instead of bash.
Jun 12 2015 
  fixed s_cpu=XXX specification (SSS or H:M:S) parsed from [[D:]H:]M
  fixed 30:00:00 (30d to be valid)
  changed display of command to be inside a &lt;pre&gt; since &amp;nbsp; --> ascii 240
  needed to translate \< and \& to &amp;lt; and &amp;amp; in the command section to
  appear OK and not be globbed/converted to html - are those the only two?
  use FileSave.js to save the file after converting to a blob.
  updated module list
0.99/1.6
  implemented quotas/limits: the .php reads from the file quotas.txt and
    the values go into hidden input params.
  fixed join stdout & stderr ("-j y") to toggle "#$ -e <name>"
  added -q xThM.q, but only for hi-mem jobs
  removed mem_free=xxG (no suitable queue)
  changed some of the popup help text
  improved the cpu time validation 999 to 29:23:59 (00:00:00, 2:65, ... are now invalid)
0.99/1.5
  changed the way help messages are shown: 
  no anchor. no title, but .tooltip via css
  also, moved code to addToolTip()
0.99/1.4b
  fixed CDN for select2 v3.5.2
  should upgrade to select 4.x eventually.
0.99/1.4
  fixed cpu_time='' nbr_cpu='' errs and order of '#$ -flag'
  reads lbl-flag-expl.txt
  allow to select cpu time or short/medium/long/unlimited/any
    if selecting qLen -> '-q QQQ' else '-s_cpu D:HH:MM:00'
  default memory=1GB, pe=serial
  quota and limits in .js moved to functions
  hiMem -> disable MPI PEs
  allow CPU_time = '-' --> unlimited
  -q uT?? --> -l lowpri
  -l mem_free= added
  cpu_time 3:02:20 ->  3d 2h 20m
  quotaValues() function is trivial
  added code sniped to show list of hosts in job script when selecting MPI
0.99/1.3:
  list of modules read from module-avail.txt
  use select2 3.5.2 (not 4.x)
  cleaned up code for \<tag\> errors

---


</pre>

