// jshint esversion:6
let isGameOver = false;

gameover.querySelector("button").addEventListener("click", () => {
	location.reload();
});

computerMove();
computerMove();

document.addEventListener("transitionend", (event) => {
	if (
		!event.target.classList.contains("tile") ||
		event.propertyName !== "opacity"
	)
		return;
	if (event.target.style.opacity === "0") {
		event.target.remove();
	}
});

document.addEventListener("keydown", (event) => {
	if (
		["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(event.key)
	) {
		const direction = event.key.slice(5).toLowerCase();
		handleInput(direction);
	}
});

function handleInput(direction) {
	if (isGameOver) {
		container.style.opacity = 0.4;
		gameover.style.display = "inline-block";
		return;
	}
	if (validMove(direction)) {
		handleKeydown(direction);
		setTimeout(computerMove, 250);
	}
}

const SWIPE_THRESHOLD = 150;
const SWIPE_TIME = 400;
const SWIPE_TOLERANCE = 100;
let startX;
let startY;
let startTime;

document.addEventListener("touchstart", (event) => {
	const touchobj = event.changedTouches[0];
	startX = touchobj.pageX;
	startY = touchobj.pageY;
	startTime = new Date().getTime();
});

document.addEventListener("touchend", (event) => {
	const elapsedTime = new Date().getTime() - startTime;
	if (elapsedTime > SWIPE_TIME) return;

	const distX = event.changedTouches[0].pageX - startX;
	const distY = event.changedTouches[0].pageY - startY;

	const direction =
		distX > SWIPE_THRESHOLD && Math.abs(distY) < SWIPE_TOLERANCE
			? "right"
			: distX < -SWIPE_THRESHOLD && Math.abs(distY) < SWIPE_TOLERANCE
			? "left"
			: distY < -SWIPE_THRESHOLD && Math.abs(distX) < SWIPE_TOLERANCE
			? "up"
			: distY > SWIPE_THRESHOLD && Math.abs(distX) < SWIPE_TOLERANCE
			? "down"
			: null;
	if (!direction) return;

	handleInput(direction);
});

function moveTile(tile, rowNum, colNum) {
	const tileX = /row\d/.exec(tile.className)[0];
	const tileY = /col\d/.exec(tile.className)[0];
	if (tileX === "row" + rowNum) {
		tile.classList.add("col" + colNum);
		tile.classList.remove(tileY);
	} else if (tileY === "col" + colNum) {
		tile.classList.add("row" + rowNum);
		tile.classList.remove(tileX);
	}
}

function mergeTiles(rowNum, colNum, value) {
	const tilesAtPosition = document.querySelectorAll(
		`.row${rowNum}.col${colNum}.val${value}`
	);
	createTile(rowNum, colNum, 2 * value);
	for (const tile of tilesAtPosition) {
		tile.style.opacity = 0;
	}
}

function findTile(rowNum, colNum) {
	return document.querySelector(`.row${rowNum}.col${colNum}`);
}

function createTile(rowNum, colNum, value) {
	const newTile = document.createElement("div");
	newTile.classList.add(
		"tile",
		`row${rowNum}`,
		`col${colNum}`,
		`val${value}`
	);
	newTile.innerHTML = value;
	container.append(newTile);
}

function computerMove() {
	const emptyTiles = [];
	for (let i = 1; i <= 4; i++) {
		for (let j = 1; j <= 4; j++) {
			if (!findTile(i, j)) {
				emptyTiles.push([i, j]);
			}
		}
	}
	if (!emptyTiles.length) {
		isGameOver = true;
		return;
	}
	const tileIndex = Math.floor(emptyTiles.length * Math.random());
	const posX = emptyTiles[tileIndex][0];
	const posY = emptyTiles[tileIndex][1];
	const value = Math.random() < 0.9 ? 2 : 4;
	createTile(posX, posY, value);
}

function handleKeydown(direction) {
	if (!["up", "down", "left", "right"].includes(direction)) return;

	const startJ = ["up", "left"].includes(direction) ? 1 : 4;
	const startK = ["up", "left"].includes(direction) ? 2 : 3;
	const inc = ["up", "left"].includes(direction) ? 1 : -1;
	const whileCond = (j, k) =>
		["up", "left"].includes(direction) ? j < 4 && k <= 4 : j > 1 && k >= 1;
	const pos = (i, j) =>
		["up", "down"].includes(direction) ? [j, i] : [i, j];

	for (let i = 1; i <= 4; i++) {
		let j = startJ;
		let k = startK;
		while (whileCond(j, k)) {
			let occupied = findTile(...pos(i, j));
			let toBeMoved = findTile(...pos(i, k));
			if (!toBeMoved) {
				k += inc;
			} else if (!occupied) {
				moveTile(toBeMoved, ...pos(i, j));
				k += inc;
			} else {
				if (occupied.innerHTML === toBeMoved.innerHTML) {
					moveTile(toBeMoved, ...pos(i, j));
					mergeTiles(...pos(i, j), Number(occupied.innerHTML));
				}
				j += inc;
				k = j + inc;
			}
		}
	}
}

function validMove(direction) {
	if (!["up", "down", "left", "right"].includes(direction)) return false;

	const pos = (i, j) =>
		["up", "down"].includes(direction) ? [j, i] : [i, j];
	const moveHasGaps = (s) =>
		["up", "left"].includes(direction)
			? !"1234".startsWith(s)
			: !"1234".endsWith(s);

	for (let i = 1; i <= 4; i++) {
		let occupiedPositions = "";
		let prevValue;
		for (let j = 1; j <= 4; j++) {
			let occupied = findTile(...pos(i, j));
			if (!occupied) continue;

			occupiedPositions += j;
			value = occupied.innerHTML;
			if (value === prevValue) return true;

			prevValue = value;
		}
		if (moveHasGaps(occupiedPositions)) return true;
	}
	return false;
}
