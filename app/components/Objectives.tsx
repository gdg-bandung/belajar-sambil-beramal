import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Users, BookOpen, Heart } from "lucide-react";

const objectives = [
  {
    icon: Users,
    title: "Membangun Relasi",
    description: "Menjadi sarana untuk membangun jaringan pada minat yang sama dalam bidang tertentu",
    color: "bg-primary",
  },
  {
    icon: BookOpen,
    title: "Menambah Wawasan",
    description: "Membantu peserta meningkatkan kemampuan dan keterampilan mereka dalam bidang tertentu",
    color: "bg-brandBlue-light",
  },
  {
    icon: Heart,
    title: "Berbagi Kebaikan",
    description: "Donasi dari hasil webinar ini sepenuhnya akan disalurkan untuk orang yang membutuhkan",
    color: "bg-accent",
  },
];

const Objectives = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="objectives" className="py-24 bg-secondary" ref={ref}>
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Tujuan Event</span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Meningkatkan Pengetahuan,<br />
            <span className="text-primary">Menebar Kebaikan</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {objectives.map((obj, index) => (
            <motion.div
              key={obj.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group"
            >
              <div className="bg-card rounded-2xl p-8 h-full shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className={`w-16 h-16 rounded-xl ${obj.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <obj.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{obj.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{obj.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Objectives;
