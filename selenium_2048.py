#!/usr/bin/python
# -*- coding: utf-8 -*-
# Pierre Haessig — May 2014
"""A simple code to interact in Python with the "real" 2048 game in web browser.
"""

from __future__ import print_function
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import numpy as np
import re
import time
import Two_Forty_Eight as tfe

driver = webdriver.Chrome()
driver.get('https://gabrielecirulli.github.io/2048/')

directions = {'up': Keys.UP, 'right': Keys.RIGHT, 'down': Keys.DOWN, 'left': Keys.LEFT}


def parse_classname(s):
    '''
    ex: s = 'tile tile-4 tile-position-1-2 tile-new'
    ou  'tile tile-4 tile-position-1-4'
      'tile tile-4 tile-position-3-4 tile-merged'
      
    Returns: ((row, col), value, flag)
    '''
    fields = s.replace('-', ' ').split(' ')
    # ex: [u'tile', u'tile', u'4', u'tile', u'position', u'1', u'2', u'tile', u'new']
    value = int(fields[2])
    row = int(fields[6])
    col = int(fields[5])
    
    return ((row, col), value)

def get_board(driver):
    WebDriverWait(driver, 10).until(ec.visibility_of_all_elements_located)
    tile_container = driver.find_element_by_class_name('tile-container')
#    tile_container = WebDriverWait(driver, 10).until(ec.refreshed(ec.stalenessOf((By.CLASS_NAME, 'tile-container'))))
#    WebDriverWait(driver, 10).until(ec.visibility_of_element_located((By.CLASS_NAME, 'tile')))
    tiles = tile_container.find_elements_by_class_name('tile')
    #print(tiles)
    # information can be retrieved from tile class names:
    tile_classes = [t.get_attribute('class') for t in tiles]
    #print('\n'.join(tile_classes))
    
    # a list of tiles (row, col), value, flag)
    tiles_data = [parse_classname(s) for s in tile_classes]
    
    # Build the grid
    board = np.zeros((4,4))

    for ((row, col), value) in tiles_data:
        board[row-1][col-1] = value
    
    return board

grid = driver.find_element_by_tag_name('body')
#count = 0
driver.find_element_by_class_name('grid-container').click()
while True:
#    count += 1
    board = get_board(driver)
    optimal_direction = tfe.minimax_decision(board)
    grid.send_keys(directions[optimal_direction])
    WebDriverWait(driver, 0.00001)
#    try:
#        WebDriverWait(driver, 0.00001).until(EC.presence_of_element_located((By.ID, "game-message game-over")))
#        driver.find_element_by_class_name('game-over').click()
#    except:
#        continue
