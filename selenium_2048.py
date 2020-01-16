from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.keys import Keys
import numpy as np
import Two_Forty_Eight as tfe

driver = webdriver.Chrome()
driver.get('https://gabrielecirulli.github.io/2048/')

directions = {'up': Keys.UP, 'right': Keys.RIGHT, 'down': Keys.DOWN, 'left': Keys.LEFT}


def get_values(tile):
    fields = tile.replace('-', ' ').split(' ')
    value = int(fields[2])
    row = int(fields[6])
    col = int(fields[5])
    
    return ((row, col), value)

def get_board(driver):
    WebDriverWait(driver, 10).until(ec.visibility_of_all_elements_located)
    tile_container = driver.find_element_by_class_name('tile-container')

    tiles = tile_container.find_elements_by_class_name('tile')

    tile_classes = [t.get_attribute('class') for t in tiles]

    tiles_data = [get_values(tile) for tile in tile_classes]
    
    board = np.zeros((4,4))

    for ((row, col), value) in tiles_data:
        board[row-1][col-1] = value
    
    return board

grid = driver.find_element_by_tag_name('body')

driver.find_element_by_class_name('grid-container').click()

while True:
    board = get_board(driver)
    optimal_direction = tfe.minimax_decision(board)
    grid.send_keys(directions[optimal_direction])
    WebDriverWait(driver, 0.00001)

