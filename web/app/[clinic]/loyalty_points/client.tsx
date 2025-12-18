"use client";
import { useEffect, useState, useMemo } from 'react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Award, Plus, Search, Edit2, Trash2, X, ChevronUp, ChevronDown, Star, User, Gift, TrendingUp } from 'lucide-react';

interface LoyaltyPoint {
  id: string;
  profile_id: string;
  profile_name?: string;
  profile_email?: string;
  points: number;
  lifetime_points?: number;
  tier?: 'bronce' | 'plata' | 'oro' | 'platino';
  updated_at?: string;
}

type SortField = 'profile_name' | 'points' | 'tier' | 'updated_at';
type SortDirection = 'asc' | 'desc';

const TIER_CONFIG = {
  bronce: { label: 'Bronce', color: 'bg-amber-100 text-amber-700', minPoints: 0 },
  plata: { label: 'Plata', color: 'bg-gray-200 text-gray-700', minPoints: 500 },
  oro: { label: 'Oro', color: 'bg-yellow-100 text-yellow-700', minPoints: 1500 },
  platino: { label: 'Platino', color: 'bg-purple-100 text-purple-700', minPoints: 5000 },
};

export default function LoyaltyPointsClient() {
  const { user, loading } = useAuthRedirect();
  const [points, setPoints] = useState<LoyaltyPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState<LoyaltyPoint | null>(null);

  // Form states
  const [formProfileId, setFormProfileId] = useState('');
  const [formPoints, setFormPoints] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const fetchPoints = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/loyalty_points');
      if (res.ok) {
        const data = await res.json();
        setPoints(data);
      }
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchPoints();
    }
  }, [loading, user]);

  // Calculate tier based on lifetime points
  const calculateTier = (lifetimePoints: number): 'bronce' | 'plata' | 'oro' | 'platino' => {
    if (lifetimePoints >= 5000) return 'platino';
    if (lifetimePoints >= 1500) return 'oro';
    if (lifetimePoints >= 500) return 'plata';
    return 'bronce';
  };

  // Filter and sort
  const filteredPoints = useMemo(() => {
    let result = [...points];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.profile_name?.toLowerCase().includes(term) ||
        p.profile_email?.toLowerCase().includes(term) ||
        p.profile_id.toLowerCase().includes(term)
      );
    }

    // Tier filter
    if (tierFilter !== 'all') {
      result = result.filter(p => {
        const tier = p.tier || calculateTier(p.lifetime_points || p.points);
        return tier === tierFilter;
      });
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'profile_name') {
        comparison = (a.profile_name || '').localeCompare(b.profile_name || '');
      } else if (sortField === 'points') {
        comparison = a.points - b.points;
      } else if (sortField === 'tier') {
        const tierOrder = { bronce: 1, plata: 2, oro: 3, platino: 4 };
        const tierA = a.tier || calculateTier(a.lifetime_points || a.points);
        const tierB = b.tier || calculateTier(b.lifetime_points || b.points);
        comparison = (tierOrder[tierA] || 0) - (tierOrder[tierB] || 0);
      } else if (sortField === 'updated_at') {
        comparison = new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [points, searchTerm, tierFilter, sortField, sortDirection]);

  // Stats
  const stats = useMemo(() => {
    const total = points.length;
    const totalPoints = points.reduce((sum, p) => sum + p.points, 0);
    const tiers = {
      platino: points.filter(p => (p.tier || calculateTier(p.lifetime_points || p.points)) === 'platino').length,
      oro: points.filter(p => (p.tier || calculateTier(p.lifetime_points || p.points)) === 'oro').length,
      plata: points.filter(p => (p.tier || calculateTier(p.lifetime_points || p.points)) === 'plata').length,
      bronce: points.filter(p => (p.tier || calculateTier(p.lifetime_points || p.points)) === 'bronce').length,
    };
    return { total, totalPoints, tiers };
  }, [points]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4 inline ml-1" /> :
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const resetForm = () => {
    setFormProfileId('');
    setFormPoints('');
    setAdjustmentAmount('');
    setAdjustmentType('add');
    setAdjustmentReason('');
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (point: LoyaltyPoint) => {
    setEditingPoint(point);
    setFormProfileId(point.profile_id);
    setFormPoints(point.points.toString());
    setShowEditModal(true);
  };

  const openAdjustModal = (point: LoyaltyPoint) => {
    setEditingPoint(point);
    setAdjustmentAmount('');
    setAdjustmentType('add');
    setAdjustmentReason('');
    setShowAdjustModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { profile_id: formProfileId, points: Number(formPoints) };
    const res = await fetch('/api/loyalty_points', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowAddModal(false);
      resetForm();
      fetchPoints();
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoint) return;

    const payload = {
      id: editingPoint.id,
      profile_id: formProfileId,
      points: Number(formPoints)
    };
    const res = await fetch('/api/loyalty_points', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowEditModal(false);
      setEditingPoint(null);
      resetForm();
      fetchPoints();
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoint) return;

    const amount = Number(adjustmentAmount);
    const newPoints = adjustmentType === 'add'
      ? editingPoint.points + amount
      : Math.max(0, editingPoint.points - amount);

    const payload = {
      id: editingPoint.id,
      profile_id: editingPoint.profile_id,
      points: newPoints
    };
    const res = await fetch('/api/loyalty_points', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowAdjustModal(false);
      setEditingPoint(null);
      resetForm();
      fetchPoints();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro de puntos?')) return;

    await fetch('/api/loyalty_points', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchPoints();
  };

  const getTierBadge = (point: LoyaltyPoint) => {
    const tier = point.tier || calculateTier(point.lifetime_points || point.points);
    const config = TIER_CONFIG[tier];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)]">
        <div className="bg-gradient-to-br from-amber-500 to-yellow-500 h-64 animate-pulse" />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-500 to-yellow-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Award className="w-8 h-8" />
            </div>
            <span className="px-4 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              Programa de Fidelidad
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Puntos de Lealtad
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Gestiona el programa de recompensas de tus clientes. Premia su fidelidad y aumenta la retención.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <User className="w-5 h-5" />
              <span>{stats.total} miembros</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Star className="w-5 h-5" />
              <span>{stats.totalPoints.toLocaleString()} pts totales</span>
            </div>
            {stats.tiers.platino > 0 && (
              <div className="flex items-center gap-2 bg-purple-600/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <Gift className="w-5 h-5" />
                <span>{stats.tiers.platino} Platino</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                aria-label="Filtrar por nivel"
              >
                <option value="all">Todos los niveles</option>
                <option value="platino">Platino</option>
                <option value="oro">Oro</option>
                <option value="plata">Plata</option>
                <option value="bronce">Bronce</option>
              </select>

              {/* Add Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                aria-label="Agregar nuevo miembro al programa de fidelidad"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Agregar Miembro</span>
              </button>
            </div>
          </div>

          {/* Active filters info */}
          {(searchTerm || tierFilter !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <span>Mostrando {filteredPoints.length} de {points.length} miembros</span>
              <button
                onClick={() => { setSearchTerm(''); setTierFilter('all'); }}
                className="text-amber-600 hover:underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredPoints.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {searchTerm || tierFilter !== 'all' ? 'No se encontraron miembros' : 'Sin miembros en el programa'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || tierFilter !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros.'
                : 'Comienza agregando clientes al programa de fidelidad.'}
            </p>
            {!searchTerm && tierFilter === 'all' && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Primer Miembro
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('profile_name')}
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Cliente
                        <SortIcon field="profile_name" />
                      </span>
                    </th>
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('tier')}
                    >
                      <span className="flex items-center gap-2">
                        Nivel
                        <SortIcon field="tier" />
                      </span>
                    </th>
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('points')}
                    >
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Puntos
                        <SortIcon field="points" />
                      </span>
                    </th>
                    <th
                      className="text-left p-4 font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('updated_at')}
                    >
                      <span className="flex items-center gap-2">
                        Actualizado
                        <SortIcon field="updated_at" />
                      </span>
                    </th>
                    <th className="text-right p-4 font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPoints.map((point, index) => (
                    <tr
                      key={point.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {point.profile_name || 'Cliente'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {point.profile_email || point.profile_id}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getTierBadge(point)}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-amber-600 text-lg">
                          {point.points.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm ml-1">pts</span>
                      </td>
                      <td className="p-4 text-gray-500 text-sm">
                        {point.updated_at ? new Date(point.updated_at).toLocaleDateString('es-PY', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openAdjustModal(point)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            aria-label={`Ajustar puntos de ${point.profile_name || 'cliente'}`}
                            title="Ajustar puntos"
                          >
                            <TrendingUp className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(point)}
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            aria-label={`Editar puntos de ${point.profile_name || 'cliente'}`}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(point.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Eliminar puntos de ${point.profile_name || 'cliente'}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tier Info */}
        <div className="mt-8 grid md:grid-cols-4 gap-4">
          {Object.entries(TIER_CONFIG).map(([key, config]) => (
            <div key={key} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-4 h-4 rounded-full ${config.color.split(' ')[0]}`} />
                <span className="font-bold text-gray-900">{config.label}</span>
              </div>
              <p className="text-sm text-gray-600">
                {config.minPoints === 0 ? 'Nivel inicial' : `Desde ${config.minPoints.toLocaleString()} pts`}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.tiers[key as keyof typeof stats.tiers]}
                <span className="text-sm font-normal text-gray-500 ml-1">miembros</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 bg-amber-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Agregar Miembro</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ID de Perfil *</label>
                <input
                  type="text"
                  value={formProfileId}
                  onChange={(e) => setFormProfileId(e.target.value)}
                  placeholder="UUID del perfil"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Puntos Iniciales *</label>
                <input
                  type="number"
                  value={formPoints}
                  onChange={(e) => setFormPoints(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPoint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 bg-amber-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Edit2 className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Editar Puntos</h2>
                </div>
                <button
                  onClick={() => { setShowEditModal(false); setEditingPoint(null); }}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ID de Perfil *</label>
                <input
                  type="text"
                  value={formProfileId}
                  onChange={(e) => setFormProfileId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Puntos Totales *</label>
                <input
                  type="number"
                  value={formPoints}
                  onChange={(e) => setFormPoints(e.target.value)}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingPoint(null); }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {showAdjustModal && editingPoint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Ajustar Puntos</h2>
                </div>
                <button
                  onClick={() => { setShowAdjustModal(false); setEditingPoint(null); }}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">Puntos actuales:</p>
                <p className="text-2xl font-bold text-amber-600">{editingPoint.points.toLocaleString()} pts</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo de Ajuste *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('add')}
                    className={`px-4 py-3 rounded-xl font-bold transition-colors ${
                      adjustmentType === 'add'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    + Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('subtract')}
                    className={`px-4 py-3 rounded-xl font-bold transition-colors ${
                      adjustmentType === 'subtract'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    - Restar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad *</label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Motivo (opcional)</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Ej: Compra, canje, promoción..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {adjustmentAmount && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-600">Nuevo saldo:</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {(adjustmentType === 'add'
                      ? editingPoint.points + Number(adjustmentAmount)
                      : Math.max(0, editingPoint.points - Number(adjustmentAmount))
                    ).toLocaleString()} pts
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAdjustModal(false); setEditingPoint(null); }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
