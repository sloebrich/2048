# -*- coding: utf-8 -*-
"""
Created on Mon Dec 16 17:23:53 2019

@author: steff
"""

import numpy as np
import random
import time

DECISION_TIME = 0.2
MAX_DEPTH = 6

def merge(cells, n=4):
    if cells:
        j=0
        while j < len(cells)-1:
                if cells[j] == cells[j+1]:
                    cells[j]=2*cells[j]
                    del cells[j+1]
                j+=1                    
    while len(cells)<n:
        cells.append(0)
    return cells

def player_move(board, direction):
        n=len(board)    
        new_board = board.copy()
        for i in range(n):
            if direction in ['up', 'down']:
                cells = board[:,i][board[:,i]!=0]
            else: 
                cells = board[i,:][board[i,:]!=0]                
            if direction in ['down', 'right']:
                cells = cells[::-1]
            cells = merge(list(cells), n=n)
            if direction in ['down', 'right']:
                cells = cells[::-1]
            for j in range(n):
                if direction in ['up', 'down']:
                    new_board[:,i] = cells
                elif direction in ['left', 'right']:
                    new_board[i,:] = cells
        return new_board
    
def computer_move(board, *args, random_move=True):
    if random_move:       
        empty_tiles = np.argwhere(board==0)
        pos = random.choice(empty_tiles)
        val = np.random.choice([2,4], p=[0.9, 0.1])
    else:
        pos=args[0]
        val=args[1]
    new_board = board.copy()
    new_board[pos[0],pos[1]] = val
    return new_board

board = np.zeros((4,4))
for _ in range(5):
    board = computer_move(board)

def child_list(board, player):
    children = []
    if player == 'pl':
        for direction in ['up', 'down', 'left', 'right']:
            child = player_move(board, direction)
            if np.any(child!=board):
                children.append((child, direction))
    elif player == 'cp':
            empty_tiles = np.argwhere(board==0)
            for pos in empty_tiles:
                children.append(computer_move(board, pos, 2, random_move=False))
                children.append(computer_move(board, pos, 4, random_move=False))
    return children
        
def max_value(board):
    return int(np.max(board))

#def gradient_matrix(board):
#    gradient = np.array([ 
#       [[ 3,  2,  1,  0],
#        [ 2,  1,  0, -1],
#        [ 1,  0, -1, -2],
#        [ 0, -1, -2, -3]],
#
#       [[ 0,  1,  2,  3],
#        [-1,  0,  1,  2],
#        [-2, -1,  0,  1],
#        [-3, -2, -1,  0]],
#
#       [[ 0, -1, -2, -3],
#        [ 1,  0, -1, -2],
#        [ 2,  1,  0, -1],
#        [ 3,  2,  1,  0]],
#
#       [[-3, -2, -1,  0],
#        [-2, -1,  0,  1],
#        [-1,  0,  1,  2],
#        [ 0,  1,  2,  3]]
#       ])
#    return int(max([np.sum(ray) for ray in gradient*board]))

def gradient_matrix(board):
    n=len(board)
    base = 4
    exponents = [7,3,1,0,-1,-3,-7]
    gradient = np.zeros((4,4))
    for i in range(n):
        for j in range(n):
            gradient[i,j] = base**exponents[i+j]
    high_board = np.where(board<=4, 0, board)
    return int(np.sum(gradient*high_board))

def merger(board):
    merger=0
    n=len(board)
    for i in range(0,n):
        for j in range(0,n):
            if i<n-1 and board[i+1,j]==board[i,j]:
                merger+=board[i,j]
            if j<n-1 and board[i,j+1]==board[i,j]:
                merger+=board[i,j]
    return int(merger/8)

def empty_tiles(board):
    return len(np.argwhere(board==0))

def utility_function(board):
    return gradient_matrix(board)+np.max(board)*empty_tiles(board)

def minimax_decision(board, utility=gradient_matrix):
    starting_time = time.time()
    children = child_list(board, 'pl')
    child , direction = max(children, key=lambda x: min_util(x[0], -np.inf, np.inf, MAX_DEPTH, starting_time, utility))
    return direction

def max_util(board, a,b, depth, starting_time, utility):    
    v=-float('inf')
    children = [c[0] for c in child_list(board, 'pl')]
    if not children or depth==0 or time.time()-starting_time > DECISION_TIME:
        return utility(board)
    for child in children:
        v=max(v,min_util(child,a,b, depth-1, starting_time, utility))
        if v>=b:
            return v
        a=max(v,a)
    return v

def min_util(board,a,b, depth, starting_time, utility):
    v=float('inf')
    children = child_list(board, 'cp')
    if not children or depth==0 or time.time()-starting_time > DECISION_TIME:
        return utility(board)
 #   children.sort(key=lambda x: utility(x))
    for child in children:
        v=min(v,max_util(child,a,b, depth-1, starting_time, utility))
        if v<=a:
            return v
        b=min(b,v)
    return v

def Game(utility=utility_function):
    board = np.zeros((4,4))
    i=0
    while empty_tiles(board):
        i+=1
        if not i%50:
            print(board)
        board = computer_move(board)
        if child_list(board, 'pl'):
            direction = minimax_decision(board, utility)
            board = player_move(board, direction)  
    return board