import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Calendar, User, Clock, Building2, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Event = {
  id: string;
  topicTitle: string;
  description: string;
  date: string;
  time: string;
  fullName: string;
  institution: string;
  role?: string;
  topicCategory: string;
  status: string;
  photo?: string;
};

interface UpcomingEventsProps {
  events: Event[];
}

const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const getEventStatus = (eventDate: string) => {
    if (!eventDate) return "Akan Datang";
    const now = new Date();
    const event = new Date(eventDate);
    
    event.setHours(23, 59, 59, 999);

    if (event < now) return "Selesai";
    if (event.toDateString() === now.toDateString()) return "Hari Ini";
    return "Akan Datang";
  };

  return (
    <section id="upcoming" className="py-24 bg-background" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Jadwal Webinar</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2">
            Daftar <span className="text-primary">Event</span>
          </h2>
        </motion.div>

        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center p-12 bg-secondary/30 rounded-2xl border border-border max-w-3xl mx-auto"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Event</h3>
            <p className="text-muted-foreground">
              Jadwal webinar akan segera diupdate. Pantau terus informasi terbaru dari kami.
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {events.map((event, index) => {
              const status = getEventStatus(event.date);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="group h-full"
                >
                  <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    <div className="h-3 bg-gradient-to-r from-primary to-brandBlue-light" />
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {event.topicCategory}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          status === "Selesai" ? "bg-muted text-muted-foreground" : 
                          status === "Hari Ini" ? "bg-green-100 text-green-700" : 
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {status}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {event.topicTitle}
                      </h3>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border">
                           {event.photo ? (
                             <img src={event.photo} alt={event.fullName} className="w-full h-full object-cover" />
                           ) : (
                             <User className="w-4 h-4 text-muted-foreground" />
                           )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground line-clamp-1">{event.fullName}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{event.institution}</p>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                        {event.description}
                      </p>

                      <div className="pt-4 border-t border-border mt-auto">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date ? format(new Date(event.date), "d MMM yyyy", { locale: id }) : "-"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => setSelectedEvent(event)}
                          className="w-full"
                          variant="outline"
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Event</DialogTitle>
            <DialogDescription>Informasi lengkap mengenai webinar ini.</DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6 pt-4">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
                  {selectedEvent.topicCategory}
                </span>
                <h2 className="text-2xl font-bold text-foreground leading-tight">
                  {selectedEvent.topicTitle}
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
                      <p className="font-semibold text-foreground">{selectedEvent.fullName}</p>
                      <p className="text-sm text-foreground/80 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {selectedEvent.institution}
                      </p>
                      <p className="text-sm text-foreground/80 flex items-center gap-1.5 mt-0.5">
                        <Tag className="h-3.5 w-3.5" />
                        {selectedEvent.role || "Speaker"}
                      </p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Tanggal</span>
                  </div>
                  <p className="font-medium text-sm">
                    {selectedEvent.date ? format(new Date(selectedEvent.date), "EEEE, d MMMM yyyy", { locale: id }) : "-"}
                  </p>
                </div>
                <div className="bg-card border rounded-lg p-3">
                   <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Waktu</span>
                  </div>
                  <p className="font-medium text-sm">{selectedEvent.time} WIB</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Deskripsi</h4>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description}
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end">
                <Button onClick={() => setSelectedEvent(null)}>Tutup</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default UpcomingEvents;