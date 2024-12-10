function ageChart(countUnder30, count30to40, count41to50, count51to60, countAbove60){
  console.log("Age categories count:");
  console.log("<30: " + countUnder30);
  console.log("30-40: " + count30to40);
  console.log("41-50: " + count41to50);
  console.log("51-60: " + count51to60);
  console.log(">60: " + countAbove60);
  var chartDom = document.getElementById('chart1');
  var myChart = echarts.init(chartDom);
  var option;

  option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 25,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: countUnder30, name: '<30y' },
          { value: count30to40, name: '30y-40y' },
          { value: count41to50, name: '40y-50y' },
          { value: count51to60, name: '50y-60y' },
          { value: countAbove60, name: '>60y' }
        ]
      }
    ]
  };

  option && myChart.setOption(option);
}

function cancerChart(breastCancer, ThroatCancer, liverCancer, lungCancer){
var chartDom = document.getElementById('chart2');
var myChart = echarts.init(chartDom);
var option;

option = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center'
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 25,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: breastCancer, name: 'Breast' },
        { value: ThroatCancer, name: 'Throat' },
        { value: liverCancer, name: 'Liver' },
        { value: lungCancer, name: 'Lung' }
      ]
    }
  ]
};

option && myChart.setOption(option);
}

function procedureChart(biopsy, resection, bothProcedures){
var chartDom = document.getElementById('chart3');
var myChart = echarts.init(chartDom);
var option;

option = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center'
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 25,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: biopsy, name: 'Biopsy' },
        { value: resection, name: 'Resection' },
        { value: bothProcedures, name: 'Both' }
      ]
    }
  ]
};

option && myChart.setOption(option);
}

function sampleTypeChart(countBS, countSS, countOS){
var chartDom = document.getElementById('chart4');
var myChart = echarts.init(chartDom);
var option;

option = {
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: 'center'
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 25,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: countBS, name: 'Blood' },
        { value: countSS, name: 'Specimen' },
        { value: countOS, name: 'Other' }
      ]
    }
  ]
};

option && myChart.setOption(option);
}

//var chartDom = document.getElementById('chart3');
// var myChart = echarts.init(chartDom);
// var option;

// option = {
//   tooltip: {
//     trigger: 'item'
//   },
//   legend: {
//     top: '5%',
//     left: 'center'
//   },
//   series: [
//     {
//       type: 'pie',
//       radius: ['40%', '70%'],
//       avoidLabelOverlap: false,
//       itemStyle: {
//         borderRadius: 10,
//         borderColor: '#fff',
//         borderWidth: 2
//       },
//       label: {
//         show: false,
//         position: 'center'
//       },
//       emphasis: {
//         label: {
//           show: true,
//           fontSize: 25,
//           fontWeight: 'bold'
//         }
//       },
//       labelLine: {
//         show: false
//       },
//       data: [
//         { value: 1048, name: 'Chemotherapy' },
//         { value: 735, name: 'Hormone Therapy' },
//         { value: 580, name: 'Radiation Therapy' },
//         { value: 484, name: 'Systemic Therapy' },
//         { value: 484, name: 'Targeted Therapy' }
//       ]
//     }
//   ]
// };
