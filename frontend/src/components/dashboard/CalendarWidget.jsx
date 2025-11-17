import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function CalendarWidget({ events = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const hasEvent = (day) => {
        return events.some(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={previousMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <FiChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <h3 className="text-lg font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>

                <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <FiChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-5 gap-2 mb-3">
                {daysOfWeek.map((day) => (
                    <div key={day} className="text-center">
                        <span className="text-xs font-medium text-gray-500">{day}</span>
                    </div>
                ))}
            </div>

            {/* Calendar days (simplified - showing only 5 days) */}
            <div className="grid grid-cols-5 gap-2">
                {[17, 18, 19, 20, 21].map((day) => {
                    const isSelected = day === selectedDate;
                    const isToday = day === new Date().getDate() &&
                        currentDate.getMonth() === new Date().getMonth();

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDate(day)}
                            className={`
                aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all
                ${isSelected
                                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                                    : isToday
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'hover:bg-gray-100 text-gray-700'
                                }
              `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}