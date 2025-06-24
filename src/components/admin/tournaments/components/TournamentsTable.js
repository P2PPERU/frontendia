import React, { useState } from 'react';
import { 
  ChevronUp, ChevronDown, MoreVertical, Edit2, Trash2, Eye, 
  Play, Pause, Square, Users, Calendar, ExternalLink,
  CheckSquare, Square as SquareEmpty
} from 'lucide-react';
import { 
  TournamentStatusBadge, 
  TournamentTypeBadge, 
  OccupancyIndicator, 
  BuyInBadge, 
  PrizeBadge,
  TimeIndicator 
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
  showBulkActions = false
}) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Configuración de columnas
  const columns = [
    {
      key: 'select',
      label: '',
      width: '40px',
      sortable: false,
      render: (tournament) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectTournament && onSelectTournament(tournament.id);
          }}
          className="p-1 hover:bg-gray-100 rounded"
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
      render: (tournament) => (
        <div className="min-w-[200px]">
          <div className="font-medium text-gray-900 line-clamp-1">
            {tournament.featured && <span className="text-orange-500 mr-1">⭐</span>}
            {tournament.name}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            ID: {tournament.id}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (tournament) => (
        <TournamentStatusBadge status={tournament.status} />
      )
    },
    {
      key: 'type',
      label: 'Tipo',
      sortable: true,
      render: (tournament) => (
        <TournamentTypeBadge type={tournament.type} buyIn={tournament.buyIn} />
      )
    },
    {
      key: 'buyIn',
      label: 'Buy-in',
      sortable: true,
      render: (tournament) => (
        <BuyInBadge amount={tournament.buyIn} />
      )
    },
    {
      key: 'prizePool',
      label: 'Premio',
      sortable: true,
      render: (tournament) => (
        <PrizeBadge 
          amount={tournament.prizePool} 
          guaranteed={tournament.guaranteed}
        />
      )
    },
    {
      key: 'participants',
      label: 'Jugadores',
      sortable: true,
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
        </div>
      )
    },
    {
      key: 'startTime',
      label: 'Inicio',
      sortable: true,
      render: (tournament) => (
        <div className="min-w-[80px]">
          <TimeIndicator 
            date={tournament.startTime}
            label="inicio"
          />
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Creado',
      sortable: true,
      render: (tournament) => (
        <div className="text-sm text-gray-600">
          {new Date(tournament.createdAt).toLocaleDateString('es-PE', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '100px',
      sortable: false,
      render: (tournament) => (
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
            onView && onView(tournament);
            setActionMenuOpen(null);
          }}
          onStatusChange={(status) => {
            onStatusChange && onStatusChange(tournament.id, status);
            setActionMenuOpen(null);
          }}
        />
      )
    }
  ];

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
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
        column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
      }`}
      style={{ width: column.width }}
      onClick={() => column.sortable && handleSort(column.key)}
    >
      <div className="flex items-center gap-2">
        {column.label}
        {column.sortable && sortBy === column.key && (
          sortOrder === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  // Renderizar fila de torneo
  const renderTournamentRow = (tournament) => (
    <tr 
      key={tournament.id}
      className="hover:bg-gray-50 transition-colors"
    >
      {columns.map(column => (
        <td key={`${tournament.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
          {column.render(tournament)}
        </td>
      ))}
    </tr>
  );

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    Array.from({ length: 5 }).map((_, index) => (
      <tr key={`skeleton-${index}`}>
        {columns.map(column => (
          <td key={`skeleton-${index}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </td>
        ))}
      </tr>
    ))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header con selección masiva */}
      {showBulkActions && selectedTournaments.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedTournaments.length} torneo{selectedTournaments.length !== 1 ? 's' : ''} seleccionado{selectedTournaments.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Cambiar estado
              </button>
              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(renderColumnHeader)}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? renderLoadingSkeleton() : tournaments.map(renderTournamentRow)}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {!loading && tournaments.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
            🏆
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay torneos
          </h3>
          <p className="text-gray-500 mb-4">
            No se encontraron torneos que coincidan con los filtros aplicados
          </p>
        </div>
      )}
    </div>
  );
};

// Componente del menú de acciones
const ActionMenu = ({ 
  tournament, 
  isOpen, 
  onToggle, 
  onEdit, 
  onDelete, 
  onView, 
  onStatusChange 
}) => {
  const canEdit = ['UPCOMING', 'REGISTRATION'].includes(tournament.status);
  const canDelete = !['ACTIVE', 'FINISHED'].includes(tournament.status);
  const canStart = tournament.status === 'REGISTRATION';
  const canFinish = tournament.status === 'ACTIVE';
  const canCancel = ['UPCOMING', 'REGISTRATION'].includes(tournament.status);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-1 hover:bg-gray-100 rounded"
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
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px]">
            <div className="py-1">
              <button
                onClick={onView}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Ver detalles
              </button>

              {canEdit && (
                <button
                  onClick={onEdit}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              )}

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
                  Finalizar
                </button>
              )}

              {canCancel && (
                <button
                  onClick={() => onStatusChange('CANCELLED')}
                  className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Cancelar
                </button>
              )}

              {(canStart || canFinish || canCancel) && canDelete && (
                <div className="border-t border-gray-100 my-1" />
              )}

              {canDelete && (
                <button
                  onClick={onDelete}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TournamentsTable;