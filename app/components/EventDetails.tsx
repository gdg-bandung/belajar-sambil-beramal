import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Clock, MapPin, Laptop, Users, Sparkles } from "lucide-react";

const topics = [
  "AI/ML", "Career Path", "Business Management", "SEO", "Startup", 
  "Data Science", "DevOps", "Project Management", "Web Development",
  "Mobile Development", "UI/UX Design", "Tips & Trick"
];

const EventDetails = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="details" className="py-24 bg-background" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Detail Event</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2">
            Informasi <span className="text-primary">Kegiatan</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Event Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border h-full">
              <h3 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent" />
                Detail Pelaksanaan
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Pelaksanaan</p>
                    <p className="text-lg font-semibold text-foreground">8 Maret - 30 Maret 2025</p>
                    <p className="text-sm text-muted-foreground">*Setiap pekan minimal ada 1 event</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Waktu</p>
                    <p className="text-lg font-semibold text-foreground">10:00 - 17:30 WIB</p>
                    <p className="text-sm text-muted-foreground">21:15 - 22:30 WIB (sesi malam)</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lokasi</p>
                    <p className="text-lg font-semibold text-foreground">Online via Zoom / Google Meet</p>
                    <p className="text-sm text-muted-foreground">*Beberapa sesi offline tersedia</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Peserta</p>
                    <p className="text-lg font-semibold text-foreground">Pelajar, Mahasiswa, Professional, Umum</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Topics */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-primary rounded-2xl p-8 shadow-lg h-full">
              <h3 className="text-2xl font-bold text-primary-foreground mb-8 flex items-center gap-2">
                <Laptop className="w-6 h-6 text-accent" />
                Topik Pembahasan
              </h3>
              
              <div className="flex flex-wrap gap-3">
                {topics.map((topic, index) => (
                  <motion.span
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                    className="px-4 py-2 bg-primary-foreground/10 rounded-full text-primary-foreground text-sm font-medium border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-colors cursor-default"
                  >
                    {topic}
                  </motion.span>
                ))}
              </div>

              <p className="text-primary-foreground/70 text-sm mt-8">
                *Materi sepenuhnya dibebaskan kepada speaker
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
