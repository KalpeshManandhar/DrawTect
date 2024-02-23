import numpy as np
from keras.datasets import mnist
import matplotlib.pyplot as plt

def ReLU(Z):
    return np.maximum(Z,0)

def derivativeReLU(Z):
    return Z > 0

def softmax(Z):
    """Compute softmax values for each sets of scores in x."""
    exp = np.exp(Z - np.max(Z))
    return exp / exp.sum(axis=0)

def initParams(size):
    W1 = np.random.normal(size=(10, size)) * np.sqrt(1./(size))
    b1 = np.random.normal(size=(10, 1)) * np.sqrt(1./10)
    W2 = np.random.normal(size=(10, 10)) * np.sqrt(1./20)
    b2 = np.random.normal(size=(10, 1)) * np.sqrt(1./(size))
    return W1,b1,W2,b2

def forwardPropagation(X,W1,b1,W2,b2):
    Z1 = W1.dot(X) + b1 #10, m
    A1 = ReLU(Z1) # 10,m
    Z2 = W2.dot(A1) + b2 #10,m
    A2 = softmax(Z2) #10,m
    return Z1, A1, Z2, A2

def oneHot(Y):
    ''' return a 0 vector with 1 only in the position correspondind to the value in Y'''
    one_hot_Y = np.zeros((Y.max()+1,Y.size))
    one_hot_Y[Y,np.arange(Y.size)] = 1
    return one_hot_Y

def backwardPropagation(X, Y, A1, A2, W2, Z1, m):
    one_hot_Y = oneHot(Y)
    dZ2 = 2*(A2 - one_hot_Y) #10,m
    dW2 = 1/m * (dZ2.dot(A1.T)) # 10 , 10
    db2 = 1/m * np.sum(dZ2,1) # 10, 1
    dZ1 = W2.T.dot(dZ2)*derivativeReLU(Z1) # 10, m
    dW1 = 1/m * (dZ1.dot(X.T)) #10, 784
    db1 = 1/m * np.sum(dZ1,1) # 10, 1

    return dW1, db1, dW2, db2

def updateParams(alpha, W1, b1, W2, b2, dW1, db1, dW2, db2):
    W1 -= alpha * dW1
    b1 -= alpha * np.reshape(db1, (10,1))
    W2 -= alpha * dW2
    b2 -= alpha * np.reshape(db2, (10,1))

    return W1, b1, W2, b2

def getPredictions(A2):
    return np.argmax(A2, 0)

def getAccuracy(predictions, Y):
    return np.sum(predictions == Y)/Y.size

def gradientDescent(X, Y, alpha, iterations):
    size, m = X.shape
    W1, b1, W2, b2 = initParams(size)
    for i in range(iterations):
        Z1, A1, Z2, A2 = forwardPropagation(X, W1, b1, W2, b2)
        dW1, db1, dW2, db2 = backwardPropagation(X, Y, A1, A2, W2, Z1, m)

        W1, b1, W2, b2 = updateParams(alpha, W1, b1, W2, b2, dW1, db1, dW2, db2)

        if i % 20 == 0:
            print(f"Iteration: {i} / {iterations}")
            prediction = getPredictions(A2)
            print(f'{getAccuracy(prediction, Y):.3%}')
    return W1, b1, W2, b2


(trainX, trainY), (testX, testY) = mnist.load_data()
print(trainX.shape)

SCALE_FACTOR=255

Xtest=((testX.reshape(testX.shape[0],testX.shape[1]*testX.shape[2])).T)/SCALE_FACTOR
X=((trainX.reshape(trainX.shape[0],trainX.shape[1]*trainX.shape[2])).T)/SCALE_FACTOR

m,n=X.shape
print(m,n)
W1, b1, W2, b2 = gradientDescent(X, trainY, 0.15, 500)


def makePredictions(X, W1 ,b1, W2, b2):
    d1,d2,d3, A2 = forwardPropagation(X, W1, b1, W2, b2)
    predictions = getPredictions(A2)
    return predictions

def testDataPrediction(index,X, Y, W1, b1, W2, b2):
    tempX=X[:,index,None]
    prediction = makePredictions(tempX, W1, b1, W2, b2)
    label = Y[index]
    print("Prediction: ", prediction)
    print("Label: ", label)

    currentImage = testX[index]

    plt.gray()
    plt.imshow(currentImage, interpolation='nearest')
    plt.show()

def totalPrediction(X,Y,W1,b1,W2,b2):
  true=0
  false=0
  for i in range (Y.shape[0]):
    tempX=X[:,i,None]
    prediction=makePredictions(tempX, W1, b1, W2, b2)
    true=true+1 if prediction==Y[i] else true
    false=false+1 if prediction!=Y[i] else false

  return true, false


############## MAIN ##############

t,f=totalPrediction(Xtest,testY,W1,b1,W2,b2)
print(f"Correct: {t}, false: {f}")
print(f"total: {t+f}")

testDataPrediction(0,Xtest, testY, W1, b1, W2, b2)
testDataPrediction(1,Xtest, testY, W1, b1, W2, b2)
testDataPrediction(2,Xtest, testY, W1, b1, W2, b2)
testDataPrediction(990,Xtest, testY, W1, b1, W2, b2)
testDataPrediction(1000,Xtest, testY, W1, b1, W2, b2)