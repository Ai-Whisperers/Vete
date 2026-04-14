import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LineChart, BarChart, PieChart } from 'react-chartjs-2';

interface AnalyticsData {
  revenue: number[];
  patientCount: number[];
  appointmentCount: number[];
}

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: [],
    patientCount: [],
    appointmentCount: [],
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const { data, error } = await supabase
        .from('analytics')
        .select('revenue, patient_count, appointment_count');

      if (error) {
        console.error(error);
      } else {
        setAnalyticsData({
          revenue: data.map((item) => item.revenue),
          patientCount: data.map((item) => item.patient_count),
          appointmentCount: data.map((item) => item.appointment_count),
        });
      }
    };

    fetchAnalyticsData();
  }, []);

  const revenueChartOptions = {
    title: {
      display: true,
      text: 'Revenue Chart',
    },
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Revenue',
          },
        },
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Month',
          },
        },
      ],
    },
  };

  const patientChartOptions = {
    title: {
      display: true,
      text: 'Patient Count Chart',
    },
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Patient Count',
          },
        },
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Month',
          },
        },
      ],
    },
  };

  const appointmentChartOptions = {
    title: {
      display: true,
      text: 'Appointment Count Chart',
    },
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Appointment Count',
          },
        },
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Month',
          },
        },
      ],
    },
  };

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <LineChart
        data={{
          labels: ['January', 'February', 'March', 'April', 'May'],
          datasets: [
            {
              label: 'Revenue',
              data: analyticsData.revenue,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        }}
        options={revenueChartOptions}
      />
      <BarChart
        data={{
          labels: ['January', 'February', 'March', 'April', 'May'],
          datasets: [
            {
              label: 'Patient Count',
              data: analyticsData.patientCount,
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        }}
        options={patientChartOptions}
      />
      <PieChart
        data={{
          labels: ['January', 'February', 'March', 'April', 'May'],
          datasets: [
            {
              label: 'Appointment Count',
              data: analyticsData.appointmentCount,
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
              ],
              borderWidth: 1,
            },
          ],
        }}
        options={appointmentChartOptions}
      />
    </div>
  );
};

export default AnalyticsDashboard;