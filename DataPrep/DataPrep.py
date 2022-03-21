# -*- coding: utf-8 -*-

##################
#TEAM 44 DATA PREP
#################

import numpy as np 
import pandas as pd 
import seaborn as sns
import os
from os import listdir
from google.cloud import bigquery
import csv
import ast
from fastkml import kml
from itertools import chain
import sys

###############################
### GET LONDON CRIMES  DATA FROM Google Cloud
###############################
#For google cloud authentication:
#https://cloud.google.com/bigquery/docs/reference/libraries#client-libraries-resources-python
#a) download authentication json file that contain your authentication key
#b) in powershell $env:GOOGLE_APPLICATION_CREDENTIALS="path" (do not close PowerShell; path - path to json file)
#c) run this script with argument being path to your json file

Path_to_json=sys.argv[1]

credential_path = str(Path_to_json) #path to json file
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path

# Create a "Client" object
client = bigquery.Client()

# Construct a reference to the dataset
dataset_ref = client.dataset("london_crime", project="bigquery-public-data")

# API request - fetch the dataset
dataset = client.get_dataset(dataset_ref)
# fetch table
crime_by_lsoa_tab = client.get_table(dataset.table('crime_by_lsoa'))
#print table schema  
#print(crime_by_lsoa.schema)
#print(client.list_rows(crime_by_lsoa_tab, max_results=5).to_dataframe())

#SQL Queries
#Sum of minorcategory for all years
sql = """
SELECT minor_category, sum(value)
FROM   `bigquery-public-data.london_crime.crime_by_lsoa`
GROUP BY minor_category
"""

#all LSOA codes
sql2 = """
SELECT DISTINCT lsoa_code
FROM   `bigquery-public-data.london_crime.crime_by_lsoa`
"""
#all major categroeis
sql2a = """
SELECT DISTINCT major_category
FROM   `bigquery-public-data.london_crime.crime_by_lsoa`
"""
#all minor categories
sql2b = """
SELECT DISTINCT minor_category
FROM   `bigquery-public-data.london_crime.crime_by_lsoa`
"""

#all SUM of cirmes for LSOA and major, minor category (allow 2 min to run)
sql3 = """
SELECT lsoa_code,  sum(value) AS Sum_crime, major_category
FROM   `bigquery-public-data.london_crime.crime_by_lsoa`
GROUP BY lsoa_code, major_category, minor_category
ORDER BY Sum_crime DESC
"""

#all SUM of cirmes for LSOA and major category for  (allow 2 min to run)
sql4 = """
SELECT lsoa_code,  sum(value) AS Sum_crime, major_category
FROM   `bigquery-public-data.london_crime.crime_by_lsoa`
WHERE year = 2016 OR year = 2017 OR year = 2015
GROUP BY lsoa_code, major_category
"""

#select query and save query results to pandas dataframe
df = client.query(sql3).to_dataframe()

#optional export of dataframe to csv
#df.to_csv('outputfromquery.csv',index=False)

############################################################
#Pivot output of the SQL query
#############################################################
df=df.pivot_table(index=['lsoa_code'], columns=['major_category'], values='Sum_crime', aggfunc=np.sum, fill_value=0).reset_index()
df.columns.name = None
df['SumOfCrimes'] = df.sum(axis=1)

#################################################
#Load COORDINATES for CENTROIDS and join to main dataframe (df1)
################################################
Centroids=pd.read_csv('data\Lower_Layer_Super_Output_Areas_December_2011_Population_Weighted_Centroids.csv', usecols = ['X','Y','lsoa11nm','lsoa11cd'])
Centroids.rename(columns={"lsoa11cd": 'lsoa_code'}, inplace=True)
df1= pd.merge(df, Centroids, on='lsoa_code', how='inner')

################################
#Load LSOA ATLAS (socio-demographic) and join to df1
################################
XX = list() 
with open("data\lsoa-data.csv") as f:
     
        for line in csv.reader(f, delimiter=","):
            xline = []
            for i in range(len(line)):
                    xline.append(line[i])
            XX.append(xline[:])

LsoaAtlas = pd.DataFrame.from_records(XX, columns=XX[0])
LsoaAtlas.drop(LsoaAtlas.index[4837], inplace=True)
LsoaAtlas.drop(LsoaAtlas.index[4836], inplace=True)
LsoaAtlas.drop(LsoaAtlas.index[0], inplace=True)
LsoaAtlas=LsoaAtlas.replace('-',np.NaN)
LsoaAtlas.fillna(method='ffill', inplace=True)
LsoaAtlas.rename(columns={"Lower Super Output Area": 'lsoa_code'}, inplace=True) 
df1= pd.merge(df1, LsoaAtlas, on='lsoa_code', how='inner')

#Remove columns with etnic, religion and other unneccesery features
colstokeep1=pd.read_csv('coltokeep1.csv')
colstokeep1=colstokeep1.columns.tolist()
df1=df1[colstokeep1]


##################################################################################
#Read kml files from folder gla-lsoa-kml-files,extract VEGETATION values and join to df1
##################################################################################
kmlfiles = listdir("data\gla-lsoa-kml-files")[0:51]
AllFileLits=[]

