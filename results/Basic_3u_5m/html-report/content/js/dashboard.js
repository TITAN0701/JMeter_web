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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9861111111111112, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "test1/cskapi/api/child/152/growth/monitoring-770"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/162-759"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-801"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/6/avatar-747"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-794"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/growth/monitoring-784"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/detection/history/trends-787"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154/growth/monitoring-768"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3-778"], "isController": false}, {"data": [0.75, 500, 1500, "test1/cskapi/api/account/5/avatar-739"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/growth/monitoring-790"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/onboarding-736"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154-767"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/8/avatar-743"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/133/growth/monitoring-777"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/133-775"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-746"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-737"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/164/growth/monitoring-755"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-792"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1-782"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/154/avatar-741"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/162/growth/monitoring-760"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/152-769"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/163/growth/monitoring-757"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-793"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-740"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/161/growth/monitoring-762"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-799"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/160-763"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/159-765"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/1/avatar-752"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-738"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/menu-735"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/7/avatar-744"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/159/growth/monitoring-766"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/164-754"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/2/avatar-751"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/4/avatar-749"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3/growth/monitoring-781"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/160/growth/monitoring-764"], "isController": false}, {"data": [0.75, 500, 1500, "test1/cskapi/api/account/5/avatar-796"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/139-772"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-753"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165-797"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/161-761"], "isController": false}, {"data": [0.75, 500, 1500, "test1/cskapi/api/auth/login-734"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/36/avatar-742"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/5/avatar-748"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/163-756"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/3/avatar-750"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/139/growth/monitoring-774"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/165/growth/monitoring-745"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-800"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 108, 0, 0.0, 71.5648148148148, 15, 767, 30.5, 130.20000000000002, 234.6999999999999, 753.4999999999995, 2.727203858488422, 23.45865831986566, 2.3380190052018888], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/child/152/growth/monitoring-770", 2, 0, 0.0, 81.5, 53, 110, 81.5, 110.0, 110.0, 110.0, 0.7968127490039841, 0.6201755478087649, 0.7462338147410359], "isController": false}, {"data": ["test1/cskapi/api/child/162-759", 2, 0, 0.0, 19.5, 18, 21, 19.5, 21.0, 21.0, 21.0, 0.4664179104477612, 0.3621115613339552, 0.4286125524720149], "isController": false}, {"data": ["test1/cskapi/api/child/165-801", 2, 0, 0.0, 18.5, 18, 19, 18.5, 19.0, 19.0, 19.0, 4.201680672268908, 3.2579438025210083, 3.8611147584033616], "isController": false}, {"data": ["test1/cskapi/api/child/6/avatar-747", 2, 0, 0.0, 203.5, 191, 216, 203.5, 216.0, 216.0, 216.0, 0.687757909215956, 4.276322859353508, 0.44126654917469055], "isController": false}, {"data": ["test1/cskapi/api/child/mine-794", 2, 0, 0.0, 153.5, 134, 173, 153.5, 173.0, 173.0, 173.0, 1.7301038062283738, 22.7751946366782, 1.5915603373702423], "isController": false}, {"data": ["test1/cskapi/api/child/1/growth/monitoring-784", 2, 0, 0.0, 61.5, 33, 90, 61.5, 90.0, 90.0, 90.0, 0.6267627702914447, 0.48843426825446573, 0.5845297320589158], "isController": false}, {"data": ["test1/cskapi/api/child/1/detection/history/trends-787", 2, 0, 0.0, 68.5, 28, 109, 68.5, 109.0, 109.0, 109.0, 0.6600660066006601, 0.1882219471947195, 0.616233498349835], "isController": false}, {"data": ["test1/cskapi/api/child/154/growth/monitoring-768", 2, 0, 0.0, 80.5, 48, 113, 80.5, 113.0, 113.0, 113.0, 0.5858230814294083, 0.45595800380785, 0.5486370459871118], "isController": false}, {"data": ["test1/cskapi/api/child/3-778", 2, 0, 0.0, 32.5, 28, 37, 32.5, 37.0, 37.0, 37.0, 1.0695187165775402, 0.8919618983957218, 0.980740307486631], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-739", 2, 0, 0.0, 433.5, 250, 617, 433.5, 617.0, 617.0, 617.0, 0.7446016381236039, 33.656139473194344, 0.46973892405063294], "isController": false}, {"data": ["test1/cskapi/api/child/1/growth/monitoring-790", 2, 0, 0.0, 80.5, 31, 130, 80.5, 130.0, 130.0, 130.0, 0.47835446065534565, 0.3727801363310213, 0.4461215917244678], "isController": false}, {"data": ["test1/cskapi/api/onboarding-736", 2, 0, 0.0, 21.0, 16, 26, 21.0, 26.0, 26.0, 26.0, 0.7877116975187082, 0.651554499803072, 0.7154022252855454], "isController": false}, {"data": ["test1/cskapi/api/child/154-767", 2, 0, 0.0, 25.5, 23, 28, 25.5, 28.0, 28.0, 28.0, 0.7886435331230284, 0.6615671825709779, 0.7247202779968455], "isController": false}, {"data": ["test1/cskapi/api/child/8/avatar-743", 2, 0, 0.0, 32.5, 23, 42, 32.5, 42.0, 42.0, 42.0, 2.8328611898017, 22.68778771246459, 1.8175681657223797], "isController": false}, {"data": ["test1/cskapi/api/child/133/growth/monitoring-777", 2, 0, 0.0, 88.5, 78, 99, 88.5, 99.0, 99.0, 99.0, 1.029336078229542, 0.8011531780751415, 0.9639973623262995], "isController": false}, {"data": ["test1/cskapi/api/child/133-775", 2, 0, 0.0, 27.5, 26, 29, 27.5, 29.0, 29.0, 29.0, 1.0183299389002036, 0.790597950610998, 0.9357895239307535], "isController": false}, {"data": ["test1/cskapi/api/child/mine-746", 2, 0, 0.0, 63.5, 63, 64, 63.5, 64.0, 64.0, 64.0, 0.9165902841429882, 12.066051787351054, 0.8431914527956004], "isController": false}, {"data": ["test1/cskapi/api/account-737", 2, 0, 0.0, 19.5, 18, 21, 19.5, 21.0, 21.0, 21.0, 0.6341154090044389, 0.3412085843373494, 0.5709515694356373], "isController": false}, {"data": ["test1/cskapi/api/child/164/growth/monitoring-755", 2, 0, 0.0, 21.0, 20, 22, 21.0, 22.0, 22.0, 22.0, 1.3736263736263736, 1.3307005494505495, 1.2864332932692308], "isController": false}, {"data": ["test1/cskapi/api/account-792", 2, 0, 0.0, 30.5, 30, 31, 30.5, 31.0, 31.0, 31.0, 0.6800408024481469, 0.3659203927235634, 0.6123023631417885], "isController": false}, {"data": ["test1/cskapi/api/child/1-782", 2, 0, 0.0, 69.0, 27, 111, 69.0, 111.0, 111.0, 111.0, 0.6598482349059717, 0.5490143516991092, 0.60378691026064], "isController": false}, {"data": ["test1/cskapi/api/child/154/avatar-741", 2, 0, 0.0, 50.0, 28, 72, 50.0, 72.0, 72.0, 72.0, 1.5071590052750565, 21.206198191409193, 0.9699392426525999], "isController": false}, {"data": ["test1/cskapi/api/child/162/growth/monitoring-760", 2, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 0.5142710208279764, 0.4007697994343019, 0.48162686423245055], "isController": false}, {"data": ["test1/cskapi/api/child/152-769", 2, 0, 0.0, 26.0, 22, 30, 26.0, 30.0, 30.0, 30.0, 0.7087172218284905, 0.548148476257973, 0.651272368887314], "isController": false}, {"data": ["test1/cskapi/api/child/163/growth/monitoring-757", 2, 0, 0.0, 23.5, 18, 29, 23.5, 29.0, 29.0, 29.0, 0.6743088334457181, 0.5254867666891436, 0.6315060266351988], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-793", 2, 0, 0.0, 100.5, 82, 119, 100.5, 119.0, 119.0, 119.0, 0.7818608287724785, 0.7574276778733386, 0.7322309910086006], "isController": false}, {"data": ["test1/cskapi/api/child/165-740", 2, 0, 0.0, 22.5, 15, 30, 22.5, 30.0, 30.0, 30.0, 0.6618133686300464, 0.513163881535407, 0.5971831568497684], "isController": false}, {"data": ["test1/cskapi/api/child/161/growth/monitoring-762", 2, 0, 0.0, 55.0, 20, 90, 55.0, 90.0, 90.0, 90.0, 0.9049773755656109, 0.7052460407239819, 0.8475325226244343], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-799", 2, 0, 0.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 1.680672268907563, 1.6281512605042017, 1.5739889705882353], "isController": false}, {"data": ["test1/cskapi/api/child/160-763", 2, 0, 0.0, 21.5, 16, 27, 21.5, 27.0, 27.0, 27.0, 0.5738880918220947, 0.4449874461979914, 0.5273717718794835], "isController": false}, {"data": ["test1/cskapi/api/child/159-765", 2, 0, 0.0, 28.0, 17, 39, 28.0, 39.0, 39.0, 39.0, 0.7751937984496124, 0.6207606589147286, 0.7123607073643411], "isController": false}, {"data": ["test1/cskapi/api/child/1/avatar-752", 2, 0, 0.0, 63.0, 56, 70, 63.0, 70.0, 70.0, 70.0, 0.9095043201455206, 36.614654388358346, 0.5835393929058663], "isController": false}, {"data": ["test1/cskapi/api/child/mine-738", 2, 0, 0.0, 91.0, 63, 119, 91.0, 119.0, 119.0, 119.0, 0.5901445854234287, 7.768700206550605, 0.5330895913248747], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-735", 2, 0, 0.0, 23.0, 21, 25, 23.0, 25.0, 25.0, 25.0, 0.670465973851827, 0.9840921471672812, 0.6082645407308079], "isController": false}, {"data": ["test1/cskapi/api/child/7/avatar-744", 2, 0, 0.0, 38.5, 28, 49, 38.5, 49.0, 49.0, 49.0, 1.6181229773462784, 9.64869033171521, 1.0381902305825244], "isController": false}, {"data": ["test1/cskapi/api/child/159/growth/monitoring-766", 2, 0, 0.0, 24.0, 18, 30, 24.0, 30.0, 30.0, 30.0, 0.6550933508024893, 0.5098724615132656, 0.6135102767769407], "isController": false}, {"data": ["test1/cskapi/api/child/164-754", 2, 0, 0.0, 21.5, 17, 26, 21.5, 26.0, 26.0, 26.0, 1.075268817204301, 0.8348034274193548, 0.9881132392473118], "isController": false}, {"data": ["test1/cskapi/api/child/2/avatar-751", 2, 0, 0.0, 52.5, 47, 58, 52.5, 58.0, 58.0, 58.0, 0.4527960153950645, 19.238524450984833, 0.29051463097124747], "isController": false}, {"data": ["test1/cskapi/api/child/4/avatar-749", 2, 0, 0.0, 204.5, 75, 334, 204.5, 334.0, 334.0, 334.0, 0.889284126278346, 20.908598265895954, 0.5705660849266341], "isController": false}, {"data": ["test1/cskapi/api/child/3/growth/monitoring-781", 2, 0, 0.0, 82.0, 32, 132, 82.0, 132.0, 132.0, 132.0, 0.7892659826361483, 0.5973448599052881, 0.7360830209155486], "isController": false}, {"data": ["test1/cskapi/api/child/160/growth/monitoring-764", 2, 0, 0.0, 21.0, 17, 25, 21.0, 25.0, 25.0, 25.0, 0.6906077348066298, 0.5381884495856354, 0.6467703297651934], "isController": false}, {"data": ["test1/cskapi/api/account/5/avatar-796", 2, 0, 0.0, 416.0, 65, 767, 416.0, 767.0, 767.0, 767.0, 1.257071024512885, 56.81985582966688, 0.813904384035198], "isController": false}, {"data": ["test1/cskapi/api/child/139-772", 2, 0, 0.0, 31.5, 25, 38, 31.5, 38.0, 38.0, 38.0, 0.8382229673093042, 0.650768807627829, 0.7702810666387259], "isController": false}, {"data": ["test1/cskapi/api/child/165-753", 2, 0, 0.0, 20.0, 19, 21, 20.0, 21.0, 21.0, 21.0, 1.006036217303823, 0.780071051307847, 0.9244922660965795], "isController": false}, {"data": ["test1/cskapi/api/child/165-797", 2, 0, 0.0, 28.0, 22, 34, 28.0, 34.0, 34.0, 34.0, 1.5686274509803921, 1.2162990196078431, 1.441482843137255], "isController": false}, {"data": ["test1/cskapi/api/child/161-761", 2, 0, 0.0, 18.0, 17, 19, 18.0, 19.0, 19.0, 19.0, 0.5058168942842691, 0.3926996396054628, 0.4648180639858371], "isController": false}, {"data": ["test1/cskapi/api/auth/login-734", 2, 0, 0.0, 329.0, 64, 594, 329.0, 594.0, 594.0, 594.0, 0.5844535359438924, 0.5039770236703682, 0.4269250438340152], "isController": false}, {"data": ["test1/cskapi/api/child/36/avatar-742", 2, 0, 0.0, 89.5, 67, 112, 89.5, 112.0, 112.0, 112.0, 0.9620009620009621, 57.69938973063972, 0.6181607744107743], "isController": false}, {"data": ["test1/cskapi/api/child/5/avatar-748", 2, 0, 0.0, 99.5, 78, 121, 99.5, 121.0, 121.0, 121.0, 0.5701254275940707, 41.246124928734325, 0.3657933651653364], "isController": false}, {"data": ["test1/cskapi/api/child/163-756", 2, 0, 0.0, 18.5, 18, 19, 18.5, 19.0, 19.0, 19.0, 1.0593220338983051, 0.821388373940678, 0.9734590174788136], "isController": false}, {"data": ["test1/cskapi/api/child/3/avatar-750", 2, 0, 0.0, 45.5, 44, 47, 45.5, 47.0, 47.0, 47.0, 0.5496015388843088, 10.037742168178072, 0.3526252061005771], "isController": false}, {"data": ["test1/cskapi/api/child/139/growth/monitoring-774", 2, 0, 0.0, 45.5, 24, 67, 45.5, 67.0, 67.0, 67.0, 1.063264221158958, 0.8275601408825093, 0.9957718633705476], "isController": false}, {"data": ["test1/cskapi/api/child/165/growth/monitoring-745", 2, 0, 0.0, 21.0, 18, 24, 21.0, 24.0, 24.0, 24.0, 1.5360983102918586, 1.4880952380952381, 1.438592069892473], "isController": false}, {"data": ["test1/cskapi/api/child/mine-800", 2, 0, 0.0, 81.5, 68, 95, 81.5, 95.0, 95.0, 95.0, 1.4104372355430184, 18.567083921015517, 1.29749206629055], "isController": false}]}, function(index, item){
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
