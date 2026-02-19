import { motion } from "framer-motion";
import { Calendar, Heart, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useEffect, useState } from "react";

const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

const Hero = ({donation} : {donation: number}) => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center bg-primary overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-accent/20 blur-3xl animate-float" />
        <div className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-primary-foreground/10 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container relative z-10 px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Season Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-primary-foreground text-sm font-medium">Season 5 • Ramadhan 2025</span>
          </motion.div>

          {/* Main Hashtag */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-4"
          >
            <span className="text-accent">#</span>Belajar<wbr />Sambil<wbr />Beramal
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-primary-foreground/90 font-serif italic mb-8"
          >
            "Meningkatkan Pengetahuan, Menebar Kebaikan"
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 mb-10"
          >
            <Heart className="w-5 h-5 text-destructive fill-destructive" />
            <div className="text-left">
              <div className="text-primary-foreground/60 font-medium">Total Donasi Terkumpul</div>
              <motion.div
                key={donation}
                initial={{ opacity: 0.7, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl md:text-4xl font-bold text-primary-foreground"
              >
                {formatRupiah(donation)}
              </motion.div>
            </div>
          </motion.div>

          {/* Event Info Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full backdrop-blur-sm">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-primary-foreground text-sm">8 - 30 Maret 2025</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-primary-foreground text-sm">Online via Zoom</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 rounded-full backdrop-blur-sm">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-primary-foreground text-sm">Terbuka untuk Umum</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-gold-dark px-8 py-6 text-lg font-semibold shadow-lg shadow-accent/30"
            >
              Daftar Sekarang
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg"
            >
              <Link to="/calendar">
                Lihat Jadwal
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-primary-foreground/60 text-sm">Scroll untuk info lebih</span>
            <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-accent"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
