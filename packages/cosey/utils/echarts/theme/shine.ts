const colorPalette = [
  '#c12e34',
  '#e6b600',
  '#0098d9',
  '#2b821d',
  '#005eaa',
  '#339ca8',
  '#cda819',
  '#32a487',
];

export default {
  color: colorPalette,

  title: {
    textStyle: {
      fontWeight: 'normal',
    },
  },

  visualMap: {
    color: ['#1790cf', '#a2d4e6'],
  },

  toolbox: {
    iconStyle: {
      borderColor: '#06467c',
    },
  },

  tooltip: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  dataZoom: {
    dataBackgroundColor: '#dedede',
    fillerColor: 'rgba(154,217,247,0.2)',
    handleColor: '#005eaa',
  },

  timeline: {
    lineStyle: {
      color: '#005eaa',
    },
    controlStyle: {
      color: '#005eaa',
      borderColor: '#005eaa',
    },
  },

  candlestick: {
    itemStyle: {
      color: '#c12e34',
      color0: '#2b821d',
    },
    lineStyle: {
      width: 1,
      color: '#c12e34',
      color0: '#2b821d',
    },
    areaStyle: {
      color: '#e6b600',
      color0: '#005eaa',
    },
  },

  graph: {
    itemStyle: {
      color: '#e6b600',
    },
    linkStyle: {
      color: '#005eaa',
    },
  },

  map: {
    itemStyle: {
      color: '#f2385a',
      borderColor: '#eee',
      areaColor: '#ddd',
    },
    areaStyle: {
      color: '#ddd',
    },
    label: {
      color: '#c12e34',
    },
  },

  gauge: {
    axisLine: {
      show: true,
      lineStyle: {
        color: [
          [0.2, '#2b821d'],
          [0.8, '#005eaa'],
          [1, '#c12e34'],
        ],
        width: 5,
      },
    },
    axisTick: {
      splitNumber: 10,
      length: 8,
      lineStyle: {
        color: 'auto',
      },
    },
    axisLabel: {
      color: 'auto',
    },
    splitLine: {
      length: 12,
      lineStyle: {
        color: 'auto',
      },
    },
    pointer: {
      length: '90%',
      width: 3,
      color: 'auto',
    },
    title: {
      color: '#333',
    },
    detail: {
      color: 'auto',
    },
  },
};
