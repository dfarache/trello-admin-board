var TRELLO_KEY = "";
var TRELLO_TOKEN = "";
var STATUS_OK = "OK";
var g_cPageNavigations = 0;
var g_bLocalNotifications = false;
var g_mapLastActivityInfo = null;
var g_user = null;

var TrelloController = function() {

}

function errFromXhr(xhr) {
    var errText = "";

    if (xhr.status == 0)
        errText = "No connection";
    else if (xhr.statusText)
        errText = xhr.statusText;
    else if (xhr.responseText)
        errText = xhr.responseText;
    else
        errText = "error: " + xhr.status;

    console.log(errText);
    return errText;
}

TrelloController.prototype = {
      callTrelloApi: function(urlParam, bContext, msWaitStart, method, callback) {
        var keyCached = "td:" + urlParam;
        var bReturnedCached = false;
        var objTransformedFirst = null;
        var cPageNavCur = g_cPageNavigations;

        function bOKContext() {
          return !bContext;
        }

        var url = "https://api.trello.com/1/" + urlParam + "?key=" + TRELLO_KEY + "&token=" + TRELLO_TOKEN;
        var xhr = new XMLHttpRequest();
        var bOkCallback = false;
        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                handleFinishRequest();

                function handleFinishRequest() {
                    var objRet = {
                        status: "unknown error",
                        obj: [],
                        bCached: false
                    };
                    var bReturned = false;
                    var bQuotaExceeded = (xhr.status == 429);

                    if (!bOKContext())
                        return;

                    if (xhr.status == 200) {
                        try {
                            var obj = JSON.parse(xhr.responseText);
                            objRet.status = STATUS_OK;
                            objRet.obj = obj;
                            bReturned = true;
                            if (cPageNavCur != g_cPageNavigations)
                                objTransformedFirst = null; //invalidate if user navigated away since first cache return
                            var objTransformed = callback(objRet, objTransformedFirst);
                            bOkCallback = true; //covers exception from callback
                            var cacheItem = {
                                compressed: null,
                                bTransformed: false,
                                now: Date.now()
                            };
                            if (objTransformed) {
                                cacheItem.bTransformed = true;
                            } else {
                                cacheItem.bTransformed = false;
                            }
                            localStorage[keyCached] = JSON.stringify(cacheItem);
                        } catch (ex) {
                            objRet.status = "error: " + ex.message;
                        }
                    } else {
                        if (bQuotaExceeded) {
                            var waitNew = 500 * 2;
                            if (waitNew < 8001) {
                                console.log("Plus: retrying api call");
                                this.callTrelloApi(urlParam, bContext, waitNew, callback);
                                return;
                            } else {
                                objRet.status = errFromXhr(xhr);
                            }
                        } else if (xhr.status == 404) {
                            objRet.status = "error: not found\n" + errFromXhr(xhr);
                        } else {
                            objRet.status = errFromXhr(xhr);
                        }
                    }

                    if (!bReturned || !bOkCallback) {
                        if (objRet.status != STATUS_OK) {
                            return;
                        }
                        if (!bReturned)
                            callback(objRet);
                    }
                }
            }
        };

        xhr.open(method, url);
        xhr.send();
    }
}

window._TrelloController = new TrelloController();
