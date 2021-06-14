var jiraTag = '<script type="text/javascript" src="https://alleninteractions.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/-pg4gku/b/8/a44af77267a987a660377e5c46e0fb64/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=682e3707"></script>';
//jiraTag = null;
var queryParams = {};
var tmp = document.location.href.split('?');
if (tmp.length > 1) {
    var params = tmp[1].split('&');
    for (var i = 0; i < params.length; i++) {
        var tmp2 = params[i].split('=');
        queryParams[tmp2[0]] = tmp2[1];
    }
}

$(document).ready(function() {
    var href = document.location.href;
    if (queryParams.qa == 'true' || href.indexOf('localhost') > 0 || href.indexOf('alleni') > 0 || href.indexOf('studiom') > 0) {
        $('body').append('<div id="_JIRA"></div>');
        updateJira();
    }
});

function getQASource() {
    if (queryParams.reviewer == "allenqa") {
        return 'AllenQA';
    } else if (document.location.href.indexOf('localhost') > -1) {
        return 'AllenDev';
    } else {
        return 'ClientReviewer';
    }
}

function updateJira() {
    window.ATL_JQ_PAGE_PROPS = $.extend(window.ATL_JQ_PAGE_PROPS, {
        environment: function() {
            var env_info = {};

            env_info['QA_File'] = __jiraFile;
            env_info['QA_Location'] = __jiraLocation;
            env_info['QA_Item'] = __jiraItem;
            env_info['QA_Source'] = getQASource();
            return env_info;
        },
        fieldValues: {
            'customfield_10026': __jiraFile + ' ' + __jiraLocation + ' ' + __jiraItem,
            'customfield_10100': __jiraFile + ' ' + __jiraLocation + ' ' + __jiraItem,
            'customfield_10200': __jiraSCO
        }
    });

    log('SCO', __jiraSCO);
    $('#_JIRA').append(jiraTag);
}

function cleanJira() {
    $('#_JIRA').empty();
    while ($('.atlwdg-trigger').length > 1) {
        $($('.atlwdg-trigger')[0]).remove();
    }
    while ($('.atlwdg-blanket').length > 1) {
        $($('.atlwdg-blanket')[0]).remove();
    }
    while ($('.atlwdg-popup').length > 1) {
        $($('.atlwdg-popup')[0]).remove();
    }
}


function setJiraSCO(txt) {
    log('setJiraSCO('+ txt +')');
    __jiraSCO = txt;
    updateJira();
}

function setJiraLocation(txt) {
    if (txt != __jiraLocation) {
        __jiraLocation = txt;
        __jiraItem = '';
        updateJira();
    }
}

function setJiraFile(txt) {
    if (txt != __jiraFile) {
        __jiraFile = txt;
        __jiraLocation = '';
        __jiraItem = '';
        updateJira();
    }
}

function setJiraItem(txt) {
    if (txt != __jiraItem) {
        __jiraItem = txt;
        updateJira();
    }
}

var __jiraSCO = 'Unset'; // string
var __jiraFile = 'Unset'; // string
var __jiraLocation = 'Unset'; // string
var __jiraItem = 'Unset'; // string
var __jiraCleanup = setInterval(cleanJira, 1000);