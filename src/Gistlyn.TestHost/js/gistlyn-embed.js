﻿var gistScripts = {};
var codeMirrorEditors = {};

function getGist(gistId, scriptId, onSuccess)
{
    $.get({
        url: "https://api.github.com/gists/" + gistId,
        success: function(response) {
            var main;
            var scripts = [];
            var packages;

            $.each(response.files, function(idx, file) { 
                if (file.filename.toUpperCase() == "MAIN.CS") {
                    main = file.content;
                } else if (file.filename.toUpperCase() == "PACKAGES.CONFIG") {
                    packages = file.content;
                } else {
                    scripts.push(file.content);
                }
            });

            onSuccess({scriptId: scriptId, gistHash: gistId, mainCode: main, scripts: scripts, packages: packages});
        },
        datatype: "jsonp"
    });
}

function onGistResponse(response)
{
    //TODO: change to getElementById
    codeMirrorEditors[response.scriptId].getDoc().setValue(response.mainCode);
    //$("#main_" + response.scriptId).val(response.mainCode);

    gistScripts["script_" + response.scriptId] = response;

    $("#run_" + response.scriptId).removeAttr("disabled");
    $("#cancel_"  + response.scriptId).hide();
    $("#status_" + response.scriptId).text("");
}

function changeScriptStatus(scriptId, status)
{
    switch(status) {
        case "Unknown":
            $("#run_" + scriptId).removeAttr("disabled");
            $("#cancel_"  + scriptId).hide();
            $("#status_" + scriptId).text("");
            break;
        case "Completed":
        case "Cancelled":
        case "CompiledWithErrors":
        case "ThrowedException":
            $("#run_" + scriptId).removeAttr("disabled");
            $("#cancel_"  + scriptId).hide();
            $("#status_" + scriptId).text(status);
            break;
       case "PrepareToRun":
       case "Running":
            $("#run_" + scriptId).attr("disabled", "disabled");
            $("#cancel_"  + scriptId).show();
            $("#status_" + scriptId).text("Executing");
            break;
    }
}

function setScriptResult(scriptId, response)
{
    var id = "#results_" + scriptId;
    $(id).empty();

    var hasErrors = response.result.errors && response.result.errors.length > 0;
    if (hasErrors) {
        $.each(response.result.errors, function(idx, error) {
            $(id).append(error.info + "<br />");
        });
    }

    if (response.result.exception) {
        $(id).text(response.result.exception);
    }

    if (response.result.lastVariableJson) {
        $(id).text(response.result.lastVariableJson.name + "=" + response.result.lastVariableJson.json); 
    }
}

function showButtons(scriptId, isRunning)
{
    if (isRunning) {
        $("#cancel_" + scriptId).show();
        $("#run_" + scriptId).attr("disabled", "disabled");
    } else {
        $("#cancel_" + scriptId).hide();
        $("#run_" + scriptId).removeAttr("disabled");
    }
}

function runScript(url, scriptId, noCache)
{
    console.log("run");

    var mainCode = codeMirrorEditors[scriptId].getDoc().getValue(); //$("#main_" + scriptId).val();
    var scriptInfo = gistScripts["script_" + scriptId];

    showButtons(scriptId, true);
    changeScriptStatus(scriptId, "PrepareToRun");

    $.ajax({
        url: url + "/servicestack/json/reply/RunEmbedScript",
        data: JSON.stringify({scriptId: scriptId, gistHash: scriptInfo.gistHash, mainSource : mainCode, sources: scriptInfo.scripts, packages: scriptInfo.packages, noCache: noCache}),
        contentType: "application/json; charset=utf-8",
        type: "POST",
        dataType: "json",
        /* xhrFields: {
            withCredentials: true
        },
        crossDomain: true, */
        success: function(response) {
            showButtons(scriptId, false);
            changeScriptStatus(scriptId, response.result.status);
            setScriptResult(scriptId, response);
        },
        error: function(e) {
            changeScriptStatus(scriptId, "ThrowedException");
            showButtons(scriptId, false);
        }
    });
}

function cancelScript(url, scriptId)
{
    $.ajax({
        url: url + "/servicestack/json/reply/CancelEmbedScript",
        data: JSON.stringify({ ScriptId: scriptId }),
        contentType: "application/json; charset=utf-8",
        type: "POST",
        dataType: "json",
        success: function(response) {
            changeScriptStatus(scriptId, response.result);
            showButtons(scriptId, false);
        },
        error: function(e) {
            console.log("cancellation error", e);
        }
    });
}

function subscribeServerEvents(url, channel)
{
    var source = new EventSource(url + '/servicestack/event-stream?channels=' + channel + '&t=' + new Date().getTime()); //disable cache
    source.addEventListener('error', function (e) {
        console.log(e);
        //addEntry({ msg: "ERROR!", cls: "error" });
    }, false);

    $(source).handleServerEvents({
        handlers: {
            onConnect: function (u) {
                console.log("subscription", u);
                activeSub = u;
            },
            onHeartbeat: function (msg, e) { if (console) console.log("onHeartbeat", msg, e); },
            onJoin: refreshUsers,
            onLeave: refreshUsers,
            ConsoleMessage: function(m, e) {
                console.log("console out", m);
            },
            ScriptExecutionResult: function(m, e) {
                //$("#scriptStatus").text(m.status);
                //scriptExecResponse($("#multirunBlock"), {result : m});
                switch(m.status) {
                    case "Completed":
                    case "Cancelled":
                    case "CompiledWithErrors":
                    case "ThrowedException":
                        //$("#multirun").removeAttr("disabled");
                        //$("#cancel").hide();
                        break;
                }

            },
            stopListening: function () { $.ss.eventSource.close(); }
        },
        receivers: {
            tv: {
                watch: function (id) {
                    console.log("watch id=",id);
                },
                off: function () {
                    console.log("off");
                }
            }
        }
    });
}
