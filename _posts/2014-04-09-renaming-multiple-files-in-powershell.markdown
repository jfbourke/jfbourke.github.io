---
layout: post
title: "Renaming multiple files in Powershell"
date: 2014-04-09 +1100
comments: true
categories: ['powershell']
---

So I ran into an issue today where I was given some MSSQL database backup files that were prefixed and 
suffixed with values that were not appropriate for their final use. Instead of hand renaming each file I decided
to try and flex my Powershell muscles... here's the result

```
ls *.bak | foreach { rename-item $_ -newname ([regex]::Replace($_.name, "prefix(\w+)suffix", '$1', "IgnoreCase")) }
```

The first step is to select the files we want to rename. In this example it was done using the `ls` cmdlet with a file extension file. The results of this are then put through the [`foreach`](http://technet.microsoft.com/en-us/library/ee176828.aspx) cmdlet. Which in this case has a function defined that each result is passed into which in turn calls the `rename-item` cmdlet.

