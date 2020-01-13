const fs = require('fs');
const argv = process.argv;
const path = require('path');
if (argv.length <= 2) {
    console.log('Please specify the file address to be processed');
    return
}
var fileArr = [];
var jsToPathArr = [];
var jsFromPath = '';
for(var i = 2; i < argv.length; i++){
    var stat = fs.lstatSync(argv[i]);
    if(stat.isFile()){
        var fullPath = path.resolve(argv[i]);
        var ext = path.extname(fullPath);
        if(ext == '.nmon'){
            fileArr.push(fullPath);
            var pathArr = fullPath.split(path.sep);
            var jsToPath = '';
            for(var j = 0; j < pathArr.length - 1; j++){
                jsToPath += pathArr[j] + path.sep;
            }
            jsToPath += 'eChartsJs';
            jsToPathArr.push(jsToPath);
        }
    }
    if(stat.isDirectory()){
        var fullPath = path.resolve(argv[i]);
        fullPath = fullPath.replace(/\//g,path.sep);
        fullPath = fullPath.replace(/\\/g,path.sep);
        var jsToPath = '';
        var nmonFlag = false;
        let files = fs.readdirSync(fullPath);
        for(var j = 0; j < files.length; j++){
            var ext = path.extname(files[j]);
            if(ext == '.nmon'){
                fileArr.push(fullPath + path.sep + files[j]);
                nmonFlag = true;
            }
        }
        if(nmonFlag){
            if(fullPath.toString().substring(fullPath.toString().length - 1) == path.sep){
                jsToPath = fullPath + 'eChartsJs';
            }else{
                jsToPath = fullPath + path.sep + 'eChartsJs';
            }
            jsToPathArr.push(jsToPath);
        }
    }
}

var pathArr = argv[1].split(path.sep);
for(var i = 0; i < pathArr.length - 1; i++){
    jsFromPath += path.sep + pathArr[i];
}
jsFromPath = jsFromPath.substring(1);

let jsFiles = fs.readdirSync(jsFromPath);
for(var i = 0; i < jsToPathArr.length; i++){
    fs.mkdir(jsToPathArr[i], (err) => {
        if(err){
            return;
        }
    })
    for(var j = 0; j < jsFiles.length; j++){
        var ext = path.extname(jsFiles[j]);
        if((ext == '.js' || ext == '.css') && jsFiles[j] != 'nmonToHtml.js'){
            fs.copyFile(jsFromPath + path.sep + jsFiles[j], jsToPathArr[i] + path.sep + jsFiles[j], (err) => {
                if(err){
                    console.log('File copy failed !');
                }
            })
        }
    }
}

if(fileArr.length < 1){
    console.log('The entry did not find the .nmon file ');
    return;
}
for(var q = 0; q < fileArr.length; q++){
    const fileParam = fileArr[q];
    var ext = path.extname(fileParam);
    if(ext == '.nmon'){
        fs.readFile(fileParam, (err, data) => {
            if(err){
                console.log(fileParam + ': Fail to read file ');
                return;
            }else{
                var fileName= path.basename(fileParam).split(ext)[0]
                var toolStr = '';
                var toolStr1 = fileName.split('_');
                for(var i = 0; i < toolStr1.length - 2; i++){
                    toolStr += '_' + toolStr1[i];
                }
                toolStr = toolStr.substring(1);
                var topArr = [];
                var lineArr = data.toString().split(/[\n]/);
                var topNameArr = [];
                for(var i = 0; i < lineArr.length; i++){
                    if(lineArr[i].toString().substring(0,4) == 'TOP,'){
                        topArr.push(lineArr[i]);
                    }
                }
                var topNameDataArr = [];
                for(var i = 2; i < topArr.length; i++){
                    var topName = topArr[i].split(',')[13];
                    var topNameFlag = true;
                    for(var j = 0; j < topNameArr.length; j++){
                        if(topNameArr[j] == topName){
                            global[topName + 'Cpu'] += topArr[i].split(',')[3] * 1;
                            global[topName + 'Io'] += topArr[i].split(',')[10] * 1;
                            global[topName + 'Mk'] = global[topName + 'Mk'] < (topArr[i].split(',')[8] * 1 + topArr[i].split(',')[9] * 1) ? (topArr[i].split(',')[8] * 1 + topArr[i].split(',')[9] * 1) : global[topName + 'Mk'];
                            topNameFlag = false;
                            break;
                        }
                    }
                    if(topNameFlag){
                        global[topName + 'Cpu'] = topArr[i].split(',')[3] * 1;
                        global[topName + 'Io'] = topArr[i].split(',')[10] * 1;
                        global[topName + 'Mk'] = topArr[i].split(',')[8] * 1 + topArr[i].split(',')[9] * 1;
                        global[topName + 'Type'] = topName;
                        topNameArr.push(topName);
                    }
                }
                for(var j = 0; j < topNameArr.length; j++){
                    global[topNameArr[j]] = [];
                    global[topNameArr[j]].push(((global[topNameArr[j] + 'Cpu']).toFixed(1)) * 1);
                    global[topNameArr[j]].push((((global[topNameArr[j] + 'Io']) / 1024).toFixed(0)) * 1);
                    global[topNameArr[j]].push(global[topNameArr[j] + 'Mk']);
                    global[topNameArr[j]].push(global[topNameArr[j] + 'Type']);
                    topNameDataArr.push(global[topNameArr[j]]);
                }
                for(var i = 0; i < topNameDataArr.length - 1; i++){
                    for(var j = 0; j < topNameDataArr.length - 1 - i; j++){
                        if(topNameDataArr[j][0] * 1 < topNameDataArr[j+1][0] * 1){
                            var temp = topNameDataArr[j];
                            topNameDataArr[j] = topNameDataArr[j+1]
                            topNameDataArr[j+1] = temp;
                        }
                    }
                }
                var topTwenty = [];
                if(topNameDataArr.length > 20){
                    for(var i = 0; i < 20; i++){
                        topTwenty.push(topNameDataArr[i]);
                    }
                }else{
                    topTwenty = topNameDataArr;
                }
                var data1 = ['CPU seconds','CharIO','Type','Memory KB'];
                var data2 = [];
                var data3 = [];
                for(var i = 0; i < topTwenty.length; i++){
                    data2.push(topTwenty[i][3]);
                    data3.push(topTwenty[i][2]);
                }
                var big = 0;
                for(var i = 0; i < data3.length; i++){
                    if(data3[i] * 1 > big){
                        big = data3[i] * 1;
                    }
                }
                if(big > 350000){
                    big = (big / 350000).toFixed(2);
                    for(var i = 0; i < data3.length; i++){
                        data3[i] = parseInt(data3[i] * 1 / big);
                    }
                }
                var datats = [];
                datats.push(data1);
                datats.push(data2);
                datats.push(topTwenty);
                datats.push(data3);
        
                var config = data.toString().replace(/\"/g,'').split('ZZZZ,T0001')[0].split(/[\n]/);
                var configA = [];
                var configB = [];
                for(var i = 0; i < config.length; i++){
                    if(config[i].substring(0,4) == 'AAA,' && config[i].substring(0,8) != 'AAA,note'){
                        configA.push(config[i]);
                    }
                    if(config[i].substring(0,5) == 'BBBP,'){
                        configB.push(config[i]);
                    }
                }
                var titleStr = data.toString().split('the end')[1].split('BBBP,000')[0];
                var titleStr1 = data.toString().split('CPUUTIL_ALL,CPU')[1].split('CPUUTIL_ALL,T0001')[0];
                var titleStrArr = titleStr.split(/[\n]/);
                var rtArr = [];
                var irqArr = [];
                var procArr = [];
                var memArr = [];
                var netArr = [];
                var netpArr = [];
                var dbArr = [];
                var drArr = [];
                var dwArr = [];
                var dxArr = [];
                var dbsArr = [];
                var jfsArr = [];
                var cpuMap = {};
                var icMap = {};
                for(var i = 0; i < titleStrArr.length; i++){
                    if(i > 0 && titleStrArr[i].substring(0,3) == 'CPU' && titleStrArr[i].substring(6,10) == ',CPU'){
                        var cpuStr = titleStrArr[i].substring(0,6);
                        cpuMap[cpuStr + ',T'] = {};
                        icMap['IRQ_' + cpuStr + ',T'] = [];
                    }
                    if(titleStrArr[i].substring(0,5) == 'RT,RT'){
                        rtArr = titleStrArr[i].split('Total,')[1].split(',');
                    }
                    if(titleStrArr[i].substring(0,5) == 'IRQ,M'){
                        irqArr = recArr(titleStrArr[i].split('Message,')[1].split(','),6);
                    }
                    if(titleStrArr[i].substring(0,6) == 'PROC,P'){
                        procArr = titleStrArr[i].split(toolStr + ',')[1].split(',');
                    }
                    if(titleStrArr[i].substring(0,5) == 'MEM,M'){
                        memArr = titleStrArr[i].split(toolStr + ',')[1].split(',');
                    }
                    if(titleStrArr[i].substring(0,5) == 'NET,N'){
                        netArr = titleStrArr[i].split(toolStr + ',')[1].split(',');
                    }
                    if(titleStrArr[i].substring(0,11) == 'NETPACKET,N'){
                        netpArr = recArr(titleStrArr[i].split(toolStr + ',')[1].split(','),6);
                    }
                    if(titleStrArr[i].substring(0,10) == 'DISKBUSY,D'){
                        dbArr = recArr(titleStrArr[i].split(toolStr + ',')[1].split(','),6);
                    }
                    if(titleStrArr[i].substring(0,10) == 'DISKREAD,D'){
                        drArr = recArr(titleStrArr[i].split(toolStr + ',')[1].split(','),6);
                    }
                    if(titleStrArr[i].substring(0,11) == 'DISKWRITE,D'){
                        dwArr = recArr(titleStrArr[i].split(toolStr + ',')[1].split(','),6);
                    }
                    if(titleStrArr[i].substring(0,10) == 'DISKXFER,D'){
                        dxArr = recArr(titleStrArr[i].split(toolStr + ',')[1].split(','),6);
                    }
                    if(titleStrArr[i].substring(0,11) == 'DISKBSIZE,D'){
                        dbsArr = recArr(titleStrArr[i].split(toolStr + ',')[1].split(','),6);
                    }
                    if(titleStrArr[i].substring(0,9) == 'JFSFILE,J'){
                        jfsArr = recArr(titleStrArr[i].split(toolStr + ',')[1].split(','),6);
                    }
                }
                var rbArr = [];
                var psArr = [];
                var feArr = [];
                rbArr.push(procArr[0]);
                rbArr.push(procArr[1]);
                psArr.push(procArr[2]);
                feArr.push(procArr[6]);
                feArr.push(procArr[7]);
                var mmArr = [];
                var swArr = [];
                mmArr.push(memArr[0]);
                mmArr.push(memArr[4]);
                mmArr.push(memArr[9]);
                mmArr.push(memArr[10]);
                mmArr.push(memArr[12]);
                mmArr.push(memArr[14]);
                swArr.push(memArr[3]);
                swArr.push(memArr[7]);
                var naData = createDynArr(netArr);
                var npaData = createDynArr(netpArr);
                var dbaData = createDynArr(dbArr);
                var draData = createDynArr(drArr);
                var dwaData = createDynArr(dwArr);
                var dxaData = createDynArr(dxArr);
                var dbsaData = createDynArr(dbsArr);
                var jfsaData = createDynArr(jfsArr);
                var cuaArr = recArr(titleStr1.split(/[\n]/)[0].split(toolStr + ',')[1].split(','),6);
                var cuArr = [];
                cuArr.push(cuaArr[0]);
                cuArr.push(cuaArr[2]);
                cuArr.push(cuaArr[3]);
                cuArr.push(cuaArr[4]);
                var cuseArr = ['User%','System%'];
        
        
                var map = {};
                var map1 = {};
                var dataArr = data.toString().split('ZZZZ');
                var xData = [];
                var rt1 = [];
                var rt2 = [];
                var rt3 = [];
                var rt4 = [];
                var rt5 = [];
                var rt6 = [];
                var ica = [];
                var cu = [];
                var cs = [];
                var cuaUser = [];
                var cuaNice = [];
                var cuaSys = [];
                var cuaIdle = [];
                var cuaWait = [];
                var cuaIrq = [];
                var cuaSirq = [];
                var cuaSteal = [];
                var cuaGuest = [];
                var cuaGn = [];
                var cuUser = [];
                var cuSys = [];
                var cuWait = [];
                var cuIdle = [];
                var mt = [];
                var mf = [];
                var cc = [];
                var ac = [];
                var buf = [];
                var iac = [];
                var st = [];
                var sf = [];
                var ra = [];
                var bl = [];
                var ps = [];
                var fo = [];
                var ex = [];
                for(var i = 1; i < dataArr.length; i++){
                    var childArr = [];
                    childArr = dataArr[i].split(/[\n]/);
                    for(var j = 0; j < childArr.length; j++){
                        var key = childArr[j].toString().substring(0,8);
                        var key1 = childArr[j].toString().substring(0,12);
                        if(cpuMap[key]){
                            var childStr = childArr[j].toString().split(',');
                            if(i == 1){
                                cpuMap[key].user = parseFloat(childStr[2]);
                                cpuMap[key].sys = parseFloat(childStr[3]);
                            }else{
                                cpuMap[key].user += parseFloat(childStr[2]);
                                cpuMap[key].sys += parseFloat(childStr[3]);
                            }
                        }
                        if(icMap[key1]){
                            var childStr = childArr[j].toString().split(',');
                            icMap[key1].push(childStr[2]);
                        }
                        if(childArr[j].toString().substring(0,2) == ',T'){
                            xData.push(strToDate(childArr[j].toString().split(',')[2] + ',' + childArr[j].toString().split(',')[3]));
                        }
                        if(childArr[j].toString().substring(0,4) == 'RT,T'){
                            rt1.push(parseFloat(childArr[j].toString().split(',')[2]));
                            rt2.push(parseFloat(childArr[j].toString().split(',')[3]));
                            rt3.push(parseFloat(childArr[j].toString().split(',')[4]));
                            rt4.push(parseFloat(childArr[j].toString().split(',')[5]));
                            rt5.push(parseFloat(childArr[j].toString().split(',')[6]));
                            rt6.push(parseFloat(childArr[j].toString().split(',')[7]));
                        }
                        if(childArr[j].toString().substring(0,13) == 'IRQ_CPU_ALL,T'){
                            ica.push(childArr[j].toString().split(',')[2]);
                        }
                        if(childArr[j].toString().substring(0,13) == 'CPUUTIL_ALL,T'){
                            cuaUser.push(childArr[j].toString().split(',')[2]);
                            cuaNice.push(childArr[j].toString().split(',')[3]);
                            cuaSys.push(childArr[j].toString().split(',')[4]);
                            cuaIdle.push(childArr[j].toString().split(',')[5]);
                            cuaWait.push(childArr[j].toString().split(',')[6]);
                            cuaIrq.push(childArr[j].toString().split(',')[7]);
                            cuaSirq.push(childArr[j].toString().split(',')[8]);
                            cuaSteal.push(childArr[j].toString().split(',')[9]);
                            cuaGuest.push(childArr[j].toString().split(',')[10]);
                            cuaGn.push(childArr[j].toString().split(',')[11]);
                        }
                        if(childArr[j].toString().substring(0,9) == 'CPU_ALL,T'){
                            cuUser.push(parseFloat(childArr[j].toString().split(',')[2]));
                            cuSys.push(parseFloat(childArr[j].toString().split(',')[3]));
                            cuWait.push(parseFloat(childArr[j].toString().split(',')[4]));
                            cuIdle.push(parseFloat(childArr[j].toString().split(',')[5]));
                        }
                        if(childArr[j].toString().substring(0,5) == 'MEM,T'){
                            mt.push(childArr[j].toString().split(',')[2]);
                            mf.push(childArr[j].toString().split(',')[6]);
                            cc.push(childArr[j].toString().split(',')[11]);
                            ac.push(childArr[j].toString().split(',')[12]);
                            buf.push(childArr[j].toString().split(',')[14]);
                            iac.push(childArr[j].toString().split(',')[16]);
                            st.push(childArr[j].toString().split(',')[5]);
                            sf.push(childArr[j].toString().split(',')[9]);
                        }
                        if(childArr[j].toString().substring(0,6) == 'PROC,T'){
                            ra.push(childArr[j].toString().split(',')[2]);
                            bl.push(childArr[j].toString().split(',')[3]);
                            ps.push(childArr[j].toString().split(',')[4]);
                            fo.push(childArr[j].toString().split(',')[8]);
                            ex.push('0.0'); // In 'nmonchart', the '- 1.0' indicates that the value is not retrieved, and all data of '- 1.0' will be converted to '0.0'. Therefore, the 'exec' is directly assigned to '0.0' 
                        }
                        if(childArr[j].toString().substring(0,5) == 'NET,T'){
                            for(var k = 0; k < netArr.length; k++){
                                if(k < netArr.length / 2){
                                    naData[k].push(childArr[j].toString().split(',')[k+2]);
                                }else{
                                    naData[k].push((childArr[j].toString().split(',')[k+2]) * -1);
                                }
                            }
                        }
                        if(childArr[j].toString().substring(0,11) == 'NETPACKET,T'){
                            for(var k = 0; k < netpArr.length; k++){
                                npaData[k].push(childArr[j].toString().split(',')[k+2]);
                            }
                        }
                        if(childArr[j].toString().substring(0,9) == 'JFSFILE,T'){
                            for(var k = 0; k < jfsArr.length; k++){
                                jfsaData[k].push(childArr[j].toString().split(',')[k+2]);
                            }
                        }
                        if(childArr[j].toString().substring(0,10) == 'DISKBUSY,T'){
                            for(var k = 0; k < dbArr.length; k++){
                                dbaData[k].push(childArr[j].toString().split(',')[k+2]);
                            }
                        }
                        if(childArr[j].toString().substring(0,10) == 'DISKREAD,T'){
                            for(var k = 0; k < drArr.length; k++){
                                draData[k].push(childArr[j].toString().split(',')[k+2]);
                            }
                        }
                        if(childArr[j].toString().substring(0,11) == 'DISKWRITE,T'){
                            for(var k = 0; k < dwArr.length; k++){
                                dwaData[k].push(childArr[j].toString().split(',')[k+2]);
                            }
                        }
                        if(childArr[j].toString().substring(0,10) == 'DISKXFER,T'){
                            for(var k = 0; k < dxArr.length; k++){
                                dxaData[k].push(childArr[j].toString().split(',')[k+2]);
                            }
                        }
                        if(childArr[j].toString().substring(0,11) == 'DISKBSIZE,T'){
                            for(var k = 0; k < dbsArr.length; k++){
                                dbsaData[k].push(childArr[j].toString().split(',')[k+2]);
                            }
                        }
                    }
                }
        
                var datatc = [];
                var datatcn = data2;
                var datatcv = [];
                var datatcx = [];
                var eachNum = parseInt(topArr[topArr.length - 1].toString().split(',')[2].substring(1));
                for(var i in cpuMap){
                    cu.push((cpuMap[i].user / eachNum).toFixed(1));
                    cs.push((cpuMap[i].sys / eachNum).toFixed(1));
                }
                for(var i = 1; i < xData.length; i++){
                    datatcx.push(xData[i]);
                }
                for(var i = 0; i < datatcn.length; i++){
                    var tcArr = [];
                    var number = 2;
                    for(var j = 2; j <= eachNum; j++){
                        var dataSum = 0;
                        for(var k = number; k < topArr.length; k++){
                            var sonArr = topArr[k].toString().split(',');
                            if(parseInt(sonArr[2].substring(1)) == j){
                                if(sonArr[13] == datatcn[i]){
                                    dataSum += sonArr[3] * 1;
                                }
                            }else{
                                number = k;
                                break;
                            }
                        }
                        tcArr.push(dataSum.toFixed(2));
                    }
                    datatcv.push(tcArr);
                }
                datatc.push(datatcn);
                datatc.push(datatcx);
                datatc.push(datatcv);
        
                var topdbArr = [];
                for(var i = 0; i < lineArr.length; i++){
                    if(lineArr[i].toString().substring(0,9) == 'DISKBUSY,'){
                        topdbArr.push(lineArr[i]);
                    }
                }
                var tdbArr = [];
                var tdbData = [];
                var newtdbArr = topdbArr[0].split(',');
                if(newtdbArr.length > 22){
                    var sumDb = [];
                    for(var i = 2; i < newtdbArr.length - 6; i++){
                        global[newtdbArr[i]] = 0;
                    }
                    for(var i = 1; i < topdbArr.length; i++){
                        for(var j = 2; j < topdbArr[i].length - 6; j++){
                            global[newtdbArr[j]] += topdbArr[i][j] * 1;
                        }
                    }
                    for(var i = 2; i < newtdbArr.length - 6; i++){
                        var tdbArray = [];
                        tdbArray.push(newtdbArr[i]);
                        tdbArray.push(global[newtdbArr[i]]);
                        sumDb.push(tdbArray);
                    }
                    for(var i = 0; i < sumDb.length - 1; i++){
                        for(var j = 0; j < sumDb.length - 1 - i; j++){
                            if(sumDb[j][1] * 1 < sumDb[j+1][1] * 1){
                                var temp = sumDb[j];
                                sumDb[j] = sumDb[j+1]
                                sumDb[j+1] = temp;
                            }
                        }
                    }
                    for(var i = 0; i < 14; i++){
                        var tdbVal = [];
                        var val = 0;
                        for(var j = 2; j < newtdbArr.length; j ++){
                            if(sumDb[i][0] == newtdbArr[j]){
                                val = j;
                            }
                        }
                        for(var j = 1; j < topdbArr.length; j ++){
                            tdbVal.push(topdbArr[j].split(',')[val]);
                        }
                        tdbArr.push(sumDb[i][0]);
                        tdbData.push(tdbVal);
                    }
                }else{
                    for(var i = 2; i < newtdbArr.length - 6; i ++){
                        var tdbVal = [];
                        for(var j = 1; j < topdbArr.length; j ++){
                            tdbVal.push(topdbArr[j].split(',')[i]);
                        }
                        tdbArr.push(newtdbArr[i]);
                        tdbData.push(tdbVal);
                    }
                }
        
                map.xData = xData;
                map.datats = datats;
                map.datatc = datatc;
                map.rt1 = rt1;
                map.rt2 = rt2;
                map.rt3 = rt3;
                map.rt4 = rt4;
                map.rt5 = rt5;
                map.rt6 = rt6;
                map.ica = ica;
                map.cu = cu;
                map.cs = cs;
                map.cuaUser = cuaUser;
                map.cuaNice = cuaNice;
                map.cuaSys = cuaSys;
                map.cuaIdle = cuaIdle;
                map.cuaWait = cuaWait;
                map.cuaIrq = cuaIrq;
                map.cuaSirq = cuaSirq;
                map.cuaSteal = cuaSteal;
                map.cuaGuest = cuaGuest;
                map.cuaGn = cuaGn;
                map.cuUser = cuUser;
                map.cuSys = cuSys;
                map.cuWait = cuWait;
                map.cuIdle = cuIdle;
                map.memtotal = mt;
                map.memfree = mf;
                map.cached = cc;
                map.active = ac;
                map.buffers = buf;
                map.inactive = iac;
                map.swaptotal = st;
                map.swapfree = sf;
                map.Runnable = ra;
                map.Blocked = bl;
                map.pswitch = ps;
                map.fork = fo;
                map.exec = ex;
                map = mapPut(map, arrChange(tdbArr, 'tdb'), tdbData);
                map = mapPut(map, netArr, naData);
                map = mapPut(map, arrChange(netpArr, 'np'), npaData);
                map = mapPut(map, jfsArr, jfsaData);
                map = mapPut(map, arrChange(dbArr, 'db'), dbaData);
                map = mapPut(map, arrChange(drArr, 'dr'), draData);
                map = mapPut(map, arrChange(dwArr, 'dw'), dwaData);
                map = mapPut(map, arrChange(dxArr, 'dx'), dxaData);
                map = mapPut(map, arrChange(dbsArr, 'dbs'), dbsaData);
                map1.irqArr =irqArr;
                map1.rtArr = rtArr;
                map1.cuArr = cuArr;
                map1.cuaArr = cuaArr;
                map1.rbArr = rbArr;
                map1.psArr = psArr;
                map1.feArr = feArr;
                map1.mmArr = mmArr;
                map1.swArr = swArr;
                map1.netArr = netArr;
                map1.netpArr = netpArr;
                map1.dbArr = dbArr;
                map1.tdbArr = tdbArr;
                map1.dwArr = dwArr;
                map1.drArr = drArr;
                map1.dxArr = dxArr;
                map1.dbsArr = dbsArr;
                map1.jfsArr = jfsArr;
                map1.irqArr = irqArr;
                map1.cuseArr = cuseArr;
                fs.writeFile(fileParam.split('.')[0] + '.html', createHtml(map,map1,configA,configB,fileName,icMap), (err) => {
                    if(err){
                        console.log(fileParam.split('.')[0] + '.html: Fail to write to file');
                    }else{
                        console.log(fileParam.split('.')[0] + '.html: Success');
                    }
                })
            }
        })
    }
}

createHtml = function(map,map1,configA,configB,fileName,icMap){
    var conStrA = '';
    var conStrB = '';
    var htmlStr = '';
    var xArr = [];
    var cpuArr = [];
    var datacu = [];
    var dataCpuUtil = [];
    var datacua = [];
    var dataCpuUtilAll = [];
    var datarb = [];
    var dataRunQblock = [];
    var dataps = [];
    var dataPswtch = [];
    var datafe = [];
    var dataForkExec = [];
    var datamt = [];
    var dataMemory = [];
    var datasw = [];
    var dataSwap = [];
    var datan = [];
    var dataNet = [];
    var datanp = [];
    var dataNetPacket = [];
    var datatdb = [];
    var dataTopDiskBusy = [];
    var datadb = [];
    var dataDiskBusy = [];
    var datadr = [];
    var dataDiskRead = [];
    var datadw = [];
    var dataDiskWrite = [];
    var datadbs = [];
    var dataDiskBSize = [];
    var datadx = [];
    var dataDiskXfers = [];
    var dataj = [];
    var dataJFS = [];
    var dataica =[]
    var dataIrqChangea = [];
    var datacpu = [];
    var dataCpuUse = [];
    var rtArr = map1.rtArr;
    var cuArr = map1.cuArr;
    var cuaArr = map1.cuaArr;
    var rbArr = map1.rbArr;
    var psArr = map1.psArr;
    var feArr = map1.feArr;
    var mmArr = map1.mmArr;
    var swArr = map1.swArr;
    var netArr = map1.netArr;
    var netpArr = map1.netpArr;
    var tdbArr = map1.tdbArr;
    var dbArr = map1.dbArr;
    var drArr = map1.drArr;
    var dwArr = map1.dwArr;
    var dbsArr = map1.dbsArr;
    var dxArr = map1.dxArr;
    var jfsArr = map1.jfsArr;
    var irqArr = map1.irqArr;
    var cuseArr = map1.cuseArr;
    for(var i = 0; i < configA.length; i++){
        var ca = configA[i].split(',');
        conStrA += '            <b>' + ca[1] + '</b> = ' + ca[2] + '<br/>\\' + '\n';
    }
    for(var i = 0; i < configB.length; i++){
        var cb = configB[i].split(',');
        if(cb.length == 3){
            cb.push('');
        }
        conStrB += '            ' + cb[1] + ' <b>' + cb[2] + '</b> ' + cb[3] + '<br/>\\' + '\n';
    }
    conStrA += conStrB; 
    for(var i = 0; i < map.xData.length; i++){
        xArr.push(map.xData[i].toString());
    }
    for(var i = 1; i < map.cu.length + 1; i++){
        cpuArr.push('CPU00' + i);
    }
    dataNet = mapGet(map,netArr);
    dataNetPacket = mapGet(map,netpArr);
    dataTopDiskBusy = mapGet(map,tdbArr);
    dataDiskBusy = mapGet(map,dbArr);
    dataDiskRead = mapGet(map,drArr);
    dataDiskWrite = mapGet(map,dwArr);
    dataDiskBSize = mapGet(map,dbsArr);
    dataDiskXfers = mapGet(map,dxArr);
    dataJFS = mapGet(map,jfsArr);
    for(var i = 0; i < rtArr.length; i++){
        cuArr.push(rtArr[i].toString());
        cuaArr.push(rtArr[i].toString());
        rbArr.push(rtArr[i].toString());
        psArr.push(rtArr[i].toString());
        feArr.push(rtArr[i].toString());
        mmArr.push(rtArr[i].toString());
        swArr.push(rtArr[i].toString());
        netArr.push(rtArr[i].toString());
        netpArr.push(rtArr[i].toString());
        tdbArr.push(rtArr[i].toString());
        dbArr.push(rtArr[i].toString());
        drArr.push(rtArr[i].toString());
        dwArr.push(rtArr[i].toString());
        dbsArr.push(rtArr[i].toString());
        dxArr.push(rtArr[i].toString());
        jfsArr.push(rtArr[i].toString());
        irqArr.push(rtArr[i].toString());
    }
    dataCpuUse.push(map.cu);
    dataCpuUse.push(map.cs);
    datacpu.push(cuseArr);
    datacpu.push(cpuArr);
    datacpu.push(dataCpuUse);
    dataCpuUtil.push(map.cuUser);
    dataCpuUtil.push(map.cuSys);
    dataCpuUtil.push(map.cuWait);
    dataCpuUtil.push(map.cuIdle);
    dataCpuUtil.push(map.rt1);
    dataCpuUtil.push(map.rt2);
    dataCpuUtil.push(map.rt3);
    dataCpuUtil.push(map.rt4);
    dataCpuUtil.push(map.rt5);
    dataCpuUtil.push(map.rt6);
    datacu.push(cuArr);
    datacu.push(xArr);
    datacu.push(dataCpuUtil);
    dataCpuUtilAll.push(map.cuaUser);
    dataCpuUtilAll.push(map.cuaNice);
    dataCpuUtilAll.push(map.cuaSys);
    dataCpuUtilAll.push(map.cuaIdle);
    dataCpuUtilAll.push(map.cuaWait);
    dataCpuUtilAll.push(map.cuaIrq);
    dataCpuUtilAll.push(map.cuaSirq);
    dataCpuUtilAll.push(map.cuaSteal);
    dataCpuUtilAll.push(map.cuaGuest);
    dataCpuUtilAll.push(map.cuaGn);
    dataCpuUtilAll.push(map.rt1);
    dataCpuUtilAll.push(map.rt2);
    dataCpuUtilAll.push(map.rt3);
    dataCpuUtilAll.push(map.rt4);
    dataCpuUtilAll.push(map.rt5);
    dataCpuUtilAll.push(map.rt6);
    datacua.push(cuaArr);
    datacua.push(xArr);
    datacua.push(dataCpuUtilAll);
    dataRunQblock.push(map.Runnable);
    dataRunQblock.push(map.Blocked);
    dataRunQblock.push(map.rt1);
    dataRunQblock.push(map.rt2);
    dataRunQblock.push(map.rt3);
    dataRunQblock.push(map.rt4);
    dataRunQblock.push(map.rt5);
    dataRunQblock.push(map.rt6);
    datarb.push(rbArr);
    datarb.push(xArr);
    datarb.push(dataRunQblock);
    dataPswtch.push(map.pswitch);
    dataPswtch.push(map.rt1);
    dataPswtch.push(map.rt2);
    dataPswtch.push(map.rt3);
    dataPswtch.push(map.rt4);
    dataPswtch.push(map.rt5);
    dataPswtch.push(map.rt6);
    dataps.push(psArr);
    dataps.push(xArr);
    dataps.push(dataPswtch);
    dataForkExec.push(map.fork);
    dataForkExec.push(map.exec);
    dataForkExec.push(map.rt1);
    dataForkExec.push(map.rt2);
    dataForkExec.push(map.rt3);
    dataForkExec.push(map.rt4);
    dataForkExec.push(map.rt5);
    dataForkExec.push(map.rt6);
    datafe.push(feArr);
    datafe.push(xArr);
    datafe.push(dataForkExec);
    dataMemory.push(map.memtotal);
    dataMemory.push(map.memfree);
    dataMemory.push(map.cached);
    dataMemory.push(map.active);
    dataMemory.push(map.buffers);
    dataMemory.push(map.inactive);
    dataMemory.push(map.rt1);
    dataMemory.push(map.rt2);
    dataMemory.push(map.rt3);
    dataMemory.push(map.rt4);
    dataMemory.push(map.rt5);
    dataMemory.push(map.rt6);
    datamt.push(mmArr);
    datamt.push(xArr);
    datamt.push(dataMemory);
    dataSwap.push(map.swaptotal);
    dataSwap.push(map.swapfree);
    dataSwap.push(map.rt1);
    dataSwap.push(map.rt2);
    dataSwap.push(map.rt3);
    dataSwap.push(map.rt4);
    dataSwap.push(map.rt5);
    dataSwap.push(map.rt6);
    datasw.push(swArr);
    datasw.push(xArr);
    datasw.push(dataSwap);
    dataNet.push(map.rt1);
    dataNet.push(map.rt2);
    dataNet.push(map.rt3);
    dataNet.push(map.rt4);
    dataNet.push(map.rt5);
    dataNet.push(map.rt6);
    datan.push(netArr);
    datan.push(xArr);
    datan.push(dataNet);
    dataNetPacket.push(map.rt1);
    dataNetPacket.push(map.rt2);
    dataNetPacket.push(map.rt3);
    dataNetPacket.push(map.rt4);
    dataNetPacket.push(map.rt5);
    dataNetPacket.push(map.rt6);
    datanp.push(arrRestore(netpArr, 'np'));
    datanp.push(xArr);
    datanp.push(dataNetPacket);
    dataTopDiskBusy.push(map.rt1);
    dataTopDiskBusy.push(map.rt2);
    dataTopDiskBusy.push(map.rt3);
    dataTopDiskBusy.push(map.rt4);
    dataTopDiskBusy.push(map.rt5);
    dataTopDiskBusy.push(map.rt6);
    datatdb.push(arrRestore(tdbArr, 'tdb'));
    datatdb.push(xArr);
    datatdb.push(dataTopDiskBusy);
    dataDiskBusy.push(map.rt1);
    dataDiskBusy.push(map.rt2);
    dataDiskBusy.push(map.rt3);
    dataDiskBusy.push(map.rt4);
    dataDiskBusy.push(map.rt5);
    dataDiskBusy.push(map.rt6);
    datadb.push(arrRestore(dbArr, 'db'));
    datadb.push(xArr);
    datadb.push(dataDiskBusy);
    dataDiskRead.push(map.rt1);
    dataDiskRead.push(map.rt2);
    dataDiskRead.push(map.rt3);
    dataDiskRead.push(map.rt4);
    dataDiskRead.push(map.rt5);
    dataDiskRead.push(map.rt6);
    datadr.push(arrRestore(drArr, 'dr'));
    datadr.push(xArr);
    datadr.push(dataDiskRead);
    dataDiskWrite.push(map.rt1);
    dataDiskWrite.push(map.rt2);
    dataDiskWrite.push(map.rt3);
    dataDiskWrite.push(map.rt4);
    dataDiskWrite.push(map.rt5);
    dataDiskWrite.push(map.rt6);
    datadw.push(arrRestore(dwArr, 'dw'));
    datadw.push(xArr);
    datadw.push(dataDiskWrite);
    dataDiskBSize.push(map.rt1);
    dataDiskBSize.push(map.rt2);
    dataDiskBSize.push(map.rt3);
    dataDiskBSize.push(map.rt4);
    dataDiskBSize.push(map.rt5);
    dataDiskBSize.push(map.rt6);
    datadbs.push(arrRestore(dbsArr, 'dbs'));
    datadbs.push(xArr);
    datadbs.push(dataDiskBSize);
    dataDiskXfers.push(map.rt1);
    dataDiskXfers.push(map.rt2);
    dataDiskXfers.push(map.rt3);
    dataDiskXfers.push(map.rt4);
    dataDiskXfers.push(map.rt5);
    dataDiskXfers.push(map.rt6);
    datadx.push(arrRestore(dxArr, 'dx'));
    datadx.push(xArr);
    datadx.push(dataDiskXfers);
    dataJFS.push(map.rt1);
    dataJFS.push(map.rt2);
    dataJFS.push(map.rt3);
    dataJFS.push(map.rt4);
    dataJFS.push(map.rt5);
    dataJFS.push(map.rt6);
    dataj.push(jfsArr);
    dataj.push(xArr);
    dataj.push(dataJFS);
    dataIrqChangea.push(map.ica);
    dataIrqChangea.push(map.rt1);
    dataIrqChangea.push(map.rt2);
    dataIrqChangea.push(map.rt3);
    dataIrqChangea.push(map.rt4);
    dataIrqChangea.push(map.rt5);
    dataIrqChangea.push(map.rt6);
    dataica.push(irqArr);
    dataica.push(xArr);
    dataica.push(dataIrqChangea);
    var irqButStr = '';
    var irqDataStr = '';
    var irqNum = 1;
    for(var i in icMap){
        var dataic = [];
        var dataIrqChange = [];
        dataIrqChange.push(icMap[i]);
        dataIrqChange.push(map.rt1);
        dataIrqChange.push(map.rt2);
        dataIrqChange.push(map.rt3);
        dataIrqChange.push(map.rt4);
        dataIrqChange.push(map.rt5);
        dataIrqChange.push(map.rt6);
        dataic.push(irqArr);
        dataic.push(xArr);
        dataic.push(dataIrqChange);
        irqButStr += '    <button onclick="draw_IRQCPU' + irqNum + '()" name="magenta" class="buttonmagenta butmagenta" title="IRQ stats on CPU' + irqNum + '"><b>IRQ on CPU' + irqNum + '</b></button>' + '\n'
        irqDataStr += '        var dataIrqCpu' + irqNum + ' = ' + JSON.stringify(dataic) + ';' + '\n'
        irqDataStr += '        function draw_IRQCPU' + irqNum + '(){' + '\n'
        irqDataStr += '            var newData = dataIrqCpu' + irqNum + ';' + '\n'
        irqDataStr += '            data = newData[0];' + '\n'
        irqDataStr += '            xData = newData[1];' + '\n'
        irqDataStr += '            dataArr = newData[2];' + '\n'
        irqDataStr += '            str = "IRQ count per cycle on cpu1";' + '\n'
        irqDataStr += '            sta = "";' + '\n'
        irqDataStr += '            initChart();' + '\n'
        irqDataStr += '        }' + '\n'
        irqNum++;
    }
    htmlStr += '<!DOCTYPE html>' + '\n'
    + '<html style="height: 100%;">' + '\n'
    + '<head>' + '\n'
    + '    <meta charset="utf-8">' + '\n'
    + '    <title>ECharts</title>' + '\n'
    + '    <script src="./eChartsJs/jquery-3.4.1.min.js"></script>' + '\n'
    + '    <script src="./eChartsJs/echarts.min.js"></script>' + '\n'
    + '    <script src="./eChartsJs/dataToEchart.js"></script>' + '\n'
    + '    <link type="text/css" rel="stylesheet" href="./eChartsJs/button.css">' + '\n'
    + '</head>' + '\n'
    + '<body style="height: 100%;margin: 0">' + '\n'
    + '    nmon data file: <b>' + fileName + '.nmon</b>' + '\n'
    + '    <button onclick="config()" name="config" class="buttongray butgray" title="The Configuration of the Profiling Tool"><b>Configuration</b></button>' + '\n'
    + '    <button onclick="draw_TOPSUM()" name="gray" class="buttongray butgray" title="TOPSUM Buble chart of CPU, I/O and RAM use"><b>Top Summary</b></button>' + '\n'
    + '    <button onclick="draw_TOPCMD()" name="gray" class="buttongray butgray" title="Top Process Commands by CPU (Percentage of a CPU core)"><b>Top Commands</b></button>' + '\n'
    + '    <button onclick="draw_TOPDISK()" name="gray" class="buttongray butgray" title="Top 15 disks by sum(Busy%)"><b>Top Disk</b></button>' + '\n'
    + '    <br/>' + '\n'
    + '    <button onclick="draw_CPU_UTIL()" name="red" class="buttonred butred" title="CPU Utilization Percentages"><b>CPU Util.</b></button>' + '\n'
    + '    <button onclick="draw_CPU_USE()" name="red" class="buttonred butred" title="Use of Logical CPU Core Threads(x86=Hyperthreads)"><b>CPU Use</b></button>' + '\n'
    + '    <button onclick="draw_CPUUTIL_ALL()" name="red" class="buttonred butred" title="Linux CPU Utilization FULL details"><b>CPU All Util.</b></button>' + '\n'
    + '    <button onclick="draw_RUNQBLOCK()" name="red" class="buttonred butred" title="Run Queue - processes that running or ready to run or Blocked"><b>RunQ Blocked</b></button>' + '\n'
    + '    <button onclick="draw_PSWITCH()" name="red" class="buttonred butred" title="Process Switches per second - between processes"><b>pSwitch</b></button>' + '\n'
    + '    <button onclick="draw_FORKEXEC()" name="red" class="buttonred butred" title="Fork() and Exec() System Calls per second - creating processes"><b>ForkExec</b></button>' + '\n'
    + '    <button onclick="draw_MEM_LINUX()" name="blue" class="buttonblue butblue" title="Real Memory - RAM in MB"><b>Memory</b></button>' + '\n'
    + '    <button onclick="draw_SWAP_LINUX()" name="blue" class="buttonblue butblue" title="Virtual Memory - Paging Space in MB"><b>Swap</b></button>' + '\n'
    + '    <br/>' + '\n'
    + '    <button onclick="draw_NET()" name="purple" class="buttonpurple butpurple" title="Network Receive(read) & Send(write shown negatively) in KB per second"><b>Network</b></button>' + '\n'
    + '    <button onclick="draw_NETPACKET()" name="purple" class="buttonpurple butpurple" title="Network packet count per second"><b>Net Packet</b></button>' + '\n'
    + '    <button onclick="draw_DISKBUSY(\'s\')" name="brown" class="buttonbrown butbrown" title="Disk Busy Percentage of the time (Stacked)"><b>Disk Busy</b></button>' + '\n'
    + '    <button onclick="draw_DISKBUSY(\'u\')" name="brown" class="buttonbrown butbrown" title="Disk Busy Percentage of the time (UnStacked)"><b>Disk Busy(Unstacked)</b></button>' + '\n'
    + '    <button onclick="draw_DISKREAD(\'s\')" name="brown" class="buttonbrown butbrown" title="Disk Read KB per second (Stacked)"><b>Disk Read</b></button>' + '\n'
    + '    <button onclick="draw_DISKREAD(\'u\')" name="brown" class="buttonbrown butbrown" title="Disk Read KB per second (UnStacked)"><b>Disk Read(Unstacked)</b></button>' + '\n'
    + '    <button onclick="draw_DISKWRITE(\'s\')" name="brown" class="buttonbrown butbrown" title="Disk Write KB per second (Stacked)"><b>Disk Write</b></button>' + '\n'
    + '    <button onclick="draw_DISKWRITE(\'u\')" name="brown" class="buttonbrown butbrown" title="Disk Write KB per second (UnStacked)"><b>Disk Write(Unstacked)</b></button>' + '\n'
    + '    <button onclick="draw_DISKBSIZE()" name="brown" class="buttonbrown butbrown" title="Disk Block Size KB"><b>Disk BSize</b></button>' + '\n'
    + '    <button onclick="draw_DISKXFER()" name="brown" class="buttonbrown butbrown" title="Disk Transfers per second"><b>Disk Xfers</b></button>' + '\n'
    + '    <button onclick="draw_JFS()" name="brown" class="buttonbrown butbrown" title="Journal File System Percent Full (Note: -1.234 = stats not avaialble)"><b>JFS</b></button>' + '\n'
    + '    <br/>' + '\n'
    + irqButStr
    + '    <button onclick="draw_IRQCPU_ALL()" name="magenta" class="buttonmagenta butmagenta" title="IRQ stats on all CPUs"><b>IRQ on all CPUs</b></button>' + '\n'
    + '    <div id="main" style="width: 90%;height: 72%;left: 2%;top: 3%">' + '\n'
    + '        <h2 style="color:blue">Click on a Graph button above, to display that graph</h2>' + '\n'
    + '    </div>' + '\n'
    + '    <script type="text/javascript">' + '\n'
    + '        $(":button").on("click", function(){' + '\n'
    + '            if($(this).prop("name") != "config"){' + '\n'
    + '                $(":button").each(function(){' + '\n'
    + '                    if($(this).prop("name") == "gray"){' + '\n'
    + '                        $(this).prop("class", "buttongray butgray");' + '\n'
    + '                    }else if($(this).prop("name") == "red"){' + '\n'
    + '                        $(this).prop("class", "buttonred butred");' + '\n'
    + '                    }else if($(this).prop("name") == "blue"){' + '\n'
    + '                        $(this).prop("class", "buttonblue butblue");' + '\n'
    + '                    }else if($(this).prop("name") == "purple"){' + '\n'
    + '                        $(this).prop("class", "buttonpurple butpurple");' + '\n'
    + '                    }else if($(this).prop("name") == "brown"){' + '\n'
    + '                        $(this).prop("class", "buttonbrown butbrown");' + '\n'
    + '                    }else if($(this).prop("name") == "magenta"){' + '\n'
    + '                        $(this).prop("class", "buttonmagenta butmagenta");' + '\n'
    + '                    }' + '\n'
    + '                });' + '\n'
    + '                if($(this).prop("name") == "gray"){' + '\n'
    + '                    $(this).prop("class", "btngray");' + '\n'
    + '                }else if($(this).prop("name") == "red"){' + '\n'
    + '                    $(this).prop("class", "btnred");' + '\n'
    + '                }else if($(this).prop("name") == "blue"){' + '\n'
    + '                    $(this).prop("class", "btnblue");' + '\n'
    + '                }else if($(this).prop("name") == "purple"){' + '\n'
    + '                    $(this).prop("class", "btnpurple");' + '\n'
    + '                }else if($(this).prop("name") == "brown"){' + '\n'
    + '                    $(this).prop("class", "btnbrown");' + '\n'
    + '                }else if($(this).prop("name") == "magenta"){' + '\n'
    + '                    $(this).prop("class", "btnmagenta");' + '\n'
    + '                }' + '\n'
    + '            }' + '\n'
    + '        });' + '\n'
    + '        function config() {' + '\n'
    + '            var myWindow = window.open("", "MsgWindow", "width=1024, height=800");' + '\n'
    + '            myWindow.document.write("<h2>Configuration data for ' + fileName + ' <br>Use PageDown or Scroll bar (if available)</h2><br> \\' + '\n'
    + conStrA
    + '            ");' + '\n'
    + '        }' + '\n'
    + '        var data = xData = dataArr = [];' + '\n'
    + "        var colorData = ['#f00','#f80','#ff0','#0f0','#0ff','#00f','#f0f','#f99','#505','#777','#000','#951','#ace','#81f','#cf1','#fcf','#4d9','#df2','#3c8','#83f','#123','#321','#456','#654','#789','#987','#abc','#cba','#def','#fed','#080','#191','#2a2','#3b3','#4c4','#5d5','#6e6','#7f7','#808','#919','#a2a','#b3b','#c4c','#d5d','#e6e','#f7f','#18e','#e18','#753','#357'];" + '\n'
    + '        var str = sta = "";' + '\n'
    + '        var dataTopSum = ' + JSON.stringify(map.datats) + ';' + '\n'
    + '        function draw_TOPSUM(){' + '\n'
    + '            var newData = dataTopSum;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            var dataArea = newData[3];' + '\n'
    + '            str = "Top 20 processes by CPU correlation between CPU-seconds(Total), Character-I/O(Total), Memory-Size(Max) for each Command Name";' + '\n'
    + '            sta = "scatter";' + '\n'
    + '            initChart(dataArea);' + '\n'
    + '        }' + '\n'
    + '        var dataTopcmd = ' + JSON.stringify(map.datatc) + ';' + '\n'
    + '        function draw_TOPCMD(){' + '\n'
    + '            var newData = dataTopcmd;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Top Process Commands by CPU (Percentage of a CPU core)";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataTopDisk = ' + JSON.stringify(datatdb) + ';' + '\n'
    + '        function draw_TOPDISK(){' + '\n'
    + '            var newData = dataTopDisk;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Top 14 disks by sum(Busy%)";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataCpuUtil = ' + JSON.stringify(datacu) + ';' + '\n'
    + '        function draw_CPU_UTIL(){' + '\n'
    + '            var newData = dataCpuUtil;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "CPU Utilization Percentages";' + '\n'
    + '            sta = "stack";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataCpuUse = ' + JSON.stringify(datacpu) + ';' + '\n'
    + '        function draw_CPU_USE(){' + '\n'
    + '            var newData = dataCpuUse;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            var colorData1 = ["#00f","#f00"];' + '\n'
    + '            str = "Use of Logical CPU Core Threads - POWER=SMT or x86=Hyperthreads";' + '\n'
    + '            sta = "bar";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataCpuUtilAll = ' + JSON.stringify(datacua) + ';' + '\n'
    + '        function draw_CPUUTIL_ALL(){' + '\n'
    + '            var newData = dataCpuUtilAll;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Linux CPU Utilization FULL details";' + '\n'
    + '            sta = "stack";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataRunQblock = ' + JSON.stringify(datarb) + ';' + '\n'
    + '        function draw_RUNQBLOCK(){' + '\n'
    + '            var newData = dataRunQblock;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Run Queue - processes that running or ready to run or Blocked";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataPswitch = ' + JSON.stringify(dataps) + ';' + '\n'
    + '        function draw_PSWITCH(){' + '\n'
    + '            var newData = dataPswitch;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Process Switches per second - between processes";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataForkExec = ' + JSON.stringify(datafe) + ';' + '\n'
    + '        function draw_FORKEXEC(){' + '\n'
    + '            var newData = dataForkExec;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Fork() and Exec() System Calls per second - creating processes";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataMemLinux = ' + JSON.stringify(datamt) + ';' + '\n'
    + '        function draw_MEM_LINUX(){' + '\n'
    + '            var newData = dataMemLinux;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Real Memory - RAM in MB";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataSwapLinux = ' + JSON.stringify(datasw) + ';' + '\n'
    + '        function draw_SWAP_LINUX(){' + '\n'
    + '            var newData = dataSwapLinux;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Virtual Memory - Paging Space in MB";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataNet = ' + JSON.stringify(datan) + ';' + '\n'
    + '        function draw_NET(){' + '\n'
    + '            var newData = dataNet;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Network Receive(read) & Send(write shown negatively) in KB per second";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataNetPacket = ' + JSON.stringify(datanp) + ';' + '\n'
    + '        function draw_NETPACKET(){' + '\n'
    + '            var newData = dataNetPacket;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Network packet count per second";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataDiskBusy = ' + JSON.stringify(datadb) + ';' + '\n'
    + '        function draw_DISKBUSY(type){' + '\n'
    + '            var newData = dataDiskBusy;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            if(type == "s"){' + '\n'
    + '                str = "Disk Busy Percentage of the time (Stacked)";' + '\n'
    + '                sta = "stack";' + '\n'
    + '                initChart();' + '\n'
    + '            }else{' + '\n'
    + '                str = "Disk Busy Percentage of the time (UnStacked)";' + '\n'
    + '                sta = "";' + '\n'
    + '                initChart();' + '\n'
    + '            }' + '\n'
    + '        }' + '\n'
    + '        var dataDiskRead = ' + JSON.stringify(datadr) + ';' + '\n'
    + '        function draw_DISKREAD(type){' + '\n'
    + '            var newData = dataDiskRead;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            if(type == "s"){' + '\n'
    + '                str = "Disk Read KB per second (Stacked)";' + '\n'
    + '                sta = "stack";' + '\n'
    + '                initChart();' + '\n'
    + '            }else{' + '\n'
    + '                str = "Disk Read KB per second (UnStacked)";' + '\n'
    + '                sta = "";' + '\n'
    + '                initChart();' + '\n'
    + '            }' + '\n'
    + '        }' + '\n'
    + '        var dataDiskWrite = ' + JSON.stringify(datadw) + ';' + '\n'
    + '        function draw_DISKWRITE(type){' + '\n'
    + '            var newData = dataDiskWrite;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            if(type == "s"){' + '\n'
    + '                str = "Disk Write KB per second (Stacked)";' + '\n'
    + '                sta = "stack";' + '\n'
    + '                initChart();' + '\n'
    + '            }else{' + '\n'
    + '                str = "Disk Write KB per second (UnStacked)";' + '\n'
    + '                sta = "";' + '\n'
    + '                initChart();' + '\n'
    + '            }' + '\n'
    + '        }' + '\n'
    + '        var dataDiskBsize = ' + JSON.stringify(datadbs) + ';' + '\n'
    + '        function draw_DISKBSIZE(){' + '\n'
    + '            var newData = dataDiskBsize;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Disk Block Size KB";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataDiskXfer = ' + JSON.stringify(datadx) + ';' + '\n'
    + '        function draw_DISKXFER(){' + '\n'
    + '            var newData = dataDiskXfer;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Disk Transfers per second";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        var dataJfs = ' + JSON.stringify(dataj) + ';' + '\n'
    + '        function draw_JFS(){' + '\n'
    + '            var newData = dataJfs;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "Journal File System Percent Full (Note: -1.234 = stats not avaialble)";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + irqDataStr
    + '        var dataIrqCpuAll = ' + JSON.stringify(dataica) + ';' + '\n'
    + '        function draw_IRQCPU_ALL(){' + '\n'
    + '            var newData = dataIrqCpuAll;' + '\n'
    + '            data = newData[0];' + '\n'
    + '            xData = newData[1];' + '\n'
    + '            dataArr = newData[2];' + '\n'
    + '            str = "IRQ count per cycle on all CPUs";' + '\n'
    + '            sta = "";' + '\n'
    + '            initChart();' + '\n'
    + '        }' + '\n'
    + '        function initChart(dataArea){' + '\n'
    + '            var myChart = echarts.init(document.getElementById("main"));' + '\n'
    + '            myChart.clear();' + '\n'
    + '            if(sta == "bar"){' + '\n'
    + '                myChart.setOption(findOptionForBar(["#00f","#f00"],xData,dataArr,data,str));' + '\n'
    + '            }else if(sta == "scatter"){' + '\n'
    + '                myChart.setOption(findOptionForScatter(colorData,xData,dataArr,data,dataArea,str));' + '\n'
    + '            }else{' + '\n'
    + '                myChart.setOption(findOption(colorData,xData,dataArr,data,str,sta,dataArea));' + '\n'
    + '            }' + '\n'
    + '        }' + '\n'
    + '    </script>' + '\n'
    + '</body>' + '\n'
    + '</html>'
    return htmlStr;
}

// Add the array of key and the array of value to the map 
mapPut = function(map,arr1,arr2){
    for(var i = 0; i < arr1.length; i++){
        map[arr1[i]] = arr2[i];
    }
    return map;
}

// Take the value of dynamic key value to form a new array 
mapGet = function(map,arr1){
    var newArray = [];
    for(var i = 0; i < arr1.length; i++){
        newArray.push(map[arr1[i]]);
    }
    return newArray;
}

// When the array parameter of key has the same name, rename the array of key according to the passed string 
arrChange = function(arr,str){
    for(var i = 0; i < arr.length; i++){
        arr[i] = str + arr[i];
    }
    return arr;
}

// Restore the array parameter of the renamed key with the same name, and 'str' is the 'str' of the previous rename 
arrRestore = function(arr,str){
    for(var i = 0; i < arr.length; i++){
        if(arr[i].split(str).length > 1){
            arr[i] = arr[i].substring(str.length);
        }else{
            arr[i] = arr[i];
        }
    }
    return arr;
}

// Using global variables to generate a two-dimensional array whose length cannot be determined 
createDynArr = function(arr){
    var dataArr = [];
    for(var i = 0; i < arr.length; i++){
        global['str' + i] = [];
        dataArr.push(global['str' + i]);
    }
    return dataArr;
}

// Truncate the length the array minus the num bit
recArr = function(arr,num){
    var newArr = []
    for(var i = 0; i < arr.length - num; i++){
        newArr.push(arr[i]);
    }
    return newArr;
}

// Change time format: 11:08:15,23-SEP-2019 => 2019-9-23 11:08:15
strToDate = function(str){
    var newStr = "";
    var strArr = str.toString().split(',');
    var strArr1 = strArr[1].toString().split('-');
    var mon = new Array('JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC');
    var qqq = strArr1[2].toString() + "-"
    var monstr =  "";
    switch(strArr1[1]){
        case mon[0] :
            monStr = 1;
            break;
        case mon[1] :
            monStr = 2;
            break;
        case mon[2] :
            monstr = 3;
            break;
        case mon[3] :
            monstr = 4;
            break;
        case mon[4] :
            monstr = 5;
            break;
        case mon[5] :
            monstr = 6;
            break;
        case mon[6] :
            monstr = 7;
            break;
        case mon[7] :
            monstr = 8;
            break;
        case mon[8] :
            monstr = 9;
            break;
        case mon[9] :
            monstr = 10;
            break;
        case mon[10] :
            monstr = 11;
            break;
        case mon[11] :
            monstr = 12;
            break;
    }
    newStr = qqq + monstr + "-" + strArr1[0] + " " + strArr[0];
    return newStr;
};