import moment from "moment";
import { useState } from "react";

export const CPCalendar = () => {
    const [currentStartOfWeek, setCurrentStartOfWeek] = useState(
        moment().startOf("week"),
    );
    const days = Array.from({ length: 7 }, (_, i) =>
        currentStartOfWeek.clone().add(i, "days"),
    );

    const handlePreviousWeek = () => {
        setCurrentStartOfWeek(currentStartOfWeek.clone().subtract(1, "week"));
    };

    const handleNextWeek = () => {
        setCurrentStartOfWeek(currentStartOfWeek.clone().add(1, "week"));
    };

    const handlePreviousMonth = () => {
        setCurrentStartOfWeek(currentStartOfWeek.clone().subtract(1, "month"));
    };

    const handleNextMonth = () => {
        setCurrentStartOfWeek(currentStartOfWeek.clone().add(1, "month"));
    };

    const today = moment();

    return (
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl shadow-lg border border-white/10 p-6 max-w-2xl mx-auto">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        onClick={handlePreviousMonth}
                        title="Previous Month"
                    >
                        &lt;&lt;
                    </button>
                    <button
                        className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        onClick={handlePreviousWeek}
                        title="Previous Week"
                    >
                        &lt;
                    </button>
                </div>
                <div className="text-white text-lg font-bold tracking-wide">
                    {currentStartOfWeek.format("MMMM YYYY")}
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        onClick={handleNextWeek}
                        title="Next Week"
                    >
                        &gt;
                    </button>
                    <button
                        className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        onClick={handleNextMonth}
                        title="Next Month"
                    >
                        &gt;&gt;
                    </button>
                </div>
            </div>
            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {days.map((day) => (
                    <div
                        key={day.format("dd")}
                        className="text-center text-xs font-semibold text-white/60 tracking-wide uppercase"
                    >
                        {day.format("ddd")}
                    </div>
                ))}
            </div>
            {/* Dates */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                    const isToday = day.isSame(today, "day");
                    return (
                        <div
                            key={day.format("YYYY-MM-DD")}
                            className={`flex items-center justify-center h-16 rounded-xl border transition-all
                                ${isToday
                                    ? "bg-gradient-to-br from-orange-500/80 to-orange-400/80 border-orange-400 text-white font-bold shadow-lg"
                                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"}
                            `}
                        >
                            <span className="text-lg select-none">
                                {day.format("D")}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
