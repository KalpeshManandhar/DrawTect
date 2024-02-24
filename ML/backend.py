from flask import Flask, request, jsonify
import cv2
from PIL import Image
from tensorflow.keras.models import load_model
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)

model=load_model('letterCNN.h5')
labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

@app.route('/predict_digit', methods=['POST'])
def predict_digit():    
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    # Check if the file is empty
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    # image = request.files['image']
    # img_array = image_to_array(file)
    #         # Return the array as a JSON response
    # return jsonify({'image_array': img_array})
    
    # img_array = image_to_array(file)
    
    # predicted_digit = predict_digit_from_image(img_array)
    # print(predicted_digit)
    # return predicted_digit


   
def image_to_array(image_file):    
    # Open the image file
    img = Image.open(image_file)
    
    # Convert the image to grayscale
    img = img.convert('L')
    
    # Resize the image to 28x28 pixels
    img = img.resize((28, 28))
    
    # Convert the image to a numpy array
    img_array = np.array(img)
    
    # Flatten the array to 1D
    img_array_flat = img_array.flatten()
    
    # Reshape the flattened array to have one column
    img_array_flat = img_array_flat.reshape(-1, 1)/255
    
    return img_array_flat

def makePredictions(X, W1 ,b1, W2, b2):
    dummy1,dummy2,dummy3, A2 = forwardPropagation(X, W1, b1, W2, b2)
    predictions = np.argmax(A2, 0)
    return predictions

def forwardPropagation(X,W1,b1,W2,b2):
    Z1 = W1.dot(X) + b1 #10, m
    A1 = np.maximum(Z1,0) # 10,m
    Z2 = W2.dot(A1) + b2 #10,m
    exp = np.exp(Z2 - np.max(Z2))
    A2=exp / exp.sum(axis=0)    
    return Z1, A1, Z2, A2

def predict_digit_from_image(image):
    with open("trained_params.pkl","rb") as dump_file:
        W1, b1, W2, b2=pickle.load(dump_file, encoding='latin1')
        
    # testimg=image_to_array(image)
    predictions = makePredictions(image, W1, b1, W2, b2).tolist()
    print(predictions)
    return jsonify({'image_array': predictions})

@app.route('/reverse_text', methods=['POST'])
def reverse_text():
    data = request.get_json()
    text = data['text']
    reversed_text = text[::-1]
    return jsonify({'reversed_text': reversed_text})

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']
    # Check if the file is empty
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    # Read the image using OpenCV
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)
    # Resize the image
    img = cv2.resize(img, dsize=(28, 28))
    # Convert the image to grayscale
    x = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Reshape the image array
    x = x.reshape((-1, 28, 28, 1))
    # Perform prediction (assuming `model` and `labels` are defined elsewhere)
    y = model.predict(x).squeeze()
    pred_idx = np.argmax(y)
    pred_char = labels[pred_idx]
    predictions = pred_char
    return jsonify({'image': predictions})
if __name__ == '__main__':
    app.run(debug=True) 
