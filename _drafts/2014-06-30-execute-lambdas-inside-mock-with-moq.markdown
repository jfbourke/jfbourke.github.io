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

Take the following class, you could imagine that the dependency is some sort of business process that will crunch the data returned from the lambda. This is a contrived example and you could do the same thing without the lambda. The main take away is to show how to mock a dependency and still have the lambda from the calling class consumed. 

```
public class MyClass
{
  private readonly IDependency dependency;

  public MyClass(IDependency dependency) {
    this.dependency = dependency;
  }
  
  public IEnumerable<MyOtherClass> GetOtherClasses() {
    return dependency.RunSomeProcess(LoadData);
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
  .Setup(m => m.RunSomeProcess(It.IsAny<Func<IEnumerable<MyOtherClass>>>))
  .Returns((IEnumerable<MyOtherClass> callback) => callback());
```

That's it! Now the ``LoadData`` method will get called when the mock signature is matched.
