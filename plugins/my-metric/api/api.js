var plugin = {},
	common = require('../../../api/utils/common.js'),
	plugins = require('../../pluginManager.js'),
	async = require('async');

(function (plugin) {
	
	/* 
	    @methodName        compare
		@methodDescription Compare between two object's by my_metric_count value
		@params 		   a Metric Object which includes metric values
		@params 		   b Metric Object which includes metric values
		@exampleArgument
		{
			"my_metric":"name",
			"my_metric_count":1
		}
		@return {boolean}
	*/
	function compare(a,b) {
		if (a.my_metric_count < b.my_metric_count)
			return -1;
		if (a.my_metric_count > b.my_metric_count)
			return 1;
		return 0;
	}



	/*
		@exampleRequest http://[server-ip]/i/my-metric?app_key=[app-key]&device_id=[device-id]&app_id=[app-id]&my_metric=[metric-value]&my_metric_count=[metric-count]
		@params app_key {String}
		@params device_id {String}
		@params app_id {String}
		@params my_metric {String}
		@params my_metric_count {Number}
		@exampleSuccessResponse
		{
			result: "Success"
		}
		@exampleErrorResponse
		{
			result: "Something went wrong"
		}
	*/
	plugins.register("/i/my-metric", function (ob) {
		var params = ob.params;

		// Requirement validation of params for API requests
		if (!params.qstring.app_key && !params.qstring.device_id) 
			return false;

		// Get params
		var my_metric    = params.qstring.my_metric;
		var metric_count = params.qstring.my_metric_count;
		var appId 		 = params.qstring.app_id;
		var date 		 = params.qstring.date;
		// var newDate = new Date();
		// var month = [];

		// Mongo collection name
		var collectionName = "my_metric" + appId;
		
		// Object filled with parameters for mongo insert
		var metric = {};
		metric.my_metric = ob.params.qstring.my_metric;
		metric.my_metric_count = ob.params.qstring.my_metric_count;
		metric.date = date;

		//  Inserting object in collection
		common.db.collection(collectionName).insert(metric, function (err, res) { 
			if(err){
				common.returnMessage(params, 400, 'Something went wrong');
				return false;
			} else{
				common.returnMessage(params, 200, 'Success');
				return true;
			}
		});
		return true;
	});


	
	/*
		@exampleRequest http://[server-ip]/o/my-metric?method=[method-name]?app_key=[app-key]&device_id=[device-id]&app_id=[app-id]
		@params method {String}
		@params app_key {String}
		@params device_id {String}
		@params app_id {String}
		@exampleSuccessResponse
		{
			my_metric: "value1",
			my_metric_count: 17,
			date: "Sat Jan 27 2018 15:35:02 GMT+0300 (+03)"
		}
		@exampleErrorResponse
		{
			result: "Something went wrong"
		}
	*/
	plugins.register("/o/my-metric", function (ob) {
		var params = ob.params;
		
		// Requirement validation of params for API requests
		if (!params.qstring.app_key && !params.qstring.device_id) {
			return false;
		}

		var appId = params.qstring.app_id;		
		var collectionName = "my_metric" + appId;
		

		/*
			If 'method' parameters value is 'top-metric-values', 
			API sort by my_metric_count values and respond top 3 object.

			@exampleRequest http://[server-ip]/o/my-metric?method=top-metric-values?app_key=[app-key]&device_id=[device-id]&app_id=[app-id]
		*/
		if(params.qstring.method == "top-metric-values"){
			common.db.collection(collectionName).find({}).toArray(function (err, res) {
				if(err){
					common.returnMessage(params, 400, 'Something went wrong');
					return false;
				}
				var uniques = [];
				res.forEach(function(obj) {
					let included = false;
					obj.my_metric_count = parseInt(obj.my_metric_count);
					uniques.forEach(function(unq) {
						if (obj.my_metric == unq.my_metric) {
							unq.my_metric_count = parseInt(obj.my_metric_count) + parseInt(unq.my_metric_count);
							included = true;
						} 
					})
					if (!included) {
						uniques.push(
							{
								"my_metric":obj.my_metric,
								"my_metric_count":obj.my_metric_count
							}
						);
					}
				})
				uniques.sort(compare);
				var finalArray = [uniques[uniques.length - 1],uniques[uniques.length - 2],uniques[uniques.length - 3]];
				common.returnOutput(params, JSON.parse(JSON.stringify(finalArray)));
				return true;
			});

			return true;
		
		}

		/*
			If 'method' parameters value is 'top-metric-dates', 
			API sort by my_metric_count values and response top 3 object.

			@exampleRequest http://[server-ip]/o/my-metric?method=top-metric-dates?app_key=[app-key]&device_id=[device-id]&app_id=[app-id]
		*/
		else if (params.qstring.method == "top-metric-dates") {
			common.db.collection(collectionName).find({}).toArray(function (err, res) {
				if(err){
					common.returnMessage(params, 400, 'Something went wrong');
					return false;
				}
				var uniques = [];
				res.forEach(function(obj) {
					let included = false;
					obj.my_metric_count = parseInt(obj.my_metric_count);
					uniques.forEach(function(unq) {
						if (obj.date == unq.date) {
							unq.my_metric_count = parseInt(obj.my_metric_count) + parseInt(unq.my_metric_count);
							included = true;
						} 
					})
					if (!included) {
						uniques.push({"my_metric":obj.my_metric,"my_metric_count":obj.my_metric_count, "date":obj.date});
					}
				})
				uniques.sort(compare);
				var finalArray = [uniques[uniques.length - 1],uniques[uniques.length - 2],uniques[uniques.length - 3]];
				common.returnOutput(params, JSON.parse(JSON.stringify(finalArray)));
				return true;
			});

			return  true;
		}

		/*
			If 'method' parameters is missing, 
			API sort by my_metric_count values and response top 3 object.

			@exampleRequest http://[server-ip]/o/my-metric?app_key=[app-key]&device_id=[device-id]&app_id=[app-id]
		*/
		else {
			common.db.collection(collectionName).find({}).toArray(function (err, res) {
				if(err){
					common.returnMessage(params, 400, 'Something went wrong');
					return false;
				}
				var uniques = [];
				res.forEach(function(obj) {
					let included = false;
					obj.my_metric_count = parseInt(obj.my_metric_count);
					uniques.forEach(function(unq) {
						if (obj.date == unq.date) {
							unq.my_metric_count = parseInt(obj.my_metric_count) + parseInt(unq.my_metric_count);
							included = true;
						} 
					})
					if (!included) {
						uniques.push({"my_metric":obj.my_metric,"my_metric_count":obj.my_metric_count, "date":obj.date});
					}
				})
				common.returnOutput(params, JSON.parse(JSON.stringify(uniques)));
				return true;
			});
			return  true;
		}	
		return true;
	});

}(plugin));

module.exports = plugin;
