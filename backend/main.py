from fastapi  import FastAPI # creates backend app instance
from pydantic import BaseModel # lets you define structured inputs using Python classes
from fastapi.middleware.cors import CORSMiddleware # allows frontend and backend to communicate during development
from fastapi import HTTPException

app = FastAPI()
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5173" # if you see your frontend at this port
]
# allowing the frontend and backend to communicate during development; Browsers usually block JS from talking to different domains/ports for 
# security reasons, but CORS just gives the permission
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # allows POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # allows all headers
)

# Pydantic model which defines what DATA you expect in the request
# WHY: it ensures you only process well-structured, valid data.
class CalculationInput(BaseModel):
    principal: float
    rate: float
    years: int
    frequency: int
    monthly_contribution: float

# Endpoint: this route allows the frontend to call on the backend and ask for a calculation
@app.post("/calculate")
def Calculate_Interest(input: CalculationInput):
    P = input.principal
    r = input.rate / 100
    n = input.frequency
    t = input.years
    contribution = input.monthly_contribution

    # Input Validation: prevents bad input and returns clear errors.
    if P <= 0 or r < 0 or n <= 0 or t <= 0:
        raise HTTPException(status_code=400, detail="Invalid input: All fields must be positive and rate cannot be negative.")

    # actual calculation & response
    # A = P * (1 + r / n) ** (n * t)

    values = []

    current_balance = P
    total_periods = n * t

    for i in range(1, total_periods + 1):
        current_balance = current_balance * (1 + r / n)
        current_balance += contribution
        values.append(round(current_balance, 2))

    finalAmount = values[-1] # uses last value as final

    # returns json response, bc JSON is universal data language for frontend-backend communication
    return {
        "finalAmount": round(finalAmount, 2),
        "chartValues": values
    }

import requests
import pandas as pd
from datetime import datetime

class CryptoInput(BaseModel):
    crypto_name: str

@app.post("/fetch")
def fetch_crypto_price(input: CryptoInput):
    name = input.crypto_name

    if name:
        coin_id = get_coin_id(name)
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            if coin_id in data:
                price = data[coin_id]["usd"]

                historical_prices_url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart?vs_currency=usd&days=30"
                historical_response = requests.get(historical_prices_url)

                if historical_response.status_code == 200:
                    historical_data = historical_response.json()
                    prices = historical_data["prices"]
                    df = pd.DataFrame(prices, columns=['timestamp', 'price'])
                    df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
                    df['date'] = df['datetime'].dt.date

                    # group by date and aggregate ; grabbing the last price for that day
                    daily_df = df.groupby('date').agg({'price': 'last'}).reset_index()

                    # preparing list for Chart.js
                    labels = daily_df['date'].astype(str).tolist() # x-axis
                    values = daily_df['price'].tolist() #y-axis

            return {
                "cryptoPrice": price,
                "priceChartValues": values,
                "chartDates": labels
            }
            
        else: 
            raise HTTPException(status_code=400, detail="Invalid Input: Field cannot be empty or be a number.")

    else:
        raise HTTPException(status_code=502, detail="Bad Gateway: Failed to fetch the price data from API. Try Again.")     

import motor.motor_asyncio

MONGODB_URL = "mongodb+srv://mekhij29:Ritamaejohn1929!@atfdb.qpv3aw9.mongodb.net/?retryWrites=true&w=majority&appName=ATFdb"

# Connect to MongoDB
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client["ATFdb"]           # Database name
asset_collection = db["assets"]      # Collection name

class AssetInput(BaseModel):
    assetType: str
    symbol: str
    shareAmount: float
    purchaseDate: datetime

@app.post("/list")
async def add_asset(asset: AssetInput):

    asset_list = []

    if asset.assetType == "Stock":
        API_KEY = 'd181861r01ql1b4l5s80d181861r01ql1b4l5s8g'
        url = f'https://finnhub.io/api/v1/quote?symbol={asset.symbol}&token={API_KEY}'
        response = requests.get(url)

        if response.status_code == 200:
            stock_data = response.json()
            price = stock_data["c"]
            date = stock_data["datetime"]
            amount_owned = asset.shareAmount * price

            # creates document to insert into database
            asset_doc = {
                "assetType": asset.assetType,
                "symbol": asset.symbol,
                "purchaseDate": asset.purchaseDate.isoformat(),
                "current_price": price,
                "share_amount": asset.shareAmount,
                "total_value": round(amount_owned, 2)
            }
            result = await asset_collection.insert_one(asset_doc)
            asset_doc["_id"] = str(result.inserted_id)
            return asset_doc
        
        else:
            return {"error: Could not fetch stock price."}

    if asset.assetType == "Crypto":
        coin_id = get_coin_id(asset.symbol)

        if coin_id:
            url = f"https://api.coingecko.com/api/v3/coins/id/market_chart/range?ids={coin_id}&history={asset.purchaseDate}"
            response = requests.get(url)

            if response.status_code == 200:
                data = response.json()

                price = data[coin_id]["usd"]
                


def get_coin_id(user_input):
    url = "https://api.coingecko.com/api/v3/coins/list"
    response = requests.get(url)
    coins = response.json()

    user_input = user_input.lower().strip()
    for coin in coins:
        if isinstance(coin,dict) and all(k in coin for k in ['id', 'name', 'symbol']):
            if user_input in [coin['id'].lower(), coin['name'].lower(), coin['symbol'].lower()]:
                return coin['id']
    return None


#  uvicorn main:app --reload