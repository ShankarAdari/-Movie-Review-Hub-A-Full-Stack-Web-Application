# Run via cron: python update_cache.py (fetches and stores latest in DB)
from app import app, db, Movie  # Import from app.py
import requests

with app.app_context():
    data = requests.get(f"{TMDB_BASE_URL}/movie/now_playing?api_key={TMDB_API_KEY}").json()
    for m in data.get('results', [])[:10]:  # Top 10 latest
        if not Movie.query.filter_by(tmdb_id=m['id']).first():
            new_movie = Movie(tmdb_id=m['id'], title=m['title'])
            db.session.add(new_movie)
    db.session.commit()
print("Cache updated!")