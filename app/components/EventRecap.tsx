import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Users, Mic, Heart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const EventRecap = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats2021 = {
    year: 2021,
    webinars: 3,
    participants: 87,
    donations: "Rp 1.297.593",
    speakers: 3,
    link: "https://www.instagram.com/p/COx2DVfpZMJ/"
  };

  const stats2022 = {
    year: 2022,
    webinars: 2,
    participants: 70,
    donations: "Rp 750.000",
    speakers: 2,
    link: "https://www.instagram.com/p/CcPXiE0pPCH/"
  };

  const stats2023 = {
    year: 2023,
    webinars: 5,
    participants: 200,
    donations: "Rp 2.297.000",
    speakers: 5,
    link: "https://kitabisa.com/campaign/binarynusantara"
  };

  const stats2024 = {
    year: 2024,
    webinars: 12,
    participants: 512,
    donations: "Rp 4.300.000",
    speakers: 19,
    link: "https://www.instagram.com/p/C7O8XwzSIeT/"
  };

  const stats2025 = {
    year: 2025,
    webinars: 19,
    participants: 461,
    donations: "Rp 7.059.805",
    speakers: 27,
    link: "https://www.instagram.com/p/DIytEW8SwHd/"
  };

  const RecapCard = ({ stats, delay }: { stats: typeof stats2025, delay: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="bg-card rounded-2xl p-8 shadow-lg border border-border h-full flex flex-col justify-between w-full max-w-[400px] flex-shrink-0 snap-center"
    >
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Tahun {stats.year}
        </h3>
        
        <div className="space-y-8">
          <div className="bg-secondary/50 p-6 rounded-xl">
             <div className="space-y-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Total Webinar
              </p>
              <p className="text-4xl font-bold text-foreground">{stats.webinars}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Peserta
              </p>
              <p className="text-2xl font-bold text-foreground">{stats.participants}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mic className="w-4 h-4" /> Pembicara
              </p>
              <p className="text-2xl font-bold text-foreground">{stats.speakers}</p>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-red-500" /> Total Donasi Terkumpul
            </p>
            <p className="text-4xl font-bold text-primary">{stats.donations}</p>
          </div>
        </div>
      </div>

      <Button
        asChild
        className="w-full mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <a href={stats.link} target="_blank" rel="noopener noreferrer">
          Lihat Detail <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </Button>
    </motion.div>
  );

  return (
    <section id="recap" className="py-24 bg-secondary" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Pencapaian Kami</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2">
            Rekap <span className="text-primary">Kegiatan</span>
          </h2>
        </motion.div>

        <div className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory scrollbar-hide">
          <RecapCard stats={stats2021} delay={0.1} />
          <RecapCard stats={stats2022} delay={0.2} />
          <RecapCard stats={stats2023} delay={0.3} />
          <RecapCard stats={stats2024} delay={0.4} />
          <RecapCard stats={stats2025} delay={0.5} />
        </div>
      </div>
    </section>
  );
};

export default EventRecap;
