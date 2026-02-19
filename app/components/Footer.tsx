import { motion } from "framer-motion";
import { Phone, Mail, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground py-16">
      <div className="container px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-background mb-4">Binary Nusantara</h3>
            <p className="text-background/60 text-lg italic font-serif">
              "Digital Creative Community"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 mb-12"
          >
            <a 
              href="tel:089655207298" 
              className="flex items-center gap-3 text-background/70 hover:text-accent transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <span>089655207298</span>
            </a>
            <a 
              href="mailto:connect@binarynusantara.com" 
              className="flex items-center gap-3 text-background/70 hover:text-accent transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <span>connect@binarynusantara.com</span>
            </a>
            <a 
              href="https://binarynusantara.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-background/70 hover:text-accent transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <span>binarynusantara.com</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center pt-8 border-t border-background/10"
          >
            <p className="text-background/50 text-sm">
              © 2025 Binary Nusantara. All rights reserved.
            </p>
            <p className="text-background/40 text-sm mt-2">
              #Belajar<wbr />Sambil<wbr />Beramal Season 5 • Ramadhan 2025
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
