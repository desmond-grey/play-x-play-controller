# play-x-play-controller

## todo

* After playing a game through to win, game goes back into "waiting for game" state but LED blinking is out-of-sequence 

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