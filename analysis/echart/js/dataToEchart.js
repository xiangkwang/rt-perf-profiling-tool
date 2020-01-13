function dataToSeries(dataArr,data,colorData){
	var series = [];
    for(var i = 0; i < data.length; i++){
    	var num = 0
    	if(data[i] == 'min_cycle_time' || data[i] == 'max_cycle_time' || data[i] == 'min_jitter_time' || data[i] == 'max_jitter_time' || data[i] == 'max_cycle_1sec' || data[i] == 'max_jitter_1sec'){
    		num = 1;
    	}
    	var item = {
			name:data[i],
            type:'line',
            yAxisIndex:num,
            areaStyle:{normal: {
            	color:new echarts.graphic.LinearGradient(
            		0, 0, 0, 1,
            		[{
            			offset:0,
            			color:colorData[i]
            		},{
            			offset:1,
            			color:colorData[i]
            		}]
            	),
            	opacity:0.1
            }},
            data:dataArr[i]
    	}
    	series.push(item);
    }
    return series;
}

function dataToSeriesSta(dataArr,data,colorData){
	var series = [];
    for(var i = 0; i < data.length; i++){
    	var num = 0
    	var stack = 'true';
    	if(data[i] == 'min_cycle_time' || data[i] == 'max_cycle_time' || data[i] == 'min_jitter_time' || data[i] == 'max_jitter_time' || data[i] == 'max_cycle_1sec' || data[i] == 'max_jitter_1sec'){
    		num = 1;
    		stack = '';
    	}
    	var item = {
			name:data[i],
            type:'line',
        	stack: stack,
            yAxisIndex:num,
            areaStyle:{normal: {
            	color:new echarts.graphic.LinearGradient(
            		0, 0, 0, 1,
            		[{
            			offset:0,
            			color:colorData[i]
            		},{
            			offset:1,
            			color:colorData[i]
            		}]
            	),
            	opacity:0.1
            }},
            data:dataArr[i]
    	}
    	series.push(item);
    }
    return series;
}

function dataToScatterSeries(dataArr,data,colorData,xData,dataArea){
	var series = [];
    for(var i = 0; i < dataArr.length; i++){
    	var dataArr1 = [];
    	dataArr1.push(dataArr[i]);
    	var str = xData[i] + "\n" + data[0] + ": " + dataArr[i][0] + "\n" + data[1] + ": " + dataArr[i][1] + "\n" + data[2] + ": " + dataArr[i][3] + "\n" + data[3] + ": " + dataArr[i][2] + "\n";
    	var str1 = "<b>" + xData[i] + "</b><br />" + data[0] + ": <b>" + dataArr[i][0] + "</b><br />" + data[1] + ": <b>" + dataArr[i][1] + "</b><br />" + data[2] + ": <b>" + dataArr[i][3] + "</b><br />" + data[3] + ": <b>" + dataArr[i][2] + "</b><br />";
    	var item = {
    			name:xData[i],
    			data:dataArr1,
    			type:'scatter',
    			symbolSize: (dataArea[i] < 50000 ? 50 : dataArea[i] / 1000),
    			markPoint: {
    				label: {
    					show: false
    				}
    			},
    			label: {
    				emphasis: {
    					show: true,
    					formatter: str,
    					fontWeight: 'bolder',
                    	fontSize: 14
    				}
    			},
    			itemStyle: {
    				normal: {
    					color: colorData[i]
    				}
    			},
    			tooltip: {
    				formatter: str1
    			}
    	}
    	series.push(item);
    }
    return series;
}

function dataToEchart(data){
	var newData = [];
	var dataArr = [];
	var dataName = [];
	var dataX = [];
	var dataChild1 = [];
	for(var i = 0; i < data.length; i++){
		var dataChild = data[i];
		if(i == 0){
			for(var j = 1; j < dataChild.length; j++){
				dataName.push(dataChild[j]);
			}
		}else{
			dataChild1[i-1] = [];
			dataX.push((dataChild[0].indexOf("(") != -1 && dataChild[0].split(")").indexOf != -1)?dateToStr(dataChild[0]):dataChild[0]);
			for(var j = 1; j < dataChild.length; j++){
				dataChild1[i-1][j-1] = dataChild[j];
			}
		}
	}
	for(var i = 0; i < dataChild1[0].length; i++){
		dataArr[i] = [];
		for(var j = 0; j < dataChild1.length; j++){
			dataArr[i][j] = dataChild1[j][i];
		}
	}
	newData.push(dataName);
	newData.push(dataX);
	newData.push(dataArr);
	return newData;
}

function dataToScatter(data){
	var newData = [];
	var dataArr = [];
	var dataName = [];
	var dataX = [];
	var dataArea = [];
	for(var i = 0; i < data.length; i++){
		var dataChild = data[i];
		if(i == 0){
			for(var j = 1; j < dataChild.length; j++){
				dataName.push(dataChild[j]);
			}
		}else{
			dataX.push(dataChild[0]);
			dataArea.push(dataChild[4]);
			var dataChild1 = [];
			dataChild1.push(dataChild[1]);
			dataChild1.push(dataChild[2]);
			dataChild1.push(dataChild[4]);
			dataChild1.push(dataChild[3]);
			dataArr.push(dataChild1);
		}
	}
	newData.push(dataName);
	newData.push(dataX);
	newData.push(dataArr);
	newData.push(dataArea);
	return newData;
}

