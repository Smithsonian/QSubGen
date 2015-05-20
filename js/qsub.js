//
// http://www.w3schools.com/js/js_examples.asp
// http://www.w3schools.com/jquery/jquery_get_started.asp
//
$(document).ready(function() {
        $(".modules_dropdown").select2({placeholder: 'select from the list, or start typing', 
                    formatSelection: formatModuleSelection, 
                    dropdownCssClass: 'smallmonodropdown'});
        $('#js_version_number').html('JS ver 0.99/1.6');
        $('#save_file_button').prop('disabled', true);
        showMsg('This page is ready!');
    });
// show a message in the #message label usefull for debugging
function showMsg(text) {
    // compact js
    // document.getElementById('message').innerHTML = text;
    // jQuery
    // need to load the right CDN to get this to work
    $("#message").html(text);
}
//
function getQOpt(name) {
    var list = $( "#qOpt input" );
    var i = 0;
    value = -1;
    for (i = 0; i < list.length; i++) {
        if (name == $(list[i]).attr('name')) {
            value = parseInt($(list[i]).val());
            break;
        }
    }
    // console.log('qOpt("'+name+'")='+value);
    return value;
}
// mem:xxThr =   1
// mem:hiThr =   6
//
// nCPU:maxXX = 768
// nCPU:maxhC =  64
// nCPU:maxhM =  80
// 
// nCPU:?Th? =
// mem:?Th? =
//
function xxMemThr()  { return getQOpt('mem:xxThr');}     // threshold above which need to reserve memory
function hiMemThr()  { return getQOpt('mem:hiThr'); }    //                 which need the hiMem queue
function maxCPU(str) { return getQOpt('nCPU:max'+str); } // max of CPU for MPI/mthread
//
function getQLen(name) {
    // get the time associated to the qLen options
    var list = $( "#qLen option" );
    var i = 0;
    var value = '???';
    for (i = 0; i < list.length; i++) {
        if (name == $(list[i]).text()) {
            value = $(list[i]).val();
            break;
        }
    }
    // console.log('qLen("'+name+'")='+value);
    return value;
}
function shortQLen()  { return cvtDHM2Time(getQLen('short'));}
function mediumQLen() { return cvtDHM2Time(getQLen('medium'));}
function longQLen()   { return cvtDHM2Time(getQLen('long'));}
//
function maxCPUPerNode() { 
    //
    // max number of CPUs per nodes: depends on queue (hiC vs hiM) 
    //
    return maxCPU(whichQMem());
}
//
function maxCPUPerJob()  { 
    //
    // max number of CPUs in a single job
    //
    var nMax = maxCPU('XX');
    var n = $('input[name=pe]:checked').length;
    if (n == 1) {
        var petype = $('input[name=pe]:checked').val();
        if (petype == 'mthread') {
            nMax = maxCPUPerNode();
        }
    }
    return nMax; 
} 
//
function whichQMem() {
    //
    // which queue type hC or hM
    //
    var memory  = $('#memory_input').val();
    var opt = '';
    if (memory > hiMemThr()) {
        opt = 'hM';
    } else {
        opt = 'hC';
    }
    return opt;
}
//
function whichQLen() {
    //
    // which queue length: sT mT lT uT or ?T
    //
    var list = $( "#qLen option:selected" );
    var qTime = list.val();
    //
    var val = '';
    if (qTime == '') {
        var time = $('#cpu_time_input').val();
        // convert time to length
        var t  = cvtDHM2Time(time);
        var ts = shortQLen();
        var tm = mediumQLen();
        var tl = longQLen();
        var l = 's';
        if (t > ts) {
            l = 'm';
        }
        if (t > tm) {
            l = 'l';
        }
        if (t > tl || t <= 0) {
            l = 'u';
        }
        val = l+'T';
    } else {
        var letter = list.text().split('');
        val = letter[0]+'T';
    }
    //
    // showMsg('debug: whichQLen("'+qTime+'") -> '+val);
    return val;
}
function quotaValues(type)  { 
    // actual quotas, need to be set right
    var qLen = whichQLen();
    var qMem = whichQMem();
    var q = qLen+qMem;
    //
    var val = -1;
    switch(type) {
    case 'nCPU':
        val = getQOpt('nCPU:'+q);
        break;
    case 'memory':
        val = getQOpt('mem:'+q);
        break;
    }
    // showMsg('debug: quotaValues("'+type+':'+q+'") -> '+val);
    // console.log('debug: quotaValues("'+type+':'+q+'") -> '+val);
    return val;
}
//
// call back for SA()
function setAmount(ie) {
    var id    = ie.id;
    var value = ie.value;
    var name  = ie.getAttribute('data-name');
    var flag  = ie.getAttribute('data-flag');
    var opt    = '';
    var petype = '';
    //
    if (name == 'nbr_cpu') {
        pname = 'pe_type';
    } else {
        var pname = name+'_value';
    }
    //
    if (value.length == 0) {
        opt = '';
    } else {
        switch(name) {
        case 'memory':
            opt = flag+value+'G';
            if (value > xxMemThr()){
                opt += ',h_data='+value+
                    'G,h_vmem='+value+'G';
            }
            if (value > hiMemThr()) {
                opt += ',himem';
            }
            setQLen('qLen');
            setPEOpts(value > hiMemThr());
            break;           
        case 'cpu_time':
            if (value == '-') {
                opt = '-q uT'+whichQMem()+'.q -l lowpri';
            } else {
                var qMem = whichQMem();
                if (qMem == 'hM') {
                    opt = '-q '+whichQLen()+qMem+'.q ';
                }
                opt += flag+value+':00';
            }
            break;
        case 'nbr_cpu':
            //
            var n = $('input[name=pe]:checked').length;
            if (n == 0) {
                petype = '?type?';
            } else {
                petype = $('input[name=pe]:checked').val();
            }
            opt = flag+' '+petype+' '+value;
            break;
        }
    }
    setQsubParam(pname, opt); 
    // var info = id+' '+value+' '+name;
    // showMsg('debug: setAmount("'+info+' '+opt+'")');
}
function setPEOpts(isHiMem) {
    //
    // set PE options: hiMem jobs can't use MPI
    //
    // showMsg('debug: setPEOpts("'+isHiMem+'")');
    $('#orte').prop('disabled', isHiMem);
    $('#mpich').prop('disabled', isHiMem);
}
// callback for TI -> add a qsub embedded flag
function addQsubParam(ie) {
    var id    = ie.id;
    var value = ie.value;
    var pname = ie.getAttribute('data-pname');
    var flag  = ie.getAttribute('data-flag');

    var opt = ''
    if (value.length != 0) {
        opt = flag+' '+value;
    }
    setQsubParam(pname, opt); 
    // 
    if (pname == 'job_name_value') {
        var vlog = value;
        var verr = value;
        if (value != '') { 
            vlog += '.log';
            verr += '.err';
        }
        $('#log_name_input').val(vlog);
        $('#log_name_input').keyup();
        //
        var isChecked = $('#join_err').is(':checked');
        // showMsg('debug: *** '+isChecked);
        if (! isChecked) {
            $('#err_name_input').val(verr);
            $('#err_name_input').keyup();
        }
    }

    // showMsg('debug: addQsubParam("'+opt+' -> '+pname+'")');
}
// call back for JC -> put job commands
function addJobCommand(ie) {
    var id    = ie.id;
    var value = ie.value;
    var pname = ie.getAttribute('data-pname');
    // replace \n -> '<br>'
    value = value.replace(/\n/g, "\n<BR>")+'<BR>';
    // replace ' ' by '&nbsp' to maintain layout/indentation
    value = value.replace(/\ /g, "&nbsp;");
    // 
    $('#'+pname).html(value); 
    // showMsg('debug: addJobCommand("'+pname+'")');
}
// call back for select PE's radio group
function setPE(value, opt) {
    // showMsg('debug: setPE("'+opt+'")');
    // get #(cpu)
    var nCPU = $("#nbr_cpu_input").val();
    if (nCPU.length == 0) {
        nCPU = '?#?';
    }
    if (opt == 'serial') {
        // serial case
        setQsubParam('pe_type', '');
        $('#nbr_cpu_input').prop('disabled', true);
        $('#parallel_info_params_span').html('');
    } else {
        setQsubParam('pe_type', '-pe '+opt+ ' '+nCPU); 
        $('#nbr_cpu_input').prop('disabled', false);
        var info = 'echo + NSLOTS = $NSLOTS';
        switch(opt) {
        case 'orte':
            info += ' distributed over:<BR>cat $PE_HOSTFILE<BR>';
            break;
        case 'mpich':
            info += ' distributed over:<BR>sort $TMPDIR/machines | uniq -c<BR>';
            break;
        case 'mthread':
            info += '<BR>';
            break;
        }
        $('#parallel_info_params_span').html(info);
    }
}
// callback for select shell radio group
function setShell(value, opt) {
    // showMsg('debug: setShell("'+value+' '+opt+'")');
    $('#shell_bang').html(opt);
    setQsubParam('shell_type', '-S '+opt); 
}
// callback for select other
function setOther(ie, value, id) {
    // showMsg('debug: setOther("'+value+'")');
    if (ie.checked) {
        setQsubParam('other_opts_'+id, value); 
    } else {
        setQsubParam('other_opts_'+id, ''); 
    }
    //
    if (id == 'join_err') {
        $('#err_name_input').prop('disabled', ie.checked);
        if (ie.checked) {
            setQsubParam('err_name_value', ''); 
        } else {
            $('#err_name_input').keyup();
        }
    }
}
//
// setQLen(this.id)
function setQLen(name) {
    //    
    var list = $( "#"+name+" option:selected" );
    var qTime = list.val();
    //
    // showMsg('debug: setQLen("'+qTime+'")');
    if (qTime == '') {
        $('#cpu_time_input').keyup();
        $('#cpu_time_input').prop('disabled', false);
    } else {
        $('#cpu_time_input').val(qTime);
        $('#cpu_time_input').prop('disabled', true);
        var qLen = whichQLen();
        var qMem = whichQMem();
        var opt = '-q '+qLen+qMem+'.q';
        if (qLen == 'uT') {
            opt += ' -l lowpri';
        }
        var pname = 'cpu_time_value';
        setQsubParam(pname, opt); 
    }
}
// add selected modules
function addModule(name) {
    //
    var list = $( "#"+name+" option:selected" );
    // showMsg('debug: addModule('+list.length+' "'+name+'")');
    var str = '';
    var i = 0;
    for (i = 0; i < list.length; i++) {
        str += 'module load '+$(list[i]).val()+'<br>';
    }
    //
    var span_name = name+'_span';
    $('#'+span_name).html(str);
}
// format which modules are selected with "formatSelection: formatModuleSelection" in $(name).select2(options)
function formatModuleSelection (module) {
    // delete text after ':', including preceeding ' '
    return module.text.replace(/ *:.*/,''); 
};
// add #$ specification to qsub script
function setQsubParam(name, value) {
    //
    var spanID = '#'+name;
    var content = '';
    if (value.length != 0) {
        content = "#$ " + value + "<br>";
    }
    //
    if ($(spanID).length != 0) {
        // replace content
        $(spanID).html(content);
        // showMsg('debug: id="'+name+'" -> html("'+content+'")');
    } else {
        // insert span w/ content
        var spanHolderID = '#qsub_params_span';
        var span = "<span id='"+name+"'>" + content + "</span>\n";
        $(spanHolderID).append(span);
        // showMsg('debug: "id='+spanHolderID+'".append(span="'+content+'")');
    }
}
//
// check the setup (ie, all options)
// uses doValidate()
//
function checkSetup() {
    //
    // showMsg('checkSetup');
    var missing = 0;
    var invalid = 0;
    var warning = 0;
    var error   = 0;
    //
    var hiMemLim  = hiMemThr();
    //
    var msg = '';
    var i, n, value, id, idx, stat, isValid, name, petype, totMem;
    //
    // required elements
    var list = ['cpu_time', 'memory'];
    //
    n = $('input[name=pe]:checked').length;
    if (n == 1) {
        petype = $('input[name=pe]:checked').val();
        if (petype != 'serial') {
            list[list.length] = 'nbr_cpu';
        }
    } else {
        missing++;
        msg += '  ERR: the type of PE has not been selected\n';
        petype = '';
    }
    //
    for (i = 0; i < list.length; i++) {
        element = list[i];
        id = '#'+element+'_input';
        value = $(id).val();
        if (value == '') {
            msg += '  ERR: "'+element+'" is missing\n';
            missing++;
        } else {
            idx     = $(id).attr('id');
            stat    = doValidate(idx, value);
            isValid = stat[0];
            name    = stat[1];
            if (isValid != 1) {
                msg += '  ERR: "'+value+'" is invalid: '+name+'\n';
                invalid++;
            }
        }
    }
    // optional elements
    list = ['job_name', 'log_name', 'err_name'];
    for (i = 0; i < list.length; i++) {
        element = list[i];
        id = '#'+element+'_input';
        value = $(id).val();
        idx     = $(id).attr('id');
        stat    = doValidate(idx, value);
        isValid = stat[0];
        name    = stat[1];
        if (isValid != 1) {
            msg += '  ERR: "'+value+'" is invalid: '+name+'\n';
            invalid++;
        }
    }
    // 
    //  warnings
    //
    n = $('input[name=shell]:checked').length;
    if (n == 0) {
        warning++;
        msg += '  WARN: You have not selected a shell, the default shell for qsub is csh.\n';
    }
    var commands = $('#commands_input').val();
    if (commands.length == 0) {
        warning++;
        msg += '  WARN: You have not entered any job commands.\n';
    }
    var cpuTime = $('#cpu_time_input').val();
    var memory  = parseInt($('#memory_input').val());
    var nCPU    = 1;
    if (petype != 'serial') {
        nCPU = parseInt($('#nbr_cpu_input').val());
    }
    if (memory > hiMemLim) {
        warning++;
        msg += '  WARN: You have specified >'+hiMemLim+' GB of memory per CPU,\n'+
               '        hence the job will run in the high-memory queue: fewer slots.\n';
    }
    error = missing+invalid;
    //
    // check quota: nCPU > nCPUMax and totMem > totMemMax
    //
    // quotas/limits
    var nCPUMax   = quotaValues('nCPU');
    var totMemMax = quotaValues('memory');
    var qName = whichQLen()+whichQMem()+'.q';
    //
    totMem = nCPU*memory;
    //
    if (nCPU > nCPUMax) {
        error++;
        msg += '  ERR: You have specified '+nCPU+
            ' CPUs: this exceeds the per user quota of '+nCPUMax+' CPUs in "'+qName+'".\n';
    }
    if (totMem > totMemMax) {
        error++;
        msg += '  ERR: You have specified '+totMem+
            ' GB of total memory: this exceeds the per user quota of '+totMemMax+' GB in "'+qName+'".\n';
    }
    //
    // can't use him and MPI
    //
    if (petype.length != 0) {
        if (memory > hiMemLim && !(petype == 'serial' || petype == 'mthread')) {
            error++;
            msg += '  ERR: You have requested '+memory+' GB of memory and PE="'+petype+'"\n'+
                '       only "serial" or "multi-thread (mthread)" jobs can use the high memory (himem) queue.\n';
        }
    }
    // display errs/warns
    //
    var nl = ':\n';
    if (warning > 0) {
        var s = '';
        if (warning > 1) { s = 's'; }
        msg = warning+' warning'+s+nl+msg;
        nl =', ';
    }
    if (missing > 0) {
        var s = '';
        if (missing > 1) { s = 's'; }
        msg = missing+' required element'+s+' missing'+nl+msg;
        nl = ', ';
    }
    if (invalid > 0) {
        var s = '';
        if (missing > 1) { s = 's'; }
        msg = invalid+' invalid element'+s+nl+msg;
    }
    var nxerr = error - missing+invalid;
    if (nxerr > 0) {
        s = '';
        if (nxerr > 1) { s = 's'; }
        msg = nxerr+' error'+s+nl+msg;
    }

    //
    if (error > 0) {
        var s = '';
        if (error > 1) { s = 's'; }
        var txt = 'You have '+error+' error'+s;
        if (warning > 0) {
            s = '';
            if (warning > 1) { s = 's'; }
            txt += ' and '+warning+' warning'+s;
        }
        showMsg(txt+', fix and check again!');
        $('#save_file_button').prop('disabled', true);
        alert(msg);
    } else {
        var cpuTimeX = cpuTime;
        if (cpuTime == '') {
            cpuTimeX = 'unlimited';
        } else {
            // d:hh:mm -> Xd Xh Xm
            cpuTimeX = cpuTimeX.replace(/:(..)$/, 'h $1');
            cpuTimeX = cpuTimeX.replace(/:(..h ..)$/, 'd $1');
            cpuTimeX = cpuTimeX + 'm';
            // 0Xu -> Xu
            cpuTimeX = cpuTimeX.replace(/ 0/g, ' ');
            // 0u -> ''
            cpuTimeX = cpuTimeX.replace(/ 0./g, ' ');
        }
        var txt, and;
        if (memory > hiMemLim) {
            and = ',';
            txt = ', and the high-memory queue.';
        } else {
            and = ' and'
            txt = '.';
        }
        var s = '';
        if (nCPU > 1) { s = 's'; }
        txt = 'Your job will request '+nCPU+
            ' CPU'+s+', '+cpuTimeX+' of CPU time'+
            and+' a total of '+totMem+'GB of memory'+txt;
        //****
        showMsg(txt);
        $('#save_file_button').prop('disabled', false);
        if (warning > 0) {
            alert(msg);
        }
    }
}
//
// allows to save the qsub script to a file
//
function download() {
    // get the text only
    var output = $("#output").text();
    // remove any blank lines
    output = output.replace(/[\n]{2,}/g, '\n');
    // save to a file (can't suggest a name)
    window.open("data:plain/text;charset=utf-8," + escape(output));
    // disable the save button to force a check
    $('#save_file_button').prop('disabled', true);
}
//
function cvtDHM2Time(str) {
    var t = 0;
    var w = str.split(':');
    i = w.length-1;
    t += parseInt(w[i]);
    if (i == 0) {return t;}
    i--;
    t += parseInt(w[i])*60.;
    if (i == 0) {return t;}
    i--;
    t += parseInt(w[i])*60*24;
    return t;
}
//
// validate a field (ie: input element), calls doValidate()
//
function validate(ie) {
    var idname = ie.id;
    var value  = ie.value;
    // showMsg('debug: validate(id='+idname+' v='+value+')');
    //
    var stat    = doValidate(idname, value);
    var isValid = stat[0];
    var name    = stat[1];
    //
    if (isValid != 1) {
        ie.style.borderColor = "red";
        // showMsg('"'+value+'" is invalid.');
        alert("Please enter a valid "+name+
              ', the value "'+value+'" is invalid.');
    } else {
        ie.style.borderColor = '';
        // showMsg('');
    }
}
// 
// does the validation(idname, value)
//
function doValidate(idname, value) {
    //
    var name = 'unknown';
    var isValid = 0;
    //
    if (value.length == 0) {
        isValid = 1;
    } else {
        switch (idname) {
        case 'job_name_input':
            name = 'job name';
            isValid = isValidName(value);
            break;
        case 'log_name_input':
            name = 'log name';
            isValid = isValidName(value);
            break;
        case 'err_name_input':
            name = 'err name';
            isValid = isValidName(value);
            break;
        case 'cpu_time_input':
            name = 'amount of cpu time ([d]d:hh:mm, [h]h:mm, mmm or mm)';
            isValid = isValidCPUTime(value);
            break;
        case 'memory_input':
            name = 'amount of memory [btwn 1.0 & 1024.0]';
            isValid = isValidFloat(value, 1.0, 1024.0);
            break;
        case 'nbr_cpu_input':
            // max #(CPU) depends on PE mode and hC vs hM
            var nMax = maxCPUPerJob();
            name = 'number of CPUs [btwn 2 & '+nMax+']';
            isValid = isValidInteger(value, 2, nMax);
            break;
        case 'email_add_input':
            name = 'email address';
            isValid = isValidEmail(value);
            break;
        case 'commands_input':
            name = 'commands';
            // no validation
            isValid = 1;
            break;
        }
    }
    //
    return [isValid, name];
}
//
function isValidCPUTime(value) {
    // allow '12' '123' '1:00' '12:00' '1:00:00' or '12:00:00'
    // This may not reject some weird time formats
    //
    var stat = 0;
    //
    var re1 = /^[1-2][0-9]:[0-2][0-9]:[0-5][0-9]$/; // xx:xx:xx max 29:23:59 or ~30 days >> 30:00:00 of long
    var re2 =      /^[1-9]:[0-2][0-9]:[0-5][0-9]$/; //  x:xx:xx max  9:23:59 or  ~10 days
    var re3 =            /^[1-9][0-9]:[0-5][0-9]$/; //    xx:xx max    99:59 or ~100 hrs
    var re4 =                 /^[1-9]:[0-5][0-9]$/; //     x:xx max     9:59 or  ~10 hrs
    var re5 =                       /^[1-9][0-9]{1,2}$/; //  xx or xxx  min is 10, max 999 minutes  
    //
    if (re1.test(value) || 
        re2.test(value) || 
        re3.test(value) || 
        re4.test(value) || 
        re5.test(value) || 
        value == '-') {
        stat = 1;
    }
    // reject x:2[4-9]:xx & xx:2[4-9]:xx
    var re0 = /^.{1,2}:2[4-9]:..$/;
    if (re0.test(value)) {
        stat = 0;
    }
    return stat;
}
function isValidInteger(value, min, max) {
    var stat = 0;
    var re = /^[0-9]*$/;
    if (re.test(value)) {
        stat = 1;
        if (value < min || value > max) {
            stat = 0;
        }
    }
    return stat;
}
//
function isValidFloat(value, min, max) {
    var stat = 0;
    var re = /^[0-9.]*[0-9]*$/;
    if (re.test(value)) {
        stat = 1;
        if (value < min || value > max) {
            stat = 0;
        }
    }
    return stat;
}
//
function isValidName(value) {
    var stat = 0;
    var re = /^[a-zA-Z0-9.+=%@_:\-]*$/;
    if (re.test(value)) {
        stat = 1;
    }
    return stat;
}
//
function isValidEmail(email) {
    var stat = 0;
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
     if (re.test(email)) {
         stat = 1;
    }
    return stat;
}
//
//function printObject(o) {
//  var out = '';
//  for (var p in o) {
//    out += p + ': ' + o[p] + '\n';
//  }
//  alert(out);
//}
