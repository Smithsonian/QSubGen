#!/usr/bin/perl
#
# /usr/bin/modulecmd bash whatis >& module.whatis
#
# -html to generate HTML output, uses module-style.css
#
# Nov 10 2021 - SGK - added more sections (Python, NVIDIA) and more stuff (julia)
# Nov 13 2021 - SGK - added xKey to exclude w/ grep(!/$xKey/, (grep (/$key/, $modList)))
#
# <- Last updated: Sat Nov 13 08:14:53 2021 -> SGK
#
$verNo = 'v2.0/0';
$useHTML = 0;
if ($ARGV[0] eq '-html') { $useHTML = 1;}
#
$base = '/share/apps/modulefiles';
@modList = `cat module.whatis`;
## $key; $xKey; $name; $check
@catList = (
  '^bioinfo;;BioInformatics;1', 
  '^java/;;Java;1',
  '^tools/;/python|/julia|/fl|/gdl;Tools;1',
  '^python|/python;;Python;0',
  '^idl/|^tools/fl|^tools/gdl|^matlab/|^tools/julia;;IDL, MATLAB or JULIA;0',
  '^gcc/[0-9.]*:;;GNU compilers;0',
  '^gcc/.*mpich|^gcc/.*mvapich|^gcc/.*openmpi;;GNU MPI;0',
  '^gcc/.*/gsl;;GNU gsl;0',
  '^intel/[0-9.]*:;;Intel compilers;0',
  '^intel/mpi|^intel/mvapich|^intel/openmpi|^intel/.*/mpi|^intel/.*/mvapich|^intel/.*/openmpi'.
    ';;Intel MPI;0',
  '^pgi/[0-9.]*:;;PGI compilers;0',
  '^pgi/mvapich|^pgi/openmpi|^pgi/.*/mvapich|^pgi/.*/mpi|^pgi/.*/openmpi;;PGI MPI;0',
  '^nvidia/[0-9.]*:;;NVIDIA compilers;0',
  '^nvidia/mvapich|^nvidia/openmpi|^nvidia/.*/mvapich|^nvidia/.*/mpi|^nvidia/.*/openmpi;;NVIDIA MPI;0',
  '^nvidia/.*/cuda|^cuda;;NVIDIA cuda;0',
  '^gis|^gnuplot|^gsl|^blac|^fft'.
  '^gdb|^hdf5|^intel-tbb-oss|^lapack|^mmfs|^mpich|^mvapich|^netcdf|'.
  '^openblas|^openmpi|^scalapack'.';;Misc;0'
    );
%links = ( 'BioInformatics'       => 'bioinfo',
           'Java'                 => 'java',       
           'Tools'                => 'tools',     
           'Python'               => 'python',   
           'IDL, MATLAB or JULIA' => 'idl/matlab/julia',
           'GNU compilers'        => 'gcc',       
           'GNU MPI'              => 'gcc-mpich', 
           'GNU gsl'              => 'gcc-gsl', 
           'Intel compilers'      => 'intel',     
           'Intel MPI'            => 'intel-mpi', 
           'PGI compilers'        => 'pgi',       
           'PGI MPI'              => 'pgi-mpi',   
           'NVIDIA compilers'     => 'nvidia',       
           'NVIDIA MPI'           => 'nvidia-mpi',   
           'NVIDIA cuda'          => 'nvidia-cuda',   
           'Misc'                 => 'misc',   
    );
if ($useHTML) {
  print <<__EOF__;
<html>
<head>
<title>Hydra Modules</title>
<link rel="stylesheet" type="text/css" href="module-style.css">
</head>

<h1>List of Available Modules on Hydra</h1>
<ul>
  <li> <a href="#bioinfo">BioInformatics</a>
  <li> <a href="#java">Java</a>
  <li> <a href="#tools">Tools</a>
  <li> <a href="#python">Python</a>
  <li> <a href="#idl/matlab/julia">IDL/MATLAB/julia</a>
  <li> <a href="#gcc">GNU compilers</a>
  <ul>
  <li> <a href="#gcc-mpich">GNU MPI</a>
  <li> <a href="#gcc-gsl">GNU gsl</a>
  </ul>
  <li> <a href="#intel">Intel compilers</a>
  <ul>
  <li> <a href="#intel-mpi">Intel MPI</a>
  </ul>
  <li> <a href="#pgi">PGI compilers</a>
  <ul>
  <li> <a href="#pgi-mpi">PGI MPI</a>
  </ul>
  <li> <a href="#nvidia">NVIDIA compilers</a>
  <ul>
  <li> <a href="#nvidia-mpi">NVIDIA MPI</a>
  <li> <a href="#nvidia-mpi">NVIDIA cuda</a>
  </ul>
  <li> <a href="#misc">Misc</a>
</ul>
__EOF__
  $table = 0;
}

foreach $cat (@catList) {
  ($key, $xKey, $val, $chk) = split(';', $cat);
  if ($useHTML) {
    if ($table) { print "</table><p>\n"; }
    print <<__EOF__;
<h2 id="$links{$val}">$val</h2>
<table rules='rows'>
  <col width="350">
  <col width="850">
  <tr><td><b>Module</b></td><td><b>Description<b></td></tr>
__EOF__
  $table = 1;
  } else {
    print "=:$val\n";
  }
  if ($xKey) {
    @list   = sort(grep !/$xKey/, (grep /$key/, @modList));
  } else {
    @list   = sort(grep /$key/, @modList);
  }
  $prev   = '';
  $defVer = '?';
  foreach $line (@list) {
    ## print STDERR ">>$cat>$line\n";
    $line =~ s/Description: //;
    $line =~ s/- Home.*//;
    ($name, $descr) = split(':', $line, 2);
    chop($descr);
    if ($name =~/\//) {
      @w = split('/', $name);
      $version = pop(@w);
      $version =~ s/ *$//;
      $name    = join('/',@w);
    } else {
      $version = '';
    }
    if ($name ne $prev && $chk == 1) {
      $vf = "$base/$name/.version";
      ## print STDERR "> $vf\n";
      if (-e $vf) {
        @def = grep /ModulesVersion/, `cat $vf`;
        @w = split(' ', $def[0]);
        $defVer = $w[2];
        $defVer =~ s/\"//g;
        ## print STDERR "$name $defVer\n";
      } else {
        $defVer = '?';
      }
    }
    #
    ## print STDERR "$defVer:$version:$line";
    #
    if ($defVer eq '?') {
      if ($useHTML) {
        printf "<tr><td><tt>%-35s</tt></td><td>%s</td></tr>\n", $name.'/'.$version, $descr;
      } else {
        printf "%-35s:%s\n", $name.'/'.$version, $descr;
      }
    } elsif ($version eq $defVer) {
      if ($useHTML) {
        printf "<tr><td><tt>%-35s</tt></td><td>%s - def. version, others may be avail.</td></tr>\n", $name, $descr;
      } else {
        ## printf "%-35s:%s (other versions may be avail.)\n", $name, $descr;
        printf "%-35s:%s - def. version, others may be avail.\n", $name, $descr;
      }
    }
    #
    $prev = $name;
  }
}
if ($table) { print "</table><p>\n"; }

$time = scalar localtime(time());
$time =~ s/ (..):(..):(..) (....)/ $4 at $1:$2/;
if ($useHTML) {
print <<__EOF__
<p class="version">
Module list last updated as of $time  with <tt>mk-module-list.pl</tt> $verNo</span>
<body></body></html>
__EOF__

} else {
  print "=:Module list last updated as of ".$time." with mk-module-list.pl $verNo\n";
}
#
