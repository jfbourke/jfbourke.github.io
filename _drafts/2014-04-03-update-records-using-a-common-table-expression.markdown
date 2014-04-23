---
layout: post
title: "Update records using a Common Table Expression"
date: 2014-04-03 +1100
comments: true
categories: ['cte', 'mssql', 'common', 'table' , 'expression']
---

Rather than using a subquery or IN statement I wanted to use a JOIN. Here's how I did it:

```
with mycte as (
  select id, col1 from table1
)
update t2
set t2.col1 = c.col1
from table2 t2
inner join mycte c on t2.id = c.id
```

--todo: explain things a little better
