This project is meant to be a remote interface via a web application to the host machine in order to send mouse movements and keyboard interactions.

See the image below for an understanding of how all components of this project should work together

You can use this `Caddyfile` for a deployment to a host machine
```
:88 {
    # Serve static files from the specified directory
    root * C:\Users\Jake\Desktop\web-trackpad\frontend\dist
    file_server

    # Enable logging for the file server and output to console
    log {
        output stdout
    }

    # Reverse proxy WebSocket connections
    @ws {
        path /ws*
    }
    reverse_proxy @ws localhost:8765

    # Enable logging for the WebSocket proxy and output to console
    log {
        output stdout
    }
}

```
![Image of project design](https://raw.githubusercontent.com/jaygarza1982/web-trackpad/main/web-trackpad-design.png)
