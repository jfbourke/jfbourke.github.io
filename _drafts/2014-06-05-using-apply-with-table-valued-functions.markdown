---
layout: post
title: "Using apply with table valued functions"
date: 2014-06-05 +1000
comments: true
categories: ['mssql', 'apply', 'cross apply', 'outer apply', 'table-valued function']
---


So I got asked the other day whether it was possible to call a table-valued function for each 
record returned from another table-valued function, in one statement. 

It is possible, thanks to the ``apply`` operator.


```
	use JB;

	IF OBJECT_ID (N'dbo.fnGetParent', N'TF') IS NOT NULL
	DROP FUNCTION dbo.fnGetParent;
	GO

	create function dbo.fnGetParent()
	returns @parent table
	(
		PersonId int primary key not null,
		FirstName nvarchar(255) not null,
		IsParent bit not null
	)
	as
	begin
	   
		insert into @parent values (1, 'Jim', 1)
		insert into @parent values (2, 'Sarah', 1)
		insert into @parent values (3, 'Fred', 0)
	   
		return
	end;
	go

	IF OBJECT_ID (N'dbo.fnGetKids', N'TF') IS NOT NULL
	DROP FUNCTION dbo.fnGetKids;
	GO

	create function dbo.fnGetKids (@parentId int)
	returns @child table
	(
		ChildId int primary key not null,
		ParentId int not null,
		FirstName nvarchar(255) not null
	)
	as
	begin
	   
		insert into @child values (1, 1, 'Zelda')
		insert into @child values (2, 2, 'Chris')
		insert into @child values (3, 1, 'Mandy')
	   
		delete from @child where ParentId <> @parentId
	   
		return
	end;
	go

	-- get records from left side that have records on right = inner join?
	select p.PersonId, p.FirstName, k.FirstName, k.ParentId
	from dbo.fnGetParent() p
	cross apply dbo.fnGetKids(p.Personid) k

	-- get records from left regardless of whether they have records on right = left join?
	select p.PersonId, p.FirstName, k.FirstName, k.ParentId
	from dbo.fnGetParent() p
	outer apply dbo.fnGetKids(p.Personid) k
```

Here's Rob; http://sqlblog.com/blogs/rob_farley/archive/2011/04/13/the-power-of-t-sql-s-apply-operator.aspx
