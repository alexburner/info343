var frameHandler = ( function () {
	var isPaused = false;
	var animations = [];
	// fires on each animation frame
	function handleFrame(time) {
		if (isPaused) return;
		var clean = [];
		for (var i = 0, l = animations.length; i < l; i++) {
			// animations return bool flag to complete
			var isComplete = animations[i](time);
			if (isComplete) {clean.push(i);}
		}
		// clean out completed animations
		for (var i = 0, l = clean.length; i < l; i++) {
			animations.slice(clean[i], 1);
		}
		// pass handler to browser for next frame
		requestAnimationFrame(handleFrame);
	}
	// interface
	return {
		start: function () {
			handleFrame(new Date().getTime());
		},
		togglePause: function () {
			isPaused = !isPaused;
			if (!isPaused) {frameHandler.start();}
		},
		addAnimation: function (animation, apply) {
			animations.push(function () {
				animation.apply(apply);
			});
		}
	};
} )();