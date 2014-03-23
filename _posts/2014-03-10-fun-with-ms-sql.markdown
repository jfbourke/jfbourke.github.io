---
layout: post
title: "Fun with MS SQL"
date: 2014-03-10 +1100
comments: true
categories: ['mssql', 'sql', 'tsql']
---

This post contains a few TSQL tidbits, mainly for my future reference...

## Bits and Pieces ##

A quick way of flipping the value of a bit field is to use the bitwise (^) operator, for example:

```sql
	UPDATE mytable
	SET mybitcol = mybitcol ^ 1
```

What this does is...

	(0 ^ 1)
		0000
		0001
		----
		0001
	
	(1 ^ 1)
		0001
		0001
		----
		0000

## Nothing is Permanent ##

So you've heard of temporary tables in TSQL, but have you heard of temporary stored procedures? Just like with temp tables we simply prefix the name
of the procedure with the hash (#) symbol. 

```sql
	CREATE PROCEDURE #IamTemporary
	AS
	BEGIN
		PRINT 'All good things must come to an end'
	END
```

And when the session ends so does the life of the temp procedure. Want to make the procedure available outside the current session? Use double hashes (##)!

Finding this procedure is a little more tricky than usual. Let's say you wanted to check if the procedure exists and drop it if it does. Normally you would
simply query against sys.objects within your database, with temp procedures you need to query within tempdb, kinda makes sense huh but you what you might not be aware of is 
that the name is not what you think. 

```sql
	SELECT name 
	FROM tempdb.sys.objects
	WHERE type = 'P' AND name LIKE '#IamTemporary%'
	
	-- returns
	
	name
	#IamTemporary____________________________________________________________________________________________________________00009464
```

See that? The name is suffixed for some reason. What could that reason be? Well if we open a new tab in SSMS and run the create procedure script again. Then run the above query to search tempdb.sys.objects we find that we get 2 records returned. Each has a slightly different suffix, which appears to be tied to the session.

So instead, to clean up the procedure for the current session we could do something like:

```sql
	IF OBJECT_ID('tempdb.dbo.#IamTemporary') IS NOT NULL
	BEGIN
		PRINT 'DROPPING'
		DROP PROCEDURE #IamTemporary
	END
	GO
```
