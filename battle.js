var WIDTH = 30; //Num of cells
var HEIGHT = 21;

var eachW = 0;
var eachH = 0;

var align;
var text;
var ally;
var speed;

var adding = false; //Adding a new object
var moving = false; //Moving an object
var thingToMove = null;
var moveFromC;
var moveFromR;
var theme = "dungeon";

var contents = [];
var overlays = [];

var mouseOver = null;

function createBoard() //Creates board of squares
{
	var grid = document.getElementById('grid');
	for (var r = 0; r < HEIGHT; r++)
	{
		for (var c = 0; c < WIDTH; c++)
		{
			var cell = document.createElement("div");
			cell.setAttribute("id", "" + c + " " + r);
			cell.setAttribute("class", "cell");
			//alternate, checkerboard
			var parody = (c % 2) ^ (r % 2); //alternate rows, but if alternate cols, then negate (this is what a xor does)
			if (parody)
			{
				cell.classList.add('check');
			}
			else
			{
				cell.classList.add('uncheck');
			}
			grid.appendChild(cell);
			document.getElementById("" + c + " " + r).setAttribute("onClick", "cellClicked(event, " + c + "," + r + ")");
			document.getElementById("" + c + " " + r).setAttribute("onMouseOver", "cellOver(" + c + "," + r + ")");
			document.getElementById("" + c + " " + r).setAttribute("onMouseOut", "cellOut(" + c + "," + r + ")");
		}
		grid.innerHTML += "<br />";
	}
	
	contents = [];
	
	for (var c = 0; c < WIDTH; c++)
	{
		contents[c] = [];
		for (var r = 0; r < HEIGHT; r++)
		{
			contents[c][r] = null;
		}
	}
	
	onResize();
	paintBoard();
}

function paintBoard()
{
	var maxDist = 0;
	if (thingToMove != null)
		maxDist = Math.floor(thingToMove.speed / 5); //Squares a thing can travel
	for (var i = 0; i < overlays.length; i++)
	{
		var overlay = document.getElementById(overlays[i]);
		overlay.parentNode.removeChild(overlay);
	}
	overlays = [];
	for (var c = 0; c < WIDTH; c++)
	{
		for (var r = 0; r < HEIGHT; r++)
		{
			var cell = document.getElementById("" + c + " " + r);
			
			cell.classList.remove("dungeon");
			cell.classList.remove("wilderness");
			cell.classList.remove("castle");
			
			cell.classList.add(theme);
			
			document.body.classList.remove("dungeon");
			document.body.classList.remove("wilderness");
			document.body.classList.remove("castle");
			
			document.body.classList.add(theme);
			
			if (contents[c][r] != null)
			{
				if (contents[c][r].ally)
				{
					cell.innerHTML = "<div class = 'contents ally'>" + contents[c][r].text + "</div>";
				}
				else
				{
					cell.innerHTML = "<div class = 'contents enemy'>" + contents[c][r].text + "</div>";
				}
			}
			else
			{
				cell.innerHTML = "";
			}
			
			//Highlight move possibilities
			if (moving && thingToMove != null)
			{
				var cDist = Math.abs((c - thingToMove.c));
				var rDist = Math.abs((r - thingToMove.r))
				var dist = Math.round(Math.sqrt(Math.pow(cDist, 2) + Math.pow(rDist, 2))); //Circle pattern
				if (dist <= maxDist)
				{
					var overlay = document.createElement("div");
					overlay.className = "overlay movable";
					overlay.setAttribute("id", "O" + c + " " + r);
					cell.appendChild(overlay);
					overlays.push("O" + c + " " + r);
					setSizes();
				}
			}
		}
	}
	
	setSizes();
}

function cellClicked(event, c, r)
{
	cellOut(c, r);
	if (adding) //Add new at this position
	{
		adding = false;
		document.documentElement.className = "normalmode";
		if (align)
		{
			contents[c][r] = new Thing(align, text, ally, speed, c, r); //Overwrite old thing
		}
		else
		{
			var x = event.clientX;
			var y = event.clientY;
			var thing = new Thing(align, text, ally, speed, c, r);
			var representation = document.createElement("div");
			representation.className = "rep";
			representation.style.width = eachW + "px";
			representation.style.height = eachH + "px";
			representation.style.left = x - (eachW / 2) + "px";
			representation.style.top = y - (eachH / 2) + "px";
			document.body.appendChild(representation);
		}
		paintBoard();
		return;
	}
	if (moving)
	{
		contents[moveFromC][moveFromR] = null;
		contents[c][r] = thingToMove;
		thingToMove.c = c;
		thingToMove.r = r;
		moving = false;
		document.documentElement.className = "normalmode";
		paintBoard();
		return;
	}
	
	if (contents[c][r] != null)
	{
		move(c, r);
	}
}

function cellOver(c, r)
{
	if (adding || moving)
	{
		if (align)
			document.getElementById("" + c + " " + r).classList.add('selectable');
	}
	
	mouseOver = contents[c][r];
}
function cellOut(c, r)
{
	document.getElementById("" + c + " " + r).classList.remove('selectable');
	mouseOver = null;
}

