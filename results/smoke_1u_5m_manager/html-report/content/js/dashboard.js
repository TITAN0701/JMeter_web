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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "test1/cskapi/api/global/role/list-672"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/onboarding-660"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-684"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-695"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-696"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-697"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-674"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-675"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-687"], "isController": false}, {"data": [1.0, 500, 1500, "test1/assets/_assessmentId_-BmgnFdQE.js-679"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-686"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-685"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/dept/list-690"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/menu-659"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/dept/list-673"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-661"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-683"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/role/list-689"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-668"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-677"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/login-658"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-670"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-682"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-664"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-700"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-669"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 52, 0, 0.0, 33.69230769230769, 11, 494, 16.0, 71.30000000000008, 141.1999999999996, 494.0, 28.602860286028605, 52.13973545792079, 26.13298439218922], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/global/role/list-672", 2, 0, 0.0, 15.5, 15, 16, 15.5, 16.0, 16.0, 16.0, 3.4246575342465753, 2.327696917808219, 3.1604505565068495], "isController": false}, {"data": ["test1/cskapi/api/onboarding-660", 2, 0, 0.0, 14.5, 14, 15, 14.5, 15.0, 15.0, 15.0, 3.0911901081916535, 2.5568730680061824, 2.8134659969088096], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-684", 2, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 3.838771593090211, 12.213591650671784, 3.722558781190019], "isController": false}, {"data": ["test1/cskapi/api/child/mine-695", 2, 0, 0.0, 12.5, 12, 13, 12.5, 13.0, 13.0, 13.0, 3.875968992248062, 1.1052567829457365, 3.5088117732558137], "isController": false}, {"data": ["test1/cskapi/api/child/mine-696", 2, 0, 0.0, 13.5, 13, 14, 13.5, 14.0, 14.0, 14.0, 3.8684719535783367, 1.1031189555125724, 3.502024903288201], "isController": false}, {"data": ["test1/cskapi/api/child/mine-697", 2, 0, 0.0, 12.5, 11, 14, 12.5, 14.0, 14.0, 14.0, 3.883495145631068, 1.1074029126213591, 3.5307949029126213], "isController": false}, {"data": ["test1/cskapi/api/child/paged-674", 2, 0, 0.0, 17.0, 16, 18, 17.0, 18.0, 18.0, 18.0, 3.4305317324185247, 15.561347555746142, 3.242924528301887], "isController": false}, {"data": ["test1/cskapi/api/child/paged-675", 2, 0, 0.0, 16.5, 15, 18, 16.5, 18.0, 18.0, 18.0, 3.442340791738382, 15.614915017211706, 3.2540877796901895], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-687", 2, 0, 0.0, 18.0, 15, 21, 18.0, 21.0, 21.0, 21.0, 3.8314176245210727, 12.19019396551724, 3.7154274425287355], "isController": false}, {"data": ["test1/assets/_assessmentId_-BmgnFdQE.js-679", 2, 0, 0.0, 13.5, 12, 15, 13.5, 15.0, 15.0, 15.0, 3.8910505836575875, 4.521826361867705, 2.2153149319066148], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-686", 2, 0, 0.0, 20.5, 18, 23, 20.5, 23.0, 23.0, 23.0, 3.8095238095238093, 11.246279761904761, 3.6941964285714284], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-685", 2, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 3.8535645472061657, 14.206256021194605, 3.736903901734104], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-690", 2, 0, 0.0, 13.5, 12, 15, 13.5, 15.0, 15.0, 15.0, 3.875968992248062, 2.8161337209302326, 3.5769440406976742], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-659", 2, 0, 0.0, 102.0, 16, 188, 102.0, 188.0, 188.0, 188.0, 2.4360535931790497, 8.171722746650428, 2.214810444579781], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-673", 2, 0, 0.0, 17.0, 14, 20, 17.0, 20.0, 20.0, 20.0, 3.395585738539898, 2.4671052631578947, 3.1336216044142615], "isController": false}, {"data": ["test1/cskapi/api/account-661", 2, 0, 0.0, 15.0, 14, 16, 15.0, 16.0, 16.0, 16.0, 3.0959752321981426, 1.4965895897832817, 2.838985100619195], "isController": false}, {"data": ["test1/cskapi/api/question/directions-683", 2, 0, 0.0, 15.0, 13, 17, 15.0, 17.0, 17.0, 17.0, 3.898635477582846, 2.0064266569200777, 3.662585282651072], "isController": false}, {"data": ["test1/cskapi/api/global/role/list-689", 2, 0, 0.0, 13.5, 13, 14, 13.5, 14.0, 14.0, 14.0, 3.883495145631068, 2.6395631067961163, 3.583889563106796], "isController": false}, {"data": ["test1/cskapi/api/question/ages-668", 2, 0, 0.0, 32.5, 14, 51, 32.5, 51.0, 51.0, 51.0, 3.1298904538341157, 1.4977014866979654, 2.922046165884194], "isController": false}, {"data": ["test1/cskapi/api/child/165-677", 2, 0, 0.0, 49.5, 19, 80, 49.5, 80.0, 80.0, 80.0, 3.4364261168384878, 2.6645725945017182, 3.2015141752577323], "isController": false}, {"data": ["test1/cskapi/api/auth/login-658", 2, 0, 0.0, 287.5, 81, 494, 287.5, 494.0, 494.0, 494.0, 1.5325670498084292, 1.240720785440613, 1.119492337164751], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-670", 2, 0, 0.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 3.3557046979865772, 10.67664639261745, 3.2541159815436242], "isController": false}, {"data": ["test1/cskapi/api/question/ages-682", 2, 0, 0.0, 12.5, 12, 13, 12.5, 13.0, 13.0, 13.0, 3.898635477582846, 1.892208820662768, 3.63974171539961], "isController": false}, {"data": ["test1/cskapi/api/child/paged-664", 2, 0, 0.0, 17.5, 16, 19, 17.5, 19.0, 19.0, 19.0, 3.10077519379845, 14.065528100775193, 2.931201550387597], "isController": false}, {"data": ["test1/cskapi/api/child/paged-700", 2, 0, 0.0, 68.5, 21, 116, 68.5, 116.0, 116.0, 116.0, 3.246753246753247, 14.727703936688313, 3.069196428571429], "isController": false}, {"data": ["test1/cskapi/api/question/directions-669", 2, 0, 0.0, 19.0, 13, 25, 19.0, 25.0, 25.0, 25.0, 3.3333333333333335, 1.6943359375, 3.131510416666667], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 52, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
