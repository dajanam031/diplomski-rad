import requests as http_requests
from flask import Blueprint, jsonify
import flask
from database.models import User, Session, engine
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
from dotenv import load_dotenv
import os
from datetime import timedelta

auth_blueprint = Blueprint('auth_blueprint', __name__)
load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

@auth_blueprint.route('/google', methods=['POST'])
def google_auth():
    token = flask.request.json.get('token')
    try:
        payload = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID)
        
        localDBSession = Session(bind=engine)
        user = localDBSession.query(User).filter(User.email == payload['email'] and User.social == "google").first()
        if user:
            expires_in = timedelta(hours=1)
            token = create_access_token(identity=user.id, expires_delta=expires_in)

            localDBSession.close()

            return jsonify({
                'token': token
            }), 200

        
        new_user = User(email=payload['email'], firstname=payload['given_name'], lastname=payload['family_name'],
        username='', password=generate_password_hash('google password', method='sha256'),
        address='', city='', country='', phoneNumber = '', social="google")

        localDBSession.add(new_user)
        localDBSession.commit()

        expires_in = timedelta(hours=1)
        token = create_access_token(identity=new_user.id, expires_delta=expires_in)

        localDBSession.close()

        return jsonify({
            'token': token
        }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 401


@auth_blueprint.route('/github', methods=['POST'])
def exchange_code_for_token():
    code = flask.request.json.get('code')

    if code:
        try:
            response = http_requests.post('https://github.com/login/oauth/access_token', params={
                'client_id': GITHUB_CLIENT_ID,
                'client_secret': GITHUB_CLIENT_SECRET,
                'code': code
            }, headers={'Accept': 'application/json'})

            data = response.json()
            access_token = data.get('access_token')

            response = http_requests.get('https://api.github.com/user', headers={
                'Authorization': f'Bearer {access_token}',
            })

            if response.status_code == 200:
                user_data = response.json()

                localDBSession = Session(bind=engine)
                user = localDBSession.query(User).filter(User.username == user_data.get('login') and
                                                          User.social == "github").first()
                if user:
                    expires_in = timedelta(hours=1)
                    token = create_access_token(identity=user.id, expires_delta=expires_in)

                    localDBSession.close()

                    return jsonify({
                        'token': token
                    }), 200

                firstname, lastname = user_data.get('name').split()

                new_user = User(email=user_data.get('email') or '', firstname=firstname, lastname=lastname,
                username=user_data.get('login'), password=generate_password_hash('github password', method='sha256'),
                address='', city=user_data.get('location') or '', country='', phoneNumber = '', social="github")

                localDBSession.add(new_user)
                localDBSession.commit()

                expires_in = timedelta(hours=1)
                token = create_access_token(identity=new_user.id, expires_delta=expires_in)

                localDBSession.close()

                return jsonify({
                    'token': token
                }), 200
            else:
                print('Error accessing user data:', response.status_code)

        except Exception:
            return jsonify({'error': 'Error exchanging code for token'}), 500

    return jsonify({'error': 'Code not provided'}), 400


@auth_blueprint.route('/signup', methods=['POST'])
def signup():
    data = flask.request.json
    localDBSession = Session(bind=engine)
    
    existing_email = localDBSession.query(User).filter(User.email == data['email']).first()
    if existing_email:
        return jsonify({
            'message': 'User with that email already exists. Try another one.'
        }), 400
    
    existing_username = localDBSession.query(User).filter(User.username == data['username']).first()
    if existing_username:
        return jsonify({
            'message': 'Username is taken. Try another one.'
        }), 400

    new_user = User(email=data['email'], firstname=data['firstname'], lastname=data['lastname'], username=data['username'],
    password=generate_password_hash(data['password'], method='sha256'),
    address=data['address'], city=data['city'], country=data['country'], phoneNumber = data['phoneNum'])

    localDBSession.add(new_user)
    localDBSession.commit()

    expires_in = timedelta(hours=1)
    token = create_access_token(identity=new_user.id, expires_delta=expires_in)

    localDBSession.close()

    return jsonify({
        'token': token
    }), 200

@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = flask.request.json

    localDBSession = Session(bind=engine)

    user = localDBSession.query(User).filter(User.email == data['email']).first()

    if user:
        if check_password_hash(user.password, data['password']):
            expires_in = timedelta(hours=1)
            token = create_access_token(identity=user.id, expires_delta=expires_in)

            localDBSession.close()

            return jsonify({
                'token': token
            }), 200
        else:
            return jsonify({
                'message': 'Incorrect password. Try again.'
            }), 400
    else:
        return jsonify({
            'message': 'User with that email does not exists.'
        }), 404