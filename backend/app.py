from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

choiceModel = joblib.load('models/choice_predictor.pkl')
passModel = joblib.load('models/pass_predictor.pkl')
moveModel = joblib.load('models/movement_predictor.pkl')
xModel = joblib.load('models/x_predictor.pkl')
yModel = joblib.load('models/y_predictor.pkl')

def convertCoordsTo(x=None, y=None):
    if x is not None:
        return 3+(x*1.05)
    elif y is not None:
        return 3+(y*0.68)

def convertCoordsFro(x=None, y=None):
    if x is not None:
        return (x-3)/1.05
    elif y is not None:
        return (y-3)/0.68

def predictNextPass(df, xModel, yModel, temperature=0.75):
    xDist = xModel.pred_dist(df[['xStart', 'yStart']])
    mu_x = xDist.loc[0]
    sigma_x = xDist.scale[0]
    simulated_x = np.random.normal(mu_x, sigma_x * temperature)
    while simulated_x < 0 or simulated_x > 100:
        simulated_x = np.random.normal(mu_x, sigma_x * temperature)
    df['xEnd'] = simulated_x
    yDist = yModel.pred_dist(df[['xStart', 'yStart', 'xEnd']])
    mu_y = yDist.loc[0]
    sigma_y = yDist.scale[0]
    simulated_y = np.random.normal(mu_y, sigma_y * temperature)
    while simulated_y < 0 or simulated_y > 100:
        simulated_y = np.random.normal(mu_y, sigma_y * temperature)
    return simulated_x, simulated_y

@app.get("/")
async def hello():
    return {"success": True}

@app.post("/")
async def calc_path(request: Request):
    payload = await request.json()
    print(payload)

    inputX = convertCoordsFro(x=payload['end']['x'])
    inputY = convertCoordsFro(y=payload['end']['y'])

    def nextChoice(x, y):
        y_pred = choiceModel.predict_proba(pd.DataFrame({'1': {'x': float(x), 'y': float(y)}}).T)
        raw_probs = y_pred[0]

        probabilities = raw_probs / raw_probs.sum()

        options = ['Pass', 'Shot', 'Dribble']

        choice = np.random.choice(options, p=probabilities)
        return choice

    def passDestination(x, y):
        predX, predY = predictNextPass(pd.DataFrame({'1': {'xStart': float(x), 'yStart': float(y)}}).T, xModel, yModel)
        return predX, predY

    def dribbleDestination(x, y):
        y_pred = moveModel.predict(pd.DataFrame({'1': {'xStart': float(x), 'yStart': float(y)}}).T)
        return y_pred[0]

    sequence = []
    switch = True
    while switch:
        choice = nextChoice(inputX, inputY)
        if choice == 'Shot':
            sequence.append({"type": "shot", "x": 108, "y": 37})
            switch = False
        elif choice == 'Pass':
            inputX, inputY = passDestination(inputX, inputY)
            sequence.append({"type": "pass", "x": convertCoordsTo(x=inputX), "y": convertCoordsTo(y=inputY)})
        elif choice == 'Dribble':
            inputX, inputY = dribbleDestination(inputX, inputY)
            sequence.append({"type": "dribble", "x": convertCoordsTo(x=inputX), "y": convertCoordsTo(y=inputY)})
    return sequence