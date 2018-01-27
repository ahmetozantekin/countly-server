(function (myMetricPlugin, $) {

    var _metricDatas     = {};
    var _topMetricValues = {};
    var _topMetricDates  = {};

    myMetricPlugin.initialize = function () {
    };

    /*  
	    @methodName          getTopMetricValues
        @methodDescription   Request API for top-metric-values
		@return {Object}
	*/
    myMetricPlugin.getTopMetricValues = function(){
        var method_name = "top-metric-values";
        var data = {
            "method" : method_name,
            "api_key": countlyGlobal.member.api_key,
            "app_id": countlyCommon.ACTIVE_APP_ID,
            "device_id": 1
        };
        
        // GET ajax request API
        return $.ajax({
            type: "GET",
            url: countlyCommon.API_URL + "/o/my-metric?method="+data.method+"&api_key="+data.api_key+'&app_id='+data.app_id+'&device_id='+data.device_id,
            success: function (json) {
                _topMetricValues = json;
                return _topMetricValues;
            }
        });
    }

    /* 
	    @methodName          getTopMetricDates
        @methodDescription   Request API for top-metric-dates
		@return {Object}
	*/
    myMetricPlugin.getTopMetricDates = function(){
        var method_name = "top-metric-dates";
        var data = {
            "method" : method_name,
            "api_key": countlyGlobal.member.api_key,
            "app_id": countlyCommon.ACTIVE_APP_ID,
            "device_id": 1
        };
        
        // GET ajax request API
        return $.ajax({
            type: "GET",
            url: countlyCommon.API_URL + "/o/my-metric?method="+data.method+"&api_key="+data.api_key+'&app_id='+data.app_id+'&device_id='+data.device_id,
            success: function (json) {
                _topMetricDates = json;
                return _topMetricDates;
            }
        });
    }

    /* 
	    @methodName          getAllData
        @methodDescription   Request API for all values
		@return {Object}
	*/
    myMetricPlugin.getAllData = function(){
        var data = {
            "api_key": countlyGlobal.member.api_key,
            "app_id": countlyCommon.ACTIVE_APP_ID,
            "device_id": 1
        };
        
        // GET ajax request API
        return $.ajax({
            type: "GET",
            url: countlyCommon.API_URL + "/o/my-metric?&api_key="+data.api_key+'&app_id='+data.app_id+'&device_id='+data.device_id,
            success: function (json) {
                _metricDatas = json;
                return _metricDatas;
            }
        });
    }


}(window.myMetricPlugin = window.myMetricPlugin || {}, jQuery));