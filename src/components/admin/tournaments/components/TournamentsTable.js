import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronUp, ChevronDown, MoreVertical, Edit2, Trash2, Eye, 
  Play, Pause, Square, Users, Calendar, ExternalLink, Crown,
  CheckSquare, Square as SquareEmpty, Clock, DollarSign,
  Star, Zap, Lock, Shield, AlertTriangle, TrendingUp,
  Copy, Download, Mail, Settings, BarChart3
} from 'lucide-react';
import { 
  TournamentStatusBadge, 
  TournamentTypeBadge, 
  OccupancyIndicator, 
  BuyInBadge, 
  PrizeBadge,
  TimeIndicator,
  TournamentFeatureBadge
} from './TournamentBadges';

const TournamentsTable = ({
  tournaments = [],
  loading = false,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSort,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  onSelectTournament,
  selectedTournaments = [],
  showBulkActions = false,
  showActions = true,
  compact = false,
  maxHeight = null
}) => {
  const navigate = useNavigate();
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Configuración de columnas adaptable
  const getColumns = () => {
    const baseColumns = [
      {
        key: 'select',
        label: '',
        width: '40px',
        sortable: false,
        visible: showBulkActions,
        render: (tournament) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectTournament && onSelectTournament(tournament.id);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={`Seleccionar torneo ${tournament.name}`}
          >
            {selectedTournaments.includes(tournament.id) ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <SquareEmpty className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )
      },
      {
        key: 'name',
        label: 'Torneo',
        sortable: true,
        minWidth: '200px',
        render: (tournament) => (
          <div className="min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              {tournament.featured && <Zap className="w-4 h-4 text-orange-500" />}
              {tournament.isHot && <span className="text-red-500">🔥</span>}
              {tournament.requiresPremium && <Lock className="w-4 h-4 text-purple-500" />}
              <span className="font-medium text-gray-900 line-clamp-1">
                {tournament.name}
              </span>
            </div>
            
            {!compact && (
              <div className="text-xs text-gray-500">
                ID: {tournament.id} • Creado: {new Date(tournament.createdAt).toLocaleDateString('es-PE')}
              </div>
            )}
            
            {/* Features badges */}
            <div className="flex flex-wrap gap-1 mt-1">
              {tournament.featured && (
                <TournamentFeatureBadge feature="featured" size="sm" />
              )}
              {tournament.requiresPremium && (
                <TournamentFeatureBadge feature="premium" size="sm" />
              )}
              {tournament.guaranteed && (
                <TournamentFeatureBadge feature="guaranteed" size="sm" />
              )}
            </div>
          </div>
        )
      },
      {
        key: 'status',
        label: 'Estado',
        sortable: true,
        width: '120px',
        render: (tournament) => (
          <div className="space-y-1">
            <TournamentStatusBadge status={tournament.status} />
            {tournament.status === 'REGISTRATION' && (
              <TimeIndicator 
                date={tournament.registrationDeadline}
                label="cierra"
              />
            )}
            {tournament.status === 'UPCOMING' && (
              <TimeIndicator 
                date={tournament.startTime}
                label="inicia"
              />
            )}
          </div>
        )
      },
      {
        key: 'type',
        label: 'Tipo',
        sortable: true,
        width: '100px',
        render: (tournament) => (
          <TournamentTypeBadge type={tournament.type} buyIn={tournament.buyIn} />
        )
      },
      {
        key: 'buyIn',
        label: 'Buy-in',
        sortable: true,
        width: '100px',
        render: (tournament) => (
          <BuyInBadge amount={tournament.buyIn} />
        )
      },
      {
        key: 'prizePool',
        label: 'Premio',
        sortable: true,
        width: '120px',
        render: (tournament) => (
          <div className="space-y-1">
            <PrizeBadge 
              amount={tournament.prizePool} 
              guaranteed={tournament.guaranteed}
            />
            {tournament.guaranteed && (
              <div className="text-xs text-green-600 font-medium">
                Garantizado
              </div>
            )}
          </div>
        )
      },
      {
        key: 'participants',
        label: 'Jugadores',
        sortable: true,
        width: '140px',
        render: (tournament) => (
          <div className="min-w-[120px]">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {tournament.currentPlayers}/{tournament.maxPlayers}
            </div>
            <OccupancyIndicator 
              current={tournament.currentPlayers}
              max={tournament.maxPlayers}
              showPercentage={false}
            />
            <div className="text-xs text-gray-500 mt-1">
              {tournament.spotsLeft} espacios libres
            </div>
          </div>
        )
      },
      {
        key: 'timeline',
        label: 'Cronograma',
        sortable: true,
        width: '150px',
        render: (tournament) => (
          <div className="min-w-[130px] space-y-1">
            <div className="text-xs text-gray-600">
              <Calendar className="w-3 h-3 inline mr-1" />
              Inicio: {new Date(tournament.startTime).toLocaleDateString('es-PE')}
            </div>
            <div className="text-xs text-gray-600">
              <Clock className="w-3 h-3 inline mr-1" />
              {new Date(tournament.startTime).toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {tournament.status === 'REGISTRATION' && (
              <div className="text-xs text-orange-600 font-medium">
                Reg. hasta: {new Date(tournament.registrationDeadline).toLocaleDateString('es-PE')}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'performance',
        label: 'Rendimiento',
        sortable: true,
        width: '120px',
        visible: !compact,
        render: (tournament) => (
          <div className="min-w-[100px] space-y-1">
            <div className="text-xs text-gray-600">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Ocupación: {tournament.occupancy || 0}%
            </div>
            <div className="text-xs text-gray-600">
              <DollarSign className="w-3 h-3 inline mr-1" />
              Recaudado: S/ {((tournament.buyIn || 0) * (tournament.currentPlayers || 0)).toFixed(0)}
            </div>
            {tournament.predictionsCount && (
              <div className="text-xs text-gray-600">
                <BarChart3 className="w-3 h-3 inline mr-1" />
                {tournament.predictionsCount} predicciones
              </div>
            )}
          </div>
        )
      },
      {
        key: 'actions',
        label: 'Acciones',
        width: '60px',
        sortable: false,
        visible: showActions,
        render: (tournament) => (
          <div className="flex items-center gap-1">
            {/* Botón Ver Detalles - PRINCIPAL */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(tournament);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalles del torneo"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Menú de acciones adicionales */}
            <ActionMenu
              tournament={tournament}
              isOpen={actionMenuOpen === tournament.id}
              onToggle={() => setActionMenuOpen(
                actionMenuOpen === tournament.id ? null : tournament.id
              )}
              onEdit={() => {
                onEdit && onEdit(tournament);
                setActionMenuOpen(null);
              }}
              onDelete={() => {
                onDelete && onDelete(tournament);
                setActionMenuOpen(null);
              }}
              onView={() => {
                handleViewDetails(tournament);
                setActionMenuOpen(null);
              }}
              onStatusChange={(status) => {
                onStatusChange && onStatusChange(tournament.id, status);
                setActionMenuOpen(null);
              }}
              onNavigate={navigate}
            />
          </div>
        )
      }
    ];

    return baseColumns.filter(col => col.visible !== false);
  };

  const columns = getColumns();

  // Manejar navegación a detalles
  const handleViewDetails = (tournament) => {
    console.log('🎯 Navegando a detalles del torneo:', tournament.id);
    navigate(`/admin/tournaments/${tournament.id}`);
  };

  // Manejar clic en fila
  const handleRowClick = (tournament) => {
    if (!compact) {
      handleViewDetails(tournament);
    }
  };

  // Manejar ordenamiento
  const handleSort = (columnKey) => {
    if (!onSort) return;
    
    const newSortOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newSortOrder);
  };

  // Renderizar header de columna
  const renderColumnHeader = (column) => (
    <th
      key={column.key}
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
        column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
      }`}
      style={{ 
        width: column.width,
        minWidth: column.minWidth 
      }}
      onClick={() => column.sortable && handleSort(column.key)}
    >
      <div className="flex items-center gap-2">
        {column.label}
        {column.sortable && sortBy === column.key && (
          <div className="flex flex-col">
            <ChevronUp className={`w-3 h-3 ${sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} />
            <ChevronDown className={`w-3 h-3 -mt-1 ${sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} />
          </div>
        )}
      </div>
    </th>
  );

  // Renderizar fila de torneo
  const renderTournamentRow = (tournament) => {
    const isSelected = selectedTournaments.includes(tournament.id);
    const isHovered = hoveredRow === tournament.id;
    
    return (
      <tr 
        key={tournament.id}
        className={`transition-all duration-150 ${
          isSelected ? 'bg-blue-50 border-blue-200' : 
          isHovered ? 'bg-gray-50' : 'hover:bg-gray-50'
        } ${!compact ? 'cursor-pointer' : ''} border-b border-gray-100`}
        onClick={() => handleRowClick(tournament)}
        onMouseEnter={() => setHoveredRow(tournament.id)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        {columns.map(column => (
          <td 
            key={`${tournament.id}-${column.key}`} 
            className={`px-4 py-4 ${column.key === 'actions' ? '' : 'whitespace-nowrap'}`}
            onClick={(e) => {
              // Prevenir navegación en acciones
              if (column.key === 'actions' || column.key === 'select') {
                e.stopPropagation();
              }
            }}
          >
            {column.render(tournament)}
          </td>
        ))}
      </tr>
    );
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    Array.from({ length: compact ? 3 : 5 }).map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        {columns.map(column => (
          <td key={`skeleton-${index}-${column.key}`} className="px-4 py-4 whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </td>
        ))}
      </tr>
    ))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header con acciones masivas */}
      {showBulkActions && selectedTournaments.length > 0 && (
        <BulkActionsHeader 
          selectedCount={selectedTournaments.length}
          onClearSelection={() => onSelectTournament && onSelectTournament([])}
        />
      )}

      {/* Tabla */}
      <div 
        className="overflow-x-auto"
        style={{ maxHeight: maxHeight }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map(renderColumnHeader)}
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading ? (
              renderLoadingSkeleton()
            ) : tournaments.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <EmptyState />
                </td>
              </tr>
            ) : (
              tournaments.map(renderTournamentRow)
            )}
          </tbody>
        </table>
      </div>

      {/* Footer con información */}
      {!loading && tournaments.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {tournaments.length} torneo{tournaments.length !== 1 ? 's' : ''}
            </span>
            
            <div className="flex items-center gap-4">
              {selectedTournaments.length > 0 && (
                <span className="text-blue-600 font-medium">
                  {selectedTournaments.length} seleccionado{selectedTournaments.length !== 1 ? 's' : ''}
                </span>
              )}
              
              <span>
                Total de premios: S/ {tournaments.reduce((sum, t) => sum + (Number(t.prizePool) || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de header para acciones masivas
const BulkActionsHeader = ({ selectedCount, onClearSelection }) => (
  <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-blue-800">
          {selectedCount} torneo{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
        </span>
        
        <button
          onClick={onClearSelection}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Limpiar selección
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1">
          <Edit2 className="w-3 h-3" />
          Editar en lote
        </button>
        
        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1">
          <Download className="w-3 h-3" />
          Exportar
        </button>
        
        <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors flex items-center gap-1">
          <Settings className="w-3 h-3" />
          Cambiar estado
        </button>
        
        <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1">
          <Trash2 className="w-3 h-3" />
          Eliminar
        </button>
      </div>
    </div>
  </div>
);

// Componente del menú de acciones
const ActionMenu = ({ 
  tournament, 
  isOpen, 
  onToggle, 
  onEdit, 
  onDelete, 
  onView, 
  onStatusChange,
  onNavigate
}) => {
  const canEdit = ['UPCOMING', 'REGISTRATION'].includes(tournament.status);
  const canDelete = tournament.currentPlayers === 0;
  const canStart = tournament.status === 'REGISTRATION' && tournament.currentPlayers >= 2;
  const canFinish = tournament.status === 'ACTIVE';
  const canCancel = ['UPCOMING', 'REGISTRATION'].includes(tournament.status);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Más acciones"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-10"
            onClick={onToggle}
          />
          
          {/* Menú */}
          <div className="absolute right-0 top-10 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] py-1">
            {/* Ver detalles */}
            <button
              onClick={onView}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Ver detalles completos
            </button>

            {/* Acciones principales */}
            <div className="border-t border-gray-100 my-1" />

            {canEdit && (
              <button
                onClick={onEdit}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar torneo
              </button>
            )}

            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/tournaments/${tournament.id}`);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar enlace
            </button>

            {/* Navegación rápida */}
            <div className="border-t border-gray-100 my-1" />
            
            <button
              onClick={() => {
                onNavigate(`/admin/tournaments/${tournament.id}/participants`);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Ver participantes ({tournament.currentPlayers})
            </button>

            <button
              onClick={() => {
                onNavigate(`/admin/tournaments/${tournament.id}/predictions`);
                onToggle();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Gestionar predicciones
            </button>

            {/* Cambios de estado */}
            {(canStart || canFinish || canCancel) && (
              <>
                <div className="border-t border-gray-100 my-1" />

                {canStart && (
                  <button
                    onClick={() => onStatusChange('ACTIVE')}
                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Iniciar torneo
                  </button>
                )}

                {canFinish && (
                  <button
                    onClick={() => onStatusChange('FINISHED')}
                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Finalizar torneo
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={() => onStatusChange('CANCELLED')}
                    className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Cancelar torneo
                  </button>
                )}
              </>
            )}

            {/* Acciones peligrosas */}
            {canDelete && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={onDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar torneo
                </button>
              </>
            )}

            {!canDelete && tournament.currentPlayers > 0 && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <div className="px-4 py-2 text-xs text-gray-500 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  No se puede eliminar con participantes
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Componente de estado vacío
const EmptyState = () => (
  <div className="text-center py-8">
    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
      🏆
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No hay torneos
    </h3>
    <p className="text-gray-500 mb-4">
      No se encontraron torneos que coincidan con los filtros aplicados
    </p>
    <button
      onClick={() => window.location.reload()}
      className="text-blue-600 font-medium hover:underline"
    >
      Actualizar lista
    </button>
  </div>
);

export default TournamentsTable;