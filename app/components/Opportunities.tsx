import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Mic, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const Opportunities = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="opportunities" className="py-24 bg-secondary relative overflow-hidden" ref={ref}>
      <div className="container px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center flex flex-col items-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
              <Mic className="w-10 h-10 text-primary" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Jadilah Pembicara
            </h2>
            <h3 className="text-2xl text-muted-foreground mb-8">
              Bagikan Ilmu dan Pengalamanmu
            </h3>
            
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto mb-12 flex-1">
              Punya topik menarik seputar teknologi, desain, atau pengembangan diri? 
              Mari berbagi wawasan dengan komunitas kami di bulan Ramadhan yang penuh berkah ini.
              Kontribusimu akan sangat bermanfaat bagi peserta yang ingin belajar dan berkembang.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/30 w-fit"
            >
              <Link to="/register-speaker">
                Daftar Sebagai Pembicara <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Open Sponsor Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center flex flex-col items-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 mb-8">
              <Heart className="w-10 h-10 text-orange-500" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Buka Sponsor
            </h2>
            <h3 className="text-2xl text-muted-foreground mb-8">
              Dukung Kegiatan Sosial Kami
            </h3>
            
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto mb-12 flex-1">
              Jadilah bagian dari kebaikan dengan mendukung acara-acara kami. 
              Kontribusi Anda akan membantu keberlangsungan program edukasi dan sosial kami.
              Berbagai paket sponsor tersedia sesuai kebutuhan Anda.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-6 text-lg font-semibold shadow-lg shadow-orange-500/30 w-fit"
            >
              <Link to="https://gdgbandung.com/bsb-sponsor" target="_blank">
                Jadi Sponsor <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Opportunities;
