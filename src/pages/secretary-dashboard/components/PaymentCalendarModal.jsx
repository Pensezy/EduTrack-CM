import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import paymentService from '../../../services/paymentService';

export const PaymentCalendarModal = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' ou 'week'

  useEffect(() => {
    if (isOpen) {
      loadPayments();
    }
  }, [isOpen, currentDate]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentService.getAllPayments();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Erreur chargement paiements:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getPaymentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return payments.filter(payment => {
      const paymentDate = new Date(payment.dueDate).toISOString().split('T')[0];
      return paymentDate === dateStr;
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      partial: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: CheckCircle,
      pending: Clock,
      overdue: AlertTriangle,
      partial: Clock
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-3 h-3" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (!isOpen) return null;

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendrier des Échéances de Paiement
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Aujourd'hui
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Calendar Grid */}
          <div className="flex-1 p-4">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Chargement du calendrier...</span>
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {dayNames.map(day => (
                  <div key={day} className="text-center font-medium text-gray-700 py-2 text-sm">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {days.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = day.getTime() === today.getTime();
                  const dayPayments = getPaymentsForDate(day);
                  const isSelected = selectedDate && day.getTime() === selectedDate.getTime();

                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-1 border border-gray-200 cursor-pointer
                        hover:bg-gray-50 transition-colors
                        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                        ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      `}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${isToday ? 'text-blue-600' : ''}
                      `}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayPayments.slice(0, 3).map((payment, idx) => (
                          <div
                            key={idx}
                            className={`
                              text-xs p-1 rounded border
                              ${getStatusColor(payment.status)}
                              truncate
                            `}
                            title={`${payment.student.firstName} ${payment.student.lastName} - ${formatCurrency(payment.totalAmount)}`}
                          >
                            <div className="flex items-center gap-1">
                              {getStatusIcon(payment.status)}
                              <span className="truncate">
                                {payment.student.firstName} {payment.student.lastName}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {dayPayments.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayPayments.length - 3} autres
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Details */}
          {selectedDate && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <h3 className="font-medium text-gray-900 mb-3">
                Paiements du {selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>

              {(() => {
                const dayPayments = getPaymentsForDate(selectedDate);
                
                if (dayPayments.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Aucun paiement prévu</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {dayPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className={`
                          p-3 rounded-lg border
                          ${getStatusColor(payment.status)}
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              {payment.student.firstName} {payment.student.lastName}
                            </p>
                            <p className="text-xs opacity-75">
                              {payment.student.class} • {payment.student.studentId}
                            </p>
                          </div>
                          {getStatusIcon(payment.status)}
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="font-medium">{payment.feeType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Montant:</span>
                            <span className="font-medium">{formatCurrency(payment.totalAmount)}</span>
                          </div>
                          {payment.amountPaid > 0 && (
                            <div className="flex justify-between">
                              <span>Payé:</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(payment.amountPaid)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Statut:</span>
                            <span className="font-medium">
                              {payment.status === 'completed' ? 'Payé' :
                               payment.status === 'pending' ? 'En attente' :
                               payment.status === 'overdue' ? 'En retard' : 'Partiel'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                          <p className="text-xs">
                            <span className="font-medium">Parent:</span> {payment.student.parentName}
                          </p>
                          {payment.student.parentPhone && (
                            <p className="text-xs">
                              <span className="font-medium">Tél:</span> {payment.student.parentPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer avec légende */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                <span>Payé</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                <span>En attente</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                <span>En retard</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                <span>Partiel</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Cliquez sur une date pour voir les détails
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCalendarModal;