from flask import Flask, url_for, jsonify
import blueprints.users
from database.models import Base, engine
from multiprocessing import Process
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'thisissupposedtobeverycomplexkey'
app.secret_key = 'verysecretkey'
jwt = JWTManager(app)
CORS(app, origins=['http://localhost:3000'])
oauth = OAuth(app)

Base.metadata.create_all(engine)

if __name__ == '__main__':
    app.register_blueprint(blueprints.users.user_blueprint, url_prefix = '/engine/users')
    #app.register_blueprint(transaction_blueprint, url_prefix = '/engine/transactions')
    #p = Process(target=transaction_process, args=(transaction_queue, ))
    #p.start()
    app.run(port=5001, debug=True, host='0.0.0.0')