const ipc = require('electron').ipcRenderer;
const path = require('path');
const url_module = require('url');
const dfs = require('dropbox-fs')({
    apiKey: 'JNGlu45zHTAAAAAAAAAACtJtnrBpBH85NBIT7Ow0oI82RGptj28bATaQSAd5TRbr'
});
var localtunnel = require('localtunnel');
var app = require('http').createServer();
// error_page = require('./error_page.js');

let totalOpenedTab = 0;

// require('./key_binding.js');

let webview;
let newTabCount = 0
let tabs = {}
global.currentTab;


// function getUrl(){
// 	console.log(webview.getURL());
// }

function opentab(tab){
	// console.log('tab opened');
	currentTab = tabs[$(tab).data('tab_id')];
	if(currentTab)
		webview = document.getElementById(currentTab.webview_id);
}

function newTab(url){
	console.log(url);
	newTabCount++;
	totalOpenedTab++;
	$('<li id = "tab' + newTabCount + '" class = "nav-tab" onclick = "opentab(this)" data-tab_id = "tab' + newTabCount + '"><a href=""  role="tab" data-toggle="tab" data-target = "#tab_content' + newTabCount + '"><div class = "inline"><img class = "hide" id = "tab_loading' + newTabCount + '" src = "../assets/img/loading.gif" width = 15></img><img width=15 id = "tab_favicon'+ newTabCount +'"></img></div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div class = "inline tab-title-bar"><h id = "tab_click' + newTabCount + '"  data-tab_id = "tab' + newTabCount + '">New Tab</h></div>&nbsp;&nbsp;&nbsp;&nbsp;<span onclick = "closeAnyTab(this)" class="close black" data-tab_id = "tab' + newTabCount + '"> x</span></a></li>').insertBefore('#new-tab-button');
	$('#browsers').append('<div class="tab-pane" id = "tab_content' + newTabCount + '">\
						<div class = "url-bar-header">\
							<div class = "url-bar-buttons">\
							<button class="button url-bar-button" onclick = "backCurrentTab()"><span class="mif-arrow-left"></span></button>\
							<button class="button url-bar-button" onclick = "forwardCurrentTab()"><span class="mif-arrow-right"></span></button>\
							<button class="button url-bar-button" onclick = "reloadCurrentTab()"><i class="fas fa-redo-alt"></i></button>\
							</div>\
							<div class="url-bar-container">\
								<input contenteditable id = "url_bar' + newTabCount + '" class = "url-bar">\
							</div>\
							<div class = "inline url-bar-menu-button">\
								<button class = "button url-bar-button menu-button" data-container="body" data-toggle="popover" data-placement="bottom" data-html = "true" id = "menu"><span class="mif-menu mif-2x"></span></button>\
							</div>\
						</div>\
						<webview id="webview' + newTabCount + '" src = "' + url + '" class = "webview" webpreferences="javascript=yes"></webview>\
					</div>');

	tabs['tab' + newTabCount] = {
		id: newTabCount,
		favicon_id:'tab_favicon' + newTabCount,
		tab_loading_id: 'tab_loading' + newTabCount,
		tab_id : 'tab' + newTabCount,
		url_bar_id: 'url_bar' + newTabCount,
		tab_click_id : 'tab_click' + newTabCount,
		tab_content_id: 'tab_content' + newTabCount,
		webview_id: 'webview' + newTabCount
	}

	initListeners(tabs['tab' + newTabCount]);
	$('#' + tabs['tab' + newTabCount].tab_click_id).click();
	initPopover();
	decreaseTabSize();
}


function decreaseTabSize(){
	$('.nav-tab').css('width', `calc(95% / ${totalOpenedTab})`);
	let width = $('.nav-tab').css('width');
	// console.log(width);
	$('.tab-title-bar').css('width', `calc(${width} - 80px)`);
}


function increaseTabSize(){
	$('.nav-tab').css('width', `calc(95% / ${totalOpenedTab})`);
	let width = $('.nav-tab').css('width');
	$('.tab-title-bar').css('width', `calc(${width} - 80px)`);
}

newTab('https://google.com');
$('#tab_click1').click();

function findNextTab(deleted_tab_count){
    for(let i = deleted_tab_count + 1; i <= newTabCount; i++){
        let key = 'tab' + i;
        if(tabs.hasOwnProperty(key)) return i;
    }
    for(let i = deleted_tab_count - 1; i > 0; i--){
        let key = 'tab' + i;
        if(tabs.hasOwnProperty(key)) return i;
    }
    return undefined;
}

