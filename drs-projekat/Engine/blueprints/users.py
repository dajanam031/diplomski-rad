from operator import or_
import requests
from flask import Blueprint, jsonify
import flask
from database.models import User,  Transaction, Session, engine
from werkzeug.security import check_password_hash, generate_password_hash
import sha3
import random
import threading
import time
from database.enums import Card
from multiprocessing import Queue
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import main
from google.oauth2 import id_token
from google.auth.transport import requests

user_blueprint = Blueprint('user_blueprint', __name__)
transaction_queue = Queue()
GOOGLE_CLIENT_ID = '1007024445330-amna0iilhhrmpdm0nk6u0b15ck7rubbn.apps.googleusercontent.com'

@user_blueprint.route('/google/auth', methods=['POST'])
def google_auth():
    token = flask.request.json.get('token')
    try:
        payload = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID)
        
        localDBSession = Session(bind=engine)
        user = localDBSession.query(User).filter(User.email == payload['email']).first()
        if user:
            user_data={
            'verificated': user.verified
            }
            token = create_access_token(identity=user.id, additional_claims=user_data)

            localDBSession.close()

            return jsonify({
                'token': token
            }), 200

        
        new_user = User(email=payload['email'], firstname=payload['given_name'], lastname=payload['family_name'],
        password=generate_password_hash('google password', method='sha256'),
        address='', city='', country='', phoneNumber = '', balance = 0)

        localDBSession.add(new_user)
        localDBSession.commit()

        user_data={
            'verificated': new_user.verified
        }
        token = create_access_token(identity=new_user.id, additional_claims=user_data)

        localDBSession.close()

        return jsonify({
            'token': token
        }), 200

    except ValueError as e:
        return jsonify({'error': str(e)}), 401


@user_blueprint.route('/signup', methods=['POST'])
def signup():
    data = flask.request.json
    localDBSession = Session(bind=engine)
    
    existing_email = localDBSession.query(User).filter(User.email == data['email']).first()
    if existing_email:
        return jsonify({
            'message': 'User with that email already exists. Try another one.'
        }), 400

    new_user = User(email=data['email'], firstname=data['firstname'], lastname=data['lastname'],
    password=generate_password_hash(data['password'], method='sha256'),
    address=data['address'], city=data['city'], country=data['country'], phoneNumber = data['phoneNum'], balance = 0)

    localDBSession.add(new_user)
    localDBSession.commit()

    user_data={
        'verificated': new_user.verified
    }
    token = create_access_token(identity=new_user.id, additional_claims=user_data)

    localDBSession.close()

    return jsonify({
        'token': token
    }), 200

@user_blueprint.route('/login', methods=['POST'])
def login():
    data = flask.request.json

    localDBSession = Session(bind=engine)

    user = localDBSession.query(User).filter(User.email == data['email']).first()

    if user:
        if check_password_hash(user.password, data['password']):
            user_data={
            'verificated': user.verified
            }
            token = create_access_token(identity=user.id, additional_claims=user_data)

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

@user_blueprint.route('/profile',methods=['GET'])
@jwt_required() # only requests with valid jwt token can access this route
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
    
    
@user_blueprint.route('/verification', methods=['POST'])
def verification():
    data = flask.request.json

    # iz tokena dobaviti info o trenutnom korisniku, 
    user_email = data['user_email']

    if not data['cardnumber'] == Card.CARD_NUM.value:
        err = {'message' : 'Invalid card number.Try again.'}, 400
        return err
    elif not data['expirydate'] == Card.EXPIRY_DATE.value:
        err = {'message' : 'Invalid expiry date.Try again.'}, 400
        return err
    elif not data['securitycode'] == Card.SECURITY_CODE.value:
        err = {'message' : 'Invalid security code. Try again.'}, 400
        return err

    localDBSession = Session(bind=engine)

    user_to_verify = localDBSession.query(User).filter(User.email==user_email).first()
    user_to_verify.verified = True

    user_to_verify.balance += 1

    localDBSession.commit()
    return updateUserInSession(user_to_verify, localDBSession)

@user_blueprint.route('/sendMoneyToAnotherUser', methods=['POST'])
def sendMoneyToAnotherUser():
    data = flask.request.json
    sender_email = data['sender_email']
    reciever_email = data['reciever_email']
    amount = data['amount']
    currency = data['currency']

    thread = threading.Thread(target=transaction_thread, args=(sender_email, reciever_email, amount, currency))
    thread.start()

    message = {'message' : 'Transaction validation has started..You can check progress in transactions history.'}, 200
    
    return  message

