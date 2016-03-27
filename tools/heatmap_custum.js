'use strict';


require.config(configure.get('requirejsSettings'));

require([
	'core'
], function() {
	var backBoneApplication = {
		model: null,
		view: null
	};

	//model --------------------
	backBoneApplication.model = {};

	//view --------------------
	backBoneApplication.view = {
		el: $(window),
		events: {
			'scroll': 'scroll',
			'touchstart': 'touchStartGlobal',
			'touchend': 'touchEndGlobal'
		},
		initialize: function () {
			window.pvaUrl = $('#pva_url').val();
			if (typeof localStorage['pva_dat'] !== 'undefined' && localStorage['pva_dat'] != '') {
				$.post(window.pvaUrl, {'u': localStorage['pva_url'], 'd': localStorage['pva_dat']}, null, 'xml');
				localStorage['pva_url'] = '';
				localStorage['pva_dat'] = '';
			}			
				
			if ($('#ctrl_name').length == 0) {
				window.pva_enabled = false;
				return;
			}
			window.pva_enabled = true;
			window.deviceInfo = {
				'pageZoomRate': $('html').css('zoom'),
				'windowWidth': window.innerWidth,
				'windowHeight': window.innerHeight
			};
			window.pageAreaTimeData = {0: 0};
			window.tapData = Array();

			setInterval(this.sampling, 100);
		},
		touchStartGlobal: function (ev) {
			touchStartPos = {
				'x': ev.originalEvent.changedTouches[0].clientX,
				'y': ev.originalEvent.changedTouches[0].clientY
			};
		},
		touchEndGlobal: function (ev) {
			//PVAが有効になっていないページ、またはグローバルメニューを開いているときは処理を無効
			if (window.pva_enabled === false || $('#global_menu.open').length) {
				return;
			}
			var touchX = 0;
			if (window.deviceInfo.pageZoomRate == 1) {
				touchX = Math.floor(ev.originalEvent.changedTouches[0].clientX - (window.deviceInfo.windowWidth - 320) / 2.0);
			}
			else {
				touchX = Math.floor(ev.originalEvent.changedTouches[0].clientX / window.deviceInfo.pageZoomRate);
			}
			var touchPos = {
				'x': touchX,
				'y': Math.floor(ev.originalEvent.changedTouches[0].pageY / window.deviceInfo.pageZoomRate),
				'dX': ev.originalEvent.changedTouches[0].clientX - touchStartPos['x'],
				'dY': ev.originalEvent.changedTouches[0].clientY - touchStartPos['y']
			};
			var touchPosThreshold = 50;
			var maxTouchPosSaveLengthThreshold = 40;
			if (-touchPosThreshold <= touchPos.dX && touchPos.dX <= touchPosThreshold && 
				-touchPosThreshold <= touchPos.dY && touchPos.dY <= touchPosThreshold &&
				window.tapData.length <= maxTouchPosSaveLengthThreshold) {
				window.tapData.push(touchPos);
			}
		},
		//100ms毎にスクロール位置をサンプリング
		sampling: function () {
			var areaSize = 50;  //1エリアのピクセル数
			var positionArea = Math.floor($(window).scrollTop() / window.deviceInfo.pageZoomRate / areaSize);
			if (typeof this.pageAreaTimeData[positionArea] === 'undefined') {
				this.pageAreaTimeData[positionArea] = 0;
			}

			//グローバルメニューを開いているときは処理を無効
			if ( ! $('#global_menu.open').length) {
				this.pageAreaTimeData[positionArea]++;
			}

			var sendData = JSON.stringify({
				'w': window.deviceInfo.windowWidth,
				'h': window.deviceInfo.windowHeight,
				't': window.tapData,
				'p': window.pageAreaTimeData
			});
			localStorage['pva_dat'] = sendData;
			localStorage['pva_url'] = location.href;
		}
	};
	var View = Backbone.View.extend(backBoneApplication.view);
	var view = new View;
	var touchStartPos = null;
});

