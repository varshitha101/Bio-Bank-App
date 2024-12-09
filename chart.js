function ageChart(){
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
          { value: 232, name: '<30y' },
          { value: 135, name: '30y-40y' },
          { value: 90, name: '40y-50y' },
          { value: 64, name: '50y-60y' },
          { value: 59, name: '>60y' }
        ]
      }
    ]
  };

  option && myChart.setOption(option);
}

function cancerChart(){
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
        { value: 249, name: 'Breast' },
        { value: 183, name: 'Throat' },
        { value: 94, name: 'Liver' },
        { value: 60, name: 'Lung' }
      ]
    }
  ]
};

option && myChart.setOption(option);
}

function procedureChart(){
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
        { value: 315, name: 'Breast Conservation Surgery' },
        { value: 152, name: 'LABL' },
        { value: 73, name: 'TM+ALND' },
        { value: 46, name: 'TM+AC' }
      ]
    }
  ]
};

option && myChart.setOption(option);
}

function smapleTypeChart(){
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
        { value: 325, name: 'Blood' },
        { value: 186, name: 'Specimen' },
        { value: 75, name: 'Both' }
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