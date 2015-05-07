A qsub script generation utility for use on the Smithsonian Institution High
Performance Cluster. 

This is ver 0.99/1.4 as we develop the code

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

