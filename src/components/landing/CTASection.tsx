import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="container mx-auto px-4 max-w-3xl text-center"
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          Ready to host your own event?
        </h2>
        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
          Create beautiful event pages and manage everything in one place.
        </p>
        <Button size="lg" onClick={() => navigate("/signup/organization")} className="text-base px-8">
          Create Your First Event
        </Button>
      </motion.div>
    </section>
  );
};

export default CTASection;
