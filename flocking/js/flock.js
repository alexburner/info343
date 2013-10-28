(function () {






	/*
	
	precendents

	Boids
	http://www.red3d.com/cwr/boids/

	BREVE SWARM
	http://faculty.hampshire.edu/lspector/pubs/spector-gecco2003.pdf
	
	*/


	







	// maths

	function coinFlip() {
		return Math.random() > 0.5;
	}

	function getHypotenuse(x, y) {
		return Math.sqrt(x * x + y * y);
	}

	function getNormalizedVectorSum(dx1, dy1, dx2, dy2) {
		var dv1 = getHypotenuse(dx1, dy1);
		var dxSum = dx1 + dx2;
		var dySum = dy1 + dy2;
		var dvSum = getHypotenuse(dxSum, dySum);
		var normalize = dv1 / dvSum;
		return {
			x: dxSum * normalize,
			y: dySum * normalize
		};
	}






	// container
	var container = {};
	container.width = window.innerWidth;
	container.height = window.innerHeight;
	container.el = document.createElement('div');
	container.el.setAttribute('id', 'container');
	document.body.appendChild(container.el);
	addEvent(window, 'resize', function (e) {
		container.width = window.innerWidth;
		container.height = window.innerHeight;
	});




	// keyboard
	addEvent(window, 'keydown', function (e) {
		e = e || window.event;
		switch (e.keyCode) {
			case 32:
				e.preventDefault();
				frameHandler.togglePause();
				break;
		}
	});





	// cursor

	var cursor = {};
	cursor.x = -1000;
	cursor.y = -1000;

	// state
	cursor.NEUTRAL = 1;
	cursor.THREAT = 2;
	cursor.FOOD = 3;
	cursor.is = null;
	cursor.set = function (status) {
		switch (status) {
			case cursor.NEUTRAL:
				cursor.is = cursor.NEUTRAL;
				cursor.el.setAttribute('class', 'neutral');
				break;
			case cursor.THREAT:
				cursor.is = cursor.THREAT;
				cursor.el.setAttribute('class', 'threat');
				break;
			case cursor.FOOD:
				cursor.is = cursor.FOOD;
				cursor.el.setAttribute('class', 'food');
				break;
		}
	}

	// element
	cursor.el = document.createElement('div');
	container.el.appendChild(cursor.el, null);

	// start as food
	cursor.set(cursor.FOOD);

	// move with mouse
	addEvent(window, 'mousemove', function (e) {
		e = e || window.event;
		cursor.x = e.pageX;
		cursor.y = e.pageY;
		cursor.el.style.left = cursor.x + 'px';
		cursor.el.style.top = cursor.y + 'px';
	});

	// toggle threat/food
	addEvent(window, 'mouseup', function (e) {
		e = e || window.event;
		if (cursor.is === cursor.FOOD) {
			cursor.set(cursor.THREAT);
		} else if (cursor.is === cursor.THREAT) {
			cursor.set(cursor.NEUTRAL);
		} else if (cursor.is === cursor.NEUTRAL) {
			cursor.set(cursor.THREAT);
		}
	});








	// the things


	var nodes = [];


	function Node() {
		// reference
		this.index = nodes.length;
		nodes.push(this);
		// size
		this.radius = {};
		this.radius.body = 5;
		this.radius.bubble = 50;
		this.radius.neighborhood = 250;
		// coords
		this.x = Math.random() * container.width;
		this.y = Math.random() * container.height;
		// delta
		this.dmax = 10;
		this.dx = Math.random() * 5;
		this.dy = Math.random() * 5;
		if (coinFlip()) {this.dx *= -1;}
		if (coinFlip()) {this.dy *= -1;}
		// elements
		var node = document.createElement('div');
		var body = document.createElement('div');
		var bbbl = document.createElement('div');
		var nbhd = document.createElement('div');
		node.setAttribute('class', 'node');
		body.setAttribute('class', 'body');
		bbbl.setAttribute('class', 'bubble');
		nbhd.setAttribute('class', 'neighborhood');
		node.appendChild(body);
		node.appendChild(bbbl);
		node.appendChild(nbhd);
		this.el = node;
		this.stylePosition();
		container.el.appendChild(this.el, null);
	}

	Node.prototype.movePosition = function() {
		this.x += this.dx;
		this.y += this.dy;
		this.infiniteEdges();
	};

	Node.prototype.infiniteEdges = function() {
		// y teleport
		if (this.y < 0 - this.radius.neighborhood) {
			// top edge
			this.y = container.height + this.radius.neighborhood;
			this.x = container.width - this.x;
		} else if (this.y > container.height + this.radius.neighborhood) {
			// bottom edge
			this.y = 0 - this.radius.neighborhood;
			this.x = container.width - this.x;
		}
		// x teleport
		if (this.x < 0 - this.radius.neighborhood) {
			// left edge
			this.x = container.width + this.radius.neighborhood;
			this.y = container.height - this.y;
		} else if (this.x > container.width + this.radius.neighborhood) {
			// right edge
			this.x = 0 - this.radius.neighborhood;
			this.y = container.height - this.y;
		}
	};

	Node.prototype.stylePosition = function() {
		this.el.style.left = this.x + 'px';
		this.el.style.top = this.y + 'px';
	};

	Node.prototype.handleNeighbors = function () {
		var neighCount = 0;
		var neighSumX = 0;
		var neighSumY = 0;
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (i === this.index) {continue;}
			var that = nodes[i];
			var xDiff = this.x - that.x;
			var yDiff = this.y - that.y;
			var distance = getHypotenuse(xDiff, yDiff);
			if (distance < this.radius.neighborhood) {
				if (distance < this.radius.bubble) {
					// avoid neighbor
					var nvs = getNormalizedVectorSum(
						this.dx,
						this.dy,
						xDiff / ((this.radius.bubble / distance) * 10),
						yDiff / ((this.radius.bubble / distance) * 10)
					);
					this.dx = nvs.x;
					this.dy = nvs.y;
				} else {
					// follow neighbor heading
					var nvs = getNormalizedVectorSum(
						this.dx,
						this.dy,
						that.dx / ((this.radius.neighborhood / distance) * 10),
						that.dy / ((this.radius.neighborhood / distance) * 10)
					);
					this.dx = nvs.x;
					this.dy = nvs.y;
					// for avg neigh cent
					neighCount++;
					neighSumX += that.x;
					neighSumY += that.y;
				}
			}
		}
		// follow average neighbor center
		if (neighCount) {
			var centerX = neighSumX / neighCount;
			var centerY = neighSumY / neighCount;
			var cdx = centerX - this.x;
			var cdy = centerX - this.y;
			var nvs = getNormalizedVectorSum(
				this.dx,
				this.dy,
				cdx / 100,
				cdy / 100
			);
			this.dx = nvs.x;
			this.dy = nvs.y;
		}
	};

	Node.prototype.handleCursor = function () {
		switch (cursor.is) {
			case cursor.THREAT:
				this.avoidCursor();
				break;
			case cursor.FOOD:
				this.seekCursor();
				break;
		}
	};

	Node.prototype.avoidCursor = function () {
		var xDiff = this.x - cursor.x;
		var yDiff = this.y - cursor.y;
		var distance = getHypotenuse(xDiff, yDiff);
		if (distance < this.radius.neighborhood) {
			var nvs = getNormalizedVectorSum(
				this.dx,
				this.dy,
				xDiff / ((this.radius.neighborhood / distance) * 10),
				yDiff / ((this.radius.neighborhood / distance) * 10)
			);
			this.dx = nvs.x;
			this.dy = nvs.y;
		}
	};

	Node.prototype.seekCursor = function () {
		var xDiff = this.x - cursor.x;
		var yDiff = this.y - cursor.y;
		
		// avoid -> seek
		xDiff *= -1;
		yDiff *= -1;
		
		var distance = getHypotenuse(xDiff, yDiff);
		if (distance < this.radius.neighborhood) {
			var nvs = getNormalizedVectorSum(
				this.dx,
				this.dy,
				xDiff / ((this.radius.neighborhood / distance) * 10),
				yDiff / ((this.radius.neighborhood / distance) * 10)
			);
			this.dx = nvs.x;
			this.dy = nvs.y;
		}
	};

	Node.prototype.randomizeDelta = function () {
		// x delta
		if (coinFlip()) {
			var rdx = Math.random();
			if (coinFlip()) {rdx *= -1;}
			this.dx += rdx;
			this.dx = this.limitDelta(this.dx);
		}
		// y delta
		if (coinFlip()) {
			var rdy = Math.random();
			if (coinFlip()) {rdy *= -1;}
			this.dy += rdy;
			this.dy = this.limitDelta(this.dy);
		}
	};

	Node.prototype.limitDelta = function (dnum) {
		if (dnum > this.dmax) {
			dnum = this.dmax;
		} else if (dnum < -this.dmax) {
			dnum = -1 *this.dmax;
		}
		return dnum;
	};

	Node.prototype.animate = function() {
		this.movePosition();
		this.stylePosition();
		this.handleNeighbors();
		this.handleCursor();
		this.randomizeDelta();
	};










	// create & animate

	var count = 0;
	while(count < 64) {
		var node = new Node();
		frameHandler.addAnimation(node.animate, node);
		count++;
	}

	frameHandler.start();



















})();