for i in range(len(kmlfiles)):
    with open("data\gla-lsoa-kml-files/"+kmlfiles[i], 'rt',encoding='utf-8') as myfile:
        doc=myfile.read().encode('utf-8')
    k = kml.KML()
    # Read in the KML string
    k.from_string(doc)
    features = list(k.features())
    f2 = list(features[0].features())
    #take: 0- curio_canopy_percentage,4- percentage_vegetation_cover ,8 - area,9 - LSOA code 
    OneFileList=[]
    for i in range(len(f2)):
        a=f2[i].extended_data.etree_element()
        b=[a[0][0].text, a[4][0].text, a[8][0].text, a[9][0].text]
        OneFileList.append(b)
    AllFileLits.append(OneFileList)

headers=["curio_canopy_percentage","percentage_vegetation_cover", "area", "lsoa_code" ]
VegeDf = pd.DataFrame(np.array(list(chain.from_iterable(AllFileLits))),columns=headers)
#join to existing dataframe
df1= pd.merge(df1, VegeDf, on='lsoa_code', how='inner')


############################
#Load Household INCOME Estimates and join
###########################
XX=[]
with open("data\modelled-household-income-estimates-lsoa.csv") as f:
        for line in csv.reader(f, delimiter=","):
            xline = []
            for i in range(len(line)):
                    xline.append(line[i])
            XX.append(xline[:])

Income = pd.DataFrame.from_records(XX, columns=XX[0])
Income.drop(Income.index[0], inplace=True)

Income=Income[["Code","Median 2012/13"]]
Income['Median 2012/13']=Income['Median 2012/13'].map(lambda x: x.lstrip('£'))
Income['Median 2012/13']=Income['Median 2012/13'].str.replace(',', '')
Income['Median 2012/13']=Income['Median 2012/13'].astype(int)
Income.rename(columns={"Code": 'lsoa_code',"Median 2012/13": 'IncomeEstimate'}, inplace=True)
df1= pd.merge(df1, Income, on='lsoa_code', how='inner')


############################
#Load HOUSE PRICES and join
###########################
XX=[]
with open("data\land-registry-house-prices-LSOA.csv") as f:
        for line in csv.reader(f, delimiter=","):
            xline = []
            for i in range(len(line)):
                    xline.append(line[i])
            XX.append(xline[:])

HousePrices = pd.DataFrame.from_records(XX, columns=XX[0])
HousePrices.drop(HousePrices.index[0], inplace=True)

HousePrices=HousePrices.loc[HousePrices['Measure'] == 'Median']
HousePrices=HousePrices.loc[HousePrices['Year'] == 'Year ending Mar 2016']
HousePrices.drop(columns=['Area', 'Year',"Measure"], inplace=True)
HousePrices=HousePrices.replace(':',np.NaN)
HousePrices.fillna(method='ffill', inplace=True)
HousePrices.rename(columns={"Code": 'lsoa_code', "Value":"HousePrices2016"}, inplace=True)
df1= pd.merge(df1, HousePrices, on='lsoa_code', how='inner')

#Columns to numeric
cols=df1.columns.drop(['lsoa_code','lsoa11nm','Names'])
df1[cols] = df1[cols].apply(pd.to_numeric, errors='coerce')
#calculated columns Total crimes LOG
df1["Total_crimeLog"]=np.log(df1["SumOfCrimes"]/(df1["area"]/1000000)) #number of cimres per km2
df1["Violence_Log"] = np.log(df1["Violence Against the Person"] / (df1["2011 Census Population;Age Structure;All Ages"]/1000))
df1["Damage_Log"] = np.log(df1["Criminal Damage"] / df1["2011 Census Population;Age Structure;All Ages"])
df1["Burglary_Log"] = np.log(df1["Burglary"] / df1["2011 Census Population;Age Structure;All Ages"])
df1["Theft_Log"] = np.log(df1["Theft and Handling"] / df1["2011 Census Population;Age Structure;All Ages"])
df1["owner_occupied"] = df1["Tenure;Owned outright (%);2011"] + df1["Tenure;Owned with a mortgage or loan (%);2011"]




#Final export to csv file for visualisation
df1.to_csv('VegetationCrimesVis.csv',index=False,sep=",")

# Remove outliers and export csv for modelling
outliers=["E01000003", "E01033577","E01000001","E01000002","E01000005","E01000405","E01000408",
"E01001365","E01001711","E01004218","E01004276","E01032638","E01032740","E01032774",
"E01032775","E01032779","E01032780","E01032790","E01033132","E01033574","E01033575",
"E01033582","E01033728","E01033733","E01033736","E01032739","E01033577","E01033581"]
df1b=df1[~df1['lsoa_code'].isin(outliers)]

df1b.to_csv('VegetationCrimesModel.csv',index=False,sep=",")

print("-- Files saved --")
print("-- First plot: --")
# use the function regplot to make a scatterplot
firstplot=sns.regplot(x=df1b["Total_crimeLog"], y=df1b["percentage_vegetation_cover"])
firstplot.set(xlabel='ln(total crimes / area [$km^{2}$])', ylabel='Vegetation cover [%]')







