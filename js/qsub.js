//
// http://www.w3schools.com/js/js_examples.asp
// http://www.w3schools.com/jquery/jquery_get_started.asp
//
// missing: 
//   entering the job name could populate .log & .err
//   -j y -> no '-e' 
//   module
//   validate(): OK?
// built-in limits (max and quotas) need to move to .php
// same for some strings (esp. in validation).
//
$(document).ready(function() {
        $('#js_version_number').html('JS ver 0.99/1.1.1');
        $('#save_file_button').prop('disabled', true);
        showMsg('This page is ready!');
    });
// show a message in the #message label
// very usefull for debugging
function showMsg(text) {
    // compact js
    // document.getElementById('message').innerHTML = text;
    // jQuery
    // need to load the right CDN to get this to work
    $("#message").html(text);
}
// call back for SA()
function setAmount(ie) {
    var id    = ie.id;
    var value = ie.value;
    var name  = ie.getAttribute('data-name');
    var flag  = ie.getAttribute('data-flag');
    var opt    = '';
    var petype = '';
    //
    var pname = name+'_value';
    //
    if (name == 'memory') {
        opt = flag+value+'G,h_data='+value+'G,h_vmem='+value+'G';
        if (value > 6) {
            opt += ',himem';
        }
    }
    if (name == 'cpu_time') {
        opt = flag+value;
    }
    if (name == 'nbr_cpu') {
        //
        var n = $('input[name=pe]:checked').length;
        if (n == 0) {
            petype = '?type?';
        } else {
            petype = $('input[name=pe]:checked').val();
        }
        pname = 'pe_type';
        opt = flag+' '+petype+' '+value;
    }
    setQsubParam(pname, opt); 
    // var info = id+' '+value+' '+name;
    // showMsg('debug: setAmount("'+info+' '+opt+'")');
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
        $('#parallel_info_params_span').html('echo with NSLOTS = $NSLOTS<br>');
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
        if (id == 'join_err') {
            $('#err_name_input').prop('disabled', true);
        }
    } else {
        setQsubParam('other_opts_'+id, ''); 
        if (id == 'join_err') {
            $('#err_name_input').prop('disabled', false);
        }
    }
}
// add #$ specification to qsub script
function setQsubParam(name, value) {
    //
    var content = "#$ " + value + "<br>";
    // showMsg('debug: here("'+content+'")');
    //
    var spanID = '#'+name;
    var span = "<span id='"+name+"'>" + content + "</span>\n";
    // showMsg('debug: "id='+name+'"');
    // 
    if (value.length == 0) {
        // no value to put -> remove
        $(spanID).remove();
        // showMsg('debug: "removed"');
    } else {
        if ($(spanID).length != 0) {
            // replace content
            $(spanID).html(content);
            // showMsg('debug: html("'+content+'")');
        } else {
            // insert content
            var spanHolderID = '#qsub_params_span';
            $(spanHolderID).append(span);
            // showMsg('debug: append("'+content+'")');
        }
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
    // this need to be adjusted accordingly
    var ncpuMax   = 512;
    var totMemMax = 512;
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
        msg += '  the type of PE has not been selected\n';
    }
    //
    for (i = 0; i < list.length; i++) {
        element = list[i];
        id = '#'+element+'_input';
        value = $(id).val();
        if (value == '') {
            msg += '  "'+element+'" is missing\n';
            missing++;
        } else {
            idx     = $(id).attr('id');
            stat    = doValidate(idx, value);
            isValid = stat[0];
            name    = stat[1];
            if (isValid != 1) {
                msg += '  "'+value+'" is invalid: '+name+'\n';
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
            msg += '  "'+value+'" is invalid: '+name+'\n';
            invalid++;
        }
    }
    // 
    if (missing > 0 || invalid > 0) {
        if (missing > 0) {
            var s = '';
            if (missing > 1) { s = 's'; }
            msg = missing+' required element'+s+' missing:\n'+msg
        }
        if (invalid > 0) {
            var s = '';
            if (missing > 1) { s = 's'; }
            msg = invalid+' invalid element'+s+':\n'+msg
        }
        alert(msg);
        error = missing+invalid;
        var s = '';
        if (error > 1) { s = 's'; }
        showMsg('You have '+error+' error'+s+'!');
        $('#save_file_button').prop('disabled', true);
    } else {
        warning = 0;
        //  warnings
        n = $('input[name=shell]:checked').length;
        if (n == 0) {
            warning++;
            msg += '  You have not selected a shell, the default shell for qsub is csh.\n';
        }
        var commands = $('#commands_input').val();
        if (commands.length == 0) {
            warning++;
            msg += '  You have not entered any job commands.\n';
        }
        var cpuTime = $('#cpu_time_input').val();
        var memory  = $('#memory_input').val();
        var ncpu    = 1;
        if (petype != 'serial') {
            ncpu = $('#nbr_cpu_input').val();
        }
        if (memory > 6) {
            warning++;
            msg += '  You have specified >6 GB of memory per CPU,\n'+
                   '  hence the job will run in the high-memory queue (fewer slots).\n';
        }
        totMem = ncpu*memory;
        // check quota
        if (ncpu > ncpuMax) {
            warning++;
            msg += '  You have specified >'+ncpuMax+' CPU: this exceeds the per user quota.\n';
        }
        if (totMem > totMemMax) {
            warning++;
            msg += '  You have specified >'+totMemMax+' GB of total memory: this exceeds the per user quota.\n';
        }
        if (warning > 0) {
            var s = '';
            if (warning > 1) { s = 's'; }
            msg = warning+' warning'+s+':\n'+msg
            alert(msg);
        }
        showMsg('Your job will request '+ncpu+' CPUs for T='+cpuTime+' and a total of '+totMem+' GB of memory.');
        $('#save_file_button').prop('disabled', false);
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
            name = 'amount of cpu time [d:hh:mm]';
            isValid = isValidCPUTime(value);
            break;
        case 'memory_input':
            name = 'amount of memory [btwn 1.0 & 1024.0]';
            isValid = isValidFloat(value, 1.0, 1024.0);
            break;
        case 'nbr_cpu_input':
            // max #(CPU) depends on PE mode
            var n = $('input[name=pe]:checked').length;
            var nMax = 512;
            if (n == 1) {
                var petype = $('input[name=pe]:checked').val();
                if (petype == 'mthread') {
                    nMax = 64;
                }
            }
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
        }
    }
    //
    return [isValid, name];
}
//
function isValidCPUTime(value) {
    // allow '12' '1:00' '12:00' '1:00:00' or '12:00:00'
    var stat = 0;
    var re3 = /^[0-9]{1,2}:[0-9]{2}:[0-9]{2}$/;
    var re2 = /[0-9]{1,2}:[0-9]{2}$/;
    var re1 = /^[0-9]{2}$/;
    if (re1.test(value) || re2.test(value) || re3.test(value)) {
        stat = 1;
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
