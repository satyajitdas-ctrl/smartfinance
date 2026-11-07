"""FinWise AI — Machine Learning Expense Categorization Training Pipeline

Algorithm: TF-IDF (Term Frequency - Inverse Document Frequency) + Multinomial Logistic Regression
Dataset: Realistic Indian and global transaction merchant descriptions mapped to 11 standardized categories.
"""

from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score

# Directory paths
ML_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = ML_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = ARTIFACTS_DIR / "expense_categorizer.joblib"

# Comprehensive Training Corpus (Indian & International Merchant Transactions)
TRAINING_DATA = [
    # Food
    ("Swiggy food delivery lunch order biryani", "Food"),
    ("Zomato dinner delivery biryani feast", "Food"),
    ("McDonalds burgers and fries meal", "Food"),
    ("KFC hot and crispy chicken bucket", "Food"),
    ("Dominos pizza cheese burst delivery", "Food"),
    ("Pizza Hut supreme medium pizza", "Food"),
    ("Starbucks cafe mocha and butter croissant", "Food"),
    ("Cafe Coffee Day cappuccino catchup", "Food"),
    ("Chai Point ginger tea and samosa", "Food"),
    ("Blinkit quick grocery order vegetables", "Food"),
    ("Zepto instant milk bread eggs delivery", "Food"),
    ("Instamart snacks chocolate fruits", "Food"),
    ("Haldiram sweets and thali lunch", "Food"),
    ("Barbeque Nation buffet dinner", "Food"),
    ("Subway roasted chicken sub wrap", "Food"),
    ("Burger King whopper meal with drink", "Food"),
    ("Dineout restaurant payment discount", "Food"),
    ("Supermarket daily provisions rice dal", "Food"),
    ("Local bakery fresh bread pastries", "Food"),
    ("Fruit vendor apple banana juice", "Food"),

    # Shopping
    ("Amazon India electronics order keyboard shopping", "Shopping"),
    ("Flipkart big billion days smartphone", "Shopping"),
    ("Myntra fashion clothing festive kurtas", "Shopping"),
    ("Ajio casual denim jeans jacket", "Shopping"),
    ("Zara floral cotton dress apparel", "Shopping"),
    ("H&M basic t-shirts pack shopping", "Shopping"),
    ("Decathlon badminton racket and shuttlecocks", "Shopping"),
    ("Nykaa beauty cosmetics lipstick cream", "Shopping"),
    ("Croma electronic home appliances", "Shopping"),
    ("Reliance Digital laptop purchase", "Shopping"),
    ("Nike running shoes air zoom sneakers", "Shopping"),
    ("Puma track pants workout sportswear", "Shopping"),
    ("Ikea study table furniture wooden desk", "Shopping"),
    ("Titan watch stylish analog chronograph", "Shopping"),
    ("Lenskart progressive eyeglasses frame", "Shopping"),

    # Transportation
    ("Uber cab ride to cyber city office payment", "Transportation"),
    ("Ola cabs airport drop taxi booking", "Transportation"),
    ("Rapido bike taxi metro station commute", "Transportation"),
    ("Delhi Metro smart card auto-topup", "Transportation"),
    ("Namma Metro Bengaluru recharge gate", "Transportation"),
    ("FASTag national highway toll payment", "Transportation"),
    ("Indian Oil petrol fuel refill bike", "Transportation"),
    ("Bharat Petroleum diesel car fuel pump", "Transportation"),
    ("Shell petrol station premium fuel", "Transportation"),
    ("Auto rickshaw meter fare local ride", "Transportation"),
    ("Railway station parking ticket fee", "Transportation"),
    ("Airport car parking terminal plaza", "Transportation"),

    # Education
    ("Coursera deep learning specialization subscription course", "Education"),
    ("Udemy full stack web development course", "Education"),
    ("edX MIT python computer science certificate", "Education"),
    ("College semester tuition examination fee", "Education"),
    ("University degree registration charges", "Education"),
    ("Technical programming textbooks purchase", "Education"),
    ("Engineering mathematics reference books", "Education"),
    ("Coaching institute online test series", "Education"),
    ("GRE exam registration test booking", "Education"),
    ("AWS certified cloud practitioner exam fee", "Education"),

    # Healthcare
    ("Apollo Pharmacy medicines fever tablets", "Healthcare"),
    ("Netmeds prescription syrup online order", "Healthcare"),
    ("1mg diagnostic full body blood test", "Healthcare"),
    ("Max Hospital routine dental checkup", "Healthcare"),
    ("Fortis Healthcare doctor consultation clinic", "Healthcare"),
    ("MedPlus bandage antiseptic painkiller", "Healthcare"),
    ("Optometrist eye exam vision checkup", "Healthcare"),
    ("Physiotherapy muscle injury therapy session", "Healthcare"),
    ("Dermatologist skin treatment appointment", "Healthcare"),
    ("Health insurance annual medical premium", "Healthcare"),

    # Entertainment
    ("Netflix 4K UHD monthly subscription", "Entertainment"),
    ("Spotify Premium family music stream", "Entertainment"),
    ("Amazon Prime Video annual subscription", "Entertainment"),
    ("Disney Hotstar cricket match live stream", "Entertainment"),
    ("BookMyShow IMAX movie tickets weekend", "Entertainment"),
    ("PVR Cinemas multiplex movie popcorn combo", "Entertainment"),
    ("Sony LIV sports entertainment plan", "Entertainment"),
    ("YouTube Premium ad-free background play", "Entertainment"),
    ("Steam PC video game winter sale", "Entertainment"),
    ("PlayStation Plus essential gaming pass", "Entertainment"),

    # Rent
    ("Apartment monthly rent transfer landlord", "Rent"),
    ("BHK flat rent direct bank deposit", "Rent"),
    ("Hostel accommodation sharing rent payment", "Rent"),
    ("Housing society monthly maintenance charges", "Rent"),
    ("Studio apartment rental agreement advance", "Rent"),
    ("House owner monthly property rental", "Rent"),

    # Bills
    ("Electricity bill payment Tata Power DISCOM", "Bills"),
    ("Adani Electricity monthly power tariff", "Bills"),
    ("Mahanagar Gas domestic piped cooking gas", "Bills"),
    ("Indraprastha Gas Limited PNG bill", "Bills"),
    ("Airtel Fiber high speed broadband wifi bill", "Bills"),
    ("Jio Fiber broadband unlimited monthly bill", "Bills"),
    ("Municipal corporation water supply bill", "Bills"),
    ("Postpaid mobile phone recharge bill payment", "Bills"),

    # Travel
    ("IndiGo flight ticket booking Delhi Bengaluru", "Travel"),
    ("Air India domestic economy airline ticket", "Travel"),
    ("IRCTC railway AC train ticket booking", "Travel"),
    ("MakeMyTrip luxury resort hotel stay booking", "Travel"),
    ("Cleartrip weekend getaway hotel reservation", "Travel"),
    ("Airbnb homestay vacation apartment rental", "Travel"),
    ("Intercity sleeper bus ticket reservation", "Travel"),

    # Investments
    ("Zerodha Broking equity delivery stock shares", "Investments"),
    ("Groww mutual fund monthly SIP auto debit", "Investments"),
    ("Angel One portfolio shares purchase", "Investments"),
    ("HDFC Nifty 50 Index Fund investment", "Investments"),
    ("Fixed Deposit bank recurring deposit investment", "Investments"),
    ("National Pension Scheme NPS tier contribution", "Investments"),
    ("Gold Sovereign Bond purchase investment", "Investments"),

    # Other
    ("ATM cash withdrawal currency notes", "Other"),
    ("Bank service charge debit annual fee", "Other"),
    ("Courier speed post shipping parcel fee", "Other"),
    ("Notary legal document stamp paper fee", "Other"),
    ("Key duplication hardware repair miscellaneous", "Other"),
]


def train_and_export_model():
    """Trains TF-IDF + Logistic Regression pipeline and exports with Joblib."""
    df = pd.DataFrame(TRAINING_DATA, columns=["description", "category"])
    X = df["description"]
    y = df["category"]

    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                lowercase=True,
                max_features=5000,
                sublinear_tf=True,
            ),
        ),
        (
            "clf",
            LogisticRegression(
                C=5.0,
                max_iter=1000,
                class_weight="balanced",
                random_state=42,
            ),
        ),
    ])

    pipeline.fit(X, y)
    y_pred = pipeline.predict(X)
    acc = accuracy_score(y, y_pred)
    print(f"[*] Expense Categorizer trained successfully. Training Accuracy: {acc * 100:.2f}%")

    metadata = {
        "model": pipeline,
        "classes": list(pipeline.classes_),
        "version": "1.0.0",
        "algorithm": "TF-IDF + Logistic Regression",
        "training_samples": len(df),
    }
    joblib.dump(metadata, MODEL_PATH)
    print(f"[*] Model artifact saved to: {MODEL_PATH}")
    return metadata


if __name__ == "__main__":
    train_and_export_model()
