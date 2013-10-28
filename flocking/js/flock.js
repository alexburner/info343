(function () {






	/*
	
	Boids
	http://www.red3d.com/cwr/boids/

	BREVE SWARM
	http://faculty.hampshire.edu/lspector/pubs/spector-gecco2003.pdf
	
	 */
	


	function getHypotenuse(a, b) {
		return Math.sqrt(a * a + b * b);
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
		// infinite edges
		if (this.y < 0 - this.radius.neighborhood) {
			// top edge
			this.y = win.height + this.radius.neighborhood;
		} else if (this.y > win.height + this.radius.neighborhood) {
			// bottom edge
			this.y = 0 - this.radius.neighborhood;
		}
		if (this.x < 0 - this.radius.neighborhood) {
			// left edge
			this.x = win.width + this.radius.neighborhood;
		} else if (this.x > win.width + this.radius.neighborhood) {
			// right edge
			this.x = 0 - this.radius.neighborhood;
		}
	};

	Node.prototype.stylePosition = function() {
		this.el.style.left = this.x + 'px';
		this.el.style.top = this.y + 'px';
	};

	/* deprecated
	Node.prototype.averageNeighborVectors = function () {
		var neighborCount = 0;
		var dxsum = 0;
		var dysum = 0;
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (i === this.index) {continue;}
			var that = nodes[i];
			var xDiff = this.x - that.x;
			var yDiff = this.y - that.y;
			var distance = getHypotenuse(xDiff, yDiff);
			if (distance < this.radius.neighborhood) {
				neighborCount++;
				dxsum += that.dx;
				dysum += that.dy;
			}
		}
		this.dx = dxsum / neighborCount;
		this.dy = dysum / neighborCount;
	};*/

	Node.prototype.findNeighborVectors = function () {
		for (var i = 0, l = nodes.length; i < l; i++) {
			if (i === this.index) {continue;}
			var that = nodes[i];
			var xDiff = this.x - that.x;
			var yDiff = this.y - that.y;
			var distance = getHypotenuse(xDiff, yDiff);
			if (distance < this.radius.neighborhood) {
				this.normalizeNeighborSpeed(that, distance);
			}
		}
	};

	/* deprecated
	Node.prototype.absorbNeighborSpeed = function (neighbor, distance) {
		if (distance < this.radius.body) {
			this.dx *= -1;
			this.dy *= -1;
		} else {
			var weight = distance / this.radius.neighborhood;
			weight = Math.pow(weight, 1000);
			this.dx += (neighbor.dx * weight);
			this.dy += (neighbor.dy * weight);
		}
	}*/

	Node.prototype.normalizeNeighborSpeed = function (neighbor, distance) {
		var thisV = getHypotenuse(this.dx, this.dy);
		var sumDX = this.dx + neighbor.dx * (distance / this.radius.neighborhood);
		var sumDY = this.dy + neighbor.dy * (distance / this.radius.neighborhood);
		var sumV = getHypotenuse(sumDX, sumDY);
		var normalize = thisV / sumV;
		this.dx = sumDX * normalize;
		this.dy = sumDY * normalize;
	}

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
		this.findNeighborVectors();
		this.randomizeDelta();
	};



	var count = 0;
	while(count < 80) {
		var node = new Node();
		frameHandler.addAnimation(node.animate, node);
		count++;
	}



	frameHandler.start();



















})();