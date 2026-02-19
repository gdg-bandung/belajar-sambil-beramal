import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 bg-background" ref={ref}>
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Tentang Event</span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-6">
              Apa itu <span className="text-primary">#Belajar<wbr />Sambil<wbr />Beramal</span>?
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-lg max-w-none"
          >
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-border">
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                <strong className="text-foreground">#Belajar<wbr />Sambil<wbr />Beramal</strong> merupakan agenda tahunan setiap bulan Ramadhan yang diselenggarakan oleh <strong className="text-primary">Binary Nusantara</strong>. Kegiatan ini tidak hanya memberikan kesempatan untuk meningkatkan pengetahuan dan keterampilan, tetapi juga memberikan kesempatan untuk beramal dan berkontribusi dalam kebaikan sosial.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Dalam bulan Ramadhan, kegiatan ini dapat menjadi sarana untuk memperbanyak amal ibadah dan mendapatkan keberkahan yang lebih besar. Program ini dapat diikuti oleh siapa saja, baik dari kalangan pelajar, mahasiswa, maupun masyarakat umum.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Peserta akan memperoleh ilmu dan keterampilan baru, serta memiliki kesempatan untuk beramal dengan cara yang bermanfaat bagi diri sendiri dan masyarakat di sekitarnya.
              </p>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-xl font-semibold text-foreground mb-4">Binary Nusantara</h3>
                <p className="text-muted-foreground">
                  Digital Creative Community yang berlokasi di Bandung. Komunitas ini fokus pada topik-topik seperti pengembangan software, pemrograman, jaringan, keamanan, big data, IoT, dan lain-lain. Aktif mengadakan meetup, workshop, dan seminar untuk meningkatkan keterampilan anggotanya.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
