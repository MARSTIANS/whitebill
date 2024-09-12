import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSunday } from 'date-fns';

const PrintableCalendar = ({ events, currentDate, clientName }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day) => {
    return events.filter(
      (event) =>
        new Date(event.start).toDateString() === day.toDateString() ||
        (new Date(event.start) <= day && new Date(event.end) >= day)
    );
  };

  return (
    <div className="printable-calendar">
      <h1 className="text-center font-bold text-2xl mb-4">
        {format(currentDate, 'MMMM yyyy')} {clientName ? `- ${clientName}` : ''}
      </h1>
      <table className="table-auto border-collapse border border-gray-800 w-full text-black">
        <thead>
          <tr>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <th key={day} className="border border-gray-800 p-2 text-left">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
            <tr key={weekIndex}>
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day) => (
                <td key={day.toISOString()} className="border border-gray-800 p-4 align-top">
                  {isSameMonth(day, monthStart) && (
                    <>
                      <div className="font-bold mb-2">{format(day, 'd')}</div>
                      <div className="space-y-1">
                        {getEventsForDay(day).map((event) => (
                          <div key={event.id} className="text-sm">
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              ))}
              {weekIndex === 0 && !isSunday(monthStart) && (
                <td colSpan={isSunday(monthStart) ? 0 : 7 - days.length % 7} />
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrintableCalendar;