function dateToStr(date){
	var string = "";
	var year = month = day = hour = minute = second = "";
	var str = date.substring(date.indexOf("(")+1,date.indexOf(")")).replace(/\s*/g,"").split(",");
	year = str[0];
	month = str[1];
	day = str[2];
	hour = str[3];
	minute = str[4];
	second = str[5];
	string = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
	return string;
}

function lengthNum(len){
	return (len + 19) / 20;
}

function findOption(colorData,xData,dataArr,data,str,sta){
	var rightYName = '';
	for(var i = 0; i < data.length; i++){
		if(data[i] == 'min_cycle_time' || data[i] == 'max_cycle_time' || data[i] == 'min_jitter_time' || data[i] == 'max_jitter_time' || data[i] == 'max_cycle_1sec' || data[i] == 'max_jitter_1sec'){
			rightYName = 'cycle and jitter';
		}
	}
	var option = {
        title: {
            text: str,
            top: 25
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params){
            	var string = "";
            	if(params != null && params.length > 0){
            		string += params[0].name + '<br/>';
					var num = lengthNum(params.length);
            		for(var i = 0; i < params.length; i++){
            			string += params[i].marker + params[i].seriesName + ':' + params[i].value + '&nbsp;&nbsp;';
						if((i + 1) % parseInt(num) == 0){
							string += '<br/>';
						}
            		}
            	}
            	return string;
            }
        },
        grid: {
        	top: '80',
        	left: '6%',
        	right: '20%',
        	bottom: '60'
        },
        legend: {
        	type: 'scroll',
            data:data,
            formatter: function(name){
            	if(name.length > 18){
            		name = name.slice(0,18) + '...';
            	}
            	return name;
            },
            tooltip:{
            	show: true,
                trigger:'item'
            },
            textStyle: {
            	fontWeight: 'bold',
            	fontSize: 14,
            },
            orient: 'vertical',
            x: 'right',
            y: '100',
        },
        color:colorData,
        xAxis: {
        	data : xData,
        },
        yAxis: [
        	{
        		name: '',
	            type: 'value',
	            nameTextStyle: {
	            	fontWeight: 'bold',
	            	fontSize: 18
	            },
	            axisLabel: {
	            	fontWeight: 'bold',
	            	fontSize: 12
	            }
        	},
        	{
        		name: rightYName,
        		type: 'value',
        		nameTextStyle: {
        			fontWeight: 'bold',
        			fontSize: 16
        		},
        		axisLabel: {
        			fontWeight: 'bold',
        			fontSize: 12
        		}
        	}
        ],
        dataZoom: [{
            startValue: xData[0]
        }, {
            type: 'inside'
        }],
        series: (sta) ? dataToSeriesSta(dataArr,data,colorData) : dataToSeries(dataArr,data,colorData)
    };
	return option;
}

function findOptionForBar(colorData,xData,dataArr,data,str){
	var option = {
        title: {
            text: str,
            top: 25
        },
        tooltip: {},
        grid: {
        	top: '80',
        	left: '6%',
        	right: '20%',
        	bottom: '60'
        },
        legend: {
            data:data,
            tooltip:{
                trigger:'item'
            },
            textStyle: {
            	fontWeight: 'bold',
            	fontSize: 14
            },
            orient: 'vertical',
            x: 'right',
            y: '100',
        },
        color: colorData,
        xAxis: {
        	data : xData,
        },
        yAxis: [
        	{
        		name: '',
	            type: 'value',
	            nameTextStyle: {
	            	fontWeight: 'bold',
	            	fontSize: 18
	            },
	            axisLabel: {
	            	fontWeight: 'bold',
	            	fontSize: 12
	            }
        	}
        ],
        series: [
            {
    			name:data[0],
    			stack:'one',
                type:'bar',
                data:dataArr[0]
        	},
        	{
    			name:data[1],
    			stack:'one',
                type:'bar',
                data:dataArr[1]
        	}
    	]
    };
	return option;
}

function findOptionForScatter(colorData,xData,dataArr,data,dataArea,str){
	var option = {
        title: {
            text: str,
            top: 25
        },
        tooltip: {},
        grid: {
        	top: '80',
        	left: '6%',
        	right: '20%',
        	bottom: '60'
        },
        legend: {
        	type: 'scroll',
        	data: xData,
            tooltip:{
                trigger:'item'
            },
            textStyle: {
            	fontWeight: 'bold',
            	fontSize: 14
            },
            orient: 'vertical',
            x: 'right',
            y: '100'
        },
        color:colorData,
        xAxis: {
        	splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        yAxis: {
       		name: '',
            type: 'value',
            nameTextStyle: {
            	fontWeight: 'bold',
            	fontSize: 18
            },
            axisLabel: {
            	fontWeight: 'bold',
            	fontSize: 12
            },
         	splitLine: {
            	lineStyle: {
                	type: 'dashed'
            	}
        	},
        	scale: true
       	},
        series: dataToScatterSeries(dataArr,data,colorData,xData,dataArea)
    };
	return option;
}