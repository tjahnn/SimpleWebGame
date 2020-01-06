jewel.screens["main-menu"] = (function() {
	var dom = jewel.dom,
		game = jewel.game;
		firstRun = true;
		
	function setup(){
		dom.bind("#main-menu ul.menu", "click", function(e) {
			if(e.target.nodeName.toLowerCase() === "button"){
				var action = e.target.getAttribute("name");
				game.showScreen(action);
			}
		});
	}
	
	function run(){
		if(firstRun){
			setup();
			firstRun = false;
		}
	}
	
	return{
		run: run
	};
})();

jewel.screens["game-screen"] = (function() {
	var dom = jewel.dom,
		game = jewel.game;
		firstRunGameScreen = true;
		
	function setup(){
	}
	
	function run(){
		if(firstRunGameScreen){
			setup();
			firstRunGameScreen = false;
		}
	}

	return{
		run: run
	};
})();

jewel.screens["game-register"] = (function() {
	var dom = jewel.dom,
		game = jewel.game;
		firstRunRegister = true;
		
	function setup(){
	}
	
	function run(){
		if(firstRunRegister){
			setup();
			firstRunRegister = false;
		}
	}

	return{
		run: run
	};
})();