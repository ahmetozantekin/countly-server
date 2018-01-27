var request = require('supertest');
var should = require('should');
var testUtils = require("../../test/testUtils");
request = request.agent(testUtils.url);

var APP_KEY = "";
var API_KEY_ADMIN = "";
var APP_ID = "";
var DEVICE_ID = "1234567890";


describe('Testing My Metric', function () {

    var getAllMetrics = function(done){
        API_KEY_ADMIN = testUtils.get("API_KEY_ADMIN");
        APP_ID = testUtils.get("APP_ID");
        APP_KEY = testUtils.get("APP_KEY");

        
        request
            .get('/o/my-metric?api_key=' + API_KEY_ADMIN + "&app_key=" + API_KEY_ADMIN + "&app_id=" + APP_ID)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            });
    }

    it('Should get all metrics', function (done) {
        getAllMetrics(done);
    });

    it('Should add new metric', function(done){
        APP_ID = testUtils.get("APP_ID");
        APP_KEY = testUtils.get("APP_KEY");

        var url = '/i?app_key=' + APP_KEY 
                + '&app_id=' + APP_ID 
                + '&device_id=' + DEVICE_ID 
                + '&my_metric=value1'
                + '&my_metric_count=10';
        
        request
            .get(url)
            .expect(200)
            .end(function(err, res){
                if(err)
                    done(err);
                var ob = JSON.parse(res.text);
                ob.result.should.eql("Success");
                setTimeout(done, 1000)
            })
    });

})