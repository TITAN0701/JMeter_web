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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9907407407407407, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "test1/cskapi/api/child/152/growth/monitoring-770"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/162-759"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-801"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/6/avatar-747"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-794"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/growth/monitoring-784"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/detection/history/trends-787"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154/growth/monitoring-768"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3-778"], "isController": false}, {"data": [0.75, 500, 1500, "test1/cskapi/api/account/5/avatar-739"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/growth/monitoring-790"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/onboarding-736"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154-767"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/8/avatar-743"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/133/growth/monitoring-777"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/133-775"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-746"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-737"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/164/growth/monitoring-755"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-792"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1-782"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154/avatar-741"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/162/growth/monitoring-760"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/152-769"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/163/growth/monitoring-757"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-793"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-740"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/161/growth/monitoring-762"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-799"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/160-763"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/159-765"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/avatar-752"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-738"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/menu-735"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/7/avatar-744"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/159/growth/monitoring-766"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/164-754"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/2/avatar-751"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/4/avatar-749"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3/growth/monitoring-781"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/160/growth/monitoring-764"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account/5/avatar-796"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/139-772"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-753"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-797"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/161-761"], "isController": false}, {"data": [0.75, 500, 1500, "test1/cskapi/api/auth/login-734"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/36/avatar-742"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/5/avatar-748"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/163-756"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3/avatar-750"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/139/growth/monitoring-774"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-745"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-800"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 108, 0, 0.0, 79.02777777777774, 14, 818, 40.5, 136.60000000000014, 289.9499999999999, 794.6899999999991, 2.8146256287300306, 24.210636369263245, 2.4129652765109064], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/child/152/growth/monitoring-770", 2, 0, 0.0, 26.5, 24, 29, 26.5, 29.0, 29.0, 29.0, 0.15318627450980393, 0.11922798904718138, 0.1434625363817402], "isController": false}, {"data": ["test1/cskapi/api/child/162-759", 2, 0, 0.0, 42.0, 39, 45, 42.0, 45.0, 45.0, 45.0, 0.15552099533437014, 0.12074139774494558, 0.14291528965785383], "isController": false}, {"data": ["test1/cskapi/api/child/165-801", 2, 0, 0.0, 20.0, 17, 23, 20.0, 23.0, 23.0, 23.0, 0.21781746896101067, 0.16889362339359615, 0.200162342082335], "isController": false}, {"data": ["test1/cskapi/api/child/6/avatar-747", 2, 0, 0.0, 40.0, 37, 43, 40.0, 43.0, 43.0, 43.0, 0.17092556191778482, 1.0627764186821638, 0.10966610759764123], "isController": false}, {"data": ["test1/cskapi/api/child/mine-794", 2, 0, 0.0, 161.5, 76, 247, 161.5, 247.0, 247.0, 247.0, 0.24440914090186971, 3.2174172064035194, 0.2248373151655872], "isController": false}, {"data": ["test1/cskapi/api/child/1/growth/monitoring-784", 2, 0, 0.0, 48.5, 23, 74, 48.5, 74.0, 74.0, 74.0, 0.17145306472353194, 0.13361283754822117, 0.15990007501071582], "isController": false}, {"data": ["test1/cskapi/api/child/1/detection/history/trends-787", 2, 0, 0.0, 89.0, 80, 98, 89.0, 98.0, 98.0, 98.0, 0.20090406830738322, 0.057289050728277245, 0.18756278252134606], "isController": false}, {"data": ["test1/cskapi/api/child/154/growth/monitoring-768", 2, 0, 0.0, 26.0, 25, 27, 26.0, 27.0, 27.0, 27.0, 0.14653088138325152, 0.11404796138911276, 0.13722960473294749], "isController": false}, {"data": ["test1/cskapi/api/child/3-778", 2, 0, 0.0, 61.5, 23, 100, 61.5, 100.0, 100.0, 100.0, 0.1731301939058172, 0.14438787655817176, 0.15875903523199447], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-739", 2, 0, 0.0, 522.0, 226, 818, 522.0, 818.0, 818.0, 818.0, 0.19417475728155342, 8.776736953883495, 0.12249696601941747], "isController": false}, {"data": ["test1/cskapi/api/child/1/growth/monitoring-790", 2, 0, 0.0, 93.5, 73, 114, 93.5, 114.0, 114.0, 114.0, 0.1985900109224506, 0.15476057491808162, 0.18520845745209016], "isController": false}, {"data": ["test1/cskapi/api/onboarding-736", 2, 0, 0.0, 16.0, 14, 18, 16.0, 18.0, 18.0, 18.0, 0.25230225810521006, 0.2086914185694462, 0.22914169925570835], "isController": false}, {"data": ["test1/cskapi/api/child/154-767", 2, 0, 0.0, 27.5, 20, 35, 27.5, 35.0, 35.0, 35.0, 0.14578322035133756, 0.1222927600408193, 0.13396680698301627], "isController": false}, {"data": ["test1/cskapi/api/child/8/avatar-743", 2, 0, 0.0, 75.5, 48, 103, 75.5, 103.0, 103.0, 103.0, 0.17766722927955939, 1.4228993626188151, 0.11399157191081105], "isController": false}, {"data": ["test1/cskapi/api/child/133/growth/monitoring-777", 2, 0, 0.0, 78.5, 25, 132, 78.5, 132.0, 132.0, 132.0, 0.1589572405023049, 0.12371964910189158, 0.1488671812907328], "isController": false}, {"data": ["test1/cskapi/api/child/133-775", 2, 0, 0.0, 69.0, 23, 115, 69.0, 115.0, 115.0, 115.0, 0.15748031496062992, 0.12226254921259844, 0.1447157972440945], "isController": false}, {"data": ["test1/cskapi/api/child/mine-746", 2, 0, 0.0, 71.5, 71, 72, 71.5, 72.0, 72.0, 72.0, 0.16359918200408996, 2.1536298568507157, 0.15049846625766872], "isController": false}, {"data": ["test1/cskapi/api/account-737", 2, 0, 0.0, 18.0, 17, 19, 18.0, 19.0, 19.0, 19.0, 0.24375380865326018, 0.13116049664838514, 0.21947364411943937], "isController": false}, {"data": ["test1/cskapi/api/child/164/growth/monitoring-755", 2, 0, 0.0, 147.0, 31, 263, 147.0, 263.0, 263.0, 263.0, 0.18520233354940274, 0.17941476062598388, 0.17344632604870822], "isController": false}, {"data": ["test1/cskapi/api/account-792", 2, 0, 0.0, 31.5, 29, 34, 31.5, 34.0, 34.0, 34.0, 0.20253164556962028, 0.10897943037974683, 0.18235759493670886], "isController": false}, {"data": ["test1/cskapi/api/child/1-782", 2, 0, 0.0, 92.0, 85, 99, 92.0, 99.0, 99.0, 99.0, 0.1811102055600833, 0.15068935071991307, 0.16572291270488093], "isController": false}, {"data": ["test1/cskapi/api/child/154/avatar-741", 2, 0, 0.0, 80.5, 59, 102, 80.5, 102.0, 102.0, 102.0, 0.16712626389237067, 2.3515187599231218, 0.10755489053229715], "isController": false}, {"data": ["test1/cskapi/api/child/162/growth/monitoring-760", 2, 0, 0.0, 80.0, 34, 126, 80.0, 126.0, 126.0, 126.0, 0.1664863065012903, 0.1297422583867477, 0.15591832806126696], "isController": false}, {"data": ["test1/cskapi/api/child/152-769", 2, 0, 0.0, 27.0, 21, 33, 27.0, 33.0, 33.0, 33.0, 0.14552863275849523, 0.11255730189914866, 0.13373285490795314], "isController": false}, {"data": ["test1/cskapi/api/child/163/growth/monitoring-757", 2, 0, 0.0, 67.0, 29, 105, 67.0, 105.0, 105.0, 105.0, 0.17675651789659744, 0.13774580203269995, 0.16553662174105171], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-793", 2, 0, 0.0, 79.5, 24, 135, 79.5, 135.0, 135.0, 135.0, 0.24919013207077, 0.24140294044355845, 0.2333723990779965], "isController": false}, {"data": ["test1/cskapi/api/child/165-740", 2, 0, 0.0, 25.5, 21, 30, 25.5, 30.0, 30.0, 30.0, 0.2013895881582922, 0.1561555986305508, 0.18172263618970902], "isController": false}, {"data": ["test1/cskapi/api/child/161/growth/monitoring-762", 2, 0, 0.0, 65.5, 27, 104, 65.5, 104.0, 104.0, 104.0, 0.15811526602893508, 0.12321873270614278, 0.1480786524626453], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-799", 2, 0, 0.0, 25.0, 20, 30, 25.0, 30.0, 30.0, 30.0, 0.2213368747233289, 0.2144200973882249, 0.20728717076139885], "isController": false}, {"data": ["test1/cskapi/api/child/160-763", 2, 0, 0.0, 24.5, 20, 29, 24.5, 29.0, 29.0, 29.0, 0.15045512675844427, 0.11666149477168435, 0.1382600334762657], "isController": false}, {"data": ["test1/cskapi/api/child/159-765", 2, 0, 0.0, 23.5, 19, 28, 23.5, 28.0, 28.0, 28.0, 0.15248551387618176, 0.12210754040866117, 0.14012584820067095], "isController": false}, {"data": ["test1/cskapi/api/child/1/avatar-752", 2, 0, 0.0, 78.5, 66, 91, 78.5, 91.0, 91.0, 91.0, 0.19753086419753085, 7.952160493827161, 0.1267361111111111], "isController": false}, {"data": ["test1/cskapi/api/child/mine-738", 2, 0, 0.0, 107.5, 64, 151, 107.5, 151.0, 151.0, 151.0, 0.21199915200339198, 2.7907700869196526, 0.19150314023743906], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-735", 2, 0, 0.0, 18.5, 17, 20, 18.5, 20.0, 20.0, 20.0, 0.2581311306143521, 0.37887801690758904, 0.23418341830149716], "isController": false}, {"data": ["test1/cskapi/api/child/7/avatar-744", 2, 0, 0.0, 74.5, 51, 98, 74.5, 98.0, 98.0, 98.0, 0.1710863986313088, 1.0201694824636443, 0.1097693006843456], "isController": false}, {"data": ["test1/cskapi/api/child/159/growth/monitoring-766", 2, 0, 0.0, 30.0, 25, 35, 30.0, 35.0, 35.0, 35.0, 0.14964459408903855, 0.11647142723531612, 0.14014566965955855], "isController": false}, {"data": ["test1/cskapi/api/child/164-754", 2, 0, 0.0, 22.5, 21, 24, 22.5, 24.0, 24.0, 24.0, 0.2055287226389888, 0.1595657563456993, 0.1888696562532114], "isController": false}, {"data": ["test1/cskapi/api/child/2/avatar-751", 2, 0, 0.0, 68.5, 64, 73, 68.5, 73.0, 73.0, 73.0, 0.16578249336870027, 7.043813204575597, 0.10636630678050397], "isController": false}, {"data": ["test1/cskapi/api/child/4/avatar-749", 2, 0, 0.0, 238.0, 164, 312, 238.0, 312.0, 312.0, 312.0, 0.19472300652322072, 4.5782725635283805, 0.1249345852399961], "isController": false}, {"data": ["test1/cskapi/api/child/3/growth/monitoring-781", 2, 0, 0.0, 52.5, 42, 63, 52.5, 63.0, 63.0, 63.0, 0.1768346595932803, 0.13383482537577365, 0.16491904288240494], "isController": false}, {"data": ["test1/cskapi/api/child/160/growth/monitoring-764", 2, 0, 0.0, 27.5, 26, 29, 27.5, 29.0, 29.0, 29.0, 0.14988009592326137, 0.11680109037769784, 0.1403662226468825], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-796", 2, 0, 0.0, 416.0, 381, 451, 416.0, 451.0, 451.0, 451.0, 0.2402691013935608, 10.860210310547814, 0.1555648576405574], "isController": false}, {"data": ["test1/cskapi/api/child/139-772", 2, 0, 0.0, 22.0, 15, 29, 22.0, 29.0, 29.0, 29.0, 0.15655577299412915, 0.12154476516634051, 0.14386619373776907], "isController": false}, {"data": ["test1/cskapi/api/child/165-753", 2, 0, 0.0, 19.0, 18, 20, 19.0, 20.0, 20.0, 20.0, 0.1957330201605011, 0.15176954883538854, 0.17986794137796047], "isController": false}, {"data": ["test1/cskapi/api/child/165-797", 2, 0, 0.0, 19.5, 19, 20, 19.5, 20.0, 20.0, 20.0, 0.2494387627837366, 0.19341247817410823, 0.22922058181591418], "isController": false}, {"data": ["test1/cskapi/api/child/161-761", 2, 0, 0.0, 62.0, 27, 97, 62.0, 97.0, 97.0, 97.0, 0.16522098306484925, 0.12827214993804212, 0.15182904791408508], "isController": false}, {"data": ["test1/cskapi/api/auth/login-734", 2, 0, 0.0, 309.0, 59, 559, 309.0, 559.0, 559.0, 559.0, 0.2781254345709915, 0.23982886594354055, 0.20316193853427897], "isController": false}, {"data": ["test1/cskapi/api/child/36/avatar-742", 2, 0, 0.0, 83.0, 70, 96, 83.0, 96.0, 96.0, 96.0, 0.16553550736633008, 9.928574015063731, 0.10636949594438007], "isController": false}, {"data": ["test1/cskapi/api/child/5/avatar-748", 2, 0, 0.0, 118.0, 108, 128, 118.0, 128.0, 128.0, 128.0, 0.18178512997636792, 13.151373045809851, 0.11663362343210325], "isController": false}, {"data": ["test1/cskapi/api/child/163-756", 2, 0, 0.0, 49.0, 27, 71, 49.0, 71.0, 71.0, 71.0, 0.18186778212239701, 0.14101857324724926, 0.16712654587614803], "isController": false}, {"data": ["test1/cskapi/api/child/3/avatar-750", 2, 0, 0.0, 67.0, 62, 72, 67.0, 72.0, 72.0, 72.0, 0.16593379241682568, 3.0305603376752672, 0.106463380486186], "isController": false}, {"data": ["test1/cskapi/api/child/139/growth/monitoring-774", 2, 0, 0.0, 34.5, 18, 51, 34.5, 51.0, 51.0, 51.0, 0.16149870801033592, 0.1256977248869509, 0.15124732517764858], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-745", 2, 0, 0.0, 24.5, 24, 25, 24.5, 25.0, 25.0, 25.0, 0.2043527127822622, 0.19796669050781648, 0.19138110503729436], "isController": false}, {"data": ["test1/cskapi/api/child/mine-800", 2, 0, 0.0, 71.0, 70, 72, 71.0, 72.0, 72.0, 72.0, 0.2190580503833516, 2.883693866374589, 0.20151629244249725], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 108, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
