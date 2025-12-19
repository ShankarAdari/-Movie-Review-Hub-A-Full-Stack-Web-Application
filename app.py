from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import requests
import os
from datetime import datetime
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///movies.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db = SQLAlchemy(app)
TMDB_API_KEY = os.getenv('TMDB_API_KEY', 'YOUR_TMDB_API_KEY') 
TMDB_BASE_URL = 'https://api.themoviedb.org/3'
class Movie(db.Model):
    id = Column(Integer, primary_key=True)
    tmdb_id = Column(Integer, unique=True)
    title = Column(String(200))
    ratings = relationship('Rating', backref='movie', lazy=True)
    comments = relationship('Comment', backref='movie', lazy=True)
class Rating(db.Model):
    id = Column(Integer, primary_key=True)
    movie_id = Column(Integer, ForeignKey('movie.id'))
    user_id = Column(String(50))  
    score = Column(Float) 
class Comment(db.Model):
    id = Column(Integer, primary_key=True)
    movie_id = Column(Integer, ForeignKey('movie.id'))
    user_id = Column(String(50))
    text = Column(Text)
    upvotes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
with app.app_context():
    db.create_all()
def fetch_tmdb(endpoint, params=None):
    params = params or {}
    params['api_key'] = TMDB_API_KEY
    response = requests.get(f"{TMDB_BASE_URL}/{endpoint}", params=params)
    return response.json() if response.status_code == 200 else None
@app.route('/api/movies/latest', methods=['GET'])
def get_latest_movies():
    data = fetch_tmdb('movie/now_playing', {'page': 1})
    movies = data.get('results', []) if data else []
    return jsonify([{'id': m['id'], 'title': m['title'], 'overview': m['overview'], 'poster': f"https://image.tmdb.org/t/p/w500{m['poster_path']}", 'rating': m['vote_average']} for m in movies])

@app.route('/api/movie/<int:tmdb_id>', methods=['GET'])
def get_movie(tmdb_id):
    movie_data = fetch_tmdb(f'movie/{tmdb_id}')
    if not movie_data:
        return jsonify({'error': 'Movie not found'}), 404
    
    # Fetch images
    images = fetch_tmdb(f'movie/{tmdb_id}/images', {'include_image_languages': 'en'})
    backdrops = [f"https://image.tmdb.org/t/p/w1280{i['file_path']}" for i in images.get('backdrops', [])[:5]]
    
    # Fetch trailer (videos endpoint)
    videos = fetch_tmdb(f'movie/{tmdb_id}/videos', {'language': 'en'})
    trailer = next((v for v in videos.get('results', []) if v['type'] == 'Trailer' and v['site'] == 'YouTube'), None)
    trailer_url = f"https://www.youtube.com/watch?v={trailer['key']}" if trailer else None
    
    # Get user ratings/comments from DB
    db_movie = Movie.query.filter_by(tmdb_id=tmdb_id).first()
    avg_rating = sum(r.score for r in db_movie.ratings) / len(db_movie.ratings) if db_movie and db_movie.ratings else movie_data['vote_average']
    comments = [{'text': c.text, 'upvotes': c.upvotes, 'created_at': c.created_at.isoformat()} for c in db_movie.comments] if db_movie else []
    
    return jsonify({
        'title': movie_data['title'],
        'overview': movie_data['overview'],
        'tmdb_rating': movie_data['vote_average'],
        'user_avg_rating': avg_rating,
        'images': backdrops,
        'trailer_url': trailer_url,
        'comments': comments
    })

@app.route('/api/rate', methods=['POST'])
def add_rating():
    data = request.json
    rating = Rating(movie_id=data['movie_id'], user_id=data['user_id'], score=data['score'])
    db.session.add(rating)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/comment', methods=['POST'])
def add_comment():
    data = request.json
    comment = Comment(movie_id=data['movie_id'], user_id=data['user_id'], text=data['text'])
    db.session.add(comment)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/comment/<int:comment_id>/upvote', methods=['POST'])
def upvote_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if comment:
        comment.upvotes += 1
        db.session.commit()
        return jsonify({'upvotes': comment.upvotes})
    return jsonify({'error': 'Not found'}), 404

if __name__ == '__main__':

    app.run(debug=True)





