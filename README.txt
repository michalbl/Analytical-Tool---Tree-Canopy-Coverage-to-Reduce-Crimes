----------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------
For the 90% of users who only want to consume the final output: 
    Download the .zip file and unpack it
    In cmd.exe, Anaconda prompt or Mac Terminal navigate to team44final/CODE/Vis/compiled and
    enter the command python -m http.server 8000. Depending on your installation, you should use python3 -m http.server 8000
    Open a web browser and go to localhost:8000

----------------------------------------------------------------------------------------------------------------------------------------
Below are the instructions for the DataPrep and Modeling stages for those who wish to perform the full pipeline and recreate the results.
Throughout the guide, for python commands, check whether the keyword to run python on your PC is "python" or "python3".
----------------------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------------------

DESCRIPTION
-----------
The code used in our project is located in 3 folders:
- DataPrep
- Model
- Vis

DataPrep folder contains small datasets and python script (DataPrep.py) to perform API call, loading csv, joining and cleaning and wragling of datasets. Four datasets are avaiable in folder "data". Two other datasets need to be downloaded (see Installation). One dataset is expored using Google Cloud BigQuery. The output from running the python script are 2 csv files: VegetationCrimesVis.csv and VegetationCrimesModel.csv. First one used for Visualization and second one for Modeling.

Model folder contains the python script used for training the model (GWR_prediction_LSOA_violence.py), the output of running it on the data file prepared by the DataPrep stage (GWR_Coefficients - LSOA Violence.csv), from which the model coefficients were taken for the Visualization , and also the picture file used for the report model section (London LSOA predicted increase in Violent Crime per increase in Canopy Cover.png), and the QGIS project file used to generate that map (Canopy coefficients - blues.qgz)

Vis folder contains the javascript source code of the visualization website and the compiled code needed to run the website. The compiled folder is self-contained (needed data files are already part of it) and only requires an http-server to run (e.g. python, node, etc.).

INSTALLATION 
------------
- Data preparation:
>> pip install fastkml
>> pip install google-cloud-bigquery
Other libraries should be available.
- Next, download land-registry-house-prices-LSOA.csv file (84.62 MB) from https://data.london.gov.uk/dataset/average-house-prices and save it in "data" folder. 
- Then, download gla-lsoa-kml-files.zip file from https://data.london.gov.uk/dataset/curio-canopy (21.24 MB). 
	The files should be unzipped to "DataPrep\data\gla-lsoa-kml-files" (this folder should then have 55 files and 69 MB).
	/!\ Please make sure the folder structure is "DataPrep\data\gla-lsoa-kml-files\[files]", otherwise the code won't run! /!\
- In order to be able to use BigQuery API, please follow the steps in:
https://cloud.google.com/bigquery/docs/quickstarts/quickstart-client-libraries#client-libraries-usage-python
DataPrep.py accepts one argument which is the path to authentication json file.

Modeling
- In Anaconda powershell prompt:
>> conda install -c conda-forge mgwr
Note: conda is highly recommended for mgwr installation, especially on Windows, as other methods (e.g. pip) are more complex, due to its prerequisites. See:
https://geoffboeing.com/2014/09/using-geopandas-windows/
- Optional - for reviewing the QGIS project used to generate the coefficient map (for the report only, not for project visualization), QGIS is freeware that can be installed from: https://qgis.org/en/site/forusers/download.html

Visualization
- No installation steps are required to run the compiled code.
- To edit the source code the following commands need to be run to install dependencies:
	- download and install node.js from https://nodejs.org/en/download/
	- next, install angular-cli by running the command: npm install -g @angular/cli
	- From the command line, in the Code/vis/code folder: execute "npm install".

EXECUTION
---------
Data preparation
- From the command line, in the Code/DataPrep folder: 
>> python3 DataPrep.py <PATH_TO_API_AUTHENTICATION_JSON_FILE>

Modeling
- From the command line, in the Code/Model folder: 
>> python3 GWR_prediction_LSOA_violence.py
The python script expects to find its input file (VegetationCrimesModel.csv), in the relative location as in the download (..\DataPrep\VegetationCrimesModel.csv)

Visualization
- To run the visualization tool without the need to change code:
	- Using command line navigate to folder "Vis/compiled" and execute "python3 -m http.server". 
		In a web browser navigate to localhost:8000. 
	- python is just one of the http-servers that can run the compiled folder. 
		Other servers can be used (might require installation).
- To run the visualization tool and have the ability to edit code:
	- Using command line navigate to folder "Vis/code" and execute "ng serve". In a web browser navigate to localhost:4200. 
		You can edit the code at "Vis/code/src" using a text editor or and IDE.

DONE - Our service is ready to work.
