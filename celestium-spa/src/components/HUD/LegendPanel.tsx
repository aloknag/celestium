import { motion } from 'framer-motion';

export function LegendPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-stretch gap-4 md:gap-8 w-full md:w-64 p-4 md:p-6 border-t md:border-t-0 md:border-l border-celestium-dim/20 bg-celestium-bg/50 backdrop-blur-sm order-3"
    >
      <div className="flex flex-col gap-2 w-full">
        <h3 className="text-xs uppercase tracking-[0.2em] text-celestium-accent opacity-50 border-b border-celestium-accent/20 pb-2 mb-2">
          Legend
        </h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] md:text-xs tracking-widest">
          <div className="flex items-baseline justify-between">
            <span className="text-celestium-text">VE</span>
            <span className="text-celestium-dim">Vernal Equinox</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-celestium-text">AE</span>
            <span className="text-celestium-dim">Autumnal Equinox</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-celestium-text">SS</span>
            <span className="text-celestium-dim">Summer Solstice</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-celestium-text">WS</span>
            <span className="text-celestium-dim">Winter Solstice</span>
          </div>
        </div>

        <div className="text-[9px] md:text-[10px] text-celestium-dim tracking-widest mt-2">
          Used on the orbital ring markers.
        </div>
      </div>
    </motion.div>
  );
}
