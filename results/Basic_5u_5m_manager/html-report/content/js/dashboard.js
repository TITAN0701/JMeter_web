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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "test1/cskapi/api/auth/menu-807"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-818"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/dept/list-817"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-812"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-822"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/role/list-816"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-819"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-820"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-809"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-831"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-810"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-821"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-832"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/login-806"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/onboarding-808"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-827"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-813"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-829"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-814"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 38, 0, 0.0, 41.973684210526315, 12, 400, 24.5, 83.70000000000002, 154.89999999999927, 400.0, 2.464172232669736, 4.492149503923222, 2.2724186985279813], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/auth/menu-807", 2, 0, 0.0, 20.0, 15, 25, 20.0, 25.0, 25.0, 25.0, 0.2678093197643278, 0.898364270889127, 0.24348679365291911], "isController": false}, {"data": ["test1/cskapi/api/question/ages-818", 2, 0, 0.0, 19.0, 14, 24, 19.0, 24.0, 24.0, 24.0, 0.22449208665394546, 0.10895758502637781, 0.20958440902458186], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-817", 2, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 0.23372677340189318, 0.16981710879981302, 0.21569511803202057], "isController": false}, {"data": ["test1/cskapi/api/question/ages-812", 2, 0, 0.0, 13.0, 12, 14, 13.0, 14.0, 14.0, 14.0, 0.2828854314002829, 0.13729888613861385, 0.2641000707213578], "isController": false}, {"data": ["test1/cskapi/api/child/165-822", 2, 0, 0.0, 22.5, 19, 26, 22.5, 26.0, 26.0, 26.0, 0.2665600426496068, 0.2066881580701053, 0.24833816473410636], "isController": false}, {"data": ["test1/cskapi/api/global/role/list-816", 2, 0, 0.0, 25.0, 22, 28, 25.0, 28.0, 28.0, 28.0, 0.2388630120625821, 0.1623522035112863, 0.22043510390541027], "isController": false}, {"data": ["test1/cskapi/api/question/directions-819", 2, 0, 0.0, 28.0, 24, 32, 28.0, 32.0, 32.0, 32.0, 0.21454623471358078, 0.11041588446685262, 0.20155613065865696], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-820", 2, 0, 0.0, 51.5, 31, 72, 51.5, 72.0, 72.0, 72.0, 0.22036139268400176, 0.7011107591449978, 0.21369029583516966], "isController": false}, {"data": ["test1/cskapi/api/account-809", 2, 0, 0.0, 30.0, 29, 31, 30.0, 31.0, 31.0, 31.0, 0.32792261026397773, 0.15851727742252827, 0.30070247171667486], "isController": false}, {"data": ["test1/cskapi/api/child/paged-831", 2, 0, 0.0, 26.5, 21, 32, 26.5, 32.0, 32.0, 32.0, 0.2901494269548818, 1.3161563361381112, 0.2742818801682867], "isController": false}, {"data": ["test1/cskapi/api/child/paged-810", 2, 0, 0.0, 57.0, 15, 99, 57.0, 99.0, 99.0, 99.0, 0.32954358213873786, 1.4948534560883178, 0.3115216674905256], "isController": false}, {"data": ["test1/cskapi/api/child/paged-821", 2, 0, 0.0, 84.0, 26, 142, 84.0, 142.0, 142.0, 142.0, 0.23129409043598936, 1.0491807129640338, 0.21864519486527118], "isController": false}, {"data": ["test1/cskapi/api/child/paged-832", 2, 0, 0.0, 30.5, 19, 42, 30.5, 42.0, 42.0, 42.0, 0.3179650238473768, 1.4112803060413355, 0.30057631160572335], "isController": false}, {"data": ["test1/cskapi/api/auth/login-806", 2, 0, 0.0, 241.0, 82, 400, 241.0, 400.0, 400.0, 400.0, 0.3067955207853965, 0.24837254563583372, 0.22410454057370763], "isController": false}, {"data": ["test1/cskapi/api/onboarding-808", 2, 0, 0.0, 14.5, 13, 16, 14.5, 16.0, 16.0, 16.0, 0.2771234585007621, 0.22922223569350147, 0.25222564777608425], "isController": false}, {"data": ["test1/cskapi/api/child/mine-827", 2, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 0.2937720329024677, 0.0837709312573443, 0.26594401806698004], "isController": false}, {"data": ["test1/cskapi/api/question/directions-813", 2, 0, 0.0, 15.0, 14, 16, 15.0, 16.0, 16.0, 16.0, 0.2519843769686279, 0.12968336588131535, 0.23672751039435555], "isController": false}, {"data": ["test1/cskapi/api/child/mine-829", 2, 0, 0.0, 46.0, 12, 80, 46.0, 80.0, 80.0, 80.0, 0.28340654669122856, 0.08081514807992064, 0.2565604187331727], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-814", 2, 0, 0.0, 31.0, 21, 41, 31.0, 41.0, 41.0, 41.0, 0.2609262883235486, 0.8301736790606653, 0.2530271526418787], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 38, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
