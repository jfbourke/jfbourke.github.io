---
layout: post
title: "Working with Entity Framework 4 and MS SQL Spatial Types"
date: 2010-11-15 +1100
comments: true
categories: ['dotnet', 'ef4', 'entity framework', 'spatial', 'sql']
---

I’ve been involved in a project at work recently that required the ability to maintain records that contained spatial information. The ORM of choice for the project was Entity Framework 4. During the build I ran into several problems. In this post I’ll detail what barriers I found, the options available to work around them and the solution I chose.

What we intend to build here is an editor, so first things first, let’s create a table to hold our data.

```sql
CREATE TABLE [dbo].[Dinners](
	[DinnerId] [int] NOT NULL,
	[Title] [nvarchar](50) NOT NULL,
	[Location] [geography] NOT NULL
)
```

The next step is to create a VS2010 project, to which we’ll add a class to model our Dinners table.

```csharp
using System;

namespace JB.DinnersWithSpatial.Core
{
	public class Dinner
	{
		public int DinnerId { get; set; }
		public string Title { get; set; }
		public byte[] Location { get; set; }
	}
}
```

Next we’ll add an ADO.NET Entity Data Model called DinnersModel.edmx. This will kick start a wizard that will ask you about database connectivity and which entities from the database you want to include in your model. Be sure to grab the Dinners table. After you click finish the model should be visible, but wait where is the Location property? Checking the warnings shows the following:

    warning 6005: The data type 'geography' is not supported; the column
    'Location' in table 'JBExamples.dbo.Dinners' was excluded.

Well that’s just not cricket! So EF4 doesn't support spatial types, time for a
workaround. After searching the deepest darkest corners of the internet we
came across a simple [solution using a view](http://thedatafarm.com/blog/data-
access/yes-you-can-read-and-probably-write-spatial-data-with-entity-
framework/). So now we need to create a view to represent our Dinners table.

```sql	
CREATE VIEW [dbo].[vw_DinnersAsBinary]
AS
SELECT [DinnerId], [Title], CONVERT(VARBINARY(MAX), [Location], 0) AS [Location]
FROM [dbo].[Dinners]
```


With that done we need to edit the DinnersModel.edmx. The entity for Dinners
should be replaced with the View we just created. Once the entity representing
the View is added we need to open its properties and rename it to Dinner (the
Entity Set Name should be Dinners). After saving you may notice that there is
a new message in the errors list:

    
    The table/view 'dbo.vw_DinnersAsBinary' does not have a primary key defined.
    The key has been inferred and the definition was created as a read-only
    table/view.

EF4 is telling us that since Views don't support primary keys it has helped us
by creating one, however the one it defines is not correct. The only property
that should have Entity Key setting equal to true is DinnerId, so lets update
the others. With that done we can move onto the repository plumbing.

## Setting up for POCOs

In order to get our clean class to be used we need to turn off the code
generation that is being done. To do this view the properties of
DinnersModel.edmx and remove the value for Custom Tool. Once deleted the .cs
file should disappear.

Now when we try to insert a new record we get another error.

    
    Update or insert of view or function 'dbo.vw_DinnersAsBinary' failed because
    it contains a derived or constant field.

This rabbit hole is getting deeper and deeper and we've just hit a fork in the
tunnel. We have two options here. Either create CRUD stored procedures or use
Instead Of triggers.

## Approach 1 - Stored Procedures

This approach means creating the CRUD procedures, opening your mapping file
and adding those procedures to it. Once that is done you need to go into your
repository implementation (or context) and modify the code to call the
procedures instead.

I'm not a huge fan of this approach because there is the need to map extra
objects from the DB and extra code to write.

## Approach 2 - Instead Of Triggers

The second approach is to use Instead Of triggers. These types of trigger
allow you to intercept an action. So taking our insert statement above we
could employ an Instead Of trigger to intercept the action from the view and
perform the insert correctly.

First we need to modify the edmx so that EF4 thinks the view is a table. To do
this we need to open the edmx with the XML editor. Somewhere near the top of
the file will be the definition of vw_DinnersAsBinary, you’ll know if because
it will contain a DefiningQuery element. Here’s what mine looked like.


```xml	
<EntitySet Name="vw_DinnersAsBinary" EntityType="DinnersModel.Store.vw_DinnersAsBinary" store:Type="Views" store:Schema="dbo" store:Name="vw_DinnersAsBinary">
	<DefiningQuery>SELECT
		[vw_DinnersAsBinary].[DinnerId] AS [DinnerId],
		[vw_DinnersAsBinary].[Title] AS [Title],
		[vw_DinnersAsBinary].[Location] AS [Location]
		FROM [dbo].[vw_DinnersAsBinary] AS [vw_DinnersAsBinary]
	</DefiningQuery>
</EntitySet>
```

After making the changes it now looks like this

```xml	
<EntitySet Name="vw_DinnersAsBinary" EntityType="DinnersModel.Store.vw_DinnersAsBinary" store:Type="Tables" Schema="dbo" />
```

Now we add our INSERT trigger. Note the use of the STPointFromWKB method is used to convert the incoming binary stream into a SQL spatial object.

```sql
CREATE TRIGGER [dbo].[trg_vw_DinnersAsBinary_Insert]
ON [dbo].[vw_DinnersAsBinary]
INSTEAD OF INSERT
AS
BEGIN
	INSERT INTO [dbo].[Dinners](DinnerId, Title, Location)
	SELECT DinnerId, Title, geography::STPointFromWKB((SELECT Location FROM inserted), 4326)
	FROM inserted
END
```

I like this approach because there is no need to map extra objects from the DB
and no extra code to write. Supporting other [SRIDs](http://msdn.microsoft.com
/en-us/library/bb964707.aspx) might prove an issue, however I don’t think
solving that is too hard.

## Workarounds suck

The down side to all of this is that without native support for spatial types
in EF4 you cannot use the spatial querying that MS SQL provides and when MS
does support spatial types in EF you've got code changes to make (if you
decide to).

If anyone knows any other ways of doing this please post, I’d love to hear
about them.