(function () {






	/*
	
	Boids
	http://www.red3d.com/cwr/boids/

	BREVE SWARM
	http://faculty.hampshire.edu/lspector/pubs/spector-gecco2003.pdf
	
	 */
	


	function getHypotenuse(x, y) {
		return Math.sqrt(x * x + y * y);
	}

	function getNormalizedVectorSum(dx1, dy1, dx2, dy2) {
		dv1 = getHypotenuse(dx1, dy1);
		dxSum = dx1 + dx2;
		dySum = dy1 + dy2;
		dvSum = getHypotenuse(dxSum, dySum);
		var normalize = dv1 / dvSum;
		return {
			x: dxSum * normalize,
			y: dySum * normalize
		};
	}







	var win = {};
	win.width = window.innerWidth;
	win.height = window.innerHeight;
	addEvent(window, 'resize', function (e) {
		win.width = window.innerWidth;
		win.height = window.innerHeight;
	});



	addEvent(window, 'keydown', function (e) {
		e = e || window.event;
		switch (e.keyCode) {
			case 32:
				e.preventDefault();
				frameHandler.togglePause();
				break;
			case 37:
			case 38:
			case 39:
			case 40:
				e.preventDefault();
				break;
		}
	});










	var nodes = [];


	function Node() {
		// tracking
		this.index = nodes.length;
		nodes.push(this);
		// size
		this.radius = {};
		this.radius.body = 5;
		this.radius.bubble = 50;
		this.radius.neighborhood = 250;
		// coords
		this.x = Math.random() * win.width;
		this.y = Math.random() * win.height;
		// delta
		this.dx = Math.random() * 10;
		this.dy = Math.random() * 10;
		if (Math.random() > 0.5) {this.dx *= -1;}
		if (Math.random() > 0.5) {this.dy *= -1;}
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
		document.body.insertBefore(this.el, null);
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
			this.y = win.height + this.radius.neighborhood;
			this.x = win.width - this.x;
		} else if (this.y > win.height + this.radius.neighborhood) {
			// bottom edge
			this.y = 0 - this.radius.neighborhood;
			this.x = win.width - this.x;
		}
		// x teleport
		if (this.x < 0 - this.radius.neighborhood) {
			// left edge
			this.x = win.width + this.radius.neighborhood;
			this.y = win.height - this.y;
		} else if (this.x > win.width + this.radius.neighborhood) {
			// right edge
			this.x = 0 - this.radius.neighborhood;
			this.y = win.height - this.y;
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
					var adx = this.x - that.x;
					var ady = this.y - that.y;
					var nvs = getNormalizedVectorSum(
						this.dx,
						this.dy,
						adx / ((this.radius.bubble / distance) * 10),
						ady / ((this.radius.bubble / distance) * 10)
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

	Node.prototype.randomizeDelta = function () {
		if (Math.random() < 0.5) {
			var rdx = Math.random();
			if (Math.random() < 0.5) {rdx *= -1;}
			this.dx += rdx;
		}
		if (Math.random() < 0.5) {
			var rdy = Math.random();
			if (Math.random() < 0.5) {rdy *= -1;}
			this.dy += rdy;
		}
	};

	Node.prototype.animate = function() {
		this.movePosition();
		this.stylePosition();
		this.handleNeighbors();
		this.randomizeDelta();
	};



	var count = 0;
	while(count < 100) {
		var node = new Node();
		frameHandler.addAnimation(node.animate, node);
		count++;
	}



	frameHandler.start();



















})();