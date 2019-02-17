const Mousetrap = require('mousetrap');


Mousetrap.bind(['command+t', 'ctrl+t'], function() {
	newTab('https://google.com');
});
Mousetrap.bind(['command+w', 'ctrl+w'], function() {
	closeCurrentTab(currentTab);
});
Mousetrap.bind(['command+shift+i', 'ctrl+shift+i'], function() {
	openDevTools();
});
Mousetrap.bind(['command+r', 'ctrl+r'], function() {
	reloadCurrentTab();
});