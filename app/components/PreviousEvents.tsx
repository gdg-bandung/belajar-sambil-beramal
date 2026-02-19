import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, User } from "lucide-react";

const events = [
  {
    title: "Kotlin Multiplatform Mobile For Your Apps",
    description: "Mempelajari aplikasi mobile lebih dalam tentang cara menggunakan Kotlin Multiplatform Mobile (Android & iOS) dengan metode clean architecture",
    date: "1 Mei 2021",
    speaker: "Rodhica Yusuf",
    category: "Mobile Development",
  },
  {
    title: "How to Kickstart Your Career as Backend Developer",
    description: "Mendapatkan sudut pandang baru dari perjalanan karir menuju seorang Backend Developer, mempersiapkan diri untuk menjadi Backend Developer",
    date: "8 Mei 2021",
    speaker: "Hadian Rahmat",
    category: "Career Path",
  },
  {
    title: "Stay Effective and Productive by Working From Anywhere",
    description: "Tips dan trik untuk tetap produktif dan efektif saat bekerja dari mana saja bersama GITS Indonesia",
    date: "15 April 2022",
    speaker: "Ibnu Sina Wardy",
    category: "Productivity",
  },
];

const PreviousEvents = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="previous" className="py-24 bg-background" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Kegiatan Sebelumnya</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2">
            Event <span className="text-primary">Sebelumnya</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {events.map((event, index) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
            >
              <div className="bg-card rounded-2xl overflow-hidden shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                <div className="h-3 bg-gradient-to-r from-primary to-brandBlue-light" />
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
                    {event.category}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                    {event.description}
                  </p>
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{event.speaker}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PreviousEvents;
