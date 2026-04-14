import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { Shield, Trash2, Users, AlertTriangle, Search, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const STATUS_TABS = ['ALL', 'NEW', 'IN_REVIEW', 'RESOLVED', 'ESCALATED'];
const SAVED_FILTER_KEY = 'adminDashboardSavedFilters';

const normalizeList = (data) => data?.results || data || [];

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [analytics, setAnalytics] = useState({ kpis: {}, risk: {} });
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedReportIds, setSelectedReportIds] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [reportFilters, setReportFilters] = useState(() => {
        const cached = localStorage.getItem(SAVED_FILTER_KEY);
        if (!cached) return { status: 'ALL', report_type: '', severity: '' };
        try {
            return JSON.parse(cached);
        } catch {
            return { status: 'ALL', report_type: '', severity: '' };
        }
    });
    const [bulkStatus, setBulkStatus] = useState('IN_REVIEW');
    const [trendDays, setTrendDays] = useState(30);

    const fetchAdminData = useCallback(async () => {
        try {
            const reportParams = new URLSearchParams();
            if (reportFilters.status && reportFilters.status !== 'ALL') reportParams.set('status', reportFilters.status);
            if (reportFilters.report_type) reportParams.set('report_type', reportFilters.report_type);
            if (reportFilters.severity) reportParams.set('severity', reportFilters.severity);

            const [prodRes, orderRes, reportRes, userRes, analyticsRes, auditRes] = await Promise.all([
                api.get('products/'),
                api.get('orders/'),
                api.get(`reports/${reportParams.toString() ? `?${reportParams.toString()}` : ''}`),
                api.get(`admin/users/${userSearch ? `?search=${encodeURIComponent(userSearch)}` : ''}`),
                api.get('admin/analytics/'),
                api.get('admin/audit-logs/'),
            ]);
            setProducts(normalizeList(prodRes.data));
            setOrders(normalizeList(orderRes.data));
            setReports(normalizeList(reportRes.data));
            setUsers(normalizeList(userRes.data));
            setAnalytics(analyticsRes.data || { kpis: {}, risk: {} });
            setAuditLogs(normalizeList(auditRes.data).slice(0, 10));
        } catch {
            toast.error('Failed to load admin dashboard data.');
        }
    }, [reportFilters, userSearch]);

    useEffect(() => {
        localStorage.setItem(SAVED_FILTER_KEY, JSON.stringify(reportFilters));
    }, [reportFilters]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    useEffect(() => {
        const timer = setInterval(() => {
            fetchAdminData();
        }, 20000);
        return () => clearInterval(timer);
    }, [fetchAdminData]);

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to remove this product?')) return;
        try {
            await api.delete(`products/${id}/`);
            toast.success('Product removed');
            fetchAdminData();
        } catch {
            toast.error('Failed to delete product');
        }
    };

    const handleReportStatusUpdate = async (report, status, adminNotes = report.admin_notes || '') => {
        try {
            await api.patch(`reports/${report.id}/update_status/`, { status, admin_notes: adminNotes });
            toast.success('Report updated');
            setSelectedReport(null);
            fetchAdminData();
        } catch {
            toast.error('Failed to update report');
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedReportIds.length === 0) return toast.error('Select at least one report');
        try {
            await api.patch('reports/bulk_update/', { ids: selectedReportIds, status: bulkStatus });
            toast.success(`Updated ${selectedReportIds.length} reports`);
            setSelectedReportIds([]);
            fetchAdminData();
        } catch {
            toast.error('Bulk update failed');
        }
    };

    const runUserAction = async (userId, action, payload = {}) => {
        try {
            await api.post(`admin/users/${userId}/${action}/`, payload);
            toast.success('User action completed');
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.error || 'User action failed');
        }
    };

    const queueCounts = useMemo(() => {
        return {
            NEW: reports.filter((r) => r.status === 'NEW').length,
            IN_REVIEW: reports.filter((r) => r.status === 'IN_REVIEW').length,
            RESOLVED: reports.filter((r) => ['RESOLVED', 'REVIEWED'].includes(r.status)).length,
            ESCALATED: reports.filter((r) => r.status === 'ESCALATED').length,
        };
    }, [reports]);

    const trendData = useMemo(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - trendDays + 1);

        const buckets = {};
        for (let i = 0; i < trendDays; i += 1) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            buckets[key] = { date: key, gmv: 0, orders: 0 };
        }

        orders.forEach((order) => {
            const key = new Date(order.created_at).toISOString().slice(0, 10);
            if (!buckets[key]) return;
            buckets[key].orders += 1;
            buckets[key].gmv += Number(order.total_price || 0);
        });

        return Object.values(buckets).map((item) => ({
            ...item,
            label: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            gmv: Number(item.gmv.toFixed(2)),
        }));
    }, [orders, trendDays]);

    const exportCsv = (filename, rows) => {
        if (!rows.length) {
            toast.error('No data available to export');
            return;
        }
        const headers = Object.keys(rows[0]);
        const csv = [
            headers.join(','),
            ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                        <Shield className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Admin Control Center</h1>
                        <p className="text-gray-500">Moderation queue, user ops, risk controls, and audit log.</p>
                    </div>
                </div>
                <button onClick={fetchAdminData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <div className="glass-card p-4"><p className="text-xs text-gray-500">GMV</p><p className="text-2xl font-black text-gray-900">₹{analytics.kpis.gmv || 0}</p></div>
                <div className="glass-card p-4"><p className="text-xs text-gray-500">Total Orders</p><p className="text-2xl font-black text-gray-900">{analytics.kpis.total_orders || 0}</p></div>
                <div className="glass-card p-4"><p className="text-xs text-gray-500">Active Sellers</p><p className="text-2xl font-black text-gray-900">{analytics.kpis.active_sellers || 0}</p></div>
                <div className="glass-card p-4"><p className="text-xs text-gray-500">Reported Items</p><p className="text-2xl font-black text-red-600">{analytics.kpis.reported_items || 0}</p></div>
                <div className="glass-card p-4"><p className="text-xs text-gray-500">High Value Orders</p><p className="text-2xl font-black text-orange-600">{analytics.risk.high_value_orders_10000_plus || 0}</p></div>
            </div>

            <div className="glass-card p-5 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Platform Trend</h2>
                    <div className="flex gap-2">
                        {[7, 30, 90].map((d) => (
                            <button
                                key={d}
                                onClick={() => setTrendDays(d)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${trendDays === d ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="gmv" stroke="#4f46e5" fill="url(#gmvGradient)" name="GMV (₹)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-card p-5 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Exports</h2>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() =>
                            exportCsv(
                                'reports_export.csv',
                                reports.map((r) => ({
                                    id: r.id,
                                    type: r.report_type,
                                    severity: r.severity,
                                    status: r.status,
                                    reporter_id: r.reporter,
                                    reported_user_id: r.reported_user,
                                    reported_product_id: r.reported_product,
                                    created_at: r.created_at,
                                    reason: r.reason,
                                }))
                            )
                        }
                        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold"
                    >
                        Export Reports CSV
                    </button>
                    <button
                        onClick={() =>
                            exportCsv(
                                'users_export.csv',
                                users.map((u) => ({
                                    id: u.id,
                                    username: u.username,
                                    email: u.email,
                                    role: u.role,
                                    status: u.is_suspended ? 'SUSPENDED' : 'ACTIVE',
                                    reports_against: u.reports_against,
                                    date_joined: u.date_joined,
                                }))
                            )
                        }
                        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold"
                    >
                        Export Users CSV
                    </button>
                    <button
                        onClick={() =>
                            exportCsv(
                                'audit_logs_export.csv',
                                auditLogs.map((a) => ({
                                    id: a.id,
                                    actor: a.actor_name,
                                    action: a.action,
                                    target_user: a.target_user_name || '',
                                    target_report: a.target_report || '',
                                    created_at: a.created_at,
                                    metadata: JSON.stringify(a.metadata || {}),
                                }))
                            )
                        }
                        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-semibold"
                    >
                        Export Audit Logs CSV
                    </button>
                </div>
            </div>

            <div className="glass-card p-5 mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setReportFilters((prev) => ({ ...prev, status: tab }))}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${reportFilters.status === tab ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                            {tab === 'ALL' ? 'All' : tab.replace('_', ' ')}
                        </button>
                    ))}
                    <span className="ml-auto text-xs text-gray-500">
                        New: {queueCounts.NEW} | In Review: {queueCounts.IN_REVIEW} | Resolved: {queueCounts.RESOLVED} | Escalated: {queueCounts.ESCALATED}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select className="input-field" value={reportFilters.report_type} onChange={(e) => setReportFilters((prev) => ({ ...prev, report_type: e.target.value }))}>
                        <option value="">All report types</option>
                        <option value="PRODUCT">Product</option>
                        <option value="REVIEW">Review</option>
                        <option value="USER">User</option>
                        <option value="OTHER">Other</option>
                    </select>
                    <select className="input-field" value={reportFilters.severity} onChange={(e) => setReportFilters((prev) => ({ ...prev, severity: e.target.value }))}>
                        <option value="">All severities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                    <select className="input-field" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
                        <option value="IN_REVIEW">Set bulk IN_REVIEW</option>
                        <option value="RESOLVED">Set bulk RESOLVED</option>
                        <option value="ESCALATED">Set bulk ESCALATED</option>
                    </select>
                    <button onClick={handleBulkUpdate} className="btn-primary">Apply Bulk Action</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 glass-card p-5">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Moderation Queue</h2>
                    <div className="space-y-3 max-h-[460px] overflow-auto pr-1">
                        {reports.map((report) => (
                            <div key={report.id} className="border border-gray-100 rounded-xl p-4 bg-white">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">#{report.id} · {report.report_type} · {report.severity}</p>
                                        <p className="text-sm text-gray-600 mt-1">{report.reason}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Age: {report.report_age_hours}h · Repeat offender count: {report.repeat_offender_count}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedReportIds.includes(report.id)}
                                            onChange={(e) => {
                                                setSelectedReportIds((prev) => e.target.checked ? [...prev, report.id] : prev.filter((id) => id !== report.id));
                                            }}
                                        />
                                        <button onClick={() => setSelectedReport(report)} className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">Details</button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <button onClick={() => handleReportStatusUpdate(report, 'IN_REVIEW')} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">In Review</button>
                                    <button onClick={() => handleReportStatusUpdate(report, 'RESOLVED')} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">Resolve</button>
                                    <button onClick={() => handleReportStatusUpdate(report, 'ESCALATED')} className="text-xs px-2 py-1 rounded bg-orange-50 text-orange-700">Escalate</button>
                                </div>
                            </div>
                        ))}
                        {reports.length === 0 && <p className="text-sm text-gray-500">No reports in current filter.</p>}
                    </div>
                </div>

                <div className="glass-card p-5">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Dispute Snapshot</h2>
                    <div className="space-y-3 text-sm">
                        <div className="p-3 rounded-lg bg-gray-50 border">Product reports: {reports.filter((r) => r.report_type === 'PRODUCT').length}</div>
                        <div className="p-3 rounded-lg bg-gray-50 border">Review reports: {reports.filter((r) => r.report_type === 'REVIEW').length}</div>
                        <div className="p-3 rounded-lg bg-gray-50 border">User abuse reports: {reports.filter((r) => r.report_type === 'USER').length}</div>
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700">
                            <AlertTriangle className="inline w-4 h-4 mr-1" />
                            Repeat reported users: {analytics.risk.repeat_reported_users || 0}
                        </div>
                    </div>
                    <h3 className="text-sm font-bold text-gray-700 mt-6 mb-2">Recent Audit Log</h3>
                    <div className="space-y-2 max-h-44 overflow-auto">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="text-xs p-2 rounded bg-gray-50 border border-gray-100">
                                <p className="font-semibold text-gray-700">{log.action}</p>
                                <p className="text-gray-500">{log.actor_name} · {new Date(log.created_at).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass-card p-5 mb-8">
                <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Users className="w-5 h-5" /> User Management</h2>
                    <div className="relative w-full max-w-xs">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="input-field pl-9"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search username/email"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b bg-gray-50 text-gray-600">
                                <th className="p-3">User</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Reports</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b">
                                    <td className="p-3">
                                        <p className="font-semibold text-gray-800">{u.username}</p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </td>
                                    <td className="p-3">{u.role}</td>
                                    <td className="p-3">{u.is_suspended ? 'Suspended' : 'Active'}</td>
                                    <td className="p-3">{u.reports_against}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            {u.is_suspended ? (
                                                <button onClick={() => runUserAction(u.id, 'reactivate')} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">Reactivate</button>
                                            ) : (
                                                <button onClick={() => runUserAction(u.id, 'suspend')} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700">Suspend</button>
                                            )}
                                            <button onClick={() => runUserAction(u.id, 'force_password_reset')} className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">Force Reset</button>
                                            <select
                                                className="text-xs border rounded px-2 py-1"
                                                defaultValue={u.role}
                                                onChange={(e) => runUserAction(u.id, 'change_role', { role: e.target.value })}
                                            >
                                                <option value="BUYER">BUYER</option>
                                                <option value="SELLER">SELLER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <p className="text-sm text-gray-500 py-5">No users found.</p>}
                </div>
            </div>

            <div className="glass-card p-5">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Product Moderation</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50 text-left text-gray-600">
                                <th className="p-3">ID</th>
                                <th className="p-3">Product</th>
                                <th className="p-3">Seller</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((prod) => (
                                <tr key={prod.id} className="border-b">
                                    <td className="p-3 text-gray-500">#{prod.id}</td>
                                    <td className="p-3 font-semibold text-gray-800">{prod.title}</td>
                                    <td className="p-3 text-gray-600">{prod.seller?.username || '-'}</td>
                                    <td className="p-3 font-bold text-primary">₹{prod.price}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedReport && (
                <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
                    <div className="w-full max-w-md h-full bg-white p-6 overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Report #{selectedReport.id}</h3>
                        <p className="text-sm text-gray-600 mb-4">{selectedReport.reason}</p>
                        <p className="text-xs text-gray-500 mb-2">Type: {selectedReport.report_type}</p>
                        <p className="text-xs text-gray-500 mb-4">Severity: {selectedReport.severity}</p>
                        <textarea
                            className="input-field min-h-28"
                            value={selectedReport.admin_notes || ''}
                            onChange={(e) => setSelectedReport((prev) => ({ ...prev, admin_notes: e.target.value }))}
                            placeholder="Private admin notes..."
                        />
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button onClick={() => handleReportStatusUpdate(selectedReport, 'IN_REVIEW', selectedReport.admin_notes)} className="btn-secondary">Mark In Review</button>
                            <button onClick={() => handleReportStatusUpdate(selectedReport, 'ESCALATED', selectedReport.admin_notes)} className="btn-secondary">Escalate</button>
                            <button onClick={() => handleReportStatusUpdate(selectedReport, 'RESOLVED', selectedReport.admin_notes)} className="btn-primary">Resolve</button>
                            <button onClick={() => setSelectedReport(null)} className="border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
