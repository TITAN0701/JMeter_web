/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "test1/cskapi/api/child/6/avatar-606"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-596"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-609"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/164-627"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154/avatar-600"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/login-593"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account/5/avatar-645"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-646"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-597"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/163/growth/monitoring-630"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-632"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/163-629"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/menu-594"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/7/avatar-605"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/avatar-612"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/2/avatar-611"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-640"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/4/avatar-608"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/164/growth/monitoring-628"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account/5/avatar-598"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/8/avatar-603"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/onboarding-595"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-599"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-601"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/5/avatar-607"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-631"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3/avatar-610"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-643"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-644"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-602"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/36/avatar-604"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 31, 0, 0.0, 73.83870967741935, 14, 369, 44.0, 164.20000000000002, 363.59999999999997, 369.0, 13.17467063323417, 184.67448470038246, 10.610623406289841], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/child/6/avatar-606", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 141.31303267045456, 14.581853693181818], "isController": false}, {"data": ["test1/cskapi/api/account-596", 1, 0, 0.0, 26.0, 26, 26, 26.0, 26.0, 26.0, 26.0, 38.46153846153847, 20.69561298076923, 34.63040865384615], "isController": false}, {"data": ["test1/cskapi/api/child/165-609", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 28.718171296296298, 34.035011574074076], "isController": false}, {"data": ["test1/cskapi/api/child/164-627", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 55.454799107142854, 65.63895089285714], "isController": false}, {"data": ["test1/cskapi/api/child/154/avatar-600", 1, 0, 0.0, 50.0, 50, 50, 50.0, 50.0, 50.0, 50.0, 20.0, 281.40625, 12.87109375], "isController": false}, {"data": ["test1/cskapi/api/auth/login-593", 1, 0, 0.0, 360.0, 360, 360, 360.0, 360.0, 360.0, 360.0, 2.7777777777777777, 2.395290798611111, 2.029079861111111], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-645", 1, 0, 0.0, 76.0, 76, 76, 76.0, 76.0, 76.0, 76.0, 13.157894736842104, 594.739412006579, 8.519222861842106], "isController": false}, {"data": ["test1/cskapi/api/child/165-646", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 55.38504464285714, 65.63895089285714], "isController": false}, {"data": ["test1/cskapi/api/child/mine-597", 1, 0, 0.0, 73.0, 73, 73, 73.0, 73.0, 73.0, 73.0, 13.698630136986301, 180.32962328767124, 12.374250856164384], "isController": false}, {"data": ["test1/cskapi/api/child/163/growth/monitoring-630", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 48.7060546875, 58.53271484375], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-632", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 60.546875, 58.53271484375], "isController": false}, {"data": ["test1/cskapi/api/child/163-629", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 55.38504464285714, 65.63895089285714], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-594", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 54.361979166666664, 33.6009837962963], "isController": false}, {"data": ["test1/cskapi/api/child/7/avatar-605", 1, 0, 0.0, 170.0, 170, 170, 170.0, 170.0, 170.0, 170.0, 5.88235294117647, 35.07582720588235, 3.774126838235294], "isController": false}, {"data": ["test1/cskapi/api/child/1/avatar-612", 1, 0, 0.0, 139.0, 139, 139, 139.0, 139.0, 139.0, 139.0, 7.194244604316547, 289.6245503597122, 4.61583857913669], "isController": false}, {"data": ["test1/cskapi/api/child/2/avatar-611", 1, 0, 0.0, 80.0, 80, 80, 80.0, 80.0, 80.0, 80.0, 12.5, 531.103515625, 8.02001953125], "isController": false}, {"data": ["test1/cskapi/api/account-640", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 31.652113970588232, 52.9641544117647], "isController": false}, {"data": ["test1/cskapi/api/child/4/avatar-608", 1, 0, 0.0, 100.0, 100, 100, 100.0, 100.0, 100.0, 100.0, 10.0, 235.1171875, 6.416015625], "isController": false}, {"data": ["test1/cskapi/api/child/164/growth/monitoring-628", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 56.98529411764706, 55.08961397058823], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-598", 1, 0, 0.0, 134.0, 134, 134, 134.0, 134.0, 134.0, 134.0, 7.462686567164179, 337.31489039179104, 4.707905783582089], "isController": false}, {"data": ["test1/cskapi/api/child/8/avatar-603", 1, 0, 0.0, 63.0, 63, 63, 63.0, 63.0, 63.0, 63.0, 15.873015873015872, 127.12363591269842, 10.184151785714286], "isController": false}, {"data": ["test1/cskapi/api/onboarding-595", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 43.534128289473685, 47.80016447368421], "isController": false}, {"data": ["test1/cskapi/api/child/165-599", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 48.4619140625, 56.396484375], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-601", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 48.4375, 46.826171875], "isController": false}, {"data": ["test1/cskapi/api/child/5/avatar-607", 1, 0, 0.0, 101.0, 101, 101, 101.0, 101.0, 101.0, 101.0, 9.900990099009901, 716.2940903465346, 6.352490717821782], "isController": false}, {"data": ["test1/cskapi/api/child/165-631", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 51.692708333333336, 61.263020833333336], "isController": false}, {"data": ["test1/cskapi/api/child/3/avatar-610", 1, 0, 0.0, 369.0, 369, 369, 369.0, 369.0, 369.0, 369.0, 2.710027100271003, 49.495045731707314, 1.7387576219512195], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-643", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 56.98529411764706, 55.08961397058823], "isController": false}, {"data": ["test1/cskapi/api/child/mine-644", 1, 0, 0.0, 56.0, 56, 56, 56.0, 56.0, 56.0, 56.0, 17.857142857142858, 235.07254464285714, 16.427176339285715], "isController": false}, {"data": ["test1/cskapi/api/child/mine-602", 1, 0, 0.0, 58.0, 58, 58, 58.0, 58.0, 58.0, 58.0, 17.241379310344826, 226.9665948275862, 15.86072198275862], "isController": false}, {"data": ["test1/cskapi/api/child/36/avatar-604", 1, 0, 0.0, 141.0, 141, 141, 141.0, 141.0, 141.0, 141.0, 7.092198581560283, 425.3795434397164, 4.557291666666667], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 31, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
