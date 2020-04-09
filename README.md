# play-x-play-controller

## todo

* After playing a game through to win, and then detecting a new game and starting the button listening we see this: 
```text
Checking for active game on table: prototype_controller
Getting URL: http://172.16.0.28:3000/ping-pong/tables/prototype_controller/game
- active game found.  gameId: 8017c3aa-27b5-4eb8-8d01-2b9819351de8

Error getting gameStatus for tableId: prototype_controller.  Error: Error: Bad file descriptor
(node:32274) UnhandledPromiseRejectionWarning: Error: Bad file descriptor
    at Gpio.watch (/home/desmond/play-x-play-controller/node_modules/onoff/onoff.js:250:20)
    at pxpClient.getGameStatusForTableId.then (/home/desmond/play-x-play-controller/server.js:62:35)
    at process._tickCallback (internal/process/next_tick.js:68:7)
(node:32274) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 2)
(node:32274) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
getting health
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