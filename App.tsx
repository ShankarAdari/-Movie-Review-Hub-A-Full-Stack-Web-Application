import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import particlesJS from 'particles.js'; 
import MovieList from './components/MovieList';
import MovieDetail from './components/MovieDetail';
import ThemeSwitcher from './components/ThemeSwitcher';
function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Init particles for live animation (customizable via config)
    particlesJS('particles-js', {
      particles: {
        number: { value: 50 },
        color: { value: theme === 'light' ? '#000' : '#fff' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, anim: { enable: true } },
        size: { value: 3, anim: { enable: true } },
        move: { enable: true, speed: 2, direction: 'none', random: true }
      },
      interactivity: { events: { onhover: { enable: true, mode: 'repulse' } } },
      retina_detect: true
    });
  }, [theme]);

  useEffect(() => {
    fetch('http://localhost:5000/api/movies/latest')
      .then(res => res.json())
      .then(setMovies);
  }, []);

  return (
    <div id="particles-js">
      <motion.header initial={{ y: -50 }} animate={{ y: 0 }} className="header">
        <h1>Movie Review Hub</h1>
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
      </motion.header>
      <AnimatePresence>
        {selectedMovie ? (
          <MovieDetail movie={selectedMovie} onBack={() => setSelectedMovie(null)} />
        ) : (
          <MovieList movies={movies} onSelect={setSelectedMovie} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;


