# DrawTect: Scribble to Solve

<img  src="./DrawTect-Assets/logoWhite.svg"  width="736"  height="100"  alt="logo"/>

DrawTect is an extension to Visual Studio Code, which adds drawing support to the editor, allowing users to create diagrams/small notes that could aid in better understanding and visualization of the concepts being implemented. The extension also allows users to insert these notes/pictures within their code, grouping the code and the notes
relating to it in the same place. This is especially useful in areas where comments might not be sufficient such as computer graphics, game development, and so on.
It also provides a conversion from handwritten notes to text using a simple HCR model trained on EMNIST handwritten alphabet dataset. This model uses Convolutional Neural Network (CNN) architecture to train and recognize the handwritten characters present in the VSCode interface.


## Installation

1. Clone the repository.
2. Create a workspace in VSCode.
3. Run the extension.

## Project Screenshots
<p float = "down">
  <img  src="./DrawTect-Assets/interface.png" height="400"  alt="DrawTect Interface"/>
  <img  src="./DrawTect-Assets/codeactions.png" height="300"  alt="Code Action"/>
</p> 

<p float = "left">
	<img  src="./DrawTect-Assets/Recognize.png" height="200"  alt="Character Recognition"/>
	<img  src="./DrawTect-Assets/smooth.png" height="200"  alt="Stroke Smoothness"/>
</p>


## Features

- **Whiteboard Application:** Includes drawing tools, panning, shapes, image insertion, and textboxes.
- **Smooth Strokes:** Utilizes cubic Bezier splines for smooth stroke rendering.
- **Quick Access:** Allows easy access to whiteboard files from source files via comments.
- **Handwritten Character Recognition:** Converts handwritten characters to digital text.

## 
Developed by Team Dots [2024]