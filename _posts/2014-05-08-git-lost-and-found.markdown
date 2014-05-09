---
layout: post
title: "git Lost and Found"
date: 2014-05-08 +1100
comments: true
categories: ['git','branch','fsck','--lost-found']
---

I got asked a git question the other day and thought I should blog my reply.

>Is it safe to run this? ``git branch -f master origin/master``

To which I replied: Yes, with a but.

##The But?
Any local commits you have may be orphaned.

##Why?
What you need to know about that command is that if (and let's assume it does) the branch ``master`` exists, then 
the ``-f`` switch will mean that the local branch gets reset to the remote branch, thus removing any local commits.

See the Options section under Branching in the manual, <http://git-scm.com/docs/git-branch>, for more.

##Let's see what I mean

We will work with a local repository and two branches for this example. 

```
E:\_scratch\gitlostfound> git init
Initialized empty Git repository in E:/_scratch/gitlostfound/.git/
E:\_scratch\gitlostfound [master]> "first test" | Out-File first.txt
E:\_scratch\gitlostfound [master]> git add . ; git commit -m "First file"
[master (root-commit) b5ee354] First file
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 first.txt
E:\_scratch\gitlostfound [master]> "second test" | Out-File second.txt
E:\_scratch\gitlostfound [master]> git add . ; git commit -m "Second file"
[master d986f3b] Second file
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 second.txt
E:\_scratch\gitlostfound [master]> git checkout -b somebranch
Switched to a new branch 'somebranch'
E:\_scratch\gitlostfound [somebranch]> "third test" | Out-File third.txt
E:\_scratch\gitlostfound [somebranch]> git add . ; git commit -m "Third file"
[somebranch f4203be] Third file
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 third.txt
E:\_scratch\gitlostfound [somebranch]> "fourth test" | Out-File fourth.txt
E:\_scratch\gitlostfound [somebranch]> git add . ; git commit -m "Fourth file"
[somebranch ef3ce58] Fourth file
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 fourth.txt
E:\_scratch\gitlostfound [somebranch]> git checkout master
Switched to branch 'master'
E:\_scratch\gitlostfound [master]> "fifth test" | Out-File fifth.txt
E:\_scratch\gitlostfound [master]> git add . ; git commit -m "Fifth file"
[master 693e3b1] Fifth file
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 fifth.txt
E:\_scratch\gitlostfound [master]> git log --graph --abbrev-commit --decorate --format=format:'%C(bold normal)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n'' %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all
* 693e3b1 - Fri, 9 May 2014 10:23:52 +1000 (65 seconds ago) (HEAD, master)
| ' Fifth file - Jonathan Bourke
| * ef3ce58 - Fri, 9 May 2014 10:23:09 +1000 (2 minutes ago) (somebranch)
| | ' Fourth file - Jonathan Bourke
| * f4203be - Fri, 9 May 2014 10:22:52 +1000 (2 minutes ago)
|/  ' Third file - Jonathan Bourke
* d986f3b - Fri, 9 May 2014 10:21:02 +1000 (4 minutes ago)
| ' Second file - Jonathan Bourke
* b5ee354 - Fri, 9 May 2014 10:19:40 +1000 (5 minutes ago)
  ' First file - Jonathan Bourke
E:\_scratch\gitlostfound [master]>
```

So after all that what we have is a repository with two branches. Now if we run the branch reset command that 
was mentioned at this start of this post an interesting thing occurs. Let's take a look...

```
E:\_scratch\gitlostfound [master]> git branch -f somebranch master
E:\_scratch\gitlostfound [master]> git log --graph --abbrev-commit --decorate --format=format:'%C(bold normal)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n'' %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all
* 693e3b1 - Fri, 9 May 2014 10:23:52 +1000 (4 minutes ago) (HEAD, somebranch, master)
| ' Fifth file - Jonathan Bourke
* d986f3b - Fri, 9 May 2014 10:21:02 +1000 (7 minutes ago)
| ' Second file - Jonathan Bourke
* b5ee354 - Fri, 9 May 2014 10:19:40 +1000 (8 minutes ago)
  ' First file - Jonathan Bourke
E:\_scratch\gitlostfound [master]>
```

Where'd the work on ``somebranch`` go?

##How do you get them back?

First we need to switch back to ``somebranch``. This is **very important** because if we perform the next steps in 
``master`` then the history will show that the work was originally done there and not in ``somebranch``.

```
E:\_scratch\gitlostfound [master]> git checkout somebranch
Switched to branch 'somebranch'
E:\_scratch\gitlostfound [somebranch]> git fsck --lost-found
Checking object directories: 100% (256/256), done.
dangling commit ef3ce583d09f7b438c06da450f33620043cd2ce6
E:\_scratch\gitlostfound [somebranch]>
```

Once you ascertain which commits to reapply, simply merge that commit:

```
E:\_scratch\gitlostfound [somebranch]> git merge ef3ce58
Merge made by the 'recursive' strategy.
 fourth.txt | Bin 0 -> 28 bytes
 third.txt  | Bin 0 -> 26 bytes
 2 files changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 fourth.txt
 create mode 100644 third.txt
E:\_scratch\gitlostfound [somebranch]> git log --graph --abbrev-commit --decorate --format=format:'%C(bold normal)%h%C(reset) - %C(bold cyan)%aD%C(reset) %C(bold green)(%ar)%C(reset)%C(bold yellow)%d%C(reset)%n'' %C(white)%s%C(reset) %C(dim white)- %an%C(reset)' --all
*   9e45311 - Fri, 9 May 2014 10:29:19 +1000 (5 seconds ago) (HEAD, somebranch)
|\  ' Merge commit 'ef3ce58' - Jonathan Bourke
| * ef3ce58 - Fri, 9 May 2014 10:23:09 +1000 (6 minutes ago)
| | ' Fourth file - Jonathan Bourke
| * f4203be - Fri, 9 May 2014 10:22:52 +1000 (7 minutes ago)
| | ' Third file - Jonathan Bourke
* | 693e3b1 - Fri, 9 May 2014 10:23:52 +1000 (6 minutes ago) (master)
|/  ' Fifth file - Jonathan Bourke
* d986f3b - Fri, 9 May 2014 10:21:02 +1000 (8 minutes ago)
| ' Second file - Jonathan Bourke
* b5ee354 - Fri, 9 May 2014 10:19:40 +1000 (10 minutes ago)
  ' First file - Jonathan Bourke
E:\_scratch\gitlostfound [somebranch]>
```

Done! Of course this is a very simply example, your mileage may vary.
