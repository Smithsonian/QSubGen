#!/bin/csh
#
# <- Last updated: Wed Oct 16 19:16:49 2019 -> SGK
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
  /home/hpc/sbin/backup module.whatis
  /home/hpc/sbin/backup module-avail.txt
  mv module.whatis.new module.whatis
  ./mk-module-list.pl       > module-avail.txt
  ./mk-module-list.pl -html > module-avail.html
  chmod a+r module-avail.*
else
  rm module.whatis.new
endif

