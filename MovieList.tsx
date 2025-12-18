import React from 'react';
import { motion } from 'framer-motion';
const MovieList = ({ movies, onSelect }) => (
  <motion.div layout className="movie-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <h2>Latest Movies</h2>
    <div className="grid">
      {movies.map(movie => (
        <motion.div key={movie.id} className="movie-card" whileHover={{ scale: 1.05 }} onClick={() => onSelect(movie.id)}>
          <img src={movie.poster} alt={movie.title} />
          <h3>{movie.title}</h3>
          <p>Rating: {movie.rating}/10</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
);
export default MovieList;

