---
layout: post
title: "Execute lambdas inside mock with Moq"
date: 2014-06-30 +1100
comments: true
categories: ['moq', 'mock', 'unit test', 'tdd']
---

So a colleague asked me if it was possible using Moq to mock a dependency, yet call the lambda function 
that is passed to it.

It is, here's how;

First a simple class that has a dependency, you could image that the dependency is some sort of cache provider.

```
public class MyClass
{
  private readonly IDependency dependency;

  public MyClass(IDependency dependency) {
    this.dependency = dependency;
  }
  
  public IEnumerable<MyOtherClass> GetOtherClasses() {
    return dependency.GetOrPut(LoadData);
  }
  
  private IEnumerable<MyOtherClass> LoadData() {
    return new List<MyOtherClass> {
      new MyOtherClass()
    };
  }
}

```

Now the Moq setup

```
var mockDependency = new Mock<IDependency>()
  .Setup(m => m.GetOrPut(It.IsAny<Func<IEnumerable<MyOtherClass>>>))
  .Returns((IEnumerable<MyOtherClass> callback) => callback());
```

That's it! Now the ``LoadData`` method will get called when the mock signature is matched.
