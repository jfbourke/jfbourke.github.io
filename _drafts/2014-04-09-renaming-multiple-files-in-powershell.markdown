---
layout: post
title: "Renaming multiple files in Powershell"
date: 2014-09-09 +1100
comments: true
categories: ['powershell']
---

So I ran into an issue today where I was given some MSSQL database backup files that were prefixed and 
suffixed with values that were not appropriate for their final use. Instead of hand renaming each file I decided
to try and flex my Powershell muscles... here's the result

```
ls *.bac | foreach { rename-item $_ -newname ($_.name -replace ( $_.name -replace "suffix.bac", ".bak" ), "prefix_", "" ) }
```

--todo: look into the pipe function
--todo: perhaps enhance using regex
