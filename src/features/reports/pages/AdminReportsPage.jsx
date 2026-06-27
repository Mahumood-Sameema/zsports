// AdminReportsPage Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { reportRepository, venueRepository } from '../../../repositories';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Download, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import Button from '../../../components/common/Button';
import LoadingCard from '../../../components/common/LoadingCard';
import ErrorState from '../../../components/common/ErrorState';
import { format, addDays } from 'date-fns';

const COLORS = ['#1A56DB', '#0E9F6E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export const AdminReportsPage = () => {
  const { currentUser } = useAuth();
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [startDate, setStartDate] = useState(format(addDays(new Date(), -15), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Load venues managed by this admin
  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ['admin-venues-for-reports', currentUser?.uid],
    queryFn: () => venueRepository.getAllVenues(),
    enabled: !!currentUser?.uid
  });

  useEffect(() => {
    if (venues && venues.length > 0 && !selectedVenueId) {
      setSelectedVenueId(venues[0].id);
    }
  }, [venues, selectedVenueId]);

  // Load summary reports
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['report-summary', selectedVenueId, startDate, endDate],
    queryFn: () => reportRepository.getReportSummary(selectedVenueId, startDate, endDate),
    enabled: !!selectedVenueId && !!startDate && !!endDate
  });

  // Load daily reports
  const { data: daily = [], isLoading: dailyLoading } = useQuery({
    queryKey: ['report-daily', selectedVenueId, startDate, endDate],
    queryFn: () => reportRepository.getDailyReports(selectedVenueId, startDate, endDate),
    enabled: !!selectedVenueId && !!startDate && !!endDate
  });

  // Load occupancy hourly details
  const { data: hourlyOccupancy = [] } = useQuery({
    queryKey: ['report-occupancy', selectedVenueId, startDate, endDate],
    queryFn: () => reportRepository.getOccupancyData(selectedVenueId, null, startDate, endDate),
    enabled: !!selectedVenueId && !!startDate && !!endDate
  });

  // Load top customers
  const { data: topCustomers = [] } = useQuery({
    queryKey: ['report-top-customers', selectedVenueId],
    queryFn: () => reportRepository.getTopCustomers(selectedVenueId, 5),
    enabled: !!selectedVenueId
  });

  const handleExportCSV = () => {
    const headers = ['Date', 'Total Bookings', 'Confirmed Bookings', 'Cancelled Bookings', 'Revenue', 'Net Revenue', 'Occupancy'];
    const rows = daily.map(d => [
      d.date,
      d.totalBookings,
      d.confirmedBookings,
      d.cancelledBookings,
      d.revenue,
      d.netRevenue,
      `${d.occupancyRate}%`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `daily_report_${selectedVenueId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert sport breakdown to Recharts pie format
  const sportPieData = summary?.bookingsBySport 
    ? Object.entries(summary.bookingsBySport).map(([name, value]) => ({ name, value }))
    : [];

  const kpis = [
    { label: 'Total Bookings', value: summary?.totalBookings || 0, sub: 'All statuses combined' },
    { label: 'Confirmed bookings', value: summary?.confirmedBookings || 0, sub: 'Confirmed reservations' },
    { label: 'Total Revenue', value: `₹${summary?.totalRevenue || 0}`, sub: 'Before refund cancellations' },
    { label: 'Occupancy Rate', value: `${summary?.occupancyRate || 0}%`, sub: 'Slot utilization rate' }
  ];

  if (venuesLoading) return <LoadingCard message="Loading venues config..." />;

  return (
    <div className="space-y-6 text-slate-350 select-none pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-primary" size={24} />
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business Reports & Analytics</h2>
            <p className="text-xs text-slate-600 mt-1">Review revenue patterns, sports occupancy, and print metrics logs.</p>
          </div>
        </div>

        {daily.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExportCSV}
            className="border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Export Sheet
          </Button>
        )}
      </div>

      {/* Selectors and Filters toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50/20 p-4 border border-slate-200 rounded-xl">
        <div className="flex flex-wrap gap-4 items-center">
          {venues.length > 1 && (
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
            >
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
            />
            <span className="text-xs text-slate-550">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-bold rounded border border-slate-200 bg-white py-1.5 px-3 focus:outline-none focus:ring-primary text-slate-350"
            />
          </div>
        </div>
      </div>

      {summaryLoading || dailyLoading ? (
        <LoadingCard message="Aggregating charts and reports..." />
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-1">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{kpi.label}</span>
                <span className="text-xl font-extrabold text-slate-900 block">{kpi.value}</span>
                <span className="block text-[9px] text-slate-600 mt-1">{kpi.sub}</span>
              </div>
            ))}
          </div>

          {/* Charts Row 1: Line & Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue Line Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={16} className="text-primary" />
                Revenue & Bookings Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="date" stroke="#64748B" style={{ fontSize: 10 }} />
                    <YAxis stroke="#64748B" style={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#1A56DB" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="totalBookings" name="Bookings" stroke="#0E9F6E" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sport popularity pie */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Bookings By Sport
              </h3>
              <div className="h-64 relative flex items-center justify-center">
                {sportPieData.length === 0 ? (
                  <p className="text-xs text-slate-500 font-semibold">No sport metrics recorded.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sportPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sportPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }} />
                      <Legend style={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Occupancy Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Occupancy Hourly Heatmap */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Hourly Occupancy Rate
              </h3>
              <div className="h-64">
                {hourlyOccupancy.length === 0 ? (
                  <p className="text-xs text-slate-550 text-center py-12">No hourly logs available.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyOccupancy}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="hour" stroke="#64748B" style={{ fontSize: 10 }} />
                      <YAxis stroke="#64748B" style={{ fontSize: 10 }} label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft', fill: '#64748B' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }} />
                      <Bar dataKey="occupancy" name="Occupancy %" fill="#0E9F6E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top customers panel */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Top Spending Customers
              </h3>
              
              <div className="space-y-3.5 divide-y divide-slate-200">
                {topCustomers.length === 0 ? (
                  <p className="text-xs text-slate-500 font-semibold text-center py-6">No customer data.</p>
                ) : (
                  topCustomers.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center pt-3.5 first:pt-0 font-semibold text-xs">
                      <div>
                        <p className="text-slate-900 font-bold">{c.name}</p>
                        <p className="text-[10px] text-slate-500 font-normal">{c.bookingsCount} reservation(s)</p>
                      </div>
                      <span className="text-slate-700 font-bold">₹{c.totalSpent}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReportsPage;
