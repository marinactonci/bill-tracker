"use client";

import React, { useState, useEffect } from "react";
import { CaretLeftFilled, CaretRightFilled } from "@ant-design/icons";
import { Button } from "antd";
import { BillInstanceType } from "@/types/bill-instance";
import { getBillById, getProfileById, getProfiles, getBills } from "@/utils/supabaseUtils";
import { BillType } from "@/types/bill";
import { ProfileType } from "@/types/profile";
import CreateBillInstance from "./create.bill-instance";
import BillInstance from "./bill-instance";
import { EventType } from "@/types/event";

interface CalendarProps {
  billInstances: BillInstanceType[];
  onChange: () => void;
}

const Calendar = ({ billInstances, onChange }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1)); // October 2024
  const [events, setEvents] = useState<EventType[]>([]);
  const [bills, setBills] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetchEventDetails();
    fetchBills();
  }, [billInstances]);

  const fetchEventDetails = async () => {
    const enhancedEvents = await Promise.all(
      billInstances.map(async (instance) => {
        const bill: BillType = await getBillById(instance.bill_id);
        const profile: ProfileType = await getProfileById(bill.profile_id);
        return {
          id: instance.id,
          month: new Date(instance.month),
          dueDate: new Date(instance.due_date),
          billName: bill.name,
          profileName: profile.name,
          amount: instance.amount,
          isPaid: instance.is_paid,
          description: instance.description,
        };
      })
    );
    setEvents(enhancedEvents);
  };

  const fetchBills = async () => {
    try {
      const profiles: ProfileType[] = await getProfiles();

      let allBills: BillType[] = [];
      for (const profile of profiles) {
        const profileBills = await getBills(profile.id);
        allBills = [...allBills, ...profileBills];
      }

      setBills(allBills.map((bill) => ({ id: bill.id, name: bill.name })));
    } catch (error) {
      console.error("Error fetching bills", error);
    }
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const rows = [];
    let cells = [];

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;

    const prevMonthDays = daysInMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    for (let i = adjustedStartDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      cells.push(
        <td
          key={`prev-${day}`}
          className="border border-gray-200 p-1 text-gray-400 align-top"
        >
          <div className="h-full flex flex-col">
            <div className="font-semibold text-sm">{day}</div>
          </div>
        </td>
      );
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = events.filter(
        (event) =>
          event.dueDate.getDate() === day &&
          event.dueDate.getMonth() === currentDate.getMonth() &&
          event.dueDate.getFullYear() === currentDate.getFullYear()
      );

      cells.push(
        <td
          key={day}
          className={`border h-32 border-gray-200 p-1 align-top ${
            isToday(date) ? "bg-blue-50" : ""
          }`}
        >
          <div className="h-full flex flex-col">
            <div
              className={`font-semibold text-sm ${
                isToday(date) ? "text-blue-600" : ""
              }`}
            >
              {day}
            </div>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {dayEvents.map((event, index) => (
                <BillInstance event={event} onChange={onChange} key={index} />
              ))}
            </div>
          </div>
        </td>
      );

      if (cells.length === 7) {
        rows.push(
          <tr key={day} className="h-24">
            {cells}
          </tr>
        );
        cells = [];
      }
    }

    const remainingCells = 7 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      cells.push(
        <td
          key={`next-${i}`}
          className="border border-gray-200 p-1 text-gray-400 align-top"
        >
          <div className="h-full flex flex-col">
            <div className="font-semibold text-sm">{i}</div>
          </div>
        </td>
      );
    }
    if (cells.length > 0) {
      rows.push(
        <tr key="last" className="h-24">
          {cells}
        </tr>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 py-2 border-b border-gray-200">
          <h2 className="text-xl font-bold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-gray-100"
            >
              <CaretLeftFilled />
            </button>
            <Button onClick={goToToday}>Today</Button>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-gray-100"
            >
              <CaretRightFilled />
            </button>
            <CreateBillInstance bills={bills} onChange={onChange} />
          </div>
        </div>
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <th
                  key={day}
                  className="border border-gray-200 p-1 text-left text-lg font-bold text-gray-500"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };

  return <div className="w-full h-screen p-4 bg-white">{renderCalendar()}</div>;
};

export default Calendar;
