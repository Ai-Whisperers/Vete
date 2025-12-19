'use client';

import { useState, useEffect } from 'react';
import {
  Download, Activity, MapPin, AlertTriangle, BarChart2, Map,
  Plus, Calendar, Filter, RefreshCw, FileText, Bug
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';

interface HeatmapPoint {
  diagnosis_code: string;
  diagnosis_name: string;
  species: string;
  location_zone: string;
  week: string;
  case_count: number;
  avg_severity: number;
}

interface DiagnosisCode {
  id: string;
  code: string;
  term: string;
  category: string;
}

interface DiseaseReport {
  id: string;
  species: string;
  age_months: number | null;
  is_vaccinated: boolean | null;
  location_zone: string | null;
  reported_date: string;
  severity: string;
  created_at: string;
  diagnosis: { id: string; code: string; term: string } | null;
}

interface Props {
  clinic: string;
  tenantId: string;
  diagnosisCodes: DiagnosisCode[];
}

export default function EpidemiologyDashboard({ clinic, tenantId, diagnosisCodes }: Props) {
  const [data, setData] = useState<HeatmapPoint[]>([]);
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [showReportForm, setShowReportForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'trends'>('overview');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    diagnosis_code_id: '',
    species: 'dog',
    age_months: '',
    is_vaccinated: '',
    location_zone: '',
    severity: 'moderate',
    reported_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
    fetchReports();
  }, [speciesFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/epidemiology/heatmap', window.location.origin);
      if (speciesFilter !== 'all') {
        url.searchParams.set('species', speciesFilter);
      }
      url.searchParams.set('tenant', tenantId);

      const res = await fetch(url.toString());
      const json = await res.json();

      if (Array.isArray(json)) {
        setData(json.sort((a, b) => b.case_count - a.case_count));
      }
    } catch (e) {
      console.error('Error fetching epidemiology data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const url = new URL('/api/epidemiology/reports', window.location.origin);
      if (speciesFilter !== 'all') {
        url.searchParams.set('species', speciesFilter);
      }

      const res = await fetch(url.toString());
      const json = await res.json();

      if (json.data) {
        setReports(json.data);
      }
    } catch (e) {
      console.error('Error fetching reports:', e);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/epidemiology/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age_months: formData.age_months ? parseInt(formData.age_months) : null,
          is_vaccinated: formData.is_vaccinated === '' ? null : formData.is_vaccinated === 'true',
          diagnosis_code_id: formData.diagnosis_code_id || null
        })
      });

      if (res.ok) {
        setShowReportForm(false);
        setFormData({
          diagnosis_code_id: '',
          species: 'dog',
          age_months: '',
          is_vaccinated: '',
          location_zone: '',
          severity: 'moderate',
          reported_date: new Date().toISOString().split('T')[0]
        });
        fetchReports();
        fetchData();
      } else {
        const json = await res.json();
        alert(json.error || 'Error al crear reporte');
      }
    } catch (e) {
      console.error('Error submitting report:', e);
      alert('Error al crear reporte');
    } finally {
      setSubmitting(false);
    }
  };

  // Aggregate data for visualization
  const locationData = data.reduce((acc: { name: string; value: number }[], curr) => {
    const existing = acc.find(x => x.name === curr.location_zone);
    if (existing) {
      existing.value += curr.case_count;
    } else if (curr.location_zone) {
      acc.push({ name: curr.location_zone, value: curr.case_count });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 10);

  const diagnosisData = data.reduce((acc: { name: string; value: number }[], curr) => {
    const existing = acc.find(x => x.name === curr.diagnosis_name);
    if (existing) {
      existing.value += curr.case_count;
    } else if (curr.diagnosis_name) {
      acc.push({ name: curr.diagnosis_name, value: curr.case_count });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value).slice(0, 10);

  // Weekly trend data
  const weeklyTrend = data.reduce((acc: { week: string; cases: number }[], curr) => {
    const existing = acc.find(x => x.week === curr.week);
    if (existing) {
      existing.cases += curr.case_count;
    } else {
      acc.push({ week: curr.week, cases: curr.case_count });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

  const downloadCSV = () => {
    const headers = ['Diagnóstico', 'Especie', 'Zona', 'Semana', 'Casos', 'Severidad Promedio'];
    const rows = data.map(row => [
      row.diagnosis_name,
      row.species,
      row.location_zone,
      new Date(row.week).toLocaleDateString(),
      row.case_count,
      row.avg_severity.toFixed(1)
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_epidemiologico_${clinic}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCases = data.reduce((acc, curr) => acc + curr.case_count, 0);
  const severeCount = reports.filter(r => r.severity === 'severe').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Vigilancia Epidemiológica</h1>
          <p className="text-[var(--text-secondary)]">Monitoreo de brotes y enfermedades</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">Todas las Especies</option>
            <option value="dog">Perros</option>
            <option value="cat">Gatos</option>
          </select>

          <button
            onClick={() => { fetchData(); fetchReports(); }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>

          <button
            onClick={downloadCSV}
            className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>

          <button
            onClick={() => setShowReportForm(true)}
            className="bg-[var(--primary)] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Nuevo Reporte
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Resumen', icon: BarChart2 },
          { id: 'reports', label: 'Reportes', icon: FileText },
          { id: 'trends', label: 'Tendencias', icon: Activity }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-96 w-full bg-gray-100 rounded-2xl animate-pulse" />
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Total Casos (90d)</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{totalCases}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Casos Severos</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{severeCount}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Zona Crítica</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 truncate">{locationData[0]?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{locationData[0]?.value || 0} casos</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Bug className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Principal Diagnóstico</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 truncate">{diagnosisData[0]?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{diagnosisData[0]?.value || 0} casos</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-gray-400" />
                    Top Diagnósticos
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={diagnosisData} layout="vertical" margin={{ left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {diagnosisData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : 'var(--primary)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Map className="w-5 h-5 text-gray-400" />
                    Zonas con Mayor Incidencia
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationData} layout="vertical" margin={{ left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Diagnóstico</th>
                      <th className="p-4">Especie</th>
                      <th className="p-4">Edad</th>
                      <th className="p-4">Vacunado</th>
                      <th className="p-4">Zona</th>
                      <th className="p-4 text-center">Severidad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          No hay reportes registrados
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="p-4 font-mono text-gray-500">
                            {new Date(report.reported_date).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-medium text-gray-900">
                            {report.diagnosis?.term || '-'}
                          </td>
                          <td className="p-4 capitalize">
                            {report.species === 'dog' ? 'Perro' : report.species === 'cat' ? 'Gato' : report.species}
                          </td>
                          <td className="p-4">
                            {report.age_months ? `${report.age_months} meses` : '-'}
                          </td>
                          <td className="p-4">
                            {report.is_vaccinated === null ? '-' : report.is_vaccinated ? 'Sí' : 'No'}
                          </td>
                          <td className="p-4">{report.location_zone || '-'}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              report.severity === 'severe' ? 'bg-red-100 text-red-700' :
                              report.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {report.severity === 'severe' ? 'Severo' :
                               report.severity === 'moderate' ? 'Moderado' : 'Leve'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                Tendencia Semanal de Casos
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      tickFormatter={(val) => new Date(val).toLocaleDateString('es', { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      labelFormatter={(val) => `Semana del ${new Date(val).toLocaleDateString()}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cases"
                      name="Casos"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--primary)', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* New Report Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Nuevo Reporte de Enfermedad</h2>
              <p className="text-sm text-gray-500">Datos anonimizados para vigilancia epidemiológica</p>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
                <select
                  value={formData.diagnosis_code_id}
                  onChange={(e) => setFormData({ ...formData, diagnosis_code_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Seleccionar diagnóstico...</option>
                  {diagnosisCodes.map(dc => (
                    <option key={dc.id} value={dc.id}>{dc.code} - {dc.term}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="dog">Perro</option>
                    <option value="cat">Gato</option>
                    <option value="bird">Ave</option>
                    <option value="rabbit">Conejo</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severidad *</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="mild">Leve</option>
                    <option value="moderate">Moderado</option>
                    <option value="severe">Severo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad (meses)</label>
                  <input
                    type="number"
                    value={formData.age_months}
                    onChange={(e) => setFormData({ ...formData, age_months: e.target.value })}
                    placeholder="ej: 24"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vacunado</label>
                  <select
                    value={formData.is_vaccinated}
                    onChange={(e) => setFormData({ ...formData, is_vaccinated: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="">Desconocido</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona/Barrio</label>
                <input
                  type="text"
                  value={formData.location_zone}
                  onChange={(e) => setFormData({ ...formData, location_zone: e.target.value })}
                  placeholder="ej: Villa Morra, Asunción"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Reporte</label>
                <input
                  type="date"
                  value={formData.reported_date}
                  onChange={(e) => setFormData({ ...formData, reported_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Crear Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
