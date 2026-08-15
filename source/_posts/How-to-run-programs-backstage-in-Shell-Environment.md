---
title: How to run programs backstage in Shell Environment
date: 2024-04-02 11:11:11
tags:
- Notes
---

What can we do to avoid a LARGE number of logs while running a program? Here's the deal...

<!--more-->

# About `nohup` and "`&` after a  command" in command line

Now we have a C program called `test.c` for example, which prints out "Hello~" every second.

```c
// test.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main() {
	fflush(stdout);
	setvbuf(stdout, NULL, _IONBF, 0);

	for (;;) {
		printf("Hello~\n");
		sleep(1);
	}
	return 0;
}
```

But, we hate those "Hello~" out there. We require running `./test` backstage.

## &

A simple way to achieve such goal is to add a `&` marker after the command:

```bash
./test &
```

However, as we run the program, it goes like this:

```
❯ ./test &
[2] 1988
Hello~

❯ Hello~
Hello~
Hello~
Hello~
Hello~
Hello~
Hello~
Hello~
...
```

It's still printing out logs in our terminal. In order to make our terminal clear completely, we have to redirect the output to a certain file like this:

```bash
./test >> out.txt 2>&1 &
```

where `2>&1` means redirecting standard error to standard output, so that both are redirected to the certain file called `out.txt`. Now we finally make our terminal clear.

But DO be awared that if this `./test` program has to get data from standard input, it would just wait there, doing nothing, for your data input from `stdin`, without continuing to run, so we'd better not use this method.

By the way, how do we find the program while it's running backstage? Here are two ways for this:

### 1. `jobs`

We can type `jobs -l` to see our running program:

```
❯ jobs -l
[1]  + 89036 running    ./test >> out.txt 2>&1
```

It shows PID, status(running/stopped/terminated) of all jobs. But if the job is killed, the shell would delete the job from process list. 

### 2. `ps`

We can type `ps aux | grep "your_program"`:

```
❯ ps aux | grep "test"
root       92218   0.0  0.0 407966112    176 s001  U+   10:46AM   0:00.00 grep --color=auto --exclude-dir=.bzr --exclude-dir=CVS --exclude-dir=.git --exclude-dir=.hg --exclude-dir=.svn --exclude-dir=.idea --exclude-dir=.tox test
root      92132   0.0  0.0 408495744   1152 s001  SN   10:46AM   0:00.00 ./test
❯ jobs -l
[1]  + 92132 running    ./test >> out.txt 2>&1
```

## `nohup`

By adding a `&` after a command, the program is able to run backstage. But if we close the current terminal, the program stops.

`nohup` for "no hang up". While we want to exit current terminal but require running the program backstage, we can use `nohup`:

```bash
nohup ./your_program &
```

By typing this command, the output would be redirected to a file called `nohup.out` in default. Of course we can designate a certain file by typing:

```bash
nohup ./your_program > my_out.txxt 2>&1 &
```

Now that we can not only use `nohup` command, but use `&` mark as well, and redirect standard output with standard error to the certain file at the same time.

---

Well, sometimes when current account exits abnormally or terminates, the program stops, so we'd better type `exit` to exit the current account at normal status after running the command using `nohup`, so that we can make sure the program is running backstage continuously.

---

This is all for now...

