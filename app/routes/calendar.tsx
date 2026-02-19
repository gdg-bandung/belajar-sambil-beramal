import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar as CalendarIcon, User, Clock, Building2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLoaderData } from "react-router";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { id } from "date-fns/locale";
import { submissionService } from "@/server/submission-service.server";

interface EventItem {
  id: string; 
  date: Date;
  title: string;
  topic: string;
  time: string;
  startHour: number;
  endHour: number;
  type: "workshop" | "webinar" | "closing";
  description?: string;
  fullName?: string;
  institution?: string;
  role?: string;
  photo?: string;
}

export async function loader() {
  const approvedSubmissions = await submissionService.getApprovedSubmissions();
  
  const events: EventItem[] = approvedSubmissions.map(sub => {
    const timeParts = sub.eventTime?.split(":") || ["09", "00"];
    const startHour = parseInt(timeParts[0]);
    const startMinute = timeParts[1] || "00";
    const endHour = startHour + 1; 

    const startTimeFormatted = `${startHour.toString().padStart(2, '0')}:${startMinute}`;
    const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${startMinute}`;

    return {
      id: sub.id,
      date: new Date(sub.eventDate!),
      title: sub.topicTitle,
      topic: sub.topicCategory || "General",
      time: `${startTimeFormatted} - ${endTimeFormatted} WIB`,
      startHour: startHour,
      endHour: endHour,
      type: "webinar",
      description: sub.description || "",
      fullName: sub.fullName,
      institution: sub.institution || "",
      role: sub.role || "Speaker",
      photo: sub.photo || undefined
    };
  });

  return { events };
}

export default function CalendarPage() {
  const { events } = useLoaderData<typeof loader>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const getEventColor = (type: EventItem["type"]) => {
    switch (type) {
      case "workshop":
        return "bg-accent hover:bg-accent/90 text-accent-foreground";
      case "webinar":
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
      case "closing":
        return "bg-gold hover:bg-gold/90 text-emerald-dark";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getEventBorderColor = (type: EventItem["type"]) => {
    switch (type) {
      case "workshop":
        return "border-l-accent";
      case "webinar":
        return "border-l-primary";
      case "closing":
        return "border-l-gold";
      default:
        return "border-l-muted";
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-foreground ml-2">
            {format(currentMonth, "MMMM yyyy", { locale: id })}
          </h2>
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentMonth(new Date())}
        >
          Hari Ini
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    return (
      <div className="grid grid-cols-7 border-b border-border">
        {days.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-medium text-muted-foreground border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        // Need to parse ISO string dates from loader data back to Date objects for comparison
        const dayEvents = events.filter((event) =>
          isSameDay(new Date(event.date), currentDay)
        );
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] border-r border-b border-border last:border-r-0 p-1 ${
              !isCurrentMonth ? "bg-muted/30" : "bg-card"
            }`}
          >
            <div
              className={`text-sm mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                isToday(day)
                  ? "bg-primary text-primary-foreground"
                  : isCurrentMonth
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {format(day, "d")}
            </div>
            <div className="space-y-1">
              {dayEvents.map((event) => (
                <motion.button
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedEvent(event)}
                  className={`w-full text-left text-xs p-1.5 rounded truncate cursor-pointer transition-colors ${getEventColor(
                    event.type
                  )}`}
                >
                  <span className="font-medium">{event.time.split(" - ")[0]}</span>{" "}
                  {event.title}
                </motion.button>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="border-l border-t border-border">{rows}</div>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">
                  Kalender Event
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-primary" />
                  <span className="text-muted-foreground">Webinar</span>
                </div>
                {/* 
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-accent" />
                  <span className="text-muted-foreground">Workshop</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gold" />
                  <span className="text-muted-foreground">Closing</span>
                </div> 
                */}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderHeader()}
          <div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
            {renderDays()}
            {renderCells()}
          </div>
        </motion.div>

        {/* Upcoming Events Sidebar on Mobile */}
        <div className="mt-6 lg:hidden">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Semua Event
          </h3>
          <div className="space-y-2">
            {events.map((event) => (
              <motion.div
                key={event.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedEvent(event)}
                className={`p-3 rounded-lg border-l-4 bg-card border border-border cursor-pointer hover:shadow-md transition-shadow ${getEventBorderColor(
                  event.type
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.date), "EEEE, d MMMM", { locale: id })} • {event.time}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-xl p-6 max-w-[600px] w-full shadow-xl border border-border max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6 pt-2">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
                  {selectedEvent.topic}
                </span>
                <h2 className="text-2xl font-bold text-foreground leading-tight">
                  {selectedEvent.title}
                </h2>
              </div>

              <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                 <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border flex-shrink-0 overflow-hidden">
                      {selectedEvent.photo ? (
                        <img src={selectedEvent.photo} alt={selectedEvent.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pembicara</p>
                      <p className="font-semibold text-foreground">{selectedEvent.fullName || "Speaker"}</p>
                      <p className="text-sm text-foreground/80 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        {selectedEvent.institution || "-"}
                      </p>
                      <p className="text-sm text-foreground/80 flex items-center gap-1.5 mt-0.5">
                        <Tag className="w-3.5 h-3.5" />
                        {selectedEvent.role || "Speaker"}
                      </p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-xs">Tanggal</span>
                  </div>
                  <p className="font-medium text-sm">
                    {format(selectedEvent.date, "EEEE, d MMMM yyyy", { locale: id })}
                  </p>
                </div>
                <div className="bg-card border rounded-lg p-3">
                   <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Waktu</span>
                  </div>
                  <p className="font-medium text-sm">{selectedEvent.time}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Deskripsi</h4>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description || "Tidak ada deskripsi."}
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end gap-3">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Daftar Sekarang
                </Button>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Tutup
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}