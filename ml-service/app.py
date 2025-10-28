import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# Load environment variables (e.g., MONGO_URI) from .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS to allow your Node.js backend to call this API
CORS(app)

# --- Database Connection ---
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("FATAL ERROR: MONGO_URI is not set in ml-service/.env")
    exit()

client = MongoClient(MONGO_URI)
# --- THIS IS THE FIX ---
# Change the database name to 'test' to match your backend.
db = client.get_database("test") 
invoices_collection = db.invoices
MODEL_FILE = 'payment_model.pkl'

# --- 1. MODEL TRAINING ENDPOINT ---
@app.route('/train', methods=['POST'])
def train_model():
    """
    Fetches all paid invoices from MongoDB to train a model.
    This endpoint is called manually (e.g., via Thunder Client) to create the model file.
    """
    print("Fetching data for training...")
    try:
        # We can only train on invoices that have been paid
        paid_invoices = list(invoices_collection.find({"status": "paid"}))

        if len(paid_invoices) < 10:
            return jsonify({"message": "Not enough paid invoices to train a model yet. Need at least 10."}), 400

        # Use Pandas to prepare the data
        df = pd.DataFrame(paid_invoices)
        df['createdAt'] = pd.to_datetime(df['createdAt'])
        df['updatedAt'] = pd.to_datetime(df['updatedAt'])
        
        # Calculate 'daysToPay' - this is our prediction target
        df['daysToPay'] = (df['updatedAt'] - df['createdAt']).dt.days

        # We will use 'totalAmount' as a feature to predict 'daysToPay'
        features = df[['totalAmount']]
        target = df['daysToPay']
        
        # Train the model
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(features, target)
        
        # Save the trained model to a file
        joblib.dump(model, MODEL_FILE)
        
        print("Model trained and saved successfully.")
        return jsonify({"message": f"Model trained successfully on {len(paid_invoices)} invoices."})

    except Exception as e:
        print(f"Error during training: {e}")
        return jsonify({"error": str(e)}), 500

# --- 2. PREDICTION ENDPOINT ---
@app.route('/predict', methods=['POST'])
def predict_payment_date():
    """
    Predicts the payment time for a new invoice.
    This is called by the Node.js backend.
    """
    try:
        if not os.path.exists(MODEL_FILE):
            print("Model file not found, cannot make prediction.")
            return jsonify({"error": "Model has not been trained yet. Call /train first."}), 500
        
        model = joblib.load(MODEL_FILE)
        
        data = request.json
        
        if 'totalAmount' not in data:
            return jsonify({"error": "Missing 'totalAmount' in request"}), 400
            
        total_amount = data['totalAmount']
        features = pd.DataFrame({'totalAmount': [total_amount]})
        
        prediction = model.predict(features)
        predicted_days = int(prediction[0])
        
        return jsonify({"predicted_days": predicted_days})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500

# --- Health check route ---
@app.route('/', methods=['GET'])
def health_check():
    return "QuickBill ML Service is running."

if __name__ == '__main__':
    app.run(debug=True, port=5002)