#!/usr/bin/env python
# coding: utf-8

import numpy as np
import libpysal as ps
from mgwr.gwr import GWR, MGWR
from mgwr.sel_bw import Sel_BW
from mgwr.summary import summaryGWR
import csv

# Read input file and prepare training and validation set
london = ps.io.open('../DataPrep/VegetationCrimesModel.csv')

lsoa_codes = london.by_col('lsoa_code')

X_columns = ['curio_canopy_percentage',
             'Population Density;Persons per hectare;2012',
             'owner_occupied']

pct_canopy = np.array(london.by_col('curio_canopy_percentage')).reshape((-1,1))
density = np.array(london.by_col('Population Density;Persons per hectare;2012')).reshape((-1,1))
owner_occu = np.array(london.by_col('owner_occupied')).reshape((-1,1))

X = np.hstack([pct_canopy, density, owner_occu])
y = np.array(london.by_col('Violence_Log')).reshape((-1,1))
u = london.by_col('X')
v = london.by_col('Y')
coords = list(zip(u,v))

np.random.seed(908)
data_size = len(london)
sample_size = int(float(data_size) * 0.2)
sample = np.random.choice(range(data_size), sample_size)
mask = np.ones_like(y,dtype=bool).flatten()
mask[sample] = False

cal_coords = np.asarray(coords)[mask]
cal_y = y[mask]
cal_X = X[mask]
print("len(cal_y) = ", len(cal_y))

pred_coords = np.asarray(coords)[~mask]
pred_y = y[~mask]
pred_X = X[~mask]
print("len(pred_y) = ", len(pred_y))

# Train GWR model
gwr_selector = Sel_BW(cal_coords, cal_y, cal_X)
gwr_bw = gwr_selector.search(bw_min=2)
print("training gwr_bw = ", gwr_bw)

full_gwr_selector = Sel_BW(coords, y, X)
full_gwr_bw = gwr_selector.search(bw_min=2)
print("full gwr_bw = ", full_gwr_bw)

GWR_model = GWR(cal_coords, cal_y, cal_X, gwr_bw)
gwr_results = GWR_model.fit()

GWR_full_model = GWR(coords, y, X, full_gwr_bw)
full_gwr_results = GWR_full_model.fit()

# Output trained model coefficients (including intercept) to a csv file
with open('GWR_Coefficients - LSOA Violence.csv', mode='w', newline='') as coeff_file:
    coefficient_writer = csv.writer(coeff_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

    coefficient_writer.writerow(['lsoa_code', 'intercept'] + X_columns)

    for i, row in enumerate(full_gwr_results.params):
        coefficient_writer.writerow([lsoa_codes[i]] + [str(x) for x in row])

# Test model accuracy on the validation set
scale = gwr_results.scale
residuals = gwr_results.resid_response

pred_results = GWR_model.predict(pred_coords, pred_X, scale, residuals)

y_bar = np.sum(pred_y)/len(pred_y)
print ("y_bar = ", y_bar)

yhat = pred_results.predictions

# R^2 calculation
ssreg = np.sum((yhat - y_bar) ** 2)
sstot = np.sum((pred_y - y_bar) ** 2)
r_square = ssreg / sstot

print("GWR r^2 = ", r_square)
print("Correlation coef = ", np.corrcoef(pred_results.predictions.flatten(), pred_y.flatten())[0][1])
print("GWR summary: ", full_gwr_results.summary())

# What-if scenario for 10% increase in canopy cover
pred_X_whatif = pred_X.copy()
pred_X_whatif[: ,0] *= 1.1

pred_results_whatif = GWR_model.predict(pred_coords, pred_X_whatif, scale, residuals)

average_increase_violence = (np.sum(pred_results_whatif.predictions) - np.sum(pred_results.predictions)) / len(pred_results.predictions)

print ("Average increase in Violence_Log due to 10% increase in canopy cover = ", average_increase_violence)
