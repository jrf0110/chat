$(function () {
    window.app = new Views.App();

    // Peer relay setup
    // Set up to broadcast messages to all peers
    var peerAPIs = {};
	var relay = local.peerRelay('http://grimwire.net:8000/s/foobar');
	relay.onJoin(function(peer) {
		console.log('join', peer);

		// Connect to any new members in the station
		var server = relay.initiate(peer);
		setupPeerServer(server);
		peerAPIs[peer.stream] = local.navigator(server.getUrl());
	});
	relay.onInitiate(function(peer) {
		console.log('initiate', peer);

		// Accept any requested connections
		var server = relay.accept(peer);
		setupPeerServer(server);
		peerAPIs[peer.stream] = local.navigator(server.getUrl());
	});
	function broadcast(text) {
		for (var k in peerAPIs) {
			peerAPIs[k].post(text);
		}
	}

	// View Updater
	function addUserStatement(user, text) {
		$('#chatout').append('<strong>'+user+'</strong> '+text+'<br/>');
	}

	$('#chatsend').on('click', onUserSpeak);
	$('#chatin').on('keypress', function(e) { if (e.keyCode == 13) { onUserSpeak(e); return false; } });
	function onUserSpeak(e) {
		var statement = $('#chatin').val();
		if (statement) {
			addUserStatement('you', statement);
			broadcast(statement);
		}
		$('#chatin').val('');
		return false;
	}

	function setupPeerServer(server) {
		server.handleRemoteWebRequest = handlePeerWebRequest;
		server.on('connected', function() {
			$('#chatout').append('<em>'+server.getUrl()+' connected</em><br/>');
		});
		server.on('disconnected', function() {
			$('#chatout').append('<em>'+server.getUrl()+' disconnected</em><br/>');
		});
	}

	function handlePeerWebRequest(req, res) {
		var peer = this.config.peer;

		if (req.path != '/') {
			return res.writeHead(404).end();
		}

		res.setHeader('Link', [
			{ href: '/', rel: 'service chat.grimwire.com/-peer', id: 'chat' }
		]);

		if (req.method == 'HEAD') {
			return res.writeHead(204).end();
		}

		if (req.method == 'POST') {
			if (req.headers['content-type'] != 'text/plain') {
				return res.writeHead(415, 'content-type must be text/plain').end();
			}

			req.finishStream().then(function(body) {
				addUserStatement(peer.user, body);
				res.writeHead(204).end();
			});
			return;
		}

		res.writeHead(405, 'bad method');
		res.end();
	}
});
