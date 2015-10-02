---
layout: post
title: "Excel formulae"
date: 2015-10-02 +1100
comments: false
categories: ['excel', 'formula']
---


Formula for retrieving the text after the last occurence of a character. In this example the character is an underscore (_).
```
=TRIM(RIGHT(SUBSTITUTE(A1, "_", REPT("*", LEN(A1))), LEN(A1)))
```
