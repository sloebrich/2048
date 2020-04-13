// jshint esversion:6
const moveSpeed = 75;
const mergeSpeed = 200;
const spawnSpeed = 500;

var animations = [];
var gameOver = false;

$(function() {
  computerMove();
  computerMove();
});


$(document).keydown(function(event) {
  let key = event.key;
  if (["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(key)) {
    let direction = /Arrow([A-Z]\w+)/.exec(key)[1].toLowerCase();
    if (validMove(direction) && !gameOver) {
      Promise.all(animations).then(handleKeydown(direction));
      Promise.all(animations).then(computerMove());
    } else if (gameOver) {
      $(".tile-container").fadeTo("slow", 0.4);
      $("<div class='gameover'><p>Game Over</p><button>Try again</button></div>").appendTo($("body"));
      $("button").click(function() {
        location.reload();
      });
    }
  }
});

const threshold = 150; //required min distance traveled to be considered swipe
const allowedTime = 400; // maximum time allowed to travel that distance
const tolerance = 100;
var startX;
var startY;
var startTime;

$(document).on({'touchstart': function(e){
        var touchobj = e.changedTouches[0];
        startX = touchobj.pageX;
        startY = touchobj.pageY;
        startTime = new Date().getTime(); // record time when finger first makes contact with surface
    }});

$(document).on({'touchend': function(e){
        let touchobj = e.changedTouches[0];
        let distX = touchobj.pageX - startX; // get total dist traveled by finger while in contact with surface
        let distY = touchobj.pageY - startY;
        let elapsedTime = new Date().getTime() - startTime; // get time elapsed
        let direction;
        // check that elapsed time is within specified, horizontal dist traveled >= threshold, and vertical dist traveled <= 100
        if(elapsedTime <= allowedTime){
          if( distX >= threshold && Math.abs(distY) <= tolerance){
            direction = "right";
          }
        else if( distX <= -threshold && Math.abs(distY) <= tolerance){
            direction = "left";
        }
        else if ( distY <= -threshold && Math.abs(distX) <= tolerance){
          direction = "up";
        }
        else if ( distY >= threshold && Math.abs(distX) <= tolerance){
            direction = "down";
        }
      }
      if(direction){
        if (validMove(direction) && !gameOver) {
          Promise.all(animations).then(handleKeydown(direction));
          Promise.all(animations).then(computerMove());
        } else if (gameOver) {
          $(".tile-container").fadeTo("slow", 0.4);
          $("<div class='gameover'><p>Game Over</p><button>Try again</button></div>").appendTo($("body"));
          $("button").on({'touchstart': function() {
            location.reload();
          }});
        }}
    }});



function moveTile(tile, pos, animations) {
  let tileX = /row\d/.exec(tile.attr("class"))[0];
  let tileY = /col\d/.exec(tile.attr("class"))[0];
  const percs = [null, "0%", "25%", "50%", "75%"];
  if (tileX == "row" + pos.x) {
    const animationSpeed = moveSpeed * Math.abs(tileY[3] - pos.y);
    let move = tile.animate({
      "left": percs[pos.y]
    }, animationSpeed).promise();
    animations.push(move);
    tile.addClass("col" + pos.y);
    tile.removeClass(tileY);
  } else if (tileY == "col" + pos.y) {
    const animationSpeed = moveSpeed * Math.abs(tileX[3] - pos.x);
    let move = tile.animate({
      "top": percs[pos.x]
    }, animationSpeed).promise();
    animations.push(move);
    tile.addClass("row" + pos.x);
    tile.removeClass(tileX);
  }

}

function merge(pos, value, animations) {
  let tiles = $(".row" + pos.x + ".col" + pos.y + ".val" + value);
  const mergeTile = $("<div class='tile row" + pos.x + " col" + pos.y + " val" + (2 * value) + "'>" + (2 * value) + "</div>");
  let createNew = mergeTile.appendTo($(".tile-container")).animate({
    "width": "+=10px",
    "height": "+=10px"
  }, 100).animate({
    "width": "-=10px",
    "height": "-=10px"
  }, 100).promise();
  let removeOld = tiles.fadeOut(mergeSpeed, function() {
    tiles.remove();
  }).promise();
  animations.push(createNew, removeOld);
}

function computerMove() {
  let emptyTiles = [];
  for (let i = 1; i <= 4; i++) {
    for (let j = 1; j <= 4; j++) {
      if ($(".row" + i + ".col" + j).length == 0) {
        emptyTiles.push([i, j]);
      }
    }
  }
  tileIndex = Math.floor(emptyTiles.length * Math.random());
  let x = emptyTiles[tileIndex][0];
  let y = emptyTiles[tileIndex][1];
  let v = 2;
  if (Math.random() > 0.9) {
    v = 4;
  }
  animations.push($("<div class='tile row" + x + " col" + y + " val" + v + "'>" + v + "</div>")
    .hide().appendTo($(".tile-container")).fadeIn(spawnSpeed, function() {
      if (emptyTiles.length == 1) {
        gameOver = true;
      }
    }).promise());
}

function handleKeydown(direction) {
  switch (direction) {
    case "up":
      for (let i = 1; i <= 4; i++) {
        let j = 1;
        let k = 2;
        while (j < 4 && k <= 4) {
          let occupied = $(".row" + j + ".col" + i);
          let toBeMoved = $(".row" + k + ".col" + i);
          if (toBeMoved.length == 0) {
            k++;
          } else if (occupied.length == 0) {
            moveTile(toBeMoved, {
              x: j,
              y: i
            }, animations);
            k++;
          } else if (occupied.text() === toBeMoved.text()) {
            let v = Number(occupied.text());
            moveTile(toBeMoved, {
              x: j,
              y: i
            }, animations);
            merge({
              x: j,
              y: i
            }, v, animations);
            j++;
            k = j + 1;
          } else {
            j++;
            k = j + 1;
          }
        }
      }
      break;
    case "down":
      for (let i = 1; i <= 4; i++) {
        let j = 4;
        let k = 3;
        while (j > 1 && k >= 1) {
          let occupied = $(".row" + j + ".col" + i);
          let toBeMoved = $(".row" + k + ".col" + i);
          if (toBeMoved.length == 0) {
            k--;
          } else if (occupied.length == 0) {
            moveTile(toBeMoved, {
              x: j,
              y: i
            }, animations);
            k--;
          } else if (occupied.text() === toBeMoved.text()) {
            let v = Number(occupied.text());
            moveTile(toBeMoved, {
              x: j,
              y: i
            }, animations);
            merge({
              x: j,
              y: i
            }, v, animations);
            j--;
            k = j - 1;
          } else {
            j--;
            k = j - 1;
          }
        }
      }
      break;
    case "left":
      for (let i = 1; i <= 4; i++) {
        let j = 1;
        let k = 2;
        while (j < 4 && k <= 4) {
          let occupied = $(".row" + i + ".col" + j);
          let toBeMoved = $(".row" + i + ".col" + k);
          if (toBeMoved.length == 0) {
            k++;
          } else if (occupied.length == 0) {
            moveTile(toBeMoved, {
              x: i,
              y: j
            }, animations);
            k++;
          } else if (occupied.text() === toBeMoved.text()) {
            let v = Number(occupied.text());
            moveTile(toBeMoved, {
              x: i,
              y: j
            }, animations);
            merge({
              x: i,
              y: j
            }, v, animations);
            j++;
            k = j + 1;
          } else {
            j++;
            k = j + 1;
          }
        }
      }
      break;
    case "right":
      for (let i = 1; i <= 4; i++) {
        let j = 4;
        let k = 3;
        while (j > 1 && k >= 1) {
          let occupied = $(".row" + i + ".col" + j);
          let toBeMoved = $(".row" + i + ".col" + k);
          if (toBeMoved.length == 0) {
            k--;
          } else if (occupied.length == 0) {
            moveTile(toBeMoved, {
              x: i,
              y: j
            }, animations);
            k--;
          } else if (occupied.text() === toBeMoved.text()) {
            let v = Number(occupied.text());
            moveTile(toBeMoved, {
              x: i,
              y: j
            }, animations);
            merge({
              x: i,
              y: j
            }, v, animations);
            j--;
            k = j - 1;
          } else {
            j--;
            k = j - 1;
          }
        }
      }
      break;
  }
}

function validMove(direction) {
  switch (direction) {
    case "up":
      for (let i = 1; i <= 4; i++) {
        let s = "";
        let prevValue = '';
        for (let j = 1; j <= 4; j++) {
          let occupied = $(".row" + j + ".col" + i);
          if (occupied.length > 0) {
            s += j;
            value = occupied.text();
            if (value == prevValue) {
              return true;
            }
            prevValue = value;
          }
        }
        if (!"1234".startsWith(s)) {
          return true;
        }
      }
      return false;
    case "down":
      for (let i = 1; i <= 4; i++) {
        let s = "";
        let prevValue = '';
        for (let j = 1; j <= 4; j++) {
          let occupied = $(".row" + j + ".col" + i);
          if (occupied.length > 0) {
            s += j;
            value = occupied.text();
            if (value == prevValue) {
              return true;
            }
            prevValue = value;
          }
        }
        if (!"1234".endsWith(s)) {
          return true;
        }
      }
      return false;
    case "left":
      for (let i = 1; i <= 4; i++) {
        let s = "";
        let prevValue = '';
        for (let j = 1; j <= 4; j++) {
          let occupied = $(".col" + j + ".row" + i);
          if (occupied.length > 0) {
            s += j;
            value = occupied.text();
            if (value == prevValue) {
              return true;
            }
            prevValue = value;
          }
        }
        if (!"1234".startsWith(s)) {
          return true;
        }
      }
      return false;
    case "right":
      for (let i = 1; i <= 4; i++) {
        let s = "";
        let prevValue = '';
        for (let j = 1; j <= 4; j++) {
          let occupied = $(".col" + j + ".row" + i);
          if (occupied.length > 0) {
            s += j;
            value = occupied.text();
            if (value == prevValue) {
              return true;
            }
            prevValue = value;
          }
        }
        if (!"1234".endsWith(s)) {
          return true;
        }
      }
      return false;
  }
}
