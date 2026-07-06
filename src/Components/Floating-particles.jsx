import { motion } from "framer-motion";

const particles = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  size: Math.random() * 5 + 2,
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: Math.random() * 12 + 10,
  delay: Math.random() * 5,
}));

export default function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-orange-200 opacity-40"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            filter: "blur(1px)",
          }}
          animate={{
            x: [
              0,
              Math.random() * 120 - 60,
              Math.random() * 120 - 60,
              0,
            ],
            y: [
              0,
              Math.random() * 120 - 60,
              Math.random() * 120 - 60,
              0,
            ],
            opacity: [0.2, 0.7, 0.3, 0.5],
            scale: [1, 1.4, 0.8, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}