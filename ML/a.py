import pickle
import numpy as np
from PIL import Image

def image_to_array(image_file):
    # Open the image file
    img = Image.open(image_file)
    # Convert the image to grayscale
    img = img.convert('L')
    # Resize the image to a fixed size if needed
    # img = img.resize((28, 28))
    # Convert the image to a numpy array
    img_array = np.array(img)
    # Normalize the pixel values to be between 0 and 1
    img_array = img_array / 255.0
    # Flatten the array
    img_array_flat = img_array.flatten()
    return img_array_flat.tolist()

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
        
    predictions = makePredictions(image, W1, b1, W2, b2).tolist()
    print(predictions)
    return predictions
    # return jsonify({'image_array': predictions})


def preprocess_image(image_path):
    # Open the image file
    img = Image.open(image_path)
    
    # Convert the image to grayscale
    img = img.convert('L')
    
    # Resize the image to 28x28 pixels
    img = img.resize((28, 28))
    
    # Convert the image to a numpy array
    img_array = np.array(img)
    
    # Flatten the array to 1D
    img_array_flat = img_array.flatten()
    
    # Reshape the flattened array to have one column
    img_array_flat = img_array_flat.reshape(-1, 1)
    
    return img_array_flat

# Example usage:
image_path = "test.png"  # Replace with the path to your image file
result_array = preprocess_image(image_path)
print(result_array)