function closeCurrentTab(tab){
	totalOpenedTab--;
	// console.log(tab);
	let next_tab_count = findNextTab(tab.id);
	if(next_tab_count != undefined){
		$('#' + tab.tab_id).remove();
		$('#' + tab.tab_content_id).remove();
		delete tabs[tab.tab_id];
		currentTab = tabs['tab' + next_tab_count];
		$('#' + currentTab.tab_click_id).click();
	}else{
		ipc.send('close-app');
	}

	increaseTabSize();
}


function closeAnyTab(tab){
	closeCurrentTab(tabs[$(tab).data('tab_id')]);
}


function openURL(url){
	let temp = url_module.parse(url);
	// console.log(temp.protocol);
	if(temp.protocol == null || temp.protocol == "localhost:") url = 'http://' + url;
	if(temp.protocol == 'ptp:'){
		console.log(temp);
		let final_url = ipc.sendSync('find-route', url, temp);
		if(final_url.error){
			let generated_error_page = error_page({errorCode:-501, validatedURL:url});
			webview.executeJavaScript(`document.body.innerHTML = '';document.write('${generated_error_page}')`);
		}else{
			console.log(final_url);
			// $('#' + currentTab.url_bar_id).val(final_url.final_url);
			webview.loadURL(final_url.final_url);
		}
	}else if(temp.protocol != 'http:' && temp.protocol != "localhost:" && temp.protocol != 'https:' && temp.protocol != 'ptp:' && temp.protocol != null && temp.protocol != 'file:'){
		let generated_error_page = error_page({errorCode:-501, validatedURL:url});
			webview.executeJavaScript(`document.body.innerHTML = '';document.write('${generated_error_page}')`);
	}else{
		// $('#' + currentTab.url_bar_id).val(url);
		// console.log(url);
		webview.loadURL(url);
		// webview.loadURL($('#url').val());
		console.log(webview.getURL());
	}
}


// capture enter pressed at url bar


$('body').on('keypress', '.url-bar', function(e){
	// console.log('Hello')
	// return e.which != 13;
	if(e.which == 13){
		// console.log($('#' + currentTab.url_bar_id).val());
		let url = $('#' + currentTab.url_bar_id).val();
		console.log(url);
		openURL(url);
		return false;
	}else{
		// return true;
		console.log("don't know what happened");
	}
});


function minimize_app(){
	ipc.send('minimize-app');
}

function maximize_app(){
	ipc.send('maximize-app');
}
function close_app(){
	ipc.send('close-app');
}

function backCurrentTab(){
	webview.goBack();
}
function forwardCurrentTab(){
	webview.goForward();
}
function reloadCurrentTab(){

	openURL($('#' + currentTab.url_bar_id).val().toLowerCase());
	// webview.reload();
}

function updateUrlBar(tab){
	// console.log('loading');
	let temp_webview = document.getElementById(tab.webview_id);
	let url = url_module.parse(temp_webview.getURL(), true);
	let temp_url = temp_webview.getURL();

	// handeling about page, need to fix in future

	if(url.protocol == "file:" && path.basename(temp_url) == "about.html"){
		$('#' + currentTab.url_bar_id).val('local://about');
		return;
	}
	// console.log(url);
	if(url.query.error == undefined){
		// console.log('Hello');
		ipc.send('find-original-route', temp_url, url);
	}
}

ipc.on('get-original-route', function(event, final_url){
	if(final_url.error){
		// console.log(webview.getURL());
		let temp_url = url_module.parse(webview.getURL(), true);
		console.log(temp_url, final_url);
		if(temp_url.query){
			if(temp_url.query.error != "true" && !temp_url.query.errorDesc){
				// console.log('asfasfasdf');
				// console.log(temp_url.query.error);
				// $('#' + currentTab.url_bar_id).html(`<span style = "color:green">${temp_url.protocol}</span>${webview.getURL().replace(temp_url.protocol, '')}`);

				$('#' + currentTab.url_bar_id).val(webview.getURL());
				// $('#' + currentTab.url_bar_id).attr('data-prepend',temp_url.protocol);
			}
		}else{
			$('#' + currentTab.url_bar_id).val(webview.getURL());
			// $('#' + currentTab.url_bar_id).attr('data-prepend',temp_url.protocol);
		}
	}else{
		$('#' + currentTab.url_bar_id).val(final_url.final_url);
		// $('#' + currentTab.url_bar_id).attr('data-prepend',temp_url.protocol);
	}
})

