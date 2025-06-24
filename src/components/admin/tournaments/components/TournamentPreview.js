// src/components/admin/tournaments/components/TournamentPreview.js
import React from 'react';
import { 
  Trophy, Users, DollarSign, Calendar, Star, Lock, CheckCircle,
  Clock, Target, TrendingUp, Award, Zap
} from 'lucide-react';
import { TournamentStatusBadge, TournamentTypeBadge } from './TournamentBadges';
import PrizePoolDisplay from '../../../tournaments/PrizePoolDisplay';
import TournamentTimer from '../../../tournaments/TournamentTimer';

const TournamentPreview = ({ formSummary, className = '' }) => {
  const { basic, financial, participants, dates, prizes, access } = formSummary;
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Preview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{basic.name}</h2>
            <p className="text-blue-100 text-sm">{basic.description}</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <TournamentStatusBadge status="REGISTRATION" />
            {access.featured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <Zap className="w-3 h-3 mr-1" />
                Destacado
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{financial.currency} {financial.prizePool}</div>
            <div className="text-xs text-blue-100">Premio Total</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{participants.max}</div>
            <div className="text-xs text-blue-100">Máximo Jugadores</div>
          </div>
        </div>
      </div>

      {/* Detalles del Torneo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Información del Torneo</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tipo:</span>
              <TournamentTypeBadge type={basic.type} buyIn={financial.buyIn} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Deporte:</span>
              <span className="font-medium text-gray-800 capitalize">{basic.sport}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Dificultad:</span>
              <span className={`font-medium ${
                basic.difficulty === 'EASY' ? 'text-green-600' :
                basic.difficulty === 'MEDIUM' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {basic.difficulty === 'EASY' ? 'Fácil' :
                 basic.difficulty === 'MEDIUM' ? 'Medio' : 'Difícil'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Buy-in:</span>
              <span className="font-bold text-gray-800">
                {financial.buyIn === 0 ? 'GRATIS' : `${financial.currency} ${financial.buyIn}`}
              </span>
            </div>
          </div>
        </div>

        {/* Participantes y Fechas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Participantes y Fechas</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Participantes:</span>
              <span className="font-medium text-gray-800">
                {participants.min} - {participants.max}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Esperados:</span>
              <span className="font-medium text-blue-600">{participants.expected}</span>
            </div>
            
            {dates.registration && (
              <div>
                <span className="text-gray-600 text-sm">Registro hasta:</span>
                <div className="font-medium text-gray-800">
                  {new Date(dates.registration).toLocaleString('es-PE')}
                </div>
              </div>
            )}
            
            {dates.start && (
              <div>
                <span className="text-gray-600 text-sm">Inicia:</span>
                <div className="font-medium text-gray-800">
                  {new Date(dates.start).toLocaleString('es-PE')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premio y Distribución */}
      {financial.prizePool > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución de Premios</h3>
          
          {/* Resumen de premios */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{financial.currency} {financial.prizePool}</div>
              <div className="text-sm text-blue-800">Premio Total</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{prizes.positions}</div>
              <div className="text-sm text-green-800">Posiciones Premiadas</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className={`text-2xl font-bold ${
                prizes.totalPercentage === 100 ? 'text-purple-600' : 'text-red-600'
              }`}>
                {prizes.totalPercentage}%
              </div>
              <div className="text-sm text-purple-800">Total Distribuido</div>
            </div>
          </div>

          {/* Lista de premios */}
          <div className="space-y-3">
            {prizes.distribution.map((percentage, index) => {
              const amount = (financial.prizePool * percentage) / 100;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-amber-600' :
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">
                      {index === 0 ? 'Primer lugar' :
                       index === 1 ? 'Segundo lugar' :
                       index === 2 ? 'Tercer lugar' :
                       `${index + 1}° lugar`}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-gray-800">
                      {financial.currency} {amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Características Especiales */}
      {(access.featured || access.premium || financial.guaranteed || access.lateRegistration) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Características Especiales</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {access.featured && (
              <div className="flex items-center p-3 bg-orange-50 rounded-xl">
                <Zap className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <div className="font-medium text-orange-800">Torneo Destacado</div>
                  <div className="text-sm text-orange-600">Aparece en sección principal</div>
                </div>
              </div>
            )}
            
            {access.premium && (
              <div className="flex items-center p-3 bg-purple-50 rounded-xl">
                <Lock className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <div className="font-medium text-purple-800">Solo Premium</div>
                  <div className="text-sm text-purple-600">Requiere membresía premium</div>
                </div>
              </div>
            )}
            
            {financial.guaranteed && (
              <div className="flex items-center p-3 bg-green-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <div className="font-medium text-green-800">Premio Garantizado</div>
                  <div className="text-sm text-green-600">Se paga independientemente</div>
                </div>
              </div>
            )}
            
            {access.lateRegistration && (
              <div className="flex items-center p-3 bg-blue-50 rounded-xl">
                <Clock className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <div className="font-medium text-blue-800">Registro Tardío</div>
                  <div className="text-sm text-blue-600">Permitido después del inicio</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proyecciones Financieras */}
      {financial.projections && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Proyecciones Financieras</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {financial.currency} {financial.projections.expectedRevenue}
              </div>
              <div className="text-sm text-gray-400">Ingresos Esperados</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {financial.projections.rakePercentage}%
              </div>
              <div className="text-sm text-gray-400">Rake</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {financial.projections.firstPlaceRoi}%
              </div>
              <div className="text-sm text-gray-400">ROI 1er Lugar</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {financial.projections.breakEvenParticipants}
              </div>
              <div className="text-sm text-gray-400">Break Even</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentPreview;