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
    
    localDBSession.close()

    return jsonify({
        'email': user.email,
        'username': user.username,
        'firstname': user.firstname,
        'lastname': user.lastname,
        'address': user.address,
        'city': user.city,
        'country': user.country,
        'phoneNum': user.phoneNumber,
        'social': user.social
    }), 200

@user_blueprint.route('/edit-profile',methods=['PUT'])
@jwt_required()
def editProfile():

    current_user_id = get_jwt_identity()
    data = flask.request.json
    localDBSession = Session(bind=engine)

    user_to_update = localDBSession.query(User).filter(User.id == current_user_id).first()

    if user_to_update:
        if(localDBSession.query(User).filter(User.email == data['email']).first() 
            and user_to_update.email != data['email']):
            return jsonify({'message': 'User with that email already exists. Try again.'}), 500
        
        if(localDBSession.query(User).filter(User.username == data['username']).first() 
            and user_to_update.username != data['username']):
            return jsonify({'message': 'User with that username already exists. Try again.'}), 500
            
        user_to_update.email = data['email']
        user_to_update.username = data['username']
        user_to_update.firstname = data['firstname']
        user_to_update.lastname = data['lastname']
        user_to_update.address = data['address']
        user_to_update.city = data['city']
        user_to_update.country = data['country']
        user_to_update.phoneNumber = data['phoneNum']

        localDBSession.commit()

        return jsonify({
            'email': user_to_update.email,
            'username': user_to_update.username,
            'firstname': user_to_update.firstname,
            'lastname': user_to_update.lastname,
            'address': user_to_update.address,
            'city': user_to_update.city,
            'country': user_to_update.country,
            'phoneNum': user_to_update.phoneNumber,
            'social': user_to_update.social
        }), 200

    return jsonify({'error': 'User not found'}), 404

@user_blueprint.route('/change-password',methods=['PUT'])
@jwt_required()
def changePassword():
    current_user_id = get_jwt_identity()
    data = flask.request.json
    localDBSession = Session(bind=engine)

    user_to_update = localDBSession.query(User).filter(User.id == current_user_id).first()

    if user_to_update:
        user_to_update.password = generate_password_hash(data['newPassword'], method='sha256')
        localDBSession.commit()
        localDBSession.close()
        return jsonify({'message': 'Password is successfully changed'}), 200
    
    return jsonify({'error': 'User not found'}), 404