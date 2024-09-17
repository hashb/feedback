from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(140), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'created_at': self.created_at.isoformat(),
            'likes': self.likes
        }
