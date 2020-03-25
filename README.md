# play-x-play-controller

## todo

* does not flash red if it cannot find a server, errors out instead with: 
```text
desmond@raspberrypi:~/play-x-play-controller $ npm start

> play-x-play-controller@0.9.2 start /home/desmond/play-x-play-controller
> node server.js

Checking health of connection
getting health
Error: Error: connect ECONNREFUSED 172.16.0.16:3000
{ Error: connect ECONNREFUSED 172.16.0.16:3000
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1107:14)
  errno: 'ECONNREFUSED',
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '172.16.0.16',
  port: 3000 }
```

## main flow

Thank you http://asciiflow.com/
```text
                                      +-----------+ <-+ <-+
                                      |           |   |   |
                                  Blink Red       |   |   |
                                      |           |   |   |
                                      v           |   |   |
                               +------+------+    |   |   |
               +------> +----> | checkHealth +-No-+   |   |
               |        |      +-------------+        |   |
               |        |            Yes              |   |
               |        |             |               |   |
               |        |             |               |   |
               |        |         Blink Green         |   |
               |        |             |               |   |
               |        |             v               |   |
               |        |      +------+-------+       |   |
               |        +--No--+ isGameActive +-ERROR-+   |
               |               +--------------+           |
               |                     Yes                  |
               |                      |                   |
               |                      |                   |
               |                  Solid Green             |
               |                      |                   |
               |                      v                   |
               |         +------------+--------------+    |
               |         | register button listeners |    |
               |         +---------------------------+    |
               |                                          |
+--------------+--------------+                           |
| unregister button listeners |                           |
+--------------+--------------+                           |
               |                Button Pressed            |
               |                      |                   |
               |                      v                   |
               |             +--------+---------+         |
               +--GAME-OVER--+ POST pointScored +--ERROR--+
                             +------------------+
                                   SUCCESS

                         Continue to await button press
```
Thank you http://asciiflow.com/