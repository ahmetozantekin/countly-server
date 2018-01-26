var plugin = {},
	common = require('../../../api/utils/common.js'),
	plugins = require('../../pluginManager.js'),
	async = require('async');

(function (plugin) {
	
	function compare(a,b) {
		if (a.my_metric_count < b.my_metric_count)
			return -1;
		if (a.my_metric_count > b.my_metric_count)
			return 1;
		return 0;
	}

	plugins.register("/i/my-metric", function (ob) {
		var params = ob.params;

		if (!params.qstring.app_key && !params.qstring.device_id) {
			return false;
		}

		var my_metric = params.qstring.my_metric;
		var metric_count = params.qstring.my_metric_count;
		var appId = params.qstring.app_id;
		var date = params.qstring.date;
		// var newDate = new Date();
		// var month = [];
		// month[0] = "January";
		// month[1] = "February";
		// month[2] = "March";
		// month[3] = "April";
		// month[4] = "May";
		// month[5] = "June";
		// month[6] = "July";
		// month[7] = "August";
		// month[8] = "September";
		// month[9] = "October";
		// month[10] = "November";
		// month[11] = "December";
		// var date = newDate.getDate() + " " + month[newDate.getMonth()] + " " + newDate.getFullYear();
		
		var collectionName = "my_metric" + appId;
		var metric = {};

		metric.my_metric = ob.params.qstring.my_metric;
		metric.my_metric_count = ob.params.qstring.my_metric_count;
		metric.date = date;

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

	plugins.register("/o/my-metric", function (ob) {
		var params = ob.params;
		var appId = params.qstring.app_id;

		if (!params.qstring.app_key && !params.qstring.device_id) {
			return false;
		}
		var collectionName = "my_metric" + appId;
		
		if(params.qstring.method == "top-metric-values"){
			common.db.collection(collectionName).find({}).toArray(function (err, res) {
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
						uniques.push({"my_metric":obj.my_metric,"my_metric_count":obj.my_metric_count});
					}
				})
				uniques.sort(compare);
				var finalArray = [uniques[uniques.length - 1],uniques[uniques.length - 2],uniques[uniques.length - 3]];
				common.returnOutput(params, JSON.parse(JSON.stringify(finalArray)));
				return true;
			});

			return true;
		
		
		}
		else if (params.qstring.method == "top-metric-dates") {
			common.db.collection(collectionName).find({}).toArray(function (err, res) {
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
		else {
			common.db.collection(collectionName).find({}).toArray(function (err, res) {
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
