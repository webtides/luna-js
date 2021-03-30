/**
 * The luna-js livereload development script.
 */
(function() {
    const { port } = window.luna.config;
    const livereloadPort = port + 1;

    const socket = new WebSocket(`ws://localhost:${livereloadPort}`);
    socket.addEventListener('open', function() {
        console.log("Livereload client successfully connected to server");
    });

    socket.addEventListener('message', function(event) {
        const message = JSON.parse(event.data);

        switch (message.action) {
            case "reload":
                window.location.reload();
                break;
        }
    })
})();
