---
layout: post
title: "Using apply with table valued functions"
date: 2014-06-05 +1000
comments: true
categories: ['mssql', 'apply', 'cross apply', 'outer apply', 'table-valued function']
---


So I got asked the other day whether it was possible to call a table-valued function for each 
record returned from another table-valued function, in one statement. 

It is possible, thanks to the ``apply`` operator - see [MSDN](http://technet.microsoft.com/en-us/library/ms175156\(v=SQL.105\).aspx) for more.

So if we take a contrived example of a parent with children.

```sql
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
```

If we try a simple query where we get all the parents and `cross apply` that with children...

```sql
	-- 
	select p.PersonId, p.FirstName, k.FirstName, k.ParentId
	from dbo.fnGetParent() p
	cross apply dbo.fnGetKids(p.Personid) k
```
we will get all records from left side that have records on right, as shown in the screen grab.

![Cross Apply Result Table](public/assets/2014/06/20140605-using-cross-apply-with-table-valued-functions.png)

With that example in mined. If we now try the same query but instead use `outer apply`...

```sql
	-- 
	select p.PersonId, p.FirstName, k.FirstName, k.ParentId
	from dbo.fnGetParent() p
	outer apply dbo.fnGetKids(p.Personid) k
```

We now get all records from left regardless of whether they have records on right.

![Outer Apply Result Table](public/assets/2014/06/20140605-using-outer-apply-with-table-valued-functions.png)

I'm not going to go much more into this as others have written better articles, so here's [Rob](http://sqlblog.com/blogs/rob_farley/archive/2011/04/13/the-power-of-t-sql-s-apply-operator.aspx
).