@user_blueprint.route('/refreshBalance', methods=['POST'])
def refreshBalance():
    data = flask.request.json
    email = data['email']

    localSession = Session(bind=engine)
    user = localSession.query(User).filter(User.email==email).first()

    return updateUserInSession(user, localSession)
    
@user_blueprint.route('/transferMoneyToMyAcc', methods=['POST'])
def transferMoneyToMyAcc():
    data = flask.request.json
    email = data['email']
    amount = data['amount']

    localSession = Session(bind=engine)
    user = localSession.query(User).filter(User.email==email).first()

    user.balance += float(amount)

    hashString = (email + str(amount) + str(random.randint(0,1000))).encode('ascii')
    keccak256 = sha3.keccak_256()
    keccak256.update(hashString)

    new_transaction = Transaction(transaction_hash=keccak256.hexdigest(), 
    sender=email, reciever="ADD MONEY", amount=amount, state="OBRADJENO")
    localSession.add(new_transaction) 

    localSession.commit()
    localSession.close()

    success = {'message' : 'Prenos novca je uspesno izvrsen. Novo stanje mozete proveriti u PREGLED STANJA.'}

    return success

@user_blueprint.route('/transactionsHistory', methods=['POST'])
def transactionsHistory():
    data = flask.request.json
    email = data['email']
    paramsSort = data['paramsSort']
    paramsFilter = data['paramsFilter']

    if not paramsSort and not paramsFilter: # bez parametara, samo se vracaju transakcije
        return getTransactions(email)
    elif paramsSort:
        return sortTransactions(email, paramsSort) 
    elif paramsFilter:
        return filterTransactions(paramsFilter, email)
    else:
        resp = []
        return resp

@user_blueprint.route('/changeCurrency',methods=['POST'])
def changeCurrency():
    data=flask.request.json

    email=data['email']
    currency=data['currency']
    amount=float(data['amount'])
    prices=livePrices()

    localSession=Session(bind=engine)
    user=localSession.query(User).filter(User.email==email).first()
    if(amount>user.balance):
         err = {'message' : 'You dont have enough $$$'}, 400
         localSession.close()
         return err
    else:
        if(currency=='bitcoin'):
            user.balance-=amount
            user.balance_btc+=amount/float(prices['bitcoin']['usd'])
        elif(currency=='litecoin'):
            user.balance-=amount
            user.balance_ltc+=amount/float(prices['litecoin']['usd'])
        elif(currency=='dogecoin'):
            user.balance-=amount
            user.balance_doge+=amount/float(prices['dogecoin']['usd'])
        elif(currency=='ethereum'):
            user.balance-=amount
            user.balance_eth+=amount/float(prices['ethereum']['usd'])

        hashString = (email + str(amount) + str(random.randint(0,1000))).encode('ascii')
        keccak256 = sha3.keccak_256()
        keccak256.update(hashString)

        new_transaction = Transaction(transaction_hash=keccak256.hexdigest(), 
        sender=email, reciever="EXCHANGE MONEY", amount=amount, currency = currency, state="OBRADJENO")
        localSession.add(new_transaction) 
        localSession.commit()

        return updateUserInSession(user, localSession)


############################################ POMOCNE FUNKCIJE #########################################################
def livePrices():
    url='https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cdogecoin%2Cethereum%2Clitecoin&vs_currencies=usd'
    prices=requests.get(url).json()
    return prices

def updateUserInSession(user, session):
    success = {'firstname': user.firstname, 'lastname': user.lastname, 'address': user.address, 'city': user.city,
               'country': user.country, 'phoneNum': user.phoneNumber, 'email': user.email,
               'password': user.password,
               'balance': user.balance, 'verified': user.verified, 'balance_btc': user.balance_btc,
               'balance_ltc': user.balance_ltc,
               'balance_doge': user.balance_doge, 'balance_eth': user.balance_eth}, 200
    session.close()
    return success

def printTransaction(transactions, session):
    # možda napraviti drugaciji ispis
    resp = []
    for tr in transactions:
        transaction = tr.sender + " --> " + tr.reciever + " , " + "AMOUNT: " + str(tr.amount)+ " , " + "CURRENCY: " + tr.currency + " , " + tr.state
        resp.append(transaction)
    session.close()
    return jsonify(resp)

