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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9982517482517482, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,285"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,284"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,245"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,288"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,265"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/dept/list-1,200"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,266"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,267"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,268"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,248"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,237"], "isController": false}, {"data": [0.9875, 500, 1500, "test1/cskapi/api/auth/login-1,190"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,260"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,291"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-1,193"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,280"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,217"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,205"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,254"], "isController": false}, {"data": [0.98, 500, 1500, "test1/cskapi/api/child/168-1,251"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,224"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,258"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,259"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,287"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,218"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,244"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/108-1,256"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,227"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,201"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,294"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,283"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,295"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,305"], "isController": false}, {"data": [0.9047619047619048, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,293"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,306"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,223"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,296"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/quizattempts/ai/complete-1,297"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,302"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,206"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,220"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,301"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,290"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,304"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,226"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,198"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,234"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,270"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,299"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,204"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/role/list-1,274"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,225"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/account-1,298"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,303"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/paged-1,195"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168-1,235"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/growth/monitoring-1,307"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/dept/list-1,275"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167/avatar-1,243"], "isController": false}, {"data": [0.9772727272727273, 500, 1500, "test1/cskapi/api/child/167/avatar-1,281"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/global/role/list-1,199"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,246"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/mine-1,300"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,261"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/ages-1,196"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/onboarding-1,192"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/directions-1,197"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,207"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,241"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,282"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,203"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/auth/menu-1,191"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/question/observation/paged-1,269"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/168/growth/monitoring-1,289"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,242"], "isController": false}, {"data": [1.0, 500, 1500, "test1/cskapi/api/child/167-1,286"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2002, 0, 0.0, 54.11888111888117, 11, 3932, 31.0, 108.0, 133.0, 299.97, 3.3384471718249733, 4.839980411427762, 3.0851691865870134], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["test1/cskapi/api/child/168-1,285", 22, 0, 0.0, 45.77272727272727, 18, 97, 32.0, 92.19999999999999, 96.55, 97.0, 0.04233863207728725, 0.03324244159193256, 0.038989580125861206], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,284", 22, 0, 0.0, 33.95454545454546, 17, 109, 28.0, 55.0, 100.89999999999989, 109.0, 0.042748910388568165, 0.03356457417227422, 0.03936740478165994], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,245", 25, 0, 0.0, 55.199999999999996, 17, 296, 30.0, 161.00000000000037, 286.09999999999997, 296.0, 0.04568880441536606, 0.03587285034175226, 0.04207474859735371], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,288", 22, 0, 0.0, 34.0909090909091, 17, 106, 27.5, 67.19999999999999, 100.44999999999992, 106.0, 0.04148516905206388, 0.03257233976353454, 0.03820362735946899], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,265", 24, 0, 0.0, 24.250000000000004, 11, 54, 23.5, 32.0, 48.75, 54.0, 0.04218993910585456, 0.020476952866806362, 0.03942946457451446], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-1,200", 35, 0, 0.0, 31.828571428571426, 16, 153, 26.0, 46.79999999999996, 107.39999999999975, 153.0, 0.05889043686608651, 0.04278758303551598, 0.05434713167817554], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,266", 23, 0, 0.0, 27.999999999999996, 16, 73, 24.0, 50.40000000000001, 69.19999999999995, 73.0, 0.04425204425204425, 0.02277424543049543, 0.041615936147186144], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,267", 23, 0, 0.0, 26.82608695652174, 13, 68, 24.0, 51.40000000000001, 65.39999999999996, 68.0, 0.043314256228307556, 0.02102264193893443, 0.04043791890064651], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,268", 23, 0, 0.0, 46.7391304347826, 16, 266, 26.0, 115.60000000000005, 238.7999999999996, 266.0, 0.043643595017799, 0.02246110798279304, 0.0410011117257057], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,248", 25, 0, 0.0, 48.71999999999999, 15, 131, 41.0, 100.20000000000005, 124.99999999999999, 131.0, 0.04490619992958708, 0.19940282332014886, 0.042450392120937784], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,237", 27, 0, 0.0, 62.33333333333335, 18, 326, 30.0, 160.79999999999993, 297.99999999999983, 326.0, 0.04692640722736192, 0.03546976483786926, 0.04403933334520977], "isController": false}, {"data": ["test1/cskapi/api/auth/login-1,190", 40, 0, 0.0, 98.94999999999999, 25, 504, 75.0, 173.79999999999998, 332.0499999999994, 504.0, 0.069298148353476, 0.05610172361819492, 0.05062013180507817], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,260", 24, 0, 0.0, 38.5, 11, 294, 26.0, 64.0, 238.25, 294.0, 0.04348598120680845, 0.022379992281238333, 0.04085304093842747], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,291", 21, 0, 0.0, 54.14285714285713, 18, 132, 38.0, 117.40000000000002, 131.0, 132.0, 0.046198521647307283, 0.03600236354936642, 0.04335622978814678], "isController": false}, {"data": ["test1/cskapi/api/account-1,193", 40, 0, 0.0, 37.650000000000006, 15, 134, 29.0, 82.29999999999998, 112.89999999999999, 134.0, 0.0671685275147477, 0.03246916124980479, 0.061593014976902415], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,280", 23, 0, 0.0, 56.91304347826086, 21, 135, 33.0, 126.20000000000002, 133.79999999999998, 135.0, 0.04156636522015716, 0.18457252212505332, 0.03929320462217981], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,217", 31, 0, 0.0, 63.903225806451616, 20, 275, 52.0, 124.00000000000001, 193.3999999999998, 275.0, 0.052687397174595835, 0.06693974973061444, 0.04857119427033054], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,205", 33, 0, 0.0, 54.424242424242415, 18, 352, 35.0, 111.00000000000003, 189.59999999999934, 352.0, 0.0562436406338147, 0.04383049338455482, 0.05278333852450774], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,254", 25, 0, 0.0, 48.52000000000001, 16, 287, 29.0, 87.20000000000007, 233.89999999999986, 287.0, 0.04396794912380671, 0.1668978693791374, 0.04349563717032832], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,251", 25, 0, 0.0, 71.36000000000001, 15, 1063, 26.0, 68.40000000000008, 771.0999999999993, 1063.0, 0.04448984385844399, 0.034931478966981414, 0.04144854593843317], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,224", 29, 0, 0.0, 77.31034482758619, 24, 295, 68.0, 142.0, 223.5, 295.0, 0.04960979331533695, 0.3016314191223514, 0.03192661503399126], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,258", 24, 0, 0.0, 58.791666666666664, 16, 360, 29.0, 199.0, 339.25, 360.0, 0.0439788388487073, 0.19528494164557822, 0.04157374609916862], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,259", 24, 0, 0.0, 37.75, 12, 288, 27.5, 56.5, 233.5, 288.0, 0.04295632594544189, 0.02084891991687951, 0.040103757425627384], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,287", 22, 0, 0.0, 44.04545454545454, 17, 105, 33.0, 96.3, 104.1, 105.0, 0.041661616773724396, 0.03246676775921101, 0.03909845089799722], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,218", 30, 0, 0.0, 44.66666666666668, 16, 143, 28.0, 95.30000000000001, 118.79999999999997, 143.0, 0.051506036507478675, 0.040440286476575056, 0.04743182854155507], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,244", 26, 0, 0.0, 33.92307692307692, 17, 80, 26.5, 70.5, 77.89999999999999, 80.0, 0.04516139117928551, 0.035194131016669766, 0.042382907151653694], "isController": false}, {"data": ["test1/cskapi/api/child/108-1,256", 25, 0, 0.0, 49.92, 14, 175, 30.0, 136.60000000000002, 165.09999999999997, 175.0, 0.043645937174292194, 0.03418363438845931, 0.04066232818776831], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,227", 28, 0, 0.0, 41.67857142857144, 17, 118, 31.5, 90.40000000000002, 111.24999999999996, 118.0, 0.04822381360807129, 0.03645042161391326, 0.04525691882554347], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,201", 34, 0, 0.0, 51.55882352941178, 20, 131, 47.5, 93.0, 104.75, 131.0, 0.057794526858306515, 0.0734283978932195, 0.052658489803515604], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,294", 21, 0, 0.0, 91.57142857142857, 26, 383, 66.0, 155.8, 360.3999999999997, 383.0, 0.04642310013462699, 0.026929024882781673, 0.053586039413212015], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,283", 22, 0, 0.0, 63.86363636363636, 19, 279, 48.0, 121.59999999999997, 257.0999999999997, 279.0, 0.04357626440492649, 0.05536398436602477, 0.04017186874829161], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,295", 21, 0, 0.0, 92.33333333333333, 25, 335, 67.0, 273.4000000000001, 331.4, 335.0, 0.0466422054211569, 0.027056123066569533, 0.05370230487455468], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,305", 20, 0, 0.0, 49.00000000000001, 18, 139, 31.0, 98.20000000000002, 136.99999999999997, 139.0, 0.04943324781381461, 0.03736458379677003, 0.04639194448151938], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,293", 21, 0, 0.0, 374.80952380952374, 23, 3932, 63.0, 2142.800000000002, 3803.199999999998, 3932.0, 0.04598164237668161, 0.026672944894286014, 0.0529866582075042], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,306", 20, 0, 0.0, 33.85, 14, 105, 25.5, 65.90000000000002, 103.09999999999997, 105.0, 0.04886486909101571, 0.040657098110884166, 0.04499958159455841], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,223", 29, 0, 0.0, 35.482758620689665, 14, 130, 27.0, 79.0, 105.5, 130.0, 0.0507883579073095, 0.04225750091506611, 0.04677091944003209], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,296", 21, 0, 0.0, 91.42857142857146, 26, 286, 86.0, 140.20000000000002, 271.6999999999998, 286.0, 0.04648166962157281, 0.026962999760951414, 0.05419835305484173], "isController": false}, {"data": ["test1/cskapi/api/child/167/quizattempts/ai/complete-1,297", 21, 0, 0.0, 76.38095238095238, 25, 144, 67.0, 143.2, 144.0, 144.0, 0.04605030886600018, 0.02671277682266026, 0.05369537967383224], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,302", 21, 0, 0.0, 39.952380952380956, 14, 137, 26.0, 117.00000000000003, 135.7, 137.0, 0.04531555812583483, 0.03770396047188601, 0.04173102667252173], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,206", 33, 0, 0.0, 61.454545454545446, 17, 130, 57.0, 122.4, 129.3, 130.0, 0.05574814003932778, 0.07082844745231, 0.051392816598755296], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,220", 30, 0, 0.0, 48.96666666666666, 18, 161, 34.0, 120.50000000000003, 144.49999999999997, 161.0, 0.051051664284255664, 0.03858787905860731, 0.04791079040739228], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,301", 21, 0, 0.0, 51.47619047619049, 20, 219, 31.0, 143.40000000000003, 212.0999999999999, 219.0, 0.0454088417501865, 0.03565303590541987, 0.041816931416431516], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,290", 21, 0, 0.0, 47.28571428571428, 12, 138, 33.0, 122.20000000000002, 136.89999999999998, 138.0, 0.046446304754111045, 0.03864477700244396, 0.04277232947570969], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,304", 20, 0, 0.0, 37.949999999999996, 17, 94, 31.5, 67.20000000000002, 92.69999999999999, 94.0, 0.04932036536526663, 0.03872419311882262, 0.04541904740180315], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,226", 28, 0, 0.0, 46.964285714285715, 16, 282, 31.5, 84.20000000000005, 205.94999999999953, 282.0, 0.04862267587950606, 0.03817639785851843, 0.04477654624450607], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,198", 36, 0, 0.0, 56.22222222222222, 18, 184, 33.0, 130.60000000000002, 155.94999999999996, 184.0, 0.06077293038629638, 0.1933576242173375, 0.058933124876554985], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,234", 28, 0, 0.0, 53.964285714285715, 18, 142, 33.5, 115.70000000000002, 137.04999999999995, 142.0, 0.04787224948280873, 0.060822066969857584, 0.044132229991964304], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,270", 23, 0, 0.0, 44.69565217391304, 14, 127, 36.0, 90.80000000000003, 121.19999999999992, 127.0, 0.04269054367335423, 0.024305260704653827, 0.04319082348202635], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,299", 21, 0, 0.0, 61.857142857142854, 19, 358, 36.0, 115.60000000000002, 334.29999999999967, 358.0, 0.04598728123193357, 0.03475991764991854, 0.04315798560926578], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,204", 32, 0, 0.0, 89.96875, 19, 379, 65.0, 217.29999999999998, 322.4499999999998, 379.0, 0.05462549952458745, 0.33212730472664204, 0.03515449627607727], "isController": false}, {"data": ["test1/cskapi/api/global/role/list-1,274", 23, 0, 0.0, 32.04347826086956, 15, 126, 25.0, 53.800000000000004, 111.7999999999998, 126.0, 0.04228928444692051, 0.028743498022516283, 0.03902673222884754], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,225", 29, 0, 0.0, 60.82758620689655, 14, 303, 33.0, 144.0, 224.0, 303.0, 0.05000638012436069, 0.0389698157609764, 0.046929815722178345], "isController": false}, {"data": ["test1/cskapi/api/account-1,298", 21, 0, 0.0, 39.57142857142858, 17, 117, 31.0, 84.20000000000002, 114.19999999999996, 117.0, 0.045976810172697655, 0.022225118198716153, 0.04148688730427015], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,303", 20, 0, 0.0, 56.949999999999996, 17, 131, 40.0, 122.70000000000003, 130.65, 131.0, 0.049064944814203315, 0.0382361581657561, 0.04604630074848574], "isController": false}, {"data": ["test1/cskapi/api/child/paged-1,195", 39, 0, 0.0, 58.46153846153847, 17, 328, 28.0, 146.0, 259.0, 328.0, 0.06576894862433283, 0.29204239198714976, 0.062172209246439625], "isController": false}, {"data": ["test1/cskapi/api/child/168-1,235", 27, 0, 0.0, 44.99999999999999, 15, 254, 27.0, 105.39999999999999, 199.99999999999972, 254.0, 0.04750694129197766, 0.03730037187377934, 0.04374906800618646], "isController": false}, {"data": ["test1/cskapi/api/child/167/growth/monitoring-1,307", 20, 0, 0.0, 60.5, 17, 311, 34.0, 150.30000000000004, 303.0499999999999, 311.0, 0.0486531589279763, 0.03791525471145028, 0.04565984934549338], "isController": false}, {"data": ["test1/cskapi/api/global/dept/list-1,275", 23, 0, 0.0, 30.086956521739133, 14, 94, 26.0, 47.80000000000002, 85.79999999999988, 94.0, 0.04190221480532778, 0.030444577944495958, 0.03866952440530737], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,243", 26, 0, 0.0, 68.96153846153848, 20, 339, 58.5, 123.70000000000003, 273.1999999999997, 339.0, 0.04478943796146041, 0.27232328198052, 0.02882445275058829], "isController": false}, {"data": ["test1/cskapi/api/child/167/avatar-1,281", 22, 0, 0.0, 110.0909090909091, 17, 835, 57.5, 300.89999999999986, 765.9999999999991, 835.0, 0.04277900173254957, 0.2600996726434118, 0.0275306270915529], "isController": false}, {"data": ["test1/cskapi/api/global/role/list-1,199", 35, 0, 0.0, 23.914285714285715, 12, 54, 23.0, 36.8, 41.19999999999993, 54.0, 0.05939955535189994, 0.04037313527824449, 0.054816972468306094], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,246", 25, 0, 0.0, 63.24, 17, 165, 51.0, 144.60000000000002, 159.6, 165.0, 0.04542836219851468, 0.034337453458642926, 0.04263345319606699], "isController": false}, {"data": ["test1/cskapi/api/child/mine-1,300", 21, 0, 0.0, 60.57142857142858, 17, 300, 29.0, 129.0, 282.89999999999975, 300.0, 0.045797231666386794, 0.05818574062301682, 0.04221932294245032], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,261", 24, 0, 0.0, 46.95833333333333, 21, 298, 29.0, 81.0, 244.0, 298.0, 0.04253705154427221, 0.13533761126097543, 0.0412493087729124], "isController": false}, {"data": ["test1/cskapi/api/question/ages-1,196", 37, 0, 0.0, 34.70270270270271, 12, 257, 25.0, 52.40000000000002, 135.5000000000002, 257.0, 0.0622776100209724, 0.03020352312434987, 0.0581419874805172], "isController": false}, {"data": ["test1/cskapi/api/onboarding-1,192", 40, 0, 0.0, 32.29999999999999, 14, 179, 25.0, 42.39999999999999, 110.14999999999984, 179.0, 0.06762811300657683, 0.05593848800446345, 0.061552149728642196], "isController": false}, {"data": ["test1/cskapi/api/question/directions-1,197", 38, 0, 0.0, 24.999999999999996, 13, 98, 22.0, 44.300000000000004, 63.7999999999999, 98.0, 0.0640210258527011, 0.03292693231882471, 0.06014475280302584], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,207", 32, 0, 0.0, 39.78125000000001, 16, 126, 29.5, 92.1, 114.29999999999995, 126.0, 0.054197879846687745, 0.045094329716189416, 0.049910742866627486], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,241", 27, 0, 0.0, 49.99999999999999, 16, 136, 31.0, 112.79999999999998, 134.39999999999998, 136.0, 0.046531907963332855, 0.0351715788707223, 0.043669105031995], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,282", 22, 0, 0.0, 58.5, 19, 130, 44.5, 123.3, 129.39999999999998, 130.0, 0.043139031215010816, 0.032607041172283566, 0.04048496972424355], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,203", 34, 0, 0.0, 42.735294117647086, 17, 146, 31.0, 113.5, 140.0, 146.0, 0.05724965902776608, 0.047633505362946, 0.05177068775362441], "isController": false}, {"data": ["test1/cskapi/api/auth/menu-1,191", 40, 0, 0.0, 37.974999999999994, 14, 332, 27.5, 57.999999999999986, 118.39999999999978, 332.0, 0.06848716978483044, 0.22973967598719974, 0.06226714362273157], "isController": false}, {"data": ["test1/cskapi/api/question/observation/paged-1,269", 23, 0, 0.0, 50.00000000000001, 20, 134, 37.0, 120.00000000000003, 133.2, 134.0, 0.04309343405955138, 0.13710782047462733, 0.041788847676889174], "isController": false}, {"data": ["test1/cskapi/api/child/168/growth/monitoring-1,289", 21, 0, 0.0, 53.0952380952381, 17, 149, 31.0, 131.0, 147.29999999999998, 149.0, 0.04648321291967701, 0.03513477226545899, 0.043623405874814065], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,242", 26, 0, 0.0, 40.38461538461539, 17, 124, 27.0, 103.80000000000001, 118.39999999999998, 124.0, 0.045623800181793295, 0.0379604274950077, 0.04201488630022566], "isController": false}, {"data": ["test1/cskapi/api/child/167-1,286", 22, 0, 0.0, 36.68181818181818, 19, 141, 26.5, 67.8, 130.19999999999985, 141.0, 0.04183519595035303, 0.03480819038056717, 0.03852596658318643], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2002, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
