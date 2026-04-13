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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9972513743128436, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,285"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,284"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,245"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,288"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,265"], "isController": false}, {"data": [0.9949494949494949, 500, 1500, "test1/cskapi/api/global/dept/list-1,200"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,266"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,267"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,268"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,248"], "isController": false}, {"data": [0.9736842105263158, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,237"], "isController": false}, {"data": [0.995, 500, 1500, "test1/cskapi/api/auth/login-1,190"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,260"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,291"], "isController": false}, {"data": [0.98, 500, 1500, "test1/cskapi/api/account-1,193"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,280"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,217"], "isController": false}, {"data": [0.9933333333333333, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,205"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,254"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,251"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,224"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,258"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,259"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,287"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,218"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,244"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/108-1,256"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,227"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,201"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,294"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,283"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,295"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,293"], "isController": false}, {"data": [0.9871794871794872, 500, 1500, "test1/cskapi/api/child/167-1,223"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,296"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,206"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,220"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,290"], "isController": false}, {"data": [0.9821428571428571, 500, 1500, "test1/cskapi/api/child/168-1,226"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,198"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,234"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,270"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,204"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/role/list-1,274"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,225"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,195"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,235"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/dept/list-1,275"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,243"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,281"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/role/list-1,199"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,246"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,261"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,196"], "isController": false}, {"data": [0.995, 500, 1500, "test1/cskapi/api/onboarding-1,192"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,197"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,207"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,241"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,282"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,203"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/menu-1,191"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,269"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,289"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,242"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,286"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2001, 0, 0.0, 60.00299850074966, 13, 3161, 39.0, 114.79999999999995, 150.89999999999986, 359.9000000000001, 3.337313870950526, 5.236392609813638, 3.015026616370684], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/child/168-1,285", 2, 0, 0.0, 64.5, 34, 95, 64.5, 95.0, 95.0, 95.0, 0.007238115918426434, 0.005683051951577004, 0.0066655696397227805], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,284", 2, 0, 0.0, 38.5, 24, 53, 38.5, 53.0, 53.0, 53.0, 0.007147681828091104, 0.0056120470603371565, 0.006582289027236242], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,245", 12, 0, 0.0, 27.08333333333333, 18, 44, 25.0, 43.1, 44.0, 44.0, 0.021648457908181675, 0.016997422029470768, 0.01993603106192902], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,288", 1, 0, 0.0, 40.0, 40, 40, 40.0, 40.0, 40.0, 40.0, 25.0, 19.62890625, 23.0224609375], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,265", 6, 0, 0.0, 25.333333333333332, 16, 43, 19.5, 43.0, 43.0, 43.0, 0.012504897751619384, 0.006069271662651205, 0.011686706199511475], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-1,200", 99, 0, 0.0, 44.303030303030326, 15, 586, 26.0, 60.0, 87.0, 586.0, 0.16803042878310326, 0.12208460841272348, 0.15506714375003183], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,266", 6, 0, 0.0, 32.0, 21, 54, 27.5, 54.0, 54.0, 54.0, 0.011922100992117504, 0.0061356906473104735, 0.011211897710360505], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,267", 4, 0, 0.0, 23.5, 16, 31, 23.5, 31.0, 31.0, 31.0, 0.009341123830608061, 0.004533729046691607, 0.008720814826231745], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,268", 5, 0, 0.0, 65.2, 19, 166, 46.0, 166.0, 166.0, 166.0, 0.010380637205034194, 0.005342378717825215, 0.009752122061760638], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,248", 10, 0, 0.0, 72.39999999999999, 26, 355, 36.0, 326.0000000000001, 355.0, 355.0, 0.01881913680383308, 0.08356505375686428, 0.01778996525987346], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,237", 19, 0, 0.0, 68.89473684210526, 18, 507, 32.0, 131.0, 507.0, 507.0, 0.03295601586051626, 0.02491011355081991, 0.030928448478472786], "isController": false}, {"data": ["test1/cskapi/api/auth/login-1,190", 100, 0, 0.0, 84.53999999999999, 53, 523, 70.0, 127.9, 144.74999999999994, 519.9299999999985, 0.3013836523479293, 0.24399125761370452, 0.22015133980102652], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,260", 7, 0, 0.0, 23.285714285714285, 13, 29, 26.0, 29.0, 29.0, 29.0, 0.014129425537927415, 0.007271686775866941, 0.013273932976060715], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,291", 1, 0, 0.0, 50.0, 50, 50, 50.0, 50.0, 50.0, 50.0, 20.0, 15.5859375, 18.76953125], "isController": false}, {"data": ["test1/cskapi/api/account-1,193", 100, 0, 0.0, 105.99000000000002, 15, 3161, 41.5, 144.70000000000002, 316.59999999999945, 3141.23999999999, 0.24028353457079354, 0.11615268516849883, 0.22033812398630384], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,280", 3, 0, 0.0, 54.333333333333336, 27, 72, 64.0, 72.0, 72.0, 72.0, 0.007976538341890386, 0.03541925765681209, 0.0075403214013182555], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,217", 51, 0, 0.0, 65.58823529411761, 20, 271, 54.0, 122.60000000000002, 151.4, 271.0, 0.08657993959775978, 0.1100004896647319, 0.0798158818166848], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,205", 75, 0, 0.0, 57.73333333333331, 18, 1088, 31.0, 89.00000000000006, 141.20000000000005, 1088.0, 0.126167681895947, 0.09832208022750556, 0.11840541240430182], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,254", 9, 0, 0.0, 39.77777777777778, 17, 104, 31.0, 104.0, 104.0, 104.0, 0.016730054986114056, 0.06350558958107944, 0.01655033759856791], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,251", 9, 0, 0.0, 53.44444444444444, 18, 130, 29.0, 130.0, 130.0, 130.0, 0.01756982051452243, 0.013795054388355505, 0.0163687585652875], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,224", 32, 0, 0.0, 151.90624999999997, 35, 448, 112.5, 358.2, 395.99999999999983, 448.0, 0.05480174612063577, 0.33319889779988116, 0.03526792059912009], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,258", 7, 0, 0.0, 49.142857142857146, 24, 78, 48.0, 78.0, 78.0, 78.0, 0.014775444899199804, 0.06560932417642726, 0.013967412756274814], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,259", 7, 0, 0.0, 37.42857142857143, 15, 64, 39.0, 64.0, 64.0, 64.0, 0.013465863075256861, 0.006535677683986973, 0.012571645605415587], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,287", 1, 0, 0.0, 21.0, 21, 21, 21.0, 21.0, 21.0, 21.0, 47.61904761904761, 37.109375, 44.68936011904761], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,218", 47, 0, 0.0, 50.06382978723404, 16, 280, 29.0, 125.2, 144.3999999999999, 280.0, 0.0800292873136552, 0.0628354951173621, 0.07369884564138365], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,244", 15, 0, 0.0, 46.333333333333336, 17, 133, 40.0, 95.80000000000003, 133.0, 133.0, 0.02648913062673283, 0.020642896718879686, 0.0248594282541897], "isController": false}, {"data": ["test1/cskapi/api/child/108-1,256", 8, 0, 0.0, 43.0, 19, 106, 32.5, 106.0, 106.0, 106.0, 0.01512084389429774, 0.01184269219065116, 0.01408719245621098], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,227", 26, 0, 0.0, 41.42307692307693, 19, 115, 35.0, 69.0, 98.89999999999993, 115.0, 0.04461137487109886, 0.03371992592795949, 0.04186672973742774], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,201", 92, 0, 0.0, 58.46739130434782, 19, 283, 50.5, 110.7, 152.44999999999973, 283.0, 0.15429018965953858, 0.19602689135455048, 0.1405788544456538], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,294", 1, 0, 0.0, 55.0, 55, 55, 55.0, 55.0, 55.0, 55.0, 18.18181818181818, 10.546875, 20.98721590909091], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,283", 3, 0, 0.0, 51.0, 20, 100, 33.0, 100.0, 100.0, 100.0, 0.007772222078292184, 0.009874668870955205, 0.007165017228425607], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,295", 1, 0, 0.0, 48.0, 48, 48, 48.0, 48.0, 48.0, 48.0, 20.833333333333332, 12.0849609375, 23.98681640625], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,293", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 13.490188953488373, 26.79869186046512], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,223", 39, 0, 0.0, 72.51282051282051, 17, 639, 36.0, 108.0, 437.0, 639.0, 0.06660643623116873, 0.05541863639546461, 0.06133776305272668], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,296", 1, 0, 0.0, 88.0, 88, 88, 88.0, 88.0, 88.0, 88.0, 11.363636363636363, 6.591796875, 13.250177556818183], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,206", 67, 0, 0.0, 61.01492537313433, 19, 151, 56.0, 123.80000000000001, 136.39999999999995, 151.0, 0.11448079541940125, 0.14544874496156351, 0.10553698327726053], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,220", 42, 0, 0.0, 47.35714285714286, 19, 156, 42.0, 83.7, 108.75000000000003, 156.0, 0.07204005427017422, 0.054452150395619965, 0.06760790249378654], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,290", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 26.839717741935484, 29.70640120967742], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,226", 28, 0, 0.0, 61.89285714285715, 16, 551, 28.5, 90.8000000000003, 428.14999999999924, 551.0, 0.04849131399338094, 0.0380732582526155, 0.04465557528882639], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,198", 100, 0, 0.0, 53.47000000000002, 17, 294, 47.0, 96.50000000000003, 131.39999999999986, 292.7499999999994, 0.18565861465254918, 0.5906989907597707, 0.18003809018552863], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,234", 23, 0, 0.0, 63.04347826086955, 20, 312, 42.0, 133.8, 277.3999999999995, 312.0, 0.03965948025388965, 0.050387679502256276, 0.036561083359054516], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,270", 4, 0, 0.0, 73.25, 51, 117, 62.5, 117.0, 117.0, 117.0, 0.0087071986765058, 0.00495732112148719, 0.008809236160996103], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,204", 60, 0, 0.0, 174.53333333333336, 37, 436, 136.0, 317.5, 385.1499999999999, 436.0, 0.10253343017046182, 0.62341126586064, 0.06598586961165463], "isController": false}, {"data": ["test1/cskapi/api/global/role/list-1,274", 3, 0, 0.0, 20.0, 16, 24, 20.0, 24.0, 24.0, 24.0, 0.008646305577731729, 0.005876785822364534, 0.007979256612262191], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,225", 35, 0, 0.0, 46.971428571428575, 18, 123, 43.0, 90.0, 113.39999999999995, 123.0, 0.05978021377404445, 0.0465865337809448, 0.056102329528180395], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,195", 100, 0, 0.0, 53.76, 18, 341, 32.0, 105.60000000000002, 144.5499999999999, 340.5499999999998, 0.22293263421659243, 0.9899166872879354, 0.21074100578287255], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,235", 20, 0, 0.0, 59.89999999999999, 21, 301, 41.0, 129.2000000000001, 292.64999999999986, 301.0, 0.035685355087125795, 0.028018579580126116, 0.03286258774136682], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-1,275", 3, 0, 0.0, 39.333333333333336, 15, 52, 51.0, 52.0, 52.0, 52.0, 0.008181632235631009, 0.0059444671712006545, 0.007550432092452444], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,243", 14, 0, 0.0, 192.42857142857142, 64, 366, 146.0, 359.0, 366.0, 366.0, 0.024905758389237868, 0.1514289567689404, 0.016028217557136477], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,281", 2, 0, 0.0, 276.5, 226, 327, 276.5, 327.0, 327.0, 327.0, 0.007312721209816597, 0.04446191626202943, 0.004706136012958142], "isController": false}, {"data": ["test1/cskapi/api/global/role/list-1,199", 100, 0, 0.0, 35.76999999999998, 14, 141, 31.5, 62.80000000000001, 70.84999999999997, 140.36999999999966, 0.17702906286124995, 0.12032444116350581, 0.16337154726941522], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,246", 11, 0, 0.0, 54.54545454545455, 20, 106, 45.0, 104.2, 106.0, 106.0, 0.020513623843544455, 0.015505414897366608, 0.019251555189107636], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,261", 6, 0, 0.0, 68.83333333333333, 25, 130, 62.5, 130.0, 130.0, 130.0, 0.012891027844620144, 0.041014617888449637, 0.012500772118855277], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,196", 100, 0, 0.0, 36.61999999999998, 15, 319, 28.5, 52.0, 53.89999999999998, 317.52999999999923, 0.19462863882568865, 0.0944367045770817, 0.18170408077867026], "isController": false}, {"data": ["test1/cskapi/api/onboarding-1,192", 100, 0, 0.0, 48.629999999999995, 14, 662, 27.0, 115.60000000000008, 145.84999999999997, 658.4899999999982, 0.25764961713266893, 0.21311447823376034, 0.23450140934340571], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,197", 100, 0, 0.0, 36.53000000000001, 14, 155, 29.5, 60.0, 90.84999999999997, 154.8199999999999, 0.20736992721315553, 0.1066962827644485, 0.19481432615142152], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,207", 56, 0, 0.0, 48.91071428571429, 16, 253, 32.0, 108.80000000000003, 156.5999999999999, 253.0, 0.0945426919343266, 0.07866247414848267, 0.08706421727936521], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,241", 17, 0, 0.0, 45.52941176470589, 22, 100, 44.0, 96.8, 100.0, 100.0, 0.029862859210671933, 0.02257212209869148, 0.028025593458452857], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,282", 2, 0, 0.0, 54.5, 54, 55, 54.5, 55.0, 55.0, 55.0, 0.007623549143303664, 0.005762331090739293, 0.007154522194057443], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,203", 82, 0, 0.0, 40.4878048780488, 16, 125, 32.5, 62.500000000000014, 86.85, 125.0, 0.13804295492729177, 0.11485605234184822, 0.1248318127565158], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-1,191", 100, 0, 0.0, 37.43000000000002, 14, 239, 28.0, 69.70000000000002, 126.84999999999997, 238.0199999999995, 0.2785872284470991, 0.9345186813630716, 0.25328584930102466], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,269", 4, 0, 0.0, 35.75, 24, 69, 25.0, 69.0, 69.0, 69.0, 0.009106659472405684, 0.028974117735446992, 0.008830969586034028], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,289", 1, 0, 0.0, 180.0, 180, 180, 180.0, 180.0, 180.0, 180.0, 5.555555555555555, 4.19921875, 5.213758680555555], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,242", 16, 0, 0.0, 59.31250000000001, 20, 284, 39.0, 153.10000000000014, 284.0, 284.0, 0.02875437830338385, 0.023924541322737344, 0.02647986205087009], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,286", 2, 0, 0.0, 23.5, 21, 26, 23.5, 26.0, 26.0, 26.0, 0.007089986103627237, 0.005899090000283599, 0.006529157124727035], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2001, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
