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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 31, 0, 0.0, 118.67741935483875, 16, 493, 55.0, 404.6, 448.5999999999999, 493.0, 8.251264306627629, 115.6611824594091, 6.6454077388874095], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/child/6/avatar-606", 1, 0, 0.0, 154.0, 154, 154, 154.0, 154.0, 154.0, 154.0, 6.493506493506494, 40.37515219155844, 4.166243912337662], "isController": false}, {"data": ["test1/cskapi/api/account-596", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 33.63037109375, 56.2744140625], "isController": false}, {"data": ["test1/cskapi/api/child/165-609", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 45.611213235294116, 54.05560661764706], "isController": false}, {"data": ["test1/cskapi/api/child/164-627", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 48.52294921875, 57.43408203125], "isController": false}, {"data": ["test1/cskapi/api/child/154/avatar-600", 1, 0, 0.0, 98.0, 98, 98, 98.0, 98.0, 98.0, 98.0, 10.204081632653061, 143.57461734693877, 6.5668845663265305], "isController": false}, {"data": ["test1/cskapi/api/auth/login-593", 1, 0, 0.0, 493.0, 493, 493, 493.0, 493.0, 493.0, 493.0, 2.028397565922921, 1.749096729208925, 1.4816810344827587], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-645", 1, 0, 0.0, 64.0, 64, 64, 64.0, 64.0, 64.0, 64.0, 15.625, 706.2530517578125, 10.1165771484375], "isController": false}, {"data": ["test1/cskapi/api/child/165-646", 1, 0, 0.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 47.61904761904761, 36.923363095238095, 43.759300595238095], "isController": false}, {"data": ["test1/cskapi/api/child/mine-597", 1, 0, 0.0, 102.0, 102, 102, 102.0, 102.0, 102.0, 102.0, 9.803921568627452, 129.0594362745098, 8.85608149509804], "isController": false}, {"data": ["test1/cskapi/api/child/163/growth/monitoring-630", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 38.96484375, 46.826171875], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-632", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 56.98529411764706, 55.08961397058823], "isController": false}, {"data": ["test1/cskapi/api/child/163-629", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 45.611213235294116, 54.05560661764706], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-594", 1, 0, 0.0, 24.0, 24, 24, 24.0, 24.0, 24.0, 24.0, 41.666666666666664, 61.1572265625, 37.801106770833336], "isController": false}, {"data": ["test1/cskapi/api/child/7/avatar-605", 1, 0, 0.0, 53.0, 53, 53, 53.0, 53.0, 53.0, 53.0, 18.867924528301884, 112.50737028301887, 12.105689858490566], "isController": false}, {"data": ["test1/cskapi/api/child/1/avatar-612", 1, 0, 0.0, 375.0, 375, 375, 375.0, 375.0, 375.0, 375.0, 2.6666666666666665, 107.35416666666667, 1.7109375], "isController": false}, {"data": ["test1/cskapi/api/child/2/avatar-611", 1, 0, 0.0, 142.0, 142, 142, 142.0, 142.0, 142.0, 142.0, 7.042253521126761, 299.21324823943667, 4.518320862676057], "isController": false}, {"data": ["test1/cskapi/api/account-640", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 29.893663194444446, 50.02170138888889], "isController": false}, {"data": ["test1/cskapi/api/child/4/avatar-608", 1, 0, 0.0, 280.0, 280, 280, 280.0, 280.0, 280.0, 280.0, 3.571428571428571, 83.97042410714285, 2.291434151785714], "isController": false}, {"data": ["test1/cskapi/api/child/164/growth/monitoring-628", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 56.98529411764706, 55.08961397058823], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-598", 1, 0, 0.0, 419.0, 419, 419, 419.0, 419.0, 419.0, 419.0, 2.3866348448687353, 107.87636112768497, 1.5056309665871122], "isController": false}, {"data": ["test1/cskapi/api/child/8/avatar-603", 1, 0, 0.0, 120.0, 120, 120, 120.0, 120.0, 120.0, 120.0, 8.333333333333334, 66.73990885416667, 5.3466796875], "isController": false}, {"data": ["test1/cskapi/api/onboarding-595", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 48.655790441176464, 53.423713235294116], "isController": false}, {"data": ["test1/cskapi/api/child/165-599", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 43.07725694444445, 50.130208333333336], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-601", 1, 0, 0.0, 294.0, 294, 294, 294.0, 294.0, 294.0, 294.0, 3.401360544217687, 3.2950680272108843, 3.185453869047619], "isController": false}, {"data": ["test1/cskapi/api/child/5/avatar-607", 1, 0, 0.0, 130.0, 130, 130, 130.0, 130.0, 130.0, 130.0, 7.6923076923076925, 556.5054086538462, 4.935396634615384], "isController": false}, {"data": ["test1/cskapi/api/child/165-631", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 40.81003289473684, 48.3655427631579], "isController": false}, {"data": ["test1/cskapi/api/child/3/avatar-610", 1, 0, 0.0, 412.0, 412, 412, 412.0, 412.0, 412.0, 412.0, 2.4271844660194173, 44.32930066747573, 1.5572853458737865], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-643", 1, 0, 0.0, 24.0, 24, 24, 24.0, 24.0, 24.0, 24.0, 41.666666666666664, 40.364583333333336, 39.021809895833336], "isController": false}, {"data": ["test1/cskapi/api/child/mine-644", 1, 0, 0.0, 55.0, 55, 55, 55.0, 55.0, 55.0, 55.0, 18.18181818181818, 239.3465909090909, 16.725852272727273], "isController": false}, {"data": ["test1/cskapi/api/child/mine-602", 1, 0, 0.0, 84.0, 84, 84, 84.0, 84.0, 84.0, 84.0, 11.904761904761903, 156.71502976190476, 10.951450892857142], "isController": false}, {"data": ["test1/cskapi/api/child/36/avatar-604", 1, 0, 0.0, 143.0, 143, 143, 143.0, 143.0, 143.0, 143.0, 6.993006993006993, 419.4301791958042, 4.493553321678322], "isController": false}]}, function(index, item){
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
