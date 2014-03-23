---
layout: post
title: "Inheriting From RegularExpressionAttribute And Client Side Validation"
date: 2010-11-24 +1100
comments: true
categories: [dotnet, DataAnnotations, model, MVC, RegularExpressionAttribute, validation]
---


I've been working with MVC2 and DataAnnotations recently and ran into a
problem that I was unable to Google (or Bing) an answer too. So with some
creative thinking I came up with a solution.

## The Problem

We encountered some strange behaviour when we changed from using a
RegularExpressionAttribute to a custom EmailAttribute that inherited from the
former, as discussed by [Scott Guthrie](http://weblogs.asp.net/scottgu/) in
his post on [Model
Validation](http://weblogs.asp.net/scottgu/archive/2010/01/15/asp-net-mvc-2
-model-validation.aspx) (see step 4).

So you get the full picture, lets look at some code. Start off by creating a
new MVC2 web application. To this add a class called Person that resembles the
following:

```csharp
    public class Person
    {
		[Required]
		public string Firstname { get; set; }
    
		[Required]
		public string Surname { get; set; }
    
		[Required]
		public string PreferredName { get; set; }
    
		[Required]
		[RegularExpression("^[a-zA-Z0-9_\+-]+(\.[a-zA-Z0-9_\+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.([a-zA-Z]{2,4})$", ErrorMessage = "Not a valid email")]
		public string Email { get; set; }
    }
```
    

Next we add a PersonController and to that a Create method.


```csharp
    public ActionResult Create() { return View(); }
```

After some other wiring up we run it up and see something like

[![](public/assets/2010/11/before_clicking_create_thumb.png)](public/assets/2010/11/before_clicking_create.png)

Clicking the Create button will result in

[![](public/assets/2010/11/required_attribute_thumb.png)](public/assets/2010/11/required_attribute.png)

If we now enter some text into the Email field the RegularExpressionAttribute
we added will kick in and we getting the appropriate error message.

[![](public/assets/2010/11/regularexpression_attribute_thumb.png)](public/assets/2010/11/regularexpression_attribute.png)

Now, to follow the DRY principle we should move the regular expression to a
more descriptive object. So we introduce the EmailAttribute.

```csharp
     [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
     public class EmailAttribute : RegularExpressionAttribute
     {
     public EmailAttribute() : base("^[a-zA-Z0-9_\+-]+(\.[a-zA-Z0-9_\+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.([a-zA-Z]{2,4})$") { }
     }
```

And we update the Email property on our Person class.

```csharp
     [Required]
     [Email(ErrorMessage="Please enter a valid email address.")]
     public string Email { get; set; }
```

After a rebuild and a reload of the page. Clicking Create will still result in
the required message. However after entering text into the Email field we see
that no validation message is displayed. Why not?

Okay, so after some searching we find that [Phil Haacked has a
solution](http://haacked.com/archive/2009/11/19/aspnetmvc2-custom-
validation.aspx). The problem is that the client side script is no longer
being generated. In order to get this working again we need to add a custom
validator for the new attribute. So let’s add that

```csharp
    public class EmailValidator : DataAnnotationsModelValidator<EmailAttribute>
     {
     private readonly string _message;
     private readonly string _pattern;
    
    public EmailValidator(ModelMetadata metadata, ControllerContext context, EmailAttribute attribute) : base(metadata, context, attribute)
     {
     _pattern = attribute.Pattern;
     _message = attribute.ErrorMessage;
     }
    
    public override IEnumerable<ModelClientValidationRule> GetClientValidationRules()
     {
     var rule = new ModelClientValidationRule
     {
     ErrorMessage = _message,
     ValidationType = "email"
     };
    
    rule.ValidationParameters.Add("pattern", _pattern);
    
    return new[] { rule };
     }
     }
```

We then need to register with the validator.

```csharp
     protected void Application_Start()
     {
     AreaRegistration.RegisterAllAreas();
     RegisterRoutes(RouteTable.Routes);
     DataAnnotationsModelValidatorProvider.RegisterAdapter(typeof(EmailAttribute), typeof(EmailValidator));
     }
```

Now after a rebuild, clicking Create once more will result in the expected
required field message. Now if we enter text into the Email field we still
don't see our email validation message appear. Argh!

## What Next?

After digging around, removing my custom validator and reverting to the
standard RegularExpressionAttribute I found that the javascript being
generated was key to the solution. Here's a snippet of what is being generated
when using the RegularExpressionAttribute - I've taken the liberty of
formatting the code to make it more readable.

```csharp
     if (!window.mvcClientValidationMetadata) { window.mvcClientValidationMetadata = []; }
     window.mvcClientValidationMetadata.push({
     "Fields":[
     {"FieldName":"Firstname","ReplaceValidationMessageContents":true,"ValidationMessageId":"Firstname_validationMessage","ValidationRules":[{"ErrorMessage":"The Firstname field is required.","ValidationParameters":{},"ValidationType":"required"}]},
     {"FieldName":"Surname","ReplaceValidationMessageContents":true,"ValidationMessageId":"Surname_validationMessage","ValidationRules":[{"ErrorMessage":"The Surname field is required.","ValidationParameters":{},"ValidationType":"required"}]},
     {
     "FieldName":"Email",
     "ReplaceValidationMessageContents":true,
     "ValidationMessageId":"Email_validationMessage",
     "ValidationRules":[
     {
     "ErrorMessage":"Not a valid email",
     "ValidationParameters":{
     "pattern":"^[a-zA-Z0-9_\+-]+(\.[a-zA-Z0-9_\+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.([a-zA-Z]{2,4})$"
     },
     "ValidationType":"regularExpression"
     },
     {
     "ErrorMessage":"The Email field is required.",
     "ValidationParameters":{},
     "ValidationType":"required"
     }
     ]
     }
     ],
     "FormId":"form0",
     "ReplaceValidationSummary":false,
     "ValidationSummaryId":"validationSummary"
     });
```

And here's what is generated with the EmailAttribute.

```csharp
     if (!window.mvcClientValidationMetadata) { window.mvcClientValidationMetadata = []; }
     window.mvcClientValidationMetadata.push({
     "Fields":[
     {"FieldName":"Firstname","ReplaceValidationMessageContents":true,"ValidationMessageId":"Firstname_validationMessage","ValidationRules":[{"ErrorMessage":"The Firstname field is required.","ValidationParameters":{},"ValidationType":"required"}]},
     {"FieldName":"Surname","ReplaceValidationMessageContents":true,"ValidationMessageId":"Surname_validationMessage","ValidationRules":[{"ErrorMessage":"The Surname field is required.","ValidationParameters":{},"ValidationType":"required"}]},
     {
     "FieldName":"Email",
     "ReplaceValidationMessageContents":true,
     "ValidationMessageId":"Email_validationMessage",
     "ValidationRules":[
     {
     "ErrorMessage":"Not a valid email",
     "ValidationParameters":{
     "pattern":"^[a-zA-Z0-9_\+-]+(\.[a-zA-Z0-9_\+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.([a-zA-Z]{2,4})$"
     },
     "ValidationType":"email"
     },
     {
     "ErrorMessage":"The Email field is required.",
     "ValidationParameters":{},
     "ValidationType":"required"
     }
     ]
     }
     ],
     "FormId":"form0",
     "ReplaceValidationSummary":false,
     "ValidationSummaryId":"validationSummary"
     });
```

See the difference? I'll give you a hint, look at the ValidationType property
of the first ValidationRule. For the EmailAttribute it says "email", whereas
for a RegularExpressionAttribute is is "regularExpression". What happens if we
change the value in the EmailValidator?

```csharp
     if (!window.mvcClientValidationMetadata) { window.mvcClientValidationMetadata = []; }
     window.mvcClientValidationMetadata.push({
     "Fields":[
     {"FieldName":"Firstname","ReplaceValidationMessageContents":true,"ValidationMessageId":"Firstname_validationMessage","ValidationRules":[{"ErrorMessage":"The Firstname field is required.","ValidationParameters":{},"ValidationType":"required"}]},
     {"FieldName":"Surname","ReplaceValidationMessageContents":true,"ValidationMessageId":"Surname_validationMessage","ValidationRules":[{"ErrorMessage":"The Surname field is required.","ValidationParameters":{},"ValidationType":"required"}]},
     {
     "FieldName":"Email",
     "ReplaceValidationMessageContents":true,
     "ValidationMessageId":"Email_validationMessage",
     "ValidationRules":[
     {
     "ErrorMessage":"Not a valid email",
     "ValidationParameters":{
     "pattern":"^[a-zA-Z0-9_\+-]+(\.[a-zA-Z0-9_\+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.([a-zA-Z]{2,4})$"
     },
     "ValidationType":"regularExpression"
     },
     {
     "ErrorMessage":"The Email field is required.",
     "ValidationParameters":{},
     "ValidationType":"required"
     }
     ]
     }
     ],
     "FormId":"form0",
     "ReplaceValidationSummary":false,
     "ValidationSummaryId":"validationSummary"
     });
```

So after setting the EmailAttribute's ValidationType to "regularExpression"
the correct validation JavaScript is once again generated and client side
validation now works! Hopefully this saves you some time, once again if anyone
knows another way please comment.

### Edit

Here's the final version of EmailValidtor

```csharp
    public class EmailValidator : DataAnnotationsModelValidator<EmailAttribute>
     {
     private readonly string _message;
     private readonly string _pattern;
    
    public EmailValidator(ModelMetadata metadata, ControllerContext context, EmailAttribute attribute) : base(metadata, context, attribute)
     {
     _pattern = attribute.Pattern;
     _message = attribute.ErrorMessage;
     }
    
    public override IEnumerable<ModelClientValidationRule> GetClientValidationRules()
     {
     var rule = new ModelClientValidationRule
     {
     ErrorMessage = _message,
     ValidationType = "regularExpression"
     };
    
    rule.ValidationParameters.Add("pattern", _pattern);
    
    return new[] { rule };
     }
     }
```
