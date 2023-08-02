from flask import Flask
from blueprints.users import user_blueprint, transaction_process, transaction_queue
from blueprints.transactions import transaction_blueprint
from database.models import Base, engine
from multiprocessing import Process
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'very very complex secret key'
jwt = JWTManager(app)
CORS(app)

Base.metadata.create_all(engine)

if __name__ == '__main__':
    app.register_blueprint(user_blueprint, url_prefix = '/engine/users')
    app.register_blueprint(transaction_blueprint, url_prefix = '/engine/transactions')
    p = Process(target=transaction_process, args=(transaction_queue, ))
    p.start()
    app.run(port=5001, debug=True, host='0.0.0.0')