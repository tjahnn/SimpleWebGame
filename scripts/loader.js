var jewel = {
	screens : {}
};

//현재 문서가 완전히 로드될 때까지 기다린다.
window.addEventListener("load", function(){
	//동적 로딩으 시작한다.
	Modernizr.load([
		{
			//항상 로드되는파일들
			load: [
				"scripts/sizzle.js",
				"scripts/dom.js",
				"scripts/game.js",
				"scripts/screen.splash.js",
				"scripts/screen.main-menu.js"
			],
			//모든 파일의 로드 및 실행이 완료되면 호출된다.
			complete: function(){
				jewel.game.showScreen("splash-screen");
				console.log("모든 파일이 로드되었습니다!");
			}			
		}
	]);
}, false);