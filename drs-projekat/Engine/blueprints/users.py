from flask import Blueprint, jsonify
import flask
from database.models import User, Session, engine
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity

user_blueprint = Blueprint('user_blueprint', __name__)


@user_blueprint.route('/profile',methods=['GET'])
@jwt_required() 
def profile():
    current_user_id = get_jwt_identity()
    localDBSession = Session(bind=engine)

    user = localDBSession.query(User).filter(User.id == current_user_id).first()
    if not user:
        localDBSession.close()
        return jsonify({
            'message': 'User not found'
        }), 404
    
    return jsonify({
        'email': user.email
    }), 200

@user_blueprint.route('/edit-profile',methods=['POST'])
def editProfile():
    data=flask.request.json
    localDBSession = Session(bind=engine)

    user_to_update=localDBSession.query(User).filter(User.email == data['email']).first()
    user_to_update.firstname = data['firstname']
    user_to_update.lastname = data['lastname']
    user_to_update.address = data['address']
    user_to_update.city = data['city']
    user_to_update.country = data['country']
    user_to_update.phoneNumber = data['phoneNum']
    user_to_update.email = data['email']
    if len(data['password'].strip()):
        user_to_update.password=generate_password_hash(data['password'], method='sha256')

    localDBSession.commit()
    