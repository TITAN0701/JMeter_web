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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.998, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "test1/cskapi/api/child/152/growth/monitoring-770"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/162-759"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-801"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/6/avatar-747"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-794"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/growth/monitoring-784"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/detection/history/trends-787"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154/growth/monitoring-768"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3-778"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account/5/avatar-739"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/growth/monitoring-790"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/onboarding-736"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154-767"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/8/avatar-743"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/133/growth/monitoring-777"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/133-775"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-746"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-737"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/164/growth/monitoring-755"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-792"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1-782"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154/avatar-741"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/162/growth/monitoring-760"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/152-769"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/163/growth/monitoring-757"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-793"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-740"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/161/growth/monitoring-762"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-799"], "isController": false}, {"data": [0.9871794871794872, 500, 1500, "test1/cskapi/api/child/160-763"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/159-765"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/avatar-752"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-738"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/menu-735"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/7/avatar-744"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/159/growth/monitoring-766"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/164-754"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "test1/cskapi/api/child/2/avatar-751"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/4/avatar-749"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3/growth/monitoring-781"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/160/growth/monitoring-764"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account/5/avatar-796"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/139-772"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-753"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-797"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/161-761"], "isController": false}, {"data": [0.9888888888888889, 500, 1500, "test1/cskapi/api/auth/login-734"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/36/avatar-742"], "isController": false}, {"data": [0.9642857142857143, 500, 1500, "test1/cskapi/api/child/5/avatar-748"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/163-756"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3/avatar-750"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/139/growth/monitoring-774"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-745"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-800"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2000, 0, 0.0, 69.31500000000007, 12, 565, 37.0, 162.0, 256.0, 401.0, 3.3346004815163095, 30.702114394615784, 2.83106766769289], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/child/152/growth/monitoring-770", 34, 0, 0.0, 51.26470588235294, 17, 401, 33.0, 94.5, 206.75, 401.0, 0.05860189663314868, 0.045611046500604976, 0.054882049678896073], "isController": false}, {"data": ["test1/cskapi/api/child/162-759", 41, 0, 0.0, 31.17073170731707, 14, 145, 25.0, 42.60000000000001, 114.7999999999999, 145.0, 0.07106679932469208, 0.05517393111633808, 0.06530650211380394], "isController": false}, {"data": ["test1/cskapi/api/child/165-801", 25, 0, 0.0, 31.200000000000003, 16, 57, 29.0, 52.800000000000004, 56.099999999999994, 57.0, 0.046053067871169306, 0.035709117079793386, 0.04232025084645539], "isController": false}, {"data": ["test1/cskapi/api/child/6/avatar-747", 43, 0, 0.0, 65.16279069767441, 33, 174, 57.0, 104.6, 135.79999999999995, 174.0, 0.07289210442895816, 0.4532265907218522, 0.04676768809553273], "isController": false}, {"data": ["test1/cskapi/api/child/mine-794", 27, 0, 0.0, 91.96296296296296, 57, 189, 79.0, 140.2, 176.19999999999993, 189.0, 0.04813932590680226, 0.6337090949450143, 0.04428441894942162], "isController": false}, {"data": ["test1/cskapi/api/child/1/growth/monitoring-784", 30, 0, 0.0, 39.8, 16, 109, 32.5, 96.00000000000006, 107.35, 109.0, 0.05221932114882506, 0.040694353785900785, 0.0487006364229765], "isController": false}, {"data": ["test1/cskapi/api/child/1/detection/history/trends-787", 29, 0, 0.0, 43.89655172413793, 17, 175, 27.0, 106.0, 153.0, 175.0, 0.05101143359718558, 0.014546229111697449, 0.04762395558487247], "isController": false}, {"data": ["test1/cskapi/api/child/154/growth/monitoring-768", 35, 0, 0.0, 43.54285714285715, 18, 347, 28.0, 77.1999999999999, 180.5999999999991, 347.0, 0.06056861818754467, 0.04714178583542295, 0.056723930509624355], "isController": false}, {"data": ["test1/cskapi/api/child/3-778", 31, 0, 0.0, 42.58064516129032, 14, 228, 37.0, 56.8, 145.7999999999998, 228.0, 0.05455191758789018, 0.0454954468945881, 0.05002368224123914], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-739", 44, 0, 0.0, 105.27272727272724, 51, 294, 90.0, 168.0, 243.5, 294.0, 0.07488966539637909, 3.3850275028041077, 0.04724484750591884], "isController": false}, {"data": ["test1/cskapi/api/child/1/growth/monitoring-790", 28, 0, 0.0, 43.714285714285715, 17, 291, 35.0, 67.70000000000002, 197.3999999999994, 291.0, 0.04948771379134212, 0.03856562070848732, 0.04615309245188645], "isController": false}, {"data": ["test1/cskapi/api/onboarding-736", 44, 0, 0.0, 23.522727272727273, 13, 55, 20.5, 35.0, 41.75, 55.0, 0.07744229229185183, 0.06405627106562355, 0.07033333186662326], "isController": false}, {"data": ["test1/cskapi/api/child/154-767", 36, 0, 0.0, 46.555555555555564, 13, 240, 34.5, 107.0, 136.29999999999984, 240.0, 0.061557297019087895, 0.051638396620504394, 0.05656778954586104], "isController": false}, {"data": ["test1/cskapi/api/child/8/avatar-743", 43, 0, 0.0, 53.72093023255815, 18, 152, 38.0, 119.6, 148.39999999999998, 152.0, 0.0761134692519285, 0.6095767200537751, 0.04883452079933303], "isController": false}, {"data": ["test1/cskapi/api/child/133/growth/monitoring-777", 32, 0, 0.0, 40.40625000000001, 17, 135, 32.0, 77.79999999999998, 120.69999999999996, 135.0, 0.05541355831238008, 0.04312949802242864, 0.051896096114816895], "isController": false}, {"data": ["test1/cskapi/api/child/133-775", 32, 0, 0.0, 44.15625, 14, 251, 29.5, 105.79999999999998, 187.9499999999998, 251.0, 0.056073357970564994, 0.043533515221288246, 0.05152834946318521], "isController": false}, {"data": ["test1/cskapi/api/child/mine-746", 43, 0, 0.0, 96.44186046511629, 59, 333, 84.0, 119.60000000000001, 285.5999999999996, 333.0, 0.07416555130876328, 0.9763199527755164, 0.06822651302036621], "isController": false}, {"data": ["test1/cskapi/api/account-737", 44, 0, 0.0, 25.909090909090907, 14, 106, 21.0, 39.0, 52.5, 106.0, 0.07700290685973396, 0.041434181327845127, 0.06933269543425263], "isController": false}, {"data": ["test1/cskapi/api/child/164/growth/monitoring-755", 42, 0, 0.0, 50.14285714285713, 15, 247, 24.0, 130.7, 225.60000000000014, 247.0, 0.07312232320066855, 0.07083725060064766, 0.0684807694818761], "isController": false}, {"data": ["test1/cskapi/api/account-792", 27, 0, 0.0, 44.25925925925926, 17, 269, 25.0, 88.19999999999985, 265.79999999999995, 269.0, 0.04881594220192443, 0.026267172024668325, 0.04395341670915462], "isController": false}, {"data": ["test1/cskapi/api/child/1-782", 30, 0, 0.0, 32.86666666666668, 15, 121, 28.5, 48.90000000000002, 96.24999999999997, 121.0, 0.05286539237575311, 0.04398565850013833, 0.048373899078203775], "isController": false}, {"data": ["test1/cskapi/api/child/154/avatar-741", 43, 0, 0.0, 133.44186046511624, 41, 342, 111.0, 256.6, 327.5999999999999, 342.0, 0.0749459256431842, 1.0545125944013651, 0.04823180175669764], "isController": false}, {"data": ["test1/cskapi/api/child/162/growth/monitoring-760", 41, 0, 0.0, 45.048780487804876, 17, 373, 25.0, 95.40000000000003, 113.49999999999997, 373.0, 0.0703984725248498, 0.05486130964338881, 0.06592981948372165], "isController": false}, {"data": ["test1/cskapi/api/child/152-769", 34, 0, 0.0, 38.91176470588235, 16, 333, 26.0, 61.0, 132.75, 333.0, 0.05920508467197771, 0.04579143267598276, 0.05440623503547952], "isController": false}, {"data": ["test1/cskapi/api/child/163/growth/monitoring-757", 42, 0, 0.0, 38.45238095238095, 15, 132, 26.0, 91.50000000000004, 121.7, 132.0, 0.07202634106187406, 0.056129902507202636, 0.0674543565218137], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-793", 27, 0, 0.0, 46.666666666666664, 17, 167, 35.0, 97.39999999999998, 146.19999999999987, 167.0, 0.048525891258869455, 0.04700945715702978, 0.04544563448950763], "isController": false}, {"data": ["test1/cskapi/api/child/165-740", 44, 0, 0.0, 27.136363636363637, 12, 103, 23.5, 41.0, 56.5, 103.0, 0.07557631232254595, 0.058601164046974116, 0.06819581307229733], "isController": false}, {"data": ["test1/cskapi/api/child/161/growth/monitoring-762", 39, 0, 0.0, 46.46153846153846, 17, 239, 27.0, 121.0, 167.0, 239.0, 0.06750301167282849, 0.05260488604972376, 0.06321815253343996], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-799", 25, 0, 0.0, 45.72, 15, 256, 37.0, 72.8000000000001, 209.4999999999999, 256.0, 0.04688390794250908, 0.04541878581930567, 0.04390787862975216], "isController": false}, {"data": ["test1/cskapi/api/child/160-763", 39, 0, 0.0, 52.358974358974365, 14, 565, 22.0, 111.0, 253.0, 565.0, 0.06693520843452279, 0.05190093310254989, 0.06150979603211517], "isController": false}, {"data": ["test1/cskapi/api/child/159-765", 37, 0, 0.0, 49.54054054054054, 13, 266, 25.0, 131.0000000000004, 254.3, 266.0, 0.06408002729462785, 0.0513140843570262, 0.05888604070727031], "isController": false}, {"data": ["test1/cskapi/api/child/1/avatar-752", 42, 0, 0.0, 99.0, 49, 198, 83.5, 174.7, 189.75000000000003, 198.0, 0.07465432381846202, 3.005419770597928, 0.0478983308093062], "isController": false}, {"data": ["test1/cskapi/api/child/mine-738", 44, 0, 0.0, 104.29545454545453, 58, 411, 80.0, 165.5, 333.25, 411.0, 0.07631178219229875, 1.0045730702658078, 0.06893398293737925], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-735", 45, 0, 0.0, 30.199999999999996, 14, 243, 21.0, 41.99999999999999, 52.199999999999974, 243.0, 0.07525222035856848, 0.11045321015520351, 0.06827081319639658], "isController": false}, {"data": ["test1/cskapi/api/child/7/avatar-744", 43, 0, 0.0, 50.139534883720934, 19, 266, 38.0, 87.2, 106.99999999999999, 266.0, 0.07552472117326775, 0.45034565183981734, 0.04845677911214543], "isController": false}, {"data": ["test1/cskapi/api/child/159/growth/monitoring-766", 37, 0, 0.0, 39.10810810810811, 16, 152, 24.0, 74.00000000000003, 135.8, 152.0, 0.06337634931673444, 0.04932710000530991, 0.05935343651830892], "isController": false}, {"data": ["test1/cskapi/api/child/164-754", 42, 0, 0.0, 38.738095238095234, 13, 263, 27.5, 65.40000000000003, 118.50000000000007, 263.0, 0.07379736648826446, 0.05729385386540063, 0.06781574400923522], "isController": false}, {"data": ["test1/cskapi/api/child/2/avatar-751", 42, 0, 0.0, 276.7619047619048, 74, 557, 256.5, 445.9000000000001, 539.3000000000001, 557.0, 0.07721383083552719, 3.280682960929802, 0.049540514510684926], "isController": false}, {"data": ["test1/cskapi/api/child/4/avatar-749", 42, 0, 0.0, 177.54761904761904, 45, 415, 153.0, 363.00000000000006, 376.1, 415.0, 0.07552421899865674, 1.7757041959098239, 0.04845645691613035], "isController": false}, {"data": ["test1/cskapi/api/child/3/growth/monitoring-781", 31, 0, 0.0, 39.67741935483871, 15, 152, 35.0, 60.6, 104.59999999999988, 152.0, 0.054060369738051346, 0.04091483061229472, 0.05041762998031156], "isController": false}, {"data": ["test1/cskapi/api/child/160/growth/monitoring-764", 38, 0, 0.0, 41.63157894736842, 16, 136, 25.0, 118.5, 129.34999999999997, 136.0, 0.0651722777711081, 0.050788552403656505, 0.06103536560790299], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-796", 26, 0, 0.0, 98.96153846153845, 43, 162, 98.0, 150.9, 161.3, 162.0, 0.0468055230517201, 2.1156187836414695, 0.030304747835244557], "isController": false}, {"data": ["test1/cskapi/api/child/139-772", 33, 0, 0.0, 34.06060606060606, 13, 136, 29.0, 72.60000000000004, 101.69999999999986, 136.0, 0.05754030872991102, 0.04467240765652272, 0.052876396987154566], "isController": false}, {"data": ["test1/cskapi/api/child/165-753", 42, 0, 0.0, 36.404761904761905, 14, 266, 23.5, 62.400000000000034, 88.75000000000003, 266.0, 0.07430840109551815, 0.0576180375682045, 0.06828535686609626], "isController": false}, {"data": ["test1/cskapi/api/child/165-797", 26, 0, 0.0, 30.923076923076927, 16, 54, 32.0, 50.6, 53.3, 54.0, 0.04710110796298578, 0.036521757541612014, 0.0432833423761422], "isController": false}, {"data": ["test1/cskapi/api/child/161-761", 40, 0, 0.0, 28.2, 12, 66, 21.0, 51.9, 63.64999999999997, 66.0, 0.06871966670961646, 0.053351694369282304, 0.06314961559936434], "isController": false}, {"data": ["test1/cskapi/api/auth/login-734", 45, 0, 0.0, 72.9111111111111, 25, 532, 60.0, 124.79999999999998, 143.79999999999995, 532.0, 0.07614174547337323, 0.06565738403612163, 0.0556191656387531], "isController": false}, {"data": ["test1/cskapi/api/child/36/avatar-742", 43, 0, 0.0, 202.34883720930233, 42, 478, 197.0, 356.20000000000005, 451.9999999999998, 478.0, 0.07360291399071575, 4.414593526837677, 0.047295622466690404], "isController": false}, {"data": ["test1/cskapi/api/child/5/avatar-748", 42, 0, 0.0, 257.7857142857142, 74, 553, 241.0, 466.9000000000002, 523.8, 553.0, 0.07606063843851131, 5.502660367970503, 0.04880062446689642], "isController": false}, {"data": ["test1/cskapi/api/child/163-756", 42, 0, 0.0, 35.785714285714285, 16, 203, 27.5, 58.400000000000006, 106.20000000000007, 203.0, 0.07272450227004339, 0.05638989726798286, 0.06682984046495198], "isController": false}, {"data": ["test1/cskapi/api/child/3/avatar-750", 42, 0, 0.0, 175.547619047619, 42, 342, 167.5, 301.5, 335.75, 342.0, 0.07775473933649289, 1.4200870459678614, 0.049887562250074055], "isController": false}, {"data": ["test1/cskapi/api/child/139/growth/monitoring-774", 33, 0, 0.0, 40.60606060606061, 16, 121, 27.0, 110.80000000000001, 116.09999999999998, 121.0, 0.05683530678148547, 0.04423607373519914, 0.053227596878363835], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-745", 44, 0, 0.0, 27.15909090909091, 13, 58, 23.5, 44.0, 52.0, 58.0, 0.07430549691801064, 0.07198345013932281, 0.06958883939880098], "isController": false}, {"data": ["test1/cskapi/api/child/mine-800", 25, 0, 0.0, 106.47999999999998, 58, 338, 90.0, 171.4, 289.0999999999999, 338.0, 0.046367650959161226, 0.6103866552045834, 0.042654616409697144], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
