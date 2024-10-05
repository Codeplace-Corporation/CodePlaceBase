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

    return <div></div>;
};
