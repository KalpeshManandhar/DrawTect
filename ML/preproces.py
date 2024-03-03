import cv2
# from matplotlib import pyplot as plt
import numpy as np
from tensorflow.keras.models import load_model
import pandas as pd


labels = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabdefghnqrt'


class Test():
	def __init__(self) -> None:
		self.model=load_model('htr.h5')
		self.finalStr=str('')
		self.maxGap=100
		self.lastX=0
		self.lastY=0
		self.contourNumber=0
		# self.mapp=pd.read_csv('')

	
	def readImage(self, image_uri=False,img=False):
		self.finalStr=""
		# Read image
		self.image=cv2.imread(image_uri) if image_uri==True else img
		# Create a copy of image and convert it to grayscale
		gray=cv2.cvtColor(self.image.copy(),cv2.COLOR_BGR2GRAY)

		# if pixel>85 convert to 0 meaning black else convert to while meaning 255
		ret, thresh= cv2.threshold(gray.copy(),100,255,cv2.THRESH_BINARY_INV)

		contours, hierarchy=cv2.findContours(thresh.copy(),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
		print(len(contours))

		cList=[]
		for i in contours:
			cList.append(cv2.boundingRect(i))

		nparray=np.array(cList)
		maxHeight=nparray.max(axis=0)[3]
		nearest=maxHeight*	1.4
		# sorted_contours=sorted(contours,
		# 				 key=lambda ctr:[int(nearest * round(float(cv2.boundingRect(ctr)[1])/nearest)),
		# 			   cv2.boundingRect(ctr)[0]])
		sorted_contours = sorted(contours, key=lambda ctr: (cv2.boundingRect(ctr)[0]/nearest, cv2.boundingRect(ctr)[1]))


		counter=0
		sumGap=0
		lastX=0
		lastY=0
		for c in sorted_contours:
			x,y,w,h=cv2.boundingRect(c)
			if counter == 0:
				counter+=1
			elif y> lastY:
				pass
			else:
				sumGap+=x-lastX
				counter +=1
			
			lastX = x+w
			lastY=y+h
		
		self.maxGap=int(sumGap/(counter-1))
		print(f"Max Gap:{self.maxGap}: Counter {counter}")

		isFirst=True
		for c in sorted_contours:
			x,y,w,h=cv2.boundingRect(c)

			if self.contourNumber != 0 and x-self.lastX>self.maxGap:
				self.finalStr +=''
				isFirst=True
			
			# if self.contourNumber !=0 and y>self.lastY:
			# 	self.finalStr += '\n'
			# 	isFirst = True

			self.lastX=x+w
			self.lastY=y+h

			cv2.rectangle(self.image,(x,y),(x+w,y+h),color=(0,255,0),thickness=2)


			digit=thresh[y:y+h, x:x+w]

			resized_digit=cv2.resize(digit,(20,20))

			padded_digit=np.pad(resized_digit,((4,4),(4,4)),"constant",constant_values=0)

			padded_digit = padded_digit.astype('float32')/255

			prediction= self.model.predict(padded_digit.reshape(1,28,28,1))
			pred_str=labels[np.argmax(prediction)]

			cv2.putText(self.image,str(pred_str),(x,y-10),
			   cv2.FONT_HERSHEY_SIMPLEX,0.6,(36,255,12),2)
			
			# cv2.putText(self.image,"%",str(round(prediction[0][pred_str]*100,1)),(x,y+h+20),
			#    cv2.FONT_HERSHEY_SIMPLEX,0.6,(36,255,12),2)
			
			self.finalStr+=pred_str

			# plt.imshow(self.image,cmap='gray')
			# plt.show()

			self.contourNumber+=1
			isFirst= False

		print(f"{self.finalStr}")
		# cv2.imshow('Detected Text', self.image)
		# cv2.waitKey(0)
		# cv2.destroyAllWindows()
		return self.finalStr
		

if __name__ == '__main__':    
	label=Test()
	# label.readImage('test.png')