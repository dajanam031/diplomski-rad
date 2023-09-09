from flask import Flask
import blueprints.users
import blueprints.auth
import blueprints.transactions
from database.models import Base, engine
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.debug = True
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
app.secret_key = os.getenv("SECRET_KEY")
jwt = JWTManager(app)
CORS(app, origins=['http://localhost:3000'])

Base.metadata.create_all(engine)

if __name__ == '__main__':
    app.register_blueprint(blueprints.users.user_blueprint, url_prefix = '/engine/users')
    app.register_blueprint(blueprints.auth.auth_blueprint, url_prefix = '/engine/auth')
    app.register_blueprint(blueprints.transactions.transaction_blueprint, url_prefix = '/engine/transactions')
    app.run(port=5001, debug=True, host='0.0.0.0')