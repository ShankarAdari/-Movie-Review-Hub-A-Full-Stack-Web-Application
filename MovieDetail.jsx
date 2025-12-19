import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPlayer from 'react-player/youtube';
import { motion } from 'framer-motion';
const MovieDetail = ({ movie: movieId, onBack }) => {
  const [movie, setMovie] = useState(null);
  const [comment, setComment] = useState('');
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  useEffect(() => {
    axios.get(`http://localhost:5000/api/movie/${movieId}`)
      .then(res => setMovie(res.data));
  }, [movieId]);
  const handleRate = (score) => {
    axios.post('http://localhost:5000/api/rate', { movie_id: movieId, user_id: userId, score });
  };
  const handleComment = () => {
    axios.post('http://localhost:5000/api/comment', { movie_id: movieId, user_id: userId, text: comment });
    setComment('');
    axios.get(`http://localhost:5000/api/movie/${movieId}`).then(res => setMovie(res.data));
  };
  const upvoteComment = (commentId) => {
    axios.post(`http://localhost:5000/api/comment/${commentId}/upvote`);
  };
  if (!movie) return <div>Loading...</div>;

  const shareTrailer = () => {
    if (navigator.share) {
      navigator.share({ title: `Watch ${movie.title} Trailer`, url: movie.trailer_url });
    }
  };
  return (
    <motion.div initial={{ x: 100 }} animate={{ x: 0 }} className="movie-detail">
      <button onClick={onBack}>← Back</button>
      <h1>{movie.title}</h1>
      <p>{movie.overview}</p>
      
      {/* Ratings */}
      <div className="ratings">
        <h3>User Avg: {movie.user_avg_rating?.toFixed(1)}/10</h3>
        {[1,2,3,4,5,6,7,8,9,10].map(s => (
          <button key={s} onClick={() => handleRate(s)}>{s}</button>
        ))}
      </div>

      {/* Images Gallery */}
      <div className="images">
        {movie.images?.map((img, i) => (
          <motion.img key={i} src={img} alt="Backdrop" whileHover={{ scale: 1.1 }} />
        ))}
      </div>

      {/* Trailer */}
      {movie.trailer_url && (
        <div className="trailer">
          <ReactPlayer url={movie.trailer_url} controls width="100%" height="400px" />
          <button onClick={shareTrailer}>Share Trailer</button>
          <p>Discuss the trailer below!</p>
        </div>
      )}

      {/* Discussion */}
      <div className="discussion">
        <h3>Comments ({movie.comments?.length || 0})</h3>
        <div className="comment-form">
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts on the movie/trailer..." />
          <button onClick={handleComment}>Post</button>
        </div>
        {movie.comments?.map(c => (
          <motion.div key={c.id} className="comment" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p>{c.text}</p>
            <small>{new Date(c.created_at).toLocaleDateString()}</small>
            <button onClick={() => upvoteComment(c.id)}>↑ {c.upvotes}</button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MovieDetail;






