from flask import Flask, render_template, request, jsonify
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from models import db, Comment
from forms import CommentForm
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
csrf = CSRFProtect(app)
limiter = Limiter(get_remote_address, app=app)

with app.app_context():
    db.drop_all()
    db.create_all()

@app.route('/')
def index():
    form = CommentForm()
    return render_template('index.html', form=form)

@app.route('/api/comments', methods=['GET'])
def get_comments():
    comments = Comment.query.order_by(Comment.created_at.desc()).all()
    return jsonify([comment.to_dict() for comment in comments])

@app.route('/api/comments', methods=['POST'])
@limiter.limit("5 per minute")
def create_comment():
    form = CommentForm()
    if form.validate_on_submit():
        text = form.text.data
        comment = Comment(text=text)
        db.session.add(comment)
        db.session.commit()
        return jsonify(comment.to_dict()), 201
    return jsonify({"errors": form.errors}), 400

@app.route('/api/comments/<int:comment_id>/like', methods=['POST'])
@limiter.limit("10 per minute")
def like_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    comment.likes += 1
    db.session.commit()
    return jsonify(comment.to_dict()), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