def getTransactions(email):
    localSession = Session(bind=engine)
    transactions = (
            localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .all()
        )
    return printTransaction(transactions, localSession)

def transaction_process(queue : Queue):
    while True:
        t = queue.get()
        localSession = Session(bind=engine)
        localSession.add(t)
        transaction = localSession.query(Transaction).filter(Transaction.transaction_hash==t.transaction_hash).first()
        reciever = localSession.query(User).filter(User.email==transaction.reciever).first()
        sender = localSession.query(User).filter(User.email==transaction.sender).first()

        if transaction.sender == transaction.reciever:
            transaction.state = "ODBIJENO"
        elif not reciever:
            transaction.state = "ODBIJENO"
        elif reciever.verified == False:
            transaction.state = "ODBIJENO"
        elif checkBalance(transaction.amount, sender, transaction.currency) == False:
            transaction.state = "ODBIJENO"
        else:
            transaction.state = "OBRADJENO"
            if transaction.currency == 'bitcoin':
                reciever.balance_btc += float(transaction.amount)
                sender.balance_btc -= float(transaction.amount)
            elif transaction.currency == 'dogecoin':
                reciever.balance_doge += float(transaction.amount)
                sender.balance_doge -= float(transaction.amount)
            elif transaction.currency == 'litecoin':
                reciever.balance_ltc += float(transaction.amount)
                sender.balance_ltc -= float(transaction.amount)
            elif transaction.currency == 'ethereum':
                reciever.balance_eth += float(transaction.amount)
                sender.balance_eth -= float(transaction.amount)
            else:
                reciever.balance += float(transaction.amount)
                sender.balance -= float(transaction.amount)
        localSession.commit()
        localSession.refresh(t)
        localSession.close()

def transaction_thread(sender_email, reciever_email, amount, currency):
    # obrada transakcije, simulirano odredjeno vreme
    localSession = Session(bind=engine)

    hashString = (sender_email + reciever_email + str(amount) + str(random.randint(0,1000))).encode('ascii')
    keccak256 = sha3.keccak_256()
    keccak256.update(hashString)

    new_transaction = Transaction(transaction_hash=keccak256.hexdigest(), 
    sender=sender_email, reciever=reciever_email, amount=amount, currency = currency, state="U OBRADI")
    localSession.add(new_transaction) 
    localSession.commit()

    time.sleep(15)
    transaction_queue.put(new_transaction)

def checkBalance(amount, sender, currency):
    if currency == 'dollar' and sender.balance < float(amount):
        return False
    elif currency == 'bitcoin' and sender.balance_btc < float(amount):
        return False
    elif currency == 'dogecoin' and sender.balance_doge < float(amount):
        return False
    elif currency == 'litecoin' and sender.balance_ltc < float(amount):
        return False
    elif currency == 'ethereum' and sender.balance_eth < float(amount):
        return False
    else:
        return True


############################################### FUNKCIJE SORTIRANJA ####################################################

def sortTransactions(email, paramsSort):
    if paramsSort == 'amountAsc': 
        return sortbyAmountAsc(email)
    elif paramsSort == 'amountDesc': 
        return sortbyAmountDesc(email)
    elif paramsSort == 'senderAZ':
        return sortbySenderAZ(email)
    elif paramsSort == 'senderZA':
        return sortbySenderZA(email)
    elif paramsSort == 'recieverAZ':
        return sortbyRecieverAZ(email)
    elif paramsSort == 'recieverZA':
        return sortbyRecieverZA(email)

def sortbyAmountAsc(email):
    localSession = Session(bind=engine)
    transactions = (
            localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .order_by(Transaction.amount)
            .all()
        )
    return printTransaction(transactions, localSession)

def sortbyAmountDesc(email):
    localSession = Session(bind=engine)
    transactions = (
            localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .order_by(Transaction.amount.desc())
            .all()
        )
    return printTransaction(transactions, localSession)

def sortbySenderAZ(email):
    localSession = Session(bind=engine)
    transactions = (
            localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .order_by(Transaction.sender)
            .all()
        )
    return printTransaction(transactions, localSession)

def sortbySenderZA(email):
    localSession = Session(bind=engine)
    transactions = (
            localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .order_by(Transaction.sender.desc())
            .all()
        )
    return printTransaction(transactions, localSession)

