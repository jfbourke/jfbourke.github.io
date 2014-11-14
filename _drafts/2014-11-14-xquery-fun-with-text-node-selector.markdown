---
layout: post
title: "XQuery fun with text node selector"
date: 2014-11-14 +1100
comments: true
categories: ['xquery', 'text', 'text node', 'selector']
---

I came across a puzzling bug this morning regarding node selection using the `text()` selector.

```
<xml>
<person>
  <addresses>
    <address>
      <line1>100 Long Road</line1>
      <line2>Unit 3</line2>
      <locality>x</locality>
      <region />
    </address>
    <address>
      <line1>5 Smith St</line1>
      <line2 />
      <locality>y</locality>
      <region>somewhere</region>
    </address>
  </addresses>
</person>

```

Here's the query

```
/person/addresses/address/region/text()[1]
```

When you think about it `text()` will return text nodes, if the node is not defined then it will not return. 
It'd be nice if there was a `bool` argument that you could pass that would include `nil` nodes.

Anyway, the correct way to perform the same query is to pull the node before obtaining the text. Like so;

```
/person/addresses/address/region[1]/text()[1]
```
