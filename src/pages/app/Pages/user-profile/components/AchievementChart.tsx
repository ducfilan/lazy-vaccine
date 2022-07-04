import * as React from "react"
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};


const AchievementChart = (props: { statistics: any }) => {
  return (
    <>
      {props.statistics && <Bar options={options} data={props.statistics} />}
    </>
  )
}

export default AchievementChart