function initListeners(tab){
	let temp_webview = document.getElementById(tab.webview_id);
	temp_webview.addEventListener('did-finish-load', function(){
	// temp_webview.openDevTools();
		updateUrlBar(tab);
		// $('#' + tab.url_bar_id).val(temp_webview.getURL());
		$('#' + tab.tab_click_id).text(temp_webview.getTitle());
	});

	temp_webview.addEventListener('did-fail-load', function(error){
		let generated_error_page = error_page(error);
		temp_webview.executeJavaScript(`document.body.innerHTML = '';document.write('${generated_error_page}')`);
		// console.log(error);
		// temp_webview.loadURL(path.join('file://', __dirname, '..', 'views','error.html?errorDesc=' + error + '&error=true'));
	});

	temp_webview.addEventListener('page-favicon-updated', function(favicon){
		$('#' + tab.favicon_id).attr('src',favicon.favicons[0]);
		// console.log(favicon);
	});

	temp_webview.addEventListener('did-start-loading', function(){
		$('#' + tab.favicon_id).addClass('hide');
		// $('#' + tab.tab_loading_id).addClass('show');
		$('#' + tab.tab_loading_id).removeClass('hide');
	});
	temp_webview.addEventListener('did-stop-loading', function(){
		$('#' + tab.tab_loading_id).addClass('hide');
		// $('#' + tab.tab_loading_id).removeClass('show');
		$('#' + tab.favicon_id).removeClass('hide');
		// $('#' + tab.favicon_id).removeClass('');
	})
}

$('body').on('click', '.menu-button', function(e){
	initPopover();
});

function initPopover(){
	$("[data-toggle=popover]").each(function(i, obj) {
			// console.log(i,obj);

		$(this).popover({
		  html: true,
		  content: function() {
		  	// console.log(this);
		    var id = $(this).attr('id')
		    return $('#popover-content-' + id).html();
		  }
		});

	});
}

// clear error messages on click domain field

$('body').on('click', '.domain_name_field' ,function(){
	// console.log('Hello')
	$($('.domain-error')[1]).html('');
})


// make popovers hide, when click outside

$('body').on('click', function (e) {
	// console.log('Hello');
    $('[data-toggle=popover]').each(function () {
        // hide any open popovers when the anywhere else in the body is clicked
        if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
            $(this).popover('hide');
        }
    });
});

function share_website(){
	// console.log($($('.domain_name_field')[1]).val());
	let domain_name = $($('.domain_name_field')[1]).val().toLowerCase();
	console.log(domain_name);
	if(isDomainValid(domain_name).error){
		$($('.domain-error')[1]).html(isDomainValid(domain_name).msg);
	}else{
		// console.log(ipc.sendSync('-domain-available', domain_name));
		if(ipc.sendSync('is-domain-available', domain_name)){
			let url_for_tunnel = $('#' + currentTab.url_bar_id).val();
			let parsed_url = url_module.parse(url_for_tunnel, true);
			if((parsed_url.hostname.indexOf(".com") > -1) || (parsed_url.hostname.indexOf(".io") > -1)){
				ipc.send('make-route', url_for_tunnel, domain_name);
				$($('.domain-error')[1]).html(`Your website has been shared<br><a onclick = "openURL('ptp://${domain_name}')">ptp://${domain_name}</a>`);

			}else{
				console.log(parsed_url)
				// console.log(parsed_url.port);
				let port = parsed_url.port;
				let tunnel = localtunnel((port == null)? 80 : port, function(err){
					if(err) console.log(err);
					console.log(tunnel.url);
					ipc.send('make-route', tunnel.url, domain_name);
					// console.log(result);
					$($('.domain-error')[1]).html(`Your website has been shared<br><a onclick = "openURL('ptp://${domain_name}')">ptp://${domain_name}</a>`);
					// newTab(`ptp://${domain_name}`);
				})
			}
		}else{
			$($('.domain-error')[1]).html('Domain not available');
			// console.log($('.domain-error'))
		}
	}
}


// open dev tools

function openDevTools(){
	webview.openDevTools();
}

// check domain name is valid or not

function isDomainValid(domain){
	let domain_name = domain.trim();
	if(!domain_name.endsWith('.com')) return {error:true, msg:'Add .com at the end'};
	if(domain_name.startsWith('www.')) return {error:true, msg:'No need to include www.'};
	if(domain_name.length < 7) return {error:true, msg:'Domain name should be more than 3 characters'};
	return {error:false}

}

ipc.send('cleareUnavailableRoutes');

ipc.on('unavailableRoutesCleared', function(event){
	console.log('routes cleared');
})

function openAbout(){
	console.log('open about');
	console.log(`file://${path.join(__dirname, '..', 'views', 'about.html')}`);
	newTab(`file://${path.join(__dirname, '..', 'views', 'about.html')}`);
}