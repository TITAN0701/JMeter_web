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

    var data = {"OkPercent": 90.71278616415076, "KoPercent": 9.287213835849245};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9054783564930521, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "test1/cskapi/api/child/168/avatar-1,215"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,285"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,284"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,245"], "isController": false}, {"data": [0.0, 500, 1500, "test1/cskapi/api/child/168/avatar-1,216"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,288"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,265"], "isController": false}, {"data": [0.9967105263157895, 500, 1500, "test1/cskapi/api/global/dept/list-1,200"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,266"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,267"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,268"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,248"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,237"], "isController": false}, {"data": [0.9969325153374233, 500, 1500, "test1/cskapi/api/auth/login-1,190"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,260"], "isController": false}, {"data": [0.9944444444444445, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,291"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-1,193"], "isController": false}, {"data": [0.9954954954954955, 500, 1500, "test1/cskapi/api/child/paged-1,280"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,217"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,205"], "isController": false}, {"data": [0.99609375, 500, 1500, "test1/cskapi/api/child/paged-1,254"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,251"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,224"], "isController": false}, {"data": [0.0, 500, 1500, "test1/cskapi/api/child/167/quizattempts/start-1,292"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,258"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,259"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,287"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,218"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,244"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/108-1,256"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,227"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,201"], "isController": false}, {"data": [0.9819277108433735, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,294"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,283"], "isController": false}, {"data": [0.9634146341463414, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,295"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,305"], "isController": false}, {"data": [0.0, 500, 1500, "test1/cskapi/api/child-1,214"], "isController": false}, {"data": [0.9705882352941176, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,293"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,306"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,223"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,296"], "isController": false}, {"data": [0.9805194805194806, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,297"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,302"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,206"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,220"], "isController": false}, {"data": [0.9930555555555556, 500, 1500, "test1/cskapi/api/child/168-1,301"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,290"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,304"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,226"], "isController": false}, {"data": [0.0, 500, 1500, "test1/cskapi/api/child/168/avatar-1,232"], "isController": false}, {"data": [0.0, 500, 1500, "test1/cskapi/api/child/168/avatar-1,233"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,198"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,234"], "isController": false}, {"data": [0.9957983193277311, 500, 1500, "test1/cskapi/api/question/observation/paged-1,270"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,299"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,204"], "isController": false}, {"data": [0.0, 500, 1500, "test1/cskapi/api/child/168-1,231"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/role/list-1,274"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,225"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-1,298"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,303"], "isController": false}, {"data": [0.9936708860759493, 500, 1500, "test1/cskapi/api/child/paged-1,195"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,235"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,307"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/dept/list-1,275"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,243"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,281"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/role/list-1,199"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,246"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,300"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,261"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,196"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/onboarding-1,192"], "isController": false}, {"data": [0.9968152866242038, 500, 1500, "test1/cskapi/api/question/directions-1,197"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,207"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,241"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,282"], "isController": false}, {"data": [0.9966887417218543, 500, 1500, "test1/cskapi/api/child/167-1,203"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/menu-1,191"], "isController": false}, {"data": [0.9958333333333333, 500, 1500, "test1/cskapi/api/question/observation/paged-1,269"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,289"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,242"], "isController": false}, {"data": [0.9948979591836735, 500, 1500, "test1/cskapi/api/child/167-1,286"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10003, 929, 9.287213835849245, 29.695291412576186, 0, 2931, 20.0, 41.0, 52.0, 250.0, 16.67625263614161, 29.459917883668005, 15.173178157847573], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/child/168/avatar-1,215", 145, 145, 100.0, 3.53103448275862, 0, 34, 2.0, 4.0, 11.099999999999966, 33.53999999999999, 0.24290996081611047, 0.6255405924532064, 0.0], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,285", 101, 0, 0.0, 29.851485148514858, 13, 291, 20.0, 46.0, 54.89999999999999, 290.26000000000016, 0.16957832083882504, 0.13314547847110872, 0.15616441069434767], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,284", 102, 0, 0.0, 24.07843137254902, 13, 255, 19.0, 37.0, 46.69999999999999, 249.02999999999977, 0.17180394138453764, 0.13489293835270338, 0.1582139811773623], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,245", 131, 0, 0.0, 22.343511450381676, 12, 271, 18.0, 23.0, 26.0, 267.4800000000001, 0.21963798295206863, 0.17245013505221013, 0.2022642753162116], "isController": false}, {"data": ["test1/cskapi/api/child/168/avatar-1,216", 144, 144, 100.0, 52.062500000000014, 32, 582, 43.0, 60.5, 71.25, 449.70000000000334, 0.2427990685957952, 0.07516338353990926, 0.2252530421543022], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,288", 95, 0, 0.0, 20.021052631578957, 12, 59, 18.0, 25.0, 33.19999999999982, 59.0, 0.16083430680413768, 0.12628006120168622, 0.148112061832326], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,265", 125, 0, 0.0, 19.791999999999987, 11, 248, 15.0, 20.400000000000006, 27.099999999999966, 247.48, 0.21369603534019554, 0.10371770465241913, 0.1997139705278976], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-1,200", 152, 0, 0.0, 26.59868421052631, 11, 504, 17.0, 25.700000000000017, 43.349999999999994, 421.3199999999998, 0.2568921458606563, 0.1866481997268831, 0.23707331820148458], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,266", 125, 0, 0.0, 17.631999999999987, 9, 250, 15.0, 19.0, 21.0, 199.039999999999, 0.2121765580549011, 0.1091963340770829, 0.19953713418639626], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,267", 123, 0, 0.0, 24.373983739837396, 10, 249, 16.0, 42.60000000000001, 46.599999999999994, 206.04000000000093, 0.20600254572251625, 0.09998365744540094, 0.1923226891706304], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,268", 125, 0, 0.0, 23.12, 11, 257, 16.0, 41.400000000000006, 46.39999999999998, 203.95999999999896, 0.20964501229358354, 0.10789347800656106, 0.19695166193987046], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,248", 130, 0, 0.0, 36.769230769230745, 13, 293, 22.0, 50.0, 71.69999999999993, 285.24999999999994, 0.21803264116355636, 0.9751850552041876, 0.20610898109992437], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,237", 133, 0, 0.0, 23.187969924812037, 14, 266, 20.0, 27.0, 31.299999999999997, 191.87999999999926, 0.22655149447333592, 0.17124107101793165, 0.21261326776257403], "isController": false}, {"data": ["test1/cskapi/api/auth/login-1,190", 163, 0, 0.0, 56.625766871165645, 19, 641, 52.0, 73.6, 106.99999999999991, 425.31999999999505, 0.273409653205854, 0.22134433838637985, 0.19971720761521367], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,260", 127, 0, 0.0, 18.897637795275593, 11, 248, 15.0, 21.0, 24.0, 216.35999999999987, 0.21311335113193397, 0.10965714970122178, 0.20021000370011763], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,291", 90, 0, 0.0, 29.70000000000001, 14, 563, 20.0, 27.0, 45.250000000000014, 563.0, 0.15129813802424805, 0.11790616615561518, 0.14198975648564685], "isController": false}, {"data": ["test1/cskapi/api/account-1,193", 159, 0, 0.0, 20.471698113207548, 12, 287, 18.0, 24.0, 27.0, 144.20000000000135, 0.26715505074265744, 0.1291423340992338, 0.24497909438218296], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,280", 111, 0, 0.0, 26.405405405405407, 14, 561, 20.0, 28.799999999999997, 34.99999999999996, 499.7999999999977, 0.18716613608158422, 0.837129788333648, 0.17693048801462255], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,217", 143, 0, 0.0, 27.04195804195805, 15, 353, 21.0, 28.0, 32.599999999999966, 307.24000000000024, 0.2412634782770076, 0.22123672470909195, 0.2224147690366164], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,205", 149, 0, 0.0, 25.24832214765102, 14, 256, 20.0, 31.0, 49.5, 252.5, 0.251853404415717, 0.19626857101927944, 0.2363585172299844], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,254", 128, 0, 0.0, 34.8359375, 14, 1189, 20.0, 30.0, 42.099999999999994, 949.4599999999948, 0.21614574978089912, 0.820467313865581, 0.21382387160942465], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,251", 128, 0, 0.0, 29.906250000000007, 13, 252, 20.0, 45.10000000000001, 54.749999999999986, 247.9399999999999, 0.218161985274066, 0.17129124625034087, 0.20324856831197163], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,224", 139, 0, 0.0, 37.84892086330934, 15, 231, 30.0, 43.0, 57.0, 228.59999999999997, 0.2328659261865273, 2.9654020287815586, 0.14986195835636865], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/start-1,292", 87, 87, 100.0, 20.839080459770106, 15, 51, 21.0, 25.200000000000003, 26.599999999999994, 51.0, 0.14666118232513606, 0.052276690965502595, 0.15611395384218585], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,258", 127, 0, 0.0, 22.2755905511811, 14, 180, 20.0, 27.0, 34.799999999999955, 144.43999999999986, 0.21559882999438085, 0.9642994544670549, 0.20380826897906315], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,259", 126, 0, 0.0, 17.873015873015877, 10, 143, 15.0, 22.0, 33.44999999999989, 123.83000000000028, 0.21498111237369857, 0.10434141879856271, 0.2007050228801327], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,287", 97, 0, 0.0, 32.000000000000014, 15, 494, 21.0, 34.60000000000002, 47.799999999999955, 494.0, 0.16301863454247223, 0.12703991246571567, 0.1529891677688631], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,218", 141, 0, 0.0, 19.446808510638302, 12, 87, 18.0, 24.0, 27.0, 66.00000000000063, 0.2386271324126726, 0.1873595844333875, 0.21975135338393584], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,244", 132, 0, 0.0, 25.159090909090914, 14, 395, 20.0, 27.0, 29.0, 347.14999999999816, 0.22193900712558723, 0.17295637469357283, 0.20828455649188407], "isController": false}, {"data": ["test1/cskapi/api/child/108-1,256", 127, 0, 0.0, 22.685039370078737, 11, 248, 18.0, 27.0, 42.599999999999994, 216.07999999999987, 0.21717606138387321, 0.17009296995104134, 0.20233004156271], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,227", 138, 0, 0.0, 22.818840579710148, 13, 180, 21.0, 27.0, 31.0, 147.23999999999876, 0.23221259904792835, 0.1755200699834927, 0.21792608172369055], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,201", 152, 0, 0.0, 22.249999999999982, 15, 66, 21.0, 27.0, 34.349999999999994, 57.51999999999998, 0.25391776739461996, 0.23284060896830872, 0.23135280954998086], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,294", 83, 0, 0.0, 117.26506024096388, 21, 1577, 37.0, 258.2000000000001, 316.3999999999999, 1577.0, 0.14064459280848612, 0.08158485168773512, 0.16234561396448302], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,283", 109, 0, 0.0, 26.366972477064223, 15, 260, 22.0, 27.0, 32.0, 259.30000000000007, 0.18270350908069966, 0.16753769045583686, 0.16842979743376996], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,295", 82, 0, 0.0, 128.2073170731707, 19, 1654, 31.0, 255.00000000000003, 522.4999999999986, 1654.0, 0.13854417109191394, 0.08036644299667663, 0.15951521261461574], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,305", 67, 0, 0.0, 22.432835820895523, 14, 51, 21.0, 30.200000000000003, 43.99999999999994, 51.0, 0.11387798738503847, 0.08607574437111305, 0.10687182214552926], "isController": false}, {"data": ["test1/cskapi/api/child-1,214", 146, 146, 100.0, 20.93835616438356, 11, 372, 15.0, 34.30000000000001, 42.650000000000006, 242.2800000000003, 0.24426643110013588, 0.14288632053611464, 0.3237007294950043], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,293", 85, 0, 0.0, 127.56470588235297, 21, 2931, 31.0, 207.80000000000004, 288.30000000000024, 2931.0, 0.1429984589813126, 0.08295027796376923, 0.16478338046674695], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,306", 65, 0, 0.0, 25.615384615384617, 14, 249, 19.0, 40.199999999999996, 49.89999999999997, 249.0, 0.11049836462420357, 0.09193809244123187, 0.10175777132873433], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,223", 140, 0, 0.0, 23.678571428571423, 12, 250, 19.0, 27.0, 30.94999999999999, 243.85000000000005, 0.2349651664140791, 0.19549836111796426, 0.21637905461765294], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,296", 81, 0, 0.0, 101.66666666666667, 20, 2114, 41.0, 199.39999999999998, 236.99999999999983, 2114.0, 0.1362544492965233, 0.07903822547083482, 0.15887481685551647], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,297", 77, 0, 0.0, 114.85714285714286, 20, 2643, 31.0, 241.60000000000002, 274.3999999999994, 2643.0, 0.13053258991915456, 0.07571910001169709, 0.1522030394174517], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,302", 71, 0, 0.0, 25.8169014084507, 13, 263, 19.0, 27.0, 39.599999999999966, 263.0, 0.11996404457931481, 0.09981383396638302, 0.11047470120927136], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,206", 149, 0, 0.0, 27.114093959731537, 14, 245, 22.0, 45.0, 57.5, 154.5, 0.2489245290899219, 0.22826184845257486, 0.22947730025477173], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,220", 141, 0, 0.0, 22.40425531914893, 14, 239, 19.0, 27.0, 30.900000000000006, 179.36000000000178, 0.23587430743288457, 0.178287806594778, 0.2213625092216817], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,301", 72, 0, 0.0, 32.26388888888889, 13, 607, 20.0, 29.700000000000003, 42.69999999999999, 607.0, 0.12207569371208446, 0.09584849389112883, 0.11241931559618717], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,290", 91, 0, 0.0, 28.10989010989012, 12, 258, 19.0, 31.39999999999999, 44.79999999999998, 258.0, 0.15397813510481512, 0.1281146202239282, 0.1417982240271881], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,304", 68, 0, 0.0, 31.029411764705877, 14, 499, 19.0, 36.50000000000001, 52.749999999999986, 499.0, 0.11490154796041303, 0.09021566851579305, 0.10581265598307567], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,226", 138, 0, 0.0, 23.07246376811595, 12, 254, 18.0, 24.10000000000001, 35.04999999999998, 251.6599999999999, 0.23432167271714657, 0.18397912584432213, 0.21578646227760667], "isController": false}, {"data": ["test1/cskapi/api/child/168/avatar-1,232", 135, 135, 100.0, 8.185185185185185, 1, 118, 2.0, 27.400000000000006, 37.39999999999998, 92.43999999999903, 0.22953796557950684, 0.5911050930011323, 0.0], "isController": false}, {"data": ["test1/cskapi/api/child/168/avatar-1,233", 135, 135, 100.0, 58.37777777777777, 32, 1060, 43.0, 57.0, 71.59999999999985, 777.3999999999893, 0.22742817481308772, 0.0704050111481922, 0.21099293561761068], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,198", 155, 0, 0.0, 22.393548387096775, 14, 90, 20.0, 30.0, 37.599999999999966, 86.07999999999998, 0.26061720880650774, 0.8291902991128927, 0.25272743002427944], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,234", 134, 0, 0.0, 26.671641791044777, 14, 257, 21.0, 27.5, 32.0, 257.0, 0.2277451361966902, 0.2088405106334884, 0.2099525474313238], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,270", 119, 0, 0.0, 31.042016806722682, 15, 1171, 21.0, 27.0, 32.0, 945.3999999999968, 0.19939043495599168, 0.1135201402142023, 0.20172704161563224], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,299", 75, 0, 0.0, 31.346666666666664, 15, 335, 21.0, 43.20000000000002, 68.60000000000002, 335.0, 0.12657117012515356, 0.09567000554381724, 0.11878407665065682], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,204", 148, 0, 0.0, 40.466216216216196, 18, 254, 32.0, 55.49999999999997, 74.5999999999998, 248.6099999999999, 0.24784475540402043, 3.156148057098073, 0.1595016541125483], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,231", 137, 137, 100.0, 18.48175182481752, 11, 359, 15.0, 20.0, 23.099999999999994, 244.62000000000137, 0.23109686669759202, 0.13518263979673595, 0.3123418588959642], "isController": false}, {"data": ["test1/cskapi/api/global/role/list-1,274", 116, 0, 0.0, 21.362068965517235, 10, 261, 16.0, 31.499999999999986, 46.29999999999998, 230.5699999999997, 0.19452218810630972, 0.1322142997285074, 0.17951510523482686], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,225", 139, 0, 0.0, 25.62589928057555, 13, 251, 20.0, 27.0, 32.0, 248.99999999999997, 0.23568190064736222, 0.18366616866854985, 0.22118193996300303], "isController": false}, {"data": ["test1/cskapi/api/account-1,298", 76, 0, 0.0, 26.894736842105264, 12, 250, 19.0, 31.699999999999974, 63.649999999999906, 250.0, 0.12867223794882907, 0.06219995877409218, 0.11610658971163874], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,303", 69, 0, 0.0, 21.130434782608695, 14, 43, 20.0, 27.0, 32.0, 43.0, 0.11728131708618818, 0.09139696390115055, 0.1100657673045184], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,195", 158, 0, 0.0, 27.19620253164557, 13, 564, 19.0, 26.099999999999994, 35.04999999999998, 559.28, 0.264202559754927, 1.181687230153873, 0.24975398226832948], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,235", 134, 0, 0.0, 23.261194029850746, 13, 249, 18.0, 23.0, 26.25, 247.25000000000003, 0.22563100910943104, 0.17715559699607672, 0.2077832437404233], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,307", 64, 0, 0.0, 26.953124999999993, 14, 76, 21.5, 48.5, 55.25, 76.0, 0.10802125318156347, 0.08418062503797623, 0.10137541436277588], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-1,275", 114, 0, 0.0, 18.719298245614034, 11, 55, 17.0, 27.0, 32.5, 54.099999999999966, 0.19192630030068453, 0.13944645256221613, 0.17711948611733097], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,243", 131, 0, 0.0, 36.32824427480918, 17, 237, 30.0, 40.0, 60.39999999999978, 233.16000000000008, 0.2222225991901598, 2.829865911562191, 0.14301239537726101], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,281", 105, 0, 0.0, 33.61904761904761, 19, 305, 31.0, 43.400000000000006, 49.0, 290.35999999999945, 0.17606637534668307, 2.2420952485554175, 0.11330834116549234], "isController": false}, {"data": ["test1/cskapi/api/global/role/list-1,199", 153, 0, 0.0, 20.03921568627449, 11, 242, 15.0, 20.599999999999994, 26.199999999999932, 238.76000000000005, 0.2576794366756995, 0.1751414921155145, 0.23779987076028908], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,246", 130, 0, 0.0, 20.984615384615388, 14, 61, 20.0, 27.0, 30.44999999999999, 52.93999999999994, 0.2205861142737881, 0.16673208246866403, 0.20701489825889682], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,300", 74, 0, 0.0, 24.83783783783784, 17, 49, 23.0, 32.0, 42.25, 49.0, 0.12487617851893477, 0.1145104801067185, 0.11512022707214299], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,261", 126, 0, 0.0, 22.97619047619048, 14, 239, 20.0, 27.299999999999997, 32.64999999999999, 186.08000000000078, 0.21325823032904392, 0.6785110492304932, 0.206802170621817], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,196", 156, 0, 0.0, 17.10897435897437, 9, 236, 15.0, 20.0, 25.30000000000001, 120.86000000000138, 0.26215227013783154, 0.12723601392431866, 0.24474372094899124], "isController": false}, {"data": ["test1/cskapi/api/onboarding-1,192", 160, 0, 0.0, 18.712500000000006, 12, 50, 16.0, 26.0, 37.89999999999998, 48.77999999999997, 0.26811718061378725, 0.2217727070115994, 0.2440285276680173], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,197", 157, 0, 0.0, 26.140127388535024, 10, 549, 15.0, 26.0, 40.09999999999994, 377.3199999999963, 0.26320951309593066, 0.1354603646499565, 0.2472729996077005], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,207", 146, 0, 0.0, 25.34246575342465, 13, 358, 19.0, 25.30000000000001, 42.55000000000004, 318.5200000000001, 0.24723469684962035, 0.20570699386316066, 0.22767804602460154], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,241", 133, 0, 0.0, 22.255639097744353, 14, 255, 20.0, 25.0, 28.0, 180.87999999999926, 0.2244502235220459, 0.16965280566998392, 0.2106412742233263], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,282", 107, 0, 0.0, 23.999999999999993, 13, 250, 21.0, 30.0, 33.19999999999999, 233.76000000000033, 0.17952899644968826, 0.13569867505083857, 0.16848375545717814], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,203", 151, 0, 0.0, 27.582781456953633, 12, 557, 18.0, 43.80000000000001, 53.80000000000001, 396.31999999999687, 0.25387965095751297, 0.21123580333574324, 0.22958257498696977], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-1,191", 162, 0, 0.0, 24.827160493827154, 11, 245, 17.0, 29.700000000000017, 45.39999999999998, 243.74, 0.27212392725220347, 0.9128375879993348, 0.24740954714043106], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,269", 120, 0, 0.0, 31.608333333333338, 14, 557, 21.0, 45.80000000000001, 48.94999999999999, 497.1499999999977, 0.20191788336213468, 0.6424301406189792, 0.1958051349400388], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,289", 94, 0, 0.0, 26.84042553191489, 14, 241, 21.0, 39.5, 46.25, 241.0, 0.15776470904159617, 0.11924793437323775, 0.14805848182516987], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,242", 132, 0, 0.0, 19.18181818181818, 13, 35, 18.5, 24.0, 26.0, 34.66999999999999, 0.22410104920036672, 0.18645907609249263, 0.20637430605072835], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,286", 98, 0, 0.0, 31.367346938775515, 13, 611, 18.0, 44.10000000000001, 47.14999999999999, 611.0, 0.16569952251484532, 0.13786718084242988, 0.15259243137841713], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 370, 39.82777179763186, 3.69889033290013], "isController": false}, {"data": ["Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\suppo\\\\Desktop\\\\國衛院-兒童web\\\\stress\\\\results\\\\User_100u_10m\\\\file-1775701915616.jpeg (系統找不到指定的檔案。)", 145, 15.608180839612487, 1.4495651304608617], "isController": false}, {"data": ["404/Not Found", 279, 30.032292787944026, 2.7891632510246924], "isController": false}, {"data": ["Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\suppo\\\\Desktop\\\\國衛院-兒童web\\\\stress\\\\results\\\\User_100u_10m\\\\file-1775701933696.jpeg (系統找不到指定的檔案。)", 135, 14.531754574811625, 1.3495951214635609], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10003, 929, "400/Bad Request", 370, "404/Not Found", 279, "Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\suppo\\\\Desktop\\\\國衛院-兒童web\\\\stress\\\\results\\\\User_100u_10m\\\\file-1775701915616.jpeg (系統找不到指定的檔案。)", 145, "Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\suppo\\\\Desktop\\\\國衛院-兒童web\\\\stress\\\\results\\\\User_100u_10m\\\\file-1775701933696.jpeg (系統找不到指定的檔案。)", 135, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["test1/cskapi/api/child/168/avatar-1,215", 145, 145, "Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\suppo\\\\Desktop\\\\國衛院-兒童web\\\\stress\\\\results\\\\User_100u_10m\\\\file-1775701915616.jpeg (系統找不到指定的檔案。)", 145, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["test1/cskapi/api/child/168/avatar-1,216", 144, 144, "404/Not Found", 144, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/start-1,292", 87, 87, "400/Bad Request", 87, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["test1/cskapi/api/child-1,214", 146, 146, "400/Bad Request", 146, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["test1/cskapi/api/child/168/avatar-1,232", 135, 135, "Non HTTP response code: java.io.FileNotFoundException/Non HTTP response message: C:\\\\Users\\\\suppo\\\\Desktop\\\\國衛院-兒童web\\\\stress\\\\results\\\\User_100u_10m\\\\file-1775701933696.jpeg (系統找不到指定的檔案。)", 135, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["test1/cskapi/api/child/168/avatar-1,233", 135, 135, "404/Not Found", 135, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,231", 137, 137, "400/Bad Request", 137, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
