from flask_wtf import FlaskForm
from wtforms import StringField
from wtforms.validators import DataRequired, Length

class CommentForm(FlaskForm):
    text = StringField('Comment', validators=[DataRequired(), Length(max=140)])
