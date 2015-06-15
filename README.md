A qsub script generation utility for use on the Smithsonian Institution High
Performance Cluster. 

This is ver 0.99/x.x as we develop the code

Status:

0.99/1.3:
  list of modules read from module-avail.txt
  use select2 3.5.2 (not 4.x)
  cleaned up code for \<tag\> errors

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

0.99/1.4b
  fixed CDN for select2 v3.5.2
  should upgrade to select 4.x eventually.

0.99/1.5
  changed the way help messages are shown: 
  no anchor. no title, but .tooltip via css
  also, moved code to addToolTip()

0.99/1.6
  implemented quotas/limits: the .php reads from the file quotas.txt and
    the values go into hidden input params.
  fixed join stdout & stderr ("-j y") to toggle "#$ -e <name>"
  added -q xThM.q, but only for hi-mem jobs
  removed mem_free=xxG (no suitable queue)
  changed some of the popup help text
  improved the cpu time validation 999 to 29:23:59 (00:00:00, 2:65, ... are now invalid)

Jun 12 2015 

  fixed s_cpu=XXX specification (SSS or H:M:S) parsed from [[D:]H:]M
  fixed 30:00:00 (30d to be valid)
  changed display of command to be inside a <pre> since &nbsp; --> ascii 240
  needed to translate < and & to &lt; and &amp; in the command section to
  appear OK and not be globbed/converted to html - are those the only two?
  use FileSave.js to save the file after converting to a blob.
  updated module list

