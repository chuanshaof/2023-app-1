/* eslint-disable */
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
// @mui
import { Card, CardHeader, Box } from '@mui/material';
//
import { BaseOptionChart } from '../../../../components/chart';

// ----------------------------------------------------------------------


export default function LineChart(data) {
  const CHART_DATA = [
    // {
    //   name: 'Team A',
    //   type: 'column',
    //   data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
    // },
    // {
    //   name: 'Funds',
    //   type: 'area',
    //   data: data.data.values,
    // },
    {
      name: 'Funds',
      type: 'area',
      data: data.data.values,
    },
  ];
  const chartOptions = merge(BaseOptionChart(), {
    stroke: { width: [0, 2, 3] },
    plotOptions: { bar: { columnWidth: '14%' } },
    fill: { type: ['solid', 'gradient', 'solid'] },
    labels: data.data.dates,
    xaxis: { type: 'datetime' },
    yaxis: [
      {
        labels: {
          formatter: function(val) {
            return val.toFixed(3);;
          }
        }
      }
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(3)}`;
          }
          return y;
        },
      },
    },
  });

  return (
    <Card>
      <CardHeader title={data.title} />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="line" series={CHART_DATA} options={chartOptions} height={364} />
      </Box>
    </Card>
  );
}
