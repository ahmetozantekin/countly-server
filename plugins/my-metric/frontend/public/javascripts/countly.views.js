window.metricview = countlyView.extend({

    initialize: function () {
    },

    beforeRender: function () {
        var self = this;
        return $.when(
            $.get(countlyGlobal["path"] + '/my-metric/templates/mymetric.html', 
            function (src) {
                self.template = Handlebars.compile(src);
            }),
            myMetricPlugin.getTopMetricValues()
        ).then(function () { 
            self.updateView();
        });

    },
   
    renderCommon: function (isRefresh) {
        var self = this;
        this.templateData = {
            "page-title": jQuery.i18n.map["my-metric.plugin-title"],
            "top-metric-values-title": jQuery.i18n.map["my-metric.top-metric-values-title"],
            "top-dates-title": jQuery.i18n.map["my-metric.top-date-title"]
        } 

        $(this.el).html(this.template(this.templateData))
        this.updateView();
        
        myMetricPlugin.getTopMetricValues()
            .then(function (response) {
                self.loadProgressData(response)
            })

        myMetricPlugin.getTopMetricDates()
            .then(function (response) {
                self.loadProgressDate(response)
            })

        myMetricPlugin.getAllData()
            .then(function (response) {
                self.loadTable(response);
                self.drawGraph(response);
            })

        $('.date-selector, #date-submit').click(function(){
           myMetricPlugin.getAllData()
           .then(function (response) {
               self.drawGraph(response);
               self.updateView();
               $('#date-picker').hide();
            })
        })
    },

    updateView: function () {
        this.loadProgressData();
        this.loadProgressDate();
        this.loadTable();
    },

    loadProgressData: function (obj) {
        var elem = $('#valuesBar');
        var total = 0;
        if (obj) {
            // Percentage configuration of bar chart
            Object.values(obj).forEach(function (o) { total += parseInt(o.my_metric_count); })
            
            // the ratio of the sum of the values to 100
            var percent = (100 / total);
            var lastElemFixer = [];
            var totalNum = 0;
            var lenInc = 0;

            Object.values(obj).forEach(function (o) {
                o.my_metric_count = Math.round(o.my_metric_count * percent);
                lastElemFixer.push(o.my_metric_count);
                totalNum += o.my_metric_count;
            })

            // Percentage adjustment
            // If top 3 values counter bigger or smaller than 100, last value of array configure
            if (totalNum > 100) {
                var removeTotal = totalNum - 100;
                lastElemFixer[lastElemFixer.length - 1] = lastElemFixer[lastElemFixer.length - 1] - removeTotal;
            } else if (totalNum < 100) {
                var addTotal = 100 - totalNum;
                lastElemFixer[lastElemFixer.length - 1] = addTotal + lastElemFixer[lastElemFixer.length - 1];
            }

            Object.values(obj).forEach(function (o) {
                // Inject innner elements in .bar class element after every 3 element after the percentile
                o.my_metric_count = Math.round(o.my_metric_count * percent);
                elem.find('.bar').append('<div class="bar-inner" style="width:' + lastElemFixer[lenInc] + '%;" data-item="' + o.my_metric + '"></div>');
                lenInc++;
            })
            elem.append('<div class="number" data-item="' + obj[0].my_metric + '" style="color: rgb(82, 163, 239);">' + obj[0].my_metric + '</div>');
        }
    },

    loadProgressDate: function (obj) {

        var self = this;
        var elem = $('#valuesTimeBar');
        var total = 0;

        if (obj) {
            // Percentage configuration of bar chart
            Object.values(obj).forEach(function (o) {total += parseInt(o.my_metric_count); })

            // the ratio of the sum of the values to 100
            var percent = (100 / total);
            var lastElemFixer = [];
            var totalNum = 0;
            var lenInc = 0;

            Object.values(obj).forEach(function (o) {
                o.my_metric_count = Math.round(o.my_metric_count * percent);
                lastElemFixer.push(o.my_metric_count);
                totalNum += o.my_metric_count;
            })
           

            // Percentage adjustment
            // If top 3 values counter bigger or smaller than 100, last value of array configure
            if (totalNum > 100) {
                var removeTotal = totalNum - 100;
                lastElemFixer[lastElemFixer.length - 1] = lastElemFixer[lastElemFixer.length - 1] - removeTotal;
            } else if (totalNum < 100) {
                var addTotal = 100 - totalNum;
                lastElemFixer[lastElemFixer.length - 1] = addTotal + lastElemFixer[lastElemFixer.length - 1];
            }
            Object.values(obj).forEach(function (o) {
                // Inject innner elements in .bar class element after every 3 element after the percentile
                o.my_metric_count = Math.round(o.my_metric_count * percent);
                elem.find('.bar').append('<div class="bar-inner" style="width:' + lastElemFixer[lenInc] + '%;" data-item="' + self.formatDate(o.date) + '"></div>');
                lenInc++;
            })
            elem.append('<div class="number" data-item="' + self.formatDate(obj[0].date) + '" style="color: rgb(82, 163, 239);">' + self.formatDate(obj[0].date) + '</div>');
        }
    },

    drawGraph: function (data) {
        var formattedData = [];
        // formattedData array is filled from the objects metric count values
        data.forEach(function (d) { formattedData.push([data.indexOf(d), d.my_metric_count]); })
        countlyCommon.drawTimeGraph([{
            "data": formattedData,
            "label": "ALL METRICS",
            "color": "#135f99"
        }], '#dashboard-graph');
    },
    formatDate: function(d) {
        var date = new Date(d);
        var Year = date.getFullYear();
        var Day  = date.getDate();
        var Month = date.getMonth();
        
        var months = [$.i18n.map["my-metric.months.jan"],$.i18n.map["my-metric.months.feb"],$.i18n.map["my-metric.months.mar"],$.i18n.map["my-metric.months.apr"],$.i18n.map["my-metric.months.may"],$.i18n.map["my-metric.months.jun"],$.i18n.map["my-metric.months.jul"],$.i18n.map["my-metric.months.aug"],$.i18n.map["my-metric.months.sep"],$.i18n.map["my-metric.months.oct"],$.i18n.map["my-metric.months.nov"],$.i18n.map["my-metric.months.dec"]];

        return Day + " " + months[parseInt(Month)] + ", " + Year;
    },
    loadTable: function (obj) {
        var self = this;
        var elem = $('#dataTableMetrics');
        
        if (obj) {
            this.dtable = elem.dataTable($.extend({}, $.fn.dataTable.defaults, {
                "aaData": obj,
                "aoColumns": [
                    { 
                        "mData": "date",            
                        sType:"formatted-num", 
                        "sTitle": jQuery.i18n.map["my-metric.table-date-title"],
                        "mRender":function(d) {return self.formatDate(d)}
                    },
                    { 
                       "mData": "my_metric_count", 
                       sType:"formatted-num", 
                       "mRender":function(d) { return countlyCommon.formatNumber(d); }, 
                       "sTitle": jQuery.i18n.map["my-metric.table-my-metric-count"]
                    },
                ]
            }));
            this.dtable.fnSort( [ [1,'desc'] ] );
            elem.stickyTableHeaders();
        }

    },

    refresh: function () {
    },

});

app.metricview = new metricview();

app.route('/analytics/my-metric', 'my-metric', function () {
    this.renderWhenReady(this.metricview);
});

$(document).ready(function () {
    var menu = '<a href="#/analytics/my-metric" class="item analytics" id="sidebar-events">' +
        '<div class="logo events">' +
        '<i class="material-icons">bubble_chart</i>' +
        '</div>' +
        '<div class="text" data-localize="sidebar.metric">My Metric</div>' +
        '</a>';

    $('#web-type').append(menu);
});