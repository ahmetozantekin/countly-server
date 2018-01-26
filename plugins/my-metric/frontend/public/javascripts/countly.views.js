window.metricview = countlyView.extend({

    initialize: function () {
    },
    beforeRender: function () {
        var self = this;
        return $.when($.get(countlyGlobal["path"] + '/my-metric/templates/mymetric.html', function (src) {
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
            "page-title": "MY METRIC"
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

        // if (!isRefresh) {
        //     $(this.el).html(this.template(this.templateData));
        //     this.updateView();

        //     var self = this;

        //     $('.ds').on('click', function () {
        //         var id = $(this).attr('id');

        //         $('.ds').removeClass('active').removeClass('selected');
        //         $(this).addClass('active').addClass('selected');

        //         switch (id) {
        //             case "ds_this":
        //                 self.date_range = self.getDateRange('current');
        //                 break;
        //             case "ds_previous":
        //                 self.date_range = self.getDateRange('previous');
        //                 break;
        //             case "ds_last_3":
        //                 self.date_range = self.getDateRange('last_3');
        //                 break;
        //             default:
        //                 self.date_range = self.getDateRange();
        //                 break;
        //         }

        //         $.when(
        //             timesOfDayPlugin.fetchTodData(self.tod_type, self.date_range),
        //             timesOfDayPlugin.fetchAllEvents()
        //         ).done(function (result) {
        //             self.timesOfDayData = timesOfDayPlugin.getTodData();
        //             self.eventsList = timesOfDayPlugin.getEventsList();
        //             self.updateView();
        //         });
        //     })
        // }
    },

    updateView: function () {
       
        this.loadProgressData();
        this.loadProgressDate();
        this.loadTable();
        // this.loadTimeOfDayTable();
    },

    loadProgressData: function (obj) {
        var elem = $('#valuesBar');

        var total = 0;
        if (obj) {
            Object.values(obj).forEach(function (o) {
                total += parseInt(o.my_metric_count);
            })
            var percent = (100 / total);
            var lastElemFixer = [];
            var totalNum = 0;
            var lenInc = 0;

            Object.values(obj).forEach(function (o) {
                o.my_metric_count = Math.round(o.my_metric_count * percent);
                lastElemFixer.push(o.my_metric_count);
            })
            for (i = 0; i < lastElemFixer.length; i++) {
                totalNum += lastElemFixer[i];
            }
            if (totalNum > 100) {
                var removeTotal = totalNum - 100;
                lastElemFixer[lastElemFixer.length - 1] = lastElemFixer[lastElemFixer.length - 1] - removeTotal;
            } else if (totalNum < 100) {
                var addTotal = 100 - totalNum;
                lastElemFixer[lastElemFixer.length - 1] = addTotal + lastElemFixer[lastElemFixer.length - 1];
            }
            Object.values(obj).forEach(function (o) {
                o.my_metric_count = Math.round(o.my_metric_count * percent);
                elem.find('.bar').append('<div class="bar-inner" style="width:' + lastElemFixer[lenInc] + '%;" data-item="' + o.my_metric + '"></div>');
                lenInc++;
            })
            elem.append('<div class="number" data-item="' + obj[0].my_metric + '" style="color: rgb(82, 163, 239);">' + obj[0].my_metric + '</div>');
        }



        var self = this;
        $(".es-option").on("click", function () {
            var value = $(this).data("value");
            self.tod_type = value;
            $.when(
                timesOfDayPlugin.fetchTodData(value, self.date_range),
                timesOfDayPlugin.fetchAllEvents()
            ).done(function (result) {
                self.timesOfDayData = timesOfDayPlugin.getTodData();
                self.eventsList = timesOfDayPlugin.getEventsList();
                self.updateView();
            });
        });
    },

    loadProgressDate: function (obj) {
        var elem = $('#valuesTimeBar');

        var total = 0;
        if (obj) {
            Object.values(obj).forEach(function (o) {
                total += parseInt(o.my_metric_count);
            })
            var percent = (100 / total);
            var lastElemFixer = [];
            var totalNum = 0;
            var lenInc = 0;

            Object.values(obj).forEach(function (o) {
                o.my_metric_count = Math.round(o.my_metric_count * percent);
                lastElemFixer.push(o.my_metric_count);
            })
            for (i = 0; i < lastElemFixer.length; i++) {
                totalNum += lastElemFixer[i];
            }
            if (totalNum > 100) {
                var removeTotal = totalNum - 100;
                lastElemFixer[lastElemFixer.length - 1] = lastElemFixer[lastElemFixer.length - 1] - removeTotal;
            } else if (totalNum < 100) {
                var addTotal = 100 - totalNum;
                lastElemFixer[lastElemFixer.length - 1] = addTotal + lastElemFixer[lastElemFixer.length - 1];
            }
            Object.values(obj).forEach(function (o) {
                o.my_metric_count = Math.round(o.my_metric_count * percent);
                elem.find('.bar').append('<div class="bar-inner" style="width:' + lastElemFixer[lenInc] + '%;" data-item="' + o.date + '"></div>');
                lenInc++;
            })
            elem.append('<div class="number" data-item="' + obj[0].date + '" style="color: rgb(82, 163, 239);">' + obj[0].date + '</div>');

            $('#dataTableMetrics_info').text('Showing 1 to ' + obj.length + ' of ' + obj.length + ' entries')
        }



        var self = this;
        $(".es-option").on("click", function () {
            var value = $(this).data("value");
            self.tod_type = value;
            $.when(
                timesOfDayPlugin.fetchTodData(value, self.date_range),
                timesOfDayPlugin.fetchAllEvents()
            ).done(function (result) {
                self.timesOfDayData = timesOfDayPlugin.getTodData();
                self.eventsList = timesOfDayPlugin.getEventsList();
                self.updateView();
            });
        });
    },

    drawGraph: function (data) {
        var formattedData = []
        data.forEach(function (d) {
            formattedData.push([data.indexOf(d), d.my_metric_count]);
        })
        //var data = countlyViews.getChartData(this.selectedViews[0], 'myMetric', props[this.selectedMetric]).chartDP;
        //[[0,20],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,12],[8,9],[9,10],[10,5],[11,8],[12,7],[13,9],[14,4],[15,6],[16,20],[17,0],[18,0],[19,0],[20,0],[21,0],[22,0],[23,12],[24,9],[25,10],[26,5],[27,8],[28,7],[29,9],[30,4],[31,6]]
        countlyCommon.drawTimeGraph([{
            "data": formattedData,
            "label": "ALL METRICS",
            "color": "#135f99"
        }], '#dashboard-graph');

        // var dp = [];
        // for(var i = 0;  i < this.selectedViews.length; i++){
        //     var color = countlyCommon.GRAPH_COLORS[i];
        //     var data = countlyViews.getChartData(this.selectedViews[i], this.selectedMetric, props[this.selectedMetric]).chartDP;
        //     data[1].color = color;
        //     $("#"+this.ids[this.selectedViews[i]]+" .color").css("background-color", color);
        //     if(this.selectedViews.length == 1){
        //         var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        //         data[0].color = "rgba("+parseInt(result[1], 16)+","+parseInt(result[2], 16)+","+parseInt(result[3], 16)+",0.5"+")";
        //         dp.push(data[0])
        //     }
        //     dp.push(data[1]);
        // }
        // countlyCommon.drawTimeGraph(dp, "#dashboard-graph");
    },

    loadTable: function (obj) {
        var self = this;
        var elem = $('#dataTableMetrics');
        
        if (obj) {
            Object.values(obj).forEach(function (o) {
                elem.find('tbody').append('<tr><td class="sorting_1">' + o.date + '</td><td class="">' + o.my_metric_count + '</td></tr>')
            })
        }

        // var tableData = obj;
        // elem.DataTable();
    },

    loadTimeOfDayTable: function () {
        // var self = this;
        // var tableData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(function (h) {
        //     return {
        //         hour: h,
        //         sunday: self.timesOfDayData[0][h],
        //         monday: self.timesOfDayData[1][h],
        //         tuesday: self.timesOfDayData[2][h],
        //         wednesday: self.timesOfDayData[3][h],
        //         thursday: self.timesOfDayData[4][h],
        //         friday: self.timesOfDayData[5][h],
        //         saturday: self.timesOfDayData[6][h],
        //     }
        // });

        // this.dtable = $('#dataTableOne').dataTable($.extend({}, $.fn.dataTable.defaults, {
        //     "aaData": tableData,
        //     "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
        //     },
        //     "aoColumns": [
        //         {
        //             "mData": "hour", "mRender": function (hour, type) {
        //                 var nextHour = hour + 1 > 23 ? 0 : hour + 1;
        //                 return (hour < 10 ? "0" + hour : hour) + ":00 - " + (nextHour < 10 ? "0" + nextHour : nextHour) + ":00"
        //             }, "sType": "string", "sTitle": jQuery.i18n.map['times-of-day.hours']
        //         },
        //         { "mData": "monday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.monday'], "mRender" :function(d){
        //             return countlyCommon.formatNumber(d);
        //         }},
        //         { "mData": "tuesday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.tuesday'], "mRender" :function(d){
        //             return countlyCommon.formatNumber(d);
        //         }},
        //         { "mData": "wednesday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.wednesday'], "mRender" :function(d){
        //             return countlyCommon.formatNumber(d);
        //         }},
        //         { "mData": "thursday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.thursday'], "mRender" :function(d){
        //             return countlyCommon.formatNumber(d);
        //         } },
        //         { "mData": "friday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.friday'], "mRender" :function(d){
        //             return countlyCommon.formatNumber(d);
        //         } },
        //         { "mData": "saturday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.saturday'], "mRender" :function(d){
        //             return countlyCommon.formatNumber(d);
        //         } },
        //         { "mData": "sunday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.sunday'], "mRender" :function(d){
        //             return countlyCommon.formatNumber(d);
        //         } }
        //     ]
        // }));

        // this.dtable.stickyTableHeaders();
        // this.dtable.fnSort([[0, 'asc']]);
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

    //$('.sidebar-menu #analytics-submenu').append(menu);
});