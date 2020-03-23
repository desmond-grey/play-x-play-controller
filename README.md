# play-x-play-controller

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