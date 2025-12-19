'use client';

import { useState, useEffect } from 'react';
import {
  Phone, Save, Send, CheckCircle, XCircle, AlertTriangle,
  Settings, BarChart2, RefreshCw, ExternalLink
} from 'lucide-react';

interface SmsConfig {
  configured: boolean;
  provider: string;
  from_number: string | null;
  api_key_set: boolean;
  api_secret_set: boolean;
}

interface SmsStats {
  stats: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    total_cost: number;
  };
  daily: Array<{ date: string; count: number }>;
}

interface Props {
  clinic: string;
  userPhone: string | null;
}

export default function SmsSettings({ clinic, userPhone }: Props) {
  const [config, setConfig] = useState<SmsConfig | null>(null);
  const [stats, setStats] = useState<SmsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'stats'>('config');

  // Form state
  const [formData, setFormData] = useState({
    sms_api_key: '',
    sms_api_secret: '',
    sms_from: '',
    test_phone: userPhone || ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, statsRes] = await Promise.all([
        fetch('/api/sms/config'),
        fetch('/api/sms?view=stats&days=30')
      ]);

      if (configRes.ok) {
        setConfig(await configRes.json());
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/sms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sms_api_key: formData.sms_api_key || undefined,
          sms_api_secret: formData.sms_api_secret || undefined,
          sms_from: formData.sms_from || undefined
        })
      });

      const json = await res.json();

      if (res.ok) {
        setTestResult({
          success: true,
          message: json.warning || 'Configuración guardada correctamente'
        });
        fetchData();
        setFormData({ ...formData, sms_api_key: '', sms_api_secret: '' });
      } else {
        setTestResult({ success: false, message: json.error });
      }
    } catch (e) {
      setTestResult({ success: false, message: 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/sms/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_phone: formData.test_phone })
      });

      const json = await res.json();

      setTestResult({
        success: res.ok,
        message: json.message || json.error
      });
    } catch (e) {
      setTestResult({ success: false, message: 'Error al enviar prueba' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Configuración de SMS</h1>
          <p className="text-[var(--text-secondary)]">Integración con Twilio para envío de mensajes</p>
        </div>

        <div className="flex items-center gap-3">
          {config?.configured ? (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Configurado
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              No configurado
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          Configuración
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Estadísticas
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      ) : (
        <>
          {/* Config Tab */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Twilio Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <h3 className="font-bold text-blue-900 mb-2">Acerca de Twilio</h3>
                <p className="text-blue-700 text-sm mb-4">
                  VetePy usa Twilio para enviar mensajes SMS. Necesitarás una cuenta de Twilio
                  con un número de teléfono habilitado para SMS.
                </p>
                <a
                  href="https://www.twilio.com/console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium text-sm"
                >
                  Ir a Twilio Console
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Current Config */}
              {config?.configured && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Configuración Actual</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Proveedor</span>
                      <p className="font-medium">{config.provider}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Número de envío</span>
                      <p className="font-mono">{config.from_number || 'No configurado'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">API Key</span>
                      <p className="font-mono">{config.api_key_set ? '••••••••' : 'No configurado'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">API Secret</span>
                      <p className="font-mono">{config.api_secret_set ? '••••••••' : 'No configurado'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Config Form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  {config?.configured ? 'Actualizar Credenciales' : 'Configurar Twilio'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account SID
                    </label>
                    <input
                      type="text"
                      value={formData.sms_api_key}
                      onChange={(e) => setFormData({ ...formData, sms_api_key: e.target.value })}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Encontrado en Twilio Console</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Auth Token
                    </label>
                    <input
                      type="password"
                      value={formData.sms_api_secret}
                      onChange={(e) => setFormData({ ...formData, sms_api_secret: e.target.value })}
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Twilio (From)
                    </label>
                    <input
                      type="tel"
                      value={formData.sms_from}
                      onChange={(e) => setFormData({ ...formData, sms_from: e.target.value })}
                      placeholder="+1234567890"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Número de teléfono de Twilio en formato E.164</p>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                </div>
              </div>

              {/* Test SMS */}
              {config?.configured && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Enviar SMS de Prueba</h3>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={formData.test_phone}
                        onChange={(e) => setFormData({ ...formData, test_phone: e.target.value })}
                        placeholder="0981 123 456"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                    <button
                      onClick={handleTest}
                      disabled={testing || !formData.test_phone}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {testing ? 'Enviando...' : 'Enviar Prueba'}
                    </button>
                  </div>
                </div>
              )}

              {/* Result Message */}
              {testResult && (
                <div className={`rounded-2xl p-4 flex items-center gap-3 ${
                  testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Total (30d)</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stats.stats.total}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Entregados</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{stats.stats.delivered}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Fallidos</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600">{stats.stats.failed}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <BarChart2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-500 text-sm font-medium">Tasa Éxito</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.stats.total > 0
                      ? Math.round((stats.stats.delivered / stats.stats.total) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              {/* Daily Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">Mensajes por Día (últimos 30 días)</h3>
                {stats.daily.length > 0 ? (
                  <div className="h-48 flex items-end gap-1">
                    {stats.daily.slice(-30).map((day, i) => {
                      const maxCount = Math.max(...stats.daily.map(d => d.count));
                      const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-[var(--primary)] rounded-t opacity-80 hover:opacity-100 transition-opacity"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${day.date}: ${day.count} mensajes`}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No hay datos para mostrar
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