function move(c, r)
{
	if (adding || moving) return;
	thingToMove = contents[c][r];
	moveFromC = c;
	moveFromR = r;
	moving = true;
	paintBoard();
}

function Thing(align, text, ally, speed, c, r)
{
	this.align = align;
	this.text = text;
	this.ally = ally;
	this.speed = speed;
	this.c = c;
	this.r = r;
}

function clearBoard()
{
	var grid = document.getElementById('grid');
	for (var r = 0; r < HEIGHT; r++)
	{
		for (var c = 0; c < WIDTH; c++)
		{
			grid.removeChild(document.getElementById("" + c + " " + r));
		}
	}
}

function keyPress(e)
{
	var code = e.which || e.keyCode || e.charCode || e.keyIdentifier;
	if (code == 27) //ESC char
	{
		document.documentElement.className = "normalmode";
		closeAllPops();
		moving = false;
		adding = false;
		thingToMove = null;
		paintBoard();
	}
	else
	{
		var glyph = String.fromCharCode(code);
		switch (glyph)
		{
			case 'n':
				openPop(document.getElementById('addnew'));
				document.getElementById('text').focus();
				break;
			case 'r':
				openPop(document.getElementById('resize'));
				document.getElementById('width').value = WIDTH;
				document.getElementById('height').value = HEIGHT;
				document.getElementById('width').focus();
				break;
			case 't':
				openPop(document.getElementById('theme'));
				document.getElementById(theme).checked = "true";
				break;
			case 'q':
				eyedrop();
				break;
			case 'd': case String.fromCharCode(46): //DEL key (and period key?)
				remove();
				break;
			case 'h':
				alert("n - new\nr - resize\nt - theme\nq - eyedrop\nd - delete");
		}
	}
}

function eyedrop()
{
	if (mouseOver == null || moving || adding) return;
	
	text = mouseOver.text;
	align = mouseOver.align;
	speed = mouseOver.speed;
	ally = mouseOver.ally;
	
	document.documentElement.className = "addmode";
	adding = true;
}

function remove()
{
	if (mouseOver == null || moving || adding) return;
	
	contents[mouseOver.c][mouseOver.r] = null;
	paintBoard();
}

function resize()
{
	var w = document.getElementById('width').value;
	var h = document.getElementById('height').value;
	clearBoard();
	WIDTH = Number(w);
	HEIGHT = Number(h);
	createBoard();
	closeAllPops();
	return false;
}

function addNew()
{
	ally = document.getElementById('ally').checked;
	align = document.getElementById('align').checked;
	speed = document.getElementById('speed').value || 30;
	text = (document.getElementById('text').value || "P").toUpperCase();
	adding = true;
	document.documentElement.className = "addmode";
	closeAllPops();
	return false;
}

function setTheme()
{
	dungeon = document.getElementById('dungeon').checked;
	wilderness = document.getElementById('wilderness').checked;
	castle = document.getElementById('castle').checked;
	
	if (dungeon)
	{
		theme = "dungeon";
	}
	else if (wilderness)
	{
		theme = "wilderness";
	}
	else if (castle)
	{
		theme = "castle";
	}
	
	closeAllPops();
	paintBoard();
	
	return false;
}

function closeAllPops()
{	
	document.getElementById('addnew').style.display = "none";
	document.getElementById('resize').style.display = "none";
	document.getElementById('theme').style.display = "none";
}

function openPop(el)
{	
	adding = false;
	moving = false;
	thingToMove = null;
	closeAllPops();
	//first clear the pop TODO
	el.style.display = "block";
}

function onResize()
{
	var w = window.innerWidth;
	var h = window.innerHeight;
	
	var ratioScreen = w / h;
	var ratioCells = WIDTH / HEIGHT;
	
	var lockWidth = ratioCells > ratioScreen; //Lock width and scale down height
	
	if (lockWidth)
	{
		eachW = (w / WIDTH);
		eachH = eachW;
		document.getElementById('grid').setAttribute("class", "vertcenter");
	}
	else
	{
		eachH = (h / HEIGHT);
		eachW = eachH;
		document.getElementById('grid').setAttribute("class", "horizcenter");
	}
	
	setSizes();
}
function setSizes()
{
	for (var r = 0; r < HEIGHT; r++)
	{
		for (var c = 0; c < WIDTH; c++)
		{
			var cell = document.getElementById("" + c + " " + r);
			cell.style.width = eachW + "px";
			cell.style.height = eachH + "px";
			
			var content = cell.firstChild;
			if (content != null)
				content.style.fontSize = (eachW * 1.2) / content.innerHTML.length + "px";
		}
	}
	
	for (var i = 0; i < overlays.length; i++)
	{
		var overlay = document.getElementById(overlays[i]);
		overlay.style.width = eachW + "px";
		overlay.style.height = eachH + "px";
	}
}

window.addEventListener("resize", onResize);
window.addEventListener("keypress", keyPress);