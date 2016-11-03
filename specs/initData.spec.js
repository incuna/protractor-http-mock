'use strict';

var fs = require('fs');
var path = require('path');

var initDataModule = {
	path: '../lib/initData',
	require: function () {
		return require(this.path);
	},
	teardown: function () {
		delete require.cache[require.resolve(this.path)];
	}
};

var defaultConfig = {
	path: path.join(__dirname, '../protractor-conf.js'),
	setup: function () {
		fs.writeFileSync(this.path, 'exports.config = {}');
	},
	teardown: function () {
		fs.unlinkSync(this.path);
	}
};

var globalMocks = {
	setup: function () {
		global.protractor = {};
		global.browser = {
			addMockModule: function () {},
			executeScript: function () {},
			executeAsyncScript: function () {}
		};
	},
	teardown: function () {
		delete global.protractor;
		delete global.browser;
	}
};


describe('init data', function(){
	var initData;
	beforeEach(function () {
		initData = initDataModule.require();
		globalMocks.setup();
		defaultConfig.setup();
	});
	afterEach(function () {
		initData = null;
		initDataModule.teardown();
		globalMocks.teardown();
		defaultConfig.teardown();
	});

	it('will not error when not providing config', function () {
		expect(initData).not.toThrow();
	});

	it('uses executeScript for all browser methods', function () {
		var browserMethods = [
			'requestsMade',
			'clearRequests',
			'add',
			'remove'
		];
		spyOn(global.browser, 'executeScript');
		spyOn(global.browser, 'executeAsyncScript');
		browserMethods.forEach(function (method) {
			initData[method]();
			expect(global.browser.executeScript).toHaveBeenCalled();
			expect(global.browser.executeAsyncScript).not.toHaveBeenCalled();
		});
	});
});
