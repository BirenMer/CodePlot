# CodePlot
Open-source tool for visualizing code file connections 
(The idea behind this is to simplify debugging by visualizing code).

### Currently Supports Python Lang.

### Docs:
Currenlty the tool is desing to display the function names present in a file, create cluster of function for each files and also the navigation bar contains file names and when clicked it provides a dropdown of the functions present within. Provides with a `CodePlot.html` file. 
#### Getting Started :
Steps:
1. Create a Virtual Env.
-> `python3 -m venv venv_name`
2. Install the dependencies.
-> `pip install -r requirements.txt`
3. Open the project file and change the directory_path to your project dir.
4. Run the python3 file
-> `python3 CodePlot.py`
   
And in a few moments you should see a html file opened in your browser with the code plotted.

### Upcoming Features:
* Support for other languages like Go Lang, C++, Node Js, Etc.
* API support.
* Making visualizations better with node and connection fouse in UI.
* Connect navigation bar elemetns and nodes to enable on click focus directly from the navigation bar in the UI.

### CodePlot Demo:
[CodePlot.webm](https://github.com/user-attachments/assets/e2a9134d-bcf8-4e81-b883-579751f38cf2)

