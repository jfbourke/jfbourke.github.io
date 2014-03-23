---
layout: post
title: "An NUnit wrapper for WebAssert"
date: 2010-04-18 +1100
comments: true
categories: ['dotnet', 'nunit', 'tdd', 'webassert']
---

Early in April 2010 [Damian Edwards released](http://twitter.com/DamianEdwards/status/11446393326) his [WebAssert](http://webassert.codeplex.com/) library onto [CodePlex](http://www.codeplex.com/). The library allows for writing assertion unit tests so that HTML and CSS can be validated either by submitting to the [W3C validator](http://validator.w3.org/) or to a custom validation service. The release is made up of 3 libraries; the WebAssert core, a unit test project for the core project and a wrapper around the core for use in projects that use the [MS unit testing framework](http://msdn.microsoft.com/en-us/library/ms243147(VS.80).aspx).

At work we currently use [NUnit](http://www.nunit.org/) as our unit testing framework, so the MS test wrapper would not work for us. On reviewing what the WebAssert library did I thought about writing a wrapper for NUnit and thankfully Damian made it easy. Using the source for the MS unit testing framework wrapper as a guide I built a wrapper library for NUnit. I had to make a couple of changes, first remove the methods that refer to GetAspNetServerUrl as they work off a TestContext object that as far as I’m aware doesn’t exist in NUnit, the other change needed was the type of exception thrown by the Fail method. The new exception is a NUnit AssertionException.

```csharp
private static void Fail(W3CValidityCheckResult result)
{
	var errors = result.ErrorsCount == 1 ? "error" : "errors";
	var warnings = result.WarningsCount == 1 ? "warning" : "warnings";
	
	throw new AssertionException(
		String.Format("The passed HTML is invalid: {0} {1}, {2} {3}",
		result.ErrorsCount, errors, result.WarningsCount, warnings)
	);
}
```

After a build I was then able to reference the wrapper library in a testing library for another project and write some WebAssert unit tests like these:

```csharp
using System;
using NUnit.Framework;
using WebAssertTestLibrary.NUnit;

namespace WebAssertDemoNUnitTests
{
	[TestFixture()]
	public class DemoTests
	{
		[Test()]
		public void ValidHtmlAtUrl()
		{
			WebAssert.ReturnsValidHtml("http://localhost:49417/");
		}

		[Test()]
		public void ValidHTML()
		{
			WebAssert.IsValidHtml("<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd"><html><head><title>Test HTML</title></head><body><p>lorem</p></body></html>");
		}
	}
}
```

When run with NUnit GUI all tests validated:

[![WebAssert Demo NUnit Tests](public/assets/2010/04/webassertdemonunittests_thumb.png)](public/assets/2010/04/webassertdemonunittests.png)

One limitation I found was getting enough information about what didn’t validate. Using Fiddler I found that there are no headers in the response describing what the errors or warnings are. So maybe there is a case for adding an HTML parser to the core library so that the validation response can be pulled apart and added to the exception thrown by the Fail method.

EDIT: Damian's comment below shows that future project updates will allow for the use of the SOAP API for the W3C validation service meaning that more information about errors in validation will appear in exceptions from test failures. Nice.
