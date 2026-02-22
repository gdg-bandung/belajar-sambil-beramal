import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const Donation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="donation" className="py-24 bg-gradient-to-b from-primary to-brandBlue-dark relative overflow-hidden" ref={ref}>
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-8">
            <Heart className="w-10 h-10 text-accent" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Berbagi Kebaikan
          </h2>

          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            Seluruh donasi dari pendaftaran webinar sepenuhnya akan disalurkan ke yang membutuhkan.
            Setiap donasi yang masuk akan sangat berarti bagi mereka yang membutuhkan.
            Semoga menjadi amal kebaikan untuk kita semua.
          </p>

          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 border border-primary-foreground/20 mb-10 max-w-lg mx-auto">
            <p className="text-primary-foreground/70 text-sm mb-2">Donasi Minimal</p>
            <p className="text-5xl font-bold text-accent mb-4">Rp 1.000</p>
            <p className="text-primary-foreground text-sm">
              Kamu akan mendapatkan: <strong>Pahala & Materi</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-gold-dark px-8 py-6 text-lg font-semibold shadow-lg shadow-accent/30"
            >
              <Link to="https://gdgbandung.com/bsb-donasi" target="_blank">
                <Heart className="w-5 h-5 mr-2" />
                Donasi Sekarang
              </Link>
            </Button>
          </div>

          <p className="text-primary-foreground/60 text-sm mt-8">
            100% donasi disalurkan untuk mendukung kegiatan kebaikan
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Donation;
