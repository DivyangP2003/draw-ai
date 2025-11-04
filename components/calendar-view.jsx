"use client"

import { useState, useEffect } from "react"
import { getAllNotes } from "@/utils/storage"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function CalendarView({ onNoteSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [noteDates, setNoteDates] = useState({})
  const [selectedDate, setSelectedDate] = useState(null)
  const [notesOnDate, setNotesOnDate] = useState([])

  useEffect(() => {
    loadNoteDates()
  }, [])

  const loadNoteDates = async () => {
    const notes = await getAllNotes()
    const dateMap = {}

    notes.forEach((note) => {
      const date = new Date(note.createdAt).toDateString()
      if (!dateMap[date]) {
        dateMap[date] = []
      }
      dateMap[date].push(note)
    })

    setNoteDates(dateMap)
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    setSelectedDate(date)
    const dateStr = date.toDateString()
    setNotesOnDate(noteDates[dateStr] || [])
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Days of month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-bold text-lg">{monthName}</h2>
        <button onClick={handleNextMonth} className="p-1">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-xs">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dateStr = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() : null
          const hasNotes = dateStr && noteDates[dateStr]
          const isSelected = selectedDate?.toDateString() === dateStr

          return (
            <button
              key={idx}
              onClick={() => day && handleDateClick(day)}
              disabled={!day}
              className={`p-2 rounded text-sm transition ${
                !day
                  ? "opacity-0 cursor-default"
                  : isSelected
                    ? "bg-blue-500 text-white font-bold"
                    : hasNotes
                      ? "bg-green-100 dark:bg-green-900 font-semibold cursor-pointer hover:bg-green-200 dark:hover:bg-green-800"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              }`}
            >
              {day}
              {hasNotes && <div className="text-xs">●</div>}
            </button>
          )
        })}
      </div>

      {/* Notes on selected date */}
      {selectedDate && notesOnDate.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700">
          <h3 className="font-semibold mb-2">Notes on {selectedDate.toDateString()}</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notesOnDate.map((note) => (
              <div
                key={note.id}
                onClick={() => onNoteSelect(note)}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <p className="font-semibold text-sm truncate">{note.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(note.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