def sortbyRecieverZA(email):
    localSession = Session(bind=engine)
    transactions = (
            localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .order_by(Transaction.reciever.desc())
            .all()
        )
    return printTransaction(transactions, localSession)

def sortbyRecieverAZ(email):
    localSession = Session(bind=engine)
    transactions = (
            localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .order_by(Transaction.reciever)
            .all()
        )
    return printTransaction(transactions, localSession)


######################################################################################################################

#################################### FUNKCIJE FILTRIRANJA ############################################################

def filterTransactions(paramsFilter, email):
    amountFilter = paramsFilter['amount'].strip()
    senderFilter = paramsFilter['sender'].strip()
    recieverFilter = paramsFilter['reciever'].strip()

    if len(amountFilter) and len(senderFilter) and len(recieverFilter):
        return filterByAllParams(senderFilter, recieverFilter, amountFilter, email)
    
    elif len(amountFilter) and len(senderFilter) and not len(recieverFilter):
        return filterByAmountAndSender(amountFilter, senderFilter, email)
    
    elif len(amountFilter) and not len(senderFilter) and len(recieverFilter):
        return filterByAmountAndReciever(amountFilter, recieverFilter, email)
        
    elif not len(amountFilter) and len(senderFilter) and len(recieverFilter):
        return filterBySenderAndReciever(senderFilter, recieverFilter, email)
        
    elif len(amountFilter) and not len(senderFilter) and not len(recieverFilter):
        return filterByAmount(amountFilter, email)
        
    elif not len(amountFilter) and len(senderFilter) and not len(recieverFilter):
        return filterBySender(senderFilter, email)
        
    elif not len(amountFilter) and not len(senderFilter) and len(recieverFilter):
        return filterByReciever(recieverFilter, email)
    else:
        return getTransactions(email)
        

def filterByAllParams(senderFilter, recieverFilter, amountFilter, email):
    # filtriranje po svim parametrima
    localSession = Session(bind=engine)
    transactions = (
        localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .filter(Transaction.sender.like(f'%{senderFilter}%'), Transaction.reciever.like(f'%{recieverFilter}%'), Transaction.amount == amountFilter)
            .all()
        )
    return printTransaction(transactions, localSession)

def filterByAmountAndSender(amountFilter, senderFilter, email):
    # filtriranje po kolicini novca i posiljaocu
    localSession = Session(bind=engine)
    transactions = (
        localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .filter(Transaction.sender.like(f'%{senderFilter}%'), Transaction.amount == amountFilter)
            .all()
        )
    return printTransaction(transactions, localSession)

def filterByAmountAndReciever(amountFilter, recieverFilter, email):
    # filtriranje po kolicini novca i primaocu
    localSession = Session(bind=engine)
    transactions = (
        localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .filter(Transaction.reciever.like(f'%{recieverFilter}%'), Transaction.amount == amountFilter)
            .all()
        )
    return printTransaction(transactions, localSession)

def filterBySenderAndReciever(senderFilter, recieverFilter, email):
    # filtriranje po primaocu i posiljaocu
    localSession = Session(bind=engine)
    transactions = (
        localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .filter(Transaction.sender.like(f'%{senderFilter}%'), Transaction.reciever.like(f'%{recieverFilter}%'))
            .all()
        )
    return printTransaction(transactions, localSession)

def filterByAmount(amountFilter, email):
    # filtriranje samo po kolicini novca
    localSession = Session(bind=engine)
    transactions = (
        localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .filter(Transaction.amount == amountFilter)
            .all()
        )
    return printTransaction(transactions, localSession)

def filterBySender(senderFilter, email):
    # filtriranje po posiljaocu
    localSession = Session(bind=engine)
    transactions = (
        localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .filter(Transaction.sender.like(f'%{senderFilter}%'))
            .all()
        )
    return printTransaction(transactions, localSession)

def filterByReciever(recieverFilter, email):
    # filtriranje po primaocu
    localSession = Session(bind=engine)
    transactions = (
        localSession.query(Transaction)
            .filter(or_(Transaction.sender == email, Transaction.reciever == email))
            .filter(Transaction.reciever.like(f'%{recieverFilter}%'))
            .all()
        )
    return printTransaction(transactions, localSession)
######################################################################################################################
    




