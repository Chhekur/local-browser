const ipc = require('electron').ipcMain;
const dfs = require('dropbox-fs')({
    apiKey: 'JNGlu45zHTAAAAAAAAAACtJtnrBpBH85NBIT7Ow0oI82RGptj28bATaQSAd5TRbr'
});
const ajax = require('ajax-request');

ipc.on('make-route', function(event, url, domain_name){
	dfs.readFile('/routes.json', (err, result) => {
		console.log('reading json ');
		console.log(result);
		let data = JSON.parse(result.toString());
		console.log(data);
		data['ptp://www.' + domain_name] = {
			redirect_url : url
		}
		data['ptp://' + domain_name] = {
			redirect_url: url
		}
		data[url] = {
			redirect_url: 'ptp://www.' + domain_name
		}
		data = JSON.stringify(data,null , 2);
		dfs.writeFile('/routes.json', data , function(err, result) {
	    	if(err) throw err;
	    	// console.log(result);
	    	// event.returnValue = {error: false, msg: 'Successful'};
	    })
	})
})

ipc.on('find-original-route', function(event, url, parsed_url){
	dfs.readFile('/routes.json', (err, result) => {
		let data = JSON.parse(result.toString());
		let temp_url = parsed_url.protocol + '//' + parsed_url.hostname;
		if(data[temp_url] == undefined){
			mainWindow.webContents.send('get-original-route',{error:true, final_url:null} );
			// event.returnValue = {error:true, final_url:null}
		}else{
			let original_url = data[temp_url].redirect_url;
			console.log(temp_url, original_url);
			let final_url = url.replace(temp_url, original_url);
			console.log(url, parsed_url, final_url);
			mainWindow.webContents.send('get-original-route',{error :false, final_url:final_url} );
			// event.returnValue = {error :false, final_url:final_url};
		}
		// console.log(final_url);
		// webview.loadURL(final_url);
	});
})


ipc.on('find-route', function(event, url, parsed_url){
	dfs.readFile('/routes.json', (err, result) => {
		let data = JSON.parse(result.toString());
		let temp_url = parsed_url.protocol + '//' + parsed_url.hostname;
		if(data[temp_url] == undefined){
			event.returnValue = {error:true, final_url:null}
		}else{
			let original_url = data[temp_url].redirect_url;
			console.log(temp_url, original_url);
			let final_url = url.replace(temp_url, original_url);
			console.log(url, parsed_url, final_url);
			event.returnValue = {error :false, final_url:final_url};
		}
		// console.log(final_url);
		// webview.loadURL(final_url);
	});
})

ipc.on('is-domain-available', function(event, domain_name){
	dfs.readFile('/routes.json', (err, result) => {
		// console.log('reading json ');
		// console.log(result);
		let data = JSON.parse(result.toString());
		// console.log(data);
		if(data['ptp://www.' + domain_name] != undefined){
			event.returnValue = false;
		}else{
			event.returnValue = true;
		}
	})
})


function cleareUnavailableRoutes(){
	dfs.readFile('/routes.json', function(err, result){
		if(err) throw err;
		let domains = JSON.parse(result.toString());
		let temp_domains = domains;
		for (let domain in domains){
			if(domains[domain].redirect_url && domains[domain].redirect_url.startsWith('http')){
				ajax({
					url:domains[domain].redirect_url
					// error:function(error){
					// 	if(error.responseText == '404'){
					// 		if(temp_domains[domains[domain]]);
					// 			delete temp_domains[domains[domain]];
					// 		if(temp_domains[domain]);
					// 			delete temp_domains[domain];
					// 	}
					// }
				}, function(error, response, body){
					// console.log(domains[domain].redirect_url);
					console.log(body);
					if(body == "404"){
						if(temp_domains[domains[domain].redirect_url]);
							delete temp_domains[domains[domain].redirect_url];
						if(temp_domains[domain]);
							delete temp_domains[domain];
					}
					let data = JSON.stringify(temp_domains, null, 2)
					dfs.writeFile('/routes.json', data , function(err, result) {
				    	if(err) throw err;
				    	// console.log(result);
				    	// event.returnValue = {error: false, msg: 'Successful'};
				    })
				})
			}
		}
		// console.log(temp_domains);
		mainWindow.webContents.send('unavailableRoutesCleared');
	});
}

ipc.on('cleareUnavailableRoutes', function(event){
	cleareUnavailableRoutes();
});