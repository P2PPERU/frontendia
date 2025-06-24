import React, { useState } from 'react';
import { Search, Filter, Calendar, DollarSign, X, ChevronDown } from 'lucide-react';

const TournamentFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Opciones de filtros
  const statusOptions = [
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'UPCOMING', label: 'Próximos' },
    { value: 'REGISTRATION', label: 'En Registro' },
    { value: 'ACTIVE', label: 'En Vivo' },
    { value: 'FINISHED', label: 'Finalizados' },
    { value: 'CANCELLED', label: 'Cancelados' }
  ];

  const typeOptions = [
    { value: 'ALL', label: 'Todos los tipos' },
    { value: 'FREEROLL', label: 'Gratis' },
    { value: 'PAID', label: 'Pagados' },
    { value: 'FEATURED', label: 'Destacados' },
    { value: 'PREMIUM', label: 'Solo Premium' },
    { value: 'GUARANTEED', label: 'Garantizados' },
    { value: 'SATELLITE', label: 'Satélites' }
  ];

  const buyInRanges = [
    { value: '', label: 'Cualquier buy-in' },
    { value: '0-0', label: 'Gratis (S/ 0)' },
    { value: '1-10', label: 'S/ 1 - S/ 10' },
    { value: '11-25', label: 'S/ 11 - S/ 25' },
    { value: '26-50', label: 'S/ 26 - S/ 50' },
    { value: '51-100', label: 'S/ 51 - S/ 100' },
    { value: '101-999', label: 'S/ 100+' }
  ];

  // Manejar cambio de filtro
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Manejar rangos de buy-in
    if (key === 'buyInRange' && value) {
      const [min, max] = value.split('-').map(Number);
      newFilters.minBuyIn = min;
      newFilters.maxBuyIn = max === 999 ? undefined : max;
      delete newFilters.buyInRange;
    }
    
    onFiltersChange(newFilters);
  };

  // Limpiar todos los filtros
  const handleClearAll = () => {
    onClearFilters();
    setShowAdvanced(false);
  };

  // Contar filtros activos
  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key] && filters[key] !== 'ALL' && filters[key] !== ''
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      {/* Filtros básicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar torneos..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
        </div>

        {/* Estado */}
        <select
          value={filters.status || 'ALL'}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          disabled={loading}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Tipo */}
        <select
          value={filters.type || 'ALL'}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          disabled={loading}
        >
          {typeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Buy-in Range */}
        <select
          value={filters.buyInRange || ''}
          onChange={(e) => handleFilterChange('buyInRange', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          disabled={loading}
        >
          {buyInRanges.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fecha inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio desde:
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Fecha fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio hasta:
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Buy-in personalizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buy-in específico:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minBuyIn || ''}
                  onChange={(e) => handleFilterChange('minBuyIn', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxBuyIn || ''}
                  onChange={(e) => handleFilterChange('maxBuyIn', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.featured || false}
                onChange={(e) => handleFilterChange('featured', e.target.checked || undefined)}
                className="mr-2 rounded"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Solo destacados</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.requiresPremium || false}
                onChange={(e) => handleFilterChange('requiresPremium', e.target.checked || undefined)}
                className="mr-2 rounded"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Solo premium</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.guaranteed || false}
                onChange={(e) => handleFilterChange('guaranteed', e.target.checked || undefined)}
                className="mr-2 rounded"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Solo garantizados</span>
            </label>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            <Filter className="w-4 h-4" />
            Filtros avanzados
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {activeFiltersCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors"
            disabled={loading}
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default TournamentFilters;