---
layout: post
title: "XQuery fun with text node selector"
date: 2014-11-14 +1100
comments: true
categories: ['xquery', 'text', 'text node', 'selector', 'mssql']
---

I came across a puzzling bug this morning using the `text()` node selector.

Here's an example of the problem, note its contrived and is only used to help highlight the behaviour that we are observing. Take the following snippet of XML, say we want to grab the first `region` value.

```
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

Here's a XQuery that would do it using the `text()` node selector (I know there's other ways but bear with me);

```
//person/addresses/address/region/text()
```

You'll find that the result is not what you might expect, in our case we want an empty string or a `null`. However what you get is `somewhere`! Oh snap!

What's going on? Well the `text()` node selector returns text nodes, if the node is not defined then it will not return it. Makes sense when you think about it however it'd be nice if there was a `bool` argument that you could pass that would include `nil` nodes.

Anyway, a better way to perform the query would be to pull the node before obtaining the text. Like so;

```
//person/addresses/address/region[1]/text()
```

The point of this post is that you should be aware of how selectors work so that you do not return the wrong value. 
