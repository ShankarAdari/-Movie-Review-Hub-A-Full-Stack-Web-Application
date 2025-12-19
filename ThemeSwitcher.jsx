import React from 'react';
import { motion } from 'framer-motion';
const ThemeSwitcher = ({ theme, setTheme }) => (
  <div className="theme-switcher">
    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setTheme('dark')} className={theme === 'dark' ? 'active' : ''}>Dark</motion.button>
    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setTheme('light')} className={theme === 'light' ? 'active' : ''}>Light</motion.button>
    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setTheme('cinematic')} className={theme === 'cinematic' ? 'active' : ''}>Cinematic</motion.button>
  </div>
);
export default ThemeSwitcher;
