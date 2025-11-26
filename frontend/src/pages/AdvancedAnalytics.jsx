import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import analyticsService from '../api/analytics';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AdvancedAnalytics() {
    const [loading, setLoading] = useState(true);
    const [trends, setTrends] = useState(null);
    const [vendors, setVendors] = useState(null);
    const [forecast, setForecast] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [trendsData, vendorsData, forecastData] = await Promise.all([
                analyticsService.getSpendingTrends(),
                analyticsService.getVendorPerformance(),
                analyticsService.getForecast()
            ]);
            setTrends(trendsData);
            setVendors(vendorsData);
            setForecast(forecastData);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading analytics..." />;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return (
        <main className="dashboard">
            <div className="container">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="page-title">Advanced Analytics</h1>
                    <button className="btn-secondary" onClick={() => window.print()}>
                        Export Report
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="card">
                        <h3>Spending Trends (Last 12 Months)</h3>
                        <div className="chart-container">
                            {trends && <Line data={trends} options={chartOptions} />}
                        </div>
                    </div>

                    <div className="card">
                        <h3>Top Vendors by Spend</h3>
                        <div className="chart-container">
                            {vendors && <Bar data={vendors} options={chartOptions} />}
                        </div>
                    </div>
                </div>

                <div className="card mb-6">
                    <h3>Spending Forecast (Next 3 Months)</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        Projected spending based on 6-month historical average with 5% growth factor.
                    </p>
                    <div className="chart-container" style={{ height: '300px' }}>
                        {forecast && <Line data={forecast} options={chartOptions} />}
                    </div>
                </div>
            </div>
        </main>
    );
}
