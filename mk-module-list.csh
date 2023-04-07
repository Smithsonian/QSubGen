#!/bin/csh
#
# <- Last updated: Wed Nov 10 16:07:07 2021 -> SGK
#
cd /var/www/html/tools/QSubGen
#
source /etc/profile.d/modules.csh
#
# neither works
# module initrm ~/.modulerc 
# module unuse /home/hpc/modulefiles 
#
(module whatis) | & \
  sed 's/^ *//' > module.whatis.new
diff module.whatis module.whatis.new >>& /dev/null
if ($status) then
  #
  echo + `date` $0 ran on `uname -n`
  wc -l module.whatis module.whatis.new 
  #
  /home/hpc/sbin/backup module.whatis
  /home/hpc/sbin/backup module-avail.txt
  mv module.whatis.new module.whatis
  ./mk-module-list.pl       > module-avail.txt
  ./mk-module-list.pl -html > module-avail.html
##chown hpc.hpc module.whatis module-avail.txt module-avail.html
##chmod a+r module-avail.*
  #
  chmod a+r module-avail.*
  rsync -aq module-avail.txt  module-avail.html module-style.css hydra-6:/home/hpc/cron/
  #
else
  rm -f module.whatis.new
endif

