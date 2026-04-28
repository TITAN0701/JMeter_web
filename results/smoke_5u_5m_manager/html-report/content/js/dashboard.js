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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 52, 0, 0.0, 25.807692307692303, 12, 424, 16.0, 22.700000000000003, 46.64999999999978, 424.0, 36.95806680881308, 67.3890591684435, 33.76671330845771], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/global/role/list-672", 2, 0, 0.0, 15.0, 14, 16, 15.0, 16.0, 16.0, 16.0, 3.571428571428571, 2.4274553571428568, 3.2958984374999996], "isController": false}, {"data": ["test1/cskapi/api/onboarding-660", 2, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 3.8610038610038613, 3.1936233108108105, 3.514116795366795], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-684", 2, 0, 0.0, 19.5, 19, 20, 19.5, 20.0, 20.0, 20.0, 3.6231884057971016, 11.527683423913043, 3.513502038043478], "isController": false}, {"data": ["test1/cskapi/api/child/mine-695", 2, 0, 0.0, 13.5, 13, 14, 13.5, 14.0, 14.0, 14.0, 3.5778175313059033, 1.020237030411449, 3.238903175313059], "isController": false}, {"data": ["test1/cskapi/api/child/mine-696", 2, 0, 0.0, 14.5, 14, 15, 14.5, 15.0, 15.0, 15.0, 3.5778175313059033, 1.020237030411449, 3.238903175313059], "isController": false}, {"data": ["test1/cskapi/api/child/mine-697", 2, 0, 0.0, 16.5, 14, 19, 16.5, 19.0, 19.0, 19.0, 3.552397868561279, 1.0129884547069272, 3.22976798401421], "isController": false}, {"data": ["test1/cskapi/api/child/paged-674", 2, 0, 0.0, 18.5, 17, 20, 18.5, 20.0, 20.0, 20.0, 3.552397868561279, 16.11414853463588, 3.358126110124334], "isController": false}, {"data": ["test1/cskapi/api/child/paged-675", 2, 0, 0.0, 17.0, 15, 19, 17.0, 19.0, 19.0, 19.0, 3.5906642728904847, 16.28773002692998, 3.3942998204667862], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-687", 2, 0, 0.0, 18.5, 16, 21, 18.5, 21.0, 21.0, 21.0, 3.6101083032490977, 11.486067238267147, 3.5008179151624548], "isController": false}, {"data": ["test1/assets/_assessmentId_-BmgnFdQE.js-679", 2, 0, 0.0, 13.5, 12, 15, 13.5, 15.0, 15.0, 15.0, 3.6429872495446265, 4.233549635701275, 2.074083561020036], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-686", 2, 0, 0.0, 17.0, 16, 18, 17.0, 18.0, 18.0, 18.0, 3.629764065335753, 10.71560231397459, 3.519878629764065], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-685", 2, 0, 0.0, 16.0, 15, 17, 16.0, 17.0, 17.0, 17.0, 3.6363636363636362, 13.405539772727272, 3.5262784090909087], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-690", 2, 0, 0.0, 17.5, 15, 20, 17.5, 20.0, 20.0, 20.0, 3.571428571428571, 2.594866071428571, 3.2958984374999996], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-659", 2, 0, 0.0, 24.5, 22, 27, 24.5, 27.0, 27.0, 27.0, 3.780718336483932, 12.682390122873345, 3.437352315689981], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-673", 2, 0, 0.0, 14.5, 14, 15, 14.5, 15.0, 15.0, 15.0, 3.5842293906810037, 2.6041666666666665, 3.307711693548387], "isController": false}, {"data": ["test1/cskapi/api/account-661", 2, 0, 0.0, 16.5, 14, 19, 16.5, 19.0, 19.0, 19.0, 3.8461538461538463, 1.8592247596153846, 3.5268930288461537], "isController": false}, {"data": ["test1/cskapi/api/question/directions-683", 2, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 3.676470588235294, 1.8920898437499998, 3.453871783088235], "isController": false}, {"data": ["test1/cskapi/api/global/role/list-689", 2, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 3.6101083032490977, 2.4537454873646207, 3.331594088447653], "isController": false}, {"data": ["test1/cskapi/api/question/ages-668", 2, 0, 0.0, 17.0, 12, 22, 17.0, 22.0, 22.0, 22.0, 3.669724770642202, 1.7811066513761467, 3.426032110091743], "isController": false}, {"data": ["test1/cskapi/api/child/165-677", 2, 0, 0.0, 17.5, 17, 18, 17.5, 18.0, 18.0, 18.0, 3.6036036036036037, 2.7942004504504503, 3.357263513513513], "isController": false}, {"data": ["test1/cskapi/api/auth/login-658", 2, 0, 0.0, 248.0, 72, 424, 248.0, 424.0, 424.0, 424.0, 2.1436227224008575, 1.7354133172561628, 1.5658494105037513], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-670", 2, 0, 0.0, 19.0, 18, 20, 19.0, 20.0, 20.0, 20.0, 3.552397868561279, 11.302453374777976, 3.4448545737122562], "isController": false}, {"data": ["test1/cskapi/api/question/ages-682", 2, 0, 0.0, 13.5, 13, 14, 13.5, 14.0, 14.0, 14.0, 3.676470588235294, 1.784380744485294, 3.432329963235294], "isController": false}, {"data": ["test1/cskapi/api/child/paged-664", 2, 0, 0.0, 24.5, 16, 33, 24.5, 33.0, 33.0, 33.0, 3.7037037037037037, 16.80049189814815, 3.501157407407407], "isController": false}, {"data": ["test1/cskapi/api/child/paged-700", 2, 0, 0.0, 16.0, 15, 17, 16.0, 17.0, 17.0, 17.0, 3.5460992907801416, 16.08557734929078, 3.352171985815603], "isController": false}, {"data": ["test1/cskapi/api/question/directions-669", 2, 0, 0.0, 18.0, 13, 23, 18.0, 23.0, 23.0, 23.0, 3.5971223021582737, 1.851253372302158, 3.379327787769784], "isController": false}]}, function(index, item){
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
